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

db.version(7).stores({
  projects: '++id, name, type, status, priority, ownerId, isOngoing, cadence, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, assigneeId, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, createdAt',
  settings: '&key',
  attachments: '++id, projectId, uploadedBy, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, createdAt',
  notifications: '++id, userId, readAt, type, createdAt',
  webhooks: '++id, scope, projectId, createdAt',
  sessions: '++id, userId, &[userId+deviceId], lastSeenAt'
});

db.version(8).stores({
  projects: '++id, name, type, status, priority, ownerId, department, workflowTemplate, completedAt, isOngoing, cadence, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, assigneeId, workflowStepKey, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, department, createdAt',
  settings: '&key',
  attachments: '++id, projectId, uploadedBy, documentType, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, createdAt',
  notifications: '++id, userId, readAt, type, createdAt',
  webhooks: '++id, scope, projectId, createdAt',
  sessions: '++id, userId, &[userId+deviceId], lastSeenAt',
  departments: '&key'
}).upgrade(async tx => {
  await tx.table('users').toCollection().modify(user => {
    if (user.department == null) user.department = '';
  });
  await tx.table('projects').toCollection().modify(project => {
    if (project.department == null) project.department = '';
    if (project.workflowTemplate == null) project.workflowTemplate = '';
    if (project.completedAt == null) project.completedAt = null;
  });
  await tx.table('tasks').toCollection().modify(task => {
    if (task.workflowStepKey == null) task.workflowStepKey = '';
  });
  await tx.table('attachments').toCollection().modify(att => {
    if (att.documentType == null) att.documentType = '';
  });
  const defaults = [
    { key: 'it', label: 'IT', color: 'blue', sortOrder: 10 },
    { key: 'logistics', label: 'Logistics', color: 'amber', sortOrder: 20 },
    { key: 'sales', label: 'Sales', color: 'green', sortOrder: 30 },
    { key: 'purchase', label: 'Purchase', color: 'purple', sortOrder: 40 },
    { key: 'rnd', label: 'R&D', color: 'red', sortOrder: 50 }
  ];
  const count = await tx.table('departments').count();
  if (count === 0) await tx.table('departments').bulkAdd(defaults);
});

db.version(9).stores({
  projects: '++id, name, type, status, priority, ownerId, department, workflowTemplate, completedAt, isOngoing, cadence, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, assigneeId, workflowStepKey, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, department, createdAt',
  settings: '&key',
  attachments: '++id, projectId, uploadedBy, documentType, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, [action+entityType], createdAt',
  notifications: '++id, userId, readAt, type, createdAt',
  webhooks: '++id, scope, projectId, createdAt',
  sessions: '++id, userId, &[userId+deviceId], lastSeenAt',
  departments: '&key, sortOrder'
});

db.version(10).stores({
  projects: '++id, name, type, status, priority, ownerId, department, workflowTemplate, completedAt, isOngoing, cadence, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, assigneeId, workflowStepKey, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, department, createdAt',
  settings: '&key',
  attachments: '++id, projectId, taskId, uploadedBy, documentType, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, [action+entityType], createdAt',
  notifications: '++id, userId, readAt, type, createdAt',
  webhooks: '++id, scope, projectId, createdAt',
  sessions: '++id, userId, &[userId+deviceId], lastSeenAt',
  departments: '&key, sortOrder'
}).upgrade(async tx => {
  const defaults = [
    { key: 'it', label: 'IT', color: 'blue', sortOrder: 10 },
    { key: 'logistics', label: 'Logistics', color: 'amber', sortOrder: 20 },
    { key: 'sales', label: 'Sales', color: 'green', sortOrder: 30 },
    { key: 'purchase', label: 'Purchase', color: 'purple', sortOrder: 40 },
    { key: 'rnd', label: 'R&D', color: 'red', sortOrder: 50 }
  ];
  const count = await tx.table('departments').count();
  if (count === 0) await tx.table('departments').bulkAdd(defaults);
});

db.version(11).stores({
  projects: '++id, name, type, status, priority, ownerId, department, workflowTemplate, completedAt, isOngoing, cadence, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, assigneeId, workflowStepKey, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, department, createdAt',
  settings: '&key',
  attachments: '++id, projectId, taskId, uploadedBy, documentType, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, [action+entityType], createdAt',
  notifications: '++id, userId, readAt, type, createdAt',
  webhooks: '++id, scope, projectId, createdAt',
  sessions: '++id, userId, &[userId+deviceId], lastSeenAt',
  departments: '&key, sortOrder',
  projectAccessRequests: '++id, projectId, requesterId, status, [projectId+requesterId], createdAt',
  bugReports: '++id, userId, status, createdAt'
}).upgrade(async tx => {
  await tx.table('users').toCollection().modify(user => {
    if (user.bio == null) user.bio = '';
    if (user.avatarBase64 == null) user.avatarBase64 = '';
  });
  await tx.table('projects').toCollection().modify(project => {
    if (!Array.isArray(project.editorIds)) project.editorIds = [];
  });
});

