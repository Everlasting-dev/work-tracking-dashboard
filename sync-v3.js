/* sync-v3.js - v3 Supabase bridge for the current WorkTracker UI.
 *
 * This is intentionally a compatibility layer. The current UI still expects
 * local numeric IDs from Dexie, while the v3 schema uses UUIDs. This bridge
 * maps UUIDs to stable local IDs, hydrates LocalDB, and mirrors core writes
 * back to Supabase v3 tables.
 */

const SyncEngineV3 = (() => {
  const MAP_KEY = 'wt-v3-id-map-v1';
  const PULL_KEY = 'wt-v3-last-pull-at';
  const WORKSPACE_KEY = 'wt-v3-workspace-id';
  const BUCKET = 'worktracker-documents';

  let _client = null;
  let _maps = null;
  let _initDone = false;
  let _syncing = false;
  let _lastError = '';
  let _wrapped = false;
  let _currentProfileUuid = null;

  const TABLES = ['profiles', 'projects', 'tasks', 'updates', 'documents', 'notifications', 'activity', 'templates'];

  function _emptyMaps() {
    const maps = {};
    for (const table of TABLES) maps[table] = { uuidToLocal: {}, localToUuid: {}, next: 1 };
    return maps;
  }

  function _loadMaps() {
    if (_maps) return _maps;
    try {
      const raw = localStorage.getItem(MAP_KEY);
      _maps = raw ? JSON.parse(raw) : _emptyMaps();
    } catch (_) {
      _maps = _emptyMaps();
    }
    for (const table of TABLES) {
      if (!_maps[table]) _maps[table] = { uuidToLocal: {}, localToUuid: {}, next: 1 };
      if (!_maps[table].uuidToLocal) _maps[table].uuidToLocal = {};
      if (!_maps[table].localToUuid) _maps[table].localToUuid = {};
      if (!_maps[table].next) _maps[table].next = 1;
    }
    return _maps;
  }

  function _saveMaps() {
    try { localStorage.setItem(MAP_KEY, JSON.stringify(_maps || _emptyMaps())); } catch (_) {}
  }

  function _localId(table, uuid) {
    if (!uuid) return null;
    const maps = _loadMaps();
    const bucket = maps[table] || (maps[table] = { uuidToLocal: {}, localToUuid: {}, next: 1 });
    if (bucket.uuidToLocal[uuid]) return Number(bucket.uuidToLocal[uuid]);
    const id = Number(bucket.next || 1);
    bucket.next = id + 1;
    bucket.uuidToLocal[uuid] = id;
    bucket.localToUuid[String(id)] = uuid;
    _saveMaps();
    return id;
  }

  function _uuid(table, localId) {
    if (localId == null) return null;
    return _loadMaps()[table]?.localToUuid?.[String(localId)] || null;
  }

  function _uuidOrValue(table, value) {
    if (value == null) return null;
    const mapped = _uuid(table, value);
    return mapped || value;
  }

  function _now() { return new Date().toISOString(); }

  function _safeText(value) {
    return value == null ? '' : String(value);
  }

  function _projectStatus(status) {
    if (['active', 'paused', 'completed', 'archived'].includes(status)) return status;
    if (status === 'on-hold') return 'paused';
    return status || 'active';
  }

  function _uiProjectStatus(status) {
    if (status === 'paused') return 'on-hold';
    return status || 'active';
  }

  function _taskStatus(status) {
    if (['todo', 'doing', 'blocked', 'done'].includes(status)) return status;
    return 'todo';
  }

  function _priority(priority) {
    if (['low', 'medium', 'high', 'urgent'].includes(priority)) return priority;
    return 'medium';
  }

  function _sb() { return _client; }

  function getClient() { return _client; }

  function _profileToLocal(row) {
    const id = _localId('profiles', row.id);
    return {
      id,
      username: row.username || row.email || `user-${id}`,
      displayName: row.display_name || row.username || row.email || `User ${id}`,
      email: row.email || '',
      passwordHash: '',
      salt: '',
      role: row.role || 'user',
      department: row.department || '',
      discordId: '',
      color: row.color || '#000000',
      bio: row.bio || '',
      birthDate: row.birth_date || '',
      gender: row.gender || '',
      phone: row.phone || '',
      address: row.address || '',
      hoursLoggedTotal: Number(row.hours_logged_total || 0),
      avatarBase64: '',
      avatarUrl: row.avatar_url || '',
      lastSeenAt: row.last_seen_at || null,
      lastSeenIp: null,
      loginCount: 1,
      createdAt: row.created_at || _now()
    };
  }

  function _projectToLocal(row, memberRows = []) {
    const id = _localId('projects', row.id);
    const ownerId = _localId('profiles', row.owner_id);
    const editorIds = memberRows
      .filter(m => m.project_id === row.id && m.user_id)
      .map(m => _localId('profiles', m.user_id))
      .filter(Boolean);
    return {
      id,
      name: row.name || 'Untitled project',
      notes: row.description || '',
      type: row.metadata?.type || 'project',
      status: _uiProjectStatus(row.status),
      priority: row.priority || 'medium',
      ownerId,
      editorIds: [...new Set(editorIds.filter(uid => uid !== ownerId))],
      department: row.department || '',
      classroomId: null,
      workflowTemplate: row.metadata?.workflowTemplate || '',
      isOngoing: !!row.metadata?.isOngoing,
      cadence: row.metadata?.cadence || '',
      completedAt: row.completed_at || null,
      createdAt: row.created_at || _now(),
      updatedAt: row.updated_at || row.created_at || _now()
    };
  }

  function _taskToLocal(row) {
    return {
      id: _localId('tasks', row.id),
      projectId: _localId('projects', row.project_id),
      title: row.title || 'Untitled task',
      notes: row.description || '',
      description: row.description || '',
      status: _taskStatus(row.status),
      priority: row.priority || 'medium',
      assigneeId: row.assignee_id ? _localId('profiles', row.assignee_id) : null,
      dueDate: row.due_date || '',
      sortOrder: row.sort_order || 0,
      progress: row.progress || 0,
      customFields: Array.isArray(row.custom_fields) ? row.custom_fields : [],
      workflowStepKey: row.custom_fields?.workflowStepKey || '',
      milestoneId: null,
      createdAt: row.created_at || _now(),
      updatedAt: row.updated_at || row.created_at || _now(),
      completedAt: row.completed_at || null
    };
  }

  function _updateToLocal(row) {
    return {
      id: _localId('updates', row.id),
      projectId: _localId('projects', row.project_id),
      userId: row.user_id ? _localId('profiles', row.user_id) : null,
      content: row.body || '',
      createdAt: row.created_at || _now()
    };
  }

  function _documentToLocal(row) {
    return {
      id: _localId('documents', row.id),
      projectId: _localId('projects', row.project_id),
      taskId: row.task_id ? _localId('tasks', row.task_id) : null,
      uploadedBy: row.uploaded_by ? _localId('profiles', row.uploaded_by) : null,
      fileName: row.file_name || 'file',
      mimeType: row.mime_type || 'application/octet-stream',
      documentType: row.document_type || '',
      storagePath: row.storage_path || '',
      size: row.size_bytes || 0,
      checksumSha256: row.checksum_sha256 || '',
      isHidden: !!row.is_hidden,
      deletedAt: row.deleted_at || null,
      deletedBy: row.deleted_by ? _localId('profiles', row.deleted_by) : null,
      deleteReason: row.delete_reason || '',
      createdAt: row.created_at || _now()
    };
  }

  function _templateToLocal(row) {
    return {
      id: _localId('templates', row.id),
      name: row.name || 'Untitled template',
      description: row.description || '',
      steps: Array.isArray(row.steps) ? row.steps : [],
      fields: Array.isArray(row.fields) ? row.fields : [],
      createdBy: row.created_by ? _localId('profiles', row.created_by) : null,
      createdAt: row.created_at || _now(),
      updatedAt: row.updated_at || row.created_at || _now()
    };
  }

  function _notificationToLocal(row) {
    return {
      id: _localId('notifications', row.id),
      userId: _localId('profiles', row.user_id),
      actorUserId: row.actor_user_id ? _localId('profiles', row.actor_user_id) : null,
      type: row.type || 'info',
      entityType: row.entity_type || '',
      entityId: row.entity_id || null,
      projectId: row.project_id ? _localId('projects', row.project_id) : null,
      message: row.message || '',
      readAt: row.read_at || null,
      createdAt: row.created_at || _now()
    };
  }

  function _activityToLocal(row) {
    return {
      id: _localId('activity', row.id),
      userId: row.user_id ? _localId('profiles', row.user_id) : null,
      projectId: row.project_id ? _localId('projects', row.project_id) : null,
      action: row.action || 'updated',
      entityType: row.entity_type || 'system',
      entityId: row.entity_id || null,
      details: row.details || '',
      createdAt: row.created_at || _now()
    };
  }

  async function _putAll(table, rows) {
    const db = window.LocalDB?.db;
    if (!db?.[table]) return;
    await db[table].bulkPut(rows || []);
  }

  async function _getWorkspaceId() {
    const saved = localStorage.getItem(WORKSPACE_KEY);
    if (saved) return saved;
    const { data, error } = await _sb().from('workspaces').select('id').order('created_at').limit(1);
    if (error) throw error;
    const id = data?.[0]?.id || null;
    if (id) localStorage.setItem(WORKSPACE_KEY, id);
    return id;
  }

  async function _currentUserUuid() {
    if (_currentProfileUuid) return _currentProfileUuid;
    const { data: authData, error: authError } = await _sb().auth.getUser();
    if (authError) throw authError;
    _currentProfileUuid = authData?.user?.id || null;
    return _currentProfileUuid;
  }

  async function pull() {
    if (!_client || _syncing) return false;
    _syncing = true;
    _lastError = '';
    try {
      const [
        profilesRes,
        membersRes,
        projectsRes,
        tasksRes,
        updatesRes,
        documentsRes,
        notificationsRes,
        activityRes,
        templatesRes
      ] = await Promise.all([
        _sb().from('profiles').select('*').order('created_at'),
        _sb().from('project_members').select('*'),
        _sb().from('projects').select('*').order('updated_at', { ascending: false }),
        _sb().from('tasks').select('*').order('sort_order'),
        _sb().from('project_updates').select('*').order('created_at', { ascending: false }),
        _sb().from('documents').select('*').order('created_at', { ascending: false }),
        _sb().from('notifications').select('*').order('created_at', { ascending: false }),
        _sb().from('activity_log').select('*').order('created_at', { ascending: false }).limit(1000),
        _sb().from('task_templates').select('*').order('name')
      ]);

      for (const result of [profilesRes, membersRes, projectsRes, tasksRes, updatesRes, documentsRes, notificationsRes, activityRes, templatesRes]) {
        if (result.error) throw result.error;
      }

      const memberRows = membersRes.data || [];
      await _putAll('users', (profilesRes.data || []).map(_profileToLocal));
      await _putAll('projects', (projectsRes.data || []).map(row => _projectToLocal(row, memberRows)));
      await _putAll('tasks', (tasksRes.data || []).map(_taskToLocal));
      await _putAll('updates', (updatesRes.data || []).map(_updateToLocal));
      await _putAll('attachments', (documentsRes.data || []).map(_documentToLocal));
      await _putAll('notifications', (notificationsRes.data || []).map(_notificationToLocal));
      await _putAll('activityLog', (activityRes.data || []).map(_activityToLocal));
      await _putAll('workflowTemplates', (templatesRes.data || []).map(_templateToLocal));
      localStorage.setItem(PULL_KEY, String(Date.now()));
      window.dispatchEvent(new CustomEvent('wt-v3-pull-complete'));
      window.dispatchEvent(new CustomEvent('wt-sync-pulled'));
      return true;
    } catch (err) {
      _lastError = err?.message || String(err);
      console.error('[SyncEngineV3] pull failed:', err);
      return false;
    } finally {
      _syncing = false;
    }
  }

  async function _insertActivity({ userId, projectId = null, action, entityType, entityId = null, details = '' }) {
    const payload = {
      user_id: userId ? _uuidOrValue('profiles', userId) : await _currentUserUuid(),
      project_id: projectId ? _uuidOrValue('projects', projectId) : null,
      entity_type: entityType || 'system',
      entity_id: null,
      action: action || 'updated',
      details: details || ''
    };
    const { error } = await _sb().from('activity_log').insert(payload);
    if (error) throw error;
  }

  async function _mirror(method, result, args) {
    const now = _now();
    // Drive mode owns attachments (project_files via DriveStorage); skip the
    // legacy v3 `documents` path so UUID ids don't collide with it.
    if (window.DriveStorage?.enabled?.() && (method === 'addAttachment' || method === 'deleteAttachment' || method === 'updateAttachment')) return;
    if (method === 'updateUser') {
      const [id, changes] = args;
      const uuid = _uuid('profiles', id);
      if (!uuid) return;
      const patch = { updated_at: now };
      if (changes.username != null) patch.username = String(changes.username).trim().toLowerCase();
      if (changes.displayName != null) patch.display_name = changes.displayName || '';
      if (changes.email != null) patch.email = changes.email || '';
      if (changes.role != null) patch.role = changes.role || 'user';
      if (changes.department != null) patch.department = changes.department || '';
      if (changes.color != null) patch.color = changes.color || '#000000';
      if (changes.bio != null) patch.bio = changes.bio || '';
      if (changes.avatarUrl != null) patch.avatar_url = changes.avatarUrl || '';
      if (changes.lastSeenAt != null) patch.last_seen_at = changes.lastSeenAt || null;
      if (changes.birthDate !== undefined) patch.birth_date = changes.birthDate || null;
      if (changes.gender !== undefined) patch.gender = changes.gender || '';
      if (changes.phone !== undefined) patch.phone = changes.phone || '';
      if (changes.address !== undefined) patch.address = changes.address || '';
      if (changes.hoursLoggedTotal !== undefined) patch.hours_logged_total = Number(changes.hoursLoggedTotal || 0);
      const { error } = await _sb().from('profiles').update(patch).eq('id', uuid);
      if (error) throw error;
    } else if (method === 'createProject') {
      const data = args[0] || {};
      const ownerUuid = _uuidOrValue('profiles', data.ownerId) || await _currentUserUuid();
      const workspaceId = await _getWorkspaceId();
      const payload = {
        workspace_id: workspaceId,
        name: data.name || 'Untitled project',
        description: data.notes || data.description || '',
        status: _projectStatus(data.status),
        priority: _priority(data.priority),
        owner_id: ownerUuid,
        department: data.department || '',
        metadata: {
          type: data.type || 'project',
          workflowTemplate: data.workflowTemplate || '',
          isOngoing: !!data.isOngoing,
          cadence: data.cadence || ''
        }
      };
      const { data: row, error } = await _sb().from('projects').insert(payload).select().single();
      if (error) throw error;
      _localId('projects', row.id);
      _maps.projects.uuidToLocal[row.id] = result;
      _maps.projects.localToUuid[String(result)] = row.id;
      _saveMaps();
      await _sb().from('project_members').upsert({ project_id: row.id, user_id: ownerUuid, access: 'owner' });
    } else if (method === 'updateProject') {
      const [id, changes] = args;
      const uuid = _uuid('projects', id);
      if (!uuid) return;
      const patch = { updated_at: now };
      if (changes.name != null) patch.name = changes.name;
      if (changes.notes != null || changes.description != null) patch.description = changes.notes ?? changes.description ?? '';
      if (changes.status != null) patch.status = _projectStatus(changes.status);
      if (changes.priority != null) patch.priority = _priority(changes.priority);
      if (changes.department != null) patch.department = changes.department;
      if (changes.completedAt !== undefined) patch.completed_at = changes.completedAt || null;
      const { error } = await _sb().from('projects').update(patch).eq('id', uuid);
      if (error) throw error;
    } else if (method === 'deleteProject') {
      const uuid = _uuid('projects', args[0]);
      if (uuid) {
        const { error } = await _sb().from('projects').delete().eq('id', uuid);
        if (error) throw error;
      }
    } else if (method === 'createTask') {
      const data = args[0] || {};
      const projectUuid = _uuid('projects', data.projectId);
      if (!projectUuid) return;
      const payload = {
        project_id: projectUuid,
        title: data.title || 'Untitled task',
        description: data.notes || data.description || '',
        status: _taskStatus(data.status),
        priority: _priority(data.priority),
        assignee_id: data.assigneeId ? _uuidOrValue('profiles', data.assigneeId) : null,
        due_date: data.dueDate || null,
        sort_order: data.sortOrder || 0,
        progress: data.status === 'done' ? 100 : 0,
        custom_fields: data.customFields || [],
        created_by: await _currentUserUuid()
      };
      const { data: row, error } = await _sb().from('tasks').insert(payload).select().single();
      if (error) throw error;
      _localId('tasks', row.id);
      _maps.tasks.uuidToLocal[row.id] = result;
      _maps.tasks.localToUuid[String(result)] = row.id;
      _saveMaps();
    } else if (method === 'updateTask') {
      const [id, changes] = args;
      const uuid = _uuid('tasks', id);
      if (!uuid) return;
      const patch = { updated_at: now };
      if (changes.title != null) patch.title = changes.title;
      if (changes.notes != null || changes.description != null) patch.description = changes.notes ?? changes.description ?? '';
      if (changes.status != null) {
        patch.status = _taskStatus(changes.status);
        patch.progress = changes.status === 'done' ? 100 : (changes.progress ?? undefined);
        patch.completed_at = changes.status === 'done' ? now : null;
      }
      if (changes.priority != null) patch.priority = _priority(changes.priority);
      if (changes.assigneeId !== undefined) patch.assignee_id = changes.assigneeId ? _uuidOrValue('profiles', changes.assigneeId) : null;
      if (changes.dueDate !== undefined) patch.due_date = changes.dueDate || null;
      if (changes.sortOrder !== undefined) patch.sort_order = changes.sortOrder || 0;
      if (changes.progress !== undefined && patch.progress === undefined) patch.progress = changes.progress || 0;
      if (changes.customFields !== undefined) patch.custom_fields = changes.customFields || [];
      Object.keys(patch).forEach(key => patch[key] === undefined && delete patch[key]);
      const { error } = await _sb().from('tasks').update(patch).eq('id', uuid);
      if (error) throw error;
    } else if (method === 'deleteTask') {
      const uuid = _uuid('tasks', args[0]);
      if (uuid) {
        const { error } = await _sb().from('tasks').delete().eq('id', uuid);
        if (error) throw error;
      }
    } else if (method === 'addAttachment') {
      const data = args[0] || {};
      const projectUuid = _uuid('projects', data.projectId);
      if (!projectUuid) return;
      const taskUuid = data.taskId ? _uuid('tasks', data.taskId) : null;
      const uploaderUuid = data.uploadedBy ? _uuidOrValue('profiles', data.uploadedBy) : await _currentUserUuid();
      const fileName = data.fileName || 'file';
      const safeName = fileName.replace(/[^\w.\-]+/g, '_');
      const path = `${projectUuid}/${Date.now()}_${safeName}`;
      if (data.blob) {
        const { error: uploadError } = await _sb().storage.from(BUCKET).upload(path, data.blob, {
          contentType: data.mimeType || 'application/octet-stream',
          upsert: true
        });
        if (uploadError) throw uploadError;
      }
      const { data: row, error } = await _sb().from('documents').insert({
        project_id: projectUuid,
        task_id: taskUuid,
        uploaded_by: uploaderUuid,
        file_name: fileName,
        mime_type: data.mimeType || 'application/octet-stream',
        document_type: data.documentType || '',
        storage_path: path,
        size_bytes: data.blob?.size || data.size || 0
      }).select().single();
      if (error) throw error;
      _localId('documents', row.id);
      _maps.documents.uuidToLocal[row.id] = result;
      _maps.documents.localToUuid[String(result)] = row.id;
      _saveMaps();
    } else if (method === 'deleteAttachment') {
      const uuid = _uuid('documents', args[0]);
      if (!uuid) return;
      const actorUuid = args[1] ? _uuidOrValue('profiles', args[1]) : await _currentUserUuid();
      const { error } = await _sb().from('documents').update({
        is_hidden: true,
        deleted_at: now,
        deleted_by: actorUuid,
        delete_reason: 'Removed from project view'
      }).eq('id', uuid);
      if (error) throw error;
    } else if (method === 'createUpdate') {
      const data = args[0] || {};
      const projectUuid = _uuid('projects', data.projectId);
      if (!projectUuid) return;
      const payload = {
        project_id: projectUuid,
        user_id: data.userId ? _uuidOrValue('profiles', data.userId) : await _currentUserUuid(),
        body: data.content || data.body || ''
      };
      const { data: row, error } = await _sb().from('project_updates').insert(payload).select().single();
      if (error) throw error;
      _maps.updates.uuidToLocal[row.id] = result;
      _maps.updates.localToUuid[String(result)] = row.id;
      _saveMaps();
    } else if (method === 'createWorkflowTemplate') {
      const data = args[0] || {};
      const workspaceId = await _getWorkspaceId();
      const { data: row, error } = await _sb().from('task_templates').insert({
        workspace_id: workspaceId,
        name: data.name || 'Untitled template',
        description: data.description || '',
        steps: data.steps || [],
        fields: data.fields || [],
        created_by: data.createdBy ? _uuidOrValue('profiles', data.createdBy) : await _currentUserUuid()
      }).select().single();
      if (error) throw error;
      _localId('templates', row.id);
      _maps.templates.uuidToLocal[row.id] = result;
      _maps.templates.localToUuid[String(result)] = row.id;
      _saveMaps();
    } else if (method === 'updateWorkflowTemplate') {
      const [id, changes] = args;
      const uuid = _uuid('templates', id);
      if (!uuid) return;
      const patch = { updated_at: now };
      if (changes.name != null) patch.name = changes.name || 'Untitled template';
      if (changes.description != null) patch.description = changes.description || '';
      if (changes.steps != null) patch.steps = changes.steps || [];
      if (changes.fields != null) patch.fields = changes.fields || [];
      const { error } = await _sb().from('task_templates').update(patch).eq('id', uuid);
      if (error) throw error;
    } else if (method === 'deleteWorkflowTemplate') {
      const uuid = _uuid('templates', args[0]);
      if (uuid) {
        const { error } = await _sb().from('task_templates').delete().eq('id', uuid);
        if (error) throw error;
      }
    } else if (method === 'logActivity') {
      await _insertActivity(args[0] || {});
    }
  }

  function _wrapLocalDB() {
    if (_wrapped || !window.LocalDB) return;
    _wrapped = true;
    for (const method of ['updateUser', 'createProject', 'updateProject', 'deleteProject', 'createTask', 'updateTask', 'deleteTask', 'addAttachment', 'deleteAttachment', 'createUpdate', 'createWorkflowTemplate', 'updateWorkflowTemplate', 'deleteWorkflowTemplate', 'logActivity']) {
      if (typeof window.LocalDB[method] !== 'function') continue;
      const original = window.LocalDB[method].bind(window.LocalDB);
      window.LocalDB[method] = async function (...args) {
        const result = await original(...args);
        _mirror(method, result, args).catch(err => {
          _lastError = err?.message || String(err);
          console.error(`[SyncEngineV3] mirror ${method} failed:`, err);
          window.dispatchEvent(new CustomEvent('wt-sync-status', { detail: getStatus() }));
        });
        return result;
      };
    }
  }

  async function signIn(identifier, password) {
    if (!_client) throw new Error('Supabase v3 is not initialized.');
    const raw = String(identifier || '').trim();
    const candidates = raw.includes('@') ? [raw] : [
      `${raw.toLowerCase()}@worktracker-migration.local`,
      `${raw.toLowerCase()}@worktracker.app`
    ];
    let auth = null;
    let lastError = null;
    for (const email of candidates) {
      const { data, error } = await _sb().auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        auth = data.user;
        break;
      }
      lastError = error;
    }
    if (!auth) throw new Error(lastError?.message || 'Invalid username/email or password');
    _currentProfileUuid = auth.id;
    await pull();
    const localId = _localId('profiles', auth.id);
    const user = await window.LocalDB.getUser(localId);
    if (!user) throw new Error('Signed in, but the profile was not found in v3.');
    return user;
  }

  async function signOut() {
    try { await _sb()?.auth.signOut(); } catch (_) {}
    _currentProfileUuid = null;
  }

  async function init(url, anonKey) {
    if (!window.supabase?.createClient) throw new Error('Supabase SDK not loaded');
    _client = window.supabase.createClient(url, anonKey);
    _loadMaps();
    _wrapLocalDB();
    _initDone = true;
    const { data } = await _client.auth.getSession().catch(() => ({ data: null }));
    if (data?.session?.user) {
      _currentProfileUuid = data.session.user.id;
      await pull();
    }
    return true;
  }

  function getStatus() {
    return {
      enabled: _initDone,
      pending: 0,
      failed: _lastError ? 1 : 0,
      syncing: _syncing,
      lastError: _lastError,
      lastPullAt: Number(localStorage.getItem(PULL_KEY) || 0)
    };
  }

  return { init, pull, signIn, signOut, getStatus, getClient };
})();

window.SyncEngineV3 = SyncEngineV3;
