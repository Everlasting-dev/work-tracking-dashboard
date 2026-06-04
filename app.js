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
  crown: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M2.5 19h19l-1.5-9-4.5 4-3-7-3 7-4.5-4z"/></svg>',
  userCog: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><circle cx="18" cy="15" r="3"/><path d="m21.7 16.4-.9-.3M15.2 13.9l-.9-.3M16.6 18.7l.3-.9M13.9 12.2l.3-.9M19.7 18.3l-.4 1M15.3 12.6l-.4 1M20.6 13.8l-.9.3M14.1 16.3l-.9.3"/></svg>',
  sparkles: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>',
  bell: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  chat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  externalLink: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>',
  gauge: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
  send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  discordMark: '<svg width="12" height="12" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15zM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69z"/></svg>',
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

const TYPE_CFG  = { 'project': { l: 'Project', c: 'blue' }, 'research': { l: 'Research', c: 'purple' }, 'idea': { l: 'Idea', c: 'amber' } };
const STAT_CFG  = { 'active': { l: 'Active', c: 'green' }, 'completed': { l: 'Completed', c: 'blue' }, 'on-hold': { l: 'On Hold', c: 'amber' }, 'archived': { l: 'Archived', c: 'muted' } };
const TSTATUS   = { 'todo': { l: 'To Do', c: 'amber' }, 'doing': { l: 'In Progress', c: 'blue' }, 'done': { l: 'Done', c: 'green' } };
const PRIO_CFG  = { 'low': { l: 'Low', c: 'muted' }, 'medium': { l: 'Medium', c: 'blue' }, 'high': { l: 'High', c: 'amber' }, 'urgent': { l: 'Urgent', c: 'red' } };
const DEPARTMENT_CFG_FALLBACK = {
  '': { l: 'Unassigned', c: 'muted' },
  it: { l: 'IT', c: 'blue' },
  logistics: { l: 'Logistics', c: 'amber' },
  sales: { l: 'Sales', c: 'green' },
  purchase: { l: 'Purchase', c: 'purple' },
  rnd: { l: 'R&D', c: 'red' }
};
const DEPT_COLOR_OPTIONS = ['blue', 'amber', 'green', 'purple', 'red', 'muted'];
let _departmentCfg = { ...DEPARTMENT_CFG_FALLBACK };
let _departmentCfgLoaded = false;

async function refreshDepartmentCfg() {
  try {
    const rows = await DB.getDepartments();
    const cfg = { '': { l: 'Unassigned', c: 'muted' } };
    for (const d of rows) cfg[d.key] = { l: d.label, c: d.color || 'blue' };
    _departmentCfg = cfg;
  } catch (_) {
    _departmentCfg = { ...DEPARTMENT_CFG_FALLBACK };
  }
  _departmentCfgLoaded = true;
  return _departmentCfg;
}

async function ensureDepartmentCfg() {
  if (!_departmentCfgLoaded) await refreshDepartmentCfg();
  return _departmentCfg;
}

function getDepartmentCfg() { return _departmentCfg; }

function departmentOptionsHtml(selected = '') {
  return Object.entries(getDepartmentCfg())
    .filter(([key]) => key)
    .map(([key, cfg]) => `<option value="${key}" ${selected === key ? 'selected' : ''}>${esc(cfg.l)}</option>`)
    .join('');
}

function departmentColorOptionsHtml(selected = 'blue') {
  return DEPT_COLOR_OPTIONS.map(c => `<option value="${c}" ${selected === c ? 'selected' : ''}>${c}</option>`).join('');
}
const WORKFLOW_TEMPLATE_CFG = {
  '': { l: 'Standard workflow' },
  'logistics-shipment': { l: 'Logistics shipment flow', department: 'logistics' }
};
const LOGISTICS_WORKFLOW_STEPS = [
  {
    key: 'shipping-list',
    title: 'Attach approved shipping list',
    helper: 'Upload the approved shipping list before the shipment can move.',
    priority: 'high',
    documentType: 'shipping-list'
  },
  {
    key: 'packaging',
    title: 'Packaging complete',
    helper: 'Confirm the part is packed and ready for courier pickup.',
    priority: 'high'
  },
  {
    key: 'courier-pickup',
    title: 'Picked up by courier',
    helper: 'Record when the courier has collected the shipment.',
    priority: 'urgent'
  },
  {
    key: 'waybill-tracking',
    title: 'Upload waybill and tracking',
    helper: 'Store the waybill and tracking reference in the project files.',
    priority: 'high',
    documentType: 'waybill'
  },
  {
    key: 'delivery-confirmation',
    title: 'Delivery confirmed',
    helper: 'Confirm receipt so the shipment can be closed out.',
    priority: 'medium'
  }
];

/* ──── Template Helpers ──── */

function badge(t, c) { return `<span class="badge badge-${c}">${t}</span>`; }
const TYPE_CFG_LEGACY = { 'job-search': { l: 'Job Search', c: 'green' } };
function typeBadge(t)    { const c = TYPE_CFG[t] || TYPE_CFG_LEGACY[t] || TYPE_CFG.project; return badge(c.l, c.c); }
function statusBadge(s)  { const c = STAT_CFG[s] || STAT_CFG.active; return badge(c.l, c.c); }
function taskBadge(s)    { const c = TSTATUS[s] || TSTATUS.todo; return badge(c.l, c.c); }
function prioBadge(p)    { const c = PRIO_CFG[p] || PRIO_CFG.medium; return badge(c.l, c.c); }
function departmentBadge(dept) {
  const cfg = getDepartmentCfg()[dept || ''] || { l: String(dept || 'Unassigned'), c: 'muted' };
  return badge(cfg.l, cfg.c);
}
function departmentLabel(dept) {
  return (getDepartmentCfg()[dept || ''] || { l: dept || 'Unassigned' }).l;
}
function workflowTemplateLabel(template) {
  return (WORKFLOW_TEMPLATE_CFG[template || ''] || WORKFLOW_TEMPLATE_CFG['']).l;
}
function documentTypeLabel(type) {
  if (type === 'shipping-list') return 'Shipping list';
  if (type === 'waybill') return 'Waybill';
  return 'General file';
}
function formatMonthInput(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
function monthRange(monthInput) {
  const safe = /^\d{4}-\d{2}$/.test(monthInput || '') ? monthInput : formatMonthInput();
  const [yy, mm] = safe.split('-').map(Number);
  const start = new Date(Date.UTC(yy, mm - 1, 1));
  const end = new Date(Date.UTC(yy, mm, 1));
  const label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  return { safe, start, end, label };
}
function dateInRange(iso, start, end) {
  if (!iso) return false;
  const dt = new Date(iso);
  return dt >= start && dt < end;
}
function completedAtForReport(project) {
  if (!project) return null;
  if (project.completedAt) return project.completedAt;
  return project.status === 'completed' ? project.updatedAt : null;
}
function projectDepartmentValue(project, uMap = {}) {
  return project?.department || uMap?.[project?.ownerId]?.department || '';
}
function projectSaveMismatchFields(expected, actual) {
  const mismatches = [];
  if ((expected.department || '') !== (actual?.department || '')) mismatches.push('department');
  if ((expected.workflowTemplate || '') !== (actual?.workflowTemplate || '')) mismatches.push('workflow');
  if (Boolean(expected.isOngoing) !== Boolean(actual?.isOngoing)) mismatches.push('ongoing setting');
  if ((expected.cadence || '') !== (actual?.cadence || '')) mismatches.push('cadence');
  return mismatches;
}
function isLogisticsWorkflow(project) {
  return project?.workflowTemplate === 'logistics-shipment';
}
function logisticsStepByKey(key) {
  return LOGISTICS_WORKFLOW_STEPS.find(step => step.key === key) || null;
}
function projectModeBadge(p) {
  if (!p?.isOngoing) return '';
  const label = p.cadence ? `Ongoing · ${p.cadence}` : 'Ongoing';
  return badge(label, 'purple');
}
function userColor(user) {
  const fallback = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0f766e'];
  if (user?.color && /^#[0-9a-f]{6}$/i.test(user.color)) return user.color;
  const seed = String(user?.id ?? user?.username ?? '0').split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return fallback[seed % fallback.length];
}
function userColorStyle(user) {
  const color = userColor(user);
  return `style="--user-color:${esc(color)}"`;
}
function progressBar(pct, sz = '') {
  const cls = sz ? `progress-bar progress-bar-${sz}` : 'progress-bar';
  const tone = pct >= 100 ? 'progress-done' : pct >= 50 ? 'progress-mid' : 'progress-low';
  return `<div class="${cls}"><div class="progress-fill ${tone}" style="width:${pct}%"></div></div>`;
}
function statCard(label, val, color, icon) {
  return `<div class="stat-card"><div class="stat-icon stat-icon-${color}">${icon}</div><div class="stat-info"><span class="stat-value">${val}</span><span class="stat-label">${label}</span></div></div>`;
}
const EMPTY_ICONS = {
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
  tasks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
  flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
  activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>'
};

function emptyState(opts) {
  if (typeof opts === 'string') return `<div class="empty-state">${esc(opts)}</div>`;
  const {
    icon = 'folder',
    title = 'Nothing here yet',
    description = '',
    cta = '',
    ctaAction = '',
    ctaData = {}
  } = opts;
  const iconSvg = EMPTY_ICONS[icon] || EMPTY_ICONS.folder;
  const ctaAttrs = Object.entries(ctaData).map(([k, v]) => ` data-${k}="${esc(String(v))}"`).join('');
  const ctaHtml = cta && ctaAction
    ? `<button type="button" class="btn btn-primary" data-action="${esc(ctaAction)}"${ctaAttrs}>${esc(cta)}</button>`
    : '';
  return `<div class="empty-state-rich">
    <div class="empty-state-icon">${iconSvg}</div>
    <h3>${esc(title)}</h3>
    ${description ? `<p>${esc(description)}</p>` : ''}
    ${ctaHtml}
  </div>`;
}

/* ──── Session ──── */

function getSession() { try { return JSON.parse(sessionStorage.getItem('wt-session')); } catch { return null; } }
function setSession(u) { sessionStorage.setItem('wt-session', JSON.stringify({ userId: u.id, username: u.username, displayName: u.displayName, role: u.role, department: u.department || '', color: u.color || '' })); }
function clearSession() { sessionStorage.removeItem('wt-session'); }
function isAdmin() { return getSession()?.role === 'admin'; }
function canEdit(project) { const s = getSession(); if (!s) return false; return s.role === 'admin' || project.ownerId === s.userId; }
function canDeleteProject() { return isAdmin(); }
function actorId() { return getSession()?.userId ?? null; }

/* ──── Workspace data cache (cuts duplicate Supabase round-trips) ──── */

const WORKSPACE_CACHE_MS = 120000;
const USERS_CACHE_MS = 300000;
const SESSION_CACHE_MS = 600000;
const SESSION_CACHE_KEY = 'wt-workspace-v1';
const WEBHOOKS_CACHE_MS = 120000;

let _workspaceCache = null;
let _workspaceCacheAt = 0;
let _usersCache = null;
let _usersCacheAt = 0;
let _webhooksCache = null;
let _webhooksCacheAt = 0;
let _workspaceFetchPromise = null;

function persistWorkspaceCache(data) {
  try {
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
      at: Date.now(),
      projects: data.projects,
      tasks: data.tasks,
      users: data.users
    }));
  } catch (_) { /* quota / private mode */ }
}

function loadPersistedWorkspaceCache() {
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.projects || Date.now() - parsed.at > SESSION_CACHE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function bustWorkspaceCache() {
  _workspaceCache = null;
  _workspaceCacheAt = 0;
  _usersCache = null;
  _usersCacheAt = 0;
  _webhooksCache = null;
  _webhooksCacheAt = 0;
  _workspaceFetchPromise = null;
  try { sessionStorage.removeItem(SESSION_CACHE_KEY); } catch (_) {}
}

async function getUsersCached(force = false) {
  const now = Date.now();
  if (!force && _usersCache && now - _usersCacheAt < USERS_CACHE_MS) return _usersCache;
  _usersCache = await DB.getUsers();
  _usersCacheAt = now;
  return _usersCache;
}

async function getWebhooksCached(force = false) {
  const now = Date.now();
  if (!force && _webhooksCache && now - _webhooksCacheAt < WEBHOOKS_CACHE_MS) return _webhooksCache;
  _webhooksCache = await DB.getWebhooks();
  _webhooksCacheAt = now;
  return _webhooksCache;
}

async function fetchWorkspaceData() {
  if (_workspaceFetchPromise) return _workspaceFetchPromise;
  _workspaceFetchPromise = (async () => {
    const [projects, tasks, users] = await Promise.all([
      DB.getProjects(),
      DB.getTasks(),
      getUsersCached(true)
    ]);
    const data = { projects, tasks, users };
    _workspaceCache = data;
    _workspaceCacheAt = Date.now();
    persistWorkspaceCache(data);
    return data;
  })().finally(() => { _workspaceFetchPromise = null; });
  return _workspaceFetchPromise;
}

async function getWorkspaceData(force = false) {
  const now = Date.now();
  if (!force && _workspaceCache && now - _workspaceCacheAt < WORKSPACE_CACHE_MS) {
    return _workspaceCache;
  }

  if (!force && !_workspaceCache) {
    const persisted = loadPersistedWorkspaceCache();
    if (persisted) {
      _workspaceCache = { projects: persisted.projects, tasks: persisted.tasks, users: persisted.users };
      _workspaceCacheAt = persisted.at;
      _usersCache = persisted.users;
      _usersCacheAt = persisted.at;
      if (now - persisted.at < WORKSPACE_CACHE_MS) return _workspaceCache;
    }
  }

  return fetchWorkspaceData();
}

function prewarmWorkspaceCache() {
  if (_workspaceCache || _workspaceFetchPromise) return;
  const persisted = loadPersistedWorkspaceCache();
  if (persisted && Date.now() - persisted.at < WORKSPACE_CACHE_MS) {
    _workspaceCache = { projects: persisted.projects, tasks: persisted.tasks, users: persisted.users };
    _workspaceCacheAt = persisted.at;
    _usersCache = persisted.users;
    _usersCacheAt = persisted.at;
    return;
  }
  fetchWorkspaceData().catch(err => console.warn('prewarm failed', err));
}

function projectStatsFromTasks(tasks, projectId) {
  const pt = tasks.filter(t => t.projectId === projectId);
  if (!pt.length) return { progress: 0, taskCount: 0, doneCount: 0 };
  const scores = { todo: 0, doing: 50, done: 100 };
  const progress = Math.round(pt.reduce((sum, t) => sum + (scores[t.status] || 0), 0) / pt.length);
  return { progress, taskCount: pt.length, doneCount: pt.filter(t => t.status === 'done').length };
}

function projectProgressFromTaskList(taskList) {
  if (!taskList.length) return 0;
  const scores = { todo: 0, doing: 50, done: 100 };
  return Math.round(taskList.reduce((sum, t) => sum + (scores[t.status] || 0), 0) / taskList.length);
}

/* ──── Discord webhook helper ──── */

function trimWebhookUrl(url) {
  return String(url || '').trim();
}

function discordWebhookUsername(session) {
  const raw = session?.displayName || session?.username || 'WorkTracker';
  const safe = raw.replace(/[^\w\s.-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 64);
  return safe ? `${safe} (WorkTracker)` : 'WorkTracker';
}

function buildDiscordWebhookBody({ content, username, threadName }) {
  const text = String(content || 'Notification from WorkTracker').trim().slice(0, 2000) || ' ';
  const body = { content: text };
  if (username) {
    const u = String(username).replace(/[^\w\s.-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (u) body.username = u;
  }
  if (threadName) body.thread_name = String(threadName).slice(0, 100);
  if (/@|<@|&\d+/.test(text)) {
    body.allowed_mentions = { parse: ['users', 'roles'] };
  }
  return body;
}

async function postToDiscordWebhook(url, payload) {
  const cleanUrl = trimWebhookUrl(url);
  if (!cleanUrl) return { ok: false, reason: 'no-url' };
  const bodies = [
    buildDiscordWebhookBody(payload),
    buildDiscordWebhookBody({ ...payload, threadName: 'WorkTracker' })
  ];
  const seen = new Set();
  const uniqueBodies = bodies.filter(b => {
    const key = JSON.stringify(b);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  let last = { ok: false, reason: 'failed' };
  for (const body of uniqueBodies) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal
      });
      clearTimeout(t);
      if (res.ok) return { ok: true };
      let detail = '';
      try { detail = (await res.text()).slice(0, 200); } catch (_) {}
      last = { ok: false, reason: `http-${res.status}`, detail };
      if (res.status !== 400) break;
    } catch (err) {
      last = { ok: false, reason: err.name === 'AbortError' ? 'timeout' : 'network' };
      break;
    }
  }
  return last;
}

function discordFailToast(result) {
  if (result.detail) {
    try {
      const j = JSON.parse(result.detail);
      if (j.message) return `Discord: ${j.message}`;
    } catch (_) {}
    return `Discord error (${result.reason}): ${result.detail}`;
  }
  return `Failed: ${result.reason}`;
}

async function fireDiscordEvent({ projectId = null, content, username = null }) {
  let hook = null;
  if (projectId != null) hook = await DB.getProjectWebhook(projectId);
  if (!hook) hook = await DB.getGeneralWebhook();
  if (!hook?.url) return { ok: false, reason: 'no-hook' };
  const session = getSession();
  return postToDiscordWebhook(hook.url, {
    username: username || discordWebhookUsername(session),
    content
  });
}

async function mirrorBacklogActivity(content) {
  const hook = await DB.getGeneralWebhook();
  if (!hook?.url) return { ok: false, reason: 'no-hook' };
  const session = getSession();
  return postToDiscordWebhook(hook.url, {
    username: discordWebhookUsername(session),
    content
  });
}

/* ──── In-app notification helper ──── */

async function notifyUser({ userId, type, message, projectId = null, entityType = null, entityId = null, actorUserId = null, discordContent = null }) {
  if (userId) {
    await DB.createNotification({ userId, type, message, projectId, entityType, entityId, actorUserId });
  }
  if (discordContent) {
    await fireDiscordEvent({ projectId, content: discordContent });
  }
  refreshNotificationBadge().catch(() => {});
}

/* ──── Last-seen / device capture ──── */

async function sha256Text(text) {
  const enc = new TextEncoder();
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

function deviceLabel() {
  const ua = navigator.userAgent || 'Unknown browser';
  const platform = navigator.platform || 'Unknown device';
  const browser = ua.includes('Edg/') ? 'Edge' : ua.includes('Chrome/') ? 'Chrome' : ua.includes('Safari/') ? 'Safari' : ua.includes('Firefox/') ? 'Firefox' : 'Browser';
  return `${browser} on ${platform}`;
}

async function getDeviceInfo() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const network = navigator.connection
    ? `${navigator.connection.effectiveType || 'net'}-${navigator.connection.downlink || 'x'}-${navigator.connection.rtt || 'x'}`
    : 'network-unavailable';
  const raw = [
    navigator.userAgent || '',
    navigator.platform || '',
    navigator.language || '',
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    tz,
    navigator.hardwareConcurrency || '',
    network
  ].join('|');
  return {
    deviceId: (await sha256Text(raw)).slice(0, 24),
    deviceLabel: deviceLabel(),
    userAgent: navigator.userAgent || ''
  };
}

async function captureLastSeen(userId) {
  if (!userId) return;
  try {
    let ip = null;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2200);
    try {
      const r = await fetch('https://api.ipify.org?format=json', { signal: ctrl.signal });
      if (r.ok) {
        const d = await r.json();
        ip = d?.ip || null;
      }
    } catch (_) { /* offline / blocked / timeout */ }
    clearTimeout(t);
    await DB.touchLastSeen(userId, ip);
    if (DB.recordLoginSession) {
      const device = await getDeviceInfo();
      await DB.recordLoginSession(userId, { ...device, ip: ip || '' });
    }
  } catch (_) { /* ignore */ }
}

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
  if (!isAdmin() && effectiveWorkspaceScope() === 'mine') return '';
  const sc = effectiveWorkspaceScope();
  return `<div class="workspace-scope-micro">
    <span class="text-muted" style="font-size:0.75rem">View:</span>
    <button type="button" class="scope-micro-btn${sc === 'mine' ? ' active' : ''}" data-action="set-workspace-scope" data-scope="mine">My Projects</button>
    <span class="text-muted" style="font-size:0.75rem">/</span>
    <button type="button" class="scope-micro-btn${sc === 'everyone' ? ' active' : ''}" data-action="set-workspace-scope" data-scope="everyone">Everyone</button>
  </div>`;
}

function normalizeSearchText(value) {
  return String(value || '').trim().toLowerCase();
}

function projectMatchesSearch(project, owner, query) {
  const q = normalizeSearchText(query);
  if (!q) return true;
  const parts = [
    project.name,
    project.notes,
    owner?.displayName,
    owner?.username,
    departmentLabel(projectDepartmentValue(project, owner ? { [owner.id]: owner } : {})),
    workflowTemplateLabel(project.workflowTemplate)
  ];
  return parts.some(part => normalizeSearchText(part).includes(q));
}

function logisticsStepTaskMap(tasks) {
  return Object.fromEntries(tasks.filter(t => t.workflowStepKey).map(t => [t.workflowStepKey, t]));
}

function logisticsAttachmentMap(attachments) {
  return attachments.reduce((acc, att) => {
    if (att.documentType) acc[att.documentType] = att;
    return acc;
  }, {});
}

async function ensureProjectWorkflowTasks(project, actorUserId) {
  if (!isLogisticsWorkflow(project)) return false;
  const tasks = await DB.getTasks({ projectId: project.id });
  const existing = new Set(tasks.map(t => t.workflowStepKey).filter(Boolean));
  let created = 0;
  for (const step of LOGISTICS_WORKFLOW_STEPS) {
    if (existing.has(step.key)) continue;
    await DB.createTask({
      projectId: project.id,
      assigneeId: project.ownerId,
      actorUserId,
      workflowStepKey: step.key,
      title: step.title,
      priority: step.priority,
      status: 'todo'
    });
    created++;
  }
  return created > 0;
}

function validateLogisticsTaskTransition(task, nextStatus, project, tasks, attachments) {
  if (!isLogisticsWorkflow(project) || !task?.workflowStepKey || nextStatus === 'todo') return '';
  const byKey = logisticsStepTaskMap(tasks);
  const docs = logisticsAttachmentMap(attachments);
  if (task.workflowStepKey === 'shipping-list' && nextStatus === 'done' && !docs['shipping-list']) {
    return 'Upload the approved shipping list before completing this step.';
  }
  if (task.workflowStepKey === 'packaging' && byKey['shipping-list']?.status !== 'done') {
    return 'Complete the shipping list approval step first.';
  }
  if (task.workflowStepKey === 'courier-pickup' && byKey['packaging']?.status !== 'done') {
    return 'Complete packaging before marking courier pickup.';
  }
  if (task.workflowStepKey === 'waybill-tracking' && byKey['courier-pickup']?.status !== 'done') {
    return 'Confirm courier pickup before moving to the waybill step.';
  }
  if (task.workflowStepKey === 'waybill-tracking' && nextStatus === 'done' && !docs.waybill) {
    return 'Upload the waybill and tracking document before completing this step.';
  }
  if (task.workflowStepKey === 'delivery-confirmation' && byKey['waybill-tracking']?.status !== 'done') {
    return 'Complete the waybill and tracking step before confirming delivery.';
  }
  return '';
}

