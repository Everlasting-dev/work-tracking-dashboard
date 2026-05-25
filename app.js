/* ──── Icons ──── */

const ICONS = {
  folder: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
  checkCircle: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  trash: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
  edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
  arrowLeft: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
  x: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  flag: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>',
  clock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  chevronRight: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  calendar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  target: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  alertTriangle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  user: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  file: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  chevronDown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  upload: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>',
  download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  logOut: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
};

/* ──── Utilities ──── */

function esc(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

function formatDateShort(iso) {
  if (!iso) return '';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDateShort(iso.split('T')[0]);
}

function isOverdue(d) { return d && d < new Date().toISOString().split('T')[0]; }
function isDueSoon(d) { if (!d) return false; const diff = (new Date(d+'T00:00:00') - new Date()) / 864e5; return diff >= 0 && diff <= 3; }

/* ──── Config ──── */

const TYPE_CFG  = { 'project': { l: 'Project', c: 'blue' }, 'research': { l: 'Research', c: 'purple' }, 'job-search': { l: 'Job Search', c: 'green' }, 'idea': { l: 'Idea', c: 'amber' } };
const STAT_CFG  = { 'active': { l: 'Active', c: 'green' }, 'completed': { l: 'Completed', c: 'blue' }, 'on-hold': { l: 'On Hold', c: 'amber' }, 'archived': { l: 'Archived', c: 'muted' } };
const TSTATUS   = { 'todo': { l: 'To Do', c: 'amber' }, 'doing': { l: 'In Progress', c: 'blue' }, 'done': { l: 'Done', c: 'green' } };
const PRIO_CFG  = { 'low': { l: 'Low', c: 'muted' }, 'medium': { l: 'Medium', c: 'blue' }, 'high': { l: 'High', c: 'amber' }, 'urgent': { l: 'Urgent', c: 'red' } };

/* ──── Template Helpers ──── */

function badge(t, c) { return `<span class="badge badge-${c}">${t}</span>`; }
function typeBadge(t)    { const c = TYPE_CFG[t] || TYPE_CFG.project; return badge(c.l, c.c); }
function statusBadge(s)  { const c = STAT_CFG[s] || STAT_CFG.active; return badge(c.l, c.c); }
function taskBadge(s)    { const c = TSTATUS[s] || TSTATUS.todo; return badge(c.l, c.c); }
function prioBadge(p)    { const c = PRIO_CFG[p] || PRIO_CFG.medium; return badge(c.l, c.c); }
function progressBar(pct, sz = '') {
  const cls = sz ? `progress-bar progress-bar-${sz}` : 'progress-bar';
  const tone = pct >= 100 ? 'progress-done' : pct >= 50 ? 'progress-mid' : 'progress-low';
  return `<div class="${cls}"><div class="progress-fill ${tone}" style="width:${pct}%"></div></div>`;
}
function statCard(label, val, color, icon) {
  return `<div class="stat-card"><div class="stat-icon stat-icon-${color}">${icon}</div><div class="stat-info"><span class="stat-value">${val}</span><span class="stat-label">${label}</span></div></div>`;
}
function emptyState(m) { return `<div class="empty-state">${m}</div>`; }

/* ──── Session ──── */

function getSession() { try { return JSON.parse(sessionStorage.getItem('wt-session')); } catch { return null; } }
function setSession(u) { sessionStorage.setItem('wt-session', JSON.stringify({ userId: u.id, username: u.username, displayName: u.displayName, role: u.role })); }
function clearSession() { sessionStorage.removeItem('wt-session'); }
function isAdmin() { return getSession()?.role === 'admin'; }
function canEdit(project) { const s = getSession(); if (!s) return false; return s.role === 'admin' || project.ownerId === s.userId; }
function actorId() { return getSession()?.userId ?? null; }

function effectiveWorkspaceScope() {
  if (isAdmin()) return state.workspaceScope ?? 'everyone';
  return state.workspaceScope ?? 'mine';
}

function filterProjectsByWorkspace(projects) {
  if (effectiveWorkspaceScope() === 'everyone') return projects;
  const s = getSession();
  if (!s) return projects;
  return projects.filter(p => p.ownerId === s.userId);
}

function workspaceScopeBarHtml() {
  const sc = effectiveWorkspaceScope();
  return `<div class="workspace-scope-bar filter-bar" style="margin-bottom:4px">
    <span class="text-muted text-sm" style="margin-right:10px">Workspace</span>
    <button type="button" class="filter-tab ${sc === 'mine' ? 'active' : ''}" data-action="set-workspace-scope" data-scope="mine">Mine</button>
    <button type="button" class="filter-tab ${sc === 'everyone' ? 'active' : ''}" data-action="set-workspace-scope" data-scope="everyone">Everyone</button>
  </div>`;
}

/* ──── State ──── */

const state = {
  projectFilter: 'all',
  taskFilter: 'all',
  projectTab: 'tasks',
  currentProjectId: null,
  workspaceScope: null,
  docPanelOpen: true,
  userMenuOpen: false,
  _libraryBlobUrls: [],
  _previewUrl: null
};

let wtAppBootstrapped = false;

const RECOVERY_TTL_MS = 10 * 60 * 1000;

function setRecoveryUnlocked() {
  sessionStorage.setItem('wt-recovery-until', String(Date.now() + RECOVERY_TTL_MS));
}
function isRecoveryUnlocked() {
  const t = Number(sessionStorage.getItem('wt-recovery-until'));
  return Number.isFinite(t) && t > Date.now();
}
function clearRecoveryUnlock() {
  sessionStorage.removeItem('wt-recovery-until');
}

/* ──── Auth Screens ──── */

function renderLogin() {
  document.getElementById('auth-content').innerHTML = `
    <div class="auth-brand"><div class="brand-icon">W</div><span class="brand-name">WorkTracker</span></div>
    <h2>Welcome back</h2>
    <p class="auth-subtitle">Sign in to your account</p>
    <div class="auth-error" id="auth-error"></div>
    <form data-form="login">
      <div class="form-group"><label for="l-user">Username</label><input id="l-user" name="username" type="text" required autocomplete="username"></div>
      <div class="form-group"><label for="l-pw">Password</label><input id="l-pw" name="password" type="password" required autocomplete="current-password"></div>
      <div class="form-actions" style="justify-content:stretch"><button type="submit" class="btn btn-primary" style="flex:1;justify-content:center">Sign In</button></div>
    </form>
    <p class="auth-forgot"><a href="#/recovery">Forgot password?</a></p>`;
}

function renderAdminSetup() {
  document.getElementById('auth-content').innerHTML = `
    <div class="auth-brand"><div class="brand-icon">W</div><span class="brand-name">WorkTracker</span></div>
    <h2>Create administrator</h2>
    <p class="auth-subtitle">No accounts exist yet. Create the admin account and a master recovery key. Other users are added from Admin after you sign in.</p>
    <div class="auth-error" id="auth-error"></div>
    <form data-form="admin-setup">
      <div class="form-group"><label for="a-user">Username</label><input id="a-user" name="username" type="text" placeholder="e.g. admin" required autocomplete="username"></div>
      <div class="form-group"><label for="a-email">Email</label><input id="a-email" name="email" type="email" placeholder="you@example.com" required></div>
      <div class="form-group"><label for="a-name">Display Name</label><input id="a-name" name="displayName" type="text" placeholder="Your name"></div>
      <div class="form-group"><label for="a-pw">Password</label><input id="a-pw" name="password" type="password" placeholder="Minimum 4 characters" required minlength="4"></div>
      <div class="form-group"><label for="a-pw2">Confirm Password</label><input id="a-pw2" name="confirmPassword" type="password" required></div>
      <div class="form-group"><label for="a-master">Master Recovery Key</label><input id="a-master" name="masterKey" type="password" placeholder="Used at #/recovery to reset passwords" required minlength="4" autocomplete="new-password"></div>
      <div class="form-group"><label for="a-master2">Confirm Master Recovery Key</label><input id="a-master2" name="confirmMasterKey" type="password" required minlength="4" autocomplete="new-password"></div>
      <p class="text-muted text-sm" style="margin-bottom:8px">Store the recovery key safely. Accounts are not self-serve; you add members from the Admin panel.</p>
      <div class="form-actions" style="justify-content:stretch"><button type="submit" class="btn btn-primary" style="flex:1;justify-content:center">Create admin &amp; start</button></div>
    </form>`;
}

async function renderRecovery() {
  clearRecoveryUnlock();
  const hasMk = await DB.hasMasterKey();
  if (!hasMk) {
    document.getElementById('auth-content').innerHTML = `
      <div class="auth-brand"><div class="brand-icon">W</div><span class="brand-name">WorkTracker</span></div>
      <h2>Recovery unavailable</h2>
      <p class="auth-subtitle">No master recovery key was set for this workspace. Sign in as an admin and set one from the Admin panel.</p>
      <div class="form-actions" style="justify-content:stretch;margin-top:20px"><button type="button" class="btn btn-primary" style="flex:1;justify-content:center" data-action="recovery-back-login">Back to sign in</button></div>`;
    return;
  }
  document.getElementById('auth-content').innerHTML = `
    <div class="auth-brand"><div class="brand-icon">W</div><span class="brand-name">WorkTracker</span></div>
    <h2>Account recovery</h2>
    <p class="auth-subtitle">Enter your master recovery key to reset a user password.</p>
    <div class="auth-error" id="auth-error"></div>
    <form data-form="recovery-verify">
      <div class="form-group"><label for="rec-master">Master Recovery Key</label><input id="rec-master" name="masterKey" type="password" required autocomplete="off"></div>
      <div class="form-actions" style="justify-content:stretch"><button type="submit" class="btn btn-primary" style="flex:1;justify-content:center">Continue</button></div>
    </form>
    <div class="auth-toggle"><button type="button" data-action="recovery-back-login">Back to sign in</button></div>`;
}

async function renderRecoveryChooseUser() {
  const users = await DB.getUsers();
  const opts = users.map(u => `<option value="${u.id}">${esc(u.username)} — ${esc(u.displayName || u.username)}</option>`).join('');
  document.getElementById('auth-content').innerHTML = `
    <div class="auth-brand"><div class="brand-icon">W</div><span class="brand-name">WorkTracker</span></div>
    <h2>Reset password</h2>
    <p class="auth-subtitle">Choose a user and set a new password.</p>
    <div class="auth-error" id="auth-error"></div>
    <form data-form="recovery-reset">
      <div class="form-group"><label for="rec-user">User</label><select id="rec-user" name="userId" required>${opts}</select></div>
      <div class="form-group"><label for="rec-pw">New password</label><input id="rec-pw" name="password" type="password" required minlength="4" autocomplete="new-password"></div>
      <div class="form-group"><label for="rec-pw2">Confirm password</label><input id="rec-pw2" name="confirmPassword" type="password" required autocomplete="new-password"></div>
      <div class="form-actions" style="justify-content:stretch"><button type="submit" class="btn btn-primary" style="flex:1;justify-content:center">Update password</button></div>
    </form>
    <div class="auth-toggle"><button type="button" data-action="recovery-back-login">Cancel</button></div>`;
}


function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = msg; el.classList.add('visible'); }
}

