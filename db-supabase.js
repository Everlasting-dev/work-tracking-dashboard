/* Supabase backend — mirrors LocalDB API (see db.js) */

const SupabaseDB = {
  _client: null,
  BUCKET: 'project-files',
  _syncQueueKey: 'wt-supabase-sync-queue-v1',
  _shadowKey: 'wt-supabase-shadow-v1',
  _shadowTtlMs: 45000,
  _syncQueue: [],
  _shadowState: null,
  _syncFlushPromise: null,
  _syncFlushTimer: null,
  _syncHooksBound: false,
  // Session-level cache: local/stale user ID → canonical Supabase ID.
  // Prevents "user not found" errors after _patchLocalUserId deletes the stale Dexie row
  // on the first successful resolve (subsequent resolves would find nothing in Dexie).
  _resolvedUserIds: new Map(),

  async init(url, anonKey) {
    if (!window.supabase?.createClient) throw new Error('Supabase SDK not loaded');
    this._client = window.supabase.createClient(url, anonKey);
    if (this._isOffline()) {
      this._initLocalSync();
      return;
    }
    const required = ['wt_users', 'wt_projects', 'wt_tasks', 'wt_settings'];
    for (const table of required) {
      const { error } = await this._client.from(table).select('*', { count: 'exact', head: true });
      if (error) {
        const code = error.code || '';
        const msg = (error.message || '').toLowerCase();
        const details = (error.details || '').toLowerCase();
        const missing =
          code === 'PGRST205' ||
          msg.includes('does not exist') ||
          msg.includes('schema cache') ||
          msg.includes('could not find') ||
          details.includes('does not exist');
        if (missing) {
          throw new Error(
            `Supabase table "${table}" is missing. Open Supabase → SQL Editor → run supabase/schema.sql, then hard-reload the app.`
          );
        }
        throw error;
      }
    }
    this._initLocalSync();
  },

  _sb() { return this._client; },

  _isOffline() {
    return typeof navigator !== 'undefined' && navigator.onLine === false;
  },

  _isNetworkError(error) {
    const msg = `${error?.message || ''} ${error?.details || ''} ${error?.name || ''}`.toLowerCase();
    return this._isOffline() || msg.includes('failed to fetch') || msg.includes('network') || msg.includes('fetch');
  },

  _offlineId() {
    return Date.now() * 1000 + Math.floor(Math.random() * 1000);
  },

  _trustedSessionUser(id = null) {
    try {
      let saved = null;
      const rawSession = sessionStorage.getItem('wt-session');
      if (rawSession) saved = JSON.parse(rawSession);
      else if (typeof window.WT_getTrustedSession === 'function') saved = window.WT_getTrustedSession();
      if (!saved?.userId || (id != null && Number(saved.userId) !== Number(id))) return null;
      return {
        id: saved.userId,
        username: saved.username,
        displayName: saved.displayName || saved.username,
        email: '',
        passwordHash: '',
        salt: '',
        role: saved.role,
        createdAt: '',
        department: saved.department || '',
        discordId: '',
        color: saved.color || '',
        bio: saved.bio || '',
        avatarBase64: saved.avatarBase64 || '',
        lastSeenAt: null,
        lastSeenIp: null
      };
    } catch (_) {
      return null;
    }
  },

  async _nextTableId(table) {
    const { data, error } = await this._sb().from(table).select('id').order('id', { ascending: false }).limit(1);
    if (error) throw error;
    return (data?.[0]?.id ?? 0) + 1;
  },

  async _resetIdSequences() {
    try {
      const { error } = await this._sb().rpc('wt_reset_id_sequences');
      if (!error) return;
    } catch (_) { /* RPC optional until schema is updated */ }
  },

  _isMissingColumn(error) {
    const msg = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
    return msg.includes('pgrst204') || msg.includes('schema cache') || msg.includes('column') || msg.includes('could not find');
  },

  _isMissingTable(error) {
    const msg = `${error?.code || ''} ${error?.message || ''} ${error?.details || ''}`.toLowerCase();
    return msg.includes('pgrst205') || msg.includes('relation') || msg.includes('does not exist') || msg.includes('could not find the table');
  },

  _clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  },

  _emptyShadowState() {
    return {
      collections: { projects: {}, tasks: {}, departments: {}, users: {}, updates: {} },
      at: { projects: 0, tasks: 0, departments: 0, users: 0, updates: 0 },
      complete: { projects: false, tasks: false, departments: false, users: false, updates: false }
    };
  },

  _loadShadowState() {
    this._shadowState = this._emptyShadowState();
    try {
      const raw = localStorage.getItem(this._shadowKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      this._shadowState.collections = {
        projects: parsed?.collections?.projects || {},
        tasks: parsed?.collections?.tasks || {},
        departments: parsed?.collections?.departments || {},
        users: parsed?.collections?.users || {},
        updates: parsed?.collections?.updates || {}
      };
      this._shadowState.at = {
        projects: parsed?.at?.projects || 0,
        tasks: parsed?.at?.tasks || 0,
        departments: parsed?.at?.departments || 0,
        users: parsed?.at?.users || 0,
        updates: parsed?.at?.updates || 0
      };
      this._shadowState.complete = {
        projects: !!parsed?.complete?.projects,
        tasks: !!parsed?.complete?.tasks,
        departments: !!parsed?.complete?.departments,
        users: !!parsed?.complete?.users,
        updates: !!parsed?.complete?.updates
      };
    } catch (_) {
      this._shadowState = this._emptyShadowState();
    }
  },

  _persistShadowState() {
    if (!this._shadowState) return;
    try { localStorage.setItem(this._shadowKey, JSON.stringify(this._shadowState)); } catch (_) {}
  },

  _loadSyncQueue() {
    this._syncQueue = [];
    try {
      const raw = localStorage.getItem(this._syncQueueKey);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) this._syncQueue = parsed;
    } catch (_) {
      this._syncQueue = [];
    }
  },

  _persistSyncQueue() {
    try { localStorage.setItem(this._syncQueueKey, JSON.stringify(this._syncQueue || [])); } catch (_) {}
    this._publishSyncStatus();
  },

  _initLocalSync() {
    if (!this._shadowState) this._loadShadowState();
    if (!Array.isArray(this._syncQueue)) this._loadSyncQueue();
    for (const name of ['projects', 'tasks', 'departments', 'users', 'updates']) this._reapplyPendingToShadow(name);
    this._persistShadowState();
    if (!this._syncHooksBound && typeof window !== 'undefined') {
      window.addEventListener('online', () => this._scheduleSyncFlush(150));
      window.addEventListener('focus', () => this._scheduleSyncFlush(150));
      this._syncHooksBound = true;
    }
    this._publishSyncStatus();
    if (this._syncQueue.length) this._scheduleSyncFlush(200);
  },

  _shadowRows(name) {
    return Object.values(this._shadowState?.collections?.[name] || {}).map(row => this._clone(row));
  },

  _shadowGet(name, key) {
    const row = this._shadowState?.collections?.[name]?.[String(key)];
    return row ? this._clone(row) : null;
  },

  _shadowFresh(name) {
    const at = this._shadowState?.at?.[name] || 0;
    return Date.now() - at < this._shadowTtlMs;
  },

  _shadowComplete(name) {
    return !!this._shadowState?.complete?.[name];
  },

  _shadowSetCollection(name, rows, keyField = 'id') {
    if (!this._shadowState) this._loadShadowState();
    const next = {};
    for (const row of rows || []) {
      if (row?.[keyField] == null) continue;
      next[String(row[keyField])] = this._clone(row);
    }
    this._shadowState.collections[name] = next;
    this._shadowState.at[name] = Date.now();
    this._shadowState.complete[name] = true;
    this._reapplyPendingToShadow(name);
    this._persistShadowState();
  },

  _shadowUpsert(name, row, keyField = 'id') {
    if (!this._shadowState) this._loadShadowState();
    if (!row || row[keyField] == null) return null;
    this._shadowState.collections[name][String(row[keyField])] = this._clone(row);
    this._shadowState.at[name] = Date.now();
    this._persistShadowState();
    return this._clone(row);
  },

  _shadowDelete(name, key) {
    if (!this._shadowState) this._loadShadowState();
    delete this._shadowState.collections[name][String(key)];
    this._shadowState.at[name] = Date.now();
    this._persistShadowState();
  },

  _touchShadowProject(projectId, updatedAt = null) {
    const row = this._shadowGet('projects', projectId);
    if (!row) return;
    row.updatedAt = updatedAt || new Date().toISOString();
    this._shadowUpsert('projects', row);
  },

  _dropShadowTasksForProject(projectId) {
    const tasks = this._shadowState?.collections?.tasks || {};
    let changed = false;
    for (const [key, row] of Object.entries(tasks)) {
      if (row?.projectId === projectId) {
        delete tasks[key];
        changed = true;
      }
    }
    if (changed) {
      this._shadowState.at.tasks = Date.now();
      this._persistShadowState();
    }
  },

  _hasPendingCollection(name) {
    return (this._syncQueue || []).some(job => (job.collections || []).includes(name));
  },

  _reapplyPendingToShadow(name) {
    for (const job of this._syncQueue || []) {
      if ((job.collections || []).includes(name)) this._applyPendingJobToShadow(job);
    }
  },

  _applyProjectChanges(existing, changes = {}) {
    const next = { ...(existing || {}) };
    if (next.id == null && changes.id != null) next.id = changes.id;
    if (changes.name != null) next.name = changes.name;
    if (changes.notes != null) next.notes = changes.notes;
    if (changes.type != null) next.type = changes.type;
    if (changes.status != null) next.status = changes.status;
    if (changes.priority != null) next.priority = changes.priority;
    if (changes.classroomId != null) next.classroomId = changes.classroomId ? Number(changes.classroomId) : null;
    if (changes.department != null) next.department = changes.department || '';
    if (changes.workflowTemplate != null) next.workflowTemplate = changes.workflowTemplate || '';
    if (changes.isOngoing != null) next.isOngoing = !!changes.isOngoing;
    if (changes.cadence != null) next.cadence = changes.cadence || '';
    if (changes.editorIds != null) next.editorIds = Array.isArray(changes.editorIds) ? changes.editorIds.map(Number).filter(Boolean) : [];
    if (changes.status != null) {
      if (changes.status === 'completed') next.completedAt = next.completedAt || new Date().toISOString();
      else if (existing?.status === 'completed') next.completedAt = null;
    }
    next.updatedAt = new Date().toISOString();
    return next;
  },

  _applyTaskChanges(existing, changes = {}) {
    const next = { ...(existing || {}) };
    if (next.id == null && changes.id != null) next.id = changes.id;
    if (changes.title != null) next.title = changes.title;
    if (changes.status != null) next.status = changes.status;
    if (changes.priority != null) next.priority = changes.priority;
    if (changes.dueDate != null) next.dueDate = changes.dueDate;
    if (changes.milestoneId !== undefined) next.milestoneId = changes.milestoneId;
    if (changes.assigneeId !== undefined) next.assigneeId = changes.assigneeId == null ? null : Number(changes.assigneeId);
    if (changes.workflowStepKey !== undefined) next.workflowStepKey = changes.workflowStepKey || '';
    if (changes.notes !== undefined) next.notes = changes.notes ?? '';
    if (changes.customFields !== undefined) next.customFields = changes.customFields ?? [];
    if (changes.sortOrder !== undefined) next.sortOrder = Number(changes.sortOrder) || 0;
    next.updatedAt = new Date().toISOString();
    return next;
  },

  _applyPendingJobToShadow(job) {
    if (!job) return;
    if (job.type === 'createProject' && job.payload?.project) {
      this._shadowUpsert('projects', job.payload.project);
      return;
    }
    if (job.type === 'createTask' && job.payload?.task) {
      this._shadowUpsert('tasks', job.payload.task);
      if (job.payload.task.projectId != null) this._touchShadowProject(job.payload.task.projectId, job.payload.task.updatedAt);
      return;
    }
    if (job.type === 'createUpdate' && job.payload?.update) {
      this._shadowUpsert('updates', job.payload.update);
      if (job.payload.update.projectId != null) this._touchShadowProject(job.payload.update.projectId);
      return;
    }
    if (job.type === 'updateProject') {
      const current = this._shadowGet('projects', job.payload.id) || { id: job.payload.id };
      const next = this._applyProjectChanges(current, job.payload.changes || {});
      this._shadowState.collections.projects[String(job.payload.id)] = this._clone(next);
      this._shadowState.at.projects = Date.now();
      return;
    }
    if (job.type === 'updateTask') {
      const current = this._shadowGet('tasks', job.payload.id) || { id: job.payload.id };
      const next = this._applyTaskChanges(current, job.payload.changes || {});
      this._shadowState.collections.tasks[String(job.payload.id)] = this._clone(next);
      this._shadowState.at.tasks = Date.now();
      if (next.projectId != null) this._touchShadowProject(next.projectId, next.updatedAt);
      return;
    }
    if (job.type === 'upsertDepartment') {
      const row = {
        key: job.payload.key,
        label: job.payload.label,
        color: job.payload.color || 'blue',
        sortOrder: job.payload.sortOrder ?? 0
      };
      this._shadowState.collections.departments[String(row.key)] = this._clone(row);
      this._shadowState.at.departments = Date.now();
      return;
    }
    if (job.type === 'deleteDepartment') {
      delete this._shadowState.collections.departments[String(job.payload.key)];
      this._shadowState.at.departments = Date.now();
    }
  },

  _queueBackoffMs(attempts = 1) {
    return Math.min(300000, 1000 * Math.pow(2, Math.max(0, attempts - 1)));
  },

  _publishSyncStatus() {
    if (typeof window === 'undefined') return;
    try {
      window.dispatchEvent(new CustomEvent('wt-sync-status', { detail: this.getSyncStatus() }));
    } catch (_) {}
  },

  getSyncStatus() {
    const queue = this._syncQueue || [];
    return {
      enabled: true,
      pending: queue.length,
      failed: queue.filter(job => job.status === 'failed').length,
      syncing: queue.some(job => job.status === 'syncing'),
      lastError: queue.find(job => job.lastError)?.lastError || ''
    };
  },

  _syncJobSummary(job) {
    if (!job) return '';
    if (job.type === 'createProject') return `Create project "${job.payload?.project?.name || ''}"`;
    if (job.type === 'updateProject') return `Project #${job.payload?.id}`;
    if (job.type === 'createTask') return `Create task "${job.payload?.task?.title || ''}"`;
    if (job.type === 'updateTask') return `Task #${job.payload?.id}`;
    if (job.type === 'createUpdate') return `Project note #${job.payload?.update?.projectId || ''}`;
    if (job.type === 'upsertDepartment') return `Department “${job.payload?.label || job.payload?.key || ''}”`;
    if (job.type === 'deleteDepartment') return `Delete department “${job.payload?.key || ''}”`;
    return job.type || 'Unknown job';
  },

  getSyncQueueDetails() {
    return (this._syncQueue || []).map(job => {
      const nextRetryAt = job.nextRetryAt || 0;
      let nextRetryLabel = '';
      if (nextRetryAt > Date.now()) {
        const sec = Math.max(1, Math.ceil((nextRetryAt - Date.now()) / 1000));
        nextRetryLabel = sec >= 60 ? `in ${Math.ceil(sec / 60)} min` : `in ${sec}s`;
      } else if (job.status === 'failed') {
        nextRetryLabel = 'ready to retry';
      }
      let payloadJson = '';
      try { payloadJson = JSON.stringify(job.payload || {}, null, 2); } catch (_) { payloadJson = ''; }
      return {
        id: job.id,
        type: job.type,
        status: job.status || 'pending',
        attempts: job.attempts || 0,
        lastError: job.lastError || '',
        summary: this._syncJobSummary(job),
        nextRetryLabel,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        payloadJson
      };
    });
  },

  retrySyncNow() {
    for (const job of this._syncQueue || []) {
      if (job.status === 'failed') {
        job.status = 'pending';
        job.nextRetryAt = 0;
      }
    }
    this._persistSyncQueue();
    return this.flushPendingSync();
  },

  clearFailedSyncJobs() {
    const before = (this._syncQueue || []).length;
    this._syncQueue = (this._syncQueue || []).filter(job => job.status !== 'failed');
    if (this._syncQueue.length !== before) this._persistSyncQueue();
    return before - this._syncQueue.length;
  },

  _scheduleSyncFlush(delay = 150) {
    if (typeof setTimeout !== 'function') return;
    if (this._syncFlushTimer) clearTimeout(this._syncFlushTimer);
    this._syncFlushTimer = setTimeout(() => {
      this._syncFlushTimer = null;
      this.flushPendingSync().catch(err => console.warn('sync flush failed', err));
    }, delay);
  },

  _mergeOrQueueJob(nextJob, mergeFn = null) {
    const idx = (this._syncQueue || []).findIndex(job => job.mergeKey === nextJob.mergeKey && job.status !== 'syncing');
    if (idx >= 0 && typeof mergeFn === 'function') {
      this._syncQueue[idx] = mergeFn(this._syncQueue[idx], nextJob);
    } else if (idx >= 0) {
      this._syncQueue[idx] = nextJob;
    } else {
      this._syncQueue.push(nextJob);
    }
    this._persistSyncQueue();
    this._scheduleSyncFlush(150);
  },

  async flushPendingSync() {
    if (this._syncFlushPromise) return this._syncFlushPromise;
    this._syncFlushPromise = (async () => {
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      for (let i = 0; i < this._syncQueue.length; i += 1) {
        const job = this._syncQueue[i];
        if (!job) continue;
        if (job.nextRetryAt && job.nextRetryAt > Date.now()) continue;
        job.status = 'syncing';
        job.updatedAt = new Date().toISOString();
        this._persistSyncQueue();
        try {
          await this._runSyncJob(job);
          this._syncQueue.splice(i, 1);
          i -= 1;
          this._persistSyncQueue();
        } catch (err) {
          const attempts = (job.attempts || 0) + 1;
          job.status = 'failed';
          job.attempts = attempts;
          job.updatedAt = new Date().toISOString();
          job.lastError = err?.message || err?.details || String(err);
          job.nextRetryAt = Date.now() + this._queueBackoffMs(attempts);
          this._persistSyncQueue();
          if (attempts === 1) {
            try {
              window.dispatchEvent(new CustomEvent('wt-sync-error', {
                detail: { summary: this._syncJobSummary(job), error: job.lastError }
              }));
            } catch (_) {}
          }
        }
      }
    })().finally(() => {
      this._syncFlushPromise = null;
      this._publishSyncStatus();
      const nextRetry = (this._syncQueue || [])
        .map(job => job.nextRetryAt || 0)
        .filter(Boolean)
        .sort((a, b) => a - b)[0];
      if (nextRetry && nextRetry > Date.now()) this._scheduleSyncFlush(Math.max(500, nextRetry - Date.now()));
    });
    return this._syncFlushPromise;
  },

  async _runSyncJob(job) {
    if (job.type === 'createProject') return this.createProject({ ...(job.payload.project || {}), actorUserId: job.payload.actorUserId });
    if (job.type === 'createTask') return this.createTask({ ...(job.payload.task || {}), actorUserId: job.payload.actorUserId });
    if (job.type === 'createUpdate') return this.createUpdate({ ...(job.payload.update || {}), actorUserId: job.payload.actorUserId });
    if (job.type === 'updateProject') return this.updateProject(job.payload.id, job.payload.changes, job.payload.actorUserId, true);
    if (job.type === 'updateTask') return this.updateTask(job.payload.id, job.payload.changes, job.payload.actorUserId, true, { projectId: job.payload.projectId, title: job.payload.title });
    if (job.type === 'upsertDepartment') return this.upsertDepartment(job.payload, true);
    if (job.type === 'deleteDepartment') return this.deleteDepartment(job.payload.key, true);
    // Non-critical background jobs that can safely fail silently (no handler needed)
    if (job.type === 'touchLastSeen' || job.type === 'recordLoginSession' || job.type === 'logActivity') return null;
    throw new Error(`Unsupported sync job: ${job.type}`);
  },

  _mapUser(r) {
    if (!r) return null;
    return {
      id: r.id, username: r.username, displayName: r.display_name, email: r.email || '',
      passwordHash: r.password_hash, salt: r.salt, role: r.role, createdAt: r.created_at,
      department: r.department || '', discordId: r.discord_id || '', color: r.color || '',
      bio: r.bio || '', avatarBase64: r.avatar_base64 || '',
      birthDate: r.birth_date || '', gender: r.gender || '', phone: r.phone || '',
      address: r.address || '', hoursLoggedTotal: Number(r.hours_logged_total || 0),
      lastSeenAt: r.last_seen_at || null, lastSeenIp: r.last_seen_ip || null
    };
  },

  _mapProject(r) {
    if (!r) return null;
    return {
      id: r.id, name: r.name, notes: r.notes, type: r.type, status: r.status, priority: r.priority,
      ownerId: r.owner_id, classroomId: r.classroom_id || null, department: r.department || '', workflowTemplate: r.workflow_template || '',
      completedAt: r.completed_at || null, isOngoing: !!r.is_ongoing, cadence: r.cadence || '',
      editorIds: Array.isArray(r.editor_ids) ? r.editor_ids.map(Number).filter(Boolean) : [],
      hiddenFromIds: Array.isArray(r.hidden_from_ids) ? r.hidden_from_ids.map(Number).filter(Boolean) : [],
      createdAt: r.created_at, updatedAt: r.updated_at
    };
  },

  _mapClassroom(r) {
    if (!r) return null;
    const themePalette = r.theme_palette && typeof r.theme_palette === 'object' ? r.theme_palette : null;
    return {
      id: r.id,
      name: r.name || 'Classroom',
      description: r.description || '',
      color: r.color || themePalette?.primary || '#4f46e5',
      themePalette,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    };
  },

  _mapPersonalNote(r) {
    if (!r) return null;
    return {
      id: r.id, userId: r.user_id, content: r.content || '', done: !!r.done,
      sortOrder: r.sort_order ?? 0, createdAt: r.created_at, updatedAt: r.updated_at
    };
  },

  _mapProjectAccessRequest(r) {
    if (!r) return null;
    return {
      id: r.id, projectId: r.project_id, requesterId: r.requester_id, message: r.message || '',
      status: r.status || 'pending', decidedBy: r.decided_by || null, decidedAt: r.decided_at || null,
      createdAt: r.created_at, updatedAt: r.updated_at
    };
  },

  _mapBugReport(r) {
    if (!r) return null;
    return {
      id: r.id, userId: r.user_id, title: r.title || '', description: r.description || '',
      severity: r.severity || 'normal', appVersion: r.app_version || '', screenshots: Array.isArray(r.screenshots) ? r.screenshots : [],
      status: r.status || 'open',
      githubIssueUrl: r.github_issue_url || '', resolutionNote: r.resolution_note || '',
      createdAt: r.created_at, updatedAt: r.updated_at
    };
  },

  _mapSession(r) {
    if (!r) return null;
    return {
      id: r.id, userId: r.user_id, deviceId: r.device_id || '', deviceLabel: r.device_label || '',
      userAgent: r.user_agent || '', ip: r.ip || '', firstSeenAt: r.first_seen_at,
      lastSeenAt: r.last_seen_at, loginCount: r.login_count || 1
    };
  },

  _mapTask(r) {
    if (!r) return null;
    let customFields = [];
    try { customFields = r.custom_fields ? (typeof r.custom_fields === 'string' ? JSON.parse(r.custom_fields) : r.custom_fields) : []; } catch(_) {}
    return {
      id: r.id, projectId: r.project_id, milestoneId: r.milestone_id, assigneeId: r.assignee_id,
      workflowStepKey: r.workflow_step_key || '',
      title: r.title, dueDate: r.due_date || '', status: r.status, priority: r.priority,
      notes: r.notes || '', customFields,
      sortOrder: r.sort_order ?? 0,
      createdAt: r.created_at, updatedAt: r.updated_at
    };
  },

  _mapWorkflowTemplate(r) {
    if (!r) return null;
    let steps = [];
    try { steps = r.steps ? (typeof r.steps === 'string' ? JSON.parse(r.steps) : r.steps) : []; } catch (_) {}
    return {
      id: r.id, name: r.name || '', description: r.description || '',
      steps: Array.isArray(steps) ? steps : [],
      createdBy: r.created_by ?? null,
      createdAt: r.created_at, updatedAt: r.updated_at
    };
  },

  _mapNotification(r) {
    if (!r) return null;
    return {
      id: r.id, userId: r.user_id, type: r.type, entityType: r.entity_type, entityId: r.entity_id,
      projectId: r.project_id, message: r.message || '', actorUserId: r.actor_user_id,
      readAt: r.read_at, createdAt: r.created_at
    };
  },

  _mapWebhook(r) {
    if (!r) return null;
    return {
      id: r.id, scope: r.scope, projectId: r.project_id, name: r.name,
      url: r.url, channelUrl: r.channel_url || '',
      createdAt: r.created_at, updatedAt: r.updated_at
    };
  },

  _mapMilestone(r) {
    if (!r) return null;
    return {
      id: r.id, projectId: r.project_id, title: r.title, dueDate: r.due_date || '',
      status: r.status, weight: r.weight, createdAt: r.created_at
    };
  },

  _mapUpdate(r) {
    if (!r) return null;
    return { id: r.id, projectId: r.project_id, userId: r.user_id, content: r.content, createdAt: r.created_at };
  },

  _mapAttachment(r, blob = null) {
    if (!r) return null;
    return {
      id: r.id, projectId: r.project_id, taskId: r.task_id || null, uploadedBy: r.uploaded_by, fileName: r.file_name,
      mimeType: r.mime_type, documentType: r.document_type || '', storagePath: r.storage_path,
      createdAt: r.created_at, blob
    };
  },

  _mapActivity(r) {
    if (!r) return null;
    return {
      id: r.id, userId: r.user_id, projectId: r.project_id, action: r.action,
      entityType: r.entity_type, entityId: r.entity_id, details: r.details || '', createdAt: r.created_at
    };
  },

  async logActivity({ userId, projectId = null, action, entityType, entityId = null, details = '' }) {
    if (!userId || !action) return null;
    const { data, error } = await this._sb().from('wt_activity_log').insert({
      user_id: userId, project_id: projectId, action, entity_type: entityType || 'system',
      entity_id: entityId, details: details || ''
    }).select().single();
    if (error) {
      console.warn('activity log:', error.message);
      return null;
    }
    return this._mapActivity(data);
  },

  async getActivityLog(filters = {}) {
    let q = this._sb().from('wt_activity_log').select('*').order('created_at', { ascending: false });
    if (filters.projectId != null) q = q.eq('project_id', filters.projectId);
    if (filters.userId != null) q = q.eq('user_id', filters.userId);
    if (filters.action) q = q.eq('action', filters.action);
    if (filters.entityType) q = q.eq('entity_type', filters.entityType);
    if (filters.limit != null) q = q.limit(filters.limit);
    const { data, error } = await q;
    if (error) throw error;
    let rows = (data || []).map(r => this._mapActivity(r));
    if (filters.viewerUserId != null && !filters.isAdmin) {
      rows = rows.filter(r => r.userId === filters.viewerUserId);
    }
    return rows;
  },

  async getDiscordMessages(channelId, { limit = 100 } = {}) {
    try {
      const { data, error } = await this._sb()
        .from('wt_discord_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []).map(r => ({
        id: `discord-${r.id}`,
        userId: null,
        discordAuthorId: r.author_id,
        discordAuthorName: r.author_username,
        discordDisplayName: r.author_display_name || r.author_username,
        discordAvatar: r.author_avatar || '',
        details: r.content,
        source: 'discord',
        createdAt: r.created_at
      })).reverse();
    } catch (_) {
      return [];
    }
  },

  async getChatActivityLog(channelId, { limit = 100 } = {}) {
    const projectId = channelId?.startsWith('project-') ? Number(channelId.split('-')[1]) : null;
    let q = this._sb().from('wt_activity_log').select('*')
      .eq('action', 'sent_message')
      .eq('entity_type', 'chat')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (channelId === 'general') q = q.is('project_id', null);
    else if (Number.isFinite(projectId)) q = q.eq('project_id', projectId);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(r => this._mapActivity(r)).reverse();
  },

  async createDirectMessage({ fromUserId, toUserId, content }) {
    // Resolve REAL Supabase IDs before inserting — local Dexie IDs may differ from
    // Supabase auto-generated IDs when a user was created while offline, causing FK errors.
    const [fromId, toId] = await Promise.all([
      this._resolveSupabaseUserId(fromUserId),
      this._resolveSupabaseUserId(toUserId)
    ]);
    if (fromId === toId) {
      throw new Error('Cannot send a direct message to yourself — recipient ID could not be resolved');
    }
    const { data, error } = await this._sb().from('wt_direct_messages').insert({
      from_user_id: fromId,
      to_user_id: toId,
      content: String(content || '').slice(0, 2000)
    }).select().single();
    if (error) throw error;
    return data.id;
  },

  _sessionUserId() {
    try {
      const raw = sessionStorage.getItem('wt-session');
      const s = raw ? JSON.parse(raw) : null;
      return s?.userId != null ? Number(s.userId) : null;
    } catch (_) {
      return null;
    }
  },

  async _patchLocalUserId(localId, realId, localUser) {
    if (localId === realId) return;
    const t = window.LocalDB?.db?.users;
    if (!t) return;
    const rec = localUser || await t.get(localId).catch(() => null);
    if (!rec) return;
    await t.delete(localId).catch(() => {});
    await t.put({ ...rec, id: realId }).catch(() => {});
    console.info(`[ResolveUser] patched local user ${localId} -> Supabase ID ${realId}`);
  },

  // Returns the Supabase row ID for a user, creating the row if missing and
  // patching LocalDB when the Supabase ID differs from the local Dexie ID.
  async _resolveSupabaseUserId(localId) {
    const uid = Number(localId);

    // Session cache: if we already resolved this stale ID → canonical ID this session, return it.
    // Prevents failures after _patchLocalUserId removes the stale Dexie entry on first resolve.
    if (this._resolvedUserIds.has(uid)) return this._resolvedUserIds.get(uid);

    // Fast path 1: user already exists in Supabase with this exact ID
    const { data: byId } = await this._sb().from('wt_users').select('id').eq('id', uid).maybeSingle();
    if (byId) { this._resolvedUserIds.set(uid, uid); return uid; }

    const localUser = await window.LocalDB?.getUser?.(uid).catch(() => null);

    // Fast path 2: auth session — ONLY for the logged-in user (sender ID drift after login).
    // Must not run for recipients or every DM would target the current user.
    if (uid === this._sessionUserId()) {
      try {
        const { data: authData } = await this._sb().auth.getUser();
        if (authData?.user?.id) {
          const { data: byAuth } = await this._sb()
            .from('wt_users').select('id').eq('auth_user_id', authData.user.id).maybeSingle();
          if (byAuth?.id) {
            const realId = Number(byAuth.id);
            await this._patchLocalUserId(uid, realId, localUser);
            this._cacheResolvedId(uid, realId);
            return realId;
          }
        }
      } catch (_) {}
    }

    if (!localUser?.username) throw new Error(`User ${uid} not found in Supabase or local DB`);

    // Fast path 3: recipient (or sender) may already exist under a different Supabase ID.
    // Try both the stored username case and lowercase to handle case-mismatch between local/Supabase.
    const uname = localUser.username;
    const { data: byUsername } = await this._sb()
      .from('wt_users').select('id')
      .or(`username.eq.${uname.toLowerCase()},username.eq.${uname}`)
      .maybeSingle();
    if (byUsername?.id) {
      const realId = Number(byUsername.id);
      await this._patchLocalUserId(uid, realId, localUser);
      this._cacheResolvedId(uid, realId);
      return realId;
    }

    // Not in Supabase — try to push from LocalDB
    // avatar_base64 omitted — can be several MB and cause a REST 413
    const { data: inserted, error: insertErr } = await this._sb().from('wt_users').insert({
      id: uid,
      username: localUser.username,
      display_name: localUser.displayName || localUser.username,
      email: localUser.email || '',
      password_hash: localUser.passwordHash || '',
      salt: localUser.salt || '',
      role: localUser.role || 'user',
      department: localUser.department || '',
      color: localUser.color || '',
      bio: localUser.bio || ''
    }).select('id').single();

    if (!insertErr) {
      const realId = Number(inserted.id);
      this._cacheResolvedId(uid, realId);
      return realId;
    }

    if (insertErr.code === '23505') {
      // Username already exists in Supabase with a different ID (offline-creation ID drift).
      const { data: existing } = await this._sb()
        .from('wt_users').select('id').eq('username', localUser.username.toLowerCase()).maybeSingle();
      if (existing?.id) {
        const realId = Number(existing.id);
        await this._patchLocalUserId(uid, realId, localUser);
        this._cacheResolvedId(uid, realId);
        return realId;
      }
    }

    throw insertErr;
  },

  // Cache a stale-ID → canonical-ID mapping and notify the app so open chat channels can update.
  _cacheResolvedId(staleId, canonicalId) {
    this._resolvedUserIds.set(staleId, canonicalId);
    if (staleId !== canonicalId) {
      window.dispatchEvent(new CustomEvent('wt-user-id-resolved', {
        detail: { staleId, canonicalId }
      }));
    }
  },

  _localToRemoteId(localId) {
    const id = Number(localId);
    try {
      const raw = localStorage.getItem('wt-sync-idmap-v1');
      const map = raw ? JSON.parse(raw) : {};
      const m = map[String(id)];
      return m != null ? Number(m) : id;
    } catch (_) {
      return id;
    }
  },

  _isFkError(error, column) {
    const blob = `${error?.message || ''} ${error?.details || ''} ${error?.hint || ''}`.toLowerCase();
    return error?.code === '23503' && blob.includes(String(column).toLowerCase());
  },

  async _patchLocalClassroomId(localId, realId, localClassroom) {
    if (localId === realId) return;
    const t = window.LocalDB?.db?.classrooms;
    if (t) {
      const rec = localClassroom || await t.get(localId).catch(() => null);
      if (rec) {
        await t.delete(localId).catch(() => {});
        await t.put({ ...rec, id: realId }).catch(() => {});
      }
    }
    await window.LocalDB?.db?.projects?.where('classroomId').equals(localId)
      .modify({ classroomId: realId }).catch(() => {});
    await window.LocalDB?.db?.userClassrooms?.where('classroomId').equals(localId)
      .modify({ classroomId: realId }).catch(() => {});
    try {
      const raw = localStorage.getItem('wt-sync-idmap-v1');
      const map = raw ? JSON.parse(raw) : {};
      map[String(localId)] = realId;
      localStorage.setItem('wt-sync-idmap-v1', JSON.stringify(map));
    } catch (_) {}
    console.info(`[ResolveClassroom] patched ${localId} -> ${realId}`);
  },

  async _resolveSupabaseClassroomId(localId) {
    if (localId == null) return null;
    const cid = Number(localId);
    if (!Number.isFinite(cid)) return null;

    const { data: byId } = await this._sb().from('wt_classrooms').select('id').eq('id', cid).maybeSingle();
    if (byId) return cid;

    const mapped = this._localToRemoteId(cid);
    if (mapped !== cid) {
      const { data: byMapped } = await this._sb().from('wt_classrooms').select('id').eq('id', mapped).maybeSingle();
      if (byMapped) return mapped;
    }

    const local = await window.LocalDB?.db?.classrooms?.get(cid).catch(() => null);
    if (!local?.name) return null;

    const { data: byName } = await this._sb().from('wt_classrooms').select('id').eq('name', local.name).maybeSingle();
    if (byName?.id) {
      const realId = Number(byName.id);
      await this._patchLocalClassroomId(cid, realId, local);
      return realId;
    }

    const newId = await this.createClassroom({
      name: local.name,
      description: local.description || '',
      color: local.color,
      themePalette: local.themePalette
    });
    await this._patchLocalClassroomId(cid, newId, local);
    return newId;
  },

  async _resolveSupabaseProjectId(localId) {
    const pid = Number(localId);
    const { data: byId } = await this._sb().from('wt_projects').select('id').eq('id', pid).maybeSingle();
    if (byId) return pid;

    const mapped = this._localToRemoteId(pid);
    if (mapped !== pid) {
      const { data: byMapped } = await this._sb().from('wt_projects').select('id').eq('id', mapped).maybeSingle();
      if (byMapped) return mapped;
    }

    const local = await window.LocalDB?.getProject?.(pid).catch(() => null);
    if (!local) throw new Error(`Project ${pid} not found in Supabase or local DB`);

    const ownerId = await this._resolveSupabaseUserId(local.ownerId);
    const { data: byName } = await this._sb().from('wt_projects').select('id')
      .eq('name', local.name).eq('owner_id', ownerId).maybeSingle();
    if (byName?.id) return Number(byName.id);

    return this.createProject({ ...local, id: pid, actorUserId: null });
  },

  async getDirectMessages(userA, userB, { limit = 100 } = {}) {
    const a = Number(userA);
    const b = Number(userB);
    const { data, error } = await this._sb()
      .from('wt_direct_messages')
      .select('*')
      .or(`and(from_user_id.eq.${a},to_user_id.eq.${b}),and(from_user_id.eq.${b},to_user_id.eq.${a})`)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      const msg = `${error.code || ''} ${error.message || ''} ${error.details || ''}`.toLowerCase();
      if (msg.includes('does not exist') || msg.includes('schema cache')) return [];
      throw error;
    }
    return (data || []).map(r => ({
      id: r.id,
      fromUserId: r.from_user_id,
      toUserId: r.to_user_id,
      content: r.content || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      deliveredAt: r.delivered_at || null,
      readAt: r.read_at || null
    })).reverse();
  },

  async markDMDelivered(messageId) {
    const { error } = await this._sb()
      .from('wt_direct_messages')
      .update({ delivered_at: new Date().toISOString() })
      .eq('id', Number(messageId))
      .is('delivered_at', null);
    if (error) console.warn('markDMDelivered:', error.message);
  },

  async markDMRead(fromUserId, toUserId) {
    const { error } = await this._sb()
      .from('wt_direct_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('from_user_id', Number(fromUserId))
      .eq('to_user_id', Number(toUserId))
      .is('read_at', null);
    if (error) console.warn('markDMRead:', error.message);
  },

  // username must be the WorkTracker username (lowercase) so we can find the wt_users row.
  // Returns { session, canonicalUserId } where canonicalUserId is the bigint wt_users.id
  // that Supabase actually knows, which may differ from the local Dexie ID.
  async ensureSupabaseAuth(email, password, username) {
    const client = this._sb();
    if (!client) return null;

    let authUser = null;

    // Try sign-in first
    const { data: signInData } = await client.auth.signInWithPassword({ email, password });
    if (signInData?.user) authUser = signInData.user;

    if (!authUser) {
      // Not yet in auth.users — create the account
      const { data: signUpData, error: signUpError } = await client.auth.signUp({ email, password });
      if (signUpError) { console.warn('Supabase Auth signUp:', signUpError.message); return null; }
      // Sign in immediately so we have a valid JWT session
      const { data: loginData, error: loginError } = await client.auth.signInWithPassword({ email, password });
      if (loginError) { console.warn('Supabase Auth signIn after signUp:', loginError.message); return null; }
      authUser = loginData?.user;
    }

    if (!authUser) return null;

    // Link the auth UUID to the wt_users row and get the canonical bigint ID
    const canonicalUserId = await this._linkAuthUser(authUser.id, username).catch(e => {
      console.warn('[ensureSupabaseAuth] _linkAuthUser:', e?.message);
      return null;
    });

    return { user: authUser, canonicalUserId };
  },

  // Find the wt_users row by username, write auth_user_id on it, and return its bigint id.
  // This is the single source of truth for which Supabase row belongs to a WorkTracker user.
  async _linkAuthUser(authUid, username) {
    if (!authUid) return null;

    // Already linked — fast path (covers repeated logins)
    const { data: already } = await this._sb()
      .from('wt_users').select('id').eq('auth_user_id', authUid).maybeSingle();
    if (already?.id) return Number(already.id);

    if (!username) return null;

    // Find the row by username (unique, stable) and stamp auth_user_id onto it
    const { data: byUsername } = await this._sb()
      .from('wt_users').select('id').eq('username', String(username).toLowerCase()).maybeSingle();
    if (!byUsername?.id) return null;

    await this._sb()
      .from('wt_users').update({ auth_user_id: authUid }).eq('id', Number(byUsername.id));

    return Number(byUsername.id);
  },

  async signOutSupabase() {
    try { await this._sb()?.auth.signOut(); } catch (e) { console.warn('Supabase signOut:', e); }
  },

  // Push a single local user to Supabase if they're not there yet (used to recover from FK errors)
  async _ensureUserInSupabase(userId) {
    const uid = Number(userId);
    const { data: existing } = await this._sb().from('wt_users').select('id').eq('id', uid).maybeSingle();
    if (existing) return;
    const localUser = await window.LocalDB?.getUser?.(uid).catch(() => null);
    if (!localUser?.username) {
      throw new Error(`User ${uid} not found in local DB — cannot push to Supabase`);
    }
    // avatar_base64 is omitted intentionally: it can be several MB and will cause a 413 on the
    // Supabase REST endpoint, silently failing the insert. Avatars sync via a separate update.
    const { error } = await this._sb().from('wt_users').insert({
      id: uid,
      username: localUser.username,
      display_name: localUser.displayName || localUser.username,
      email: localUser.email || '',
      password_hash: localUser.passwordHash || '',
      salt: localUser.salt || '',
      role: localUser.role || 'user',
      department: localUser.department || '',
      color: localUser.color || '',
      bio: localUser.bio || ''
    });
    if (error && error.code !== '23505') {
      // 23505 = unique username conflict — someone else just inserted the same user, treat as success
      throw error;
    }
  },

  // On startup: silently push any local users that never made it to Supabase.
  // This fixes FK violations when their data is referenced by projects, DMs, etc.
  async bootstrapMissingUsers() {
    try {
      const localUsers = await window.LocalDB?.getUsers?.() || [];
      if (!localUsers.length) return;
      const { data: remoteRows } = await this._sb().from('wt_users').select('id');
      const remoteSet = new Set((remoteRows || []).map(r => Number(r.id)));
      const missing = localUsers.filter(u => u.id && !remoteSet.has(Number(u.id)));
      if (!missing.length) return;
      for (const user of missing) {
        // avatar_base64 omitted — can be several MB and cause a 413 on the REST endpoint
        await this._sb().from('wt_users').insert({
          id: Number(user.id),
          username: user.username,
          display_name: user.displayName || user.username,
          email: user.email || '',
          password_hash: user.passwordHash || '',
          salt: user.salt || '',
          role: user.role || 'user',
          department: user.department || '',
          color: user.color || '',
          bio: user.bio || ''
        }).catch(e => {
          if (e?.code !== '23505') console.warn('[BootstrapSync] insert user', user.id, e?.message);
        });
      }
      console.log(`[BootstrapSync] pushed ${missing.length} missing user(s) to Supabase`);
    } catch (e) {
      console.warn('[BootstrapSync] bootstrapMissingUsers:', e);
    }
  },

  _defaultDepartments() {
    return [
      { key: 'it', label: 'IT', color: 'blue', sortOrder: 10 },
      { key: 'logistics', label: 'Logistics', color: 'amber', sortOrder: 20 },
      { key: 'sales', label: 'Sales', color: 'green', sortOrder: 30 },
      { key: 'purchase', label: 'Purchase', color: 'purple', sortOrder: 40 },
      { key: 'rnd', label: 'R&D', color: 'red', sortOrder: 50 }
    ];
  },

  async ensureDefaultDepartments() {
    try {
      const { count, error } = await this._sb().from('wt_departments').select('*', { count: 'exact', head: true });
      if (error) throw error;
      if ((count || 0) > 0) return;
      const rows = this._defaultDepartments().map(d => ({
        key: d.key, label: d.label, color: d.color, sort_order: d.sortOrder
      }));
      const { error: insErr } = await this._sb().from('wt_departments').insert(rows);
      if (insErr) throw insErr;
    } catch (_) { /* table optional until schema is updated */ }
  },

  async _fetchRemoteDepartments() {
    try {
      await this.ensureDefaultDepartments();
      const { data, error } = await this._sb().from('wt_departments').select('*').order('sort_order');
      if (error) throw error;
      return (data || []).map(r => ({
        key: r.key, label: r.label, color: r.color || 'blue', sortOrder: r.sort_order ?? 0
      }));
    } catch (_) {
      return this._defaultDepartments();
    }
  },

  async getDepartments() {
    const cached = this._shadowRows('departments');
    if (cached.length && this._shadowComplete('departments') && (this._shadowFresh('departments') || this._hasPendingCollection('departments'))) {
      return cached.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    }
    const rows = await this._fetchRemoteDepartments();
    this._shadowSetCollection('departments', rows, 'key');
    return this._shadowRows('departments').sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },

  async upsertDepartment({ key, label, color, sortOrder = 0 }, remoteOnly = false) {
    const slug = String(key || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) throw new Error('Department key is required');
    if (!label?.trim()) throw new Error('Department name is required');
    if (!remoteOnly) {
      const row = { key: slug, label: label.trim(), color: color || 'blue', sortOrder };
      this._shadowUpsert('departments', row, 'key');
      this._mergeOrQueueJob({
        id: `dept-upsert:${slug}`,
        type: 'upsertDepartment',
        mergeKey: `department:${slug}`,
        collections: ['departments'],
        payload: row,
        status: 'pending',
        attempts: 0,
        nextRetryAt: 0,
        lastError: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, (_, nextJob) => nextJob);
      return slug;
    }
    const row = { key: slug, label: label.trim(), color: color || 'blue', sort_order: sortOrder };
    const { error } = await this._sb().from('wt_departments').upsert(row);
    if (error) throw error;
    return slug;
  },

  async deleteDepartment(key, remoteOnly = false) {
    if (!remoteOnly) {
      this._shadowDelete('departments', key);
      this._mergeOrQueueJob({
        id: `dept-delete:${key}`,
        type: 'deleteDepartment',
        mergeKey: `department:${key}`,
        collections: ['departments'],
        payload: { key },
        status: 'pending',
        attempts: 0,
        nextRetryAt: 0,
        lastError: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, (_, nextJob) => nextJob);
      return;
    }
    const { error } = await this._sb().from('wt_departments').delete().eq('key', key);
    if (error) throw error;
  },

  async ensureDefaultClassroom() {
    const { data: first, error: findErr } = await this._sb().from('wt_classrooms').select('*').order('id').limit(1).maybeSingle();
    if (findErr) throw findErr;
    if (first?.id) return first.id;
    const { data, error } = await this._sb().from('wt_classrooms')
      .insert({ name: 'Main Classroom', description: 'Default workspace', color: '#4f46e5' })
      .select()
      .single();
    if (error) throw error;
    return data.id;
  },

  async getClassrooms() {
    const { data, error } = await this._sb().from('wt_classrooms').select('*').order('name');
    if (error) {
      const msg = `${error.code || ''} ${error.message || ''} ${error.details || ''}`.toLowerCase();
      if (msg.includes('does not exist') || msg.includes('schema cache')) return [];
      throw error;
    }
    return (data || []).map(r => this._mapClassroom(r));
  },

  async createClassroom({ name, description = '', color, themePalette } = {}) {
    const row = { name: name || 'Classroom', description: description || '' };
    if (themePalette) {
      row.theme_palette = themePalette;
      row.color = color || themePalette.primary || '#4f46e5';
    } else if (color) {
      row.color = color;
    }
    const { data, error } = await this._sb().from('wt_classrooms')
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return data.id;
  },

  async updateClassroom(id, changes = {}) {
    const patch = { updated_at: new Date().toISOString() };
    if (changes.name != null) patch.name = changes.name || 'Classroom';
    if (changes.description != null) patch.description = changes.description || '';
    if (changes.color != null) patch.color = changes.color || '#4f46e5';
    const { error } = await this._sb().from('wt_classrooms').update(patch).eq('id', Number(id));
    if (error) throw error;
  },

  async getPersonalNotes(userId) {
    const { data, error } = await this._sb().from('wt_personal_notes')
      .select('*').eq('user_id', Number(userId)).order('sort_order').order('created_at');
    if (error) throw error;
    return (data || []).map(r => this._mapPersonalNote(r));
  },

  async createPersonalNote({ userId, content, done = false, sortOrder = 0 }) {
    const { data, error } = await this._sb().from('wt_personal_notes')
      .insert({
        user_id: Number(userId), content: String(content || '').slice(0, 4000),
        done: !!done, sort_order: Number(sortOrder) || 0
      })
      .select()
      .single();
    if (error) throw error;
    return data?.id;
  },

  async updatePersonalNote(id, patch = {}) {
    const payload = { updated_at: new Date().toISOString() };
    if (patch.content !== undefined) payload.content = String(patch.content || '').slice(0, 4000);
    if (patch.done !== undefined) payload.done = !!patch.done;
    if (patch.sortOrder !== undefined) payload.sort_order = Number(patch.sortOrder);
    const { error } = await this._sb().from('wt_personal_notes').update(payload).eq('id', Number(id));
    if (error) throw error;
  },

  async deletePersonalNote(id) {
    const { error } = await this._sb().from('wt_personal_notes').delete().eq('id', Number(id));
    if (error) throw error;
  },

  async deleteClassroom(id) {
    const rooms = await this.getClassrooms();
    if (rooms.length <= 1) throw new Error('At least one classroom is required');
    const fallback = rooms.find(c => Number(c.id) !== Number(id));
    await this._sb().from('wt_projects').update({ classroom_id: fallback?.id || null }).eq('classroom_id', Number(id));
    await this._sb().from('wt_user_classrooms').delete().eq('classroom_id', Number(id));
    const { error } = await this._sb().from('wt_classrooms').delete().eq('id', Number(id));
    if (error) throw error;
  },

  async getUserClassroomIds(userId) {
    let uid = Number(userId);
    try { uid = await this._resolveSupabaseUserId(userId); } catch (_) {}
    const { data, error } = await this._sb().from('wt_user_classrooms').select('classroom_id').eq('user_id', uid);
    if (error) {
      const msg = `${error.code || ''} ${error.message || ''} ${error.details || ''}`.toLowerCase();
      if (!msg.includes('does not exist') && !msg.includes('schema cache')) throw error;
      return [];
    }
    const ids = (data || []).map(r => Number(r.classroom_id)).filter(Boolean);
    if (ids.length) return ids;
    // Safe fallback: return default without overwriting existing DB rows (prevents destructive fallback on transient errors)
    const defaultId = await this.ensureDefaultClassroom();
    return [defaultId];
  },

  async setUserClassrooms(userId, classroomIds = []) {
    let uid = Number(userId);
    try { uid = await this._resolveSupabaseUserId(userId); } catch (_) {}
    const ids = [...new Set((classroomIds || []).map(Number).filter(Boolean))];
    const finalIds = ids.length ? ids : [await this.ensureDefaultClassroom()];
    await this._sb().from('wt_user_classrooms').delete().eq('user_id', uid);
    const rows = finalIds.map(classroomId => ({ user_id: uid, classroom_id: classroomId }));
    if (rows.length) {
      const { error } = await this._sb().from('wt_user_classrooms').insert(rows);
      if (error) throw error;
    }
    return finalIds;
  },

  async createUser(data) {
    const salt = window.WT_CRYPTO.generateSalt();
    const pwHash = await window.WT_CRYPTO.hashPassword(data.password, salt);
    const payload = {
      username: data.username.toLowerCase(),
      display_name: data.displayName || data.username,
      email: data.email || '',
      password_hash: pwHash,
      salt,
      role: data.role || 'user',
      department: data.department || '',
      color: data.color || '',
      bio: data.bio || '',
      avatar_base64: data.avatarBase64 || '',
      birth_date: data.birthDate || null,
      gender: data.gender || '',
      phone: data.phone || '',
      address: data.address || '',
      hours_logged_total: Number(data.hoursLoggedTotal || 0)
    };
    let { data: row, error } = await this._sb().from('wt_users').insert(payload).select().single();
    if (error && this._isMissingColumn(error)) {
      delete payload.department;
      delete payload.color;
      delete payload.bio;
      delete payload.avatar_base64;
      ({ data: row, error } = await this._sb().from('wt_users').insert(payload).select().single());
    }
    if (error) throw error;
    await this.setUserClassrooms(row.id, data.classroomIds || [await this.ensureDefaultClassroom()]).catch(() => {});
    return row.id;
  },

  async getUser(id) {
    const cached = this._shadowGet('users', id);
    if (this._isOffline()) return cached || this._trustedSessionUser(id);
    const { data, error } = await this._sb().from('wt_users').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    const user = this._mapUser(data);
    if (user) this._shadowUpsert('users', user);
    return user;
  },

  async getUserByUsername(username) {
    const { data, error } = await this._sb().from('wt_users').select('*').eq('username', username.toLowerCase()).maybeSingle();
    if (error) throw error;
    return this._mapUser(data);
  },

  async getUsers() {
    if (this._isOffline()) {
      const cached = this._shadowRows('users');
      if (cached.length) return cached.sort((a, b) => a.id - b.id);
      const trusted = this._trustedSessionUser();
      return trusted ? [trusted] : [];
    }
    const { data, error } = await this._sb().from('wt_users').select('*').order('id');
    if (error) throw error;
    const users = (data || []).map(r => this._mapUser(r));
    this._shadowSetCollection('users', users);
    return users;
  },

  async updateUser(id, changes, actorUserId = null) {
    const patch = {};
    if (changes.displayName != null) patch.display_name = changes.displayName;
    if (changes.email != null) patch.email = changes.email;
    if (changes.role != null) patch.role = changes.role;
    if (changes.department != null) patch.department = changes.department || '';
    if (changes.discordId != null) patch.discord_id = changes.discordId;
    if (changes.color != null) patch.color = changes.color;
    if (changes.bio != null) patch.bio = changes.bio || '';
    if (changes.avatarBase64 != null) patch.avatar_base64 = changes.avatarBase64 || '';
    if (changes.lastSeenAt != null) patch.last_seen_at = changes.lastSeenAt;
    if (changes.lastSeenIp != null) patch.last_seen_ip = changes.lastSeenIp;
    if (changes.birthDate != null) patch.birth_date = changes.birthDate || null;
    if (changes.gender != null) patch.gender = changes.gender || '';
    if (changes.phone != null) patch.phone = changes.phone || '';
    if (changes.address != null) patch.address = changes.address || '';
    if (changes.hoursLoggedTotal != null) patch.hours_logged_total = Number(changes.hoursLoggedTotal || 0);
    if (changes.username != null) {
      const next = String(changes.username).trim().toLowerCase();
      if (!next) throw new Error('Username cannot be empty');
      const { data: conflict } = await this._sb().from('wt_users').select('id').eq('username', next).maybeSingle();
      if (conflict && conflict.id !== id) throw new Error('Username already taken');
      patch.username = next;
    }
    let { error } = await this._sb().from('wt_users').update(patch).eq('id', id);
    if (error && this._isMissingColumn(error) && (patch.color != null || patch.department != null || patch.bio != null || patch.avatar_base64 != null)) {
      delete patch.department;
      delete patch.color;
      delete patch.bio;
      delete patch.avatar_base64;
      ({ error } = await this._sb().from('wt_users').update(patch).eq('id', id));
    }
    if (error) throw error;
    const fieldLabels = { display_name: 'display name', email: 'email', role: 'role', department: 'department', discord_id: 'Discord ID', color: 'color', username: 'username', bio: 'bio', avatar_base64: 'profile photo' };
    if (actorUserId) {
      await this.logActivity({
        userId: actorUserId, action: 'updated', entityType: 'user', entityId: id,
        details: Object.keys(patch).map(k => fieldLabels[k] || k).join(', ')
      });
    }
  },

  async changePassword(userId, newPassword, actorUserId = null) {
    const salt = window.WT_CRYPTO.generateSalt();
    const pwHash = await window.WT_CRYPTO.hashPassword(newPassword, salt);
    const { error } = await this._sb().from('wt_users').update({ password_hash: pwHash, salt }).eq('id', userId);
    if (error) throw error;
    if (actorUserId) await this.logActivity({ userId: actorUserId, action: 'password_changed', entityType: 'user', entityId: userId });
  },

  async verifyPassword(password, user) {
    const hash = await window.WT_CRYPTO.hashPassword(password, user.salt);
    return hash === user.passwordHash;
  },

  async deleteUser(id, transferToId) {
    await this._sb().from('wt_projects').update({ owner_id: transferToId }).eq('owner_id', id);
    const { error } = await this._sb().from('wt_users').delete().eq('id', id);
    if (error) throw error;
  },

  async hasUsers() {
    const { count, error } = await this._sb().from('wt_users').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return (count || 0) > 0;
  },

  async hasMasterKey() {
    const { data, error } = await this._sb().from('wt_settings').select('*').eq('key', 'masterKey').maybeSingle();
    if (error) throw error;
    return !!(data?.password_hash && data?.salt);
  },

  async setMasterKey(plainKey) {
    const salt = window.WT_CRYPTO.generateSalt();
    const passwordHash = await window.WT_CRYPTO.hashPassword(plainKey, salt);
    const { error } = await this._sb().from('wt_settings').upsert({ key: 'masterKey', password_hash: passwordHash, salt });
    if (error) throw error;
  },

  async verifyMasterKey(plainKey) {
    const { data, error } = await this._sb().from('wt_settings').select('*').eq('key', 'masterKey').maybeSingle();
    if (error) throw error;
    if (!data?.salt) return false;
    const hash = await window.WT_CRYPTO.hashPassword(plainKey, data.salt);
    return hash === data.password_hash;
  },

  async createProject(data) {
    const actorUserId = data.actorUserId;
    const now = new Date().toISOString();
    if (this._isOffline()) {
      const id = this._offlineId();
      const project = {
        id,
        name: data.name || '',
        notes: data.notes || '',
        type: data.type || 'project',
        status: data.status || 'active',
        priority: data.priority || 'medium',
        ownerId: data.ownerId ?? actorUserId ?? 1,
        classroomId: data.classroomId != null ? Number(data.classroomId) : null,
        department: data.department || '',
        workflowTemplate: data.workflowTemplate || '',
        completedAt: data.status === 'completed' ? now : null,
        isOngoing: !!data.isOngoing,
        cadence: data.cadence || '',
        editorIds: Array.isArray(data.editorIds) ? data.editorIds.map(Number).filter(Boolean) : [],
        createdAt: now,
        updatedAt: now
      };
      this._shadowUpsert('projects', project);
      this._mergeOrQueueJob({
        id: `project-create:${id}`,
        type: 'createProject',
        mergeKey: `createProject:${id}`,
        collections: ['projects'],
        payload: { project: this._clone(project), actorUserId },
        status: 'pending',
        attempts: 0,
        nextRetryAt: 0,
        lastError: '',
        createdAt: now,
        updatedAt: now
      });
      return id;
    }
    const ownerId = await this._resolveSupabaseUserId(data.ownerId ?? actorUserId ?? 1);
    let classroomId = null;
    if (data.classroomId != null) {
      classroomId = await this._resolveSupabaseClassroomId(data.classroomId).catch(() => null);
    } else {
      try {
        const roomIds = await this.getUserClassroomIds(ownerId);
        if (roomIds[0]) classroomId = await this._resolveSupabaseClassroomId(roomIds[0]).catch(() => null);
      } catch (_) {}
    }
    const editorIds = [];
    if (Array.isArray(data.editorIds)) {
      for (const eid of data.editorIds) {
        try { editorIds.push(await this._resolveSupabaseUserId(eid)); } catch (_) {}
      }
    }
    const hiddenFromIds = [];
    if (Array.isArray(data.hiddenFromIds)) {
      for (const hid of data.hiddenFromIds) {
        try { hiddenFromIds.push(await this._resolveSupabaseUserId(hid)); } catch (_) {}
      }
    }
    const id = data.id ?? await this._nextTableId('wt_projects');
    const payload = {
      id, name: data.name || '', notes: data.notes || '', type: data.type || 'project',
      status: data.status || 'active', priority: data.priority || 'medium',
      owner_id: ownerId,
      classroom_id: classroomId,
      department: data.department || '',
      workflow_template: data.workflowTemplate || '',
      completed_at: data.status === 'completed' ? now : null,
      is_ongoing: !!data.isOngoing,
      cadence: data.cadence || '',
      editor_ids: editorIds,
      hidden_from_ids: hiddenFromIds
    };
    let { data: row, error } = await this._sb().from('wt_projects').insert(payload).select().single();
    if (error && this._isMissingColumn(error)) {
      delete payload.department;
      delete payload.classroom_id;
      delete payload.workflow_template;
      delete payload.completed_at;
      delete payload.is_ongoing;
      delete payload.cadence;
      delete payload.editor_ids;
      delete payload.hidden_from_ids;
      ({ data: row, error } = await this._sb().from('wt_projects').insert(payload).select().single());
    }
    if (this._isFkError(error, 'classroom_id')) {
      payload.classroom_id = null;
      ({ data: row, error } = await this._sb().from('wt_projects').insert(payload).select().single());
    }
    if (error?.code === '23505') {
      const { data: existing } = await this._sb().from('wt_projects').select('*').eq('id', id).maybeSingle();
      if (existing) {
        this._shadowUpsert('projects', this._mapProject(existing));
        return existing.id;
      }
    }
    if (error) throw error;
    this._shadowUpsert('projects', this._mapProject(row));
    if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: row.id, action: 'created', entityType: 'project', entityId: row.id, details: row.name }).catch(() => {});
    return row.id;
  },

  async _fetchRemoteProjects() {
    const { data, error } = await this._sb().from('wt_projects').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => this._mapProject(r));
  },

  async getProjects() {
    const cached = this._shadowRows('projects');
    if (this._isOffline()) return cached.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    if (cached.length && this._shadowComplete('projects') && (this._shadowFresh('projects') || this._hasPendingCollection('projects'))) {
      return cached.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    }
    const rows = await this._fetchRemoteProjects();
    this._shadowSetCollection('projects', rows);
    return this._shadowRows('projects').sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  },

  async _fetchRemoteProject(id) {
    const { data, error } = await this._sb().from('wt_projects').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return this._mapProject(data);
  },

  async getProject(id) {
    const cached = this._shadowGet('projects', id);
    if (this._isOffline()) return cached || null;
    if (cached && (this._shadowFresh('projects') || this._hasPendingCollection('projects'))) return cached;
    const row = await this._fetchRemoteProject(id);
    if (row) this._shadowUpsert('projects', row);
    return row;
  },

  async updateProject(id, changes, actorUserId = null, remoteOnly = false) {
    if (!remoteOnly) {
      const existing = await this.getProject(id);
      if (!existing) throw new Error('Project not found');
      const optimistic = this._applyProjectChanges(existing, changes);
      this._shadowUpsert('projects', optimistic);
      this._mergeOrQueueJob({
        id: `project-update:${id}`,
        type: 'updateProject',
        mergeKey: `updateProject:${id}`,
        collections: ['projects'],
        payload: { id, changes: this._clone(changes), actorUserId },
        status: 'pending',
        attempts: 0,
        nextRetryAt: 0,
        lastError: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, (current, nextJob) => ({
        ...current,
        payload: {
          ...current.payload,
          changes: { ...(current.payload?.changes || {}), ...(nextJob.payload?.changes || {}) },
          actorUserId: nextJob.payload?.actorUserId ?? current.payload?.actorUserId
        },
        status: 'pending',
        updatedAt: nextJob.updatedAt,
        nextRetryAt: 0,
        lastError: ''
      }));
      return id;
    }
    const existing = await this._fetchRemoteProject(id);
    const patch = { updated_at: new Date().toISOString() };
    if (changes.name != null) patch.name = changes.name;
    if (changes.notes != null) patch.notes = changes.notes;
    if (changes.type != null) patch.type = changes.type;
    if (changes.status != null) patch.status = changes.status;
    if (changes.priority != null) patch.priority = changes.priority;
    if (changes.department != null) patch.department = changes.department || '';
    if (changes.classroomId != null) patch.classroom_id = changes.classroomId ? Number(changes.classroomId) : null;
    if (changes.workflowTemplate != null) patch.workflow_template = changes.workflowTemplate || '';
    if (changes.isOngoing != null) patch.is_ongoing = !!changes.isOngoing;
    if (changes.cadence != null) patch.cadence = changes.cadence || '';
    if (changes.editorIds != null) patch.editor_ids = Array.isArray(changes.editorIds) ? changes.editorIds.map(Number).filter(Boolean) : [];
    if (changes.hiddenFromIds != null) patch.hidden_from_ids = Array.isArray(changes.hiddenFromIds) ? changes.hiddenFromIds.map(Number).filter(Boolean) : [];
    if (changes.status != null) {
      if (changes.status === 'completed') patch.completed_at = existing?.completedAt || new Date().toISOString();
      else if (existing?.status === 'completed') patch.completed_at = null;
    }
    let { error } = await this._sb().from('wt_projects').update(patch).eq('id', id);
    if (error && this._isMissingColumn(error) && remoteOnly) {
      throw new Error('Supabase schema is missing one or more project sync fields. Run supabase/schema.sql and the queued change will retry automatically.');
    }
    if (error && this._isMissingColumn(error)) {
      delete patch.department;
      delete patch.classroom_id;
      delete patch.workflow_template;
      delete patch.completed_at;
      delete patch.is_ongoing;
      delete patch.cadence;
      delete patch.editor_ids;
      delete patch.hidden_from_ids;
      ({ error } = await this._sb().from('wt_projects').update(patch).eq('id', id));
    }
    if (error) throw error;
    this._touchShadowProject(id, patch.updated_at);
    if (actorUserId) {
      const p = await this._fetchRemoteProject(id);
      await this.logActivity({ userId: actorUserId, projectId: id, action: 'updated', entityType: 'project', entityId: id, details: p?.name || '' });
    }
    return id;
  },

  async deleteProject(id, actorUserId = null) {
    const p = await this._fetchRemoteProject(id);
    const { error } = await this._sb().from('wt_projects').delete().eq('id', id);
    if (error) throw error;
    this._shadowDelete('projects', id);
    this._dropShadowTasksForProject(id);
    if (actorUserId) await this.logActivity({ userId: actorUserId, action: 'deleted', entityType: 'project', entityId: id, details: p?.name || '' });
  },

  async addAttachment(data) {
    const fileName = data.fileName || 'file';
    const path = `${data.projectId}/${Date.now()}_${fileName.replace(/[^\w.\-]+/g, '_')}`;
    const { error: upErr } = await this._sb().storage.from(this.BUCKET).upload(path, data.blob, {
      contentType: data.mimeType || 'application/octet-stream', upsert: true
    });
    if (upErr) throw upErr;
    const { data: row, error } = await this._sb().from('wt_attachments').insert({
      project_id: data.projectId, task_id: data.taskId || null, uploaded_by: data.uploadedBy, file_name: fileName,
      mime_type: data.mimeType || 'application/octet-stream', document_type: data.documentType || '', storage_path: path
    }).select().single();
    if (error) throw error;
    await this._sb().from('wt_projects').update({ updated_at: new Date().toISOString() }).eq('id', data.projectId);
    if (data.uploadedBy) await this.logActivity({ userId: data.uploadedBy, projectId: data.projectId, action: 'uploaded', entityType: 'attachment', entityId: row.id, details: fileName });
    return this._mapAttachment(row);
  },

  async getAttachments(projectId) {
    const { data, error } = await this._sb().from('wt_attachments').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => this._mapAttachment(r));
  },

  async getAttachment(id) {
    const { data, error } = await this._sb().from('wt_attachments').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const { data: blob, error: dErr } = await this._sb().storage.from(this.BUCKET).download(data.storage_path);
    if (dErr) throw dErr;
    return this._mapAttachment(data, blob);
  },

  getAttachmentUrl(storagePath) {
    if (!storagePath) return '';
    const { data } = this._sb().storage.from(this.BUCKET).getPublicUrl(storagePath);
    return data?.publicUrl || '';
  },

  async deleteAttachment(id, actorUserId = null) {
    const { data: row, error: gErr } = await this._sb().from('wt_attachments').select('*').eq('id', id).maybeSingle();
    if (gErr) throw gErr;
    if (!row) return;
    await this._sb().storage.from(this.BUCKET).remove([row.storage_path]);
    const { error } = await this._sb().from('wt_attachments').delete().eq('id', id);
    if (error) throw error;
    await this._sb().from('wt_projects').update({ updated_at: new Date().toISOString() }).eq('id', row.project_id);
    if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: row.project_id, action: 'deleted', entityType: 'attachment', entityId: id, details: row.file_name });
  },

  async blobToBase64(blob) {
    return window.LocalDB.blobToBase64(blob);
  },

  base64ToBlob(base64, mimeType) {
    return window.LocalDB.base64ToBlob(base64, mimeType);
  },

  async createTask(data) {
    const actorUserId = data.actorUserId;
    const picked = data.assigneeId != null ? Number(data.assigneeId) : null;
    const assigneeId = picked != null && picked > 0 ? picked : (actorUserId ?? null);
    if (this._isOffline()) {
      const now = new Date().toISOString();
      const id = this._offlineId();
      const task = {
        id,
        projectId: data.projectId,
        milestoneId: data.milestoneId || null,
        assigneeId,
        workflowStepKey: data.workflowStepKey || '',
        title: data.title || '',
        dueDate: data.dueDate || '',
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        notes: data.notes || '',
        customFields: data.customFields || [],
        sortOrder: data.sortOrder != null ? Number(data.sortOrder) : Math.floor(Date.now() / 1000),
        createdAt: now,
        updatedAt: now
      };
      this._shadowUpsert('tasks', task);
      this._touchShadowProject(data.projectId, now);
      this._mergeOrQueueJob({
        id: `task-create:${id}`,
        type: 'createTask',
        mergeKey: `createTask:${id}`,
        collections: ['tasks', 'projects'],
        payload: { task: this._clone(task), actorUserId },
        status: 'pending',
        attempts: 0,
        nextRetryAt: 0,
        lastError: '',
        createdAt: now,
        updatedAt: now
      });
      return id;
    }
    const projectId = await this._resolveSupabaseProjectId(data.projectId);
    let resolvedAssignee = assigneeId;
    if (resolvedAssignee != null) {
      resolvedAssignee = await this._resolveSupabaseUserId(resolvedAssignee);
    }
    const id = data.id ?? await this._nextTableId('wt_tasks');
    const { data: row, error } = await this._sb().from('wt_tasks').insert({
      id, project_id: projectId, milestone_id: data.milestoneId || null, assignee_id: resolvedAssignee,
      workflow_step_key: data.workflowStepKey || '',
      title: data.title || '', due_date: data.dueDate || '', status: data.status || 'todo',
      priority: data.priority || 'medium',
      notes: data.notes || '',
      custom_fields: JSON.stringify(data.customFields || []),
      sort_order: data.sortOrder != null ? Number(data.sortOrder) : Math.floor(Date.now() / 1000)
    }).select().single();
    if (error) throw error;
    const updatedAt = new Date().toISOString();
    await this._sb().from('wt_projects').update({ updated_at: updatedAt }).eq('id', projectId);
    this._shadowUpsert('tasks', this._mapTask(row));
    this._touchShadowProject(projectId, updatedAt);
    if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: projectId, action: 'created', entityType: 'task', entityId: row.id, details: row.title }).catch(() => {});
    return row.id;
  },

  async _fetchRemoteTasks(filter = {}) {
    let q = this._sb().from('wt_tasks').select('*');
    if (filter.projectId) q = q.eq('project_id', filter.projectId);
    if (filter.status) q = q.eq('status', filter.status);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => this._mapTask(r));
  },

  async getTasks(filter = {}) {
    const cached = this._shadowRows('tasks');
    const cachedProjectRows = filter.projectId ? cached.filter(r => r.projectId === filter.projectId) : [];
    if (this._isOffline()) {
      let rows = cached;
      if (filter.projectId) rows = rows.filter(r => Number(r.projectId) === Number(filter.projectId));
      if (filter.status) rows = rows.filter(r => r.status === filter.status);
      return rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
    if (cached.length && this._shadowComplete('tasks') && (this._shadowFresh('tasks') || this._hasPendingCollection('tasks'))) {
      let rows = cached;
      if (filter.projectId) rows = rows.filter(r => r.projectId === filter.projectId);
      if (filter.status) rows = rows.filter(r => r.status === filter.status);
      return rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
    if (cachedProjectRows.length && filter.projectId && (this._shadowFresh('tasks') || this._hasPendingCollection('tasks'))) {
      let rows = cachedProjectRows;
      if (filter.status) rows = rows.filter(r => r.status === filter.status);
      return rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
    const rows = await this._fetchRemoteTasks(filter);
    if (!filter.projectId && !filter.status) this._shadowSetCollection('tasks', rows);
    else rows.forEach(row => this._shadowUpsert('tasks', row));
    return rows;
  },

  async _fetchRemoteTask(id) {
    const { data, error } = await this._sb().from('wt_tasks').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return this._mapTask(data);
  },

  async getTask(id) {
    const cached = this._shadowGet('tasks', id);
    if (this._isOffline()) return cached || null;
    if (cached && (this._shadowFresh('tasks') || this._hasPendingCollection('tasks'))) return cached;
    const row = await this._fetchRemoteTask(id);
    if (row) this._shadowUpsert('tasks', row);
    return row;
  },

  async updateTask(id, changes, actorUserId = null, remoteOnly = false, hint = null) {
    if (!remoteOnly) {
      const task = await this.getTask(id);
      if (!task) throw new Error('Task not found');
      const optimistic = this._applyTaskChanges(task, changes);
      this._shadowUpsert('tasks', optimistic);
      if (optimistic.projectId != null) this._touchShadowProject(optimistic.projectId, optimistic.updatedAt);
      this._mergeOrQueueJob({
        id: `task-update:${id}`,
        type: 'updateTask',
        mergeKey: `updateTask:${id}`,
        collections: ['tasks', 'projects'],
        payload: { id, projectId: optimistic.projectId, title: optimistic.title, changes: this._clone(changes), actorUserId },
        status: 'pending',
        attempts: 0,
        nextRetryAt: 0,
        lastError: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, (current, nextJob) => ({
        ...current,
        payload: {
          ...current.payload,
          changes: { ...(current.payload?.changes || {}), ...(nextJob.payload?.changes || {}) },
          actorUserId: nextJob.payload?.actorUserId ?? current.payload?.actorUserId,
          projectId: nextJob.payload?.projectId ?? current.payload?.projectId,
          title: nextJob.payload?.title ?? current.payload?.title
        },
        status: 'pending',
        updatedAt: nextJob.updatedAt,
        nextRetryAt: 0,
        lastError: ''
      }));
      return optimistic;
    }
    // Use the hint from the sync job payload if available to avoid an extra fetch
    let task = null;
    if (hint?.projectId) {
      task = { projectId: hint.projectId, title: hint.title };
    } else {
      task = await this._fetchRemoteTask(id);
    }
    const activityDetails = changes.activityDetails || '';
    const patch = { updated_at: new Date().toISOString() };
    if (changes.title != null) patch.title = changes.title;
    if (changes.status != null) patch.status = changes.status;
    if (changes.priority != null) patch.priority = changes.priority;
    if (changes.dueDate != null) patch.due_date = changes.dueDate;
    if (changes.milestoneId !== undefined) patch.milestone_id = changes.milestoneId;
    if (changes.assigneeId !== undefined) {
      if (changes.assigneeId == null) {
        patch.assignee_id = null;
      } else {
        // Match createTask: local Dexie IDs can differ from wt_users.id (offline drift).
        patch.assignee_id = await this._resolveSupabaseUserId(Number(changes.assigneeId));
      }
    }
    if (changes.workflowStepKey !== undefined) patch.workflow_step_key = changes.workflowStepKey || '';
    if (changes.notes !== undefined) patch.notes = changes.notes ?? '';
    if (changes.customFields !== undefined) patch.custom_fields = JSON.stringify(changes.customFields ?? []);
    if (changes.sortOrder !== undefined) patch.sort_order = Number(changes.sortOrder) || 0;
    const { error } = await this._sb().from('wt_tasks').update(patch).eq('id', id);
    if (error) throw error;
    if (task?.projectId) {
      // Parallelize project touch + activity log (they're independent)
      await Promise.all([
        this._sb().from('wt_projects').update({ updated_at: patch.updated_at }).eq('id', task.projectId),
        (async () => {
          this._touchShadowProject(task.projectId, patch.updated_at);
        })(),
        (async () => {
          if (actorUserId) {
            const detail = activityDetails || (changes.status ? `status -> ${changes.status}` : (task.title || ''));
            await this.logActivity({ userId: actorUserId, projectId: task.projectId, action: 'updated', entityType: 'task', entityId: id, details: detail });
          }
        })()
      ]);
    }
    return this._applyTaskChanges(task, changes);
  },

  async deleteTask(id, actorUserId = null) {
    const task = await this._fetchRemoteTask(id);
    const { error } = await this._sb().from('wt_tasks').delete().eq('id', id);
    if (error) throw error;
    this._shadowDelete('tasks', id);
    if (task) {
      await this._sb().from('wt_projects').update({ updated_at: new Date().toISOString() }).eq('id', task.projectId);
      this._touchShadowProject(task.projectId);
      if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: task.projectId, action: 'deleted', entityType: 'task', entityId: id, details: task.title });
    }
  },

  /* Workflow templates (Phase 3) */
  async getWorkflowTemplates() {
    const { data, error } = await this._sb().from('wt_workflow_templates').select('*').order('name');
    if (error) throw error;
    return (data || []).map(r => this._mapWorkflowTemplate(r));
  },

  async createWorkflowTemplate(data) {
    const id = data.id ?? await this._nextTableId('wt_workflow_templates');
    const { data: row, error } = await this._sb().from('wt_workflow_templates').insert({
      id,
      name: (data.name || '').trim() || 'Untitled template',
      description: (data.description || '').trim(),
      steps: JSON.stringify(data.steps || []),
      created_by: data.createdBy ?? data.actorUserId ?? null
    }).select().single();
    if (error) throw error;
    return row.id;
  },

  async updateWorkflowTemplate(id, changes) {
    const patch = { updated_at: new Date().toISOString() };
    if (changes.name != null) patch.name = (changes.name || '').trim() || 'Untitled template';
    if (changes.description != null) patch.description = (changes.description || '').trim();
    if (changes.steps != null) patch.steps = JSON.stringify(changes.steps || []);
    const { error } = await this._sb().from('wt_workflow_templates').update(patch).eq('id', id);
    if (error) throw error;
  },

  async deleteWorkflowTemplate(id) {
    const { error } = await this._sb().from('wt_workflow_templates').delete().eq('id', id);
    if (error) throw error;
  },

  /* Chat favorites (Phase 5) */
  async getFavorites(userId) {
    const { data, error } = await this._sb().from('wt_user_favorites').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(r => ({ id: r.id, userId: r.user_id, favoriteUserId: r.favorite_user_id, createdAt: r.created_at }));
  },

  async addFavorite(data) {
    const id = data.id ?? await this._nextTableId('wt_user_favorites');
    const { data: row, error } = await this._sb().from('wt_user_favorites')
      .upsert({ id, user_id: data.userId, favorite_user_id: data.favoriteUserId }, { onConflict: 'user_id,favorite_user_id' })
      .select().single();
    if (error) throw error;
    return row?.id ?? id;
  },

  async removeFavorite(userId, favoriteUserId) {
    const { error } = await this._sb().from('wt_user_favorites').delete()
      .eq('user_id', userId).eq('favorite_user_id', favoriteUserId);
    if (error) throw error;
  },

  async createMilestone(data) {
    const actorUserId = data.actorUserId;
    const id = await this._nextTableId('wt_milestones');
    const { data: row, error } = await this._sb().from('wt_milestones').insert({
      id, project_id: data.projectId, title: data.title || '', due_date: data.dueDate || '',
      status: data.status || 'pending', weight: data.weight || 1
    }).select().single();
    if (error) throw error;
    await this._sb().from('wt_projects').update({ updated_at: new Date().toISOString() }).eq('id', data.projectId);
    if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: data.projectId, action: 'created', entityType: 'milestone', entityId: row.id, details: row.title });
    return row.id;
  },

  async getMilestones(projectId) {
    const { data, error } = await this._sb().from('wt_milestones').select('*').eq('project_id', projectId);
    if (error) throw error;
    return (data || []).map(r => this._mapMilestone(r));
  },

  async getMilestone(id) {
    const { data, error } = await this._sb().from('wt_milestones').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return this._mapMilestone(data);
  },

  async getUpdate(id) {
    const { data, error } = await this._sb().from('wt_updates').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return this._mapUpdate(data);
  },

  async updateMilestone(id, changes, actorUserId = null) {
    const { data: ms, error: gErr } = await this._sb().from('wt_milestones').select('*').eq('id', id).maybeSingle();
    if (gErr) throw gErr;
    const patch = {};
    if (changes.title != null) patch.title = changes.title;
    if (changes.status != null) patch.status = changes.status;
    if (changes.dueDate != null) patch.due_date = changes.dueDate;
    if (changes.weight != null) patch.weight = changes.weight;
    const { error } = await this._sb().from('wt_milestones').update(patch).eq('id', id);
    if (error) throw error;
    if (ms) {
      await this._sb().from('wt_projects').update({ updated_at: new Date().toISOString() }).eq('id', ms.project_id);
      if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: ms.project_id, action: 'updated', entityType: 'milestone', entityId: id, details: ms.title });
    }
    return id;
  },

  async deleteMilestone(id, actorUserId = null) {
    const { data: ms, error: gErr } = await this._sb().from('wt_milestones').select('*').eq('id', id).maybeSingle();
    if (gErr) throw gErr;
    if (ms) {
      await this._sb().from('wt_tasks').update({ milestone_id: null }).eq('milestone_id', id);
      const { error } = await this._sb().from('wt_milestones').delete().eq('id', id);
      if (error) throw error;
      await this._sb().from('wt_projects').update({ updated_at: new Date().toISOString() }).eq('id', ms.project_id);
      if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: ms.project_id, action: 'deleted', entityType: 'milestone', entityId: id, details: ms.title });
    }
  },

  async createUpdate(data) {
    const actorUserId = data.actorUserId;
    if (this._isOffline()) {
      const now = new Date().toISOString();
      const id = this._offlineId();
      const update = { id, projectId: data.projectId, userId: actorUserId || null, content: data.content || '', createdAt: now };
      this._shadowUpsert('updates', update);
      this._touchShadowProject(data.projectId, now);
      this._mergeOrQueueJob({
        id: `update-create:${id}`,
        type: 'createUpdate',
        mergeKey: `createUpdate:${id}`,
        collections: ['updates', 'projects'],
        payload: { update: this._clone(update), actorUserId },
        status: 'pending',
        attempts: 0,
        nextRetryAt: 0,
        lastError: '',
        createdAt: now,
        updatedAt: now
      });
      return id;
    }
    const id = data.id ?? await this._nextTableId('wt_updates');
    const { data: row, error } = await this._sb().from('wt_updates').insert({
      id, project_id: data.projectId, user_id: actorUserId || null, content: data.content || ''
    }).select().single();
    if (error) throw error;
    await this._sb().from('wt_projects').update({ updated_at: new Date().toISOString() }).eq('id', data.projectId);
    if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: data.projectId, action: 'noted', entityType: 'update', entityId: row.id, details: (data.content || '').slice(0, 120) }).catch(() => {});
    return row.id;
  },

  async getUpdates(projectId) {
    const cached = this._shadowRows('updates').filter(r => Number(r.projectId) === Number(projectId));
    if (cached.length && (this._isOffline() || this._hasPendingCollection('updates'))) {
      return cached.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    }
    const { data, error } = await this._sb().from('wt_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (data || []).map(r => this._mapUpdate(r));
    rows.forEach(row => this._shadowUpsert('updates', row));
    return rows;
  },

  async deleteUpdate(id, actorUserId = null) {
    const { data: row, error: gErr } = await this._sb().from('wt_updates').select('*').eq('id', id).maybeSingle();
    if (gErr) throw gErr;
    const { error } = await this._sb().from('wt_updates').delete().eq('id', id);
    if (error) throw error;
    if (row && actorUserId) await this.logActivity({ userId: actorUserId, projectId: row.project_id, action: 'deleted', entityType: 'update', entityId: id });
  },

  async getProjectProgress(projectId) {
    const tasks = await this.getTasks({ projectId });
    if (tasks.length === 0) return 0;
    const scores = { todo: 0, doing: 50, done: 100 };
    const total = tasks.reduce((sum, t) => sum + (scores[t.status] || 0), 0);
    return Math.round(total / tasks.length);
  },

  async getStats(opts = {}) {
    let projects = await this.getProjects();
    let tasks = await this.getTasks();
    if (opts.mineOnly && opts.userId != null) {
      projects = projects.filter(p => p.ownerId === opts.userId);
      const pids = new Set(projects.map(p => p.id));
      tasks = tasks.filter(t => pids.has(t.projectId));
    }
    const today = new Date().toISOString().split('T')[0];
    return {
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      overdueTasks: tasks.filter(t => t.dueDate && t.dueDate < today && t.status !== 'done').length
    };
  },

  async isEmpty() {
    const { count, error } = await this._sb().from('wt_projects').select('*', { count: 'exact', head: true });
    if (error) throw error;
    return (count || 0) === 0;
  },

  async getProjectAccessRequests({ projectId = null, requesterId = null, status = null } = {}) {
    let q = this._sb().from('wt_project_access_requests').select('*').order('created_at', { ascending: false });
    if (projectId != null) q = q.eq('project_id', Number(projectId));
    if (requesterId != null) q = q.eq('requester_id', Number(requesterId));
    if (status != null) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) {
      const msg = `${error.code || ''} ${error.message || ''} ${error.details || ''}`.toLowerCase();
      if (msg.includes('does not exist') || msg.includes('schema cache')) return [];
      throw error;
    }
    return (data || []).map(r => this._mapProjectAccessRequest(r));
  },

  async requestProjectAccess({ projectId, requesterId, message = '' }) {
    const payload = {
      project_id: Number(projectId),
      requester_id: Number(requesterId),
      message: message || '',
      status: 'pending',
      decided_by: null,
      decided_at: null,
      updated_at: new Date().toISOString()
    };
    const { data: existing, error: findError } = await this._sb()
      .from('wt_project_access_requests')
      .select('id')
      .eq('project_id', payload.project_id)
      .eq('requester_id', payload.requester_id)
      .maybeSingle();
    if (findError) throw findError;
    const query = existing
      ? this._sb().from('wt_project_access_requests').update(payload).eq('id', existing.id).select().single()
      : this._sb().from('wt_project_access_requests').insert(payload).select().single();
    const { data, error } = await query;
    if (error) throw error;
    return data?.id;
  },

  async respondProjectAccess(requestId, { status, decidedBy }) {
    const { data: req, error: getError } = await this._sb().from('wt_project_access_requests').select('*').eq('id', Number(requestId)).maybeSingle();
    if (getError) throw getError;
    if (!req) throw new Error('Request not found');
    const now = new Date().toISOString();
    const { error } = await this._sb().from('wt_project_access_requests').update({
      status, decided_by: decidedBy || null, decided_at: now, updated_at: now
    }).eq('id', req.id);
    if (error) throw error;
    if (status === 'approved') {
      const project = await this.getProject(req.project_id);
      const editorIds = new Set((project?.editorIds || []).map(Number));
      editorIds.add(Number(req.requester_id));
      await this.updateProject(req.project_id, { editorIds: [...editorIds] }, decidedBy);
    }
    return this._mapProjectAccessRequest(req);
  },

  async createBugReport({ userId, title, description, severity = 'normal', appVersion = '', githubIssueUrl = '', screenshots = [] }) {
    const payload = {
      user_id: Number(userId),
      title: title || '',
      description: description || '',
      severity: severity || 'normal',
      app_version: appVersion || '',
      screenshots: Array.isArray(screenshots) ? screenshots.slice(0, 3) : [],
      status: githubIssueUrl ? 'sent' : 'open',
      github_issue_url: githubIssueUrl || ''
    };
    const { data, error } = await this._sb().from('wt_bug_reports').insert(payload).select().single();
    if (error) throw error;
    try {
      await this._sb().functions.invoke('report-bug', { body: { bugReportId: data.id } });
    } catch (_) { /* Optional edge function; admins still receive the in-app report. */ }
    return data?.id;
  },

  async getBugReports({ limit = 100 } = {}) {
    const { data, error } = await this._sb().from('wt_bug_reports').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) {
      const msg = `${error.code || ''} ${error.message || ''} ${error.details || ''}`.toLowerCase();
      if (msg.includes('does not exist') || msg.includes('schema cache')) return [];
      throw error;
    }
    return (data || []).map(r => this._mapBugReport(r));
  },

  async updateBugReport(id, patch = {}) {
    const payload = { updated_at: new Date().toISOString() };
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.githubIssueUrl !== undefined) payload.github_issue_url = patch.githubIssueUrl || '';
    if (patch.resolutionNote !== undefined) payload.resolution_note = patch.resolutionNote || '';
    if (patch.severity !== undefined) payload.severity = patch.severity;
    const { data, error } = await this._sb().from('wt_bug_reports').update(payload).eq('id', Number(id)).select().single();
    if (error) throw error;
    return this._mapBugReport(data);
  },

  /* Notifications */
  async createNotification({ userId, type, entityType = null, entityId = null, projectId = null, message = '', actorUserId = null }) {
    if (!userId) return;
    const { data, error } = await this._sb().from('wt_notifications').insert({
      user_id: userId, type: type || 'info', entity_type: entityType, entity_id: entityId,
      project_id: projectId, message, actor_user_id: actorUserId
    }).select().single();
    if (error) throw error;
    return data?.id;
  },
  async getNotifications(userId, { unreadOnly = false, limit = 50 } = {}) {
    let q = this._sb().from('wt_notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
    if (unreadOnly) q = q.is('read_at', null);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(r => this._mapNotification(r));
  },
  async getUnreadNotificationCount(userId) {
    const { count, error } = await this._sb().from('wt_notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).is('read_at', null);
    if (error) throw error;
    return count || 0;
  },
  async markNotificationRead(id) {
    const { error } = await this._sb().from('wt_notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
  async markAllNotificationsRead(userId) {
    const { error } = await this._sb().from('wt_notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null);
    if (error) throw error;
  },

  /* Webhooks */
  async getWebhooks() {
    const { data, error } = await this._sb().from('wt_webhooks').select('*');
    if (error) throw error;
    return (data || []).map(r => this._mapWebhook(r));
  },
  async getGeneralWebhook() {
    const { data, error } = await this._sb().from('wt_webhooks').select('*').eq('scope', 'general').maybeSingle();
    if (error) throw error;
    return this._mapWebhook(data);
  },
  async getProjectWebhook(projectId) {
    const { data, error } = await this._sb().from('wt_webhooks').select('*').eq('scope', 'project').eq('project_id', projectId).maybeSingle();
    if (error) throw error;
    return this._mapWebhook(data);
  },
  async saveGeneralWebhook({ url, channelUrl = '' }) {
    url = String(url || '').trim();
    const existing = await this.getGeneralWebhook();
    if (existing) {
      const { error } = await this._sb().from('wt_webhooks').update({ url, channel_url: channelUrl, updated_at: new Date().toISOString() }).eq('id', existing.id);
      if (error) throw error;
      return existing.id;
    }
    const { data, error } = await this._sb().from('wt_webhooks').insert({ scope: 'general', name: '#general', url, channel_url: channelUrl }).select().single();
    if (error) throw error;
    return data?.id;
  },
  async saveProjectWebhook(projectId, { url, channelUrl = '', name = '' }) {
    url = String(url || '').trim();
    const existing = await this.getProjectWebhook(projectId);
    if (existing) {
      const { error } = await this._sb().from('wt_webhooks').update({ url, channel_url: channelUrl, name: name || existing.name, updated_at: new Date().toISOString() }).eq('id', existing.id);
      if (error) throw error;
      return existing.id;
    }
    const { data, error } = await this._sb().from('wt_webhooks').insert({ scope: 'project', project_id: projectId, name: name || `#project-${projectId}`, url, channel_url: channelUrl }).select().single();
    if (error) throw error;
    return data?.id;
  },
  async deleteWebhook(id) {
    const { error } = await this._sb().from('wt_webhooks').delete().eq('id', id);
    if (error) throw error;
  },

  async touchLastSeen(userId, ip = null) {
    if (!userId) return;
    const patch = { last_seen_at: new Date().toISOString() };
    if (ip) patch.last_seen_ip = ip;
    await this._sb().from('wt_users').update(patch).eq('id', userId);
  },

  async recordLoginSession(userId, { deviceId = '', deviceLabel = '', userAgent = '', ip = '' } = {}) {
    if (!userId || !deviceId) return;
    const now = new Date().toISOString();
    const { data: existing, error: readErr } = await this._sb()
      .from('wt_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .maybeSingle();
    if (readErr) throw readErr;
    if (existing) {
      const { error } = await this._sb().from('wt_sessions').update({
        device_label: deviceLabel,
        user_agent: userAgent,
        ip: ip || existing.ip || '',
        last_seen_at: now,
        login_count: (existing.login_count || 0) + 1
      }).eq('id', existing.id);
      if (error) throw error;
      return existing.id;
    }
    const { data, error } = await this._sb().from('wt_sessions').insert({
      user_id: userId,
      device_id: deviceId,
      device_label: deviceLabel,
      user_agent: userAgent,
      ip,
      first_seen_at: now,
      last_seen_at: now,
      login_count: 1
    }).select('id').single();
    if (error) throw error;
    return data?.id;
  },

  async getUserSessions(userId = null) {
    let q = this._sb().from('wt_sessions').select('*').order('last_seen_at', { ascending: false });
    if (userId != null) q = q.eq('user_id', userId);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map(r => this._mapSession(r));
  },

  async migrateFromLocalStorage() { return false; },

  async _clearTable(table) {
    const { error } = await this._sb().from(table).delete().gte('id', 0);
    if (error) throw error;
  },

  async _clearSettings() {
    const { error } = await this._sb().from('wt_settings').delete().neq('key', '');
    if (error) throw error;
  },

  async exportAll() {
    const sb = this._sb();
    const [
      projects, tasks, milestones, updates, users, activityLog, notifications, webhooks, sessions, projectAccessRequests, bugReports, classrooms,
      { data: userClassroomsRows, error: ucErr }, { data: directMessageRows, error: dmErr },
      { data: attRows, error: attErr }, { data: settingsRows, error: sErr }
    ] = await Promise.all([
      this.getProjects(), this.getTasks(),
      sb.from('wt_milestones').select('*').then(({ data, error }) => { if (error) throw error; return (data || []).map(r => this._mapMilestone(r)); }),
      sb.from('wt_updates').select('*').then(({ data, error }) => { if (error) throw error; return (data || []).map(r => this._mapUpdate(r)); }),
      this.getUsers(), this.getActivityLog({}),
      sb.from('wt_notifications').select('*').then(({ data, error }) => { if (error) throw error; return (data || []).map(r => this._mapNotification(r)); }),
      this.getWebhooks(),
      this.getUserSessions(),
      this.getProjectAccessRequests(),
      this.getBugReports({ limit: 1000 }),
      this.getClassrooms(),
      sb.from('wt_user_classrooms').select('*'),
      sb.from('wt_direct_messages').select('*'),
      sb.from('wt_attachments').select('*'),
      sb.from('wt_settings').select('*')
    ]);
    if (attErr) throw attErr;
    if (sErr) throw sErr;
    if (ucErr) throw ucErr;
    if (dmErr) throw dmErr;
    const safeUsers = users.map(u => ({
      id: u.id, username: u.username, displayName: u.displayName, email: u.email || '',
      role: u.role, department: u.department || '', createdAt: u.createdAt,
      discordId: u.discordId || '', color: u.color || '', bio: u.bio || '', avatarBase64: u.avatarBase64 || '',
      passwordHash: u.passwordHash, salt: u.salt
    }));
    const settings = (settingsRows || []).map(s => ({
      key: s.key, passwordHash: s.password_hash, salt: s.salt
    }));
    const attOut = [];
    for (const row of attRows || []) {
      const a = this._mapAttachment(row);
      const full = await this.getAttachment(a.id);
      if (!full?.blob) continue;
      attOut.push({
        id: a.id, projectId: a.projectId, taskId: a.taskId || null, uploadedBy: a.uploadedBy, fileName: a.fileName,
        mimeType: a.mimeType, documentType: a.documentType || '', createdAt: a.createdAt,
        dataBase64: await this.blobToBase64(full.blob)
      });
    }
    const userClassrooms = (userClassroomsRows || []).map(r => ({
      id: r.id, userId: r.user_id, classroomId: r.classroom_id, createdAt: r.created_at
    }));
    const directMessages = (directMessageRows || []).map(r => ({
      id: r.id, fromUserId: r.from_user_id, toUserId: r.to_user_id,
      content: r.content || '', createdAt: r.created_at, syncedAt: r.synced_at || ''
    }));
    return {
      version: 12, exportedAt: new Date().toISOString(),
      projects, tasks, milestones, updates, users: safeUsers, settings, attachments: attOut,
      activityLog, notifications, webhooks, sessions, projectAccessRequests, bugReports,
      classrooms, userClassrooms, directMessages
    };
  },

  async _importUsersFromBackup(users = []) {
    const sb = this._sb();
    const userIdMap = new Map();
    const needsPasswordReset = [];
    const existing = await this.getUsers();
    const byUsername = new Map(existing.map(u => [u.username.toLowerCase(), u]));

    for (const u of users) {
      const uname = (u.username || '').trim().toLowerCase();
      if (!uname) continue;
      const found = byUsername.get(uname);
      if (found) {
        userIdMap.set(u.id, found.id);
        continue;
      }

      const salt = u.salt || window.WT_CRYPTO.generateSalt();
      let passwordHash = u.passwordHash;
      if (!passwordHash || !u.salt) {
        passwordHash = await window.WT_CRYPTO.hashPassword(`import-reset-${u.id}`, salt);
        needsPasswordReset.push(uname);
      }

      const row = {
        username: uname,
        display_name: u.displayName || u.username,
        email: u.email || '',
        password_hash: passwordHash,
        salt,
        role: u.role || 'user',
        department: u.department || '',
        discord_id: u.discordId || '',
        color: u.color || '',
        bio: u.bio || '',
        avatar_base64: u.avatarBase64 || '',
        created_at: u.createdAt || new Date().toISOString()
      };
      if (u.id != null) row.id = u.id;

      const { data: inserted, error } = await sb.from('wt_users').insert(row).select('id,username').single();
      if (error) throw error;
      userIdMap.set(u.id, inserted.id);
      byUsername.set(uname, { id: inserted.id, username: inserted.username });
    }

    return { userIdMap, needsPasswordReset };
  },

  _mapImportUserId(userIdMap, id) {
    if (id == null) return null;
    return userIdMap.has(id) ? userIdMap.get(id) : id;
  },

  async importAll(data) {
    const sb = this._sb();
    const { userIdMap, needsPasswordReset } = await this._importUsersFromBackup(data.users || []);
    const mapUid = (id) => this._mapImportUserId(userIdMap, id);
    const validUserIds = new Set((await this.getUsers()).map(u => u.id));
    const validProjectIds = new Set((data.projects || []).map(p => p.id));

    const tables = [
      'wt_sessions', 'wt_webhooks', 'wt_direct_messages', 'wt_user_classrooms', 'wt_bug_reports', 'wt_project_access_requests', 'wt_notifications', 'wt_activity_log', 'wt_attachments',
      'wt_updates', 'wt_tasks', 'wt_milestones', 'wt_projects', 'wt_classrooms'
    ];
    for (const table of tables) await this._clearTable(table);

    const replaceSettings = Object.prototype.hasOwnProperty.call(data, 'settings');
    if (replaceSettings) await this._clearSettings();

    if (data.classrooms?.length) {
      const { error } = await sb.from('wt_classrooms').insert(data.classrooms.map(c => ({
        id: c.id,
        name: c.name || 'Classroom',
        description: c.description || '',
        color: c.color || '#4f46e5',
        created_at: c.createdAt || new Date().toISOString(),
        updated_at: c.updatedAt || new Date().toISOString()
      })));
      if (error) throw error;
    } else {
      await this.ensureDefaultClassroom();
    }
    const validClassroomIds = new Set((await this.getClassrooms()).map(c => c.id));

    if (data.projects?.length) {
      const { error } = await sb.from('wt_projects').insert(data.projects.map(p => ({
        id: p.id, name: p.name || '', notes: p.notes || '', type: p.type || 'project',
        status: p.status || 'active', priority: p.priority || 'medium',
        owner_id: mapUid(p.ownerId) ?? p.ownerId,
        classroom_id: validClassroomIds.has(Number(p.classroomId)) ? Number(p.classroomId) : null,
        department: p.department || '',
        workflow_template: p.workflowTemplate || '',
        completed_at: p.completedAt || null,
        is_ongoing: !!p.isOngoing,
        cadence: p.cadence || '',
        editor_ids: Array.isArray(p.editorIds) ? p.editorIds.map(mapUid).filter(Boolean) : [],
        created_at: p.createdAt, updated_at: p.updatedAt
      })));
      if (error) throw error;
    }
    if (data.milestones?.length) {
      const { error } = await sb.from('wt_milestones').insert(data.milestones.map(m => ({
        id: m.id, project_id: m.projectId, title: m.title || '', due_date: m.dueDate || '',
        status: m.status || 'pending', weight: m.weight ?? 1, created_at: m.createdAt
      })));
      if (error) throw error;
    }
    if (data.tasks?.length) {
      const { error } = await sb.from('wt_tasks').insert(data.tasks.map(t => ({
        id: t.id, project_id: t.projectId, milestone_id: t.milestoneId ?? null,
        assignee_id: t.assigneeId != null ? mapUid(t.assigneeId) : null,
        workflow_step_key: t.workflowStepKey || '',
        title: t.title || '', due_date: t.dueDate || '', status: t.status || 'todo',
        priority: t.priority || 'medium', created_at: t.createdAt, updated_at: t.updatedAt
      })));
      if (error) throw error;
    }
    if (data.updates?.length) {
      const rows = data.updates
        .filter(u => validProjectIds.has(u.projectId))
        .map(u => ({
          id: u.id, project_id: u.projectId,
          user_id: u.userId != null ? mapUid(u.userId) : null,
          content: u.content || '', created_at: u.createdAt
        }))
        .filter(u => u.user_id == null || validUserIds.has(u.user_id));
      if (rows.length) {
        const { error } = await sb.from('wt_updates').insert(rows);
        if (error) throw error;
      }
    }
    if (data.activityLog?.length) {
      const rows = data.activityLog
        .map(a => ({
          id: a.id, user_id: mapUid(a.userId), project_id: a.projectId ?? null,
          action: a.action, entity_type: a.entityType || 'system',
          entity_id: a.entityType === 'user' && a.entityId != null ? mapUid(a.entityId) : (a.entityId ?? null),
          details: a.details || '', created_at: a.createdAt
        }))
        .filter(a => validUserIds.has(a.user_id));
      if (rows.length) {
        const { error } = await sb.from('wt_activity_log').insert(rows);
        if (error) throw error;
      }
    }
    if (data.notifications?.length) {
      const rows = data.notifications
        .map(n => ({
          id: n.id, user_id: mapUid(n.userId), actor_user_id: n.actorUserId != null ? mapUid(n.actorUserId) : null,
          type: n.type || 'info', entity_type: n.entityType ?? null, entity_id: n.entityId ?? null,
          project_id: n.projectId ?? null, message: n.message || '',
          read_at: n.readAt ?? null, created_at: n.createdAt
        }))
        .filter(n => validUserIds.has(n.user_id));
      if (rows.length) {
        const { error } = await sb.from('wt_notifications').insert(rows);
        if (error) throw error;
      }
    }
    if (data.webhooks?.length) {
      const { error } = await sb.from('wt_webhooks').insert(data.webhooks.map(w => ({
        id: w.id, scope: w.scope, project_id: w.projectId ?? null, name: w.name || '',
        url: w.url, channel_url: w.channelUrl || '',
        created_at: w.createdAt, updated_at: w.updatedAt
      })));
      if (error) throw error;
    }
    if (data.sessions?.length) {
      const rows = data.sessions
        .map(s => ({
          id: s.id,
          user_id: mapUid(s.userId),
          device_id: s.deviceId || '',
          device_label: s.deviceLabel || '',
          user_agent: s.userAgent || '',
          ip: s.ip || '',
          first_seen_at: s.firstSeenAt || new Date().toISOString(),
          last_seen_at: s.lastSeenAt || new Date().toISOString(),
          login_count: s.loginCount || 1
        }))
        .filter(s => validUserIds.has(s.user_id) && s.device_id);
      if (rows.length) {
        const { error } = await sb.from('wt_sessions').insert(rows);
        if (error) throw error;
      }
    }
    if (data.projectAccessRequests?.length) {
      const rows = data.projectAccessRequests
        .map(r => ({
          id: r.id,
          project_id: r.projectId,
          requester_id: mapUid(r.requesterId),
          message: r.message || '',
          status: r.status || 'pending',
          decided_by: r.decidedBy != null ? mapUid(r.decidedBy) : null,
          decided_at: r.decidedAt || null,
          created_at: r.createdAt || new Date().toISOString(),
          updated_at: r.updatedAt || new Date().toISOString()
        }))
        .filter(r => validProjectIds.has(r.project_id) && validUserIds.has(r.requester_id));
      if (rows.length) {
        const { error } = await sb.from('wt_project_access_requests').insert(rows);
        if (error) throw error;
      }
    }
    if (data.bugReports?.length) {
      const rows = data.bugReports
        .map(r => ({
          id: r.id,
          user_id: r.userId != null ? mapUid(r.userId) : null,
          title: r.title || '',
          description: r.description || '',
          severity: r.severity || 'normal',
          app_version: r.appVersion || '',
          screenshots: Array.isArray(r.screenshots) ? r.screenshots : [],
          status: r.status || 'open',
          github_issue_url: r.githubIssueUrl || '',
          created_at: r.createdAt || new Date().toISOString(),
          updated_at: r.updatedAt || new Date().toISOString()
        }))
        .filter(r => r.user_id == null || validUserIds.has(r.user_id));
      if (rows.length) {
        const { error } = await sb.from('wt_bug_reports').insert(rows);
        if (error) throw error;
      }
    }
    if (data.userClassrooms?.length) {
      const rows = data.userClassrooms
        .map(r => ({
          id: r.id,
          user_id: mapUid(r.userId),
          classroom_id: Number(r.classroomId),
          created_at: r.createdAt || new Date().toISOString()
        }))
        .filter(r => validUserIds.has(r.user_id) && validClassroomIds.has(r.classroom_id));
      if (rows.length) {
        const { error } = await sb.from('wt_user_classrooms').insert(rows);
        if (error) throw error;
      }
    }
    if (data.directMessages?.length) {
      const rows = data.directMessages
        .map(m => ({
          id: m.id,
          from_user_id: mapUid(m.fromUserId),
          to_user_id: mapUid(m.toUserId),
          content: m.content || '',
          created_at: m.createdAt || new Date().toISOString(),
          synced_at: m.syncedAt || new Date().toISOString()
        }))
        .filter(m => validUserIds.has(m.from_user_id) && validUserIds.has(m.to_user_id));
      if (rows.length) {
        const { error } = await sb.from('wt_direct_messages').insert(rows);
        if (error) throw error;
      }
    }
    if (replaceSettings && data.settings?.length) {
      for (const s of data.settings) {
        if (s.key === 'masterKey' && s.passwordHash && s.salt) {
          const { error } = await sb.from('wt_settings').upsert({
            key: 'masterKey', password_hash: s.passwordHash, salt: s.salt
          });
          if (error) throw error;
        }
      }
    }
    let attachmentsImported = 0;
    if (data.attachments?.length) {
      for (const a of data.attachments) {
        if (!a.dataBase64) continue;
        const blob = this.base64ToBlob(a.dataBase64, a.mimeType);
        const uploadedBy = mapUid(a.uploadedBy);
        if (!validUserIds.has(uploadedBy)) continue;
        await this.addAttachment({
          projectId: a.projectId, uploadedBy, fileName: a.fileName,
          mimeType: a.mimeType, documentType: a.documentType || '', taskId: a.taskId || null, blob
        });
        attachmentsImported++;
      }
    }

    await this._resetIdSequences();

    return {
      needsPasswordReset,
      attachmentsSkipped: (data.attachments?.length || 0) - attachmentsImported
    };
  },

  _mapCalendarEvent(r) {
    if (!r) return null;
    return {
      id: r.id, title: r.title || '', description: r.description || '',
      startsAt: r.starts_at, endsAt: r.ends_at || null, allDay: !!r.all_day,
      createdBy: r.created_by, visibility: r.visibility || 'team',
      classroomId: r.classroom_id || null, relatedProjectId: r.related_project_id || null,
      relatedTaskId: r.related_task_id || null, createdAt: r.created_at
    };
  },

  async getCalendarEvents({ from, to } = {}) {
    if (this._isOffline()) return this._shadowRows('calendarEvents') || [];
    let q = this._sb().from('wt_calendar_events').select('*').order('starts_at');
    if (from) q = q.gte('starts_at', from);
    if (to) q = q.lte('starts_at', to);
    const { data, error } = await q;
    if (error) {
      if (this._isMissingColumn(error) || this._isMissingTable(error)) return LocalDB.getCalendarEvents({ from, to });
      throw error;
    }
    const rows = (data || []).map(r => this._mapCalendarEvent(r));
    this._shadowSetCollection('calendarEvents', rows);
    return rows;
  },

  async createCalendarEvent(data, actorUserId = null) {
    const id = await LocalDB.createCalendarEvent(data, actorUserId);
    if (this._isOffline()) return id;
    try {
      const { data: row, error } = await this._sb().from('wt_calendar_events').insert({
        title: data.title || 'Event', description: data.description || '',
        starts_at: data.startsAt, ends_at: data.endsAt || null, all_day: !!data.allDay,
        created_by: data.createdBy || actorUserId || null, visibility: data.visibility || 'team',
        classroom_id: data.classroomId || null, related_project_id: data.relatedProjectId || null,
        related_task_id: data.relatedTaskId || null
      }).select().single();
      if (error) throw error;
      return row?.id || id;
    } catch (err) {
      if (this._isMissingTable(err)) return id;
      throw err;
    }
  },

  async deleteCalendarEvent(id, actorUserId = null) {
    await LocalDB.deleteCalendarEvent(id, actorUserId);
    if (this._isOffline()) return;
    const { error } = await this._sb().from('wt_calendar_events').delete().eq('id', id);
    if (error && !this._isMissingTable(error)) throw error;
  },

  async createSampleData(ownerId) {
    const jobId = await this.createProject({ name: 'Job Search', notes: 'Track applications, resume updates, and follow-ups.', type: 'job-search', priority: 'high', ownerId });
    await this.createTask({ projectId: jobId, title: 'Update resume with latest experience', status: 'doing', priority: 'high' });
    await this.createTask({ projectId: jobId, title: 'Apply to 5 frontend developer roles', status: 'todo', priority: 'high', dueDate: '2026-05-20' });
    await this.createUpdate({ projectId: jobId, content: 'Started updating resume.' });
  }
};

// Expose the Supabase adapter globally. SyncEngine and app.js reference
// window.SupabaseDB; without this assignment it is undefined, which makes
// SyncEngine.init() throw immediately (window.SupabaseDB._client = ...) and
// silently disables all cloud sync.
window.SupabaseDB = SupabaseDB;
