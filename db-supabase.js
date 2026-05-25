/* Supabase backend — mirrors LocalDB API (see db.js) */

const SupabaseDB = {
  _client: null,
  BUCKET: 'project-files',

  async init(url, anonKey) {
    if (!window.supabase?.createClient) throw new Error('Supabase SDK not loaded');
    this._client = window.supabase.createClient(url, anonKey);
    const required = ['wt_users', 'wt_projects', 'wt_tasks', 'wt_settings'];
    for (const table of required) {
      const { error } = await this._client.from(table).select('id').limit(1);
      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('does not exist') || msg.includes('404') || msg.includes('schema cache')) {
          throw new Error(`Supabase table "${table}" is missing. Open Supabase → SQL Editor → run the full script in supabase/schema.sql, then reload the app.`);
        }
        if (!msg.includes('0 rows')) throw error;
      }
    }
  },

  _sb() { return this._client; },

  _mapUser(r) {
    if (!r) return null;
    return {
      id: r.id, username: r.username, displayName: r.display_name, email: r.email || '',
      passwordHash: r.password_hash, salt: r.salt, role: r.role, createdAt: r.created_at,
      discordId: r.discord_id || '', lastSeenAt: r.last_seen_at || null, lastSeenIp: r.last_seen_ip || null
    };
  },

  _mapProject(r) {
    if (!r) return null;
    return {
      id: r.id, name: r.name, notes: r.notes, type: r.type, status: r.status, priority: r.priority,
      ownerId: r.owner_id, createdAt: r.created_at, updatedAt: r.updated_at
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
    await this._sb().from('wt_activity_log').insert({
      user_id: userId, project_id: projectId, action, entity_type: entityType || 'system',
      entity_id: entityId, details: details || ''
    });
  },

  async getActivityLog(filters = {}) {
    let q = this._sb().from('wt_activity_log').select('*').order('created_at', { ascending: false });
    if (filters.projectId != null) q = q.eq('project_id', filters.projectId);
    if (filters.userId != null) q = q.eq('user_id', filters.userId);
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
    const { data: row, error } = await this._sb().from('wt_users').insert({
      username: data.username.toLowerCase(),
      display_name: data.displayName || data.username,
      email: data.email || '',
      password_hash: pwHash,
      salt,
      role: data.role || 'user'
    }).select().single();
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
    if (changes.lastSeenAt != null) patch.last_seen_at = changes.lastSeenAt;
    if (changes.lastSeenIp != null) patch.last_seen_ip = changes.lastSeenIp;
    if (changes.username != null) {
      const next = String(changes.username).trim().toLowerCase();
      if (!next) throw new Error('Username cannot be empty');
      const { data: conflict } = await this._sb().from('wt_users').select('id').eq('username', next).maybeSingle();
      if (conflict && conflict.id !== id) throw new Error('Username already taken');
      patch.username = next;
    }
    const { error } = await this._sb().from('wt_users').update(patch).eq('id', id);
    if (error) throw error;
    if (actorUserId) await this.logActivity({ userId: actorUserId, action: 'updated', entityType: 'user', entityId: id, details: Object.keys(patch).join(',') });
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
    const { data: row, error } = await this._sb().from('wt_projects').insert({
      name: data.name || '', notes: data.notes || '', type: data.type || 'project',
      status: data.status || 'active', priority: data.priority || 'medium', owner_id: data.ownerId || 1
    }).select().single();
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
    const { error } = await this._sb().from('wt_projects').update(patch).eq('id', id);
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
    const assigneeId = data.assigneeId != null ? Number(data.assigneeId) : (actorUserId ?? null);
    const { data: row, error } = await this._sb().from('wt_tasks').insert({
      project_id: data.projectId, milestone_id: data.milestoneId || null, assignee_id: assigneeId,
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
    const { data: row, error } = await this._sb().from('wt_milestones').insert({
      project_id: data.projectId, title: data.title || '', due_date: data.dueDate || '',
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
    const { data: row, error } = await this._sb().from('wt_updates').insert({
      project_id: data.projectId, user_id: actorUserId || null, content: data.content || ''
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

  async migrateFromLocalStorage() { return false; },

  async exportAll() {
    return window.LocalDB.exportAll();
  },

  async importAll(data) {
    return window.LocalDB.importAll(data);
  },

  async createSampleData(ownerId) {
    const jobId = await this.createProject({ name: 'Job Search', notes: 'Track applications, resume updates, and follow-ups.', type: 'job-search', priority: 'high', ownerId });
    await this.createTask({ projectId: jobId, title: 'Update resume with latest experience', status: 'doing', priority: 'high' });
    await this.createTask({ projectId: jobId, title: 'Apply to 5 frontend developer roles', status: 'todo', priority: 'high', dueDate: '2026-05-20' });
    await this.createUpdate({ projectId: jobId, content: 'Started updating resume.' });
  }
};