async function handleAuth(e) {
  e.preventDefault();
  const form = e.target; if (!form.dataset.form) return;
  const fd = new FormData(form);
  const type = form.dataset.form;

  if (type === 'login') {
    const username = fd.get('username')?.trim();
    const password = fd.get('password');
    if (!username || !password) return;
    const user = await DB.getUserByUsername(username);
    if (!user) { showAuthError('Invalid username or password'); return; }
    const ok = await DB.verifyPassword(password, user);
    if (!ok) { showAuthError('Invalid username or password'); return; }
    setSession(user);
    await DB.logActivity({ userId: user.id, action: 'logged_in', entityType: 'session', details: user.username });
    await showApp();
  } else if (type === 'admin-setup') {
    if (await DB.hasUsers()) { showAuthError('An account already exists. Sign in.'); return; }
    const username = fd.get('username')?.trim();
    const email = fd.get('email')?.trim();
    const displayName = fd.get('displayName')?.trim() || username;
    const password = fd.get('password');
    const confirm = fd.get('confirmPassword');
    const masterKey = fd.get('masterKey')?.trim() || '';
    const masterConfirm = fd.get('confirmMasterKey')?.trim() || '';
    if (!username) { showAuthError('Username is required'); return; }
    if (!email) { showAuthError('Email is required'); return; }
    if (!password || password.length < 4) { showAuthError('Password must be at least 4 characters'); return; }
    if (password !== confirm) { showAuthError('Passwords do not match'); return; }
    if (!masterKey || masterKey.length < 4) { showAuthError('Master recovery key must be at least 4 characters'); return; }
    if (masterKey !== masterConfirm) { showAuthError('Master recovery keys do not match'); return; }
    const existing = await DB.getUserByUsername(username);
    if (existing) { showAuthError('Username already taken'); return; }
    const id = await DB.createUser({ username, displayName, email, password, role: 'admin' });
    await DB.setMasterKey(masterKey);
    setSession({ id, username, displayName, role: 'admin' });
    await showApp();
  } else if (type === 'recovery-verify') {
    const mk = fd.get('masterKey');
    if (!mk) return;
    const ok = await DB.verifyMasterKey(mk);
    if (!ok) { showAuthError('Invalid recovery key'); return; }
    setRecoveryUnlocked();
    await renderRecoveryChooseUser();
  } else if (type === 'recovery-reset') {
    if (!isRecoveryUnlocked()) {
      showAuthError('Session expired. Enter the recovery key again.');
      await renderRecovery();
      return;
    }
    const uid = Number(fd.get('userId'));
    const pw = fd.get('password');
    const cf = fd.get('confirmPassword');
    if (!uid || !pw || pw.length < 4) { showAuthError('Choose a user and enter a password (min 4 characters)'); return; }
    if (pw !== cf) { showAuthError('Passwords do not match'); return; }
    await DB.changePassword(uid, pw, uid);
    clearRecoveryUnlock();
    window.location.hash = '';
    renderLogin();
    showToast('Password updated. Sign in with the new password.', 'success');
  }
}

/* ──── App Shell Toggle ──── */

async function showApp() {
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';
  document.getElementById('menu-toggle').style.display = '';
  updateSidebarUser();
  const s = getSession();
  await DB.migrateFromLocalStorage(s.userId);
  if (await DB.isEmpty()) await DB.createSampleData(s.userId);
  await router();
  wtAppBootstrapped = true;
}

function updateSidebarUser() {
  const s = getSession(); if (!s) return;
  const init = (s.displayName || s.username).charAt(0).toUpperCase();
  const el = document.getElementById('sidebar-user');
  el.innerHTML = `
    <div class="user-avatar">${init}</div>
    <div class="user-details">
      <span class="user-name">${esc(s.displayName || s.username)}</span>
      <span class="user-role">@${esc(s.username)}</span>
    </div>
    <span class="user-menu-chevron">${ICONS.chevronDown}</span>`;
  el.setAttribute('aria-expanded', state.userMenuOpen ? 'true' : 'false');
  const nav = document.getElementById('nav-admin');
  if (nav) nav.style.display = s.role === 'admin' ? '' : 'none';
  renderUserMenu();
}

