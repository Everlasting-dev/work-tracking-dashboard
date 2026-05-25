const db = new Dexie('WorkTrackerDB');

db.version(1).stores({
  projects: '++id, name, type, status, priority, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt'
});

db.version(2).stores({
  projects: '++id, name, type, status, priority, ownerId, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, createdAt'
}).upgrade(tx => {
  return tx.table('projects').toCollection().modify(project => {
    if (!project.ownerId) project.ownerId = 1;
  });
});

db.version(3).stores({
  projects: '++id, name, type, status, priority, ownerId, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, createdAt',
  settings: '&key'
});

db.version(4).stores({
  projects: '++id, name, type, status, priority, ownerId, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, createdAt',
  settings: '&key',
  attachments: '++id, projectId, uploadedBy, createdAt'
});

db.version(5).stores({
  projects: '++id, name, type, status, priority, ownerId, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, createdAt',
  settings: '&key',
  attachments: '++id, projectId, uploadedBy, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, createdAt'
});

db.version(6).stores({
  projects: '++id, name, type, status, priority, ownerId, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, assigneeId, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, createdAt',
  settings: '&key',
  attachments: '++id, projectId, uploadedBy, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, createdAt',
  notifications: '++id, userId, readAt, type, createdAt',
  webhooks: '++id, scope, projectId, createdAt'
}).upgrade(tx => {
  // Backfill assigneeId on existing tasks to the project owner so nothing looks unassigned.
  return tx.table('tasks').toCollection().modify(async task => {
    if (task.assigneeId == null) {
      try {
        const proj = await tx.table('projects').get(task.projectId);
        task.assigneeId = proj?.ownerId ?? null;
      } catch { task.assigneeId = null; }
    }
  });
});

/* ── Password hashing via Web Crypto API (PBKDF2) ── */

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const buf = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    key, 256
  );
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

function generateSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
}

/* ── Database helpers (Supabase-ready: swap Dexie calls for supabase.from() later) ── */