async function syncWorkflowProjectStatus(project, actorUserId) {
  if (!isLogisticsWorkflow(project)) return '';
  const tasks = await DB.getTasks({ projectId: project.id });
  const workflowTasks = LOGISTICS_WORKFLOW_STEPS
    .map(step => tasks.find(task => task.workflowStepKey === step.key))
    .filter(Boolean);
  if (!workflowTasks.length) return '';
  const allDone = workflowTasks.every(task => task.status === 'done');
  if (allDone && project.status !== 'completed') {
    await DB.updateProject(project.id, { status: 'completed' }, actorUserId);
    return 'completed';
  } else if (!allDone && project.status === 'completed') {
    await DB.updateProject(project.id, { status: 'active' }, actorUserId);
    return 'active';
  }
  return '';
}

function renderLogisticsWorkflowCard(project, tasks, attachments, editable) {
  const taskByKey = logisticsStepTaskMap(tasks);
  const docs = logisticsAttachmentMap(attachments);
  const rows = LOGISTICS_WORKFLOW_STEPS.map(step => {
    const task = taskByKey[step.key];
    const status = task?.status || 'todo';
    const statusText = TSTATUS[status]?.l || 'To Do';
    const doc = step.documentType ? docs[step.documentType] : null;
    const docMeta = step.documentType
      ? `<span class="workflow-doc ${doc ? 'is-ready' : ''}">${doc ? `${documentTypeLabel(step.documentType)} uploaded` : `${documentTypeLabel(step.documentType)} missing`}</span>`
      : '';
    const uploadBtn = editable && step.documentType
      ? `<button type="button" class="btn btn-sm btn-ghost" data-action="workflow-upload-doc" data-project-id="${project.id}" data-document-type="${step.documentType}">${doc ? 'Replace file' : 'Upload file'}</button>`
      : '';
    return `<div class="workflow-step">
      <div class="workflow-step-main">
        <div class="workflow-step-title-row">
          <span class="status-dot status-dot-${status}"></span>
          <strong>${esc(step.title)}</strong>
          ${taskBadge(status)}
        </div>
        <p class="text-muted text-sm">${esc(step.helper)}</p>
        <div class="workflow-step-meta">${docMeta}${uploadBtn}</div>
      </div>
    </div>`;
  }).join('');
  return `<section class="workflow-card">
    <div class="workflow-card-header">
      <div>
        <h3>Logistics shipment workflow</h3>
        <p class="text-muted text-sm">Track the required shipping documents and step-by-step handoff for this shipment.</p>
      </div>
      <div class="workflow-card-badges">${departmentBadge(projectDepartmentValue(project))}${badge(workflowTemplateLabel(project.workflowTemplate), 'accent')}</div>
    </div>
    <div class="workflow-step-list">${rows}</div>
  </section>`;
}

/* ──── State ──── */

const state = {
  projectFilter: 'active',
  projectSearch: '',
  projectOwnerFilter: 'me',
  projectDepartmentFilter: 'all',
  taskFilter: 'all',
  taskViewMode: 'list',
  projectTab: 'tasks',
  currentProjectId: null,
  workspaceScope: 'mine',
  docPanelOpen: true,
  userMenuOpen: false,
  notifOpen: false,
  chatChannel: null,
  reportMonth: formatMonthInput(),
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
    if (!(await DB.hasUsers())) {
      showAuthError('The cloud database has no accounts yet. Create the administrator account below.');
      renderAdminSetup();
      return;
    }
    const username = fd.get('username')?.trim();
    const password = fd.get('password');
    if (!username || !password) return;
    const user = await DB.getUserByUsername(username);
    if (!user) { showAuthError('Invalid username or password'); return; }
    const ok = await DB.verifyPassword(password, user);
    if (!ok) { showAuthError('Invalid username or password'); return; }
    setSession(user);
    // Fire-and-forget: capture IP + last-seen (network is async, won't block login)
    captureLastSeen(user.id).then(async () => {
      const fresh = await DB.getUser(user.id);
      const ip = fresh?.lastSeenIp;
      await DB.logActivity({ userId: user.id, action: 'logged_in', entityType: 'session', details: ip ? `${user.username} · ${ip}` : user.username });
    }).catch(() => {});
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
    showToast('Admin created. Use Import Data in the user menu to restore projects from a JSON backup.', 'success');
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
  if (await DB.isEmpty() && window.WT_STORAGE_MODE !== 'supabase') await DB.createSampleData(s.userId);
  prewarmWorkspaceCache();
  startSidebarClock();
  DB.flushPendingSync?.().catch(() => {});
  await router();
  wtAppBootstrapped = true;
  // First-time how-to guide (per user, persisted in localStorage)
  setTimeout(() => showOnboardingModal(false), 350);
}