function renderUserMenu() {
  const menu = document.getElementById('user-menu');
  if (!menu) return;
  const s = getSession();
  if (!s || !state.userMenuOpen) {
    menu.classList.add('hidden');
    menu.innerHTML = '';
    return;
  }
  menu.classList.remove('hidden');
  const adminItems = isAdmin() ? `
    <button type="button" class="user-menu-item" data-action="user-export">${ICONS.download} Export Data</button>
    <button type="button" class="user-menu-item" data-action="user-import">${ICONS.upload} Import Data</button>` : '';
  menu.innerHTML = `
    ${adminItems}
    <button type="button" class="user-menu-item user-menu-item-danger" data-action="user-logout">${ICONS.logOut} Log Out</button>`;
}

function toggleUserMenu() {
  state.userMenuOpen = !state.userMenuOpen;
  updateSidebarUser();
}

function closeUserMenu() {
  if (!state.userMenuOpen) return;
  state.userMenuOpen = false;
  updateSidebarUser();
}

function formatActivityMessage(entry, uMap) {
  const who = uMap[entry.userId];
  const name = who ? (who.displayName || who.username) : 'Someone';
  const actionLabels = {
    created: 'created', updated: 'updated', deleted: 'deleted', uploaded: 'uploaded',
    noted: 'added a note on', password_changed: 'changed password for', logged_in: 'signed in', logged_out: 'signed out'
  };
  const typeLabels = {
    project: 'project', task: 'task', milestone: 'milestone', attachment: 'file',
    update: 'update', user: 'account'
  };
  const verb = actionLabels[entry.action] || entry.action;
  const type = typeLabels[entry.entityType] || entry.entityType;
  const detail = entry.details ? `: <em>${esc(entry.details)}</em>` : '';
  if (entry.action === 'password_changed') return `${esc(name)} ${verb} an account`;
  if (entry.action === 'logged_in' || entry.action === 'logged_out') return `${esc(name)} ${verb}`;
  if (entry.action === 'noted') return `${esc(name)} ${verb} ${type}${detail}`;
  return `${esc(name)} ${verb} ${type}${detail}`;
}

/* ──── Views ──── */

async function renderProjects() {
  const content = document.getElementById('content');
  const s = getSession();
  const allRaw = await DB.getProjects();
  const all = filterProjectsByWorkspace(allRaw);
  const f = state.projectFilter;
  const list = f === 'all' ? all : all.filter(p => p.status === f);
  const users = await DB.getUsers();
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));

  const pData = await Promise.all(list.map(async p => ({
    ...p, progress: await DB.getProjectProgress(p.id),
    taskCount: (await DB.getTasks({ projectId: p.id })).length,
    doneCount: (await DB.getTasks({ projectId: p.id, status: 'done' })).length
  })));

  const cnt = { all: all.length, active: all.filter(p => p.status === 'active').length, completed: all.filter(p => p.status === 'completed').length, 'on-hold': all.filter(p => p.status === 'on-hold').length, archived: all.filter(p => p.status === 'archived').length };
  const fLabels = { all: 'All', active: 'Active', completed: 'Completed', 'on-hold': 'On Hold', archived: 'Archived' };

  const teamHint = !isAdmin() && effectiveWorkspaceScope() === 'mine'
    ? `<p class="text-muted text-sm workspace-hint">Use <strong>Everyone</strong> to browse teammates&apos; projects (read-only).</p>` : '';

  content.innerHTML = `
    <div class="view-header">
      <div><h1>Projects</h1><p class="view-subtitle">${all.length} in this workspace &middot; ${allRaw.length} total</p></div>
      <div class="view-actions">
        <button class="btn btn-ghost" data-action="add-task">${ICONS.plus} New Task</button>
        <button class="btn btn-primary" data-action="add-project">${ICONS.plus} New Project</button>
      </div>
    </div>
    ${teamHint}
    ${workspaceScopeBarHtml()}
    <div class="filter-bar">${Object.entries(fLabels).map(([k, l]) => `
      <button class="filter-tab ${f === k ? 'active' : ''}" data-action="filter-projects" data-filter="${k}">${l} (${cnt[k]})</button>`).join('')}
    </div>
    ${pData.length === 0 ? emptyState(f === 'all' ? 'No projects yet.' : `No ${fLabels[f].toLowerCase()} projects.`) :
    `<div class="projects-grid">${pData.map(p => { const owner = uMap[p.ownerId]; const mine = p.ownerId === s.userId; return `
      <a href="#/projects/${p.id}" class="project-card">
        <div class="project-card-top">${typeBadge(p.type)} ${statusBadge(p.status)} ${!mine ? badge('View Only', 'muted') : ''}</div>
        <h3 class="project-card-title">${esc(p.name)}</h3>
        <p class="project-card-notes">${esc(p.notes || 'No description')}</p>
        <div class="project-card-progress">${progressBar(p.progress)}<span class="text-muted text-sm">${p.progress}% &middot; ${p.doneCount}/${p.taskCount} tasks</span></div>
        <div class="project-card-footer">
          <span class="text-muted text-sm">${ICONS.clock} ${timeAgo(p.updatedAt)}</span>
          <span class="text-muted text-sm">${ICONS.user} ${owner ? esc(owner.displayName) : 'Unknown'}</span>
        </div>
      </a>`; }).join('')}</div>`}`;
}

async function renderProjectDetail(projectId) {
  const content = document.getElementById('content');
  const main = document.getElementById('main-content');
  if (state._libraryBlobUrls?.length) {
    state._libraryBlobUrls.forEach(u => { try { URL.revokeObjectURL(u); } catch (_) {} });
    state._libraryBlobUrls = [];
  }
  const project = await DB.getProject(projectId);
  if (!project) {
    hideDocumentPanel();
    if (main) main.classList.remove('with-doc-panel');
    content.innerHTML = `<div class="view-header"><a href="#/projects" class="btn btn-ghost">${ICONS.arrowLeft} Back</a></div>${emptyState('Project not found.')}`;
    return;
  }

  const s = getSession();
  const editable = canEdit(project);
  const progress = await DB.getProjectProgress(projectId);
  const tasks = await DB.getTasks({ projectId });
  const milestones = await DB.getMilestones(projectId);
  const users = await DB.getUsers();
  const owner = users.find(u => u.id === project.ownerId);
  const tab = state.projectTab;
  const attList = await DB.getAttachments(projectId);
  const attCount = attList.length;

  if (main) main.classList.toggle('with-doc-panel', state.docPanelOpen);
  await renderDocumentPanel(projectId, editable);

  content.innerHTML = `
    <div class="view-header">
      <div class="breadcrumb">
        <a href="#/projects" class="breadcrumb-link">${ICONS.arrowLeft} Projects</a>
        <span class="breadcrumb-sep">/</span><span>${esc(project.name)}</span>
      </div>
      <div class="view-actions">
        <button type="button" class="btn btn-ghost ${state.docPanelOpen ? 'active' : ''}" data-action="toggle-doc-panel" title="Documents panel">${ICONS.file} Files (${attCount})</button>
        ${editable ? `<button class="btn btn-ghost" data-action="edit-project" data-id="${project.id}">${ICONS.edit} Edit</button>
        <button class="btn btn-ghost btn-danger-text" data-action="delete-project" data-id="${project.id}">${ICONS.trash} Delete</button>` :
        badge('View Only', 'muted')}
      </div>
    </div>
    <div class="project-hero">
      <div class="project-hero-badges">${typeBadge(project.type)} ${statusBadge(project.status)} ${prioBadge(project.priority)}</div>
      <h1>${esc(project.name)}</h1>
      <p class="text-secondary">${esc(project.notes || 'No description added.')}</p>
      <p class="text-muted text-sm" style="margin-top:6px">${ICONS.user} ${owner ? esc(owner.displayName) : 'Unknown'}</p>
      <div class="project-hero-progress">${progressBar(progress, 'lg')}<span class="text-muted">${progress}% complete &middot; ${tasks.filter(t => t.status === 'done').length}/${tasks.length} tasks done</span></div>
    </div>
    <div class="tab-bar">
      <button class="tab-btn ${tab === 'tasks' ? 'active' : ''}" data-action="switch-tab" data-tab="tasks" data-project-id="${projectId}">Tasks (${tasks.length})</button>
      <button class="tab-btn ${tab === 'milestones' ? 'active' : ''}" data-action="switch-tab" data-tab="milestones" data-project-id="${projectId}">Milestones (${milestones.length})</button>
      <button class="tab-btn ${tab === 'library' ? 'active' : ''}" data-action="switch-tab" data-tab="library" data-project-id="${projectId}">Library (${attCount})</button>
      <button class="tab-btn ${tab === 'updates' ? 'active' : ''}" data-action="switch-tab" data-tab="updates" data-project-id="${projectId}">Activity</button>
    </div>
    <div id="tab-content"></div>`;
  await renderTab(tab, projectId, editable);
}