const LocalDB = {
  /* Activity audit log */
  async logActivity({ userId, projectId = null, action, entityType, entityId = null, details = '' }) {
    if (!userId || !action) return;
    return db.activityLog.add({
      userId,
      projectId: projectId ?? null,
      action,
      entityType: entityType || 'system',
      entityId: entityId ?? null,
      details: details || '',
      createdAt: new Date().toISOString()
    });
  },

  async getActivityLog(filters = {}) {
    let rows = await db.activityLog.toArray();
    if (filters.projectId != null) rows = rows.filter(r => r.projectId === filters.projectId);
    if (filters.userId != null) rows = rows.filter(r => r.userId === filters.userId);
    if (filters.viewerUserId != null && !filters.isAdmin) {
      rows = rows.filter(r => r.userId === filters.viewerUserId);
    }
    if (filters.limit) rows = rows.slice(0, filters.limit);
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  /* Notifications (in-app bell) */
  async createNotification({ userId, type, entityType = null, entityId = null, projectId = null, message = '', actorUserId = null }) {
    if (!userId) return;
    return db.notifications.add({
      userId: Number(userId),
      type: type || 'info',
      entityType,
      entityId,
      projectId,
      message,
      actorUserId: actorUserId ?? null,
      readAt: null,
      createdAt: new Date().toISOString()
    });
  },
  async getNotifications(userId, { unreadOnly = false, limit = 50 } = {}) {
    let rows = await db.notifications.where('userId').equals(Number(userId)).toArray();
    if (unreadOnly) rows = rows.filter(r => !r.readAt);
    rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return rows.slice(0, limit);
  },
  async getUnreadNotificationCount(userId) {
    const rows = await db.notifications.where('userId').equals(Number(userId)).toArray();
    return rows.filter(r => !r.readAt).length;
  },
  async markNotificationRead(id) {
    return db.notifications.update(Number(id), { readAt: new Date().toISOString() });
  },
  async markAllNotificationsRead(userId) {
    const rows = await db.notifications.where('userId').equals(Number(userId)).toArray();
    const now = new Date().toISOString();
    for (const r of rows) {
      if (!r.readAt) await db.notifications.update(r.id, { readAt: now });
    }
  },

  /* Webhooks (Discord bridge config) */
  async getWebhooks() { return db.webhooks.toArray(); },
  async getGeneralWebhook() {
    const rows = await db.webhooks.where('scope').equals('general').toArray();
    return rows[0] || null;
  },
  async getProjectWebhook(projectId) {
    const rows = await db.webhooks.where('projectId').equals(Number(projectId)).toArray();
    return rows[0] || null;
  },
  async saveGeneralWebhook({ url, channelUrl = '' }) {
    const existing = await this.getGeneralWebhook();
    const now = new Date().toISOString();
    if (existing) {
      await db.webhooks.update(existing.id, { url, channelUrl, updatedAt: now });
      return existing.id;
    }
    return db.webhooks.add({ scope: 'general', projectId: null, name: '#general', url, channelUrl, createdAt: now, updatedAt: now });
  },
  async saveProjectWebhook(projectId, { url, channelUrl = '', name = '' }) {
    const existing = await this.getProjectWebhook(projectId);
    const now = new Date().toISOString();
    if (existing) {
      await db.webhooks.update(existing.id, { url, channelUrl, name: name || existing.name, updatedAt: now });
      return existing.id;
    }
    return db.webhooks.add({ scope: 'project', projectId: Number(projectId), name: name || `#project-${projectId}`, url, channelUrl, createdAt: now, updatedAt: now });
  },
  async deleteWebhook(id) { return db.webhooks.delete(Number(id)); },

  /* Last-seen / IP capture (client-reported) */
  async touchLastSeen(userId, ip = null) {
    if (!userId) return;
    const patch = { lastSeenAt: new Date().toISOString() };
    if (ip) patch.lastSeenIp = ip;
    await db.users.update(Number(userId), patch);
  },

  /* Users */
  async createUser(data) {
    const salt = generateSalt();
    const pwHash = await hashPassword(data.password, salt);
    const now = new Date().toISOString();
    return db.users.add({
      username: data.username.toLowerCase(),
      displayName: data.displayName || data.username,
      email: data.email || '',
      passwordHash: pwHash,
      salt,
      role: data.role || 'user',
      createdAt: now
    });
  },

  async getUser(id) { return db.users.get(id); },

  async getUserByUsername(username) {
    return db.users.where('username').equals(username.toLowerCase()).first();
  },

  async getUsers() { return db.users.toArray(); },

  async updateUser(id, changes, actorUserId = null) {
    const patch = { ...changes };
    if (patch.username != null) {
      const next = String(patch.username).trim().toLowerCase();
      if (!next) throw new Error('Username cannot be empty');
      const existing = await db.users.where('username').equals(next).first();
      if (existing && existing.id !== id) throw new Error('Username already taken');
      patch.username = next;
    }
    await db.users.update(id, patch);
    if (actorUserId) {
      const details = Object.keys(patch).join(',');
      await LocalDB.logActivity({ userId: actorUserId, projectId: null, action: 'updated', entityType: 'user', entityId: id, details });
    }
  },

  async changePassword(userId, newPassword, actorUserId = null) {
    const salt = generateSalt();
    const pwHash = await hashPassword(newPassword, salt);
    await db.users.update(userId, { passwordHash: pwHash, salt });
    if (actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: null, action: 'password_changed', entityType: 'user', entityId: userId, details: '' });
  },

  async verifyPassword(password, user) {
    const hash = await hashPassword(password, user.salt);
    return hash === user.passwordHash;
  },

  async deleteUser(id, transferToId) {
    await db.projects.where('ownerId').equals(id).modify({ ownerId: transferToId });
    return db.users.delete(id);
  },

  async hasUsers() { return (await db.users.count()) > 0; },

  /* Master recovery key (hashed, same scheme as user passwords) */
  async hasMasterKey() {
    const row = await db.settings.get('masterKey');
    return !!(row && row.passwordHash && row.salt);
  },

  async setMasterKey(plainKey) {
    const salt = generateSalt();
    const passwordHash = await hashPassword(plainKey, salt);
    await db.settings.put({ key: 'masterKey', passwordHash, salt });
  },

  async verifyMasterKey(plainKey) {
    const row = await db.settings.get('masterKey');
    if (!row || !row.salt) return false;
    const hash = await hashPassword(plainKey, row.salt);
    return hash === row.passwordHash;
  },

  /* Projects */
  async createProject(data) {
    const actorUserId = data.actorUserId;
    const now = new Date().toISOString();
    const name = data.name || '';
    const id = await db.projects.add({
      name,
      notes: data.notes || '',
      type: data.type || 'project',
      status: data.status || 'active',
      priority: data.priority || 'medium',
      ownerId: data.ownerId || 1,
      createdAt: now,
      updatedAt: now
    });
    if (actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: id, action: 'created', entityType: 'project', entityId: id, details: name });
    return id;
  },

  async getProjects() {
    const all = await db.projects.toArray();
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async getProject(id) { return db.projects.get(id); },

  async updateProject(id, changes, actorUserId = null) {
    const patch = { ...changes };
    delete patch.actorUserId;
    patch.updatedAt = new Date().toISOString();
    await db.projects.update(id, patch);
    if (actorUserId) {
      const p = await db.projects.get(id);
      await LocalDB.logActivity({ userId: actorUserId, projectId: id, action: 'updated', entityType: 'project', entityId: id, details: p?.name || '' });
    }
    return id;
  },

  async deleteProject(id, actorUserId = null) {
    const p = await db.projects.get(id);
    await db.tasks.where('projectId').equals(id).delete();
    await db.milestones.where('projectId').equals(id).delete();
    await db.updates.where('projectId').equals(id).delete();
    await db.attachments.where('projectId').equals(id).delete();
    await db.activityLog.where('projectId').equals(id).delete();
    await db.projects.delete(id);
    if (actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: null, action: 'deleted', entityType: 'project', entityId: id, details: p?.name || '' });
  },

  /* Attachments (files stored in IndexedDB) */
  async addAttachment(data) {
    const now = new Date().toISOString();
    const fileName = data.fileName || 'file';
    const id = await db.attachments.add({
      projectId: data.projectId,
      uploadedBy: data.uploadedBy,
      fileName,
      mimeType: data.mimeType || 'application/octet-stream',
      blob: data.blob,
      createdAt: now
    });
    await db.projects.update(data.projectId, { updatedAt: now });
    if (data.uploadedBy) await LocalDB.logActivity({ userId: data.uploadedBy, projectId: data.projectId, action: 'uploaded', entityType: 'attachment', entityId: id, details: fileName });
    return id;
  },

  async getAttachments(projectId) {
    const rows = await db.attachments.where('projectId').equals(projectId).toArray();
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getAttachment(id) { return db.attachments.get(id); },

  async deleteAttachment(id, actorUserId = null) {
    const row = await db.attachments.get(id);
    await db.attachments.delete(id);
    if (row) {
      await db.projects.update(row.projectId, { updatedAt: new Date().toISOString() });
      if (actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: row.projectId, action: 'deleted', entityType: 'attachment', entityId: id, details: row.fileName || '' });
    }
  },

  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        const s = String(r.result || '');
        const i = s.indexOf(',');
        resolve(i >= 0 ? s.slice(i + 1) : s);
      };
      r.onerror = () => reject(new Error('read failed'));
      r.readAsDataURL(blob);
    });
  },

  base64ToBlob(base64, mimeType) {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new Blob([bytes], { type: mimeType || 'application/octet-stream' });
  },

  /* Tasks */
  async createTask(data) {
    const actorUserId = data.actorUserId;
    const now = new Date().toISOString();
    const title = data.title || '';
    const assigneeId = data.assigneeId != null ? Number(data.assigneeId) : (actorUserId ?? null);
    const taskId = await db.tasks.add({
      projectId: data.projectId,
      milestoneId: data.milestoneId || null,
      assigneeId,
      title,
      dueDate: data.dueDate || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      createdAt: now,
      updatedAt: now
    });
    await db.projects.update(data.projectId, { updatedAt: now });
    if (actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: data.projectId, action: 'created', entityType: 'task', entityId: taskId, details: title });
    return taskId;
  },

  async getTasks(filter = {}) {
    let results = await db.tasks.toArray();
    if (filter.projectId) results = results.filter(t => t.projectId === filter.projectId);
    if (filter.status) results = results.filter(t => t.status === filter.status);
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getTask(id) { return db.tasks.get(id); },

  async updateTask(id, changes, actorUserId = null) {
    const patch = { ...changes };
    delete patch.actorUserId;
    if (patch.assigneeId != null) patch.assigneeId = Number(patch.assigneeId);
    patch.updatedAt = new Date().toISOString();
    const task = await db.tasks.get(id);
    await db.tasks.update(id, patch);
    if (task) {
      await db.projects.update(task.projectId, { updatedAt: patch.updatedAt });
      if (actorUserId) {
        const detail = patch.status ? `status → ${patch.status}` : (task.title || '');
        await LocalDB.logActivity({ userId: actorUserId, projectId: task.projectId, action: 'updated', entityType: 'task', entityId: id, details: detail });
      }
    }
    return task;
  },

  async deleteTask(id, actorUserId = null) {
    const task = await db.tasks.get(id);
    await db.tasks.delete(id);
    if (task) {
      await db.projects.update(task.projectId, { updatedAt: new Date().toISOString() });
      if (actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: task.projectId, action: 'deleted', entityType: 'task', entityId: id, details: task.title || '' });
    }
  },

  /* Milestones */
  async createMilestone(data) {
    const actorUserId = data.actorUserId;
    const now = new Date().toISOString();
    const title = data.title || '';
    const id = await db.milestones.add({
      projectId: data.projectId,
      title,
      dueDate: data.dueDate || '',
      status: data.status || 'pending',
      weight: data.weight || 1,
      createdAt: now
    });
    await db.projects.update(data.projectId, { updatedAt: now });
    if (actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: data.projectId, action: 'created', entityType: 'milestone', entityId: id, details: title });
    return id;
  },

  async getMilestones(projectId) {
    return db.milestones.where('projectId').equals(projectId).toArray();
  },

  async getMilestone(id) { return db.milestones.get(id); },

  async getUpdate(id) { return db.updates.get(id); },

  async updateMilestone(id, changes, actorUserId = null) {
    const patch = { ...changes };
    delete patch.actorUserId;
    const ms = await db.milestones.get(id);
    await db.milestones.update(id, patch);
    if (ms) {
      await db.projects.update(ms.projectId, { updatedAt: new Date().toISOString() });
      if (actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: ms.projectId, action: 'updated', entityType: 'milestone', entityId: id, details: ms.title || '' });
    }
    return id;
  },

  async deleteMilestone(id, actorUserId = null) {
    const ms = await db.milestones.get(id);
    if (ms) {
      await db.tasks.where('milestoneId').equals(id).modify({ milestoneId: null });
      await db.projects.update(ms.projectId, { updatedAt: new Date().toISOString() });
      if (actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: ms.projectId, action: 'deleted', entityType: 'milestone', entityId: id, details: ms.title || '' });
    }
    return db.milestones.delete(id);
  },

  /* Updates / Activity */
  async createUpdate(data) {
    const actorUserId = data.actorUserId;
    const now = new Date().toISOString();
    const content = data.content || '';
    await db.projects.update(data.projectId, { updatedAt: now });
    const id = await db.updates.add({ projectId: data.projectId, userId: actorUserId || null, content, createdAt: now });
    if (actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: data.projectId, action: 'noted', entityType: 'update', entityId: id, details: content.slice(0, 120) });
    return id;
  },

  async getUpdates(projectId) {
    const all = await db.updates.where('projectId').equals(projectId).toArray();
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async deleteUpdate(id, actorUserId = null) {
    const row = await db.updates.get(id);
    await db.updates.delete(id);
    if (row && actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: row.projectId, action: 'deleted', entityType: 'update', entityId: id, details: '' });
  },

  /* Stats & Progress */
  async getProjectProgress(projectId) {
    const tasks = await db.tasks.where('projectId').equals(projectId).toArray();
    if (tasks.length === 0) return 0;
    const scores = { todo: 0, doing: 50, done: 100 };
    const total = tasks.reduce((sum, t) => sum + (scores[t.status] || 0), 0);
    return Math.round(total / tasks.length);
  },

  async getStats(opts = {}) {
    let projects = await db.projects.toArray();
    let tasks = await db.tasks.toArray();
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

  async isEmpty() { return (await db.projects.count()) === 0; },

  /* Migration */
  async migrateFromLocalStorage(adminId) {
    const raw = localStorage.getItem('simple-work-tracker-data');
    if (!raw) return false;
    try {
      const oldData = JSON.parse(raw);
      if (!Array.isArray(oldData) || oldData.length === 0) return false;
      const existing = await db.projects.count();
      if (existing > 0) return false;
      for (const op of oldData) {
        const pid = await LocalDB.createProject({ name: op.name, notes: op.notes || '', ownerId: adminId });
        for (const ot of (op.tasks || [])) {
          await LocalDB.createTask({ projectId: pid, title: ot.title, dueDate: ot.dueDate || '', status: ot.status || 'todo' });
        }
      }
      localStorage.setItem('simple-work-tracker-data-migrated', 'true');
      return true;
    } catch { return false; }
  },

  /* Export / Import */
  async exportAll() {
    const [projects, tasks, milestones, updates, users] = await Promise.all([
      db.projects.toArray(), db.tasks.toArray(), db.milestones.toArray(), db.updates.toArray(), db.users.toArray()
    ]);
    const safeUsers = users.map(u => ({ id: u.id, username: u.username, displayName: u.displayName, email: u.email || '', role: u.role, createdAt: u.createdAt }));
    const settings = await db.settings.toArray();
    const attRows = await db.attachments.toArray();
    const attachments = [];
    for (const a of attRows) {
      if (!a.blob) continue;
      const dataBase64 = await LocalDB.blobToBase64(a.blob);
      attachments.push({
        id: a.id, projectId: a.projectId, uploadedBy: a.uploadedBy, fileName: a.fileName, mimeType: a.mimeType, createdAt: a.createdAt, dataBase64
      });
    }
    const activityLog = await db.activityLog.toArray();
    const notifications = await db.notifications.toArray();
    const webhooks = await db.webhooks.toArray();
    return { version: 6, exportedAt: new Date().toISOString(), projects, tasks, milestones, updates, users: safeUsers, settings, attachments, activityLog, notifications, webhooks };
  },

  async importAll(data) {
    const replaceSettings = Object.prototype.hasOwnProperty.call(data, 'settings');
    await db.transaction('rw', [db.projects, db.tasks, db.milestones, db.updates, db.settings, db.attachments, db.activityLog, db.notifications, db.webhooks], async () => {
      await Promise.all([
        db.projects.clear(), db.tasks.clear(), db.milestones.clear(), db.updates.clear(),
        db.attachments.clear(), db.activityLog.clear(), db.notifications.clear(), db.webhooks.clear()
      ]);
      if (data.projects?.length) await db.projects.bulkAdd(data.projects);
      if (data.tasks?.length) await db.tasks.bulkAdd(data.tasks);
      if (data.milestones?.length) await db.milestones.bulkAdd(data.milestones);
      if (data.updates?.length) await db.updates.bulkAdd(data.updates);
      if (replaceSettings) {
        await db.settings.clear();
        if (data.settings?.length) await db.settings.bulkAdd(data.settings);
      }
      if (data.attachments?.length) {
        for (const a of data.attachments) {
          if (!a.dataBase64) continue;
          const blob = LocalDB.base64ToBlob(a.dataBase64, a.mimeType);
          await db.attachments.add({
            projectId: a.projectId,
            uploadedBy: a.uploadedBy,
            fileName: a.fileName || 'file',
            mimeType: a.mimeType || 'application/octet-stream',
            blob,
            createdAt: a.createdAt || new Date().toISOString()
          });
        }
      }
      if (data.activityLog?.length) await db.activityLog.bulkAdd(data.activityLog);
      if (data.notifications?.length) await db.notifications.bulkAdd(data.notifications);
      if (data.webhooks?.length) await db.webhooks.bulkAdd(data.webhooks);
    });
  },

  /* Sample Data */
  async createSampleData(ownerId) {
    const jobId = await LocalDB.createProject({ name: 'Job Search', notes: 'Track applications, resume updates, and follow-ups.', type: 'job-search', priority: 'high', ownerId });
    await LocalDB.createTask({ projectId: jobId, title: 'Update resume with latest experience', status: 'doing', priority: 'high' });
    await LocalDB.createTask({ projectId: jobId, title: 'Apply to 5 frontend developer roles', status: 'todo', priority: 'high', dueDate: '2026-05-20' });
    await LocalDB.createTask({ projectId: jobId, title: 'Send recruiter follow-up emails', status: 'done', priority: 'medium' });
    await LocalDB.createTask({ projectId: jobId, title: 'Prepare portfolio website', status: 'todo', priority: 'medium', dueDate: '2026-05-25' });
    await LocalDB.createMilestone({ projectId: jobId, title: 'Resume & portfolio ready', dueDate: '2026-05-18', weight: 3 });
    await LocalDB.createMilestone({ projectId: jobId, title: '10 applications sent', dueDate: '2026-06-01', weight: 5 });
    await LocalDB.createUpdate({ projectId: jobId, content: 'Started updating resume. Need to add the latest project work and skills section.' });

    const resId = await LocalDB.createProject({ name: 'ML Research Paper', notes: 'Investigating recommendation system approaches for the conference paper.', type: 'research', priority: 'medium', ownerId });
    await LocalDB.createTask({ projectId: resId, title: 'Complete literature review on collaborative filtering', status: 'done' });
    await LocalDB.createTask({ projectId: resId, title: 'Write introduction chapter', status: 'doing', dueDate: '2026-05-22', priority: 'high' });
    await LocalDB.createTask({ projectId: resId, title: 'Run baseline experiments', status: 'todo', priority: 'high', dueDate: '2026-05-30' });
    await LocalDB.createMilestone({ projectId: resId, title: 'Literature review complete', weight: 2 });
    await LocalDB.createUpdate({ projectId: resId, content: 'Finished initial literature review. Found 3 promising approaches to compare.' });

    const sideId = await LocalDB.createProject({ name: 'Side Project \u2013 Budget App', notes: 'Personal finance tracking tool with charts and categories.', type: 'project', priority: 'low', ownerId });
    await LocalDB.createTask({ projectId: sideId, title: 'Design database schema', status: 'done' });
    await LocalDB.createTask({ projectId: sideId, title: 'Build UI prototype', status: 'doing' });
    await LocalDB.createTask({ projectId: sideId, title: 'Add authentication', status: 'todo' });
    await LocalDB.createUpdate({ projectId: sideId, content: 'Decided on the tech stack. Going with a simple frontend approach first.' });
  }
};

window.LocalDB = LocalDB;
window.WT_CRYPTO = { hashPassword, generateSalt };
