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
  let _pullTimer     = null;
  let _safetyTimer   = null;

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
    // Legacy idmap stored stable local IDs (1, 2, 7, …) in one flat table shared by
    // users, projects, tasks, etc. That made assigneeId 7 remap to e.g. project id 3.
    let purged = false;
    for (const key of Object.keys(_idMap)) {
      if (!_isOfflineId(Number(key))) {
        delete _idMap[key];
        purged = true;
      }
    }
    if (purged) _saveIdMap();
    _lastPullAt = Number(localStorage.getItem(PULL_KEY) || 0);
  }

  // ── Status ───────────────────────────────────────────────────────────

  function _publish() {
    window.dispatchEvent(new CustomEvent('wt-sync-status', { detail: getStatus() }));
  }

  function getStatus() {
    const pending = _queue.filter(o => o.status === 'pending').length;
    const failed  = _queue.filter(o => o.status === 'failed').length + (_lastError ? 1 : 0);
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
    const n = Number(id);
    // Only offline temp IDs belong in the idmap. Stable cloud IDs (1, 2, 7, …) must
    // never pass through — the flat map is shared across entity types and caused
    // assignee/user FKs to be rewritten to unrelated rows (e.g. user 7 → user 3).
    if (!Number.isFinite(n) || !_isOfflineId(n)) return id;
    const m = _idMap[String(id)];
    return m != null ? m : id;
  }

  function _remapArgs(method, args) {
    let cloned;
    try { cloned = JSON.parse(JSON.stringify(args)); } catch (_) { return args; }

    const FOREIGN_KEYS = ['projectId','milestoneId','assigneeId','ownerId',
                          'uploadedBy','userId','classroomId','actorUserId',
                          'createdBy','favoriteUserId','fromUserId','toUserId'];

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
    'setUserClassrooms',
    'upsertDepartment','deleteDepartment',
    'createAttachment','deleteAttachment',
    'createNotification','markNotificationRead','markAllNotificationsRead',
    'logActivity',
    'setMasterKey','changePassword',
    'createBugReport','updateBugReport',
    'createDirectMessage','requestProjectAccess','respondProjectAccess',
    'saveGeneralWebhook','saveProjectWebhook','deleteWebhook',
    'touchLastSeen','recordLoginSession',
    'createWorkflowTemplate','updateWorkflowTemplate','deleteWorkflowTemplate',
    'addFavorite','removeFavorite',
    'createPersonalNote','updatePersonalNote','deletePersonalNote',
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

  function _isCreate(method) {
    return method.startsWith('create') || method === 'upsertDepartment' || method === 'setMasterKey'
      || method === 'requestProjectAccess';
  }

  function _serialize(v) {
    try { return JSON.parse(JSON.stringify(v)); } catch (_) { return null; }
  }

  const _ATTACHMENT_OPS = new Set(['addAttachment', 'createAttachment', 'deleteAttachment', 'updateAttachment']);

  function _enqueue(method, args, result) {
    if (!_client) return;

    // Hybrid Google Drive storage: attachments are managed by DriveStorage
    // (project_files + Edge Functions), NOT the legacy wt_attachments sync. Never
    // queue attachment ops in Drive mode — their ids are UUIDs and would fail the
    // bigint wt_attachments path ("invalid input syntax for type bigint").
    if (window.DriveStorage?.enabled?.() && _ATTACHMENT_OPS.has(method)) return;

    if (method === 'requestProjectAccess' && args[0] && typeof args[0] === 'object') {
      const data = args[0];
      const idx = _queue.findLastIndex?.(o =>
        o.method === 'requestProjectAccess' &&
        o.args?.[0]?.projectId === data.projectId &&
        o.args?.[0]?.requesterId === data.requesterId &&
        o.status === 'pending'
      );
      if (idx >= 0) {
        _queue[idx].args = _serialize([{ ...(_queue[idx].args[0] || {}), ...data }]);
        _saveQueue();
        _publish();
        if (navigator.onLine && !_syncing) _scheduleFlush(400);
        return;
      }
    }

    // Presence heartbeats / login telemetry are best-effort ONLY — never durable.
    // They fire every minute; a stale "last seen" is worthless to retry, and
    // queuing them made a single op linger forever as a phantom "pending issue"
    // in the sync diagnostics ("touchLastSeen — 1"). Fire the remote write
    // directly (fire-and-forget) and drop it from the durable queue entirely.
    if (method === 'touchLastSeen' || method === 'recordLoginSession') {
      if (navigator.onLine && typeof window.SupabaseDB?.[method] === 'function') {
        Promise.resolve(window.SupabaseDB[method](...args)).catch(() => {});
      }
      return;
    }

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

    let enqueueArgs = args;
    if (_isCreate(method) && result != null && args[0] && typeof args[0] === 'object' && !Array.isArray(args[0])) {
      enqueueArgs = [{ ...args[0], id: Number(result) }, ...args.slice(1)];
    }

    const op = {
      id:        `op_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      method,
      args:      _serialize(enqueueArgs),
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

  // Updates/deletes must hit the remote path only — LocalDB already applied
  // the change; the shadow cache often lacks rows that only exist in IndexedDB.
  const REMOTE_ONLY_OPS = new Set([
    'updateProject', 'updateTask', 'upsertDepartment', 'deleteDepartment',
  ]);

  const CREATE_ORDER = {
    createUser: 0,
    createClassroom: 10,
    createProject: 20,
    createMilestone: 30,
    createTask: 30,
    createUpdate: 35,
    createAttachment: 40,
    createNotification: 50,
    createBugReport: 50,
    createDirectMessage: 50,
    requestProjectAccess: 50,
    createWorkflowTemplate: 50,
    addFavorite: 50,
    createPersonalNote: 50,
  };

  function _opSortRank(method) {
    if (_isCreate(method) || method === 'requestProjectAccess') return CREATE_ORDER[method] ?? 25;
    if (/^update/.test(method) || method === 'upsertDepartment') return 60;
    return 70;
  }

  async function flush() {
    if (_syncing || !_client || !navigator.onLine) return;
    const pending = _queue
      .filter(o => o.status === 'pending')
      .sort((a, b) => {
        const rank = _opSortRank(a.method) - _opSortRank(b.method);
        return rank !== 0 ? rank : (a.createdAt || '').localeCompare(b.createdAt || '');
      });
    if (!pending.length) return;

    _syncing = true;
    _publish();

    for (const op of pending) {
      op.status = 'syncing';
      try {
        await _execOp(op);
        op.status = 'done';
        _lastError = '';
        if (op.method === 'setUserClassrooms' && window.RealtimeSync?.broadcastTeamSync) {
          const targetUserId = op.args?.[0];
          window.RealtimeSync.broadcastTeamSync({
            reason: 'userClassrooms',
            userId: targetUserId != null ? Number(targetUserId) : null
          }).catch(() => {});
        }
      } catch (err) {
        const msg = String(err?.message || err);
        // Optional/not-yet-migrated schema: drop the op instead of letting it
        // pile up as a permanent "issue" the user can't resolve.
        if (/does not exist|schema cache|could not find .* column|column .* of relation/i.test(msg)) {
          op.status = 'done';
          console.warn('[SyncEngine] skipping op for missing schema:', op.method, msg.slice(0, 160));
        } else if (/^(Task|Project) not found$/i.test(msg.trim()) && /^update/.test(op.method)) {
          // Stale queue entry — local row never reached the cloud or was already removed.
          op.status = 'done';
          console.warn('[SyncEngine] dropping stale update:', op.method, msg);
        } else if (/violates foreign key constraint|not found in Supabase/i.test(msg)) {
          // The op references a row that doesn't exist in the cloud (e.g. a
          // ghost local-only user or a parent create that never synced).
          // Retry once in case the parent create lands on this flush cycle,
          // then drop it — retrying forever just spams error reports.
          op.attempts++;
          if (op.attempts >= 2) {
            op.status = 'done';
            console.warn('[SyncEngine] dropping op referencing a missing row:', op.method, msg.slice(0, 160));
          } else {
            op.error = msg.slice(0, 200);
            op.status = 'pending';
          }
        } else {
          op.attempts++;
          op.error  = msg.slice(0, 200);
          op.status = op.attempts >= 3 ? 'failed' : 'pending';
          _lastError = op.error;
          if (op.status === 'failed') {
            window.dispatchEvent(new CustomEvent('wt-sync-error', {
              detail: { summary: op.method, error: op.error }
            }));
          }
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

    // Drive mode owns attachments — never push legacy attachment ops to Supabase.
    if (window.DriveStorage?.enabled?.() && _ATTACHMENT_OPS.has(op.method)) return;

    const remapped = _remapArgs(op.method, op.args || []);
    if (typeof sb[op.method] !== 'function') {
      // silently skip unknown ops (future-proofing)
      return;
    }

    if (op.method === 'createClassroom' && remapped[0]?.id) {
      try {
        const row = await window.LocalDB?.db?.classrooms?.get(Number(remapped[0].id));
        if (row?.themePalette) remapped[0] = { ...remapped[0], themePalette: row.themePalette, color: row.color };
      } catch (_) {}
    }

    const callArgs = REMOTE_ONLY_OPS.has(op.method) ? [...remapped, true] : remapped;
    const result = await sb[op.method](...callArgs);

    // After a create: record offline local→remote ID mapping and patch LocalDB
    if (_isCreate(op.method) && op.localId != null && result != null) {
      const remoteId = typeof result === 'number' ? result : result?.id;
      if (remoteId != null && String(op.localId) !== String(remoteId) && _isOfflineId(op.localId)) {
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
      createBugReport: 'bugReports', createDirectMessage: 'directMessages',
      requestProjectAccess: 'projectAccessRequests',
      createWorkflowTemplate: 'workflowTemplates', addFavorite: 'userFavorites',
      createPersonalNote: 'personalNotes',
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
      if (method === 'createClassroom') {
        await window.LocalDB?.db?.projects?.where('classroomId').equals(Number(localId))
          .modify({ classroomId: Number(remoteId) }).catch(() => {});
        await window.LocalDB?.db?.userClassrooms?.where('classroomId').equals(Number(localId))
          .modify({ classroomId: Number(remoteId) }).catch(() => {});
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

  // Cloud is source of truth for membership rows. bulkPut alone leaves revoked
  // assignments in IndexedDB (e.g. user still sees old classrooms after admin restricts access).
  async function _replaceCollection(table, rows) {
    if (!table || !Array.isArray(rows)) return;
    const valid = rows.filter(r => r?.id != null);
    try {
      await table.clear();
      if (valid.length) await table.bulkPut(valid);
    } catch (_) {}
  }

  async function _bulkPutByKey(table, rows, keyField = 'key') {
    if (!table || !Array.isArray(rows) || !rows.length) return;
    const valid = rows.filter(r => r?.[keyField] != null);
    if (!valid.length) return;
    await table.bulkPut(valid).catch(() => {});
  }

  async function _bulkPutPersonalNotes(table, rows) {
    if (!table || !Array.isArray(rows) || !rows.length) return;
    const pendingIds = new Set(
      _queue
        .filter(o => (o.method === 'updatePersonalNote' || o.method === 'createPersonalNote') && (o.status === 'pending' || o.status === 'syncing'))
        .map(o => Number(o.args?.[0]?.id || o.localId))
        .filter(n => !Number.isNaN(n) && n > 0)
    );
    for (const remote of rows) {
      if (remote?.id == null) continue;
      const id = Number(remote.id);
      if (pendingIds.has(id)) continue;
      let local = null;
      try { local = await table.get(id); } catch (_) {}
      if (local) {
        const localTs = local.updatedAt || local.createdAt || '';
        const remoteTs = remote.updatedAt || remote.createdAt || '';
        if (localTs > remoteTs) continue;
      }
      await table.put(remote).catch(() => {});
    }
  }

  async function _bulkPutBugReports(table, rows) {
    if (!table || !Array.isArray(rows) || !rows.length) return;
    const pendingIds = new Set(
      _queue
        .filter(o => o.method === 'updateBugReport' && (o.status === 'pending' || o.status === 'syncing'))
        .map(o => Number(o.args?.[0]))
        .filter(n => !Number.isNaN(n))
    );
    for (const remote of rows) {
      if (remote?.id == null) continue;
      const id = Number(remote.id);
      if (pendingIds.has(id)) continue;
      let local = null;
      try { local = await table.get(id); } catch (_) {}
      if (local) {
        const localTs = local.updatedAt || local.createdAt || '';
        const remoteTs = remote.updatedAt || remote.createdAt || '';
        if (localTs > remoteTs) continue;
      }
      await table.put(remote).catch(() => {});
    }
  }

  // Store only attachment metadata locally (no blobs). Never overwrite a row
  // this device is still trying to upload.
  async function _bulkPutAttachments(table, rows) {
    if (!table || !Array.isArray(rows)) return;
    const meta = rows.filter(r => r?.id != null).map(r => ({
      id: r.id,
      projectId: r.projectId,
      taskId: r.taskId || null,
      uploadedBy: r.uploadedBy,
      fileName: r.fileName,
      mimeType: r.mimeType,
      documentType: r.documentType || '',
      storagePath: r.storagePath,
      createdAt: r.createdAt
    }));
    if (!meta.length) return;
    let localOnlyIds = new Set();
    try {
      // Any row still holding a blob without a cloud path is a file this device
      // hasn't uploaded yet — don't overwrite it before it's pushed up.
      const localOnly = await table.filter(a => a.blob && !a.storagePath).toArray();
      localOnlyIds = new Set(localOnly.map(a => a.id));
    } catch (_) {}
    const safe = meta.filter(r => !localOnlyIds.has(r.id));
    await table.bulkPut(safe).catch(() => {});
  }

  // Upload any files that live only on this device (offline uploads + legacy
  // files from before cloud sync worked), then replace the local blob row with
  // cloud metadata so the device stops storing the file itself.
  async function _flushAttachments() {
    if (!_client || !navigator.onLine || !window.SupabaseDB?.addAttachment) return;
    const ldb = window.LocalDB?.db;
    if (!ldb?.attachments) return;
    let pending = [];
    try { pending = await ldb.attachments.filter(a => a.blob && !a.storagePath).toArray(); } catch (_) { return; }
    for (const a of pending) {
      try {
        const meta = await window.SupabaseDB.addAttachment({
          projectId: a.projectId, taskId: a.taskId || null, uploadedBy: a.uploadedBy,
          fileName: a.fileName, mimeType: a.mimeType, documentType: a.documentType || '', blob: a.blob
        });
        await ldb.attachments.delete(a.id);
        await ldb.attachments.put({
          id: meta.id, projectId: a.projectId, taskId: a.taskId || null, uploadedBy: a.uploadedBy,
          fileName: a.fileName, mimeType: a.mimeType, documentType: a.documentType || '',
          storagePath: meta.storagePath, createdAt: meta.createdAt || a.createdAt
        });
      } catch (err) {
        console.warn('[SyncEngine] attachment upload retry failed:', err);
      }
    }
  }

  async function pull() {
    if (_pullRunning || !_client || !navigator.onLine) return;
    _pullRunning = true;
    _publish();

    try {
      const sb = window.SupabaseDB;
      if (!sb) return;

      // Parallel fetch of all collections from Supabase
      const session = _getSession();
      const myId = session?.userId;

      const [
        users, projects, tasks, departments, classrooms,
        milestones, updates, notifications, accessRequests, bugReports, userClassrooms,
        attachments, workflowTemplates, favorites, personalNotes,
        directMessages, chatActivity, discordMessages, calendarEvents
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
        // Attachment metadata only — never the file blobs. In Drive mode the
        // legacy wt_attachments table is unused (files live in project_files via
        // DriveStorage); skip it so stale rows (whose Storage objects were
        // removed after migration) don't land locally and 404 on open.
        (window.DriveStorage?.enabled?.()
          ? Promise.resolve([])
          : sb._sb().from('wt_attachments').select('*').then(({ data, error }) => {
              if (error) throw error;
              return (data || []).map(r => sb._mapAttachment(r));
            })),
        sb.getWorkflowTemplates ? sb.getWorkflowTemplates() : Promise.resolve([]),
        (async () => {
          const session = _getSession();
          if (!session?.userId) return [];
          const { data, error } = await sb._sb().from('wt_user_favorites').select('*').eq('user_id', session.userId);
          if (error) throw error;
          return (data || []).map(r => ({ id: r.id, userId: r.user_id, favoriteUserId: r.favorite_user_id, createdAt: r.created_at }));
        })(),
        (async () => {
          if (!session?.userId || !sb.getPersonalNotes) return [];
          return sb.getPersonalNotes(session.userId);
        })(),
        (async () => {
          if (!myId) return [];
          const { data, error } = await sb._sb().from('wt_direct_messages').select('*')
            .or(`from_user_id.eq.${myId},to_user_id.eq.${myId}`)
            .order('created_at', { ascending: false }).limit(300);
          if (error) throw error;
          return (data || []).map(r => ({
            id: r.id,
            fromUserId: r.from_user_id,
            toUserId: r.to_user_id,
            content: r.content || '',
            createdAt: r.created_at,
            updatedAt: r.updated_at || r.created_at
          }));
        })(),
        (async () => {
          const { data, error } = await sb._sb().from('wt_activity_log').select('*')
            .order('created_at', { ascending: false }).limit(1000);
          if (error) throw error;
          return (data || []).map(r => sb._mapActivity(r));
        })(),
        (async () => {
          const { data, error } = await sb._sb().from('wt_discord_messages').select('*')
            .order('created_at', { ascending: false }).limit(300);
          if (error) throw error;
          return (data || []).map(r => ({
            id: r.id,
            channelId: r.channel_id,
            discordMessageId: r.discord_message_id,
            discordAuthorId: r.author_id,
            discordAuthorName: r.author_username,
            discordDisplayName: r.author_display_name || r.author_username,
            discordAvatar: r.author_avatar || '',
            content: r.content || '',
            createdAt: r.created_at
          }));
        })(),
        (async () => {
          const now = new Date();
          const rangeStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 3, 0, 23, 59, 59).toISOString();
          const { data, error } = await sb._sb().from('wt_calendar_events').select('*')
            .gte('starts_at', rangeStart).lte('starts_at', rangeEnd)
            .order('starts_at', { ascending: true });
          if (error) throw error;
          return (data || []).map(r => ({
            id: r.id,
            title: r.title || '',
            description: r.description || '',
            startsAt: r.starts_at,
            endsAt: r.ends_at,
            allDay: r.all_day || false,
            createdBy: r.created_by,
            visibility: r.visibility || 'team',
            classroomId: r.classroom_id,
            relatedProjectId: r.related_project_id,
            relatedTaskId: r.related_task_id,
            createdAt: r.created_at
          }));
        })(),
      ]);

      const ldb = window.LocalDB?.db;
      if (!ldb) return;

      if (users.status         === 'fulfilled') {
        await _bulkPut(ldb.users, users.value);
        await _reconcileUsers(ldb, users.value);
      }
      if (projects.status      === 'fulfilled') await _bulkPut(ldb.projects,              _normalizeProjects(projects.value));
      if (tasks.status         === 'fulfilled') await _bulkPut(ldb.tasks,                 _normalizeTasks(tasks.value));
      if (departments.status   === 'fulfilled') {
        await _bulkPutByKey(ldb.departments, departments.value, 'key');
        if (window.LocalDB?.ensureDefaultDepartments) await window.LocalDB.ensureDefaultDepartments();
      }
      if (classrooms.status    === 'fulfilled') await _bulkPut(ldb.classrooms,            classrooms.value);
      if (milestones.status    === 'fulfilled') await _bulkPut(ldb.milestones,            milestones.value);
      if (updates.status       === 'fulfilled') await _bulkPut(ldb.updates,               updates.value);
      if (notifications.status === 'fulfilled') await _bulkPut(ldb.notifications,         notifications.value);
      if (accessRequests.status=== 'fulfilled') await _bulkPut(ldb.projectAccessRequests, accessRequests.value);
      if (bugReports.status    === 'fulfilled') await _bulkPutBugReports(ldb.bugReports,  bugReports.value);
      if (userClassrooms.status=== 'fulfilled') await _replaceCollection(ldb.userClassrooms, userClassrooms.value || []);
      if (attachments.status   === 'fulfilled') await _bulkPutAttachments(ldb.attachments, attachments.value);
      if (workflowTemplates.status === 'fulfilled' && ldb.workflowTemplates) await _bulkPut(ldb.workflowTemplates, _normalizeTemplates(workflowTemplates.value));
      if (favorites.status     === 'fulfilled' && ldb.userFavorites) await _bulkPut(ldb.userFavorites, favorites.value);
      if (personalNotes.status === 'fulfilled' && ldb.personalNotes) await _bulkPutPersonalNotes(ldb.personalNotes, personalNotes.value);
      if (directMessages.status === 'fulfilled' && ldb.directMessages) await _bulkPut(ldb.directMessages, directMessages.value);
      if (chatActivity.status === 'fulfilled' && ldb.activityLog) await _bulkPut(ldb.activityLog, chatActivity.value);
      if (discordMessages.status === 'fulfilled' && ldb.discordMessages) await _bulkPut(ldb.discordMessages, discordMessages.value);
      if (calendarEvents.status === 'fulfilled' && ldb.calendarEvents) await _bulkPut(ldb.calendarEvents, calendarEvents.value);

      const criticalFailures = [
        ['projects', projects],
        ['tasks', tasks],
        ['classrooms', classrooms],
        ['user classrooms', userClassrooms],
      ].filter(([, result]) => result.status === 'rejected');
      if (criticalFailures.length) {
        const first = criticalFailures[0][1].reason;
        const detail = first?.message || first?.details || String(first || 'unknown error');
        _lastError = `Cloud schema sync failed for ${criticalFailures.map(([name]) => name).join(', ')}: ${detail}`;
        window.dispatchEvent(new CustomEvent('wt-sync-error', {
          detail: { summary: 'schema pull', error: _lastError }
        }));
      } else {
        _lastError = '';
      }

      _lastPullAt = Date.now();
      localStorage.setItem(PULL_KEY, String(_lastPullAt));

      // Push up any files that were added while offline.
      await _flushAttachments();

      // Notify the app to refresh the current view
      window.dispatchEvent(new CustomEvent('wt-sync-pulled'));
    } catch (err) {
      console.error('[SyncEngine] pull error:', err);
    } finally {
      _pullRunning = false;
      _publish();
    }
  }

  // Remove local-only "ghost" users that don't exist in the cloud. They cause
  // FK violations whenever notifications or DMs target them. Keep users with a
  // pending createUser op (offline-created, not yet pushed) and the active
  // session's own user.
  async function _reconcileUsers(ldb, remoteUsers) {
    try {
      if (!Array.isArray(remoteUsers) || !remoteUsers.length || !ldb?.users) return;
      const remoteIds = new Set(remoteUsers.map(u => Number(u.id)));
      const pendingIds = new Set(_queue
        .filter(o => o.method === 'createUser' && o.status !== 'done')
        .map(o => Number(o.args?.[0]?.id ?? o.localId))
        .filter(n => Number.isFinite(n)));
      const myId = Number(_getSession()?.userId || 0);
      const locals = await ldb.users.toArray();
      const ghosts = locals.filter(u =>
        !remoteIds.has(Number(u.id)) && !pendingIds.has(Number(u.id)) && Number(u.id) !== myId);
      if (!ghosts.length) return;
      for (const g of ghosts) {
        const gid = Number(g.id);
        await ldb.users.delete(gid).catch(() => {});
        await ldb.notifications?.where('userId').equals(gid).delete().catch(() => {});
        await ldb.userClassrooms?.where('userId').equals(gid).delete().catch(() => {});
      }
      // Drop any queued ops that target the removed users so they can't FK-fail.
      const ghostIds = new Set(ghosts.map(g => Number(g.id)));
      _queue = _queue.filter(o => {
        const a = o.args?.[0];
        const targets = [a?.userId, a?.toUserId, a?.assigneeId];
        return !targets.some(t => t != null && ghostIds.has(Number(t)));
      });
      _saveQueue();
      console.warn('[SyncEngine] removed ghost local users:', ghosts.map(g => `${g.id} (${g.username || ''})`).join(', '));
    } catch (err) {
      console.warn('[SyncEngine] user reconcile skipped:', err);
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
      sortOrder:       t.sortOrder       ?? 0,
      createdAt:       t.createdAt       || new Date().toISOString(),
      updatedAt:       t.updatedAt       || new Date().toISOString(),
    }));
  }

  function _normalizeTemplates(rows = []) {
    return rows.map(t => ({
      id:          t.id,
      name:        t.name        || 'Untitled template',
      description: t.description || '',
      steps:       Array.isArray(t.steps) ? t.steps : [],
      createdBy:   t.createdBy   ?? null,
      createdAt:   t.createdAt   || new Date().toISOString(),
      updatedAt:   t.updatedAt   || new Date().toISOString(),
    }));
  }

  function _getSession() {
    try {
      if (typeof window.WT_getActiveSession === 'function') return window.WT_getActiveSession();
      const raw = sessionStorage.getItem('wt-session');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  // ── Network events ───────────────────────────────────────────────────

  function _startBackgroundPull() {
    clearInterval(_pullTimer);
    clearInterval(_safetyTimer);
    _pullTimer = setInterval(() => {
      if (!_client || !navigator.onLine || _pullRunning) return;
      const rtConnected = window.RealtimeSync?.isConnected?.();
      if (rtConnected) return;
      pull().catch(() => {});
    }, 60000);
    _safetyTimer = setInterval(() => {
      if (!_client || !navigator.onLine || _pullRunning) return;
      pull().catch(() => {});
    }, 300000);
  }

  function getLastPullAt() { return _lastPullAt; }

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
    // In Drive mode, drop any legacy attachment ops left in the queue (e.g. a
    // deleteAttachment with a UUID id that keeps failing the bigint wt_attachments
    // path). DriveStorage already handled them.
    if (window.DriveStorage?.enabled?.() && Array.isArray(_queue)) {
      const before = _queue.length;
      _queue = _queue.filter(op => !_ATTACHMENT_OPS.has(op?.method));
      if (_queue.length !== before) _saveQueue();
    }
    // Drop any presence heartbeats that older builds queued durably — they're
    // best-effort now and only lingered as phantom "pending" diagnostics rows.
    if (Array.isArray(_queue)) {
      const before = _queue.length;
      _queue = _queue.filter(op => op?.method !== 'touchLastSeen' && op?.method !== 'recordLoginSession');
      if (_queue.length !== before) _saveQueue();
    }
    _loadIdMap();

    // Create the shared Supabase client and inject into SupabaseDB
    try {
      // Explicit auth persistence so the Drive-storage session survives app
      // restarts and auto-refreshes (otherwise files lose authorization after the
      // access token lapses and the user is told to "sign out and back in").
      _client = window.supabase.createClient(url, anonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
      });
      window.SupabaseDB._client = _client;
      // SupabaseDB caches fetched rows in its internal shadow state. In the
      // offline-first architecture SupabaseDB.init()/_initLocalSync() is never
      // called, so we must initialize that shadow state here — otherwise every
      // getProjects/getTasks/getUsers/getDepartments call throws on a null
      // _shadowState and the pull silently drops projects, tasks, etc.
      if (typeof window.SupabaseDB._loadShadowState === 'function' && !window.SupabaseDB._shadowState) {
        window.SupabaseDB._loadShadowState();
      }
      if (typeof window.SupabaseDB._loadSyncQueue === 'function' && !Array.isArray(window.SupabaseDB._syncQueue)) {
        window.SupabaseDB._loadSyncQueue();
      }
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

    _startBackgroundPull();
    _publish();
    return true;
  }

  function getClient() { return _client; }

  // ── Queue inspection / management (for diagnostics UI) ───────────────

  function _opSummary(op) {
    const a = op.args || [];
    const first = a[0];
    const data = a.find(x => x && typeof x === 'object' && !Array.isArray(x));
    const name = data?.name || data?.title || data?.message || (typeof first === 'object' ? '' : first);
    return name ? `${op.method} — ${String(name).slice(0, 80)}` : op.method;
  }

  function getQueueDetails() {
    return _queue
      .filter(o => o.status !== 'done' && o.method !== 'touchLastSeen' && o.method !== 'recordLoginSession')
      .map(o => ({
        type: o.method,
        status: o.status,
        attempts: o.attempts || 0,
        summary: _opSummary(o),
        lastError: o.error || '',
        nextRetryLabel: '',
        payloadJson: (() => { try { return JSON.stringify(o.args, null, 2); } catch (_) { return ''; } })(),
      }));
  }

  function clearFailed() {
    const before = _queue.length;
    _queue = _queue.filter(o => o.status !== 'failed');
    const removed = before - _queue.length;
    _lastError = '';
    _saveQueue();
    _publish();
    return removed;
  }

  async function retry() {
    let reset = 0;
    for (const op of _queue) {
      if (op.status === 'failed') { op.status = 'pending'; op.attempts = 0; op.error = null; reset++; }
    }
    _lastError = '';
    _saveQueue();
    _publish();
    await flush();
    return reset;
  }

  return { init, pull, flush, getStatus, getQueueDetails, clearFailed, retry, getClient, getLastPullAt };
})();

window.SyncEngine = SyncEngine;