function hideDocumentPanel() {
  const panel = document.getElementById('document-panel');
  if (panel) { panel.classList.add('hidden'); panel.innerHTML = ''; }
}

async function renderDocumentPanel(projectId, editable) {
  const panel = document.getElementById('document-panel');
  const main = document.getElementById('main-content');
  if (!panel) return;
  if (!state.docPanelOpen) {
    panel.classList.add('hidden');
    if (main) main.classList.remove('with-doc-panel');
    return;
  }
  const items = await DB.getAttachments(projectId);
  const users = await DB.getUsers();
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));
  panel.classList.remove('hidden');
  if (main) main.classList.add('with-doc-panel');

  const listHtml = items.length === 0
    ? `<p class="doc-panel-empty">No documents yet.</p>`
    : items.map(item => {
      const who = uMap[item.uploadedBy];
      const isImg = item.mimeType?.startsWith('image/');
      const icon = isImg ? '🖼' : (item.mimeType === 'application/pdf' ? '📄' : '📎');
      return `<button type="button" class="doc-panel-item" data-action="preview-attachment" data-id="${item.id}">
        <span class="doc-panel-icon">${icon}</span>
        <span class="doc-panel-info">
          <span class="doc-panel-name">${esc(item.fileName)}</span>
          <span class="doc-panel-meta">${who ? esc(who.displayName) : 'Unknown'} · ${timeAgo(item.createdAt)}</span>
        </span>
      </button>`;
    }).join('');

  panel.innerHTML = `
    <div class="doc-panel-header">
      <h3>Documents</h3>
      <button type="button" class="btn-icon" data-action="toggle-doc-panel" title="Close panel">${ICONS.x}</button>
    </div>
    ${editable ? `<button type="button" class="btn btn-sm btn-primary doc-panel-upload" data-action="library-pick-upload" data-project-id="${projectId}">${ICONS.upload} Upload</button>` : ''}
    <div class="doc-panel-list">${listHtml}</div>`;
}

function closeFilePreview() {
  if (state._previewUrl) {
    try { URL.revokeObjectURL(state._previewUrl); } catch (_) {}
    state._previewUrl = null;
  }
  const ov = document.getElementById('file-preview-overlay');
  if (ov) {
    ov.classList.add('hidden');
    document.getElementById('file-preview-body').innerHTML = '';
    document.getElementById('file-preview-title').textContent = '';
  }
}

async function openFilePreview(attachmentId) {
  const item = await DB.getAttachment(attachmentId);
  if (!item?.blob) { showToast('File not found', 'error'); return; }
  const url = URL.createObjectURL(item.blob);
  if (state._previewUrl) try { URL.revokeObjectURL(state._previewUrl); } catch (_) {}
  state._previewUrl = url;
  const ov = document.getElementById('file-preview-overlay');
  const body = document.getElementById('file-preview-body');
  const title = document.getElementById('file-preview-title');
  title.textContent = item.fileName;
  const mime = item.mimeType || '';
  if (mime.startsWith('image/')) {
    body.innerHTML = `<img src="${url}" alt="${esc(item.fileName)}" class="file-preview-image">`;
  } else if (mime === 'application/pdf') {
    body.innerHTML = `<iframe src="${url}" class="file-preview-pdf" title="${esc(item.fileName)}"></iframe>`;
  } else if (mime.startsWith('text/')) {
    const text = await item.blob.text();
    body.innerHTML = `<pre class="file-preview-text">${esc(text)}</pre>`;
  } else {
    body.innerHTML = `<div class="file-preview-fallback">
      <p>Preview not available for this file type.</p>
      <a href="${url}" download="${esc(item.fileName)}" class="btn btn-primary">${ICONS.download} Download</a>
    </div>`;
  }
  ov.classList.remove('hidden');
}