function startSidebarClock() {
  const timeEl = document.getElementById('sc-time');
  const msEl   = document.getElementById('sc-ms');
  const dateEl = document.getElementById('sc-date');
  if (!timeEl) return;
  const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let lastSec = -1;
  function tick() {
    const now = new Date();
    const ms2 = String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0');
    msEl.textContent = `.${ms2}`;
    const s = now.getSeconds();
    if (s !== lastSec) {
      lastSec = s;
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      timeEl.textContent = `${h}:${m}:${String(s).padStart(2, '0')}`;
      dateEl.textContent = `${DAYS[now.getDay()]} ${String(now.getDate()).padStart(2, '0')} ${MONTHS[now.getMonth()]}`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function formatSyncJobType(type) {
  return ({
    updateProject: 'Update project',
    updateTask: 'Update task',
    upsertDepartment: 'Save department',
    deleteDepartment: 'Delete department'
  })[type] || type || 'Sync job';
}

async function showSyncDiagnosticsModal() {
  const status = DB.getSyncStatus ? DB.getSyncStatus() : { enabled: false };
  const jobs = DB.getSyncQueueDetails ? DB.getSyncQueueDetails() : [];
  const online = typeof navigator === 'undefined' ? true : navigator.onLine;

  console.group('[WorkTracker] Cloud sync diagnostics');
  console.log('Network:', online ? 'online' : 'offline');
  console.log('Status:', status);
  if (jobs.length) console.table(jobs.map(j => ({ type: j.type, status: j.status, attempts: j.attempts, error: j.lastError, summary: j.summary })));
  else console.log('Queue empty');
  console.groupEnd();

  const rowsHtml = jobs.length ? jobs.map((j, i) => `
    <article class="sync-diag-row sync-diag-row--${esc(j.status)}">
      <div class="sync-diag-row-head">
        <strong>${i + 1}. ${esc(formatSyncJobType(j.type))}</strong>
        <span class="badge badge-${j.status === 'failed' ? 'red' : j.status === 'syncing' ? 'blue' : 'amber'}">${esc(j.status)}</span>
      </div>
      <p class="text-sm text-secondary">${esc(j.summary)}</p>
      ${j.attempts ? `<p class="text-sm text-muted">Attempts: ${j.attempts}</p>` : ''}
      ${j.nextRetryLabel ? `<p class="text-sm text-muted">Next retry: ${esc(j.nextRetryLabel)}</p>` : ''}
      ${j.lastError
        ? `<pre class="sync-diag-error" tabindex="0">${esc(j.lastError)}</pre>`
        : '<p class="text-sm text-muted">No error message yet (still queued or retrying).</p>'}
      ${j.payloadJson ? `<details class="sync-diag-details"><summary class="text-sm">Technical payload</summary><pre class="sync-diag-payload">${esc(j.payloadJson)}</pre></details>` : ''}
    </article>`).join('')
    : '<p class="text-secondary text-sm">Nothing is waiting to sync right now.</p>';

  showModal('Cloud sync diagnostics', `
    <p class="text-secondary text-sm sync-diag-intro">
      Edits are saved on this device first, then uploaded to Supabase in the background.
      ${!online ? '<strong class="sync-diag-offline">You appear to be offline.</strong> ' : ''}
      Click a failed row below to read the error. Details are also printed to the browser console (F12 → Console).
    </p>
    <div class="sync-diag-summary">
      <span>Queued <strong>${status.pending || 0}</strong></span>
      <span>Failed <strong class="${status.failed ? 'sync-diag-failed-count' : ''}">${status.failed || 0}</strong></span>
      <span>${online ? 'Online' : 'Offline'}</span>
    </div>
    <div class="sync-diag-list">${rowsHtml}</div>
    <div class="form-actions sync-diag-actions">
      <button type="button" class="btn btn-primary" data-action="sync-retry-now">Retry now</button>
      <button type="button" class="btn btn-ghost" data-action="sync-copy-errors"${jobs.some(j => j.lastError) ? '' : ' disabled'}>Copy errors</button>
      ${status.failed ? '<button type="button" class="btn btn-ghost btn-danger-text" data-action="sync-clear-failed">Clear failed</button>' : ''}
    </div>`);
}

function renderSyncStatusIndicator() {
  const el = document.getElementById('sync-status-indicator');
  if (!el) return;
  const status = DB.getSyncStatus ? DB.getSyncStatus() : { enabled: false };
  const visible = window.WT_STORAGE_MODE === 'supabase' && status?.enabled && (status.pending || status.failed || status.syncing);
  if (!visible) {
    el.textContent = '';
    el.className = 'sync-status-label hidden';
    el.removeAttribute('title');
    el.removeAttribute('aria-label');
    return;
  }
  el.classList.remove('hidden');
  if (status.failed) {
    const n = status.failed;
    el.textContent = n > 1 ? ` · Sync issue (${n})` : ' · Sync issue';
    el.className = 'sync-status-label is-failed is-clickable';
    const errorHint = status.lastError ? `\n${status.lastError.slice(0, 160)}` : '';
    el.title = `Cloud sync failed — click for details.${errorHint}`;
    el.setAttribute('aria-label', `${n} failed cloud sync job${n > 1 ? 's' : ''}. Click for details.`);
    return;
  }
  if (status.syncing) {
    el.textContent = status.pending > 1 ? ` · Syncing (${status.pending})` : ' · Syncing';
    el.className = 'sync-status-label is-pending is-clickable';
    el.title = 'Click for sync queue details';
    el.setAttribute('aria-label', 'Cloud sync in progress. Click for details.');
    return;
  }
  el.textContent = status.pending === 1 ? ' · 1 pending sync' : ` · ${status.pending} pending sync`;
  el.className = 'sync-status-label is-pending is-clickable';
  el.title = 'Click for sync queue details';
  el.setAttribute('aria-label', `${status.pending} change(s) waiting to sync. Click for details.`);
}

function updateSidebarUser() {
  const s = getSession(); if (!s) return;
  const display = s.displayName || s.username;
  const init = display.charAt(0).toUpperCase();
  const isAdm = s.role === 'admin';
  const el = document.getElementById('sidebar-user');
  const avatarHtml = s.avatarBase64
    ? `<img src="${esc(s.avatarBase64)}" class="user-avatar-img" alt="${esc(display)}">`
    : `<div class="user-avatar ${isAdm ? 'user-avatar-admin' : ''}" ${userColorStyle(s)}>${init}${isAdm ? `<span class="admin-crown-badge" title="Admin">${ICONS.crown}</span>` : ''}</div>`;
  el.innerHTML = `
    ${avatarHtml}
    <div class="user-details">
      <span class="user-name">${esc(display)}${isAdm ? ` <span class="admin-tag" title="Administrator">${ICONS.crown} Admin</span>` : ''}</span>
      <span class="user-role">@${esc(s.username)}${window.WT_STORAGE_MODE === 'supabase' ? ' · Cloud' : ''}</span>
    </div>
    <span class="user-menu-chevron">${ICONS.chevronDown}</span>`;
  el.setAttribute('aria-expanded', state.userMenuOpen ? 'true' : 'false');
  if (window.WT_STORAGE_MODE === 'supabase') {
    const roleEl = el.querySelector('.user-role');
    if (roleEl && !roleEl.querySelector('#sync-status-indicator')) {
      roleEl.insertAdjacentHTML('beforeend', '<button type="button" id="sync-status-indicator" class="sync-status-label hidden" aria-live="polite"></button>');
    }
  }
  const adminNav = document.getElementById('nav-admin');
  const dashNav = document.getElementById('nav-dashboard');
  const reportNav = document.getElementById('nav-reports');
  if (adminNav) adminNav.style.display = s.role === 'admin' ? '' : 'none';
  if (dashNav) dashNav.style.display = s.role === 'admin' ? '' : 'none';
  if (reportNav) reportNav.style.display = s.role === 'admin' ? '' : 'none';
  renderSyncStatusIndicator();
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
  const syncStatus = DB.getSyncStatus ? DB.getSyncStatus() : null;
  const syncMenuItem = window.WT_STORAGE_MODE === 'supabase' && syncStatus?.enabled && (syncStatus.pending || syncStatus.failed)
    ? `<button type="button" class="user-menu-item${syncStatus.failed ? ' user-menu-item-warn' : ''}" data-action="open-sync-diagnostics">${ICONS.alertTriangle} Cloud sync${syncStatus.failed ? ` (${syncStatus.failed} failed)` : ''}</button>`
    : '';
  const adminItems = isAdmin() ? `
    <button type="button" class="user-menu-item" data-action="user-export">${ICONS.download} Export Data</button>
    <button type="button" class="user-menu-item" data-action="user-import">${ICONS.upload} Import Data</button>` : '';
  menu.innerHTML = `
    ${syncMenuItem}
    <button type="button" class="user-menu-item" data-action="user-edit-profile">${ICONS.userCog} Edit Profile</button>
    <button type="button" class="user-menu-item" data-action="user-show-howto">${ICONS.sparkles} Show How-to</button>
    <button type="button" class="user-menu-item" data-action="show-about">${ICONS.target} About WorkTracker</button>
    ${adminItems}
    <hr class="user-menu-divider">
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

function humanizeActivityDetails(raw) {
  if (!raw) return '';
  const labels = {
    display_name: 'display name', displayName: 'display name', email: 'email',
    discord_id: 'Discord ID', username: 'username', role: 'role', department: 'department'
  };
  return raw.split(',').map(s => labels[s.trim()] || s.trim().replace(/_/g, ' ')).join(', ');
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
  const detail = entry.details ? `: <em>${esc(humanizeActivityDetails(entry.details))}</em>` : '';
  if (entry.action === 'password_changed') return `${esc(name)} ${verb} an account`;
  if (entry.action === 'logged_in' || entry.action === 'logged_out') return `${esc(name)} ${verb}`;
  if (entry.action === 'noted') return `${esc(name)} ${verb} ${type}${detail}`;
  return `${esc(name)} ${verb} ${type}${detail}`;
}

/* ──── Views ──── */

async function renderProjects() {
  const content = document.getElementById('content');
  const s = getSession();
  const { projects: allRaw, tasks: allTasks, users } = await getWorkspaceData();
  const all = filterProjectsByWorkspace(allRaw);
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));
  const query = normalizeSearchText(state.projectSearch);
  const ownerFilter = state.projectOwnerFilter;
  const deptFilter = state.projectDepartmentFilter;
  let baseList = [...all];
  if (ownerFilter === 'me') baseList = baseList.filter(p => p.ownerId === s.userId);
  else if (/^\d+$/.test(ownerFilter || '')) baseList = baseList.filter(p => p.ownerId === Number(ownerFilter));
  if (deptFilter && deptFilter !== 'all') baseList = baseList.filter(p => projectDepartmentValue(p, uMap) === deptFilter);
  if (query) baseList = baseList.filter(p => projectMatchesSearch(p, uMap[p.ownerId], query));
  const f = state.projectFilter;
  const list = f === 'all' ? baseList : baseList.filter(p => p.status === f);
  const pData = list.map(p => ({ ...p, ...projectStatsFromTasks(allTasks, p.id) }));

  const cnt = {
    all: baseList.length,
    active: baseList.filter(p => p.status === 'active').length,
    completed: baseList.filter(p => p.status === 'completed').length,
    'on-hold': baseList.filter(p => p.status === 'on-hold').length,
    archived: baseList.filter(p => p.status === 'archived').length
  };
  const fLabels = { all: 'All', active: 'Active', completed: 'Completed', 'on-hold': 'On Hold', archived: 'Archived' };
  const ownerOptions = users
    .filter(u => all.some(p => p.ownerId === u.id))
    .sort((a, b) => (a.displayName || a.username).localeCompare(b.displayName || b.username));
  const deptOptions = [...new Set(all.map(p => projectDepartmentValue(p, uMap)).filter(Boolean))].sort();

  // Current in-progress task per project (first doing task found)
  const doingTask = {};
  for (const t of allTasks) {
    if (t.status === 'doing' && !doingTask[t.projectId]) doingTask[t.projectId] = t;
  }

  // Status → card accent color
  const STATUS_ACCENT = { active: '#3b82f6', completed: '#10b981', 'on-hold': '#f59e0b', archived: '#9ca3af' };

  const teamHint = !isAdmin() && effectiveWorkspaceScope() === 'mine'
    ? `<p class="text-muted text-sm workspace-hint" style="margin-bottom:12px">Use <strong>Everyone</strong> to browse teammates' projects (read-only).</p>` : '';

  content.innerHTML = `
    <div class="projects-page-header">
      <div class="projects-page-title">
        <h1>Projects</h1>
        <span class="projects-page-count">${allRaw.length} total</span>
      </div>
      <div class="projects-page-actions">
        <button class="btn btn-ghost" data-action="add-task">${ICONS.plus} Task</button>
        <button class="btn btn-primary" data-action="add-project">${ICONS.plus} New Project</button>
      </div>
    </div>
    ${teamHint}
    ${workspaceScopeBarHtml()}
    <div class="projects-controls">
      <div class="projects-search-wrap">
        <svg class="projects-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input class="projects-search-input" type="search" placeholder="Search projects…" value="${esc(state.projectSearch)}" data-project-filter-input="search">
      </div>
      <div class="projects-filters-row">
        <select class="projects-filter-select" data-project-filter-input="owner">
          <option value="all" ${ownerFilter === 'all' ? 'selected' : ''}>All owners</option>
          <option value="me" ${ownerFilter === 'me' ? 'selected' : ''}>My projects</option>
          ${ownerOptions.map(u => `<option value="${u.id}" ${ownerFilter === String(u.id) ? 'selected' : ''}>${esc(u.displayName || u.username)}</option>`).join('')}
        </select>
        <select class="projects-filter-select" data-project-filter-input="department">
          <option value="all" ${deptFilter === 'all' ? 'selected' : ''}>All departments</option>
          ${deptOptions.map(dept => `<option value="${dept}" ${deptFilter === dept ? 'selected' : ''}>${esc(departmentLabel(dept))}</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="projects-status-pills">
      ${Object.entries(fLabels).map(([k, l]) => `
        <button class="status-pill ${f === k ? 'active' : ''}" data-action="filter-projects" data-filter="${k}">
          ${l} <span class="status-pill-count">${cnt[k]}</span>
        </button>`).join('')}
    </div>
    ${pData.length === 0 ? emptyState(f === 'all' ? {
      icon: 'folder',
      title: 'No projects yet',
      description: 'Create a project to organize tasks, milestones, and files for your team.',
      cta: 'Create your first project',
      ctaAction: 'add-project'
    } : {
      icon: 'folder',
      title: `No ${fLabels[f].toLowerCase()} projects`,
      description: 'Try another filter or create a new project.'
    }) :
    `<div class="projects-grid-v2">${pData.map(p => {
      const owner = uMap[p.ownerId];
      const mine = p.ownerId === s.userId;
      const dept = projectDepartmentValue(p, uMap);
      const accent = STATUS_ACCENT[p.status] || '#9ca3af';
      const ct = doingTask[p.id];
      const ctAssignee = ct ? uMap[ct.assigneeId] : null;
      const ownerInit = owner ? (owner.displayName || owner.username).charAt(0).toUpperCase() : '?';
      return `<a href="#/projects/${p.id}" class="project-card-v2" style="--card-accent:${accent}">
        <div class="project-card-v2-accent-bar"></div>
        <div class="project-card-v2-body">
          <div class="project-card-v2-badges">${typeBadge(p.type)} ${statusBadge(p.status)} ${departmentBadge(dept)} ${projectModeBadge(p)} ${p.workflowTemplate ? badge(workflowTemplateLabel(p.workflowTemplate), 'accent') : ''} ${!mine ? badge('View Only', 'muted') : ''}</div>
          <h3 class="project-card-v2-title" title="${esc(p.name)}">${esc(p.name)}</h3>
          <p class="project-card-v2-notes">${esc(p.notes || 'No description')}</p>
          <div class="project-card-v2-progress">
            ${progressBar(p.progress)}
            <div class="project-card-v2-progress-meta">
              <span class="project-card-v2-progress-pct">${p.progress}%</span>
              <span class="text-muted text-sm">${p.doneCount}/${p.taskCount} tasks</span>
            </div>
          </div>
          ${ct ? `<div class="project-card-v2-current-task">
            <span class="project-card-v2-ct-pulse"></span>
            <div class="project-card-v2-ct-info">
              <span class="project-card-v2-ct-label">In Progress</span>
              <span class="project-card-v2-ct-title">${esc(ct.title)}</span>
            </div>
            ${ctAssignee ? `<span class="project-card-v2-ct-assignee" ${userColorStyle(ctAssignee)} title="${esc(ctAssignee.displayName || ctAssignee.username)}">${(ctAssignee.displayName || ctAssignee.username).charAt(0).toUpperCase()}</span>` : ''}
          </div>` : ''}
        </div>
        <div class="project-card-v2-footer">
          <span class="project-card-v2-owner">
            <span class="project-card-v2-owner-avatar" ${userColorStyle(owner)}>${ownerInit}</span>
            <span class="project-card-v2-owner-name">${owner ? esc(owner.displayName || owner.username) : 'Unknown'}${owner?.role === 'admin' ? ` <span class="admin-crown" title="Admin">${ICONS.crown}</span>` : ''}</span>
          </span>
          <span class="project-card-v2-time">${timeAgo(p.updatedAt)}</span>
        </div>
      </a>`;
    }).join('')}</div>`}`;
}

/* ──── Task order helpers (localStorage) ──── */

function getTaskOrder(projectId) {
  try { return JSON.parse(localStorage.getItem(`wt_task_order_${projectId}`)) || null; }
  catch(_) { return null; }
}
function setTaskOrder(projectId, ids) {
  try { localStorage.setItem(`wt_task_order_${projectId}`, JSON.stringify(ids.map(Number))); }
  catch(_) {}
}
function applyTaskOrder(tasks, projectId) {
  const order = getTaskOrder(projectId);
  if (!order?.length) return tasks;
  const map = new Map(order.map((id, i) => [Number(id), i]));
  return [...tasks].sort((a, b) => (map.has(a.id) ? map.get(a.id) : 9e9) - (map.has(b.id) ? map.get(b.id) : 9e9));
}

/* ──── Task view renderers ──── */

function _insertZoneHtml(afterId, status, projectId) {
  return `<div class="task-insert-zone" data-after="${afterId}" data-status="${esc(status)}" data-project-id="${projectId}">
    <div class="task-insert-line"></div>
    <button class="task-insert-btn" data-action="quick-add-task" data-after="${afterId}" data-status="${esc(status)}" data-project-id="${projectId}" title="Add task here">+</button>
  </div>`;
}

function renderTaskListViewHtml(tasks, uMap, editable, projectId) {
  if (!tasks.length) return emptyState({
    icon: 'tasks', title: 'No tasks in this project',
    description: editable ? 'Break work into trackable tasks with due dates and assignees.' : 'Tasks assigned to you will appear here.',
    cta: editable ? 'Add a task' : '', ctaAction: editable ? 'add-task' : '',
    ctaData: editable ? { 'project-id': projectId } : {}
  });

  const sorted = applyTaskOrder(tasks, projectId);
  const statusGroups = [
    { key: 'doing', label: 'In Progress', color: 'var(--blue)' },
    { key: 'todo',  label: 'To Do',       color: 'var(--amber)' },
    { key: 'done',  label: 'Done',        color: 'var(--green)' },
  ];

  const renderCard = (t) => {
    const od = isOverdue(t.dueDate) && t.status !== 'done';
    const assignee = uMap[t.assigneeId];
    return `<div class="task-card-v2 task-card-v2--${t.status}${t.status === 'done' ? ' task-done' : ''}"
        draggable="${editable ? 'true' : 'false'}" data-task-id="${t.id}">
      ${editable ? `<div class="task-card-drag-handle" title="Drag to reorder">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="7" r="1.5"/><circle cx="15" cy="7" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="17" r="1.5"/><circle cx="15" cy="17" r="1.5"/></svg>
      </div>` : ''}
      <div class="task-card-status-stripe"></div>
      <div class="task-card-body">
        <div class="task-card-top">
          ${editable
            ? `<button class="status-dot status-dot-${t.status}" data-action="cycle-task-status" data-id="${t.id}" title="Cycle status"></button>`
            : `<span class="status-dot status-dot-${t.status}"></span>`}
          <button class="task-card-title-link task-card-title${t.status === 'done' ? ' text-strikethrough' : ''}" data-action="open-task-detail" data-id="${t.id}" title="Open details · notes, tracking info, files">${esc(t.title)}</button>
          <button class="btn-icon task-card-detail-btn" data-action="open-task-detail" data-id="${t.id}" title="Open details">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>
          ${editable ? `<button class="btn-icon task-card-del" data-action="delete-task" data-id="${t.id}" title="Delete task">${ICONS.trash}</button>` : ''}
        </div>
        <div class="task-card-bottom">
          ${editable
            ? `<button type="button" class="assignee-chip-btn" data-action="assign-task" data-id="${t.id}" title="Reassign">${assigneeChipHtml(assignee)}</button>`
            : assigneeChipHtml(assignee)}
          <div class="task-card-tags">
            ${t.dueDate ? `<span class="task-card-due ${od ? 'overdue' : isDueSoon(t.dueDate) ? 'due-soon' : 'text-muted'}">${ICONS.calendar} ${formatDateShort(t.dueDate)}</span>` : ''}
            ${prioBadge(t.priority)}
          </div>
        </div>
      </div>
    </div>`;
  };

  let html = '';
  for (const sg of statusGroups) {
    const grpTasks = sorted.filter(t => t.status === sg.key);
    if (!grpTasks.length && sg.key === 'done') continue;
    html += `<div class="task-group-v2" data-status="${sg.key}">
      <div class="task-group-header-v2" style="--group-color:${sg.color}">
        <span class="task-group-dot-v2"></span>
        <span class="task-group-label-v2">${sg.label}</span>
        <span class="task-group-count-v2">${grpTasks.length}</span>
      </div>
      <div class="task-group-body-v2" data-project-id="${projectId}">
        ${editable ? _insertZoneHtml('top-' + sg.key, sg.key, projectId) : ''}
        ${grpTasks.map(t => renderCard(t) + (editable ? _insertZoneHtml(t.id, sg.key, projectId) : '')).join('')}
        ${!grpTasks.length ? `<p class="task-group-empty-v2">No ${sg.label.toLowerCase()} tasks. Click + to add one.</p>` : ''}
      </div>
    </div>`;
  }
  return html;
}

function renderTaskBoardViewHtml(tasks, uMap, editable, projectId) {
  const cols = [
    { key: 'todo',  label: 'To Do',      color: '#f59e0b', bg: 'rgba(245,158,11,0.05)' },
    { key: 'doing', label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.05)' },
    { key: 'done',  label: 'Done',        color: '#10b981', bg: 'rgba(16,185,129,0.05)' },
  ];
  return `<div class="task-board-v2">
    ${cols.map(col => {
      const colTasks = applyTaskOrder(tasks, projectId).filter(t => t.status === col.key);
      return `<div class="task-board-col-v2" data-status="${col.key}" style="--col-color:${col.color};--col-bg:${col.bg}">
        <div class="task-board-col-head-v2">
          <div class="task-board-col-name-v2"><span class="task-board-col-dot-v2"></span>${col.label}</div>
          <span class="task-board-col-cnt-v2">${colTasks.length}</span>
        </div>
        <div class="task-board-cards-v2">
          ${colTasks.map(t => {
            const od = isOverdue(t.dueDate) && t.status !== 'done';
            const assignee = uMap[t.assigneeId];
            return `<div class="task-board-card-v2${t.status === 'done' ? ' task-done' : ''}" data-task-id="${t.id}" style="--card-color:${col.color}">
              <div class="task-board-card-title-v2">${esc(t.title)}</div>
              <div class="task-board-card-footer-v2">
                ${assigneeChipHtml(assignee)}
                <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
                  ${t.dueDate ? `<span style="display:flex;align-items:center;gap:3px;font-size:0.78rem" class="${od ? 'overdue' : 'text-muted'}">${ICONS.calendar}${formatDateShort(t.dueDate)}</span>` : ''}
                  ${prioBadge(t.priority)}
                </div>
              </div>
              ${editable ? `<div class="task-board-card-actions-v2">
                <button class="status-dot status-dot-${t.status}" style="width:18px;height:18px" data-action="cycle-task-status" data-id="${t.id}" title="Next status"></button>
                <button class="btn-icon" data-action="delete-task" data-id="${t.id}" title="Delete">${ICONS.trash}</button>
              </div>` : ''}
            </div>`;
          }).join('') || `<div class="task-board-col-empty-v2">No tasks here</div>`}
        </div>
        ${editable ? `<button class="task-board-add-v2" data-action="add-task" data-project-id="${projectId}" data-default-status="${col.key}">${ICONS.plus} Add task</button>` : ''}
      </div>`;
    }).join('')}
  </div>`;
}

function renderTaskTimelineViewHtml(tasks, uMap, projectId) {
  const datedTasks = tasks.filter(t => t.dueDate);
  const undatedCount = tasks.length - datedTasks.length;
  if (!datedTasks.length) return `<div class="timeline-empty-v2">
    ${ICONS.calendar}
    <p style="font-size:0.95rem;font-weight:600;margin-top:8px">No due dates set</p>
    <p class="text-muted text-sm">Add due dates to tasks to see them on the timeline.</p>
  </div>`;

  const today = new Date(); today.setHours(0,0,0,0);
  const dueDates = datedTasks.map(t => new Date(t.dueDate + 'T00:00:00'));
  let minDate = new Date(Math.min(...dueDates, today));
  let maxDate = new Date(Math.max(...dueDates, today));
  minDate.setDate(1); minDate.setMonth(minDate.getMonth() - 1);
  maxDate.setDate(1); maxDate.setMonth(maxDate.getMonth() + 2);
  const totalMs = maxDate - minDate;

  const pct = (dateStr) => ((new Date(dateStr + 'T00:00:00') - minDate) / totalMs * 100).toFixed(3);
  const todayPct = ((today - minDate) / totalMs * 100).toFixed(3);

  const months = [];
  let cur = new Date(minDate);
  while (cur < maxDate) {
    months.push({ label: cur.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), left: ((cur - minDate) / totalMs * 100).toFixed(2) });
    cur.setMonth(cur.getMonth() + 1);
  }

  const STATUS_COLOR = { todo: 'var(--amber)', doing: 'var(--blue)', done: 'var(--green)' };

  const rows = datedTasks.map(t => {
    const assignee = uMap[t.assigneeId];
    const od = isOverdue(t.dueDate) && t.status !== 'done';
    const dueP = Number(pct(t.dueDate));
    const barW = Math.max(2, Math.min(12, dueP * 0.12));
    const barLeft = Math.max(0, dueP - barW);
    const color = od ? 'var(--red)' : (STATUS_COLOR[t.status] || 'var(--border)');
    const init = assignee ? (assignee.displayName || assignee.username || '?').charAt(0).toUpperCase() : '?';
    return `<div class="timeline-row-v2" data-task-id="${t.id}">
      <div class="timeline-row-label-v2" title="${esc(t.title)}">
        <span class="status-dot status-dot-${t.status}" style="width:10px;height:10px;flex-shrink:0;min-width:10px"></span>
        <span class="timeline-label-text-v2">${esc(t.title)}</span>
        <span class="timeline-assignee-v2" title="${esc(assignee?.displayName || assignee?.username || 'Unassigned')}">${init}</span>
      </div>
      <div class="timeline-row-track-v2">
        <div class="timeline-today-track" style="left:${todayPct}%"></div>
        <div class="timeline-bar-v2" style="left:${barLeft}%;width:${barW}%;background:${color}" title="${esc(t.title)} — Due ${formatDateShort(t.dueDate)}">
          <span class="timeline-bar-label-v2">${formatDateShort(t.dueDate)}</span>
        </div>
      </div>
    </div>`;
  }).join('');

  return `<div class="task-timeline-v2">
    <div class="timeline-header-v2">
      <div class="timeline-label-col-v2"></div>
      <div class="timeline-track-col-v2">
        ${months.map(m => `<div class="timeline-month-v2" style="left:${m.left}%">${m.label}</div>`).join('')}
        <div class="timeline-today-v2" style="left:${todayPct}%">
          <span class="timeline-today-label-v2">Today</span>
          <div class="timeline-today-line-v2"></div>
        </div>
      </div>
    </div>
    <div class="timeline-rows-v2">${rows}</div>
    ${undatedCount ? `<p class="text-muted text-sm" style="margin-top:14px;padding-left:180px">${undatedCount} task${undatedCount !== 1 ? 's' : ''} without due dates not shown.</p>` : ''}
  </div>`;
}

function setupTaskDragDropList(projectId) {
  const container = document.getElementById('tab-content');
  if (!container) return;
  let draggedId = null;

  container.querySelectorAll('.task-card-v2[draggable=true]').forEach(card => {
    card.addEventListener('dragstart', e => {
      draggedId = Number(card.dataset.taskId);
      card.classList.add('task-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(draggedId));
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('task-dragging');
      container.querySelectorAll('.task-insert-zone.drop-active').forEach(z => z.classList.remove('drop-active'));
    });
  });

  container.querySelectorAll('.task-insert-zone').forEach(zone => {
    zone.addEventListener('dragover', e => {
      if (!draggedId) return;
      e.preventDefault(); e.dataTransfer.dropEffect = 'move';
      container.querySelectorAll('.task-insert-zone.drop-active').forEach(z => z.classList.remove('drop-active'));
      zone.classList.add('drop-active');
    });
    zone.addEventListener('dragleave', e => { if (!zone.contains(e.relatedTarget)) zone.classList.remove('drop-active'); });
    zone.addEventListener('drop', async e => {
      e.preventDefault(); zone.classList.remove('drop-active');
      if (!draggedId) return;
      const afterId = zone.dataset.after;
      const allCards = [...container.querySelectorAll('.task-card-v2')];
      const orderedIds = allCards.map(c => Number(c.dataset.taskId));
      const withoutDragged = orderedIds.filter(id => id !== draggedId);
      let newOrder;
      if (afterId && afterId.startsWith('top-')) {
        newOrder = [draggedId, ...withoutDragged];
      } else {
        const idx = withoutDragged.indexOf(Number(afterId));
        if (idx === -1) newOrder = [...withoutDragged, draggedId];
        else { newOrder = [...withoutDragged]; newOrder.splice(idx + 1, 0, draggedId); }
      }
      setTaskOrder(projectId, newOrder);
      draggedId = null;
      const p = await DB.getProject(projectId);
      if (p) await renderTab('tasks', projectId, canEdit(p));
    });
  });
}

async function createQuickTask(projectId, afterId, status) {
  const qaf = document.querySelector('.task-qaf');
  const titleInput = qaf?.querySelector('.task-qaf-input');
  const title = titleInput?.value?.trim();
  if (!title) { titleInput?.focus(); return; }
  const uid = actorId();
  const s = getSession();
  try {
    const newId = await DB.createTask({ projectId, title, status: status || 'todo', priority: 'medium', assigneeId: s?.userId || uid, actorUserId: uid });
    const allTasks = await DB.getTasks({ projectId });
    const currentOrder = getTaskOrder(projectId) || allTasks.map(t => t.id);
    const withoutNew = currentOrder.filter(id => Number(id) !== Number(newId));
    let newOrder;
    if (!afterId || afterId.startsWith('top-')) newOrder = [newId, ...withoutNew];
    else {
      const idx = withoutNew.indexOf(Number(afterId));
      if (idx === -1) newOrder = [...withoutNew, newId];
      else { newOrder = [...withoutNew]; newOrder.splice(idx + 1, 0, newId); }
    }
    setTaskOrder(projectId, newOrder);
    bustWorkspaceCache();
    const project = await DB.getProject(projectId);
    if (project) await renderTab('tasks', projectId, canEdit(project));
    showToast('Task added', 'success');
  } catch(err) {
    showToast('Failed to add task', 'error');
  }
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
  // Owner/admin sees everything; non-owners see only tasks assigned to them.
  const [allProjectTasks, milestones, users, attList] = await Promise.all([
    DB.getTasks({ projectId }),
    DB.getMilestones(projectId),
    getUsersCached(),
    DB.getAttachments(projectId)
  ]);
  const visibleTasks = editable ? allProjectTasks : allProjectTasks.filter(t => t.assigneeId === s.userId);
  const canSeeTasks = editable || visibleTasks.length > 0;
  const progress = editable ? projectProgressFromTaskList(allProjectTasks) : null;
  const tasks = visibleTasks;
  const owner = users.find(u => u.id === project.ownerId);
  const department = projectDepartmentValue(project, Object.fromEntries(users.map(u => [u.id, u])));
  let tab = state.projectTab;
  if (!canSeeTasks && (tab === 'tasks' || tab === 'timeline')) tab = 'milestones';
  state.projectTab = tab;
  const attCount = attList.length;
  state._detailCache = { projectId, allProjectTasks, milestones, users, attList };

  if (main) main.classList.toggle('with-doc-panel', state.docPanelOpen);
  await renderDocumentPanel(projectId, editable);

  const currentTask = canSeeTasks ? allProjectTasks.find(t => t.status === 'doing') : null;
  const currentTaskAssignee = currentTask ? users.find(u => u.id === currentTask.assigneeId) : null;
  const currentTaskBanner = currentTask ? `
    <div class="current-task-banner">
      <span class="current-task-pulse"></span>
      <div class="current-task-info">
        <span class="current-task-meta">In Progress</span>
        <strong class="current-task-title">${esc(currentTask.title)}</strong>
      </div>
      ${currentTaskAssignee ? assigneeChipHtml(currentTaskAssignee) : ''}
      ${currentTask.dueDate ? `<span class="current-task-due ${isOverdue(currentTask.dueDate) ? 'overdue' : isDueSoon(currentTask.dueDate) ? 'due-soon' : 'text-muted'}">${ICONS.calendar} ${formatDateShort(currentTask.dueDate)}</span>` : ''}
    </div>` : '';

  const progressLine = canSeeTasks
    ? `<div class="project-hero-progress">${progressBar(progress, 'lg')}<span class="text-muted">${progress}% complete &middot; ${tasks.filter(t => t.status === 'done').length}/${tasks.length} tasks done</span></div>${currentTaskBanner}`
    : `<p class="text-muted text-sm" style="margin-top:14px">${ICONS.target} Task details are visible only to the project owner.</p>`;

  content.innerHTML = `
    <div class="view-header">
      <div class="breadcrumb">
        <a href="#/projects" class="breadcrumb-link">${ICONS.arrowLeft} Projects</a>
        <span class="breadcrumb-sep">/</span><span>${esc(project.name)}</span>
      </div>
      <div class="view-actions">
        <button type="button" class="btn btn-ghost ${state.docPanelOpen ? 'active' : ''}" data-action="toggle-doc-panel" title="Documents panel">${ICONS.file} Files (${attCount})</button>
        ${editable ? `<button class="btn btn-ghost" data-action="edit-project" data-id="${project.id}">${ICONS.edit} Edit</button>` : ''}
        ${canDeleteProject() ? `<button class="btn btn-ghost btn-danger-text" data-action="delete-project" data-id="${project.id}">${ICONS.trash} Delete</button>` : ''}
        ${!editable && !canDeleteProject() ? badge('View Only', 'muted') : ''}
      </div>
    </div>
    <div class="project-hero">
      <div class="project-hero-badges">${typeBadge(project.type)} ${statusBadge(project.status)} ${departmentBadge(department)} ${prioBadge(project.priority)} ${projectModeBadge(project)} ${project.workflowTemplate ? badge(workflowTemplateLabel(project.workflowTemplate), 'accent') : ''}</div>
      <h1>${esc(project.name)}</h1>
      <p class="text-secondary">${esc(project.notes || 'No description added.')}</p>
      <p class="text-muted text-sm" style="margin-top:6px">${ICONS.user} ${owner ? esc(owner.displayName) : 'Unknown'}${owner?.role === 'admin' ? ` <span class="admin-crown" title="Admin">${ICONS.crown}</span>` : ''}</p>
      ${progressLine}
    </div>
    ${isLogisticsWorkflow(project) ? renderLogisticsWorkflowCard(project, allProjectTasks, attList, editable) : ''}
    <div class="tab-bar">
      ${canSeeTasks ? `<button class="tab-btn ${tab === 'tasks' ? 'active' : ''}" data-action="switch-tab" data-tab="tasks" data-project-id="${projectId}">Tasks (${tasks.length})</button>` : ''}
      ${canSeeTasks ? `<button class="tab-btn ${tab === 'timeline' ? 'active' : ''}" data-action="switch-tab" data-tab="timeline" data-project-id="${projectId}">Timeline</button>` : ''}
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
  // Revoke any previous panel blob URLs
  if (state._docPanelUrls?.length) { state._docPanelUrls.forEach(u => { try { URL.revokeObjectURL(u); } catch(_) {} }); }
  state._docPanelUrls = [];

  const items = await DB.getAttachments(projectId);
  const projectItems = items.filter(a => !a.taskId); // project-level files only in panel
  const users = await DB.getUsers();
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));
  panel.classList.remove('hidden');
  if (main) main.classList.add('with-doc-panel');

  const listHtml = items.length === 0
    ? `<p class="doc-panel-empty">No documents yet.</p>`
    : items.map(item => {
      const who = uMap[item.uploadedBy];
      const isImg = item.mimeType?.startsWith('image/');
      const isPdf = item.mimeType === 'application/pdf';
      const isTaskFile = !!item.taskId;
      let thumbHtml = '';
      if (isImg) {
        let url = '';
        if (item.blob) { url = URL.createObjectURL(item.blob); state._docPanelUrls.push(url); }
        else if (item.storagePath && DB.getAttachmentUrl) { url = DB.getAttachmentUrl(item.storagePath); }
        thumbHtml = url ? `<img src="${esc(url)}" class="doc-panel-thumb" alt="${esc(item.fileName)}">` : `<div class="doc-panel-thumb doc-panel-thumb--file">${ICONS.file}</div>`;
      } else if (isPdf) {
        thumbHtml = `<div class="doc-panel-thumb doc-panel-thumb--pdf"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h1v4h1"/><path d="M8 12h4"/></svg>PDF</div>`;
      } else {
        thumbHtml = `<div class="doc-panel-thumb doc-panel-thumb--file">${ICONS.file}</div>`;
      }
      return `<button type="button" class="doc-panel-item-v2" data-action="preview-attachment" data-id="${item.id}">
        <div class="doc-panel-thumb-wrap">${thumbHtml}</div>
        <div class="doc-panel-info">
          <span class="doc-panel-name">${esc(item.fileName)}</span>
          <span class="doc-panel-meta">
            ${who ? esc((who.displayName || who.username).split(' ')[0]) : '?'} · ${timeAgo(item.createdAt)}
            ${isTaskFile ? `<span class="doc-panel-task-tag">task</span>` : ''}
            ${item.documentType ? ` · <em>${esc(documentTypeLabel(item.documentType))}</em>` : ''}
          </span>
        </div>
      </button>`;
    }).join('');

  panel.innerHTML = `
    <div class="doc-panel-header">
      <h3>Documents <span class="projects-page-count" style="font-size:0.72rem">${items.length}</span></h3>
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
    const s = getSession();
    const cache = state._detailCache?.projectId === projectId ? state._detailCache : null;
    const allTasks = cache?.allProjectTasks ?? await DB.getTasks({ projectId });
    const tasks = editable ? allTasks : allTasks.filter(t => t.assigneeId === s.userId);
    const users = cache?.users ?? await getUsersCached();
    const uMap = Object.fromEntries(users.map(u => [u.id, u]));
    const view = state.taskViewMode || 'list';

    const viewToggle = `<div class="task-view-toggle">
      <button class="tvt-btn${view === 'list' ? ' active' : ''}" data-action="task-view" data-view="list" data-project-id="${projectId}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        List
      </button>
      <button class="tvt-btn${view === 'board' ? ' active' : ''}" data-action="task-view" data-view="board" data-project-id="${projectId}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="5" height="18" rx="1"/></svg>
        Board
      </button>
    </div>`;

    el.innerHTML = `<div class="task-view-header">
      ${viewToggle}
      ${editable ? `<button class="btn btn-sm btn-primary" data-action="add-task" data-project-id="${projectId}">${ICONS.plus} Add Task</button>` : ''}
    </div>
    <div id="task-view-body">
      ${view === 'board' ? renderTaskBoardViewHtml(tasks, uMap, editable, projectId) : renderTaskListViewHtml(tasks, uMap, editable, projectId)}
    </div>`;

    if (view === 'list' && editable) {
      setupTaskDragDropList(projectId);
    }
  } else if (tab === 'timeline') {
    const cache = state._detailCache?.projectId === projectId ? state._detailCache : null;
    const allTasks = cache?.allProjectTasks ?? await DB.getTasks({ projectId });
    const s = getSession();
    const tasks = editable ? allTasks : allTasks.filter(t => t.assigneeId === s.userId);
    const users = cache?.users ?? await getUsersCached();
    const uMap = Object.fromEntries(users.map(u => [u.id, u]));
    el.innerHTML = `<div style="padding-top:4px">${renderTaskTimelineViewHtml(tasks, uMap, projectId)}</div>`;
  } else if (tab === 'milestones') {
    const cache = state._detailCache?.projectId === projectId ? state._detailCache : null;
    const ms = cache?.milestones ?? await DB.getMilestones(projectId);
    el.innerHTML = `
      ${editable ? `<div class="tab-header"><button class="btn btn-sm btn-primary" data-action="add-milestone" data-project-id="${projectId}">${ICONS.plus} Add Milestone</button></div>` : ''}
      ${ms.length === 0 ? emptyState({
        icon: 'flag',
        title: 'No milestones yet',
        description: 'Milestones help track bigger goals inside this project.',
        cta: editable ? 'Add milestone' : '',
        ctaAction: editable ? 'add-milestone' : '',
        ctaData: editable ? { 'project-id': projectId } : {}
      }) :
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
    const cache = state._detailCache?.projectId === projectId ? state._detailCache : null;
    const items = cache?.attList ?? await DB.getAttachments(projectId);
    const users = cache?.users ?? await getUsersCached();
    const uMap = Object.fromEntries(users.map(u => [u.id, u]));
    const cards = items.map(item => {
      const blob = item.blob;
      const url = blob ? URL.createObjectURL(blob) : (DB.getAttachmentUrl ? DB.getAttachmentUrl(item.storagePath) : '');
      if (blob) state._libraryBlobUrls.push(url);
      const who = uMap[item.uploadedBy];
      const whoLabel = who ? esc(who.displayName || who.username) : 'Unknown';
      const isImg = item.mimeType && item.mimeType.startsWith('image/');
      const preview = isImg
        ? `<button type="button" class="library-card-preview" data-action="preview-attachment" data-id="${item.id}">${url ? `<img src="${esc(url)}" alt="${esc(item.fileName || 'Image')}">` : ICONS.file}</button>`
        : `<button type="button" class="library-card-file" data-action="preview-attachment" data-id="${item.id}"><span class="library-file-icon">${ICONS.file}</span><span>${esc(item.fileName)}</span></button>`;
      const del = editable ? `<button type="button" class="btn-icon" data-action="delete-attachment" data-id="${item.id}" title="Remove">${ICONS.trash}</button>` : '';
      return `<div class="library-card">
        ${preview}
        <div class="library-card-meta">
          <span class="text-muted text-sm">${whoLabel} &middot; ${timeAgo(item.createdAt)}</span>
          ${item.documentType ? `<span class="badge badge-accent">${esc(documentTypeLabel(item.documentType))}</span>` : ''}
          ${del}
        </div>
      </div>`;
    }).join('');
    el.innerHTML = `
      ${editable ? `<div class="tab-header"><button type="button" class="btn btn-sm btn-primary" data-action="library-pick-upload" data-project-id="${projectId}">${ICONS.plus} Upload files</button><span class="text-muted text-sm tab-hint">Max 10 MB per file. Click to preview.</span></div>` : `<p class="text-muted text-sm tab-hint">View files in the panel on the right, or open from the grid below.</p>`}
      ${items.length === 0 ? emptyState({
        icon: 'file',
        title: 'No files in the library',
        description: 'Upload PDFs, images, or documents from the panel on the right or the button above.',
        cta: editable ? 'Upload files' : '',
        ctaAction: editable ? 'library-pick-upload' : '',
        ctaData: editable ? { 'project-id': projectId } : {}
      }) : `<div class="library-grid">${cards}</div>`}`;
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
      ${logs.length === 0 ? emptyState({
        icon: 'activity',
        title: 'No activity yet',
        description: 'Changes to this project will appear here automatically.'
      }) :
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
  const { projects: allProjects, tasks: allTasks, users: allUsers } = await getWorkspaceData();
  const myProjectIds = new Set(allProjects.filter(p => p.ownerId === s.userId).map(p => p.id));
  const uMap = Object.fromEntries(allUsers.map(u => [u.id, u]));
  let all = allTasks;
  if (!isAdmin()) all = all.filter(t => myProjectIds.has(t.projectId) || t.assigneeId === s.userId);
  const f = state.taskFilter;
  const pMap = Object.fromEntries(allProjects.map(p => [p.id, p]));
  const cnt = { all: all.length, todo: all.filter(t => t.status === 'todo').length, doing: all.filter(t => t.status === 'doing').length, done: all.filter(t => t.status === 'done').length };
  const PRIO = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortPrio = ts => [...ts].sort((a,b) => (PRIO[a.priority]??2)-(PRIO[b.priority]??2));

  const renderCard = (t, showProject = true) => {
    const proj = pMap[t.projectId];
    const editable = proj && canEdit(proj);
    const od = isOverdue(t.dueDate) && t.status !== 'done';
    const assignee = uMap[t.assigneeId];
    const hasNotes = !!(t.notes?.trim());
    return `<div class="task-card-v2 task-card-v2--${t.status}${t.status === 'done' ? ' task-done' : ''}" data-task-id="${t.id}">
      <div class="task-card-status-stripe"></div>
      <div class="task-card-body">
        <div class="task-card-top">
          ${editable
            ? `<button class="status-dot status-dot-${t.status}" data-action="cycle-task-status" data-id="${t.id}" title="Cycle status"></button>`
            : `<span class="status-dot status-dot-${t.status}"></span>`}
          <button class="task-card-title-link task-card-title${t.status === 'done' ? ' text-strikethrough' : ''}" data-action="open-task-detail" data-id="${t.id}" title="Click to open details, add notes &amp; tracking info">${esc(t.title)}</button>
          ${showProject && proj ? `<a href="#/projects/${proj.id}" class="task-card-proj-badge">${esc(proj.name)}</a>` : ''}
          <button class="btn-icon task-card-detail-btn" data-action="open-task-detail" data-id="${t.id}" title="Open details · add notes, tracking number, files">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>
          ${editable ? `<button class="btn-icon task-card-del" data-action="delete-task" data-id="${t.id}" title="Delete">${ICONS.trash}</button>` : ''}
        </div>
        <div class="task-card-bottom">
          ${editable
            ? `<button type="button" class="assignee-chip-btn" data-action="assign-task" data-id="${t.id}">${assigneeChipHtml(assignee)}</button>`
            : assigneeChipHtml(assignee)}
          <div class="task-card-tags">
            ${t.dueDate ? `<span class="task-card-due ${od ? 'overdue' : isDueSoon(t.dueDate) ? 'due-soon' : 'text-muted'}">${ICONS.calendar} ${formatDateShort(t.dueDate)}</span>` : ''}
            ${prioBadge(t.priority)}
            ${hasNotes ? `<span class="task-note-dot" title="Has notes">●</span>` : ''}
          </div>
        </div>
      </div>
    </div>`;
  };

  let body = '';
  if (!state.collapsedTaskGroups) state.collapsedTaskGroups = {};
  if (f === 'all') {
    const projIds = [...new Set(all.map(t => t.projectId))].sort((a,b) => (pMap[a]?.name||'').localeCompare(pMap[b]?.name||''));
    body = projIds.map(pid => {
      const proj = pMap[pid]; if (!proj) return '';
      const pt = all.filter(t => t.projectId === pid);
      const ordered = [...sortPrio(pt.filter(t=>t.status==='todo')), ...sortPrio(pt.filter(t=>t.status==='doing')), ...sortPrio(pt.filter(t=>t.status==='done'))];
      const todoCnt = pt.filter(t=>t.status==='todo').length;
      const doingCnt = pt.filter(t=>t.status==='doing').length;
      const isCollapsed = !!state.collapsedTaskGroups[pid];
      return `<div class="task-proj-group${isCollapsed ? ' tpg-collapsed' : ''}" data-pid="${pid}">
        <div class="task-proj-group-header">
          <button class="tpg-toggle" data-action="toggle-task-group" data-pid="${pid}" title="${isCollapsed ? 'Expand' : 'Collapse'}">
            <svg class="tpg-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>
          </button>
          <a href="#/projects/${proj.id}" class="task-proj-group-name">${ICONS.folder} ${esc(proj.name)}</a>
          <div class="task-proj-group-badges">
            ${doingCnt ? `<span class="badge badge-blue">${doingCnt} in progress</span>` : ''}
            ${todoCnt ? `<span class="badge badge-amber">${todoCnt} to do</span>` : ''}
            <span class="text-muted text-sm">${pt.length} tasks</span>
          </div>
        </div>
        <div class="tpg-body task-group-body-v2">${ordered.map(t => renderCard(t, false)).join('')}</div>
      </div>`;
    }).join('') || emptyState({ icon:'tasks', title:'No tasks yet', description:'Create a project and add tasks.', cta:'New Task', ctaAction:'add-task' });
  } else {
    const filtered = f === 'done' ? all.filter(t=>t.status==='done') : sortPrio(all.filter(t=>t.status===f));
    body = filtered.length ? `<div class="task-group-body-v2">${filtered.map(t=>renderCard(t,true)).join('')}</div>`
      : emptyState({ icon:'tasks', title:`No ${f==='todo'?'to-do':f==='doing'?'in-progress':'done'} tasks`, description:'Try another filter.' });
  }

  content.innerHTML = `
    <div class="projects-page-header">
      <div class="projects-page-title"><h1>Tasks</h1><span class="projects-page-count">${all.length} visible</span></div>
      <div class="projects-page-actions"><button class="btn btn-primary" data-action="add-task">${ICONS.plus} New Task</button></div>
    </div>
    <div class="projects-status-pills">
      <button class="status-pill ${f==='all'?'active':''}" data-action="filter-tasks" data-filter="all">All <span class="status-pill-count">${cnt.all}</span></button>
      <button class="status-pill ${f==='doing'?'active':''}" data-action="filter-tasks" data-filter="doing">In Progress <span class="status-pill-count">${cnt.doing}</span></button>
      <button class="status-pill ${f==='todo'?'active':''}" data-action="filter-tasks" data-filter="todo">To Do <span class="status-pill-count">${cnt.todo}</span></button>
      <button class="status-pill ${f==='done'?'active':''}" data-action="filter-tasks" data-filter="done">Done <span class="status-pill-count">${cnt.done}</span></button>
    </div>
    ${body}`;
}

async function renderAdmin() {
  if (!isAdmin()) { window.location.hash = '#/projects'; return; }
  const content = document.getElementById('content');
  const s = getSession();
  await ensureDepartmentCfg();
  const [{ users, projects }, hasMk, projectHooksAll, departments] = await Promise.all([
    getWorkspaceData(),
    DB.hasMasterKey(),
    getWebhooksCached(),
    DB.getDepartments()
  ]);
  const generalHook = projectHooksAll.find(h => h.scope === 'general');
  const hookByProject = Object.fromEntries(projectHooksAll.filter(h => h.scope === 'project').map(h => [h.projectId, h]));
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
    <div class="admin-section-head">
      <h2>Team Members <span class="projects-page-count">${users.length}</span></h2>
      <button class="btn btn-primary btn-sm" data-action="add-user">${ICONS.plus} Add User</button>
    </div>
    <div class="admin-user-board">
      ${users.map(u => {
        const init = (u.displayName || u.username).charAt(0).toUpperCase();
        const avatarHtml = u.avatarBase64
          ? `<img src="${esc(u.avatarBase64)}" class="admin-ucard-avatar-img" alt="${esc(init)}">`
          : `<div class="admin-ucard-avatar" ${userColorStyle(u)}>${init}</div>`;
        return `<div class="admin-ucard">
          <div class="admin-ucard-header">
            ${avatarHtml}
            <div class="admin-ucard-meta">
              <div class="admin-ucard-name">${esc(u.displayName || u.username)}</div>
              <div class="admin-ucard-sub">@${esc(u.username)}${u.email ? ` · ${esc(u.email)}` : ''}</div>
              <div class="admin-ucard-badges">${badge(u.role === 'admin' ? 'Admin' : 'Member', u.role === 'admin' ? 'purple' : 'blue')} ${departmentBadge(u.department || '')}</div>
            </div>
          </div>
          ${u.bio ? `<p class="admin-ucard-bio">${esc(u.bio)}</p>` : ''}
          <div class="admin-ucard-actions">
            <button class="btn btn-sm btn-ghost" data-action="edit-user" data-id="${u.id}">${ICONS.edit} Edit</button>
            <button class="btn btn-sm btn-ghost" data-action="reset-password" data-id="${u.id}">Reset PW</button>
            ${u.id !== s.userId ? `<button class="btn-icon btn-danger-text" data-action="delete-user" data-id="${u.id}" title="Delete">${ICONS.trash}</button>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
    <section class="section-card" style="margin-bottom:24px">
      <div class="section-header">
        <div>
          <h2>Departments</h2>
          <p class="view-subtitle" style="margin-top:2px;font-size:0.8rem">Labels used on users, projects, filters, and reports.</p>
        </div>
      </div>
      <div class="dept-list">
        ${departments.map(d => `
          <div class="dept-row dept-row--${esc(d.color || 'blue')}">
            <form data-form="edit-department" data-dept-key="${esc(d.key)}" data-sort-order="${d.sortOrder ?? 0}" class="dept-row-form">
              <span class="dept-dot"></span>
              <input class="dept-name-input" type="text" name="label" value="${esc(d.label)}" required placeholder="Name">
              <code class="dept-key-badge" title="Internal key">${esc(d.key)}</code>
              <select name="color" class="dept-color-select" title="Color">${departmentColorOptionsHtml(d.color || 'blue')}</select>
              <button type="submit" class="btn btn-sm btn-ghost dept-save-btn">Save</button>
              <button type="button" class="btn-icon btn-icon-danger" data-action="delete-department" data-key="${esc(d.key)}" title="Delete department">${ICONS.trash}</button>
            </form>
          </div>`).join('')}
        <div class="dept-add-row">
          <form data-form="add-department" class="dept-row-form">
            <span class="dept-add-icon">${ICONS.plus}</span>
            <input type="text" name="label" placeholder="Department name" required class="dept-name-input">
            <input type="text" name="key" placeholder="key (auto)" class="dept-key-input">
            <select name="color" class="dept-color-select">${departmentColorOptionsHtml('blue')}</select>
            <input type="number" name="sortOrder" value="${(departments.length + 1) * 10}" min="0" class="dept-order-input">
            <button type="submit" class="btn btn-sm btn-primary">Add</button>
          </form>
        </div>
      </div>
    </section>
    <section class="section-card" style="margin-bottom:24px">
      <div class="section-header"><h2>${ICONS.chat} Discord Integrations</h2></div>
      <div class="section-body" style="padding:20px">
        <p class="text-secondary text-sm" style="margin-bottom:14px">
          Each channel is bound to a <strong>Discord webhook URL</strong>. The app posts chat messages and event notifications to that URL.
          Webhook URLs are saved in your cloud database (visible to all admins). To create one in Discord: <em>Server Settings → Integrations → Webhooks → New Webhook → Copy URL</em>.
        </p>
        <div class="integrations-grid">
          <div class="integration-card">
            <h3>${ICONS.chat} #general channel</h3>
            <p class="text-secondary text-sm">The default channel for events that don't belong to a specific project. It also mirrors the main backlog activity feed, so it works well as a locked audit channel.</p>
            <form data-form="webhook-general">
              <div class="webhook-input">
                <input type="url" name="url" placeholder="https://discord.com/api/webhooks/..." value="${esc(generalHook?.url || '')}">
                <button type="submit" class="btn btn-sm btn-primary">Save</button>
              </div>
              <div class="webhook-input">
                <input type="url" name="channelUrl" placeholder="Optional: https://discord.com/channels/SERVER/CHANNEL (for 'Open in Discord' link)" value="${esc(generalHook?.channelUrl || '')}">
              </div>
              ${generalHook ? `<span class="integration-meta">Saved ${timeAgo(generalHook.updatedAt || generalHook.createdAt)} · <button type="button" class="btn-link" data-action="test-webhook" data-scope="general">Send test ping</button></span>` : ''}
            </form>
          </div>
          ${projects.map(p => {
            const h = hookByProject[p.id];
            return `<div class="integration-card">
              <h3>${ICONS.folder} ${esc(p.name)}</h3>
              <p class="text-secondary text-sm">Project channel for ${esc(p.name)} events.</p>
              <form data-form="webhook-project" data-project-id="${p.id}">
                <div class="webhook-input">
                  <input type="url" name="url" placeholder="https://discord.com/api/webhooks/..." value="${esc(h?.url || '')}">
                  <button type="submit" class="btn btn-sm btn-primary">Save</button>
                </div>
                <div class="webhook-input">
                  <input type="url" name="channelUrl" placeholder="Optional: Discord channel URL" value="${esc(h?.channelUrl || '')}">
                </div>
                ${h ? `<span class="integration-meta">Saved ${timeAgo(h.updatedAt || h.createdAt)} · <button type="button" class="btn-link" data-action="test-webhook" data-scope="project" data-project-id="${p.id}">Send test ping</button> · <button type="button" class="btn-link btn-danger-text" data-action="delete-webhook" data-id="${h.id}">Remove</button></span>` : ''}
              </form>
            </div>`;
          }).join('')}
        </div>
      </div>
    </section>
    <section class="section-card" style="margin-bottom:24px">
      <div class="section-header"><h2>${ICONS.sparkles} AI + two-way chat roadmap</h2></div>
      <div class="section-body" style="padding:20px">
        <div class="integrations-grid">
          <div class="integration-card">
            <h3>Claude assistant</h3>
            <p class="text-secondary text-sm">Claude can be added safely through a Supabase Edge Function, Cloudflare Worker, or other backend proxy. The API key must not live in this GitHub Pages app.</p>
            <span class="integration-meta">Recommended first feature: summarize a project and suggest next tasks.</span>
          </div>
          <div class="integration-card">
            <h3>Discord → WorkTracker</h3>
            <p class="text-secondary text-sm">Normal Discord messages require a Discord bot/proxy to read channel messages, map Discord IDs to WorkTracker users, and write them into the chat activity log.</p>
            <span class="integration-meta">The current chat UI is ready to show ingested messages once the bot/proxy exists.</span>
          </div>
        </div>
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

/* ──── Chat (Discord bridge) ──── */

async function getChatMessagesForChannel(channelId) {
  const [appMsgs, discordMsgs] = await Promise.all([
    DB.getChatActivityLog ? DB.getChatActivityLog(channelId, { limit: 100 }) : (async () => {
      const projectId = channelId?.startsWith('project-') ? Number(channelId.split('-')[1]) : null;
      const log = await DB.getActivityLog({ limit: 200 });
      let rows = log.filter(e => e.action === 'sent_message' && e.entityType === 'chat');
      if (channelId === 'general') rows = rows.filter(e => e.projectId == null);
      else if (Number.isFinite(projectId)) rows = rows.filter(e => e.projectId === projectId);
      return rows.reverse();
    })(),
    DB.getDiscordMessages ? DB.getDiscordMessages(channelId, { limit: 100 }) : Promise.resolve([])
  ]);
  const merged = [...appMsgs, ...discordMsgs];
  merged.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
  return merged.slice(-150);
}

function appendChatMessageToPane(message, uMap) {
  const pane = document.getElementById('chat-messages-pane');
  if (!pane) return;
  const empty = pane.querySelector('.chat-empty');
  if (empty) pane.innerHTML = renderChatMessagesHtml([message], uMap);
  else {
    let container = pane.querySelector('.chat-messages');
    if (!container) {
      pane.innerHTML = renderChatMessagesHtml([message], uMap);
      container = pane.querySelector('.chat-messages');
    }
    if (container) {
      const wrap = document.createElement('div');
      wrap.innerHTML = renderChatMessagesHtml([message], uMap);
      const row = wrap.querySelector('.chat-bubble-row');
      if (row) container.appendChild(row);
    }
  }
  pane.scrollTop = pane.scrollHeight;
}

async function refreshChatPane() {
  const pane = document.getElementById('chat-messages-pane');
  if (!pane || window.location.hash !== '#/chat') return;
  const channelId = state.chatChannel || 'general';
  const uMap = state.chatUsersMap || {};
  const messages = await getChatMessagesForChannel(channelId);
  pane.innerHTML = renderChatMessagesHtml(messages, uMap);
  pane.scrollTop = pane.scrollHeight;
}

function renderChatMessagesHtml(messages, uMap) {
  const meId = actorId();
  if (!messages.length) {
    return `<div class="chat-empty-v2">
      <div class="chat-empty-orb">${ICONS.chat}</div>
      <strong>No messages yet</strong>
      <span>Messages posted here are sent to the Discord channel.</span>
    </div>`;
  }
  let html = '';
  let lastDate = '';
  messages.forEach(m => {
    const isDiscord = m.source === 'discord';
    const who = isDiscord ? null : uMap[m.userId];
    const name = isDiscord ? (m.discordDisplayName || m.discordAuthorName || 'Discord') : (who ? (who.displayName || who.username) : 'Someone');
    const init = name.charAt(0).toUpperCase();
    const mine = !isDiscord && m.userId === meId;
    const avatarBg = isDiscord ? 'background:#5865f2' : (who ? `background:${userColor(who)}` : '');
    const avatarContent = isDiscord && m.discordAvatar
      ? `<img src="${esc(m.discordAvatar)}" alt="${esc(name)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : init;
    const msgDate = new Date(m.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric' });
    if (msgDate !== lastDate) {
      html += `<div class="chat-date-divider"><span>${msgDate}</span></div>`;
      lastDate = msgDate;
    }
    html += `<div class="chat-msg-row ${mine ? 'chat-msg-mine' : ''} ${isDiscord ? 'chat-msg-discord' : ''}">
      ${!mine ? `<div class="chat-msg-avatar" style="${avatarBg}" title="${esc(name)}">${avatarContent}</div>` : ''}
      <div class="chat-msg-body">
        ${!mine ? `<div class="chat-msg-name">${esc(name)} ${isDiscord ? `<span class="chat-discord-badge">${ICONS.discordMark}</span>` : ''}</div>` : ''}
        <div class="chat-msg-bubble">${esc(m.details || '').replace(/\n/g, '<br>')}</div>
        <div class="chat-msg-time">${timeAgo(m.createdAt)}</div>
      </div>
      ${mine ? `<div class="chat-msg-avatar" style="${avatarBg}" title="${esc(name)}">${avatarContent}</div>` : ''}
    </div>`;
  });
  return `<div class="chat-msgs-wrap">${html}</div>`;
}

async function renderChat() {
  const content = document.getElementById('content');
  const { projects, users } = await getWorkspaceData();
  const visibleProjects = filterProjectsByWorkspace(projects);
  const allHooks = await getWebhooksCached();
  const generalHook = allHooks.find(h => h.scope === 'general');
  const projectHookMap = Object.fromEntries(allHooks.filter(h => h.scope === 'project').map(h => [h.projectId, h]));
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));
  state.chatUsersMap = uMap;

  // Build channels - non-admins only see configured channels
  const allChannels = [
    { id: 'general', name: 'general', webhook: generalHook, channelUrl: generalHook?.channelUrl || '', projectId: null, live: !!generalHook?.url }
  ];
  for (const p of visibleProjects) {
    const h = projectHookMap[p.id];
    allChannels.push({ id: `project-${p.id}`, name: p.name, webhook: h, channelUrl: h?.channelUrl || '', projectId: p.id, live: !!h?.url });
  }
  const channels = isAdmin() ? allChannels : allChannels.filter(c => c.live);

  if (!state.chatChannel || !channels.find(c => c.id === state.chatChannel)) {
    state.chatChannel = channels[0]?.id || 'general';
  }
  const active = channels.find(c => c.id === state.chatChannel) || channels[0];
  const messages = active ? await getChatMessagesForChannel(active.id) : [];
  const messagesHtml = renderChatMessagesHtml(messages, uMap);
  const hasWebhook = !!active?.webhook?.url;
  const s = getSession();

  content.innerHTML = `
    <div class="chat-v2-layout">
      <aside class="chat-v2-sidebar">
        <div class="chat-v2-sidebar-header">
          <span class="chat-v2-sidebar-title">Channels</span>
          ${isAdmin() ? `<a href="#/admin" class="chat-v2-cfg-btn" title="Configure webhooks in Admin">${ICONS.edit}</a>` : ''}
        </div>
        <div class="chat-v2-channels">
          ${channels.map(c => `
            <button type="button" class="chat-v2-channel-btn ${c.id === active?.id ? 'active' : ''}" data-action="select-chat-channel" data-channel-id="${c.id}">
              <span class="chat-v2-hash">#</span>
              <span class="chat-v2-channel-name">${esc(c.name)}</span>
              ${c.live ? `<span class="chat-v2-live-dot" title="Live"></span>` : (isAdmin() ? `<span class="chat-v2-uncfg" title="Not configured">!</span>` : '')}
            </button>`).join('')}
        </div>
        ${!channels.length && !isAdmin() ? `<p class="chat-v2-no-channels">No channels configured yet.<br>Ask an admin to set up Discord webhooks.</p>` : ''}
        <div class="chat-v2-sidebar-footer">
          <div class="chat-v2-me-chip" ${userColorStyle(s)}>
            <span class="chat-v2-me-init">${(s?.displayName || s?.username || '?').charAt(0).toUpperCase()}</span>
            <span class="chat-v2-me-name">${esc(s?.displayName || s?.username || '')}</span>
          </div>
        </div>
      </aside>
      <div class="chat-v2-main">
        <div class="chat-v2-header">
          <div>
            <span class="chat-v2-channel-title"># ${esc(active?.name || 'chat')}</span>
            ${active?.live ? `<span class="chat-v2-live-badge">Live · Discord</span>` : ''}
          </div>
          <div class="chat-v2-header-actions">
            ${active?.channelUrl ? `<a href="${esc(active.channelUrl)}" target="_blank" rel="noopener" class="btn btn-sm btn-ghost">${ICONS.externalLink} Discord</a>` : ''}
          </div>
        </div>
        <div class="chat-v2-body" id="chat-messages-pane">${messagesHtml}</div>
        ${hasWebhook ? `
        <form class="chat-v2-compose" data-form="chat-send" data-channel-id="${active.id}">
          <textarea class="chat-v2-input" name="content" rows="1" placeholder="Message #${esc(active?.name || 'chat')}… (Enter to send, Shift+Enter for newline)" required></textarea>
          <button type="submit" class="chat-v2-send-btn" title="Send">${ICONS.send}</button>
        </form>` : `
        <div class="chat-v2-compose chat-v2-compose-disabled">
          <span class="text-muted text-sm">${isAdmin() ? 'Add a Discord webhook in Admin → Integrations to enable messaging.' : 'Messaging not configured for this channel yet.'}</span>
        </div>`}
      </div>
    </div>`;

  requestAnimationFrame(() => {
    const pane = document.getElementById('chat-messages-pane');
    if (pane) pane.scrollTop = pane.scrollHeight;
  });
}

/* ──── Admin Dashboard ──── */

async function renderAdminDashboard() {
  if (!isAdmin()) { window.location.hash = '#/projects'; return; }
  const content = document.getElementById('content');
  const { users, projects, tasks } = await getWorkspaceData();
  const log = await DB.getActivityLog({ limit: 25 });
  let sessions = [];
  try { sessions = DB.getUserSessions ? await DB.getUserSessions() : []; } catch (_) { sessions = []; }
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const activeUsers = users.filter(u => u.lastSeenAt && (now - new Date(u.lastSeenAt).getTime() < sevenDays));
  const recentLogins = log.filter(l => l.action === 'logged_in').slice(0, 10);
  const projectByOwner = projects.reduce((m, p) => { m[p.ownerId] = (m[p.ownerId] || 0) + 1; return m; }, {});
  const tasksByAssignee = tasks.reduce((m, t) => { if (t.assigneeId != null) m[t.assigneeId] = (m[t.assigneeId] || 0) + 1; return m; }, {});
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));
  const sessionsByUser = sessions.reduce((m, row) => { (m[row.userId] ||= []).push(row); return m; }, {});

  const sp = (icon, val, label, sub, color) => `
    <div class="dash-stat">
      <div class="dash-stat-icon dash-stat-icon--${color}">${icon}</div>
      <div class="dash-stat-body">
        <span class="dash-stat-value">${val}</span>
        <span class="dash-stat-label">${label}</span>
        ${sub ? `<span class="dash-stat-sub">${sub}</span>` : ''}
      </div>
    </div>`;

  const userRow = u => {
    const pCnt = projectByOwner[u.id] || 0;
    const tCnt = tasksByAssignee[u.id] || 0;
    const devCnt = (sessionsByUser[u.id] || []).length;
    const init = (u.displayName || u.username || '?').charAt(0).toUpperCase();
    const online = u.lastSeenAt && (now - new Date(u.lastSeenAt).getTime() < sevenDays);
    return `<div class="dash-user-row">
      <div class="dash-user-avatar-wrap">
        <span class="dash-user-av" ${userColorStyle(u)}>${init}</span>
        <span class="dash-online-dot ${online ? 'dash-online-dot--on' : ''}"></span>
      </div>
      <div class="dash-user-details">
        <div class="dash-user-name-row">
          <strong>${esc(u.displayName || u.username)}</strong>
          ${u.role === 'admin' ? `<span class="dash-crown">${ICONS.crown}</span>` : ''}
          ${departmentBadge(u.department || '')}
        </div>
        <div class="dash-user-stats">
          <span>${pCnt}p</span><span class="dash-sep">·</span>
          <span>${tCnt} tasks</span>
          ${devCnt ? `<span class="dash-sep">·</span><span>${devCnt} devices</span>` : ''}
          ${u.lastSeenAt ? `<span class="dash-sep">·</span><span class="text-muted">${timeAgo(u.lastSeenAt)}</span>` : ''}
          ${u.lastSeenIp ? `<span class="dash-sep">·</span><code class="dash-ip">${esc(u.lastSeenIp)}</code>` : ''}
        </div>
      </div>
    </div>`;
  };

  const actRow = entry => {
    const who = uMap[entry.userId];
    const init = who ? (who.displayName || who.username || '?').charAt(0).toUpperCase() : '?';
    return `<div class="dash-act-row">
      <span class="dash-act-av" ${userColorStyle(who)}>${init}</span>
      <div class="dash-act-body">
        <span class="dash-act-text">${formatActivityMessage(entry, uMap)}</span>
        <span class="dash-act-time">${timeAgo(entry.createdAt)}</span>
      </div>
    </div>`;
  };

  content.innerHTML = `
    <div class="projects-page-header" style="margin-bottom:18px">
      <div class="projects-page-title"><h1>Dashboard</h1><span class="projects-page-count">Admin</span></div>
    </div>
    <div class="dash-stats-row">
      ${sp(ICONS.user, users.length, 'Team', `${activeUsers.length} active this week`, 'purple')}
      ${sp(ICONS.folder, projects.length, 'Projects', `${projects.filter(p=>p.status==='active').length} active · ${projects.filter(p=>p.status==='on-hold').length} on hold`, 'blue')}
      ${sp(ICONS.checkCircle, tasks.length, 'Tasks', `${tasks.filter(t=>t.status==='done').length} done · ${tasks.filter(t=>t.status==='doing').length} in progress`, 'green')}
      ${sp(ICONS.clock, recentLogins.length, 'Logins', 'in last 30 audit entries', 'amber')}
    </div>
    <div class="dash-two-col">
      <div>
        <div class="dash-panel">
          <div class="dash-panel-head"><h3>Team</h3><span class="projects-page-count">${users.length} members</span></div>
          ${users.map(u => userRow(u)).join('')}
          <p class="dash-ip-note">IPs via <code>api.ipify.org</code>. Device IDs are privacy-safe browser fingerprints.</p>
        </div>
      </div>
      <div class="dash-right-col">
        <div class="dash-panel">
          <div class="dash-panel-head">
            <h3>Recent Activity</h3>
            <a href="#/activity" class="btn btn-ghost" style="font-size:0.75rem;padding:4px 10px">View all</a>
          </div>
          <div class="dash-act-scroll">
            ${log.length === 0
              ? `<p class="text-muted text-sm" style="padding:14px 16px">No activity yet.</p>`
              : log.map(e => actRow(e)).join('')}
          </div>
        </div>
        ${sessions.length ? `
        <div class="dash-panel" style="margin-top:14px">
          <div class="dash-panel-head"><h3>Devices</h3><span class="projects-page-count">${sessions.length}</span></div>
          ${sessions.slice(0, 6).map(row => {
            const u = uMap[row.userId];
            return `<div class="dash-device-row">
              <div>
                <strong class="text-sm">${esc(u?.displayName || u?.username || 'Unknown')}</strong>
                <span class="text-muted" style="font-size:0.75rem"> · ${esc(row.deviceLabel || 'Unknown device')}</span>
              </div>
              <span class="text-muted" style="font-size:0.75rem;white-space:nowrap">${row.loginCount || 1}× · ${timeAgo(row.lastSeenAt)}</span>
            </div>`;
          }).join('')}
        </div>` : ''}
      </div>
    </div>`;
}

/* ──── Notifications dropdown ──── */

function buildMonthlyReportRows(projects, tasks, users, monthInput) {
  const { safe, start, end, label } = monthRange(monthInput);
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));
  const rows = projects.map(project => {
    const owner = uMap[project.ownerId];
    const stats = projectStatsFromTasks(tasks, project.id);
    const completedAt = completedAtForReport(project);
    const department = projectDepartmentValue(project, uMap);
    return {
      project,
      owner,
      department,
      progress: stats.progress,
      startedThisMonth: dateInRange(project.createdAt, start, end),
      completedThisMonth: dateInRange(completedAt, start, end),
      ongoing: project.status !== 'completed' && project.status !== 'archived',
      completedAt
    };
  });
  return { rows, label, safe };
}

function renderMonthlyReportTable(rows, { showOwner = false, showDepartment = false } = {}) {
  if (!rows.length) {
    return `<p class="text-muted text-sm" style="padding:4px 0 0">No matching projects for this section.</p>`;
  }
  return `<div class="report-table-wrap"><table class="report-table">
    <thead>
      <tr>
        <th>Project</th>
        ${showOwner ? '<th>Owner</th>' : ''}
        ${showDepartment ? '<th>Department</th>' : ''}
        <th>Started</th>
        <th>Completed</th>
        <th>Status</th>
        <th>Progress</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map(row => `<tr>
        <td><a href="#/projects/${row.project.id}" class="report-project-link">${esc(row.project.name)}</a></td>
        ${showOwner ? `<td>${esc(row.owner?.displayName || row.owner?.username || 'Unknown')}</td>` : ''}
        ${showDepartment ? `<td>${departmentBadge(row.department || '')}</td>` : ''}
        <td>${row.project.createdAt ? formatDateShort(row.project.createdAt.split('T')[0]) : '—'}</td>
        <td>${row.completedAt ? formatDateShort(row.completedAt.split('T')[0]) : '—'}</td>
        <td>${statusBadge(row.project.status)}</td>
        <td><span class="report-progress-cell">${progressBar(row.progress)}<span>${row.progress}%</span></span></td>
      </tr>`).join('')}
    </tbody>
  </table></div>`;
}

async function renderReportsPage() {
  if (!isAdmin()) { window.location.hash = '#/projects'; return; }
  const content = document.getElementById('content');
  const { users, projects, tasks } = await getWorkspaceData();
  const { rows, label, safe } = buildMonthlyReportRows(projects, tasks, users, state.reportMonth);
  state.reportMonth = safe;
  const relevantRows = rows.filter(row => row.startedThisMonth || row.completedThisMonth || row.ongoing);
  const peopleSections = users
    .map(user => {
      const owned = relevantRows.filter(row => row.project.ownerId === user.id);
      if (!owned.length) return '';
      const started = owned.filter(row => row.startedThisMonth);
      const completed = owned.filter(row => row.completedThisMonth);
      const ongoing = owned.filter(row => row.ongoing);
      return `<section class="section-card report-section">
        <div class="section-header">
          <h2>${esc(user.displayName || user.username)}</h2>
          <div class="report-section-badges">${departmentBadge(user.department || '')}${user.role === 'admin' ? badge('Admin', 'purple') : badge('Member', 'blue')}</div>
        </div>
        <div class="section-body">
          <div class="report-meta-grid">
            <div class="report-kpi"><strong>${ongoing.length}</strong><span>Ongoing</span></div>
            <div class="report-kpi"><strong>${started.length}</strong><span>Started in ${esc(label)}</span></div>
            <div class="report-kpi"><strong>${completed.length}</strong><span>Completed in ${esc(label)}</span></div>
          </div>
          ${renderMonthlyReportTable(owned, { showDepartment: true })}
        </div>
      </section>`;
    })
    .filter(Boolean)
    .join('');
  const deptKeys = [...new Set(['', ...users.map(u => u.department || ''), ...projects.map(p => p.department || '')])];
  const departmentSections = deptKeys
    .map(dept => {
      const deptRows = relevantRows.filter(row => row.department === dept);
      if (!deptRows.length) return '';
      const started = deptRows.filter(row => row.startedThisMonth);
      const completed = deptRows.filter(row => row.completedThisMonth);
      const ongoing = deptRows.filter(row => row.ongoing);
      return `<section class="section-card report-section">
        <div class="section-header">
          <h2>${departmentLabel(dept)}</h2>
          <div class="report-section-badges">${departmentBadge(dept)}</div>
        </div>
        <div class="section-body">
          <div class="report-meta-grid">
            <div class="report-kpi"><strong>${ongoing.length}</strong><span>Ongoing</span></div>
            <div class="report-kpi"><strong>${started.length}</strong><span>Started in ${esc(label)}</span></div>
            <div class="report-kpi"><strong>${completed.length}</strong><span>Completed in ${esc(label)}</span></div>
          </div>
          ${renderMonthlyReportTable(deptRows, { showOwner: true })}
        </div>
      </section>`;
    })
    .filter(Boolean)
    .join('');

  content.innerHTML = `
    <div class="view-header">
      <div><h1>Monthly Reports</h1><p class="view-subtitle">Start, completion, and live status snapshots for ${esc(label)}</p></div>
      <div class="view-actions">
        <label class="report-month-picker">
          <span class="text-muted text-sm">Month</span>
          <input type="month" value="${esc(state.reportMonth)}" data-report-input="month">
        </label>
        <button type="button" class="btn btn-primary" data-action="generate-ai-report">${ICONS.sparkles} AI Report</button>
        <button type="button" class="btn btn-ghost" data-action="export-report-csv">${ICONS.download} Export CSV</button>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><span class="stat-value">${relevantRows.filter(row => row.ongoing).length}</span><span class="stat-label">Ongoing projects</span></div>
      <div class="stat-card"><span class="stat-value">${relevantRows.filter(row => row.startedThisMonth).length}</span><span class="stat-label">Started in ${esc(label)}</span></div>
      <div class="stat-card"><span class="stat-value">${relevantRows.filter(row => row.completedThisMonth).length}</span><span class="stat-label">Completed in ${esc(label)}</span></div>
      <div class="stat-card"><span class="stat-value">${users.length}</span><span class="stat-label">People covered</span></div>
    </div>
    <section class="section-card report-group">
      <div class="section-header"><h2>Individuals</h2></div>
      <div class="section-body report-stack">${peopleSections || `<p class="text-muted text-sm">No reportable projects for ${esc(label)} yet.</p>`}</div>
    </section>
    <section class="section-card report-group">
      <div class="section-header"><h2>Departments</h2></div>
      <div class="section-body report-stack">${departmentSections || `<p class="text-muted text-sm">No departmental report data for ${esc(label)} yet.</p>`}</div>
    </section>`;
}

async function exportMonthlyReportCsv() {
  const { users, projects, tasks } = await getWorkspaceData();
  const { rows, safe } = buildMonthlyReportRows(projects, tasks, users, state.reportMonth);
  const relevantRows = rows.filter(row => row.startedThisMonth || row.completedThisMonth || row.ongoing);
  const header = ['Project', 'Owner', 'Department', 'Started At', 'Completed At', 'Current Status', 'Progress %', 'Started This Month', 'Completed This Month', 'Ongoing'];
  const lines = [
    header.join(','),
    ...relevantRows.map(row => [
      row.project.name,
      row.owner?.displayName || row.owner?.username || '',
      departmentLabel(row.department || ''),
      row.project.createdAt || '',
      row.completedAt || '',
      row.project.status,
      String(row.progress),
      row.startedThisMonth ? 'yes' : 'no',
      row.completedThisMonth ? 'yes' : 'no',
      row.ongoing ? 'yes' : 'no'
    ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `worktracker-report-${safe}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Monthly report exported', 'success');
}

async function generateAIReport() {
  if (!isAdmin()) { showToast('Admins only', 'error'); return; }
  const { users, projects, tasks } = await getWorkspaceData();
  const { rows, label } = buildMonthlyReportRows(projects, tasks, users, state.reportMonth);
  const relevantRows = rows.filter(r => r.startedThisMonth || r.completedThisMonth || r.ongoing);

  const payload = {
    month: label,
    summary: {
      ongoing: relevantRows.filter(r => r.ongoing).length,
      startedThisMonth: relevantRows.filter(r => r.startedThisMonth).length,
      completedThisMonth: relevantRows.filter(r => r.completedThisMonth).length,
      totalUsers: users.length
    },
    projects: relevantRows.map(r => ({
      name: r.project.name,
      owner: r.owner?.displayName || r.owner?.username || 'Unknown',
      department: departmentLabel(r.department || ''),
      status: r.project.status,
      progress: r.progress,
      totalTasks: r.totalTasks,
      doneTasks: r.doneTasks,
      overdueTasks: r.overdueTasks,
      startedThisMonth: r.startedThisMonth,
      completedThisMonth: r.completedThisMonth,
      ongoing: r.ongoing,
      notes: (r.project.notes || '').slice(0, 200)
    })),
    departmentBreakdown: Object.entries(getDepartmentCfg())
      .filter(([k]) => k)
      .map(([, cfg]) => ({
        name: cfg.l,
        count: relevantRows.filter(r => departmentLabel(r.department || '') === cfg.l).length
      }))
      .filter(d => d.count > 0),
    userBreakdown: users.map(u => ({
      name: u.displayName || u.username,
      department: departmentLabel(u.department || ''),
      ownedProjects: relevantRows.filter(r => r.project.ownerId === u.id).length,
      assignedTasks: tasks.filter(t => t.assigneeId === u.id).length,
      doneTasks: tasks.filter(t => t.assigneeId === u.id && t.status === 'done').length
    })).filter(u => u.ownedProjects + u.assignedTasks > 0)
  };

  const supabaseUrl = window.WT_CONFIG?.supabaseUrl;
  const anonKey = window.WT_CONFIG?.supabaseAnonKey;
  if (!supabaseUrl) { showToast('Supabase not configured — AI reports require cloud mode', 'error'); return; }

  showToast('Generating AI report… this may take 10–20 seconds', 'info');
  try {
    const resp = await fetch(`${supabaseUrl}/functions/v1/generate-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`
      },
      body: JSON.stringify(payload)
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${resp.status}`);
    }
    const { html } = await resp.json();
    showAIReportModal(html, label);
  } catch (err) {
    showToast(`AI report failed: ${err.message}`, 'error');
    console.error('[AI Report]', err);
  }
}

function showAIReportModal(html, label) {
  const ov = document.getElementById('modal-overlay');
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  ov.innerHTML = `
    <div class="modal modal-fullscreen">
      <div class="modal-header">
        <h2>${ICONS.sparkles} AI Report &mdash; ${esc(label)}</h2>
        <div style="display:flex;gap:8px;align-items:center">
          <a href="${esc(blobUrl)}" download="ai-report-${esc(label)}.html" class="btn btn-sm btn-ghost">${ICONS.download} Download</a>
          <button class="btn-icon" data-action="close-modal">${ICONS.x}</button>
        </div>
      </div>
      <div class="modal-body ai-report-body">
        <iframe class="ai-report-frame" src="${esc(blobUrl)}" title="AI Report for ${esc(label)}" sandbox="allow-scripts allow-same-origin"></iframe>
      </div>
    </div>`;
  ov.classList.remove('hidden');
}

async function refreshNotificationBadge() {
  const uid = actorId();
  if (!uid) return;
  try {
    const count = await DB.getUnreadNotificationCount(uid);
    const label = count > 0 ? String(count > 99 ? '99+' : count) : '';
    for (const id of ['notif-badge', 'mobile-notif-badge']) {
      const badge = document.getElementById(id);
      if (!badge) continue;
      if (count > 0) { badge.textContent = label; badge.classList.remove('hidden'); }
      else { badge.classList.add('hidden'); }
    }
  } catch (_) {}
}

async function renderNotificationPanel() {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  const uid = actorId();
  const rows = uid ? await DB.getNotifications(uid, { limit: 25 }) : [];
  const unread = rows.filter(r => !r.readAt).length;
  panel.innerHTML = `
    <div class="notif-panel-header">
      <h3>${ICONS.bell} Notifications ${unread ? `<span class="nav-item-badge" style="margin-left:6px">${unread}</span>` : ''}</h3>
      <button type="button" class="notif-panel-mark" data-action="open-notifications">View all</button>
      ${unread ? `<button type="button" class="notif-panel-mark" data-action="notif-mark-all">Mark all read</button>` : ''}
    </div>
    ${rows.length === 0
      ? `<div class="notif-empty">No notifications yet. Assignments and updates will show up here.</div>`
      : `<ul class="notif-list">${rows.map(n => {
          const projectHref = n.projectId ? `#/projects/${n.projectId}` : '#/projects';
          return `<li><button type="button" class="notif-item ${n.readAt ? '' : 'unread'}" data-action="notif-open" data-id="${n.id}" data-href="${projectHref}">
            <span class="notif-dot"></span>
            <span class="notif-body">
              <span class="notif-msg">${esc(n.message)}</span>
              <span class="notif-meta">${timeAgo(n.createdAt)}</span>
            </span>
          </button></li>`;
        }).join('')}</ul>`}`;
}

function toggleNotifPanel(force = null) {
  const panel = document.getElementById('notif-panel');
  if (!panel) return;
  const willOpen = force == null ? panel.classList.contains('hidden') : force;
  if (willOpen) { panel.classList.remove('hidden'); renderNotificationPanel(); }
  else panel.classList.add('hidden');
}

function closeNotifPanel() { toggleNotifPanel(false); }

async function renderNotificationsPage() {
  const content = document.getElementById('content');
  const uid = actorId();
  const rows = uid ? await DB.getNotifications(uid, { limit: 100 }) : [];
  const unread = rows.filter(r => !r.readAt).length;
  // Auto-mark all as read when page is visited
  if (uid && unread > 0) { await DB.markAllNotificationsRead(uid); refreshNotificationBadge(); }
  const TYPE_ICON = { assignment: '👤', task_done: '✅', mention: '💬', update: '📋' };
  content.innerHTML = `
    <div class="projects-page-header">
      <div class="projects-page-title"><h1>Notifications</h1><span class="projects-page-count">${rows.length} total</span></div>
    </div>
    <div class="notif-page-list">
      ${rows.length === 0 ? emptyState({ icon: 'activity', title: 'All clear!', description: 'Assignments and project updates will appear here.' })
        : rows.map(n => {
          const href = n.projectId ? `#/projects/${n.projectId}` : '#/projects';
          const icon = TYPE_ICON[n.type] || '🔔';
          return `<button type="button" class="notif-page-item${n.readAt ? '' : ' notif-page-item--unread'}" data-action="notif-open" data-id="${n.id}" data-href="${href}">
            <span class="notif-page-icon">${icon}</span>
            <div class="notif-page-body">
              <span class="notif-page-msg">${esc(n.message)}</span>
              <span class="notif-page-time">${timeAgo(n.createdAt)}</span>
            </div>
            ${!n.readAt ? '<span class="notif-unread-dot"></span>' : ''}
          </button>`;
        }).join('')}
    </div>`;
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
  const currentUser = actorId() ? await DB.getUser(actorId()) : null;
  const defaultDepartment = p?.department || currentUser?.department || '';
  const isE = !!p;

  showModal(isE ? 'Edit Project' : 'New Project', `
    <form data-form="project" data-edit-id="${editId || ''}" class="project-form-v2">
      <div class="pf-name-block">
        <input class="pf-name-input" name="name" type="text" value="${esc(p?.name || '')}" placeholder="Project name *" required autofocus>
        <textarea class="pf-desc-input" name="notes" placeholder="Short description (optional)…" rows="2">${esc(p?.notes || '')}</textarea>
      </div>
      <div class="pf-meta-strip">
        <label class="pf-meta-item">
          <span class="pf-meta-label">Type</span>
          <select name="type" class="pf-meta-select">${Object.entries(TYPE_CFG).map(([v,c]) => `<option value="${v}" ${(p?.type||'project')===v?'selected':''}>${c.l}</option>`).join('')}</select>
        </label>
        <label class="pf-meta-item">
          <span class="pf-meta-label">Priority</span>
          <select name="priority" class="pf-meta-select">${Object.entries(PRIO_CFG).map(([v,c]) => `<option value="${v}" ${(p?.priority||'medium')===v?'selected':''}>${c.l}</option>`).join('')}</select>
        </label>
        <label class="pf-meta-item">
          <span class="pf-meta-label">Department</span>
          <select name="department" class="pf-meta-select">
            <option value="" ${defaultDepartment===''?'selected':''}>Unassigned</option>
            ${departmentOptionsHtml(defaultDepartment)}
          </select>
        </label>
        <label class="pf-meta-item">
          <span class="pf-meta-label">Workflow</span>
          <select name="workflowTemplate" class="pf-meta-select">
            ${Object.entries(WORKFLOW_TEMPLATE_CFG).map(([k,c]) => `<option value="${k}" ${(p?.workflowTemplate||'')===k?'selected':''}>${c.l}</option>`).join('')}
          </select>
        </label>
        ${isE ? `<label class="pf-meta-item">
          <span class="pf-meta-label">Status</span>
          <select name="status" class="pf-meta-select">${Object.entries(STAT_CFG).map(([v,c]) => `<option value="${v}" ${p.status===v?'selected':''}>${c.l}</option>`).join('')}</select>
        </label>` : ''}
      </div>
      <label class="pf-ongoing-row">
        <input name="isOngoing" type="checkbox" value="1" ${p?.isOngoing?'checked':''}>
        <div class="pf-ongoing-text">
          <strong>Ongoing / recurring</strong>
          <span>Maintenance, stock counts, upgrades — work without a fixed end date</span>
        </div>
        <select name="cadence" class="pf-meta-select" style="margin-left:auto;min-width:130px">
          <option value="" ${!p?.cadence?'selected':''}>No repeat</option>
          <option value="daily" ${p?.cadence==='daily'?'selected':''}>Daily</option>
          <option value="weekly" ${p?.cadence==='weekly'?'selected':''}>Weekly</option>
          <option value="monthly" ${p?.cadence==='monthly'?'selected':''}>Monthly</option>
          <option value="quarterly" ${p?.cadence==='quarterly'?'selected':''}>Quarterly</option>
        </select>
      </label>
      ${!isE ? `
      <div class="pf-tasks-block">
        <div class="pf-tasks-header">
          <span class="pf-tasks-title">Starting tasks</span>
          <span class="pf-tasks-hint">Press ↵ to add next</span>
        </div>
        <div id="bulk-task-list" class="bulk-task-list"></div>
        <button type="button" id="bulk-add-task-btn" class="pf-add-task-btn">
          ${ICONS.plus} Add task
        </button>
      </div>` : ''}
      <div class="form-actions pf-actions">
        <button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button>
        <button type="submit" class="btn btn-primary">${isE ? 'Save changes' : 'Create Project'}</button>
      </div>
    </form>`);

  if (!isE) {
    const list = document.getElementById('bulk-task-list');
    const addBtn = document.getElementById('bulk-add-task-btn');

    function addBulkRow(focus = true) {
      const n = list.children.length + 1;
      const row = document.createElement('div');
      row.className = 'bulk-task-row';
      row.innerHTML = `<span class="bulk-task-num">${n}</span><input type="text" name="bulk_task[]" class="bulk-task-input" placeholder="Task title…" autocomplete="off"><button type="button" class="btn-icon bulk-task-remove" title="Remove"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>`;
      list.appendChild(row);
      if (focus) {
        const inp = row.querySelector('input');
        inp.focus();
        setTimeout(() => inp.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 0);
      }
    }

    function renumber() {
      [...list.children].forEach((r, i) => r.querySelector('.bulk-task-num').textContent = i + 1);
    }

    addBtn.addEventListener('click', () => addBulkRow(true));

    list.addEventListener('click', e => {
      if (e.target.closest('.bulk-task-remove')) {
        e.target.closest('.bulk-task-row').remove();
        renumber();
      }
    });

    list.addEventListener('keydown', e => {
      if (e.key !== 'Enter' || !e.target.classList.contains('bulk-task-input')) return;
      e.preventDefault();
      const inputs = [...list.querySelectorAll('.bulk-task-input')];
      const idx = inputs.indexOf(e.target);
      if (idx === inputs.length - 1) addBulkRow(true);
      else inputs[idx + 1].focus();
    });

    addBulkRow(false);
  }
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
    : `<div class="form-group"><label>Project</label><select name="projectId" required>${editable.map(p => `<option value="${p.id}" data-owner-id="${p.ownerId || ''}">${esc(p.name)}</option>`).join('')}</select></div>`;
  const users = await DB.getUsers();
  const meId = actorId();
  const defaultAssigneeId = lockedProject?.ownerId || editable[0]?.ownerId || meId;
  const sorted = [...users].sort((a, b) => (a.id === defaultAssigneeId ? -1 : b.id === defaultAssigneeId ? 1 : 0));
  const assigneeOptions = sorted
    .map(u => `<option value="${u.id}" ${u.id === defaultAssigneeId ? 'selected' : ''}>${esc(u.displayName || u.username)}${u.id === meId ? ' (me)' : ''}${u.id === defaultAssigneeId && u.id !== meId ? ' · project creator' : ''}${u.department ? ` · ${departmentLabel(u.department)}` : ''}${u.role === 'admin' ? ' · Admin' : ''}</option>`)
    .join('');
  showModal('New Task', `
    <form data-form="task" data-auto-project-owner="1">
      ${projectField}
      <div class="form-group"><label>Task Title</label><input name="title" type="text" placeholder="What needs to be done?" required autofocus></div>
      <div class="form-row">
        <div class="form-group"><label>Assignee</label><select name="assigneeId">${assigneeOptions}</select></div>
        <div class="form-group"><label>Due Date</label><input name="dueDate" type="date"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Priority</label><select name="priority"><option value="low">Low</option><option value="medium" selected>Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
        <div class="form-group"><label>Status</label><select name="status"><option value="todo" selected>To Do</option><option value="doing">In Progress</option><option value="done">Done</option></select></div>
      </div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Add Task</button></div>
    </form>`);
  const form = document.querySelector('form[data-form="task"][data-auto-project-owner="1"]');
  const projectSelect = form?.querySelector('select[name="projectId"]');
  const assigneeSelect = form?.querySelector('select[name="assigneeId"]');
  projectSelect?.addEventListener('change', () => {
    const ownerId = projectSelect.selectedOptions[0]?.dataset.ownerId;
    if (ownerId && assigneeSelect?.querySelector(`option[value="${ownerId}"]`)) assigneeSelect.value = ownerId;
  });
}

async function showAssignTaskModal(taskId) {
  const task = await DB.getTask(taskId); if (!task) { showToast('Task not found', 'error'); return; }
  const project = await DB.getProject(task.projectId);
  if (!project || !canEdit(project)) { showToast('Permission denied', 'error'); return; }
  const users = await DB.getUsers();
  showModal('Reassign Task', `
    <form data-form="reassign-task" data-task-id="${task.id}">
      <p class="text-muted text-sm" style="margin-bottom:12px">Reassign <strong>${esc(task.title)}</strong> to another team member.</p>
      <div class="form-group"><label>Assignee</label>
        <select name="assigneeId">
          <option value="">Unassigned</option>
          ${users.map(u => `<option value="${u.id}" ${u.id === task.assigneeId ? 'selected' : ''}>${esc(u.displayName || u.username)}${u.department ? ` · ${departmentLabel(u.department)}` : ''}${u.role === 'admin' ? ' · Admin' : ''}</option>`).join('')}
        </select>
      </div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Save assignment</button></div>
    </form>`);
}

function assigneeChipHtml(user) {
  if (!user) return `<span class="assignee-chip unassigned"><span class="assignee-avatar">?</span>Unassigned</span>`;
  const initials = (user.displayName || user.username || '?').charAt(0).toUpperCase();
  const avatarInner = user.avatarBase64
    ? `<img src="${esc(user.avatarBase64)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover" alt="${esc(initials)}">`
    : initials;
  return `<span class="assignee-chip" ${userColorStyle(user)} title="${esc(user.displayName || user.username)}"><span class="assignee-avatar">${avatarInner}</span>${esc((user.displayName || user.username).split(' ')[0])}</span>`;
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
      <div class="form-group"><label>Department</label><select name="department">
        <option value="">Unassigned</option>
        ${departmentOptionsHtml()}
      </select></div>
      <div class="form-group"><label>Color</label><input name="color" type="color" value="#4f46e5"></div>
      <div class="form-group"><label>Password</label><input name="password" type="password" placeholder="Min 4 characters" required minlength="4"></div>
      <div class="form-group"><label>Role</label><select name="role"><option value="user" selected>Member</option><option value="admin">Admin</option></select></div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Create User</button></div>
    </form>`);
}

async function showEditUserModal(uid) {
  if (!isAdmin()) { showToast('Admins only', 'error'); return; }
  const u = await DB.getUser(uid);
  if (!u) { showToast('User not found', 'error'); return; }
  const s = getSession();
  const isSelf = u.id === s.userId;
  showModal('Edit User', `
    <form data-form="edit-user" data-user-id="${u.id}">
      <p class="text-muted text-sm" style="margin-bottom:12px">Rename the account, change the display name, email, role, or Discord ID.${isSelf ? ' <strong>This is your own account.</strong>' : ''}</p>
      <div class="form-group"><label>Username</label><input name="username" type="text" value="${esc(u.username)}" required autocomplete="off"></div>
      <div class="form-group"><label>Display Name</label><input name="displayName" type="text" value="${esc(u.displayName || '')}" required></div>
      <div class="form-group"><label>Email</label><input name="email" type="email" value="${esc(u.email || '')}" placeholder="user@example.com"></div>
      <div class="form-group"><label>Department</label><select name="department">
        <option value="" ${!u.department ? 'selected' : ''}>Unassigned</option>
        ${departmentOptionsHtml(u.department || '')}
      </select></div>
      <div class="form-group"><label>Color</label><input name="color" type="color" value="${esc(u.color || userColor(u))}"><p class="text-muted text-sm" style="margin-top:4px">Used for avatars, task chips, and chat bubbles.</p></div>
      <div class="form-group">
        <label>Discord User ID</label>
        <input name="discordId" type="text" value="${esc(u.discordId || '')}" placeholder="e.g. 123456789012345678" pattern="[0-9]*">
        <p class="text-muted text-sm" style="margin-top:4px">Used to <code>@mention</code> this user in Discord notifications. In Discord, enable Developer Mode then right-click the user → Copy User ID.</p>
      </div>
      <div class="form-group"><label>Role</label>
        <select name="role" ${isSelf ? 'disabled' : ''}>
          <option value="user" ${u.role === 'user' ? 'selected' : ''}>Member</option>
          <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
        ${isSelf ? '<p class="text-muted text-sm" style="margin-top:4px">You cannot change your own role.</p>' : ''}
      </div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Save changes</button></div>
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

async function showProfileModal() {
  const s = getSession(); if (!s) return;
  const user = await DB.getUser(s.userId);
  if (!user) { showToast('Could not load profile', 'error'); return; }
  const isAdm = s.role === 'admin';
  const avatarUrl = user.avatarBase64 || '';
  const initials = (user.displayName || user.username || '?').charAt(0).toUpperCase();
  showModal('My Profile', `
    <form data-form="edit-profile" class="profile-form-v2">
      <div class="profile-avatar-section">
        <div class="profile-avatar-wrap">
          ${avatarUrl
            ? `<img id="profile-avatar-preview" src="${esc(avatarUrl)}" class="profile-avatar-img" alt="avatar">`
            : `<div id="profile-avatar-preview" class="profile-avatar-initials" ${userColorStyle(user)}>${initials}</div>`}
          <label class="profile-avatar-edit-btn" title="Change photo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <input type="file" id="profile-avatar-input" accept="image/*" style="display:none">
          </label>
        </div>
        <div class="profile-identity">
          <strong class="profile-username">@${esc(user.username)}</strong>
          ${isAdm ? `<span class="admin-tag">${ICONS.crown} Admin</span>` : ''}
          ${departmentBadge(user.department || '')}
        </div>
      </div>
      <input type="hidden" name="avatarBase64" id="profile-avatar-b64" value="">
      <div class="form-group"><label>Display Name</label><input name="displayName" type="text" value="${esc(user.displayName || '')}" placeholder="e.g. Akram" required></div>
      <div class="form-group"><label>Email</label><input name="email" type="email" value="${esc(user.email || '')}" placeholder="you@example.com"></div>
      <div class="form-group"><label>Bio / About</label><textarea name="bio" rows="2" placeholder="What do you do? e.g. Procurement lead at SubZero Motors">${esc(user.bio || '')}</textarea></div>
      <div class="form-group"><label>Department</label><select name="department">
        <option value="" ${!user.department ? 'selected' : ''}>Unassigned</option>
        ${departmentOptionsHtml(user.department || '')}
      </select></div>
      <div class="form-group"><label>Accent Color</label><div style="display:flex;gap:8px;align-items:center"><input name="color" type="color" value="${esc(user.color||'#4f46e5')}" style="height:36px;width:60px;border-radius:6px;border:1px solid var(--border);cursor:pointer"><span class="text-muted text-sm">Used for your avatar and highlights</span></div></div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Save profile</button></div>
    </form>`);
  // Avatar preview
  const avatarInput = document.getElementById('profile-avatar-input');
  const avatarPreview = document.getElementById('profile-avatar-preview');
  const avatarB64 = document.getElementById('profile-avatar-b64');
  if (avatarInput) {
    avatarInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { showToast('Image too large (max 2 MB)', 'warning'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target.result;
        avatarB64.value = b64;
        if (avatarPreview) {
          avatarPreview.outerHTML = `<img id="profile-avatar-preview" src="${esc(b64)}" class="profile-avatar-img" alt="avatar">`;
        }
      };
      reader.readAsDataURL(file);
    });
  }
}

function howtoSeenKey(userId) { return `wt-howto-seen-${userId}`; }

function showOnboardingModal(force = false) {
  const s = getSession(); if (!s) return;
  if (!force && localStorage.getItem(howtoSeenKey(s.userId))) return;
  const isAdm = s.role === 'admin';
  const ov = document.getElementById('modal-overlay');
  ov.innerHTML = `
    <div class="modal modal-howto">
      <div class="modal-header">
        <h2>${ICONS.sparkles} Welcome to WorkTracker${s.displayName ? `, ${esc(s.displayName)}` : ''}!</h2>
        <button class="btn-icon" data-action="close-howto">${ICONS.x}</button>
      </div>
      <div class="modal-body">
        <p class="text-secondary" style="margin-bottom:14px">Here's a 30-second tour to get you started.</p>
        <ol class="howto-list">
          <li>
            <span class="howto-step-icon">${ICONS.folder}</span>
            <div>
              <strong>Create a project</strong>
              <p class="text-muted text-sm">Go to <strong>Projects</strong> in the sidebar and click <em>New Project</em>. Add a name, description, type, and priority.</p>
            </div>
          </li>
          <li>
            <span class="howto-step-icon">${ICONS.checkCircle}</span>
            <div>
              <strong>Add tasks</strong>
              <p class="text-muted text-sm">Open a project and click <em>Add Task</em>. The project is auto-selected. You can also click <em>New Task</em> from the Projects or Tasks pages and pick the project from a dropdown.</p>
            </div>
          </li>
          <li>
            <span class="howto-step-icon">${ICONS.user}</span>
            <div>
              <strong>See your teammates' work</strong>
              <p class="text-muted text-sm">On the <strong>Projects</strong> page, switch the <em>Workspace</em> toggle to <strong>Everyone</strong> to browse other people's projects (read-only). Their task details stay private${isAdm ? ' — except for admins, who can see everything' : ''}.</p>
            </div>
          </li>
          <li>
            <span class="howto-step-icon">${ICONS.file}</span>
            <div>
              <strong>Upload files & track progress</strong>
              <p class="text-muted text-sm">Inside a project, use the <em>Library</em> tab or right-side <em>Documents</em> panel to attach PDFs/images. The <em>Activity</em> tab keeps an audit log of every change.</p>
            </div>
          </li>
        </ol>
        <p class="text-muted text-sm" style="margin-top:14px">You can reopen this any time from your profile menu (bottom-left → <em>Show How-to</em>).</p>
        <div class="form-actions"><button type="button" class="btn btn-primary" data-action="close-howto" style="flex:1;justify-content:center">Got it — let's go</button></div>
      </div>
    </div>`;
  ov.classList.remove('hidden');
  localStorage.setItem(howtoSeenKey(s.userId), String(Date.now()));
}


async function renderActivityPage() {
  if (!isAdmin()) { window.location.hash = '#/projects'; return; }
  const content = document.getElementById('content');
  const log = await DB.getActivityLog({ limit: 200 });
  const users = await DB.getUsers();
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));
  const ACTION_ICON = { created:'🟢', updated:'✏️', deleted:'🗑️', uploaded:'📎', logged_in:'🔑', logged_out:'🚪', noted:'📝', completed:'✅', assigned:'👤', task_done:'✅' };
  content.innerHTML = `
    <div class="projects-page-header" style="margin-bottom:20px">
      <div class="projects-page-title"><h1>Activity Log</h1><span class="projects-page-count">${log.length} entries</span></div>
      <a href="#/dashboard" class="btn btn-ghost">${ICONS.arrowLeft} Back to Dashboard</a>
    </div>
    <div class="activity-log-page">
      ${log.length === 0 ? emptyState({ icon:'activity', title:'No activity yet', description:'Actions taken in the app appear here.' })
        : log.map(entry => {
          const who = uMap[entry.userId];
          const init = who ? (who.displayName || who.username || '?').charAt(0).toUpperCase() : '?';
          const icon = ACTION_ICON[entry.action] || '●';
          return `<div class="activity-page-row">
            <span class="activity-page-icon">${icon}</span>
            <span class="dash-act-av" ${userColorStyle(who)}>${init}</span>
            <div class="activity-page-body">
              <span class="activity-page-text">${formatActivityMessage(entry, uMap)}</span>
              <span class="activity-page-time">${new Date(entry.createdAt).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>
            </div>
          </div>`;
        }).join('')}
    </div>`;
}

function showAboutModal() {
  showModal('About WorkTracker', `
    <div class="about-modal">
      <div class="about-logo-row">
        <div class="about-logo-mark">
          <svg width="36" height="36" viewBox="0 0 100 100">
            <rect x="14" y="28" width="52" height="11" rx="5.5" fill="white" opacity="0.95"/>
            <path d="M74 30 L80 36 L90 23" stroke="white" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="14" y="46" width="40" height="11" rx="5.5" fill="white" opacity="0.65"/>
            <rect x="14" y="64" width="26" height="11" rx="5.5" fill="white" opacity="0.4"/>
          </svg>
        </div>
        <div>
          <div class="about-app-name">WorkTracker</div>
          <div class="about-version">Version 2.0.0 · Built for SubZero Motors</div>
        </div>
      </div>
      <p class="about-desc">A team project and task management tool built for fast-moving teams. Organize projects, track tasks, attach files to tasks, and collaborate — all in one place.</p>
      <div class="about-features">
        <div class="about-feature-row"><span class="about-feature-icon">📁</span><div><strong>Projects</strong><span> — Status tracking, milestones, progress bars, and department filters.</span></div></div>
        <div class="about-feature-row"><span class="about-feature-icon">✅</span><div><strong>Tasks</strong><span> — List &amp; Board views, drag-to-reorder, priority sorting, grouped by project.</span></div></div>
        <div class="about-feature-row"><span class="about-feature-icon">📝</span><div><strong>Task Details</strong><span> — Click any task to add notes, tracking numbers, custom fields, and file attachments.</span></div></div>
        <div class="about-feature-row"><span class="about-feature-icon">📎</span><div><strong>Files</strong><span> — Drag &amp; drop files to projects or individual tasks. Images show live previews.</span></div></div>
        <div class="about-feature-row"><span class="about-feature-icon">📅</span><div><strong>Timeline</strong><span> — Visual Gantt-style timeline by due date with today marker.</span></div></div>
        <div class="about-feature-row"><span class="about-feature-icon">💬</span><div><strong>Chat</strong><span> — Team channels with Discord webhook integration.</span></div></div>
        <div class="about-feature-row"><span class="about-feature-icon">📊</span><div><strong>Dashboard &amp; Reports</strong><span> — Admin telemetry, monthly reports, activity log.</span></div></div>
        <div class="about-feature-row"><span class="about-feature-icon">🔔</span><div><strong>Notifications</strong><span> — Assignment and completion alerts with in-app bell.</span></div></div>
      </div>
      <div class="about-footer">
        <span class="text-muted text-sm">Powered by Supabase + IndexedDB · Built with ❤️</span>
      </div>
      <div class="form-actions"><button class="btn btn-primary" data-action="close-modal">Close</button></div>
    </div>`);
}

async function showTaskDetailModal(taskId) {
  const task = await DB.getTask(taskId);
  if (!task) { showToast('Task not found', 'error'); return; }
  const project = await DB.getProject(task.projectId);
  const editable = project && canEdit(project);
  const users = await DB.getUsers();
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));
  const assignee = uMap[task.assigneeId];
  const attachments = await DB.getAttachments(task.projectId);
  const taskAtts = attachments.filter(a => Number(a.taskId) === Number(taskId));

  const blobUrls = [];
  const filesHtml = taskAtts.map(a => {
    const isImg = a.mimeType?.startsWith('image/');
    const url = a.blob ? URL.createObjectURL(a.blob) : (DB.getAttachmentUrl ? DB.getAttachmentUrl(a.storagePath) : '');
    if (a.blob && url) blobUrls.push(url);
    return `<div class="td-file-card">
      <button type="button" class="td-file-preview" data-action="preview-attachment" data-id="${a.id}">
        ${isImg && url ? `<img src="${esc(url)}" alt="${esc(a.fileName)}" style="width:100%;height:100%;object-fit:cover;border-radius:6px">` : `<span style="font-size:1.6rem">${a.mimeType === 'application/pdf' ? '📄' : '📎'}</span>`}
      </button>
      <span class="td-file-name">${esc(a.fileName)}</span>
      ${editable ? `<button class="btn-icon td-file-del" data-action="delete-attachment" data-id="${a.id}" title="Remove">${ICONS.trash}</button>` : ''}
    </div>`;
  }).join('');

  showModal(`Task: ${esc(task.title)}`, `
    <div class="task-detail-modal" data-task-id="${taskId}">
      ${project ? `<div style="margin-bottom:14px"><a href="#/projects/${project.id}" class="badge badge-blue" data-action="close-modal" style="cursor:pointer">${ICONS.folder} ${esc(project.name)}</a></div>` : ''}
      <div class="td-meta-row">
        ${editable ? `
          <label class="td-field"><span class="td-field-label">Status</span>
            <select class="td-select" data-td="status">
              <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>To Do</option>
              <option value="doing" ${task.status === 'doing' ? 'selected' : ''}>In Progress</option>
              <option value="done" ${task.status === 'done' ? 'selected' : ''}>Done</option>
            </select></label>
          <label class="td-field"><span class="td-field-label">Priority</span>
            <select class="td-select" data-td="priority">
              <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
              <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
            </select></label>
          <label class="td-field"><span class="td-field-label">Due Date</span>
            <input type="date" class="td-select" data-td="dueDate" value="${esc(task.dueDate || '')}"></label>
          <label class="td-field" style="flex:1.5"><span class="td-field-label">Assignee</span>
            <select class="td-select" data-td="assigneeId">
              ${users.map(u => `<option value="${u.id}" ${u.id === task.assigneeId ? 'selected' : ''}>${esc(u.displayName || u.username)}</option>`).join('')}
            </select></label>
        ` : `<span>${taskBadge(task.status)}</span><span>${prioBadge(task.priority)}</span>
          ${task.dueDate ? `<span class="text-muted text-sm">${ICONS.calendar} ${formatDateShort(task.dueDate)}</span>` : ''}
          ${assignee ? `<span>${assigneeChipHtml(assignee)}</span>` : ''}`}
      </div>
      <div class="td-section">
        <span class="td-section-label">Notes</span>
        ${editable
          ? `<textarea class="td-notes" data-td="notes" placeholder="Add notes, context, or any details…" rows="2">${esc(task.notes || '')}</textarea>`
          : `<p class="td-notes-view">${task.notes ? esc(task.notes) : '<span class="text-muted">No notes.</span>'}</p>`}
      </div>
      ${editable ? `
      <div class="td-section" id="td-custom-fields-section">
        <div class="td-section-header">
          <span class="td-section-label">Custom Fields</span>
          <button type="button" class="btn btn-sm btn-ghost" id="td-add-field-btn">${ICONS.plus} Add field</button>
        </div>
        <div id="td-custom-fields" class="td-custom-fields">
          ${(task.customFields||[]).map((f,i) => `
            <div class="td-cf-row" data-cf-index="${i}">
              <input class="td-cf-label" type="text" value="${esc(f.label)}" placeholder="Field name" data-cf="label" data-idx="${i}">
              <input class="td-cf-value" type="text" value="${esc(f.value)}" placeholder="Value" data-cf="value" data-idx="${i}">
              <button type="button" class="btn-icon td-cf-del" data-cf-del="${i}" title="Remove field">${ICONS.trash}</button>
            </div>`).join('')}
        </div>
        <p class="text-muted text-sm" style="padding:0 0 4px;font-size:0.72rem">Use for tracking numbers, reference IDs, shipping details, or any custom info.</p>
      </div>` : (task.customFields?.length ? `
      <div class="td-section">
        <span class="td-section-label">Custom Fields</span>
        ${task.customFields.map(f => `<div class="td-cf-readonly"><span class="td-cf-readonly-label">${esc(f.label)}</span><span class="td-cf-readonly-value">${esc(f.value)}</span></div>`).join('')}
      </div>` : '')}
      ${editable ? `
      <div class="td-section">
        <div class="td-section-header">
          <span class="td-section-label">Attachments (${taskAtts.length})</span>
          <label class="btn btn-sm btn-ghost td-attach-btn">
            ${ICONS.upload} Add file
            <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt" style="display:none" class="td-file-input" data-task-id="${taskId}" data-project-id="${task.projectId}">
          </label>
        </div>
        <div class="td-drop-zone" data-task-id="${taskId}" data-project-id="${task.projectId}">
          ${filesHtml || `<p class="td-drop-hint">Drag &amp; drop files here, or click <strong>Add file</strong></p>`}
        </div>
      </div>` : taskAtts.length ? `<div class="td-section"><span class="td-section-label">Attachments</span><div class="td-files-grid">${filesHtml}</div></div>` : ''}
      <div class="form-actions" style="margin-top:20px">
        ${editable ? `<button class="btn btn-primary" data-action="save-task-detail" data-id="${taskId}">Save Changes</button>` : ''}
        <button class="btn btn-ghost" data-action="close-modal">Close</button>
      </div>
    </div>`);

  // Custom fields: add new field
  const addFieldBtn = document.getElementById('td-add-field-btn');
  const cfContainer = document.getElementById('td-custom-fields');
  if (addFieldBtn && cfContainer) {
    addFieldBtn.addEventListener('click', () => {
      const idx = cfContainer.querySelectorAll('.td-cf-row').length;
      const row = document.createElement('div');
      row.className = 'td-cf-row';
      row.dataset.cfIndex = idx;
      row.innerHTML = `<input class="td-cf-label" type="text" placeholder="Field name (e.g. Tracking #)" data-cf="label" data-idx="${idx}">
        <input class="td-cf-value" type="text" placeholder="Value" data-cf="value" data-idx="${idx}">
        <button type="button" class="btn-icon td-cf-del" data-cf-del="${idx}" title="Remove">${ICONS.trash}</button>`;
      cfContainer.appendChild(row);
      row.querySelector('.td-cf-label')?.focus();
    });
    cfContainer.addEventListener('click', e => {
      const delBtn = e.target.closest('[data-cf-del]');
      if (delBtn) { delBtn.closest('.td-cf-row')?.remove(); }
    });
  }

  // File input handler inside modal
  const fileInput = document.querySelector('.td-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      const pid = Number(fileInput.dataset.projectId);
      const tid = Number(fileInput.dataset.taskId);
      const s = getSession();
      const max = 10 * 1024 * 1024;
      for (const file of files) {
        if (file.size > max) { showToast(`${file.name} too large (max 10 MB)`, 'warning'); continue; }
        await DB.addAttachment({ projectId: pid, taskId: tid, uploadedBy: s.userId, fileName: file.name, mimeType: file.type || 'application/octet-stream', blob: file });
      }
      bustWorkspaceCache();
      blobUrls.forEach(u => { try { URL.revokeObjectURL(u); } catch(_) {} });
      await showTaskDetailModal(tid);
    });
  }

  // Drag-drop on the drop zone
  const dz = document.querySelector('.td-drop-zone');
  if (dz && editable) {
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('td-drop-zone--active'); });
    dz.addEventListener('dragleave', e => { if (!dz.contains(e.relatedTarget)) dz.classList.remove('td-drop-zone--active'); });
    dz.addEventListener('drop', async e => {
      e.preventDefault(); dz.classList.remove('td-drop-zone--active');
      const files = Array.from(e.dataTransfer.files || []);
      const pid = Number(dz.dataset.projectId);
      const tid = Number(dz.dataset.taskId);
      const s = getSession();
      const max = 10 * 1024 * 1024;
      for (const file of files) {
        if (file.size > max) { showToast(`${file.name} too large`, 'warning'); continue; }
        await DB.addAttachment({ projectId: pid, taskId: tid, uploadedBy: s.userId, fileName: file.name, mimeType: file.type || 'application/octet-stream', blob: file });
      }
      bustWorkspaceCache();
      blobUrls.forEach(u => { try { URL.revokeObjectURL(u); } catch(_) {} });
      await showTaskDetailModal(tid);
    });
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target; if (!form.dataset.form) return;
  const fd = new FormData(form); const type = form.dataset.form;
  try {
    const uid = actorId();
    if (type === 'project') {
      const data = {
        name: fd.get('name')?.trim(),
        notes: fd.get('notes')?.trim(),
        type: fd.get('type'),
        priority: fd.get('priority'),
        department: fd.get('department') || '',
        workflowTemplate: fd.get('workflowTemplate') || '',
        isOngoing: fd.get('isOngoing') === '1',
        cadence: fd.get('cadence') || ''
      };
      if (data.workflowTemplate === 'logistics-shipment') data.department = 'logistics';
      if (!data.name) return;
      const editId = form.dataset.editId;
      const _submitBtn = form.querySelector('[type=submit]');
      if (_submitBtn?.disabled) return;
      if (_submitBtn) { _submitBtn.disabled = true; _submitBtn.textContent = editId ? 'Saving…' : 'Creating…'; }
      if (editId) {
        const sv = fd.get('status'); if (sv) data.status = sv;
        const existing = await DB.getProject(Number(editId));
        await DB.updateProject(Number(editId), data, uid);
        const updated = await DB.getProject(Number(editId));
        await ensureProjectWorkflowTasks(updated, uid);
        await syncWorkflowProjectStatus(updated, uid);
        await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} updated project "${updated?.name || existing?.name || 'Project'}" (${departmentLabel(projectDepartmentValue(updated || existing))}).`);
        bustWorkspaceCache();
        const unsaved = projectSaveMismatchFields(data, updated);
        if (unsaved.length) showToast(`Project updated, but ${unsaved.join(', ')} could not be saved. Run the latest Supabase schema.`, 'warning');
        else showToast('Project updated', 'success');
      } else {
        data.ownerId = getSession().userId;
        data.actorUserId = uid;
        const nid = await DB.createProject(data);
        const created = await DB.getProject(nid);
        await ensureProjectWorkflowTasks(created, uid);
        const bulkTitles = [...document.querySelectorAll('input[name="bulk_task[]"]')]
          .map(i => i.value.trim()).filter(Boolean);
        for (const title of bulkTitles) {
          await DB.createTask({ projectId: nid, title, status: 'todo', priority: 'medium', assigneeId: data.ownerId || uid, actorUserId: uid });
        }
        await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} created project "${created?.name || data.name}" (${departmentLabel(projectDepartmentValue(created))})${bulkTitles.length ? ` with ${bulkTitles.length} task${bulkTitles.length !== 1 ? 's' : ''}` : ''}.`);
        bustWorkspaceCache();
        const unsaved = projectSaveMismatchFields(data, created);
        if (unsaved.length) showToast(`Project created, but ${unsaved.join(', ')} could not be saved. Run the latest Supabase schema.`, 'warning');
        else showToast('Project created', 'success');
        hideModal();
        window.location.hash = `#/projects/${nid}`; return;
      }
    } else if (type === 'task') {
      const _taskSubmitBtn = form.querySelector('[type=submit]');
      if (_taskSubmitBtn?.disabled) return;
      if (_taskSubmitBtn) { _taskSubmitBtn.disabled = true; _taskSubmitBtn.textContent = 'Adding…'; }
      const picked = Number(fd.get('assigneeId'));
      const assigneeId = Number.isFinite(picked) && picked > 0 ? picked : uid;
      const data = { projectId: Number(fd.get('projectId')), title: fd.get('title')?.trim(), dueDate: fd.get('dueDate') || '', priority: fd.get('priority'), status: fd.get('status'), assigneeId, actorUserId: uid };
      if (!data.title || !data.projectId) { if (_taskSubmitBtn) { _taskSubmitBtn.disabled = false; _taskSubmitBtn.textContent = 'Add Task'; } return; }
      const newId = await DB.createTask(data);
      const project = await DB.getProject(data.projectId);
      await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} added task "${data.title}" to "${project?.name || 'a project'}".`);
      showToast('Task added', 'success');
      // Notify the assignee (skip if assigning to self)
      if (assigneeId && assigneeId !== uid) {
        const actor = await DB.getUser(uid);
        const assignee = await DB.getUser(assigneeId);
        const msg = `${actor?.displayName || 'Someone'} assigned you the task "${data.title}" in ${project?.name || 'a project'}.`;
        const discordMsg = `**${actor?.displayName || 'Someone'}** assigned **${data.title}** to ${assignee?.discordId ? `<@${assignee.discordId}>` : (assignee?.displayName || 'a teammate')} in *${project?.name || 'a project'}*.`;
        await notifyUser({ userId: assigneeId, type: 'assignment', message: msg, projectId: data.projectId, entityType: 'task', entityId: newId, actorUserId: uid, discordContent: discordMsg });
      }
    } else if (type === 'reassign-task') {
      const taskId = Number(form.dataset.taskId);
      const task = await DB.getTask(taskId); if (!task) return;
      const project = await DB.getProject(task.projectId);
      if (!project || !canEdit(project)) { showToast('Permission denied', 'error'); return; }
      const newAssigneeRaw = fd.get('assigneeId');
      const newAssigneeId = newAssigneeRaw ? Number(newAssigneeRaw) : null;
      await DB.updateTask(taskId, { assigneeId: newAssigneeId }, uid);
      const newAssignee = newAssigneeId ? await DB.getUser(newAssigneeId) : null;
      await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} reassigned task "${task.title}" in "${project.name}"${newAssignee ? ` to ${newAssignee.displayName || newAssignee.username}` : ' to nobody'}.`);
      showToast('Task reassigned', 'success');
      if (newAssigneeId && newAssigneeId !== uid && newAssigneeId !== task.assigneeId) {
        const actor = await DB.getUser(uid);
        const assignee = newAssignee;
        const msg = `${actor?.displayName || 'Someone'} assigned you the task "${task.title}" in ${project.name}.`;
        const discordMsg = `**${actor?.displayName || 'Someone'}** reassigned **${task.title}** to ${assignee?.discordId ? `<@${assignee.discordId}>` : (assignee?.displayName || 'a teammate')} in *${project.name}*.`;
        await notifyUser({ userId: newAssigneeId, type: 'assignment', message: msg, projectId: project.id, entityType: 'task', entityId: taskId, actorUserId: uid, discordContent: discordMsg });
      }
    } else if (type === 'webhook-general') {
      if (!isAdmin()) { showToast('Admins only', 'error'); return; }
      const url = fd.get('url')?.trim();
      const channelUrl = fd.get('channelUrl')?.trim() || '';
      if (url && !/^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\//.test(url)) { showToast('That doesn\'t look like a Discord webhook URL', 'warning'); return; }
      if (!url) {
        const existing = await DB.getGeneralWebhook();
        if (existing) await DB.deleteWebhook(existing.id);
        _webhooksCache = null;
        showToast('General webhook cleared', 'info');
      } else {
        await DB.saveGeneralWebhook({ url: trimWebhookUrl(url), channelUrl });
        _webhooksCache = null;
        showToast('General webhook saved', 'success');
      }
    } else if (type === 'webhook-project') {
      if (!isAdmin()) { showToast('Admins only', 'error'); return; }
      const pid = Number(form.dataset.projectId);
      const url = fd.get('url')?.trim();
      const channelUrl = fd.get('channelUrl')?.trim() || '';
      const project = await DB.getProject(pid);
      if (!project) return;
      if (url && !/^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\//.test(url)) { showToast('That doesn\'t look like a Discord webhook URL', 'warning'); return; }
      if (!url) {
        const existing = await DB.getProjectWebhook(pid);
        if (existing) await DB.deleteWebhook(existing.id);
        _webhooksCache = null;
        showToast('Project webhook cleared', 'info');
      } else {
        await DB.saveProjectWebhook(pid, { url: trimWebhookUrl(url), channelUrl, name: project.name });
        _webhooksCache = null;
        showToast(`Webhook saved for ${project.name}`, 'success');
      }
    } else if (type === 'chat-send') {
      const channelId = form.dataset.channelId;
      const content = fd.get('content')?.trim();
      if (!content) return;
      const session = getSession();
      let hook = null;
      if (channelId === 'general') hook = await DB.getGeneralWebhook();
      else if (channelId?.startsWith('project-')) hook = await DB.getProjectWebhook(Number(channelId.split('-')[1]));
      if (!hook?.url) { showToast('No webhook configured for this channel', 'error'); return; }
      const result = await postToDiscordWebhook(hook.url, {
        username: discordWebhookUsername(session),
        content
      });
      if (!result.ok) {
        showToast(discordFailToast(result), 'error');
        return;
      }
      form.reset();
      const projectId = hook.projectId ?? null;
      const uMap = state.chatUsersMap || {};
      const optimistic = {
        userId: uid,
        projectId,
        action: 'sent_message',
        entityType: 'chat',
        details: content.slice(0, 2000),
        createdAt: new Date().toISOString()
      };
      appendChatMessageToPane(optimistic, uMap);
      try {
        const saved = await DB.logActivity({ userId: uid, projectId, action: 'sent_message', entityType: 'chat', details: optimistic.details });
        if (!saved) {
          showToast('Posted to Discord but could not save in app', 'warning');
          await refreshChatPane();
        }
      } catch (err) {
        console.warn(err);
        showToast('Posted to Discord but could not save in app', 'warning');
        await refreshChatPane();
      }
      return;
    } else if (type === 'milestone') {
      const data = { projectId: Number(form.dataset.projectId), title: fd.get('title')?.trim(), dueDate: fd.get('dueDate') || '', weight: Number(fd.get('weight')) || 1, actorUserId: uid };
      if (!data.title) return;
      const project = await DB.getProject(data.projectId);
      await DB.createMilestone(data); showToast('Milestone added', 'success');
      await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} added milestone "${data.title}" to "${project?.name || 'a project'}".`);
    } else if (type === 'update') {
      const data = { projectId: Number(form.dataset.projectId), content: fd.get('content')?.trim(), actorUserId: uid };
      if (!data.content) return;
      const project = await DB.getProject(data.projectId);
      await DB.createUpdate(data); showToast('Note added', 'success');
      await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} added a project note to "${project?.name || 'a project'}": ${data.content.slice(0, 140)}${data.content.length > 140 ? '…' : ''}`);
    } else if (type === 'add-user') {
      const username = fd.get('username')?.trim();
      const email = fd.get('email')?.trim() || '';
      const displayName = fd.get('displayName')?.trim() || username;
      const password = fd.get('password');
      const role = fd.get('role');
      const department = fd.get('department') || '';
      const color = fd.get('color') || '';
      if (!username || !password || password.length < 4) { showToast('Fill all fields (pw min 4 chars)', 'warning'); return; }
      const exists = await DB.getUserByUsername(username);
      if (exists) { showToast('Username already taken', 'error'); return; }
      await DB.createUser({ username, displayName, email, password, role, department, color });
      bustWorkspaceCache();
      showToast('User created', 'success');
    } else if (type === 'reset-pw') {
      const pw = fd.get('password'); const confirm = fd.get('confirm');
      if (!pw || pw.length < 4) { showToast('Password min 4 characters', 'warning'); return; }
      if (pw !== confirm) { showToast('Passwords do not match', 'error'); return; }
      await DB.changePassword(Number(form.dataset.userId), pw, actorId());
      showToast('Password reset', 'success');
    } else if (type === 'edit-user') {
      if (!isAdmin()) { showToast('Admins only', 'error'); return; }
      const targetId = Number(form.dataset.userId);
      const username = fd.get('username')?.trim().toLowerCase();
      const displayName = fd.get('displayName')?.trim();
      const email = fd.get('email')?.trim() || '';
      const department = fd.get('department') || '';
      const discordId = (fd.get('discordId') || '').toString().trim();
      const color = (fd.get('color') || '').toString().trim();
      const role = fd.get('role');
      if (!username) { showToast('Username is required', 'warning'); return; }
      if (!displayName) { showToast('Display name is required', 'warning'); return; }
      if (!/^[a-z0-9_.-]{2,32}$/.test(username)) { showToast('Username: 2–32 chars, lowercase letters, digits, _ . -', 'warning'); return; }
      if (discordId && !/^\d{6,30}$/.test(discordId)) { showToast('Discord ID must be a numeric snowflake (e.g. 123456789012345678)', 'warning'); return; }
      const s = getSession();
      const isSelf = targetId === s.userId;
      const changes = { username, displayName, email, department, discordId, color };
      if (!isSelf && role) changes.role = role;
      try {
        await DB.updateUser(targetId, changes, s.userId);
      } catch (err) {
        showToast(err?.message || 'Could not update user', 'error');
        return;
      }
      if (isSelf) {
        const updated = await DB.getUser(targetId);
        if (updated) setSession(updated);
        updateSidebarUser();
      }
      showToast('User updated', 'success');
    } else if (type === 'edit-profile') {
      const s = getSession(); if (!s) return;
      const displayName = fd.get('displayName')?.trim();
      const email = fd.get('email')?.trim() || '';
      const department = fd.get('department') || '';
      const bio = fd.get('bio')?.trim() || '';
      const color = fd.get('color') || '';
      const avatarBase64 = fd.get('avatarBase64') || undefined;
      if (!displayName) { showToast('Display name is required', 'warning'); return; }
      const profileData = { displayName, email, department, bio, ...(color && { color }), ...(avatarBase64 && { avatarBase64 }) };
      await DB.updateUser(s.userId, profileData, s.userId);
      const updated = await DB.getUser(s.userId);
      if (updated) setSession(updated);
      updateSidebarUser();
      showToast('Profile updated', 'success');
    } else if (type === 'add-department') {
      if (!isAdmin()) { showToast('Admins only', 'error'); return; }
      const label = fd.get('label')?.trim();
      const key = fd.get('key')?.trim() || label;
      const color = fd.get('color') || 'blue';
      const sortOrder = Number(fd.get('sortOrder')) || 0;
      if (!label) return;
      await DB.upsertDepartment({ key, label, color, sortOrder });
      _departmentCfgLoaded = false;
      await refreshDepartmentCfg();
      showToast('Department added', 'success');
      await renderAdmin();
      return;
    } else if (type === 'edit-department') {
      if (!isAdmin()) { showToast('Admins only', 'error'); return; }
      const key = form.dataset.deptKey;
      const label = fd.get('label')?.trim();
      const color = fd.get('color') || 'blue';
      const sortOrder = Number(form.dataset.sortOrder) || 0;
      if (!key || !label) return;
      await DB.upsertDepartment({ key, label, color, sortOrder });
      _departmentCfgLoaded = false;
      await refreshDepartmentCfg();
      showToast('Department updated', 'success');
      await renderAdmin();
      return;
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
    bustWorkspaceCache();
    hideModal(); await router();
  } catch (err) {
    const ds = document.querySelector('[data-form] [type=submit]:disabled');
    if (ds) { ds.disabled = false; ds.textContent = ds.closest('[data-form]')?.dataset.editId ? 'Save' : 'Create Project'; }
    console.error(err);
    const msg = err?.message || err?.details || 'Something went wrong';
    showToast(msg.includes('duplicate key') ? 'Could not save — try refreshing the page' : msg, 'error');
  }
}

/* ──── Actions ──── */

const actions = {
  'add-project': () => showProjectModal(),
  'add-task': (b) => showTaskModal(Number(b.dataset.projectId) || null),
  'add-milestone': (b) => showMilestoneModal(Number(b.dataset.projectId)),
  'add-update': (b) => showUpdateModal(Number(b.dataset.projectId)),
  'edit-project': (b) => showProjectModal(Number(b.dataset.id)),
  'delete-project': async (b) => {
    if (!canDeleteProject()) { showToast('Only admins can delete projects', 'error'); return; }
    const p = await DB.getProject(Number(b.dataset.id));
    if (!p) { showToast('Project not found', 'error'); return; }
    if (!confirm('Delete this project and all its data?')) return;
    await DB.deleteProject(p.id, actorId());
    await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} deleted project "${p.name}".`);
    showToast('Project deleted', 'success');
    bustWorkspaceCache();
    window.location.hash = '#/projects';
  },
  'cycle-task-status': async (b) => {
    const t = await DB.getTask(Number(b.dataset.id)); if (!t) return;
    const p = await DB.getProject(t.projectId);
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    const nextStatus = { todo: 'doing', doing: 'done', done: 'todo' }[t.status];
    const uid = actorId();
    const projectTasks = await DB.getTasks({ projectId: t.projectId });
    const projectAttachments = await DB.getAttachments(t.projectId);
    const blockedReason = validateLogisticsTaskTransition(t, nextStatus, p, projectTasks, projectAttachments);
    if (blockedReason) { showToast(blockedReason, 'warning'); return; }
    await DB.updateTask(t.id, { status: nextStatus }, uid);
    const workflowProjectStatus = await syncWorkflowProjectStatus(p, uid);
    await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} changed task "${t.title}" in "${p.name}" to ${TSTATUS[nextStatus]?.l || nextStatus}.`);
    if (workflowProjectStatus) {
      await mirrorBacklogActivity(`[Backlog] "${p.name}" automatically moved to ${STAT_CFG[workflowProjectStatus]?.l || workflowProjectStatus} after the logistics workflow changed.`);
    }
    // Auto-complete / auto-reactivate regular (non-workflow) projects
    if (!isLogisticsWorkflow(p) && (p.status === 'active' || p.status === 'completed')) {
      const tasksAfterUpdate = projectTasks.map(pt => pt.id === t.id ? { ...pt, status: nextStatus } : pt);
      const allDone = tasksAfterUpdate.length > 0 && tasksAfterUpdate.every(pt => pt.status === 'done');
      if (allDone && p.status !== 'completed') {
        await DB.updateProject(p.id, { status: 'completed' }, uid);
        showToast(`"${p.name}" completed — all tasks done!`, 'success');
        await mirrorBacklogActivity(`[Backlog] "${p.name}" automatically moved to Completed after all tasks were done.`);
      } else if (!allDone && p.status === 'completed') {
        await DB.updateProject(p.id, { status: 'active' }, uid);
        await mirrorBacklogActivity(`[Backlog] "${p.name}" moved back to Active after a task was reopened.`);
      }
    }
    // Notify project owner when an assignee completes a task they didn't own.
    if (nextStatus === 'done' && p.ownerId && p.ownerId !== uid) {
      const actor = await DB.getUser(uid);
      const msg = `${actor?.displayName || 'Someone'} marked "${t.title}" as done in ${p.name}.`;
      const discordMsg = `${actor?.displayName || 'Someone'} marked **${t.title}** as done in *${p.name}*.`;
      await notifyUser({ userId: p.ownerId, type: 'task_done', message: msg, projectId: p.id, entityType: 'task', entityId: t.id, actorUserId: uid, discordContent: discordMsg });
    }
    bustWorkspaceCache();
    await router();
  },
  'assign-task': (b) => showAssignTaskModal(Number(b.dataset.id)),
  'delete-task': async (b) => {
    const t = await DB.getTask(Number(b.dataset.id)); if (!t) return;
    const p = await DB.getProject(t.projectId);
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    await DB.deleteTask(t.id, actorId());
    await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} deleted task "${t.title}" from "${p.name}".`);
    showToast('Task deleted', 'success'); bustWorkspaceCache(); await router();
  },
  'delete-milestone': async (b) => {
    const id = Number(b.dataset.id);
    const m = await DB.getMilestone(id);
    if (!m) return;
    const p = await DB.getProject(m.projectId);
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    await DB.deleteMilestone(id, actorId());
    await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} deleted milestone "${m.title}" from "${p.name}".`);
    showToast('Milestone deleted', 'success'); bustWorkspaceCache(); await router();
  },
  'complete-milestone': async (b) => {
    const id = Number(b.dataset.id);
    const ms = await DB.getMilestone(id);
    const p = ms ? await DB.getProject(ms.projectId) : null;
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    await DB.updateMilestone(id, { status: 'completed' }, actorId());
    await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} completed milestone "${ms.title}" in "${p.name}".`);
    showToast('Milestone completed', 'success'); bustWorkspaceCache(); await router();
  },
  'delete-update': async (b) => {
    const row = await DB.getUpdate(Number(b.dataset.id));
    const p = row ? await DB.getProject(row.projectId) : null;
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    await DB.deleteUpdate(Number(b.dataset.id), actorId());
    await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} deleted a project note from "${p.name}".`);
    showToast('Note deleted', 'success'); bustWorkspaceCache(); await router();
  },
  'toggle-doc-panel': async () => {
    state.docPanelOpen = !state.docPanelOpen;
    await router();
  },
  'preview-attachment': async (b) => { await openFilePreview(Number(b.dataset.id)); },
  'user-export': async () => { closeUserMenu(); await exportData(); },
  'user-import': () => { closeUserMenu(); document.getElementById('import-input').click(); },
  'user-edit-profile': async () => { closeUserMenu(); await showProfileModal(); },
  'user-show-howto': () => { closeUserMenu(); showOnboardingModal(true); },
  'close-howto': () => hideModal(),
  'open-sync-diagnostics': async () => {
    closeUserMenu();
    await showSyncDiagnosticsModal();
  },
  'sync-retry-now': async () => {
    if (DB.retrySyncNow) await DB.retrySyncNow();
    else if (DB.flushPendingSync) await DB.flushPendingSync();
    renderSyncStatusIndicator();
    await showSyncDiagnosticsModal();
    showToast('Retrying cloud sync…', 'info');
  },
  'sync-copy-errors': async () => {
    const jobs = DB.getSyncQueueDetails ? DB.getSyncQueueDetails() : [];
    const lines = jobs.filter(j => j.lastError).map(j => `[${j.type}] ${j.summary}\n${j.lastError}`);
    if (!lines.length) { showToast('No errors to copy', 'info'); return; }
    const text = lines.join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('Errors copied to clipboard', 'success');
    } catch (_) {
      showToast('Could not copy — see browser console (F12)', 'warning');
      console.log(text);
    }
  },
  'sync-clear-failed': async () => {
    if (!confirm('Remove failed sync jobs from the queue? Your screen may still show local edits that never reached the cloud.')) return;
    const removed = DB.clearFailedSyncJobs ? DB.clearFailedSyncJobs() : 0;
    renderSyncStatusIndicator();
    updateSidebarUser();
    hideModal();
    showToast(removed ? `Cleared ${removed} failed job${removed > 1 ? 's' : ''}` : 'No failed jobs to clear', 'info');
  },
  'user-logout': async () => {
    closeUserMenu();
    const s = getSession();
    if (s) await DB.logActivity({ userId: s.userId, action: 'logged_out', entityType: 'session', details: s.username });
    clearSession();
    wtAppBootstrapped = false;
    window.location.hash = '';
    await applyRoute();
  },
  'toggle-task-group': (b) => {
    const pid = b.dataset.pid;
    const grp = document.querySelector(`.task-proj-group[data-pid="${pid}"]`);
    if (!grp) return;
    const collapsed = grp.classList.toggle('tpg-collapsed');
    if (!state.collapsedTaskGroups) state.collapsedTaskGroups = {};
    state.collapsedTaskGroups[pid] = collapsed;
  },
  'show-about': () => { closeUserMenu(); showAboutModal(); },
  'open-task-detail': async (b) => { await showTaskDetailModal(Number(b.dataset.id)); },
  'save-task-detail': async (b) => {
    const taskId = Number(b.dataset.id);
    const status = document.querySelector('[data-td="status"]')?.value;
    const priority = document.querySelector('[data-td="priority"]')?.value;
    const dueDate = document.querySelector('[data-td="dueDate"]')?.value || '';
    const assigneeIdRaw = document.querySelector('[data-td="assigneeId"]')?.value;
    const assigneeId = assigneeIdRaw ? Number(assigneeIdRaw) : null;
    const notes = document.querySelector('[data-td="notes"]')?.value?.trim() || '';
    const cfRows = document.querySelectorAll('.td-cf-row');
    const customFields = [...cfRows].map(row => ({
      label: row.querySelector('[data-cf="label"]')?.value?.trim() || '',
      value: row.querySelector('[data-cf="value"]')?.value?.trim() || ''
    })).filter(f => f.label || f.value);
    const uid = actorId();
    await DB.updateTask(taskId, { ...(status&&{status}), ...(priority&&{priority}), dueDate, ...(assigneeId&&{assigneeId}), notes, customFields }, uid);
    bustWorkspaceCache();
    hideModal();
    await router();
    showToast('Task saved', 'success');
  },
  'clear-all-notifications': async () => {
    const uid = actorId(); if (!uid) return;
    await DB.markAllNotificationsRead(uid);
    refreshNotificationBadge();
    await renderNotificationsPage();
    renderNotificationPanel();
    showToast('All notifications marked as read', 'info');
  },
  'task-view': async (b) => {
    state.taskViewMode = b.dataset.view;
    const pid = Number(b.dataset.projectId);
    const p = await DB.getProject(pid);
    if (p) await renderTab('tasks', pid, canEdit(p));
  },
  'quick-add-task': (b) => {
    const afterId = b.dataset.after;
    const status = b.dataset.status || 'todo';
    const projectId = Number(b.dataset.projectId);
    const zone = b.closest('.task-insert-zone');
    if (!zone) return;
    const form = document.createElement('div');
    form.className = 'task-qaf';
    form.dataset.projectId = String(projectId);
    form.dataset.after = afterId || '';
    form.dataset.status = status;
    form.innerHTML = `<input class="task-qaf-input" type="text" placeholder="Task name…" maxlength="200" autocomplete="off">
      <div class="task-qaf-btns">
        <button class="btn btn-sm btn-primary" data-action="confirm-quick-task" data-project-id="${projectId}" data-after="${afterId || ''}" data-status="${status}">Add</button>
        <button class="btn btn-sm btn-ghost" data-action="cancel-quick-task" data-project-id="${projectId}">Cancel</button>
      </div>`;
    zone.replaceWith(form);
    const inp = form.querySelector('.task-qaf-input');
    inp?.focus();
    inp?.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') { e.preventDefault(); await createQuickTask(projectId, afterId, status); }
      else if (e.key === 'Escape') {
        const p = await DB.getProject(projectId);
        if (p) await renderTab('tasks', projectId, canEdit(p));
      }
    });
  },
  'confirm-quick-task': async (b) => {
    await createQuickTask(Number(b.dataset.projectId), b.dataset.after, b.dataset.status);
  },
  'cancel-quick-task': async (b) => {
    const pid = Number(b.dataset.projectId);
    const p = await DB.getProject(pid);
    if (p) await renderTab('tasks', pid, canEdit(p));
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
    inp.dataset.documentType = '';
    inp.click();
  },
  'workflow-upload-doc': (b) => {
    const inp = document.getElementById('library-file-input');
    inp.dataset.projectId = String(b.dataset.projectId);
    inp.dataset.documentType = String(b.dataset.documentType || '');
    inp.click();
  },
  'delete-attachment': async (b) => {
    const row = await DB.getAttachment(Number(b.dataset.id));
    if (!row) return;
    const p = await DB.getProject(row.projectId);
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    if (!confirm('Remove this file from the project?')) return;
    await DB.deleteAttachment(row.id, actorId());
    if (isLogisticsWorkflow(p) && row.documentType) {
      const tasks = await DB.getTasks({ projectId: p.id });
      const workflowTask = tasks.find(task =>
        (row.documentType === 'shipping-list' && task.workflowStepKey === 'shipping-list') ||
        (row.documentType === 'waybill' && task.workflowStepKey === 'waybill-tracking')
      );
      if (workflowTask?.status === 'done') {
        await DB.updateTask(workflowTask.id, { status: 'doing' }, actorId());
        const workflowProjectStatus = await syncWorkflowProjectStatus(p, actorId());
        if (workflowProjectStatus) {
          await mirrorBacklogActivity(`[Backlog] "${p.name}" automatically moved to ${STAT_CFG[workflowProjectStatus]?.l || workflowProjectStatus} because a required logistics document was removed.`);
        }
      }
    }
    await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} removed ${row.documentType ? `${documentTypeLabel(row.documentType).toLowerCase()} ` : ''}file "${row.fileName}" from "${p.name}".`);
    showToast('File removed', 'success');
    bustWorkspaceCache();
    await router();
  },
  'add-user': () => showAddUserModal(),
  'edit-user': (b) => showEditUserModal(Number(b.dataset.id)),
  'reset-password': (b) => showResetPwModal(Number(b.dataset.id)),
  'delete-user': async (b) => {
    const uid = Number(b.dataset.id); const s = getSession();
    if (uid === s.userId) { showToast('Cannot delete yourself', 'error'); return; }
    if (!confirm('Delete this user? Their projects will be transferred to you.')) return;
    await DB.deleteUser(uid, s.userId); showToast('User deleted', 'success'); bustWorkspaceCache(); await router();
  },
  'delete-department': async (b) => {
    if (!isAdmin()) { showToast('Admins only', 'error'); return; }
    const key = b.dataset.key;
    if (!key) return;
    if (!confirm(`Remove department "${departmentLabel(key)}"? Users and projects keep the key until you change them.`)) return;
    await DB.deleteDepartment(key);
    _departmentCfgLoaded = false;
    await refreshDepartmentCfg();
    showToast('Department removed', 'success');
    await renderAdmin();
  },
  'reset-sample-data': async () => {
    if (!confirm('This will delete ALL data and replace with sample data. Continue?')) return;
    await DB.importAll({ projects: [], tasks: [], milestones: [], updates: [] });
    await DB.createSampleData(getSession().userId);
    showToast('Data reset', 'success'); bustWorkspaceCache(); await router();
  },
  'recovery-back-login': async () => { window.location.hash = ''; await applyRoute(); },
  'toggle-notif': () => { toggleNotifPanel(); },
  'open-notifications': () => { closeNotifPanel(); window.location.hash = '#/notifications'; },
  'notif-mark-all': async () => {
    const uid = actorId(); if (!uid) return;
    await DB.markAllNotificationsRead(uid);
    await renderNotificationPanel();
    if (window.location.hash === '#/notifications') await renderNotificationsPage();
    refreshNotificationBadge();
  },
  'notif-open': async (b) => {
    const id = Number(b.dataset.id);
    const href = b.dataset.href || '#/projects';
    await DB.markNotificationRead(id);
    closeNotifPanel();
    if (window.location.hash !== href) window.location.hash = href;
    else await applyRoute();
    refreshNotificationBadge();
  },
  'select-chat-channel': async (b) => {
    state.chatChannel = b.dataset.channelId;
    await renderChat();
  },
  'export-report-csv': async () => { await exportMonthlyReportCsv(); },
  'generate-ai-report': async () => { await generateAIReport(); },
  'configure-chat': () => { closeNotifPanel(); window.location.hash = '#/admin'; },
  'test-webhook': async (b) => {
    const scope = b.dataset.scope;
    const pid = b.dataset.projectId ? Number(b.dataset.projectId) : null;
    let hook = null;
    if (scope === 'general') hook = await DB.getGeneralWebhook();
    else if (scope === 'project' && pid) hook = await DB.getProjectWebhook(pid);
    if (!hook?.url) { showToast('No webhook to test', 'warning'); return; }
    const session = getSession();
    const who = session?.displayName || session?.username || 'WorkTracker';
    const result = await postToDiscordWebhook(hook.url, {
      content: `Test ping from ${who} — WorkTracker is connected.`
    });
    showToast(result.ok ? 'Test message sent' : discordFailToast(result), result.ok ? 'success' : 'error');
  },
  'delete-webhook': async (b) => {
    if (!isAdmin()) return;
    if (!confirm('Remove this Discord webhook?')) return;
    await DB.deleteWebhook(Number(b.dataset.id));
    _webhooksCache = null;
    _webhooksCacheAt = 0;
    showToast('Webhook removed', 'info');
    bustWorkspaceCache();
    await router();
  }
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
  await ensureDepartmentCfg();
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
  if (hash === '/' || hash === '/projects') await renderProjects();
  else if (hash === '/dashboard') {
    if (isAdmin()) await renderAdminDashboard();
    else await renderProjects();
  }
  else if (hash === '/reports') {
    if (isAdmin()) await renderReportsPage();
    else await renderProjects();
  }
  else if (hash.startsWith('/projects/')) {
    const id = parseInt(hash.split('/')[2]);
    if (!isNaN(id)) {
      if (state.currentProjectId !== id) { state.projectTab = 'tasks'; state.currentProjectId = id; }
      await renderProjectDetail(id);
    } else await renderProjects();
  }
  else if (hash === '/tasks') await renderTasks();
  else if (hash === '/chat') await renderChat();
  else if (hash === '/notifications') await renderNotificationsPage();
  else if (hash === '/activity') await renderActivityPage();
  else if (hash === '/admin') await renderAdmin();
  else window.location.hash = '#/projects';
  requestAnimationFrame(() => content?.classList.remove('content-fade'));
  refreshNotificationBadge().catch(() => {});
}

function updateNav(route) {
  document.querySelectorAll('.nav-item').forEach(item => {
    const n = item.dataset.nav;
    if (!n) return;
    item.classList.toggle('active',
      route === `/${n}` || (n === 'projects' && (route === '/' || route.startsWith('/projects'))));
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
      const result = await DB.importAll(data);
      bustWorkspaceCache();
      let msg = `Imported ${data.projects?.length || 0} projects and ${data.tasks?.length || 0} tasks.`;
      if (result?.needsPasswordReset?.length) {
        msg += ` Set passwords in Admin for: ${result.needsPasswordReset.join(', ')}.`;
      }
      if (result?.attachmentsSkipped > 0) {
        msg += ` ${result.attachmentsSkipped} file(s) had no file data in the backup.`;
      }
      showToast(msg, 'success');
      await router();
    } catch (err) {
      console.error(err);
      showToast(err?.message || 'Import failed', 'error');
    }
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
    if (window.WT_SUPABASE_ERROR) {
      showToast('Cloud database unavailable — using browser-only storage. Run supabase/schema.sql in your Supabase SQL Editor.', 'warning');
    }
    document.getElementById('auth-content').addEventListener('submit', handleAuth);
    window.addEventListener('wt-sync-status', () => {
      renderSyncStatusIndicator();
      if (state.userMenuOpen) renderUserMenu();
    });
    window.addEventListener('wt-sync-error', (e) => {
      const { summary, error } = e.detail || {};
      const label = summary ? `"${summary}"` : 'A change';
      const hint = error ? ` — ${error.slice(0, 120)}` : '';
      showToast(`Cloud sync failed: ${label} couldn't be saved${hint}`, 'error');
    });
    document.addEventListener('click', async (e) => {
      const syncBtn = e.target.closest('#sync-status-indicator');
      if (syncBtn && !syncBtn.classList.contains('hidden')) {
        e.preventDefault();
        e.stopPropagation();
        await showSyncDiagnosticsModal();
        return;
      }
      const userBtn = e.target.closest('#sidebar-user');
      const menu = document.getElementById('user-menu');
      if (userBtn && !e.target.closest('#sync-status-indicator')) { e.stopPropagation(); toggleUserMenu(); return; }
      if (menu && !menu.contains(e.target)) closeUserMenu();
      const notifPanel = document.getElementById('notif-panel');
      const notifTrigger = e.target.closest('#nav-notif');
      if (notifPanel && !notifPanel.classList.contains('hidden') && !notifPanel.contains(e.target) && !notifTrigger) {
        closeNotifPanel();
      }
      const b = e.target.closest('[data-action]');
      if (b && actions[b.dataset.action]) {
        // Prevent the nav-item anchor href="#" from changing the route
        if (b.tagName === 'A' && b.getAttribute('href') === '#') e.preventDefault();
        await actions[b.dataset.action](b);
      }
    });
    document.addEventListener('keydown', (e) => {
      const ta = e.target.closest('.chat-compose textarea');
      if (ta && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const form = ta.closest('form');
        if (form) form.requestSubmit();
      }
    });
    document.getElementById('modal-overlay').addEventListener('submit', handleFormSubmit);
    document.getElementById('content').addEventListener('submit', handleFormSubmit);
    document.getElementById('content').addEventListener('input', async (e) => {
      const target = e.target;
      if (target?.dataset?.projectFilterInput === 'search') {
        const caret = target.selectionStart ?? String(target.value || '').length;
        state.projectSearch = target.value || '';
        await renderProjects();
        const next = document.getElementById('project-search');
        if (next) {
          next.focus();
          try { next.setSelectionRange(caret, caret); } catch (_) {}
        }
      }
    });
    document.getElementById('content').addEventListener('change', async (e) => {
      const target = e.target;
      if (target?.dataset?.projectFilterInput === 'owner') {
        state.projectOwnerFilter = target.value || 'all';
        await renderProjects();
      } else if (target?.dataset?.projectFilterInput === 'department') {
        state.projectDepartmentFilter = target.value || 'all';
        await renderProjects();
      } else if (target?.dataset?.reportInput === 'month') {
        state.reportMonth = target.value || formatMonthInput();
        await renderReportsPage();
      }
    });
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
      const documentType = inp.dataset.documentType || '';
      inp.removeAttribute('data-project-id');
      inp.removeAttribute('data-document-type');
      const fileList = inp.files?.length ? Array.from(inp.files) : [];
      inp.value = '';
      if (!pid || !fileList.length) return;
      const project = await DB.getProject(pid);
      if (!project || !canEdit(project)) { showToast('Permission denied', 'error'); return; }
      const s = getSession();
      const max = 10 * 1024 * 1024;
      const validFiles = fileList.filter(f => f.size <= max);
      fileList.filter(f => f.size > max).forEach(f => showToast(`${f.name} is over 10 MB`, 'warning'));
      if (!validFiles.length) return;
      const _upBar = document.getElementById('upload-progress-bar');
      const _upFill = document.getElementById('upload-progress-fill');
      const _upLabel = _upBar?.querySelector('.upload-progress-label');
      let _hideTimer = null;
      const hideBar = (delay = 0) => {
        if (_upBar) { clearTimeout(_hideTimer); _hideTimer = setTimeout(() => _upBar.classList.add('hidden'), delay); }
      };
      if (_upBar) { _upBar.classList.remove('hidden'); if (_upFill) _upFill.style.width = '0%'; if (_upLabel) _upLabel.textContent = `Uploading 0 / ${validFiles.length}…`; }
      let uploaded = 0;
      try {
        for (const file of validFiles) {
          await DB.addAttachment({
            projectId: pid,
            uploadedBy: s.userId,
            fileName: file.name,
            mimeType: file.type || 'application/octet-stream',
            documentType,
            blob: file
          });
          await mirrorBacklogActivity(`[Backlog] ${s.displayName || s.username || 'Someone'} uploaded ${documentType ? documentTypeLabel(documentType).toLowerCase() : 'a file'} "${file.name}" to "${project.name}".`);
          uploaded++;
          if (_upFill) _upFill.style.width = `${Math.round((uploaded / validFiles.length) * 100)}%`;
          if (_upLabel) _upLabel.textContent = `Uploading ${uploaded} / ${validFiles.length}…`;
        }
        if (_upBar) { if (_upFill) _upFill.style.width = '100%'; if (_upLabel) _upLabel.textContent = `Uploaded ${uploaded} file${uploaded !== 1 ? 's' : ''}`; }
        if (uploaded) showToast(uploaded === 1 ? 'File uploaded' : `${uploaded} files uploaded`, 'success');
        await router();
      } catch (err) {
        showToast('Upload error: ' + (err?.message || 'Unknown error'), 'error');
      } finally {
        hideBar(uploaded > 0 ? 1400 : 0);
      }
    });
    setupImport();
    const mt = document.getElementById('menu-toggle');
    const sb = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    const closeSidebar = () => {
      sb?.classList.remove('open');
      backdrop?.classList.add('hidden');
      document.body.classList.remove('sidebar-open');
    };
    const openSidebar = () => {
      sb?.classList.add('open');
      backdrop?.classList.remove('hidden');
      document.body.classList.add('sidebar-open');
    };
    if (mt) mt.addEventListener('click', () => {
      if (sb?.classList.contains('open')) closeSidebar();
      else openSidebar();
    });
    backdrop?.addEventListener('click', closeSidebar);
    document.querySelectorAll('.nav-item').forEach(i => i.addEventListener('click', () => { closeSidebar(); closeUserMenu(); }));
    window.addEventListener('hashchange', closeSidebar);
    window.addEventListener('hashchange', () => { applyRoute(); });

    await applyRoute();
  } catch (err) {
    console.error('Init failed:', err);
    document.getElementById('content').innerHTML = `<div class="empty-state" style="margin-top:60px;text-align:center"><h2>Something went wrong</h2><p>${esc(String(err.message || err))}</p></div>`;
  }
}

function hideSplash() {
  const el = document.getElementById('splash');
  if (!el) return;
  el.classList.add('fade-out');
  setTimeout(() => el.remove(), 500);
}

// Safety net: never leave the splash up longer than 6 s
setTimeout(hideSplash, 6000);

bootstrapDB().then(() => init()).finally(hideSplash);