db.version(12).stores({
  projects: '++id, name, type, status, priority, ownerId, classroomId, department, workflowTemplate, completedAt, isOngoing, cadence, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, assigneeId, workflowStepKey, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, department, createdAt',
  settings: '&key',
  attachments: '++id, projectId, taskId, uploadedBy, documentType, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, [action+entityType], createdAt',
  notifications: '++id, userId, readAt, type, createdAt',
  webhooks: '++id, scope, projectId, createdAt',
  sessions: '++id, userId, &[userId+deviceId], lastSeenAt',
  departments: '&key, sortOrder',
  projectAccessRequests: '++id, projectId, requesterId, status, [projectId+requesterId], createdAt',
  bugReports: '++id, userId, status, createdAt',
  classrooms: '++id, name, createdAt',
  userClassrooms: '++id, userId, classroomId, &[userId+classroomId]',
  directMessages: '++id, [fromUserId+toUserId], createdAt'
}).upgrade(async tx => {
  const classroomCount = await tx.table('classrooms').count();
  let defaultId = null;
  if (!classroomCount) {
    defaultId = await tx.table('classrooms').add({
      name: 'Main Classroom',
      description: 'Default workspace',
      color: '#4f46e5',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } else {
    const first = await tx.table('classrooms').orderBy('id').first();
    defaultId = first?.id || null;
  }
  if (defaultId != null) {
    await tx.table('projects').toCollection().modify(project => {
      if (project.classroomId == null) project.classroomId = defaultId;
    });
    const users = await tx.table('users').toArray();
    for (const user of users) {
      const existing = await tx.table('userClassrooms').where('[userId+classroomId]').equals([user.id, defaultId]).first();
      if (!existing) await tx.table('userClassrooms').add({ userId: user.id, classroomId: defaultId, createdAt: new Date().toISOString() });
    }
  }
});

db.version(13).stores({
  projects: '++id, name, type, status, priority, ownerId, classroomId, department, workflowTemplate, completedAt, isOngoing, cadence, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, assigneeId, workflowStepKey, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, department, createdAt',
  settings: '&key',
  attachments: '++id, projectId, taskId, uploadedBy, documentType, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, [action+entityType], createdAt',
  notifications: '++id, userId, readAt, type, createdAt',
  webhooks: '++id, scope, projectId, createdAt',
  sessions: '++id, userId, &[userId+deviceId], lastSeenAt',
  departments: '&key, sortOrder',
  projectAccessRequests: '++id, projectId, requesterId, status, [projectId+requesterId], createdAt',
  bugReports: '++id, userId, status, createdAt',
  classrooms: '++id, name, createdAt',
  userClassrooms: '++id, userId, classroomId, &[userId+classroomId]',
  directMessages: '++id, [fromUserId+toUserId], createdAt',
  // Phase 3: user-editable, cloud-synced workflow templates (steps stored as JSON).
  workflowTemplates: '++id, name, createdBy, createdAt, updatedAt',
  // Phase 5: pinned chat contacts (favorites) for the docked chat.
  userFavorites: '++id, userId, favoriteUserId, &[userId+favoriteUserId], createdAt'
});

db.version(14).stores({
  projects: '++id, name, type, status, priority, ownerId, classroomId, department, workflowTemplate, completedAt, isOngoing, cadence, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, assigneeId, workflowStepKey, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, department, createdAt',
  settings: '&key',
  attachments: '++id, projectId, taskId, uploadedBy, documentType, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, [action+entityType], createdAt',
  notifications: '++id, userId, readAt, type, createdAt',
  webhooks: '++id, scope, projectId, createdAt',
  sessions: '++id, userId, &[userId+deviceId], lastSeenAt',
  departments: '&key, sortOrder',
  projectAccessRequests: '++id, projectId, requesterId, status, [projectId+requesterId], createdAt',
  bugReports: '++id, userId, status, createdAt',
  classrooms: '++id, name, createdAt',
  userClassrooms: '++id, userId, classroomId, &[userId+classroomId]',
  directMessages: '++id, [fromUserId+toUserId], createdAt',
  workflowTemplates: '++id, name, createdBy, createdAt, updatedAt',
  userFavorites: '++id, userId, favoriteUserId, &[userId+favoriteUserId], createdAt',
  personalNotes: '++id, userId, done, sortOrder, createdAt, updatedAt'
}).upgrade(async tx => {
  const genPalette = (seed) => {
    let s = Number(seed) || 1;
    const rng = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const hue = Math.floor(rng() * 360);
    const hsl = (h, sat, lit) => {
      const a = sat * Math.min(lit, 1 - lit);
      const f = n => {
        const k = (n + h / 30) % 12;
        const c = lit - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * c).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };
    return { primary: hsl(hue, 0.55, 0.42), tint: hsl(hue, 0.35, 0.92), muted: hsl(hue, 0.2, 0.82) };
  };
  await tx.table('classrooms').toCollection().modify(room => {
    if (!room.themePalette?.primary) {
      room.themePalette = genPalette(room.id || room.name);
      if (!room.color) room.color = room.themePalette.primary;
    }
  });
});

db.version(15).stores({
  projects: '++id, name, type, status, priority, ownerId, classroomId, department, workflowTemplate, completedAt, isOngoing, cadence, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, assigneeId, workflowStepKey, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, department, createdAt',
  settings: '&key',
  attachments: '++id, projectId, taskId, uploadedBy, documentType, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, [action+entityType], createdAt',
  notifications: '++id, userId, readAt, type, createdAt',
  webhooks: '++id, scope, projectId, createdAt',
  sessions: '++id, userId, &[userId+deviceId], lastSeenAt',
  departments: '&key, sortOrder',
  projectAccessRequests: '++id, projectId, requesterId, status, [projectId+requesterId], createdAt',
  bugReports: '++id, userId, status, createdAt',
  classrooms: '++id, name, createdAt',
  userClassrooms: '++id, userId, classroomId, &[userId+classroomId]',
  directMessages: '++id, [fromUserId+toUserId], createdAt',
  workflowTemplates: '++id, name, createdBy, createdAt, updatedAt',
  userFavorites: '++id, userId, favoriteUserId, &[userId+favoriteUserId], createdAt',
  personalNotes: '++id, userId, done, sortOrder, createdAt, updatedAt',
  discordMessages: '++id, channelId, createdAt'
});

db.version(16).stores({
  projects: '++id, name, type, status, priority, ownerId, classroomId, department, workflowTemplate, completedAt, isOngoing, cadence, createdAt, updatedAt',
  milestones: '++id, projectId, title, status, dueDate, createdAt',
  tasks: '++id, projectId, milestoneId, assigneeId, workflowStepKey, status, priority, dueDate, createdAt, updatedAt',
  updates: '++id, projectId, createdAt',
  users: '++id, &username, role, department, createdAt',
  settings: '&key',
  attachments: '++id, projectId, taskId, uploadedBy, documentType, createdAt',
  activityLog: '++id, userId, projectId, action, entityType, [action+entityType], createdAt',
  notifications: '++id, userId, readAt, type, createdAt',
  webhooks: '++id, scope, projectId, createdAt',
  sessions: '++id, userId, &[userId+deviceId], lastSeenAt',
  departments: '&key, sortOrder',
  projectAccessRequests: '++id, projectId, requesterId, status, [projectId+requesterId], createdAt',
  bugReports: '++id, userId, status, createdAt',
  classrooms: '++id, name, createdAt',
  userClassrooms: '++id, userId, classroomId, &[userId+classroomId]',
  directMessages: '++id, [fromUserId+toUserId], createdAt',
  workflowTemplates: '++id, name, createdBy, createdAt, updatedAt',
  userFavorites: '++id, userId, favoriteUserId, &[userId+favoriteUserId], createdAt',
  personalNotes: '++id, userId, done, sortOrder, createdAt, updatedAt',
  discordMessages: '++id, channelId, createdAt',
  calendarEvents: '++id, startsAt, createdBy, classroomId, relatedProjectId, createdAt',
  userActivityDaily: '++id, &[userId+date], userId, date',
  taskDependencies: '++id, projectId, fromTaskId, toTaskId, &[projectId+fromTaskId+toTaskId]'
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

// True when a Supabase workspace is configured and reachable. Used to decide
// whether attachments should live in cloud storage (metadata-only locally)
// instead of being kept as blobs in this device's IndexedDB.
function attachmentsCloudConfigured() {
  return (window.WT_STORAGE_MODE === 'hybrid' || window.WT_STORAGE_MODE === 'supabase')
    && !!window.SupabaseDB;
}
function attachmentsCloudReady() {
  return attachmentsCloudConfigured()
    && !!window.SupabaseDB._client
    && (typeof navigator === 'undefined' || navigator.onLine !== false);
}
// Map a project_files row (Google Drive storage) to the shape the attachment UI
// expects. `_drive: true` signals openFilePreview to stream via the backend.
function _mapDriveAttachment(row) {
  return {
    id: row.id,
    projectId: Number(row.project_id),
    taskId: row.task_id != null ? Number(row.task_id) : null,
    uploadedBy: row.uploaded_by != null ? Number(row.uploaded_by) : null,
    fileName: row.original_name || 'file',
    mimeType: row.mime_type || 'application/octet-stream',
    documentType: '',
    size: row.size_bytes || 0,
    createdAt: row.created_at,
    _drive: true,
  };
}

const LocalDB = {
  db,

  /* Activity audit log */
  async logActivity({ userId, projectId = null, action, entityType, entityId = null, details = '' }) {
    if (!userId || !action) return null;
    const createdAt = new Date().toISOString();
    const id = await db.activityLog.add({
      userId,
      projectId: projectId ?? null,
      action,
      entityType: entityType || 'system',
      entityId: entityId ?? null,
      details: details || '',
      createdAt
    });
    return { id, userId, projectId: projectId ?? null, action, entityType: entityType || 'system', entityId: entityId ?? null, details: details || '', createdAt };
  },

  getSyncStatus() {
    return { enabled: false, pending: 0, failed: 0, syncing: false, lastError: '' };
  },

  getSyncQueueDetails() { return []; },
  retrySyncNow() { return Promise.resolve(); },
  clearFailedSyncJobs() { return 0; },
  async getDiscordMessages(channelId, { limit = 100 } = {}) {
    if (!channelId) return [];
    let rows = await db.discordMessages.where('channelId').equals(channelId).toArray()
      .catch(() => db.discordMessages.toArray().then(all => all.filter(r => r.channelId === channelId)));
    rows.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    return rows.slice(-limit).map(r => ({
      id: `discord-${r.id}`,
      userId: null,
      discordAuthorId: r.discordAuthorId,
      discordAuthorName: r.discordAuthorName,
      discordDisplayName: r.discordDisplayName || r.discordAuthorName,
      discordAvatar: r.discordAvatar || '',
      details: r.content || '',
      source: 'discord',
      createdAt: r.createdAt
    }));
  },

  async flushPendingSync() { return; },

  async getActivityLog(filters = {}) {
    let rows = await db.activityLog.toArray();
    if (filters.projectId != null) rows = rows.filter(r => Number(r.projectId) === Number(filters.projectId));
    if (filters.userId != null) rows = rows.filter(r => Number(r.userId) === Number(filters.userId));
    if (filters.viewerUserId != null && !filters.isAdmin) {
      rows = rows.filter(r => Number(r.userId) === Number(filters.viewerUserId));
    }
    rows.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    if (filters.limit) rows = rows.slice(0, Number(filters.limit));
    return rows;
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
    await LocalDB.recordActiveMinute(Number(userId), 1).catch(() => {});
  },

  _todayDateKey(d = new Date()) {
    return d.toISOString().slice(0, 10);
  },

  async recordActiveMinute(userId, minutes = 1) {
    if (!userId || minutes <= 0) return;
    const uid = Number(userId);
    const date = LocalDB._todayDateKey();
    const existing = await db.userActivityDaily.where('[userId+date]').equals([uid, date]).first();
    if (existing) {
      await db.userActivityDaily.update(existing.id, {
        activeMinutes: (existing.activeMinutes || 0) + minutes,
        actionCount: (existing.actionCount || 0)
      });
      return existing.id;
    }
    return db.userActivityDaily.add({ userId: uid, date, activeMinutes: minutes, actionCount: 0 });
  },

  async getUserActivityDaily(userId = null, { days = 30 } = {}) {
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    const sinceKey = LocalDB._todayDateKey(since);
    let rows = await db.userActivityDaily.toArray();
    rows = rows.filter(r => r.date >= sinceKey);
    if (userId != null) rows = rows.filter(r => Number(r.userId) === Number(userId));
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  },

  async getTeamActivitySummary({ days = 7 } = {}) {
    const rows = await LocalDB.getUserActivityDaily(null, { days });
    const byUser = {};
    for (const r of rows) {
      const uid = Number(r.userId);
      if (!byUser[uid]) byUser[uid] = { activeMinutes: 0, actionCount: 0 };
      byUser[uid].activeMinutes += Number(r.activeMinutes || 0);
      byUser[uid].actionCount += Number(r.actionCount || 0);
    }
    return byUser;
  },

  async getCalendarEvents({ from, to } = {}) {
    let rows = await db.calendarEvents.toArray();
    if (from) rows = rows.filter(r => r.startsAt >= from);
    if (to) rows = rows.filter(r => r.startsAt <= to);
    return rows.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  },

  async createCalendarEvent(data, actorUserId = null) {
    const now = new Date().toISOString();
    const id = await db.calendarEvents.add({
      title: data.title || 'Event',
      description: data.description || '',
      startsAt: data.startsAt,
      endsAt: data.endsAt || null,
      allDay: !!data.allDay,
      createdBy: data.createdBy || actorUserId || null,
      visibility: data.visibility || 'team',
      classroomId: data.classroomId || null,
      relatedProjectId: data.relatedProjectId || null,
      relatedTaskId: data.relatedTaskId || null,
      createdAt: now
    });
    if (actorUserId) {
      await LocalDB.logActivity({ userId: actorUserId, action: 'created', entityType: 'calendar_event', entityId: id, details: data.title || '' });
    }
    return id;
  },

  async updateCalendarEvent(id, changes, actorUserId = null) {
    await db.calendarEvents.update(Number(id), changes);
    if (actorUserId) {
      await LocalDB.logActivity({ userId: actorUserId, action: 'updated', entityType: 'calendar_event', entityId: id, details: changes.title || '' });
    }
  },

  async deleteCalendarEvent(id, actorUserId = null) {
    await db.calendarEvents.delete(Number(id));
    if (actorUserId) {
      await LocalDB.logActivity({ userId: actorUserId, action: 'deleted', entityType: 'calendar_event', entityId: id, details: '' });
    }
  },

  async getTaskDependencies(projectId) {
    return db.taskDependencies.where('projectId').equals(Number(projectId)).toArray();
  },

  async setTaskBlockedBy(taskId, blockerIds = [], actorUserId = null) {
    const tid = Number(taskId);
    const task = await db.tasks.get(tid);
    if (!task) throw new Error('Task not found');
    const projectId = Number(task.projectId);
    const want = [...new Set((blockerIds || []).map(Number).filter(id => id && id !== tid))];
    const existing = await db.taskDependencies.where('projectId').equals(projectId).toArray();
    const current = existing.filter(d => Number(d.toTaskId) === tid && d.type === 'blocks');
    for (const dep of current) {
      if (!want.includes(Number(dep.fromTaskId))) await db.taskDependencies.delete(dep.id);
    }
    for (const fromId of want) {
      const dup = existing.find(d => Number(d.fromTaskId) === fromId && Number(d.toTaskId) === tid);
      if (!dup) {
        await db.taskDependencies.add({ projectId, fromTaskId: fromId, toTaskId: tid, type: 'blocks', createdAt: new Date().toISOString() });
      }
    }
    if (actorUserId) {
      await LocalDB.logActivity({ userId: actorUserId, projectId, action: 'updated', entityType: 'task', entityId: tid, details: 'dependencies' });
    }
  },

  async getTaskBlockers(taskId) {
    const tid = Number(taskId);
    const deps = await db.taskDependencies.toArray();
    return deps.filter(d => Number(d.toTaskId) === tid && d.type === 'blocks').map(d => Number(d.fromTaskId));
  },

  async areTaskBlockersDone(taskId) {
    const blockers = await LocalDB.getTaskBlockers(taskId);
    if (!blockers.length) return true;
    for (const bid of blockers) {
      const t = await db.tasks.get(bid);
      if (t && t.status !== 'done') return false;
    }
    return true;
  },

  async recordLoginSession(userId, { deviceId = '', deviceLabel = '', userAgent = '', ip = '' } = {}) {
    if (!userId || !deviceId) return;
    const now = new Date().toISOString();
    const existing = await db.sessions.where('[userId+deviceId]').equals([Number(userId), deviceId]).first();
    if (existing) {
      await db.sessions.update(existing.id, {
        deviceLabel,
        userAgent,
        ip: ip || existing.ip || '',
        lastSeenAt: now,
        loginCount: (existing.loginCount || 0) + 1
      });
      return existing.id;
    }
    return db.sessions.add({
      userId: Number(userId),
      deviceId,
      deviceLabel,
      userAgent,
      ip,
      firstSeenAt: now,
      lastSeenAt: now,
      loginCount: 1
    });
  },

  async getUserSessions(userId = null) {
    const rows = userId
      ? await db.sessions.where('userId').equals(Number(userId)).toArray()
      : await db.sessions.toArray();
    return rows.sort((a, b) => (b.lastSeenAt || '').localeCompare(a.lastSeenAt || ''));
  },

  async getChatActivityLog(channelId, { limit = 100 } = {}) {
    const projectId = channelId?.startsWith('project-') ? Number(channelId.split('-')[1]) : null;
    let rows = await db.activityLog
      .where('[action+entityType]')
      .equals(['sent_message', 'chat'])
      .toArray()
      .catch(() => db.activityLog.toArray());
    if (!rows?.length) {
      rows = (await db.activityLog.toArray()).filter(e => e.action === 'sent_message' && e.entityType === 'chat');
    }
    if (channelId === 'general') rows = rows.filter(e => e.projectId == null);
    else if (Number.isFinite(projectId)) rows = rows.filter(e => e.projectId === projectId);
    rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return rows.slice(-limit);
  },

  async createDirectMessage({ fromUserId, toUserId, content }) {
    const now = new Date().toISOString();
    return db.directMessages.add({
      fromUserId: Number(fromUserId),
      toUserId: Number(toUserId),
      content: String(content || '').slice(0, 2000),
      createdAt: now,
      updatedAt: now
    });
  },

  async getDirectMessages(userA, userB, { limit = 100 } = {}) {
    const a = Number(userA);
    const b = Number(userB);
    const rows = (await db.directMessages.toArray())
      .filter(m => (m.fromUserId === a && m.toUserId === b) || (m.fromUserId === b && m.toUserId === a))
      .sort((x, y) => (x.createdAt || '').localeCompare(y.createdAt || ''));
    return rows.slice(-limit);
  },

  async markDMDelivered(_messageId) { return true; },
  async markDMRead(_fromUserId, _toUserId) { return true; },
  async ensureSupabaseAuth(_email, _password, _username) { return null; },
  async signOutSupabase() {},

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
    const defaults = this._defaultDepartments();
    const existing = new Set((await db.departments.toArray()).map(d => d.key));
    const missing = defaults.filter(d => !existing.has(d.key));
    if (missing.length) await db.departments.bulkPut(missing);
  },

  async getDepartments() {
    await this.ensureDefaultDepartments();
    return db.departments.orderBy('sortOrder').toArray();
  },

  async upsertDepartment({ key, label, color, sortOrder = 0 }) {
    await this.ensureDefaultDepartments();
    const slug = String(key || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) throw new Error('Department key is required');
    if (!label?.trim()) throw new Error('Department name is required');
    await db.departments.put({ key: slug, label: label.trim(), color: color || 'blue', sortOrder });
    return slug;
  },

  async deleteDepartment(key) {
    return db.departments.delete(key);
  },

  _genClassroomPalette(seed) {
    let s = Number(seed) || 1;
    const rng = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const hue = Math.floor(rng() * 360);
    const hsl = (h, sat, lit) => {
      const a = sat * Math.min(lit, 1 - lit);
      const f = n => {
        const k = (n + h / 30) % 12;
        const c = lit - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * c).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };
    const primary = hsl(hue, 0.55, 0.42);
    return { primary, tint: hsl(hue, 0.35, 0.92), muted: hsl(hue, 0.2, 0.82) };
  },

  async ensureDefaultClassroom() {
    let row = await db.classrooms.orderBy('id').first();
    if (row) return row.id;
    const now = new Date().toISOString();
    const themePalette = this._genClassroomPalette(Date.now());
    return db.classrooms.add({ name: 'Main Classroom', description: 'Default workspace', color: themePalette.primary, themePalette, createdAt: now, updatedAt: now });
  },

  async getClassrooms() {
    const rows = await db.classrooms.toArray();
    return rows.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  },

  async createClassroom({ name, description = '', isPersonal = false, ownerId = null }) {
    const now = new Date().toISOString();
    const tempId = Date.now() % 1000000;
    const themePalette = this._genClassroomPalette(tempId + (name || '').length);
    const row = { name: name || 'Classroom', description, color: themePalette.primary, themePalette, createdAt: now, updatedAt: now };
    if (isPersonal) { row.isPersonal = true; row.ownerId = Number(ownerId) || null; }
    return db.classrooms.add(row);
  },

  /* Each user owns one private "<Name>'s Space" classroom. Idempotent by ownerId.
     Projects placed here are invisible to others (nobody else is a member);
     collaboration is opt-in via project editorIds.
     Routes through createClassroom/setUserClassrooms so the SyncEngine replays
     it to the cloud (direct db.add writes are not intercepted). */
  async ensurePersonalClassroom(userId, displayName) {
    const uid = Number(userId);
    if (!uid) return null;
    const name = `${String(displayName || 'My').trim() || 'My'}'s Space`;
    // Match by flag OR by name so we never recreate even if the isPersonal/ownerId
    // flags were wiped by a cloud pull (cloud columns may not be applied yet).
    const existing = await db.classrooms.filter(c => (c.isPersonal && Number(c.ownerId) === uid) || c.name === name).first();
    if (existing) return existing.id;
    const id = await this.createClassroom({ name, description: 'Your private personal space', isPersonal: true, ownerId: uid });
    // Add membership WITHOUT dropping existing classroom assignments.
    const currentIds = await this.getUserClassroomIds(uid).catch(() => []);
    await this.setUserClassrooms(uid, [...new Set([...(currentIds || []).map(Number), id])]);
    return id;
  },

  /* Merge-only cleanup: if a user ended up with several personal classrooms
     (a now-fixed bug created one per login), reassign their projects to the
     oldest and delete the extras. NEVER creates — safe to call on every login. */
  async dedupePersonalClassrooms(userId, displayName) {
    const uid = Number(userId);
    if (!uid) return null;
    const wantName = `${String(displayName || 'My').trim() || 'My'}'s Space`;
    const all = await db.classrooms.toArray();
    const mine = all.filter(c => (c.isPersonal && Number(c.ownerId) === uid) || c.name === wantName);
    if (mine.length <= 1) return mine[0]?.id || null;
    mine.sort((a, b) => a.id - b.id);
    const keeper = mine[0];
    // Restore the keeper's flags locally (cheap; aids local filtering).
    await db.classrooms.update(keeper.id, { isPersonal: true, ownerId: uid }).catch(() => {});
    for (const dup of mine.slice(1)) {
      const projs = await db.projects.where('classroomId').equals(dup.id).toArray();
      for (const p of projs) await this.updateProject(p.id, { classroomId: keeper.id }, uid).catch(() => {});
      await this.deleteClassroom(dup.id).catch(() => {});
    }
    return keeper.id;
  },

  async getPersonalNotes(userId) {
    const uid = Number(userId);
    const rows = await db.personalNotes.where('userId').equals(uid).toArray();
    return rows.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.createdAt || '').localeCompare(b.createdAt || ''));
  },

  async createPersonalNote({ userId, title = '', content, done = false }) {
    const now = new Date().toISOString();
    const uid = Number(userId);
    const existing = await db.personalNotes.where('userId').equals(uid).count();
    return db.personalNotes.add({ userId: uid, title: String(title || '').slice(0, 140), content: String(content || '').slice(0, 4000), done: !!done, sortOrder: existing * 10, createdAt: now, updatedAt: now });
  },

  async updatePersonalNote(id, patch = {}) {
    const allowed = { updatedAt: new Date().toISOString() };
    if (patch.title !== undefined) allowed.title = String(patch.title || '').slice(0, 140);
    if (patch.content !== undefined) allowed.content = String(patch.content || '').slice(0, 4000);
    if (patch.done !== undefined) allowed.done = !!patch.done;
    if (patch.sortOrder !== undefined) allowed.sortOrder = Number(patch.sortOrder);
    await db.personalNotes.update(Number(id), allowed);
    return db.personalNotes.get(Number(id));
  },

  async deletePersonalNote(id) {
    return db.personalNotes.delete(Number(id));
  },

  async ensureSampleClassroom(ownerId) {
    const sampleNames = new Set(['Job Search', 'ML Research Paper', 'Side Project – Budget App']);
    let sampleRoom = await db.classrooms.where('name').equals('Sample Classroom').first();
    const classroomId = sampleRoom?.id || await this.createClassroom({
      name: 'Sample Classroom',
      description: 'Demo workspace for sample projects',
      color: '#7c3aed'
    });
    if (ownerId) {
      await this.setUserClassrooms(ownerId, [...new Set([...(await this.getUserClassroomIds(ownerId)), classroomId])]);
    }
    const projects = await db.projects.toArray();
    for (const p of projects) {
      if (sampleNames.has(p.name) && p.classroomId !== classroomId) {
        await this.updateProject(p.id, { classroomId }, ownerId || p.ownerId || null);
      }
    }
    return classroomId;
  },

  async updateClassroom(id, changes = {}) {
    return db.classrooms.update(Number(id), { ...changes, updatedAt: new Date().toISOString() });
  },

  async deleteClassroom(id) {
    const all = await db.classrooms.toArray();
    if (all.length <= 1) throw new Error('At least one classroom is required');
    const fallback = all.find(c => c.id !== Number(id));
    await db.projects.where('classroomId').equals(Number(id)).modify({ classroomId: fallback?.id || null });
    await db.userClassrooms.where('classroomId').equals(Number(id)).delete();
    return db.classrooms.delete(Number(id));
  },

  async getUserClassroomIds(userId) {
    const rows = await db.userClassrooms.where('userId').equals(Number(userId)).toArray();
    if (rows.length) return rows.map(r => Number(r.classroomId)).filter(Boolean);
    // Safe fallback: return default without overwriting existing DB rows (prevents destructive fallback on transient errors)
    const defaultId = await this.ensureDefaultClassroom();
    return [defaultId];
  },

  async getClassroomMemberIds(classroomId) {
    const rows = await db.userClassrooms.where('classroomId').equals(Number(classroomId)).toArray();
    return [...new Set(rows.map(r => Number(r.userId)).filter(Boolean))];
  },

  async setUserClassrooms(userId, classroomIds = []) {
    const uid = Number(userId);
    const ids = [...new Set((classroomIds || []).map(Number).filter(Boolean))];
    const finalIds = ids.length ? ids : [await this.ensureDefaultClassroom()];
    await db.userClassrooms.where('userId').equals(uid).delete();
    const now = new Date().toISOString();
    await db.userClassrooms.bulkAdd(finalIds.map(classroomId => ({ userId: uid, classroomId, createdAt: now })));
    return finalIds;
  },

  /* Users */
  async createUser(data) {
    const salt = generateSalt();
    const pwHash = await hashPassword(data.password, salt);
    const now = new Date().toISOString();
    const id = await db.users.add({
      username: data.username.toLowerCase(),
      displayName: data.displayName || data.username,
      email: data.email || '',
      passwordHash: pwHash,
      salt,
      role: data.role || 'user',
      department: data.department || '',
      bio: data.bio || '',
      birthDate: data.birthDate || '',
      gender: data.gender || '',
      phone: data.phone || '',
      address: data.address || '',
      hoursLoggedTotal: Number(data.hoursLoggedTotal || 0),
      avatarBase64: data.avatarBase64 || '',
      color: data.color || '',
      mustChangePassword: !!data.mustChangePassword,
      createdAt: now
    });
    await this.setUserClassrooms(id, data.classroomIds || [await this.ensureDefaultClassroom()]);
    return id;
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
    if (patch.department != null) patch.department = patch.department || '';
    await db.users.update(id, patch);
    if (actorUserId) {
      const details = Object.keys(patch).join(',');
      await LocalDB.logActivity({ userId: actorUserId, projectId: null, action: 'updated', entityType: 'user', entityId: id, details });
    }
  },

  async changePassword(userId, newPassword, actorUserId = null, { forceChange = false } = {}) {
    const salt = generateSalt();
    const pwHash = await hashPassword(newPassword, salt);
    await db.users.update(userId, { passwordHash: pwHash, salt, mustChangePassword: !!forceChange });
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
      classroomId: data.classroomId != null ? Number(data.classroomId) : (await this.getUserClassroomIds(data.ownerId || actorUserId || 1))[0],
      department: data.department || '',
      workflowTemplate: data.workflowTemplate || '',
      editorIds: Array.isArray(data.editorIds) ? data.editorIds.map(Number).filter(Boolean) : [],
      completedAt: data.status === 'completed' ? now : null,
      isOngoing: !!data.isOngoing,
      cadence: data.cadence || '',
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
    const existing = await db.projects.get(id);
    const patch = { ...changes };
    delete patch.actorUserId;
    if (patch.department != null) patch.department = patch.department || '';
    if (patch.workflowTemplate != null) patch.workflowTemplate = patch.workflowTemplate || '';
    if (patch.editorIds != null) patch.editorIds = Array.isArray(patch.editorIds) ? patch.editorIds.map(Number).filter(Boolean) : [];
    if (patch.status != null) {
      if (patch.status === 'completed') patch.completedAt = existing?.completedAt || new Date().toISOString();
      else if (existing?.status === 'completed') patch.completedAt = null;
    }
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
    await db.projectAccessRequests.where('projectId').equals(id).delete();
    await db.projects.delete(id);
    if (actorUserId) await LocalDB.logActivity({ userId: actorUserId, projectId: null, action: 'deleted', entityType: 'project', entityId: id, details: p?.name || '' });
  },

  /* Attachments
   * Cloud mode: the file is uploaded to Supabase Storage and only its metadata
   * (path, name, type) is cached locally — the blob is never persisted on this
   * device, so files are fetched on demand instead of downloaded to every PC.
   * Offline / local mode: the blob is stored locally and flagged for upload so
   * the sync engine can push it once the device is back online. */
  async addAttachment(data) {
    const now = new Date().toISOString();
    const fileName = data.fileName || 'file';

    // Hybrid Google Drive storage (flag-gated). Content → Drive via the backend;
    // metadata → project_files. Returns the new project_files row id (uuid).
    if (window.DriveStorage?.enabled?.() && data.blob) {
      const file = new File([data.blob], fileName, { type: data.mimeType || 'application/octet-stream' });
      const rec = await window.DriveStorage.upload(data.projectId, { file, taskId: data.taskId || null, description: data.documentType || '' });
      await db.projects.update(data.projectId, { updatedAt: now });
      if (data.uploadedBy) await LocalDB.logActivity({ userId: data.uploadedBy, projectId: data.projectId, action: 'uploaded', entityType: 'attachment', entityId: rec.id, details: fileName });
      return rec.id;
    }

    if (attachmentsCloudReady() && data.blob) {
      try {
        const meta = await window.SupabaseDB.addAttachment(data);
        const rec = {
          id: meta.id,
          projectId: data.projectId,
          taskId: data.taskId || null,
          uploadedBy: data.uploadedBy,
          fileName,
          mimeType: data.mimeType || 'application/octet-stream',
          documentType: data.documentType || '',
          storagePath: meta.storagePath,
          createdAt: meta.createdAt || now
        };
        await db.attachments.put(rec);
        await db.projects.update(data.projectId, { updatedAt: now });
        return meta.id;
      } catch (err) {
        console.warn('[attachments] cloud upload failed, keeping a local copy to retry:', err);
      }
    }

    const id = await db.attachments.add({
      projectId: data.projectId,
      taskId: data.taskId || null,
      uploadedBy: data.uploadedBy,
      fileName,
      mimeType: data.mimeType || 'application/octet-stream',
      documentType: data.documentType || '',
      blob: data.blob,
      pendingUpload: attachmentsCloudConfigured(),
      createdAt: now
    });
    await db.projects.update(data.projectId, { updatedAt: now });
    if (data.uploadedBy) await LocalDB.logActivity({ userId: data.uploadedBy, projectId: data.projectId, action: 'uploaded', entityType: 'attachment', entityId: id, details: fileName });
    return id;
  },

  async getAttachments(projectId, opts = {}) {
    const localRows = async () => {
      const rows = await db.attachments.where('projectId').equals(projectId).toArray();
      const visible = opts.includeHidden ? rows : rows.filter(row => !row.isHidden && !row.deletedAt);
      return visible.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    };
    if (window.DriveStorage?.enabled?.()) {
      try {
        const driveRows = (await window.DriveStorage.list(projectId)).map(_mapDriveAttachment);
        if (driveRows.length) return driveRows;
      } catch (err) {
        console.warn('[attachments] drive list failed, falling back to legacy attachments:', err);
      }
      return localRows();
    }
    return localRows();
  },

  async getAttachment(id) {
    if (window.DriveStorage?.enabled?.()) {
      try {
        const row = await window.DriveStorage.getOne(id);
        if (row) return _mapDriveAttachment(row);
      } catch (err) {
        console.warn('[attachments] drive get failed, trying legacy attachment cache:', err);
      }
      const numericId = Number(id);
      if (Number.isFinite(numericId)) return db.attachments.get(numericId);
      return null;
    }
    return db.attachments.get(id);
  },

  // Build a direct URL for legacy Supabase Storage files. Drive-backed files
  // are streamed through DriveStorage.objectUrl instead.
  getAttachmentUrl(storagePath) {
    if (!storagePath) return '';
    try {
      if (window.SupabaseDB?._client?.storage) return window.SupabaseDB.getAttachmentUrl(storagePath);
    } catch (_) {}
    const cfg = window.WT_CONFIG || {};
    if (cfg.supabaseUrl) {
      const base = String(cfg.supabaseUrl).replace(/\/$/, '');
      return `${base}/storage/v1/object/public/project-files/${storagePath}`;
    }
    return '';
  },

  async deleteAttachment(id, actorUserId = null) {
    if (window.DriveStorage?.enabled?.()) {
      const numericId = Number(id);
      const legacyRow = Number.isFinite(numericId) ? await db.attachments.get(numericId) : null;
      if (legacyRow) id = numericId;
      else {
        await window.DriveStorage.remove(id);
        return;
      }
    }
    const row = await db.attachments.get(id);
    let cloudDeleted = false;
    const now = new Date().toISOString();
    if (row?.storagePath && attachmentsCloudReady()) {
      try { await window.SupabaseDB.deleteAttachment(id, actorUserId); cloudDeleted = true; }
      catch (err) { console.warn('[attachments] cloud delete failed:', err); }
    }
    await db.attachments.update(id, {
      isHidden: true,
      deletedAt: now,
      deletedBy: actorUserId || null,
      deleteReason: 'Removed from project view'
    });
    if (row) {
      await db.projects.update(row.projectId, { updatedAt: now });
      if (actorUserId && !cloudDeleted) await LocalDB.logActivity({ userId: actorUserId, projectId: row.projectId, action: 'deleted', entityType: 'attachment', entityId: id, details: row.fileName || '' });
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
    const picked = data.assigneeId != null ? Number(data.assigneeId) : null;
    const assigneeId = picked != null && picked > 0 ? picked : (actorUserId ?? null);
    const taskId = await db.tasks.add({
      projectId: data.projectId,
      milestoneId: data.milestoneId || null,
      assigneeId,
      workflowStepKey: data.workflowStepKey || '',
      title,
      dueDate: data.dueDate || '',
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      notes: data.notes || data.description || '',
      customFields: Array.isArray(data.customFields) ? data.customFields : [],
      // sort_order on the board. New tasks default to "now" (epoch seconds) so they
      // land at the bottom; an explicit drag-reorder rewrites these to small indices.
      sortOrder: data.sortOrder != null ? Number(data.sortOrder) : Math.floor(Date.now() / 1000),
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
    const activityDetails = patch.activityDetails;
    delete patch.activityDetails;
    if (patch.assigneeId != null) patch.assigneeId = Number(patch.assigneeId);
    if (patch.workflowStepKey != null) patch.workflowStepKey = patch.workflowStepKey || '';
    if (patch.sortOrder != null) patch.sortOrder = Number(patch.sortOrder);
    patch.updatedAt = new Date().toISOString();
    const task = await db.tasks.get(id);
    await db.tasks.update(id, patch);
    if (task) {
      await db.projects.update(task.projectId, { updatedAt: patch.updatedAt });
      if (actorUserId) {
        const detail = activityDetails || (patch.status ? `status -> ${patch.status}` : (task.title || ''));
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

  /* Workflow Templates (user-editable; steps = [{ title, priority }]) */
  _normalizeTemplateSteps(steps) {
    return (Array.isArray(steps) ? steps : [])
      .map(s => ({
        title: (s?.title || '').trim(),
        priority: ['low', 'medium', 'high', 'urgent'].includes(s?.priority) ? s.priority : 'medium'
      }))
      .filter(s => s.title);
  },

  _normalizeTemplateFields(fields) {
    const allowed = new Set(['text', 'long_text', 'number', 'date', 'checkbox', 'file', 'image']);
    return (Array.isArray(fields) ? fields : [])
      .map((f, idx) => {
        const label = (f?.label || '').trim();
        if (!label) return null;
        const type = allowed.has(f?.type) ? f.type : 'text';
        return {
          key: (f.key || label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `field_${idx + 1}`),
          label,
          type,
          required: !!f.required,
          showOnCard: !!(f.showOnCard || f.visibleOnTaskCard)
        };
      })
      .filter(Boolean);
  },

  async getWorkflowTemplates() {
    const rows = await db.workflowTemplates.toArray();
    return rows.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  },

  async getWorkflowTemplate(id) { return db.workflowTemplates.get(Number(id)); },

  async createWorkflowTemplate(data) {
    const now = new Date().toISOString();
    const id = await db.workflowTemplates.add({
      name: (data.name || '').trim() || 'Untitled template',
      description: (data.description || '').trim(),
      steps: LocalDB._normalizeTemplateSteps(data.steps),
      fields: LocalDB._normalizeTemplateFields(data.fields),
      createdBy: data.createdBy || data.actorUserId || null,
      createdAt: now,
      updatedAt: now
    });
    return id;
  },

  async updateWorkflowTemplate(id, changes) {
    const patch = {};
    if (changes.name != null) patch.name = (changes.name || '').trim() || 'Untitled template';
    if (changes.description != null) patch.description = (changes.description || '').trim();
    if (changes.steps != null) patch.steps = LocalDB._normalizeTemplateSteps(changes.steps);
    if (changes.fields != null) patch.fields = LocalDB._normalizeTemplateFields(changes.fields);
    patch.updatedAt = new Date().toISOString();
    await db.workflowTemplates.update(Number(id), patch);
    return db.workflowTemplates.get(Number(id));
  },

  async deleteWorkflowTemplate(id) {
    await db.workflowTemplates.delete(Number(id));
  },

  /* Chat favorites (Phase 5) */
  async getFavorites(userId) {
    return db.userFavorites.where('userId').equals(Number(userId)).toArray();
  },
  async addFavorite({ userId, favoriteUserId }) {
    const a = Number(userId), b = Number(favoriteUserId);
    const existing = await db.userFavorites.where('[userId+favoriteUserId]').equals([a, b]).first();
    if (existing) return existing.id;
    return db.userFavorites.add({ userId: a, favoriteUserId: b, createdAt: new Date().toISOString() });
  },
  async removeFavorite(userId, favoriteUserId) {
    const a = Number(userId), b = Number(favoriteUserId);
    const existing = await db.userFavorites.where('[userId+favoriteUserId]').equals([a, b]).first();
    if (existing) await db.userFavorites.delete(existing.id);
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

  async getProjectAccessRequests({ projectId = null, requesterId = null, status = null } = {}) {
    let rows = await db.projectAccessRequests.toArray();
    if (projectId != null) rows = rows.filter(r => r.projectId === Number(projectId));
    if (requesterId != null) rows = rows.filter(r => r.requesterId === Number(requesterId));
    if (status != null) rows = rows.filter(r => r.status === status);
    return rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  },

  async requestProjectAccess({ projectId, requesterId, message = '' }) {
    const now = new Date().toISOString();
    const existing = await db.projectAccessRequests
      .where('[projectId+requesterId]')
      .equals([Number(projectId), Number(requesterId)])
      .first();
    const row = {
      projectId: Number(projectId),
      requesterId: Number(requesterId),
      message,
      status: 'pending',
      decidedBy: null,
      decidedAt: null,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    };
    if (existing) {
      await db.projectAccessRequests.update(existing.id, row);
      return existing.id;
    }
    return db.projectAccessRequests.add(row);
  },

  async respondProjectAccess(requestId, { status, decidedBy }) {
    const req = await db.projectAccessRequests.get(Number(requestId));
    if (!req) throw new Error('Request not found');
    const now = new Date().toISOString();
    await db.projectAccessRequests.update(req.id, { status, decidedBy, decidedAt: now, updatedAt: now });
    if (status === 'approved') {
      const p = await db.projects.get(req.projectId);
      const editorIds = new Set((p?.editorIds || []).map(Number));
      editorIds.add(Number(req.requesterId));
      await db.projects.update(req.projectId, { editorIds: [...editorIds], updatedAt: now });
    }
    return req;
  },

  async createBugReport({ userId, title, description, severity = 'normal', appVersion = '', githubIssueUrl = '', screenshots = [] }) {
    const now = new Date().toISOString();
    return db.bugReports.add({
      userId: Number(userId),
      title: title || '',
      description: description || '',
      severity: severity || 'normal',
      appVersion: appVersion || '',
      screenshots: Array.isArray(screenshots) ? screenshots : [],
      status: githubIssueUrl ? 'sent' : 'open',
      githubIssueUrl,
      resolutionNote: '',
      createdAt: now,
      updatedAt: now
    });
  },

  async getBugReports({ limit = 100 } = {}) {
    const rows = await db.bugReports.toArray();
    return rows.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, limit);
  },

  async updateBugReport(id, patch = {}) {
    const allowed = {};
    if (patch.status !== undefined) allowed.status = patch.status;
    if (patch.githubIssueUrl !== undefined) allowed.githubIssueUrl = patch.githubIssueUrl;
    if (patch.resolutionNote !== undefined) allowed.resolutionNote = patch.resolutionNote;
    if (patch.severity !== undefined) allowed.severity = patch.severity;
    allowed.updatedAt = new Date().toISOString();
    await db.bugReports.update(Number(id), allowed);
    return db.bugReports.get(Number(id));
  },

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
    const safeUsers = users.map(u => ({
      id: u.id, username: u.username, displayName: u.displayName, email: u.email || '',
      role: u.role, department: u.department || '', createdAt: u.createdAt,
      discordId: u.discordId || '', color: u.color || '', bio: u.bio || '', avatarBase64: u.avatarBase64 || '',
      passwordHash: u.passwordHash, salt: u.salt
    }));
    const settings = await db.settings.toArray();
    const attRows = await db.attachments.toArray();
    const attachments = [];
    for (const a of attRows) {
      if (!a.blob) continue;
      const dataBase64 = await LocalDB.blobToBase64(a.blob);
      attachments.push({
        id: a.id, projectId: a.projectId, taskId: a.taskId || null, uploadedBy: a.uploadedBy, fileName: a.fileName,
        mimeType: a.mimeType, documentType: a.documentType || '', createdAt: a.createdAt, dataBase64
      });
    }
    const activityLog = await db.activityLog.toArray();
    const notifications = await db.notifications.toArray();
    const webhooks = await db.webhooks.toArray();
    const sessions = await db.sessions.toArray();
    const projectAccessRequests = await db.projectAccessRequests.toArray();
    const bugReports = await db.bugReports.toArray();
    const classrooms = await db.classrooms.toArray();
    const userClassrooms = await db.userClassrooms.toArray();
    const directMessages = await db.directMessages.toArray();
    return { version: 12, exportedAt: new Date().toISOString(), projects, tasks, milestones, updates, users: safeUsers, settings, attachments, activityLog, notifications, webhooks, sessions, projectAccessRequests, bugReports, classrooms, userClassrooms, directMessages };
  },

  async importAll(data) {
    const replaceSettings = Object.prototype.hasOwnProperty.call(data, 'settings');
    await db.transaction('rw', [db.projects, db.tasks, db.milestones, db.updates, db.settings, db.attachments, db.activityLog, db.notifications, db.webhooks, db.sessions, db.projectAccessRequests, db.bugReports, db.classrooms, db.userClassrooms, db.directMessages], async () => {
      await Promise.all([
        db.projects.clear(), db.tasks.clear(), db.milestones.clear(), db.updates.clear(),
        db.attachments.clear(), db.activityLog.clear(), db.notifications.clear(), db.webhooks.clear(), db.sessions.clear(),
        db.projectAccessRequests.clear(), db.bugReports.clear(), db.classrooms.clear(), db.userClassrooms.clear(), db.directMessages.clear()
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
            taskId: a.taskId || null,
            uploadedBy: a.uploadedBy,
            fileName: a.fileName || 'file',
            mimeType: a.mimeType || 'application/octet-stream',
            documentType: a.documentType || '',
            blob,
            createdAt: a.createdAt || new Date().toISOString()
          });
        }
      }
      if (data.activityLog?.length) await db.activityLog.bulkAdd(data.activityLog);
      if (data.notifications?.length) await db.notifications.bulkAdd(data.notifications);
      if (data.webhooks?.length) await db.webhooks.bulkAdd(data.webhooks);
      if (data.sessions?.length) await db.sessions.bulkAdd(data.sessions);
      if (data.projectAccessRequests?.length) await db.projectAccessRequests.bulkAdd(data.projectAccessRequests);
      if (data.bugReports?.length) await db.bugReports.bulkAdd(data.bugReports);
      if (data.classrooms?.length) await db.classrooms.bulkAdd(data.classrooms);
      if (data.userClassrooms?.length) await db.userClassrooms.bulkAdd(data.userClassrooms);
      if (data.directMessages?.length) await db.directMessages.bulkAdd(data.directMessages);
    });
    await LocalDB.ensureDefaultClassroom();
  },

  /* Sample Data */
  async createSampleData(ownerId) {
    let sampleRoom = await db.classrooms.where('name').equals('Sample Classroom').first();
    const classroomId = sampleRoom?.id || await LocalDB.createClassroom({
      name: 'Sample Classroom',
      description: 'Demo workspace for sample projects',
      color: '#7c3aed'
    });
    await LocalDB.setUserClassrooms(ownerId, [...new Set([...(await LocalDB.getUserClassroomIds(ownerId)), classroomId])]);

    const jobId = await LocalDB.createProject({ name: 'Job Search', notes: 'Track applications, resume updates, and follow-ups.', type: 'job-search', priority: 'high', ownerId, classroomId });
    await LocalDB.createTask({ projectId: jobId, title: 'Update resume with latest experience', status: 'doing', priority: 'high' });
    await LocalDB.createTask({ projectId: jobId, title: 'Apply to 5 frontend developer roles', status: 'todo', priority: 'high', dueDate: '2026-05-20' });
    await LocalDB.createTask({ projectId: jobId, title: 'Send recruiter follow-up emails', status: 'done', priority: 'medium' });
    await LocalDB.createTask({ projectId: jobId, title: 'Prepare portfolio website', status: 'todo', priority: 'medium', dueDate: '2026-05-25' });
    await LocalDB.createMilestone({ projectId: jobId, title: 'Resume & portfolio ready', dueDate: '2026-05-18', weight: 3 });
    await LocalDB.createMilestone({ projectId: jobId, title: '10 applications sent', dueDate: '2026-06-01', weight: 5 });
    await LocalDB.createUpdate({ projectId: jobId, content: 'Started updating resume. Need to add the latest project work and skills section.' });

    const resId = await LocalDB.createProject({ name: 'ML Research Paper', notes: 'Investigating recommendation system approaches for the conference paper.', type: 'research', priority: 'medium', ownerId, classroomId });
    await LocalDB.createTask({ projectId: resId, title: 'Complete literature review on collaborative filtering', status: 'done' });
    await LocalDB.createTask({ projectId: resId, title: 'Write introduction chapter', status: 'doing', dueDate: '2026-05-22', priority: 'high' });
    await LocalDB.createTask({ projectId: resId, title: 'Run baseline experiments', status: 'todo', priority: 'high', dueDate: '2026-05-30' });
    await LocalDB.createMilestone({ projectId: resId, title: 'Literature review complete', weight: 2 });
    await LocalDB.createUpdate({ projectId: resId, content: 'Finished initial literature review. Found 3 promising approaches to compare.' });

    const sideId = await LocalDB.createProject({ name: 'Side Project \u2013 Budget App', notes: 'Personal finance tracking tool with charts and categories.', type: 'project', priority: 'low', ownerId, classroomId });
    await LocalDB.createTask({ projectId: sideId, title: 'Design database schema', status: 'done' });
    await LocalDB.createTask({ projectId: sideId, title: 'Build UI prototype', status: 'doing' });
    await LocalDB.createTask({ projectId: sideId, title: 'Add authentication', status: 'todo' });
    await LocalDB.createUpdate({ projectId: sideId, content: 'Decided on the tech stack. Going with a simple frontend approach first.' });
  }
};

window.LocalDB = LocalDB;
window.WT_CRYPTO = { hashPassword, generateSalt };