async function renderTab(tab, projectId, editable) {
  const el = document.getElementById('tab-content'); if (!el) return;

  if (tab === 'tasks') {
    const tasks = await DB.getTasks({ projectId });
    el.innerHTML = `
      ${editable ? `<div class="tab-header"><button class="btn btn-sm btn-primary" data-action="add-task" data-project-id="${projectId}">${ICONS.plus} Add Task</button></div>` : ''}
      ${tasks.length === 0 ? emptyState('No tasks yet.') :
      `<div class="task-list">${tasks.map(t => { const od = isOverdue(t.dueDate) && t.status !== 'done'; return `
        <div class="task-item ${t.status === 'done' ? 'task-done' : ''}">
          <div class="task-item-left">
            ${editable
              ? `<button class="status-dot status-dot-${t.status}" data-action="cycle-task-status" data-id="${t.id}" title="Change status"></button>`
              : `<span class="status-dot status-dot-${t.status}"></span>`}
            <div class="task-item-info">
              <strong class="${t.status === 'done' ? 'text-strikethrough' : ''}">${esc(t.title)}</strong>
              <div class="task-item-meta">
                ${t.dueDate ? `<span class="${od ? 'overdue' : isDueSoon(t.dueDate) ? 'due-soon' : 'text-muted'}">${ICONS.calendar} ${formatDateShort(t.dueDate)}</span>` : ''}
                ${t.priority !== 'medium' ? prioBadge(t.priority) : ''}
              </div>
            </div>
          </div>
          <div class="task-item-right">
            ${taskBadge(t.status)}
            ${editable ? `<button class="btn-icon" data-action="delete-task" data-id="${t.id}" title="Delete">${ICONS.trash}</button>` : ''}
          </div>
        </div>`; }).join('')}</div>`}`;
  } else if (tab === 'milestones') {
    const ms = await DB.getMilestones(projectId);
    el.innerHTML = `
      ${editable ? `<div class="tab-header"><button class="btn btn-sm btn-primary" data-action="add-milestone" data-project-id="${projectId}">${ICONS.plus} Add Milestone</button></div>` : ''}
      ${ms.length === 0 ? emptyState('No milestones yet.') :
      `<div class="milestone-list">${ms.map(m => `
        <div class="milestone-item">
          <div class="milestone-icon">${ICONS.flag}</div>
          <div class="milestone-info">
            <strong>${esc(m.title)}</strong>
            <div class="milestone-meta">
              ${m.dueDate ? `<span class="${isOverdue(m.dueDate) && m.status !== 'completed' ? 'overdue' : 'text-muted'}">${ICONS.calendar} ${formatDateShort(m.dueDate)}</span>` : ''}
              <span class="text-muted">Weight: ${m.weight}</span>
              ${badge(m.status === 'completed' ? 'Completed' : m.status === 'in-progress' ? 'In Progress' : 'Pending', m.status === 'completed' ? 'green' : m.status === 'in-progress' ? 'blue' : 'muted')}
            </div>
          </div>
          <div class="milestone-actions">
            ${editable && m.status !== 'completed' ? `<button class="btn btn-sm btn-ghost" data-action="complete-milestone" data-id="${m.id}">Mark Done</button>` : ''}
            ${editable ? `<button class="btn-icon" data-action="delete-milestone" data-id="${m.id}" title="Delete">${ICONS.trash}</button>` : ''}
          </div>
        </div>`).join('')}</div>`}`;
  } else if (tab === 'library') {
    if (state._libraryBlobUrls?.length) {
      state._libraryBlobUrls.forEach(u => { try { URL.revokeObjectURL(u); } catch (_) {} });
    }
    state._libraryBlobUrls = [];
    const items = await DB.getAttachments(projectId);
    const users = await DB.getUsers();
    const uMap = Object.fromEntries(users.map(u => [u.id, u]));
    const cards = items.map(item => {
      const blob = item.blob;
      if (!blob) return '';
      const url = URL.createObjectURL(blob);
      state._libraryBlobUrls.push(url);
      const who = uMap[item.uploadedBy];
      const whoLabel = who ? esc(who.displayName || who.username) : 'Unknown';
      const isImg = item.mimeType && item.mimeType.startsWith('image/');
      const preview = isImg
        ? `<button type="button" class="library-card-preview" data-action="preview-attachment" data-id="${item.id}"><img src="${url}" alt=""></button>`
        : `<button type="button" class="library-card-file" data-action="preview-attachment" data-id="${item.id}">${esc(item.fileName)}</button>`;
      const del = editable ? `<button type="button" class="btn-icon" data-action="delete-attachment" data-id="${item.id}" title="Remove">${ICONS.trash}</button>` : '';
      return `<div class="library-card">
        ${preview}
        <div class="library-card-meta">
          <span class="text-muted text-sm">${whoLabel} &middot; ${timeAgo(item.createdAt)}</span>
          ${del}
        </div>
      </div>`;
    }).join('');
    el.innerHTML = `
      ${editable ? `<div class="tab-header"><button type="button" class="btn btn-sm btn-primary" data-action="library-pick-upload" data-project-id="${projectId}">${ICONS.plus} Upload files</button><span class="text-muted text-sm tab-hint">Max 10 MB per file. Click to preview.</span></div>` : `<p class="text-muted text-sm tab-hint">View files in the panel on the right, or open from the grid below.</p>`}
      ${items.length === 0 ? emptyState('No files yet. Use the Documents panel or Upload to add files.') : `<div class="library-grid">${cards}</div>`}`;
    await renderDocumentPanel(projectId, editable);
  } else if (tab === 'updates') {
    const s = getSession();
    const logs = await DB.getActivityLog({
      projectId,
      viewerUserId: s.userId,
      isAdmin: isAdmin()
    });
    const users = await DB.getUsers();
    const uMap = Object.fromEntries(users.map(u => [u.id, u]));
    el.innerHTML = `
      ${editable ? `<div class="tab-header"><button class="btn btn-sm btn-primary" data-action="add-update" data-project-id="${projectId}">${ICONS.plus} Add Note</button></div>` : ''}
      <p class="text-muted text-sm tab-hint activity-hint">Activity log — visible to you${isAdmin() ? ' and all admins' : ''}.</p>
      ${logs.length === 0 ? emptyState('No activity recorded yet.') :
      `<div class="activity-log">${logs.map(entry => {
        const who = uMap[entry.userId];
        const init = who ? (who.displayName || who.username).charAt(0).toUpperCase() : '?';
        return `<div class="activity-log-item">
          <div class="activity-log-avatar">${init}</div>
          <div class="activity-log-body">
            <p class="activity-log-text">${formatActivityMessage(entry, uMap)}</p>
            <span class="text-muted text-sm">${timeAgo(entry.createdAt)}</span>
          </div>
        </div>`;
      }).join('')}</div>`}`;
  }
}

async function renderTasks() {
  const content = document.getElementById('content');
  const s = getSession();
  const projectsVisible = filterProjectsByWorkspace(await DB.getProjects());
  const pids = new Set(projectsVisible.map(p => p.id));
  let all = await DB.getTasks();
  all = all.filter(t => pids.has(t.projectId));
  const f = state.taskFilter;
  const tasks = f === 'all' ? all : all.filter(t => t.status === f);
  const projects = await DB.getProjects();
  const pMap = Object.fromEntries(projects.map(p => [p.id, p]));
  const cnt = { all: all.length, todo: all.filter(t => t.status === 'todo').length, doing: all.filter(t => t.status === 'doing').length, done: all.filter(t => t.status === 'done').length };
  const fLabels = { all: 'All', todo: 'To Do', doing: 'In Progress', done: 'Done' };

  content.innerHTML = `
    <div class="view-header">
      <div><h1>Tasks</h1><p class="view-subtitle">${all.length} tasks in this workspace</p></div>
      <div class="view-actions"><button class="btn btn-primary" data-action="add-task">${ICONS.plus} New Task</button></div>
    </div>
    ${workspaceScopeBarHtml()}
    <div class="filter-bar">${Object.entries(fLabels).map(([k, l]) => `
      <button class="filter-tab ${f === k ? 'active' : ''}" data-action="filter-tasks" data-filter="${k}">${l} (${cnt[k]})</button>`).join('')}
    </div>
    ${tasks.length === 0 ? emptyState(f === 'all' ? 'No tasks yet.' : `No ${fLabels[f].toLowerCase()} tasks.`) :
    `<div class="task-table">${tasks.map(t => { const proj = pMap[t.projectId]; const editable = proj && canEdit(proj); const od = isOverdue(t.dueDate) && t.status !== 'done'; return `
      <div class="task-table-row ${t.status === 'done' ? 'task-done' : ''}">
        <div class="task-table-left">
          ${editable
            ? `<button class="status-dot status-dot-${t.status}" data-action="cycle-task-status" data-id="${t.id}" title="Change status"></button>`
            : `<span class="status-dot status-dot-${t.status}"></span>`}
          <div>
            <strong class="${t.status === 'done' ? 'text-strikethrough' : ''}">${esc(t.title)}</strong>
            ${proj ? `<a href="#/projects/${proj.id}" class="text-muted text-sm task-project-link">${esc(proj.name)}</a>` : ''}
          </div>
        </div>
        <div class="task-table-right">
          ${t.dueDate ? `<span class="due-date ${od ? 'overdue' : isDueSoon(t.dueDate) ? 'due-soon' : ''}">${formatDateShort(t.dueDate)}</span>` : '<span class="text-muted text-sm">No date</span>'}
          ${prioBadge(t.priority)} ${taskBadge(t.status)}
          ${editable ? `<button class="btn-icon" data-action="delete-task" data-id="${t.id}" title="Delete">${ICONS.trash}</button>` : ''}
        </div>
      </div>`; }).join('')}</div>`}`;
}

