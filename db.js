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

/* ── Database helpers ── */

const DB = {
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

  async updateUser(id, changes) { return db.users.update(id, changes); },

  async changePassword(userId, newPassword) {
    const salt = generateSalt();
    const pwHash = await hashPassword(newPassword, salt);
    return db.users.update(userId, { passwordHash: pwHash, salt });
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
    const now = new Date().toISOString();
    return db.projects.add({
      name: data.name || '',
      notes: data.notes || '',
      type: data.type || 'project',
      status: data.status || 'active',
      priority: data.priority || 'medium',
      ownerId: data.ownerId || 1,
      createdAt: now,
      updatedAt: now
    });
  },

  async getProjects() {
    const all = await db.projects.toArray();
    return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },

  async getProject(id) { return db.projects.get(id); },

  async updateProject(id, changes) {
    changes.updatedAt = new Date().toISOString();
    return db.projects.update(id, changes);
  },

  async deleteProject(id) {
    await db.tasks.where('projectId').equals(id).delete();
    await db.milestones.where('projectId').equals(id).delete();
    await db.updates.where('projectId').equals(id).delete();
    await db.attachments.where('projectId').equals(id).delete();
    return db.projects.delete(id);
  },

  /* Attachments (files stored in IndexedDB) */
  async addAttachment(data) {
    const now = new Date().toISOString();
    const id = await db.attachments.add({
      projectId: data.projectId,
      uploadedBy: data.uploadedBy,
      fileName: data.fileName || 'file',
      mimeType: data.mimeType || 'application/octet-stream',
      blob: data.blob,
      createdAt: now
    });
    await db.projects.update(data.projectId, { updatedAt: now });
    return id;
  },

  async getAttachments(projectId) {
    const rows = await db.attachments.where('projectId').equals(projectId).toArray();
    return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getAttachment(id) { return db.attachments.get(id); },

  async deleteAttachment(id) {
    const row = await db.attachments.get(id);
    await db.attachments.delete(id);
    if (row) await db.projects.update(row.projectId, { updatedAt: new Date().toISOString() });
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
    const now = new Date().toISOString();
    const taskId = await db.tasks.add({
      projectId: data.projectId,
      milestoneId: data.milestoneId || null,
      title: data.title || '',
      dueDate: data.dueDate || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      createdAt: now,
      updatedAt: now
    });
    await db.projects.update(data.projectId, { updatedAt: now });
    return taskId;
  },

  async getTasks(filter = {}) {
    let results = await db.tasks.toArray();
    if (filter.projectId) results = results.filter(t => t.projectId === filter.projectId);
    if (filter.status) results = results.filter(t => t.status === filter.status);
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getTask(id) { return db.tasks.get(id); },

  async updateTask(id, changes) {
    changes.updatedAt = new Date().toISOString();
    const task = await db.tasks.get(id);
    await db.tasks.update(id, changes);
    if (task) await db.projects.update(task.projectId, { updatedAt: changes.updatedAt });
  },

  async deleteTask(id) {
    const task = await db.tasks.get(id);
    await db.tasks.delete(id);
    if (task) await db.projects.update(task.projectId, { updatedAt: new Date().toISOString() });
  },

  /* Milestones */
  async createMilestone(data) {
    const now = new Date().toISOString();
    const id = await db.milestones.add({
      projectId: data.projectId,
      title: data.title || '',
      dueDate: data.dueDate || '',
      status: data.status || 'pending',
      weight: data.weight || 1,
      createdAt: now
    });
    await db.projects.update(data.projectId, { updatedAt: now });
    return id;
  },

  async getMilestones(projectId) {
    return db.milestones.where('projectId').equals(projectId).toArray();
  },

  async updateMilestone(id, changes) { return db.milestones.update(id, changes); },

  async deleteMilestone(id) {
    const ms = await db.milestones.get(id);
    if (ms) {
      await db.tasks.where('milestoneId').equals(id).modify({ milestoneId: null });
      await db.projects.update(ms.projectId, { updatedAt: new Date().toISOString() });
    }
    return db.milestones.delete(id);
  },

  /* Updates / Activity */
  async createUpdate(data) {
    const now = new Date().toISOString();
    await db.projects.update(data.projectId, { updatedAt: now });
    return db.updates.add({ projectId: data.projectId, content: data.content || '', createdAt: now });
  },

  async getUpdates(projectId) {
    const all = await db.updates.where('projectId').equals(projectId).toArray();
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async deleteUpdate(id) { return db.updates.delete(id); },

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
        const pid = await DB.createProject({ name: op.name, notes: op.notes || '', ownerId: adminId });
        for (const ot of (op.tasks || [])) {
          await DB.createTask({ projectId: pid, title: ot.title, dueDate: ot.dueDate || '', status: ot.status || 'todo' });
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
      const dataBase64 = await DB.blobToBase64(a.blob);
      attachments.push({
        id: a.id, projectId: a.projectId, uploadedBy: a.uploadedBy, fileName: a.fileName, mimeType: a.mimeType, createdAt: a.createdAt, dataBase64
      });
    }
    return { version: 4, exportedAt: new Date().toISOString(), projects, tasks, milestones, updates, users: safeUsers, settings, attachments };
  },

  async importAll(data) {
    const replaceSettings = Object.prototype.hasOwnProperty.call(data, 'settings');
    await db.transaction('rw', [db.projects, db.tasks, db.milestones, db.updates, db.settings, db.attachments], async () => {
      await Promise.all([db.projects.clear(), db.tasks.clear(), db.milestones.clear(), db.updates.clear(), db.attachments.clear()]);
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
          const blob = DB.base64ToBlob(a.dataBase64, a.mimeType);
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
    });
  },

  /* Sample Data */
  async createSampleData(ownerId) {
    const jobId = await DB.createProject({ name: 'Job Search', notes: 'Track applications, resume updates, and follow-ups.', type: 'job-search', priority: 'high', ownerId });
    await DB.createTask({ projectId: jobId, title: 'Update resume with latest experience', status: 'doing', priority: 'high' });
    await DB.createTask({ projectId: jobId, title: 'Apply to 5 frontend developer roles', status: 'todo', priority: 'high', dueDate: '2026-05-20' });
    await DB.createTask({ projectId: jobId, title: 'Send recruiter follow-up emails', status: 'done', priority: 'medium' });
    await DB.createTask({ projectId: jobId, title: 'Prepare portfolio website', status: 'todo', priority: 'medium', dueDate: '2026-05-25' });
    await DB.createMilestone({ projectId: jobId, title: 'Resume & portfolio ready', dueDate: '2026-05-18', weight: 3 });
    await DB.createMilestone({ projectId: jobId, title: '10 applications sent', dueDate: '2026-06-01', weight: 5 });
    await DB.createUpdate({ projectId: jobId, content: 'Started updating resume. Need to add the latest project work and skills section.' });

    const resId = await DB.createProject({ name: 'ML Research Paper', notes: 'Investigating recommendation system approaches for the conference paper.', type: 'research', priority: 'medium', ownerId });
    await DB.createTask({ projectId: resId, title: 'Complete literature review on collaborative filtering', status: 'done' });
    await DB.createTask({ projectId: resId, title: 'Write introduction chapter', status: 'doing', dueDate: '2026-05-22', priority: 'high' });
    await DB.createTask({ projectId: resId, title: 'Run baseline experiments', status: 'todo', priority: 'high', dueDate: '2026-05-30' });
    await DB.createMilestone({ projectId: resId, title: 'Literature review complete', weight: 2 });
    await DB.createUpdate({ projectId: resId, content: 'Finished initial literature review. Found 3 promising approaches to compare.' });

    const sideId = await DB.createProject({ name: 'Side Project \u2013 Budget App', notes: 'Personal finance tracking tool with charts and categories.', type: 'project', priority: 'low', ownerId });
    await DB.createTask({ projectId: sideId, title: 'Design database schema', status: 'done' });
    await DB.createTask({ projectId: sideId, title: 'Build UI prototype', status: 'doing' });
    await DB.createTask({ projectId: sideId, title: 'Add authentication', status: 'todo' });
    await DB.createUpdate({ projectId: sideId, content: 'Decided on the tech stack. Going with a simple frontend approach first.' });
  }
};
