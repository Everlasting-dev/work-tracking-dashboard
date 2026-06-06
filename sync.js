/* sync.js — WorkTracker offline-first sync engine v1.0
 *
 * LocalDB (IndexedDB/Dexie via db.js) is ALWAYS the primary store.
 * Supabase is the sync target — reads always hit LocalDB.
 * Writes queue to Supabase and flush when online.
 */

const SyncEngine = (() => {
  const QUEUE_KEY   = 'wt-sync-queue-v2';
  const IDMAP_KEY   = 'wt-sync-idmap-v1';
  const PULL_KEY    = 'wt-sync-pull-at';
  const OFFLINE_BASE = 9_000_000_000;

  let _client        = null;
  let _queue         = [];
  let _idMap         = {};
  let _syncing       = false;
  let _pullRunning   = false;
  let _flushTimer    = null;
  let _initDone      = false;
  let _lastError     = '';
  let _lastPullAt    = 0;

  // ── Persistence ─────────────────────────────────────────────────────

  function _saveQueue() {
    try { localStorage.setItem(QUEUE_KEY, JSON.stringify(_queue)); } catch (_) {}
  }

  function _loadQueue() {
    try {
      const r = localStorage.getItem(QUEUE_KEY);
      _queue = r ? JSON.parse(r) : [];
      if (!Array.isArray(_queue)) _queue = [];
    } catch (_) { _queue = []; }
  }

  function _saveIdMap() {
    try { localStorage.setItem(IDMAP_KEY, JSON.stringify(_idMap)); } catch (_) {}
  }

  function _loadIdMap() {
    try {
      const r = localStorage.getItem(IDMAP_KEY);
      _idMap = (r ? JSON.parse(r) : {}) || {};
    } catch (_) { _idMap = {}; }
    _lastPullAt = Number(localStorage.getItem(PULL_KEY) || 0);
  }

  // ── Status ───────────────────────────────────────────────────────────

  function _publish() {
    window.dispatchEvent(new CustomEvent('wt-sync-status', { detail: getStatus() }));
  }

  function getStatus() {
    const pending = _queue.filter(o => o.status === 'pending').length;
    const failed  = _queue.filter(o => o.status === 'failed').length;
    return {
      enabled: _initDone,
      pending,
      failed,
      syncing:   _syncing,
      lastError: _lastError,
      lastPullAt: _lastPullAt,
    };
  }

  // ── ID helpers ───────────────────────────────────────────────────────

  function _offlineId() {
    return OFFLINE_BASE + (Date.now() % 1_000_000) * 1000 + Math.floor(Math.random() * 1000);
  }

  function _isOfflineId(id) { return Number(id) >= OFFLINE_BASE; }

  function _remap(id) {
    if (id == null) return id;
    const m = _idMap[String(id)];
    return m != null ? m : id;
  }

  function _remapArgs(method, args) {
    let cloned;
    try { cloned = JSON.parse(JSON.stringify(args)); } catch (_) { return args; }

    const FOREIGN_KEYS = ['projectId','milestoneId','assigneeId','ownerId',
                          'uploadedBy','userId','classroomId','actorUserId'];

    // First positional arg is often a bare ID for update/delete
    if (/^(update|delete)/.test(method) &&
        (typeof cloned[0] === 'number' || typeof cloned[0] === 'string')) {
      cloned[0] = _remap(cloned[0]);
    }

    // Remap foreign keys inside the data object (any positional slot)
    for (let i = 0; i < cloned.length; i++) {
      const a = cloned[i];
      if (a && typeof a === 'object' && !Array.isArray(a)) {
        for (const k of FOREIGN_KEYS) {
          if (a[k] != null) a[k] = _remap(a[k]);
        }
      }
    }
    return cloned;
  }

  // ── LocalDB write interception ───────────────────────────────────────

  const WRITE_OPS = [
    'createProject','updateProject','deleteProject',
    'createTask','updateTask','deleteTask',
    'createMilestone','updateMilestone','deleteMilestone',
    'createUpdate','deleteUpdate',
    'createUser','updateUser','deleteUser',
    'createClassroom','updateClassroom','deleteClassroom',
    'addUserToClassroom','removeUserFromClassroom',
    'upsertDepartment','deleteDepartment',
    'createAttachment','deleteAttachment',
    'createNotification','markNotificationRead','markAllNotificationsRead',
    'logActivity',
    'setMasterKey','changePassword',
    'createAccessRequest','updateAccessRequest',
    'createBugReport','updateBugReport',
    'sendDirectMessage',
    'saveGeneralWebhook','saveProjectWebhook','deleteWebhook',
    'touchLastSeen','recordLoginSession',
  ];

  function _wrapLocalDB() {
    for (const method of WRITE_OPS) {
      if (typeof window.LocalDB[method] !== 'function') continue;
      const orig = window.LocalDB[method].bind(window.LocalDB);
      window.LocalDB[method] = async function (...args) {
        const result = await orig(...args);
        _enqueue(method, args, result);
        return result;
      };
    }
  }

  function _isCreate(method) { return method.startsWith('create') || method === 'upsertDepartment' || method === 'setMasterKey'; }

  function _serialize(v) {
    try { return JSON.parse(JSON.stringify(v)); } catch (_) { return null; }
  }

  function _enqueue(method, args, result) {
    if (!_client) return;

    // Deduplicate: collapse rapid update+update for same entity
    if (/^update/.test(method) && typeof args[0] === 'number') {
      const idx = _queue.findLastIndex?.(o => o.method === method && o.args?.[0] === args[0] && o.status === 'pending');
      if (idx >= 0) {
        // Merge changes into existing op instead of adding a new one
        try {
          const merged = { ...(_queue[idx].args?.[1] || {}), ...(args[1] || {}) };
          _queue[idx].args = _serialize([args[0], merged, ...args.slice(2)]);
          _saveQueue();
          _publish();
          if (navigator.onLine && !_syncing) _scheduleFlush(400);
          return;
        } catch (_) {}
      }
    }

    const op = {
      id:        `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      method,
      args:      _serialize(args),
      localId:   _isCreate(method) ? (result ?? null) : null,
      status:    'pending',
      attempts:  0,
      error:     null,
      createdAt: new Date().toISOString(),
    };
    _queue.push(op);
    _saveQueue();
    _publish();
    if (navigator.onLine && !_syncing) _scheduleFlush(400);
  }

  // ── Flush (push to Supabase) ─────────────────────────────────────────

  function _scheduleFlush(ms) {
    clearTimeout(_flushTimer);
    _flushTimer = setTimeout(flush, ms);
  }

  async function flush() {
    if (_syncing || !_client || !navigator.onLine) return;
    const pending = _queue.filter(o => o.status === 'pending');
    if (!pending.length) return;

    _syncing = true;
    _publish();

    for (const op of pending) {
      op.status = 'syncing';
      try {
        await _execOp(op);
        op.status = 'done';
        _lastError = '';
      } catch (err) {
        op.attempts++;
        op.error  = String(err?.message || err).slice(0, 200);
        op.status = op.attempts >= 3 ? 'failed' : 'pending';
        _lastError = op.error;
        if (op.status === 'failed') {
          window.dispatchEvent(new CustomEvent('wt-sync-error', {
            detail: { summary: op.method, error: op.error }
          }));
        }
      }
      _publish();
    }

    _queue = _queue.filter(o => o.status !== 'done');
    _saveQueue();
    _syncing = false;
    _publish();
  }

  async function _execOp(op) {
    const sb = window.SupabaseDB;
    if (!sb?._client) throw new Error('Supabase client not ready');

    const remapped = _remapArgs(op.method, op.args || []);
    if (typeof sb[op.method] !== 'function') {
      // silently skip unknown ops (future-proofing)
      return;
    }

    const result = await sb[op.method](...remapped);

    // After a create: record local→remote ID mapping and patch LocalDB
    if (_isCreate(op.method) && op.localId != null && result != null) {
      const remoteId = typeof result === 'number' ? result : result?.id;
      if (remoteId != null && String(op.localId) !== String(remoteId)) {
        _idMap[String(op.localId)] = remoteId;
        _saveIdMap();
        await _patchLocalId(op.method, op.localId, remoteId);
      }
    }
  }

  async function _patchLocalId(method, localId, remoteId) {
    const TABLE_MAP = {
      createProject: 'projects', createTask: 'tasks',
      createMilestone: 'milestones', createUpdate: 'updates',
      createUser: 'users', createClassroom: 'classrooms',
      createAttachment: 'attachments', createNotification: 'notifications',
      createBugReport: 'bugReports', sendDirectMessage: 'directMessages',
    };
    const table = TABLE_MAP[method];
    if (!table) return;
    try {
      const t = window.LocalDB?.db?.[table];
      if (!t) return;
      const rec = await t.get(Number(localId));
      if (!rec) return;
      await t.delete(Number(localId));
      await t.put({ ...rec, id: Number(remoteId) });

      // Also fix foreign key references for projects
      if (method === 'createProject') {
        await window.LocalDB?.db?.tasks?.where('projectId').equals(Number(localId))
          .modify({ projectId: Number(remoteId) }).catch(() => {});
        await window.LocalDB?.db?.milestones?.where('projectId').equals(Number(localId))
          .modify({ projectId: Number(remoteId) }).catch(() => {});
        await window.LocalDB?.db?.updates?.where('projectId').equals(Number(localId))
          .modify({ projectId: Number(remoteId) }).catch(() => {});
        await window.LocalDB?.db?.attachments?.where('projectId').equals(Number(localId))
          .modify({ projectId: Number(remoteId) }).catch(() => {});
      }
    } catch (_) {}
  }

  // ── Pull (Supabase → LocalDB) ────────────────────────────────────────

  async function _bulkPut(table, rows) {
    if (!table || !Array.isArray(rows) || !rows.length) return;
    const valid = rows.filter(r => r?.id != null);
    if (!valid.length) return;
    await table.bulkPut(valid).catch(() => {});
  }

  async function pull() {
    if (_pullRunning || !_client || !navigator.onLine) return;
    _pullRunning = true;
    _publish();

    try {
      const sb = window.SupabaseDB;
      if (!sb) return;

      // Parallel fetch of all collections from Supabase
      const [
        users, projects, tasks, departments, classrooms,
        milestones, updates, notifications, accessRequests, bugReports, userClassrooms
      ] = await Promise.allSettled([
        sb.getUsers(),
        sb.getProjects(),
        sb.getTasks(),
        sb.getDepartments(),
        sb.getClassrooms ? sb.getClassrooms() : Promise.resolve([]),
        sb._sb().from('wt_milestones').select('*').then(({ data, error }) => {
          if (error) throw error;
          return (data || []).map(r => sb._mapMilestone(r));
        }),
        sb._sb().from('wt_updates').select('*').order('created_at', { ascending: false }).limit(2000).then(({ data, error }) => {
          if (error) throw error;
          return (data || []).map(r => sb._mapUpdate(r));
        }),
        (async () => {
          const session = _getSession();
          if (!session?.userId) return [];
          const { data, error } = await sb._sb().from('wt_notifications').select('*')
            .eq('user_id', session.userId).order('created_at', { ascending: false }).limit(200);
          if (error) throw error;
          return (data || []).map(r => sb._mapNotification(r));
        })(),
        sb.getProjectAccessRequests ? sb.getProjectAccessRequests() : Promise.resolve([]),
        sb.getBugReports ? sb.getBugReports({ limit: 500 }) : Promise.resolve([]),
        sb._sb().from('wt_user_classrooms').select('*').then(({ data, error }) => {
          if (error) throw error;
          return (data || []).map(r => ({ id: r.id, userId: r.user_id, classroomId: r.classroom_id, createdAt: r.created_at }));
        }),
      ]);

      const ldb = window.LocalDB?.db;
      if (!ldb) return;

      if (users.status         === 'fulfilled') await _bulkPut(ldb.users,                 users.value);
      if (projects.status      === 'fulfilled') await _bulkPut(ldb.projects,              _normalizeProjects(projects.value));
      if (tasks.status         === 'fulfilled') await _bulkPut(ldb.tasks,                 _normalizeTasks(tasks.value));
      if (departments.status   === 'fulfilled') await _bulkPut(ldb.departments,           departments.value);
      if (classrooms.status    === 'fulfilled') await _bulkPut(ldb.classrooms,            classrooms.value);
      if (milestones.status    === 'fulfilled') await _bulkPut(ldb.milestones,            milestones.value);
      if (updates.status       === 'fulfilled') await _bulkPut(ldb.updates,               updates.value);
      if (notifications.status === 'fulfilled') await _bulkPut(ldb.notifications,         notifications.value);
      if (accessRequests.status=== 'fulfilled') await _bulkPut(ldb.projectAccessRequests, accessRequests.value);
      if (bugReports.status    === 'fulfilled') await _bulkPut(ldb.bugReports,            bugReports.value);
      if (userClassrooms.status=== 'fulfilled') await _bulkPut(ldb.userClassrooms,        userClassrooms.value);

      _lastPullAt = Date.now();
      localStorage.setItem(PULL_KEY, String(_lastPullAt));

      // Notify the app to refresh the current view
      window.dispatchEvent(new CustomEvent('wt-sync-pulled'));
    } catch (err) {
      console.error('[SyncEngine] pull error:', err);
    } finally {
      _pullRunning = false;
      _publish();
    }
  }

  function _normalizeProjects(rows = []) {
    return rows.map(p => ({
      id:              p.id,
      name:            p.name            || '',
      notes:           p.notes           || '',
      type:            p.type            || 'project',
      status:          p.status          || 'active',
      priority:        p.priority        || 'medium',
      ownerId:         p.ownerId,
      classroomId:     p.classroomId     || null,
      department:      p.department      || '',
      workflowTemplate:p.workflowTemplate|| '',
      editorIds:       p.editorIds       || [],
      hiddenFromIds:   p.hiddenFromIds   || [],
      completedAt:     p.completedAt     || null,
      isOngoing:       p.isOngoing       || false,
      cadence:         p.cadence         || '',
      createdAt:       p.createdAt       || new Date().toISOString(),
      updatedAt:       p.updatedAt       || new Date().toISOString(),
    }));
  }

  function _normalizeTasks(rows = []) {
    return rows.map(t => ({
      id:              t.id,
      projectId:       t.projectId,
      milestoneId:     t.milestoneId     || null,
      assigneeId:      t.assigneeId      || null,
      title:           t.title           || '',
      workflowStepKey: t.workflowStepKey || '',
      dueDate:         t.dueDate         || '',
      status:          t.status          || 'todo',
      priority:        t.priority        || 'medium',
      notes:           t.notes           || '',
      customFields:    t.customFields    || [],
      createdAt:       t.createdAt       || new Date().toISOString(),
      updatedAt:       t.updatedAt       || new Date().toISOString(),
    }));
  }

  function _getSession() {
    try {
      const raw = sessionStorage.getItem('wt-session') || localStorage.getItem('wt-trusted-session-v1');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  // ── Network events ───────────────────────────────────────────────────

  function _onOnline() {
    _publish();
    pull().then(() => flush());
  }

  function _onOffline() {
    _publish();
  }

  // ── Init ─────────────────────────────────────────────────────────────

  async function init(url, anonKey) {
    if (!window.supabase?.createClient) return;
    if (!window.SupabaseDB) return;

    _loadQueue();
    _loadIdMap();

    // Create the shared Supabase client and inject into SupabaseDB
    try {
      _client = window.supabase.createClient(url, anonKey);
      window.SupabaseDB._client = _client;
    } catch (err) {
      console.error('[SyncEngine] init error:', err);
      return;
    }

    _initDone = true;
    _wrapLocalDB();

    window.addEventListener('online',  _onOnline);
    window.addEventListener('offline', _onOffline);

    // Initial pull + flush. Callers may choose to await init() before deciding
    // that a cloud-backed local cache is truly empty.
    if (navigator.onLine) {
      await pull();
      await flush();
    }

    _publish();
    return true;
  }

  return { init, pull, flush, getStatus };
})();

window.SyncEngine = SyncEngine;