async function renderAdmin() {
  if (!isAdmin()) { window.location.hash = '#/projects'; return; }
  const content = document.getElementById('content');
  const users = await DB.getUsers();
  const s = getSession();
  const hasMk = await DB.hasMasterKey();
  const masterKeySection = !hasMk ? `
    <section class="section-card" style="margin-bottom:24px">
      <div class="section-header"><h2>Master recovery key</h2></div>
      <div class="section-body" style="padding:20px">
        <p class="text-secondary text-sm" style="margin-bottom:14px">No recovery key is set yet. Set one so you can use <strong>#/recovery</strong> to reset passwords if you are locked out.</p>
        <form data-form="set-master-key">
          <div class="form-group"><label>Master recovery key</label><input name="masterKey" type="password" placeholder="Min 4 characters" required minlength="4" autocomplete="new-password"></div>
          <div class="form-group"><label>Confirm recovery key</label><input name="confirmMasterKey" type="password" required minlength="4" autocomplete="new-password"></div>
          <button type="submit" class="btn btn-primary">Save recovery key</button>
        </form>
      </div>
    </section>` : '';

  content.innerHTML = `
    <div class="view-header">
      <div><h1>Admin Panel</h1><p class="view-subtitle">Manage users and settings</p></div>
      <div class="view-actions"><button class="btn btn-primary" data-action="add-user">${ICONS.plus} Add User</button></div>
    </div>
    ${masterKeySection}
    <section class="section-card" style="margin-bottom:24px">
      <div class="section-header"><h2>Users (${users.length})</h2></div>
      <div class="section-body">${users.map(u => `
        <div class="user-row">
          <div class="user-row-info">
            <div class="user-avatar-sm">${(u.displayName || u.username).charAt(0).toUpperCase()}</div>
            <div><strong>${esc(u.displayName || u.username)}</strong><br><span class="text-muted text-sm">@${esc(u.username)}${u.email ? ` &middot; ${esc(u.email)}` : ''}</span></div>
            ${badge(u.role === 'admin' ? 'Admin' : 'Member', u.role === 'admin' ? 'purple' : 'blue')}
          </div>
          <div class="user-row-actions">
            <button class="btn btn-sm btn-ghost" data-action="reset-password" data-id="${u.id}">Reset PW</button>
            ${u.id !== s.userId ? `<button class="btn-icon" data-action="delete-user" data-id="${u.id}" title="Delete user">${ICONS.trash}</button>` : ''}
          </div>
        </div>`).join('')}
      </div>
    </section>
    <section class="section-card">
      <div class="section-header"><h2>Data Management</h2></div>
      <div class="section-body" style="padding:20px">
        <p class="text-secondary text-sm" style="margin-bottom:12px">Reset the database to sample data. This deletes projects, tasks, milestones, activity, and uploaded library files.</p>
        <button class="btn btn-ghost btn-danger-text" data-action="reset-sample-data">${ICONS.trash} Reset to Sample Data</button>
      </div>
    </section>`;
}

/* ──── Modal System ──── */

function showModal(title, body) {
  const ov = document.getElementById('modal-overlay');
  ov.innerHTML = `<div class="modal"><div class="modal-header"><h2>${title}</h2><button class="btn-icon" data-action="close-modal">${ICONS.x}</button></div><div class="modal-body">${body}</div></div>`;
  ov.classList.remove('hidden');
  const inp = ov.querySelector('input:not([type=hidden]),textarea,select');
  if (inp) setTimeout(() => inp.focus(), 50);
}
function hideModal() { const ov = document.getElementById('modal-overlay'); ov.classList.add('hidden'); ov.innerHTML = ''; }

async function showProjectModal(editId = null) {
  const p = editId ? await DB.getProject(editId) : null;
  const isE = !!p;
  showModal(isE ? 'Edit Project' : 'New Project', `
    <form data-form="project" data-edit-id="${editId || ''}">
      <div class="form-group"><label>Project Name</label><input name="name" type="text" value="${esc(p?.name || '')}" placeholder="e.g. Job Search" required></div>
      <div class="form-group"><label>Description</label><textarea name="notes" rows="3" placeholder="Brief description...">${esc(p?.notes || '')}</textarea></div>
      <div class="form-row">
        <div class="form-group"><label>Type</label><select name="type">${Object.entries(TYPE_CFG).map(([v, c]) => `<option value="${v}" ${(p?.type || 'project') === v ? 'selected' : ''}>${c.l}</option>`).join('')}</select></div>
        <div class="form-group"><label>Priority</label><select name="priority">${Object.entries(PRIO_CFG).map(([v, c]) => `<option value="${v}" ${(p?.priority || 'medium') === v ? 'selected' : ''}>${c.l}</option>`).join('')}</select></div>
      </div>
      ${isE ? `<div class="form-group"><label>Status</label><select name="status">${Object.entries(STAT_CFG).map(([v, c]) => `<option value="${v}" ${p.status === v ? 'selected' : ''}>${c.l}</option>`).join('')}</select></div>` : ''}
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">${isE ? 'Save' : 'Create Project'}</button></div>
    </form>`);
}

async function showTaskModal(preId = null) {
  const projects = await DB.getProjects();
  const editable = projects.filter(p => canEdit(p));
  if (editable.length === 0) { showToast('No projects you can add tasks to', 'warning'); return; }
  const lockedProject = preId ? editable.find(p => p.id === preId) : null;
  if (preId && !lockedProject) { showToast('You cannot add tasks to this project', 'error'); return; }
  const projectField = lockedProject
    ? `<input type="hidden" name="projectId" value="${lockedProject.id}">
       <div class="form-group"><label>Project</label><input type="text" value="${esc(lockedProject.name)}" disabled class="input-disabled"></div>`
    : `<div class="form-group"><label>Project</label><select name="projectId" required>${editable.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></div>`;
  showModal('New Task', `
    <form data-form="task">
      ${projectField}
      <div class="form-group"><label>Task Title</label><input name="title" type="text" placeholder="What needs to be done?" required autofocus></div>
      <div class="form-row">
        <div class="form-group"><label>Due Date</label><input name="dueDate" type="date"></div>
        <div class="form-group"><label>Priority</label><select name="priority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
      </div>
      <div class="form-group"><label>Status</label><select name="status"><option value="todo" selected>To Do</option><option value="doing">In Progress</option><option value="done">Done</option></select></div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Add Task</button></div>
    </form>`);
}

function showMilestoneModal(pid) {
  showModal('New Milestone', `
    <form data-form="milestone" data-project-id="${pid}">
      <div class="form-group"><label>Title</label><input name="title" type="text" placeholder="e.g. Resume ready" required></div>
      <div class="form-row">
        <div class="form-group"><label>Due Date</label><input name="dueDate" type="date"></div>
        <div class="form-group"><label>Weight (1\u201310)</label><input name="weight" type="number" min="1" max="10" value="1"></div>
      </div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Add Milestone</button></div>
    </form>`);
}

function showUpdateModal(pid) {
  showModal('Add Update', `
    <form data-form="update" data-project-id="${pid}">
      <div class="form-group"><label>What\u2019s new?</label><textarea name="content" rows="4" placeholder="Progress, blockers, next steps..." required></textarea></div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Add Update</button></div>
    </form>`);
}

function showAddUserModal() {
  showModal('Add User', `
    <form data-form="add-user">
      <div class="form-group"><label>Username</label><input name="username" type="text" placeholder="e.g. john" required></div>
      <div class="form-group"><label>Email</label><input name="email" type="email" placeholder="john@example.com"></div>
      <div class="form-group"><label>Display Name</label><input name="displayName" type="text" placeholder="e.g. John Smith"></div>
      <div class="form-group"><label>Password</label><input name="password" type="password" placeholder="Min 4 characters" required minlength="4"></div>
      <div class="form-group"><label>Role</label><select name="role"><option value="user" selected>Member</option><option value="admin">Admin</option></select></div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Create User</button></div>
    </form>`);
}

