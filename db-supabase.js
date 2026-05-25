/* Supabase backend — mirrors LocalDB API (see db.js) */

const SupabaseDB = {
  _client: null,
  BUCKET: 'project-files',

  async init(url, anonKey) {
    if (!window.supabase?.createClient) throw new Error('Supabase SDK not loaded');
    this._client = window.supabase.createClient(url, anonKey);
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
  },

  _sb() { return this._client; },

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

  _mapUser(r) {
    if (!r) return null;
    return {
      id: r.id, username: r.username, displayName: r.display_name, email: r.email || '',
      passwordHash: r.password_hash, salt: r.salt, role: r.role, createdAt: r.created_at,
      discordId: r.discord_id || '', color: r.color || '',
      lastSeenAt: r.last_seen_at || null, lastSeenIp: r.last_seen_ip || null
    };
  },

  _mapProject(r) {
    if (!r) return null;
    return {
      id: r.id, name: r.name, notes: r.notes, type: r.type, status: r.status, priority: r.priority,
      ownerId: r.owner_id, isOngoing: !!r.is_ongoing, cadence: r.cadence || '',
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
    return {
      id: r.id, projectId: r.project_id, milestoneId: r.milestone_id, assigneeId: r.assignee_id,
      title: r.title, dueDate: r.due_date || '', status: r.status, priority: r.priority,
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
      id: r.id, projectId: r.project_id, uploadedBy: r.uploaded_by, fileName: r.file_name,
      mimeType: r.mime_type, storagePath: r.storage_path, createdAt: r.created_at, blob
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
    if (!userId || !action) return;
    this._sb().from('wt_activity_log').insert({
      user_id: userId, project_id: projectId, action, entity_type: entityType || 'system',
      entity_id: entityId, details: details || ''
    }).then(({ error }) => { if (error) console.warn('activity log:', error.message); });
  },

  async getActivityLog(filters = {}) {
    let q = this._sb().from('wt_activity_log').select('*').order('created_at', { ascending: false });
    if (filters.projectId != null) q = q.eq('project_id', filters.projectId);
    if (filters.userId != null) q = q.eq('user_id', filters.userId);
    if (filters.limit != null) q = q.limit(filters.limit);
    const { data, error } = await q;
    if (error) throw error;
    let rows = (data || []).map(r => this._mapActivity(r));
    if (filters.viewerUserId != null && !filters.isAdmin) {
      rows = rows.filter(r => r.userId === filters.viewerUserId);
    }
    return rows;
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
      color: data.color || ''
    };
    let { data: row, error } = await this._sb().from('wt_users').insert(payload).select().single();
    if (error && this._isMissingColumn(error)) {
      delete payload.color;
      ({ data: row, error } = await this._sb().from('wt_users').insert(payload).select().single());
    }
    if (error) throw error;
    return row.id;
  },

  async getUser(id) {
    const { data, error } = await this._sb().from('wt_users').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return this._mapUser(data);
  },

  async getUserByUsername(username) {
    const { data, error } = await this._sb().from('wt_users').select('*').eq('username', username.toLowerCase()).maybeSingle();
    if (error) throw error;
    return this._mapUser(data);
  },

  async getUsers() {
    const { data, error } = await this._sb().from('wt_users').select('*').order('id');
    if (error) throw error;
    return (data || []).map(r => this._mapUser(r));
  },

  async updateUser(id, changes, actorUserId = null) {
    const patch = {};
    if (changes.displayName != null) patch.display_name = changes.displayName;
    if (changes.email != null) patch.email = changes.email;
    if (changes.role != null) patch.role = changes.role;
    if (changes.discordId != null) patch.discord_id = changes.discordId;
    if (changes.color != null) patch.color = changes.color;
    if (changes.lastSeenAt != null) patch.last_seen_at = changes.lastSeenAt;
    if (changes.lastSeenIp != null) patch.last_seen_ip = changes.lastSeenIp;
    if (changes.username != null) {
      const next = String(changes.username).trim().toLowerCase();
      if (!next) throw new Error('Username cannot be empty');
      const { data: conflict } = await this._sb().from('wt_users').select('id').eq('username', next).maybeSingle();
      if (conflict && conflict.id !== id) throw new Error('Username already taken');
      patch.username = next;
    }
    let { error } = await this._sb().from('wt_users').update(patch).eq('id', id);
    if (error && patch.color != null && this._isMissingColumn(error)) {
      delete patch.color;
      ({ error } = await this._sb().from('wt_users').update(patch).eq('id', id));
    }
    if (error) throw error;
    const fieldLabels = { display_name: 'display name', email: 'email', role: 'role', discord_id: 'Discord ID', color: 'color', username: 'username' };
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
    const id = await this._nextTableId('wt_projects');
    const payload = {
      id, name: data.name || '', notes: data.notes || '', type: data.type || 'project',
      status: data.status || 'active', priority: data.priority || 'medium',
      owner_id: data.ownerId ?? actorUserId ?? 1,
      is_ongoing: !!data.isOngoing,
      cadence: data.cadence || ''
    };
    let { data: row, error } = await this._sb().from('wt_projects').insert(payload).select().single();
    if (error && this._isMissingColumn(error)) {
      delete payload.is_ongoing;
      delete payload.cadence;
      ({ data: row, error } = await this._sb().from('wt_projects').insert(payload).select().single());
    }
    if (error) throw error;
    if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: row.id, action: 'created', entityType: 'project', entityId: row.id, details: row.name });
    return row.id;
  },

  async getProjects() {
    const { data, error } = await this._sb().from('wt_projects').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => this._mapProject(r));
  },

  async getProject(id) {
    const { data, error } = await this._sb().from('wt_projects').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return this._mapProject(data);
  },

  async updateProject(id, changes, actorUserId = null) {
    const patch = { updated_at: new Date().toISOString() };
    if (changes.name != null) patch.name = changes.name;
    if (changes.notes != null) patch.notes = changes.notes;
    if (changes.type != null) patch.type = changes.type;
    if (changes.status != null) patch.status = changes.status;
    if (changes.priority != null) patch.priority = changes.priority;
    if (changes.isOngoing != null) patch.is_ongoing = !!changes.isOngoing;
    if (changes.cadence != null) patch.cadence = changes.cadence || '';
    let { error } = await this._sb().from('wt_projects').update(patch).eq('id', id);
    if (error && this._isMissingColumn(error) && (patch.is_ongoing != null || patch.cadence != null)) {
      delete patch.is_ongoing;
      delete patch.cadence;
      ({ error } = await this._sb().from('wt_projects').update(patch).eq('id', id));
    }
    if (error) throw error;
    if (actorUserId) {
      const p = await this.getProject(id);
      await this.logActivity({ userId: actorUserId, projectId: id, action: 'updated', entityType: 'project', entityId: id, details: p?.name || '' });
    }
    return id;
  },

  async deleteProject(id, actorUserId = null) {
    const p = await this.getProject(id);
    const { error } = await this._sb().from('wt_projects').delete().eq('id', id);
    if (error) throw error;
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
      project_id: data.projectId, uploaded_by: data.uploadedBy, file_name: fileName,
      mime_type: data.mimeType || 'application/octet-stream', storage_path: path
    }).select().single();
    if (error) throw error;
    await this._sb().from('wt_projects').update({ updated_at: new Date().toISOString() }).eq('id', data.projectId);
    if (data.uploadedBy) await this.logActivity({ userId: data.uploadedBy, projectId: data.projectId, action: 'uploaded', entityType: 'attachment', entityId: row.id, details: fileName });
    return row.id;
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
    const id = await this._nextTableId('wt_tasks');
    const { data: row, error } = await this._sb().from('wt_tasks').insert({
      id, project_id: data.projectId, milestone_id: data.milestoneId || null, assignee_id: assigneeId,
      title: data.title || '', due_date: data.dueDate || '', status: data.status || 'todo',
      priority: data.priority || 'medium'
    }).select().single();
    if (error) throw error;
    await this._sb().from('wt_projects').update({ updated_at: new Date().toISOString() }).eq('id', data.projectId);
    if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: data.projectId, action: 'created', entityType: 'task', entityId: row.id, details: row.title });
    return row.id;
  },

  async getTasks(filter = {}) {
    let q = this._sb().from('wt_tasks').select('*');
    if (filter.projectId) q = q.eq('project_id', filter.projectId);
    if (filter.status) q = q.eq('status', filter.status);
    const { data, error } = await q.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => this._mapTask(r));
  },

  async getTask(id) {
    const { data, error } = await this._sb().from('wt_tasks').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return this._mapTask(data);
  },

  async updateTask(id, changes, actorUserId = null) {
    const task = await this.getTask(id);
    const patch = { updated_at: new Date().toISOString() };
    if (changes.title != null) patch.title = changes.title;
    if (changes.status != null) patch.status = changes.status;
    if (changes.priority != null) patch.priority = changes.priority;
    if (changes.dueDate != null) patch.due_date = changes.dueDate;
    if (changes.milestoneId !== undefined) patch.milestone_id = changes.milestoneId;
    if (changes.assigneeId !== undefined) patch.assignee_id = changes.assigneeId == null ? null : Number(changes.assigneeId);
    const { error } = await this._sb().from('wt_tasks').update(patch).eq('id', id);
    if (error) throw error;
    if (task) {
      await this._sb().from('wt_projects').update({ updated_at: patch.updated_at }).eq('id', task.projectId);
      if (actorUserId) {
        const detail = changes.status ? `status → ${changes.status}` : (task.title || '');
        await this.logActivity({ userId: actorUserId, projectId: task.projectId, action: 'updated', entityType: 'task', entityId: id, details: detail });
      }
    }
    return task;
  },

  async deleteTask(id, actorUserId = null) {
    const task = await this.getTask(id);
    const { error } = await this._sb().from('wt_tasks').delete().eq('id', id);
    if (error) throw error;
    if (task) {
      await this._sb().from('wt_projects').update({ updated_at: new Date().toISOString() }).eq('id', task.projectId);
      if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: task.projectId, action: 'deleted', entityType: 'task', entityId: id, details: task.title });
    }
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
    const id = await this._nextTableId('wt_updates');
    const { data: row, error } = await this._sb().from('wt_updates').insert({
      id, project_id: data.projectId, user_id: actorUserId || null, content: data.content || ''
    }).select().single();
    if (error) throw error;
    await this._sb().from('wt_projects').update({ updated_at: new Date().toISOString() }).eq('id', data.projectId);
    if (actorUserId) await this.logActivity({ userId: actorUserId, projectId: data.projectId, action: 'noted', entityType: 'update', entityId: row.id, details: (data.content || '').slice(0, 120) });
    return row.id;
  },

  async getUpdates(projectId) {
    const { data, error } = await this._sb().from('wt_updates').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(r => this._mapUpdate(r));
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
      projects, tasks, milestones, updates, users, activityLog, notifications, webhooks, sessions,
      { data: attRows, error: attErr }, { data: settingsRows, error: sErr }
    ] = await Promise.all([
      this.getProjects(), this.getTasks(),
      sb.from('wt_milestones').select('*').then(({ data, error }) => { if (error) throw error; return (data || []).map(r => this._mapMilestone(r)); }),
      sb.from('wt_updates').select('*').then(({ data, error }) => { if (error) throw error; return (data || []).map(r => this._mapUpdate(r)); }),
      this.getUsers(), this.getActivityLog({}),
      sb.from('wt_notifications').select('*').then(({ data, error }) => { if (error) throw error; return (data || []).map(r => this._mapNotification(r)); }),
      this.getWebhooks(),
      this.getUserSessions(),
      sb.from('wt_attachments').select('*'),
      sb.from('wt_settings').select('*')
    ]);
    if (attErr) throw attErr;
    if (sErr) throw sErr;
    const safeUsers = users.map(u => ({
      id: u.id, username: u.username, displayName: u.displayName, email: u.email || '',
      role: u.role, createdAt: u.createdAt, discordId: u.discordId || '', color: u.color || '',
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
        id: a.id, projectId: a.projectId, uploadedBy: a.uploadedBy, fileName: a.fileName,
        mimeType: a.mimeType, createdAt: a.createdAt,
        dataBase64: await this.blobToBase64(full.blob)
      });
    }
    return {
      version: 7, exportedAt: new Date().toISOString(),
      projects, tasks, milestones, updates, users: safeUsers, settings, attachments: attOut,
      activityLog, notifications, webhooks, sessions
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
        discord_id: u.discordId || '',
        color: u.color || '',
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
      'wt_sessions', 'wt_webhooks', 'wt_notifications', 'wt_activity_log', 'wt_attachments',
      'wt_updates', 'wt_tasks', 'wt_milestones', 'wt_projects'
    ];
    for (const table of tables) await this._clearTable(table);

    const replaceSettings = Object.prototype.hasOwnProperty.call(data, 'settings');
    if (replaceSettings) await this._clearSettings();

    if (data.projects?.length) {
      const { error } = await sb.from('wt_projects').insert(data.projects.map(p => ({
        id: p.id, name: p.name || '', notes: p.notes || '', type: p.type || 'project',
        status: p.status || 'active', priority: p.priority || 'medium',
        owner_id: mapUid(p.ownerId) ?? p.ownerId,
        is_ongoing: !!p.isOngoing,
        cadence: p.cadence || '',
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
          mimeType: a.mimeType, blob
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

  async createSampleData(ownerId) {
    const jobId = await this.createProject({ name: 'Job Search', notes: 'Track applications, resume updates, and follow-ups.', type: 'job-search', priority: 'high', ownerId });
    await this.createTask({ projectId: jobId, title: 'Update resume with latest experience', status: 'doing', priority: 'high' });
    await this.createTask({ projectId: jobId, title: 'Apply to 5 frontend developer roles', status: 'todo', priority: 'high', dueDate: '2026-05-20' });
    await this.createUpdate({ projectId: jobId, content: 'Started updating resume.' });
  }
};