function showResetPwModal(uid) {
  showModal('Reset Password', `
    <form data-form="reset-pw" data-user-id="${uid}">
      <div class="form-group"><label>New Password</label><input name="password" type="password" placeholder="Min 4 characters" required minlength="4"></div>
      <div class="form-group"><label>Confirm</label><input name="confirm" type="password" required></div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Reset</button></div>
    </form>`);
}


async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target; if (!form.dataset.form) return;
  const fd = new FormData(form); const type = form.dataset.form;
  try {
    const uid = actorId();
    if (type === 'project') {
      const data = { name: fd.get('name')?.trim(), notes: fd.get('notes')?.trim(), type: fd.get('type'), priority: fd.get('priority') };
      if (!data.name) return;
      const editId = form.dataset.editId;
      if (editId) {
        const sv = fd.get('status'); if (sv) data.status = sv;
        await DB.updateProject(Number(editId), data, uid);
        showToast('Project updated', 'success');
      } else {
        data.ownerId = getSession().userId;
        data.actorUserId = uid;
        const nid = await DB.createProject(data);
        showToast('Project created', 'success'); hideModal();
        window.location.hash = `#/projects/${nid}`; return;
      }
    } else if (type === 'task') {
      const data = { projectId: Number(fd.get('projectId')), title: fd.get('title')?.trim(), dueDate: fd.get('dueDate') || '', priority: fd.get('priority'), status: fd.get('status'), actorUserId: uid };
      if (!data.title || !data.projectId) return;
      await DB.createTask(data); showToast('Task added', 'success');
    } else if (type === 'milestone') {
      const data = { projectId: Number(form.dataset.projectId), title: fd.get('title')?.trim(), dueDate: fd.get('dueDate') || '', weight: Number(fd.get('weight')) || 1, actorUserId: uid };
      if (!data.title) return;
      await DB.createMilestone(data); showToast('Milestone added', 'success');
    } else if (type === 'update') {
      const data = { projectId: Number(form.dataset.projectId), content: fd.get('content')?.trim(), actorUserId: uid };
      if (!data.content) return;
      await DB.createUpdate(data); showToast('Note added', 'success');
    } else if (type === 'add-user') {
      const username = fd.get('username')?.trim();
      const email = fd.get('email')?.trim() || '';
      const displayName = fd.get('displayName')?.trim() || username;
      const password = fd.get('password');
      const role = fd.get('role');
      if (!username || !password || password.length < 4) { showToast('Fill all fields (pw min 4 chars)', 'warning'); return; }
      const exists = await DB.getUserByUsername(username);
      if (exists) { showToast('Username already taken', 'error'); return; }
      await DB.createUser({ username, displayName, email, password, role });
      showToast('User created', 'success');
    } else if (type === 'reset-pw') {
      const pw = fd.get('password'); const confirm = fd.get('confirm');
      if (!pw || pw.length < 4) { showToast('Password min 4 characters', 'warning'); return; }
      if (pw !== confirm) { showToast('Passwords do not match', 'error'); return; }
      await DB.changePassword(Number(form.dataset.userId), pw, actorId());
      showToast('Password reset', 'success');
    } else if (type === 'set-master-key') {
      if (!isAdmin()) { showToast('Permission denied', 'error'); return; }
      const mk = fd.get('masterKey')?.trim();
      const cf = fd.get('confirmMasterKey')?.trim();
      if (!mk || mk.length < 4) { showToast('Master recovery key must be at least 4 characters', 'warning'); return; }
      if (mk !== cf) { showToast('Recovery keys do not match', 'error'); return; }
      if (await DB.hasMasterKey()) { showToast('Recovery key is already set', 'warning'); return; }
      await DB.setMasterKey(mk);
      showToast('Master recovery key saved', 'success');
    }
    hideModal(); await router();
  } catch (err) { console.error(err); showToast('Something went wrong', 'error'); }
}

/* ──── Actions ──── */

const actions = {
  'add-project': () => showProjectModal(),
  'add-task': (b) => showTaskModal(Number(b.dataset.projectId) || null),
  'add-milestone': (b) => showMilestoneModal(Number(b.dataset.projectId)),
  'add-update': (b) => showUpdateModal(Number(b.dataset.projectId)),
  'edit-project': (b) => showProjectModal(Number(b.dataset.id)),
  'delete-project': async (b) => {
    const p = await DB.getProject(Number(b.dataset.id));
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    if (!confirm('Delete this project and all its data?')) return;
    await DB.deleteProject(p.id, actorId()); showToast('Project deleted', 'success');
    window.location.hash = '#/projects';
  },
  'cycle-task-status': async (b) => {
    const t = await DB.getTask(Number(b.dataset.id)); if (!t) return;
    const p = await DB.getProject(t.projectId);
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    await DB.updateTask(t.id, { status: { todo: 'doing', doing: 'done', done: 'todo' }[t.status] }, actorId());
    await router();
  },
  'delete-task': async (b) => {
    const t = await DB.getTask(Number(b.dataset.id)); if (!t) return;
    const p = await DB.getProject(t.projectId);
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    await DB.deleteTask(t.id, actorId()); showToast('Task deleted', 'success'); await router();
  },
  'delete-milestone': async (b) => {
    const id = Number(b.dataset.id);
    const m = await db.milestones.get(id);
    if (!m) return;
    const p = await DB.getProject(m.projectId);
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    await DB.deleteMilestone(id, actorId()); showToast('Milestone deleted', 'success'); await router();
  },
  'complete-milestone': async (b) => {
    const id = Number(b.dataset.id);
    const ms = await db.milestones.get(id);
    const p = ms ? await DB.getProject(ms.projectId) : null;
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    await DB.updateMilestone(id, { status: 'completed' }, actorId()); showToast('Milestone completed', 'success'); await router();
  },
  'delete-update': async (b) => {
    const row = await db.updates.get(Number(b.dataset.id));
    const p = row ? await DB.getProject(row.projectId) : null;
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    await DB.deleteUpdate(Number(b.dataset.id), actorId()); showToast('Note deleted', 'success'); await router();
  },
  'toggle-doc-panel': async () => {
    state.docPanelOpen = !state.docPanelOpen;
    await router();
  },
  'preview-attachment': async (b) => { await openFilePreview(Number(b.dataset.id)); },
  'user-export': async () => { closeUserMenu(); await exportData(); },
  'user-import': () => { closeUserMenu(); document.getElementById('import-input').click(); },
  'user-logout': async () => {
    closeUserMenu();
    const s = getSession();
    if (s) await DB.logActivity({ userId: s.userId, action: 'logged_out', entityType: 'session', details: s.username });
    clearSession();
    wtAppBootstrapped = false;
    window.location.hash = '';
    await applyRoute();
  },
  'switch-tab': async (b) => {
    const tab = b.dataset.tab; const pid = Number(b.dataset.projectId);
    state.projectTab = tab;
    document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active')); b.classList.add('active');
    const p = await DB.getProject(pid);
    await renderTab(tab, pid, p ? canEdit(p) : false);
  },
  'filter-projects': async (b) => { state.projectFilter = b.dataset.filter; await renderProjects(); },
  'filter-tasks': async (b) => { state.taskFilter = b.dataset.filter; await renderTasks(); },
  'close-modal': () => hideModal(),
  'set-workspace-scope': async (b) => {
    state.workspaceScope = b.dataset.scope === 'everyone' ? 'everyone' : 'mine';
    await router();
  },
  'library-pick-upload': (b) => {
    const inp = document.getElementById('library-file-input');
    inp.dataset.projectId = String(b.dataset.projectId);
    inp.click();
  },
  'delete-attachment': async (b) => {
    const row = await DB.getAttachment(Number(b.dataset.id));
    if (!row) return;
    const p = await DB.getProject(row.projectId);
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    if (!confirm('Remove this file from the project?')) return;
    await DB.deleteAttachment(row.id, actorId());
    showToast('File removed', 'success');
    await router();
  },
  'add-user': () => showAddUserModal(),
  'reset-password': (b) => showResetPwModal(Number(b.dataset.id)),
  'delete-user': async (b) => {
    const uid = Number(b.dataset.id); const s = getSession();
    if (uid === s.userId) { showToast('Cannot delete yourself', 'error'); return; }
    if (!confirm('Delete this user? Their projects will be transferred to you.')) return;
    await DB.deleteUser(uid, s.userId); showToast('User deleted', 'success'); await router();
  },
  'reset-sample-data': async () => {
    if (!confirm('This will delete ALL data and replace with sample data. Continue?')) return;
    await DB.importAll({ projects: [], tasks: [], milestones: [], updates: [] });
    await DB.createSampleData(getSession().userId);
    showToast('Data reset', 'success'); await router();
  },
  'recovery-back-login': async () => { window.location.hash = ''; await applyRoute(); }
};

/* ──── Toast ──── */

const TOAST_ICONS = { success: '✓', error: '✕', warning: '!', info: 'i' };

function showToast(msg, type = 'info') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span class="toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</span><span>${esc(msg)}</span>`;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add('toast-visible'));
  setTimeout(() => { t.classList.remove('toast-visible'); setTimeout(() => t.remove(), 300); }, 3200);
}

function revokeLibraryPreviewUrls() {
  if (state._libraryBlobUrls?.length) {
    state._libraryBlobUrls.forEach(u => { try { URL.revokeObjectURL(u); } catch (_) {} });
    state._libraryBlobUrls = [];
  }
}

/* ──── Router ──── */

async function router() {
  const hash = window.location.hash.slice(1) || '/projects';
  if (hash === '/recovery') return;
  if (!hash.startsWith('/projects/')) {
    revokeLibraryPreviewUrls();
    hideDocumentPanel();
    const main = document.getElementById('main-content');
    if (main) main.classList.remove('with-doc-panel');
    state.currentProjectId = null;
  }
  updateNav(hash);
  const content = document.getElementById('content');
  if (content) content.classList.add('content-fade');
  if (hash === '/dashboard' || hash === '/' || hash === '/projects') await renderProjects();
  else if (hash.startsWith('/projects/')) {
    const id = parseInt(hash.split('/')[2]);
    if (!isNaN(id)) {
      if (state.currentProjectId !== id) { state.projectTab = 'tasks'; state.currentProjectId = id; }
      await renderProjectDetail(id);
    } else await renderProjects();
  }
  else if (hash === '/tasks') await renderTasks();
  else if (hash === '/admin') await renderAdmin();
  else window.location.hash = '#/projects';
  requestAnimationFrame(() => content?.classList.remove('content-fade'));
}

function updateNav(route) {
  document.querySelectorAll('.nav-item').forEach(item => {
    const n = item.dataset.nav;
    item.classList.toggle('active',
      route === `/${n}` || (n === 'projects' && (route === '/' || route === '/dashboard' || route.startsWith('/projects'))));
  });
}

/* ──── Export / Import ──── */

async function exportData() {
  try {
    const data = await DB.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `worktracker-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Data exported', 'success');
  } catch (err) { console.error(err); showToast('Export failed', 'error'); }
}

function setupImport() {
  document.getElementById('import-input').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.projects || !data.tasks) { showToast('Invalid file', 'error'); return; }
      if (!confirm('Replace all current data?')) return;
      await DB.importAll(data); showToast('Data imported', 'success'); await router();
    } catch { showToast('Import failed', 'error'); }
    e.target.value = '';
  });
}

/* ──── Routing (login / recovery / app) ──── */

async function applyRoute() {
  const raw = window.location.hash.slice(1) || '';
  const hash = raw.split('?')[0];

  if (!(await DB.hasUsers())) {
    document.getElementById('app').style.display = 'none';
    document.getElementById('menu-toggle').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    renderAdminSetup();
    return;
  }

  if (hash === '/recovery') {
    document.getElementById('app').style.display = 'none';
    document.getElementById('menu-toggle').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    await renderRecovery();
    return;
  }
  const s = getSession();
  if (s) {
    const user = await DB.getUser(s.userId);
    if (!user) {
      clearSession();
      wtAppBootstrapped = false;
      document.getElementById('app').style.display = 'none';
      document.getElementById('menu-toggle').style.display = 'none';
      document.getElementById('auth-screen').style.display = 'flex';
      renderLogin();
      return;
    }
    if (!wtAppBootstrapped) {
      await showApp();
      return;
    }
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    document.getElementById('menu-toggle').style.display = '';
    updateSidebarUser();
    await router();
    return;
  }
  wtAppBootstrapped = false;
  document.getElementById('app').style.display = 'none';
  document.getElementById('menu-toggle').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
  renderLogin();
}

/* ──── Init ──── */

async function init() {
  try {
    document.getElementById('auth-content').addEventListener('submit', handleAuth);
    document.addEventListener('click', async (e) => {
      const userBtn = e.target.closest('#sidebar-user');
      const menu = document.getElementById('user-menu');
      if (userBtn) { e.stopPropagation(); toggleUserMenu(); return; }
      if (menu && !menu.contains(e.target)) closeUserMenu();
      const b = e.target.closest('[data-action]');
      if (b && actions[b.dataset.action]) await actions[b.dataset.action](b);
    });
    document.getElementById('modal-overlay').addEventListener('submit', handleFormSubmit);
    document.getElementById('content').addEventListener('submit', handleFormSubmit);
    document.getElementById('modal-overlay').addEventListener('click', (e) => { if (e.target.id === 'modal-overlay') hideModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!document.getElementById('file-preview-overlay')?.classList.contains('hidden')) closeFilePreview();
        else hideModal();
      }
    });
    document.getElementById('file-preview-close')?.addEventListener('click', closeFilePreview);
    document.getElementById('file-preview-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'file-preview-overlay') closeFilePreview();
    });
    document.getElementById('library-file-input').addEventListener('change', async (e) => {
      const inp = e.target;
      const pid = Number(inp.dataset.projectId);
      inp.removeAttribute('data-project-id');
      const fileList = inp.files?.length ? Array.from(inp.files) : [];
      inp.value = '';
      if (!pid || !fileList.length) return;
      const project = await DB.getProject(pid);
      if (!project || !canEdit(project)) { showToast('Permission denied', 'error'); return; }
      const s = getSession();
      const max = 10 * 1024 * 1024;
      let uploaded = 0;
      for (const file of fileList) {
        if (file.size > max) { showToast(`${file.name} is over 10 MB`, 'warning'); continue; }
        await DB.addAttachment({
          projectId: pid,
          uploadedBy: s.userId,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          blob: file
        });
        uploaded++;
      }
      if (uploaded) showToast(uploaded === 1 ? 'File uploaded' : `${uploaded} files uploaded`, 'success');
      await router();
    });
    setupImport();
    const mt = document.getElementById('menu-toggle');
    const sb = document.getElementById('sidebar');
    if (mt) mt.addEventListener('click', () => sb.classList.toggle('open'));
    document.querySelectorAll('.nav-item').forEach(i => i.addEventListener('click', () => { sb.classList.remove('open'); closeUserMenu(); }));
    window.addEventListener('hashchange', () => { applyRoute(); });

    await applyRoute();
  } catch (err) {
    console.error('Init failed:', err);
    document.getElementById('content').innerHTML = `<div class="empty-state" style="margin-top:60px;text-align:center"><h2>Something went wrong</h2><p>${esc(String(err.message || err))}</p></div>`;
  }
}

init();
