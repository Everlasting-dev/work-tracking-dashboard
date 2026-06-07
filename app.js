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
  refresh: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.5 5.8L21 8"/><path d="M21 3v5h-5"/></svg>',
  send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
  discordMark: '<svg width="12" height="12" viewBox="0 0 127.14 96.36" fill="currentColor"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15zM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69z"/></svg>',
  paperclip: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>',
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
function getAppVersion() { return window.WT_APP_VERSION || '2.1.0-beta.18'; }

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
  'basic-project': { l: 'Basic project' },
  'software-feature': { l: 'Software feature' },
  'content-docs': { l: 'Content / docs' },
  'logistics-shipment': { l: 'Logistics shipment flow', department: 'logistics' }
};
// General, locally-stored starter task lists. Selecting one in the New Project
// dialog auto-fills editable starting tasks; the created tasks queue to the
// cloud like any other task. (Logistics is handled separately via
// ensureProjectWorkflowTasks, so it is intentionally not listed here.)
const BUILTIN_TEMPLATE_STEPS = {
  'basic-project': ['Define goal & scope', 'Break down the work', 'Do the work', 'Review results', 'Wrap up & hand off'],
  'software-feature': ['Write the spec', 'Design the solution', 'Implement', 'Write tests', 'Code review', 'Deploy & verify'],
  'content-docs': ['Outline the structure', 'Write the first draft', 'Gather feedback', 'Revise & edit', 'Publish'],
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

const TRUSTED_SESSION_KEY = 'wt-trusted-session-v1';
const TRUSTED_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function sessionPayload(u) {
  return {
    userId: u.id ?? u.userId,
    username: u.username,
    displayName: u.displayName,
    role: u.role,
    department: u.department || '',
    color: u.color || '',
    bio: u.bio || '',
    avatarBase64: u.avatarBase64 || ''
  };
}
function getSession() { try { return JSON.parse(sessionStorage.getItem('wt-session')); } catch { return null; } }
function getTrustedSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(TRUSTED_SESSION_KEY));
    if (!saved?.userId || !saved?.savedAt || Date.now() - saved.savedAt > TRUSTED_SESSION_TTL_MS) {
      localStorage.removeItem(TRUSTED_SESSION_KEY);
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}
function restoreTrustedSession() {
  const saved = getTrustedSession();
  if (!saved) return null;
  const payload = sessionPayload(saved);
  sessionStorage.setItem('wt-session', JSON.stringify(payload));
  return payload;
}
function setSession(u, opts = {}) {
  const payload = sessionPayload(u);
  sessionStorage.setItem('wt-session', JSON.stringify(payload));
  if (opts.remember) localStorage.setItem(TRUSTED_SESSION_KEY, JSON.stringify({ ...payload, savedAt: Date.now() }));
}
function clearSession(opts = {}) {
  sessionStorage.removeItem('wt-session');
  if (opts.trusted) localStorage.removeItem(TRUSTED_SESSION_KEY);
}
function isOffline() { return typeof navigator !== 'undefined' && navigator.onLine === false; }
function isAdmin() { return getSession()?.role === 'admin'; }
function canEdit(project) {
  const s = getSession();
  if (!s || !project) return false;
  return s.role === 'admin' || project.ownerId === s.userId || (project.editorIds || []).map(Number).includes(Number(s.userId));
}
function isHiddenFromUser(project, userId = actorId()) {
  if (!project || !userId) return false;
  if (project.ownerId === userId || (project.editorIds || []).map(Number).includes(Number(userId))) return false;
  return (project.hiddenFromIds || []).map(Number).includes(Number(userId));
}
function canManageProjectAccess(project) {
  const s = getSession();
  if (!s || !project) return false;
  return s.role === 'admin' || project.ownerId === s.userId;
}
function isProjectOwner(project) { const s = getSession(); return !!s && !!project && project.ownerId === s.userId; }
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
let initialCloudSyncChecked = false;

function isCloudMode() {
  return window.WT_STORAGE_MODE === 'supabase' || window.WT_STORAGE_MODE === 'hybrid';
}

function isCloudConfigured() {
  const cfg = window.WT_CONFIG || {};
  return isCloudMode() || !!(cfg.storage === 'supabase' && cfg.supabaseUrl && cfg.supabaseAnonKey);
}

function mapRestUser(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    username: row.username,
    displayName: row.display_name || row.username,
    email: row.email || '',
    passwordHash: row.password_hash,
    salt: row.salt,
    role: row.role || 'user',
    department: row.department || '',
    discordId: row.discord_id || '',
    color: row.color || '',
    bio: row.bio || '',
    avatarBase64: row.avatar_base64 || '',
    lastSeenAt: row.last_seen_at || null,
    lastSeenIp: row.last_seen_ip || null,
    createdAt: row.created_at || new Date().toISOString()
  };
}

async function hydrateCloudUsersViaRest() {
  const cfg = window.WT_CONFIG || {};
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.LocalDB?.db?.users) return false;
  try {
    const endpoint = `${String(cfg.supabaseUrl).replace(/\/$/, '')}/rest/v1/wt_users?select=*&order=id.asc`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`
      }
    });
    if (!res.ok) throw new Error(`wt_users returned ${res.status}`);
    const rows = await res.json();
    const users = (Array.isArray(rows) ? rows : []).map(mapRestUser).filter(u => u?.id && u.username && u.passwordHash && u.salt);
    if (!users.length) return false;
    await window.LocalDB.db.users.bulkPut(users);
    return true;
  } catch (err) {
    console.warn('[auth] Direct wt_users bootstrap failed:', err);
    return false;
  }
}

async function waitForInitialCloudUsers() {
  if (initialCloudSyncChecked || !isCloudConfigured() || isOffline()) return;
  initialCloudSyncChecked = true;
  await forceCloudAuthSync({ silent: true });
}

async function forceCloudAuthSync({ silent = false } = {}) {
  if (!isCloudConfigured()) {
    if (!silent) showAuthError('Cloud sync is not configured in this build.');
    return false;
  }
  if (isOffline()) {
    if (!silent) showAuthError('You are offline. Connect to the internet, then sync from the cloud.');
    return false;
  }
  try {
    await Promise.race([
      window.WT_INITIAL_SYNC,
      new Promise(resolve => setTimeout(resolve, 12000))
    ]);
    if (window.SyncEngine?.pull) await window.SyncEngine.pull();
  } catch (_) {}
  if (!(await DB.hasUsers().catch(() => false))) {
    await hydrateCloudUsersViaRest();
  }
  return DB.hasUsers().catch(() => false);
}

function renderAuthCloudSync() {
  if (!isCloudConfigured()) return '';
  return `
    <div class="auth-cloud-sync">
      <span>Cloud workspace</span>
      <button type="button" data-action="auth-sync-cloud">${ICONS.refresh} Sync from cloud</button>
    </div>`;
}

function persistWorkspaceCache(data) {
  try {
    localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
      at: Date.now(),
      projects: data.projects,
      tasks: data.tasks,
      users: data.users,
      classrooms: data.classrooms || []
    }));
  } catch (_) { /* quota / private mode */ }
}

function loadPersistedWorkspaceCache() {
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY) || sessionStorage.getItem(SESSION_CACHE_KEY);
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
  try {
    sessionStorage.removeItem(SESSION_CACHE_KEY);
    if (!isOffline()) localStorage.removeItem(SESSION_CACHE_KEY);
  } catch (_) {}
  // Also bust the Supabase shadow cache so tasks are re-fetched with fresh data
  if (isCloudMode() && window.SupabaseDB?._shadowState) {
    window.SupabaseDB._shadowState.at = { projects: 0, tasks: 0, departments: 0, users: 0, updates: 0 };
    window.SupabaseDB._shadowState.complete = { projects: false, tasks: false, departments: false, users: false, updates: false };
    try { window.SupabaseDB._persistShadowState(); } catch(_) {}
  }
}

// On startup, clear the Supabase shadow cache if schema version changed
const _SCHEMA_VER = 'wt-schema-v12';
if (localStorage.getItem('wt-schema-version') !== _SCHEMA_VER) {
  try {
    localStorage.removeItem('wt-supabase-shadow-v1');
    localStorage.setItem('wt-schema-version', _SCHEMA_VER);
  } catch(_) {}
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
    let data;
    try {
      const [projects, tasks, users, classrooms] = await Promise.all([
        DB.getProjects(),
        DB.getTasks(),
        getUsersCached(true),
        DB.getClassrooms ? DB.getClassrooms().catch(() => []) : Promise.resolve([])
      ]);
      // Filter out projects hidden from the current user (non-admins only)
      const uid = getSession()?.userId;
      const filteredProjects = (uid && !isAdmin())
        ? projects.filter(p => {
            return !isHiddenFromUser(p, uid);
          })
        : projects;
      data = { projects: filteredProjects, tasks, users, classrooms };
    } catch (err) {
      if (!isOffline()) throw err;
      const persisted = loadPersistedWorkspaceCache();
      data = persisted
        ? { projects: persisted.projects || [], tasks: persisted.tasks || [], users: persisted.users || [], classrooms: persisted.classrooms || [] }
        : { projects: [], tasks: [], users: getSession() ? [getSession()] : [], classrooms: [] };
    }
    _workspaceCache = data;
    _workspaceCacheAt = Date.now();
    if (!isOffline()) persistWorkspaceCache(data);
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
      _workspaceCache = { projects: persisted.projects, tasks: persisted.tasks, users: persisted.users, classrooms: persisted.classrooms || [] };
      _workspaceCacheAt = persisted.at;
      _usersCache = persisted.users;
      _usersCacheAt = persisted.at;
      if (isOffline() || now - persisted.at < WORKSPACE_CACHE_MS) return _workspaceCache;
    }
  }

  return fetchWorkspaceData();
}

function prewarmWorkspaceCache() {
  if (_workspaceCache || _workspaceFetchPromise) return;
  const persisted = loadPersistedWorkspaceCache();
  if (persisted && Date.now() - persisted.at < WORKSPACE_CACHE_MS) {
    _workspaceCache = { projects: persisted.projects, tasks: persisted.tasks, users: persisted.users, classrooms: persisted.classrooms || [] };
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
  return state.workspaceScope ?? 'everyone';
}

function filterProjectsByWorkspace(projects) {
  if (effectiveWorkspaceScope() === 'everyone') return projects;
  const s = getSession();
  if (!s) return projects;
  return projects.filter(p => p.ownerId === s.userId);
}

async function userClassroomIds() {
  const s = getSession();
  if (!s) return [];
  if (isAdmin()) return null;
  return DB.getUserClassroomIds ? await DB.getUserClassroomIds(s.userId).catch(() => []) : [];
}

function filterProjectsByClassroom(projects, allowedIds = null) {
  const selected = state.classroomFilter || 'all';
  const allowedSet = Array.isArray(allowedIds) ? new Set(allowedIds.map(Number)) : null;
  let rows = projects;
  if (allowedSet) rows = rows.filter(p => p.classroomId == null || allowedSet.has(Number(p.classroomId)));
  if (selected !== 'all') rows = rows.filter(p => Number(p.classroomId) === Number(selected));
  return rows;
}

function classroomFilterHtml(classrooms = [], allowedIds = null) {
  const allowedSet = Array.isArray(allowedIds) ? new Set(allowedIds.map(Number)) : null;
  const visible = allowedSet ? classrooms.filter(c => allowedSet.has(Number(c.id))) : classrooms;
  if (!visible.length) return '';
  return `<div class="classroom-switcher">
    <span class="text-muted" style="font-size:0.75rem">Classroom:</span>
    <select class="projects-filter-select classroom-select" data-project-filter-input="classroom">
      <option value="all" ${state.classroomFilter === 'all' ? 'selected' : ''}>All classrooms</option>
      ${visible.map(c => `<option value="${c.id}" ${String(state.classroomFilter) === String(c.id) ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
    </select>
  </div>`;
}

function workspaceScopeBarHtml() {
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
    await onProjectCompleted(project, actorUserId).catch(() => {});
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
    const statusControl = editable && task
      ? `<button type="button" class="status-dot status-dot-${status}" data-action="cycle-task-status" data-id="${task.id}" title="Advance step"></button>`
      : `<span class="status-dot status-dot-${status}"></span>`;
    return `<div class="workflow-step">
      <div class="workflow-step-main">
        <div class="workflow-step-title-row">
          ${statusControl}
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
  projectOwnerFilter: 'all',
  projectDepartmentFilter: 'all',
  classroomFilter: 'all',
  taskFilter: 'all',
  taskViewMode: 'list',
  globalTaskViewMode: 'list',
  projectTab: 'tasks',
  currentProjectId: null,
  workspaceScope: 'everyone',
  docPanelOpen: true,
  userMenuOpen: false,
  notifOpen: false,
  chatChannel: null,
  chatDockOpen: false,
  chatDockView: 'list',
  chatDockSearch: '',
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
    ${renderAuthCloudSync()}
    <div class="auth-error" id="auth-error"></div>
    <form data-form="login">
      <div class="form-group"><label for="l-user">Username</label><input id="l-user" name="username" type="text" required autocomplete="username"></div>
      <div class="form-group"><label for="l-pw">Password</label><input id="l-pw" name="password" type="password" required autocomplete="current-password"></div>
      <label class="auth-remember"><input name="rememberDevice" type="checkbox" checked> Keep me signed in on this device</label>
      <div class="form-actions" style="justify-content:stretch"><button type="submit" class="btn btn-primary" style="flex:1;justify-content:center">Sign In</button></div>
    </form>
    <p class="auth-forgot"><a href="#/recovery">Forgot password?</a></p>`;
}

function renderAdminSetup() {
  document.getElementById('auth-content').innerHTML = `
    <div class="auth-brand"><div class="brand-icon">W</div><span class="brand-name">WorkTracker</span></div>
    <h2>Create administrator</h2>
    <p class="auth-subtitle">No accounts exist yet. Create the admin account and a master recovery key. Other users are added from Admin after you sign in.</p>
    ${renderAuthCloudSync()}
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
    let hasUsers = await DB.hasUsers();
    if (!hasUsers) {
      await waitForInitialCloudUsers();
      hasUsers = await DB.hasUsers();
    }
    if (!hasUsers) {
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
    setSession(user, { remember: fd.get('rememberDevice') === 'on' });
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
    setSession({ id, username, displayName, role: 'admin' }, { remember: true });
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
  if (DB.ensureSampleClassroom) await DB.ensureSampleClassroom(s.userId);
  if (await DB.isEmpty() && !isCloudMode()) await DB.createSampleData(s.userId);
  prewarmWorkspaceCache();
  startSidebarClock();
  startPresenceHeartbeat();
  const dockRoot = document.getElementById('chat-dock-root');
  if (dockRoot) { dockRoot.style.display = ''; renderChatDock(); }
  if (window.SyncEngine) SyncEngine.flush().catch(() => {});
  else DB.flushPendingSync?.().catch(() => {});
  updateOfflineSyncBanner();
  await router();
  wtAppBootstrapped = true;
  // First-time how-to guide (per user, persisted in localStorage)
  setTimeout(() => showOnboardingModal(false), 350);
}

function updateOfflineSyncBanner() {
  const el = document.getElementById('offline-sync-banner');
  if (!el) return;
  const status = _getSyncStatus();
  const isCloud = isCloudMode();
  const cloudMode = isCloud && status?.enabled;
  const offline = isOffline();
  const pending = Number(status?.pending || 0);
  const failed = Number(status?.failed || 0);
  const syncing = !!status?.syncing;
  if (!cloudMode || (!offline && !pending && !failed && !syncing)) {
    el.className = 'offline-sync-banner hidden';
    el.innerHTML = '';
    return;
  }
  let tone = 'info';
  let text = 'Cloud sync is up to date.';
  if (offline) {
    tone = 'offline';
    text = pending
      ? `Offline. ${pending} change${pending === 1 ? '' : 's'} saved locally and waiting for internet.`
      : 'Offline. You can keep working; changes will be saved locally and synced when internet returns.';
  } else if (failed) {
    tone = 'warning';
    text = `${failed} cloud sync issue${failed === 1 ? '' : 's'} need attention.`;
  } else if (syncing) {
    text = 'Syncing saved changes…';
  } else if (pending) {
    text = `${pending} change${pending === 1 ? '' : 's'} waiting to sync.`;
  }
  el.className = `offline-sync-banner offline-sync-banner--${tone}`;
  el.innerHTML = `
    <span>${esc(text)}</span>
    ${(pending || failed) ? '<button type="button" class="offline-sync-link" data-action="show-sync-diagnostics">Details</button>' : ''}
  `;
}

async function handleNetworkOnline() {
  updateOfflineSyncBanner();
  const isCloud = isCloudMode();
  if (!isCloud) return;
  showToast('Back online. Syncing saved changes...', 'info');
  try {
    if (window.SyncEngine) {
      await SyncEngine.pull();
      await SyncEngine.flush();
    } else {
      await DB.retrySyncNow?.();
    }
    bustWorkspaceCache();
    await getWorkspaceData(true);
    updateSidebarUser();
    updateOfflineSyncBanner();
    await router();
  } catch (err) {
    updateOfflineSyncBanner();
    showToast('Cloud sync retry failed: ' + (err?.message || 'Unknown error'), 'error');
  }
}

function handleNetworkOffline() {
  updateOfflineSyncBanner();
  const isCloud = isCloudMode();
  if (isCloud) showToast('You are offline. Changes are saved locally until internet returns.', 'warning');
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
    createProject: 'Create project',
    updateProject: 'Update project',
    createTask: 'Create task',
    updateTask: 'Update task',
    createUpdate: 'Add project note',
    upsertDepartment: 'Save department',
    deleteDepartment: 'Delete department'
  })[type] || type || 'Sync job';
}

async function showSyncDiagnosticsModal() {
  const status = _getSyncStatus();
  const jobs = (window.SyncEngine && SyncEngine.getQueueDetails)
    ? SyncEngine.getQueueDetails()
    : (DB.getSyncQueueDetails ? DB.getSyncQueueDetails() : []);
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
      Edits are saved on this device first, then uploaded to the cloud in the background.
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
      <button type="button" class="btn btn-ghost" data-action="sync-force-reload" title="Clear local cache and re-fetch everything from the cloud">Force reload from cloud</button>
      <button type="button" class="btn btn-ghost" data-action="sync-copy-errors"${jobs.some(j => j.lastError) ? '' : ' disabled'}>Copy errors</button>
      ${status.failed ? '<button type="button" class="btn btn-ghost btn-danger-text" data-action="sync-clear-failed">Clear failed</button>' : ''}
    </div>`);
}

function _getSyncStatus() {
  if (window.SyncEngine) return SyncEngine.getStatus();
  return DB.getSyncStatus ? DB.getSyncStatus() : { enabled: false };
}

function renderSyncStatusIndicator() {
  const el = document.getElementById('sync-status-indicator');
  if (!el) return;
  const status = _getSyncStatus();
  const offline = isOffline();
  const isCloud = isCloudMode();
  const visible = isCloud && status?.enabled;
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
  if (offline) {
    el.textContent = status.pending ? ` · Offline (${status.pending})` : ' · Offline';
    el.className = 'sync-status-label is-pending is-clickable';
    el.title = 'Offline. Changes are saved locally and will sync when internet returns.';
    el.setAttribute('aria-label', 'Offline. Click for cloud sync details.');
    return;
  }
  if (status.syncing) {
    el.textContent = status.pending > 1 ? ` · Syncing (${status.pending})` : ' · Syncing';
    el.className = 'sync-status-label is-pending is-clickable';
    el.title = 'Click for sync queue details';
    el.setAttribute('aria-label', 'Cloud sync in progress. Click for details.');
    return;
  }
  if (!status.pending) {
    el.textContent = ' · Sync';
    el.className = 'sync-status-label is-clickable';
    el.title = 'Sync now';
    el.setAttribute('aria-label', 'Sync now.');
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
      <span class="user-role">@${esc(s.username)}${isCloudMode() ? ' · Cloud' : ''}</span>
    </div>
    <span class="user-menu-chevron">${ICONS.chevronDown}</span>`;
  el.setAttribute('aria-expanded', state.userMenuOpen ? 'true' : 'false');
  if (isCloudMode()) {
    const roleEl = el.querySelector('.user-role');
    if (roleEl && !roleEl.querySelector('#sync-status-indicator')) {
      roleEl.insertAdjacentHTML('beforeend', '<button type="button" id="sync-status-indicator" class="sync-status-label hidden" aria-live="polite"></button>');
    }
  }
  const adminNav    = document.getElementById('nav-admin');
  const settingsNav = document.getElementById('nav-settings');
  const dashNav     = document.getElementById('nav-dashboard');
  const reportNav   = document.getElementById('nav-reports');
  if (adminNav)    adminNav.style.display    = s.role === 'admin' ? '' : 'none';
  if (settingsNav) settingsNav.style.display = s.role === 'admin' ? '' : 'none';
  if (dashNav)     dashNav.style.display     = s.role === 'admin' ? '' : 'none';
  if (reportNav)   reportNav.style.display   = s.role === 'admin' ? '' : 'none';
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
  const syncStatus = _getSyncStatus();
  const isCloud = isCloudMode();
  const syncMenuItem = isCloud && syncStatus?.enabled
    ? `<button type="button" class="user-menu-item${syncStatus.failed ? ' user-menu-item-warn' : ''}" data-action="sync-now">${syncStatus.failed ? ICONS.alertTriangle : ICONS.refresh} ${syncStatus.failed ? `Cloud sync (${syncStatus.failed} issue${syncStatus.failed === 1 ? '' : 's'})` : 'Sync now'}</button>`
    : '';
  const adminItems = isAdmin() ? `
    <button type="button" class="user-menu-item" data-action="user-export">${ICONS.download} Export Data</button>
    <button type="button" class="user-menu-item" data-action="user-import">${ICONS.upload} Import Data</button>` : '';
  const helpOpen = !!state.helpMenuOpen;
  const helpSection = `
    <button type="button" class="user-menu-item user-menu-item-toggle${helpOpen ? ' is-open' : ''}" data-action="toggle-help-menu">
      ${ICONS.sparkles} Help
      <svg class="user-menu-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    ${helpOpen ? `<div class="user-menu-subgroup">
      <button type="button" class="user-menu-item user-menu-subitem" data-action="user-show-howto">${ICONS.sparkles} How-to guide</button>
      <button type="button" class="user-menu-item user-menu-subitem" data-action="report-bug">${ICONS.alertTriangle} Report a bug</button>
      <button type="button" class="user-menu-item user-menu-subitem" data-action="show-about">${ICONS.target} About WorkTracker</button>
      <button type="button" class="user-menu-item user-menu-subitem" data-action="check-updates">${ICONS.refresh} Check for updates</button>
    </div>` : ''}`;
  menu.innerHTML = `
    ${syncMenuItem}
    <button type="button" class="user-menu-item" data-action="user-view-profile">${ICONS.userCog} View Profile</button>
    ${helpSection}
    ${adminItems}
    <hr class="user-menu-divider">
    <button type="button" class="user-menu-item user-menu-item-danger" data-action="user-logout">${ICONS.logOut} Log Out</button>`;
}

function toggleUserMenu() {
  state.userMenuOpen = !state.userMenuOpen;
  if (!state.userMenuOpen) state.helpMenuOpen = false;
  updateSidebarUser();
}

function closeUserMenu() {
  if (!state.userMenuOpen) return;
  state.userMenuOpen = false;
  state.helpMenuOpen = false;
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
  const { projects: allRaw, tasks: allTasks, users, classrooms = [] } = await getWorkspaceData();
  const allowedClassroomIds = await userClassroomIds();
  const all = filterProjectsByClassroom(filterProjectsByWorkspace(allRaw), allowedClassroomIds);
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
  const attachmentCounts = {};
  await Promise.all(all.map(async p => {
    try { attachmentCounts[p.id] = (await DB.getAttachments(p.id)).length; } catch (_) { attachmentCounts[p.id] = 0; }
  }));

  // Current in-progress task per project (first doing task found)
  const doingTask = {};
  for (const t of allTasks) {
    if (t.status === 'doing' && !doingTask[t.projectId]) doingTask[t.projectId] = t;
  }
  const visibleFieldsByProject = {};
  for (const t of allTasks) {
    const fields = projectVisibleCustomFields([t]);
    if (fields.length) visibleFieldsByProject[t.projectId] = [...(visibleFieldsByProject[t.projectId] || []), ...fields];
  }

  // Status → card accent color
  const STATUS_ACCENT = { active: '#3b82f6', completed: '#10b981', 'on-hold': '#f59e0b', archived: '#9ca3af' };

  const teamHint = !isAdmin() && effectiveWorkspaceScope() === 'mine'
    ? `<p class="text-muted text-sm workspace-hint" style="margin-bottom:12px">Use <strong>Everyone</strong> to browse teammates' projects (read-only).</p>` : '';

  content.innerHTML = `
    <div class="projects-sticky-head">
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
    ${classroomFilterHtml(classrooms, allowedClassroomIds)}
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
      const editable = canEdit(p);
      const dept = projectDepartmentValue(p, uMap);
      const accent = STATUS_ACCENT[p.status] || '#9ca3af';
      const ct = doingTask[p.id];
      const ctAssignee = ct ? uMap[ct.assigneeId] : null;
      const pinnedFields = visibleFieldsByProject[p.id] || [];
      const attachmentCount = attachmentCounts[p.id] || 0;
      const ownerInit = owner ? (owner.displayName || owner.username).charAt(0).toUpperCase() : '?';
      const editorIds = Array.isArray(p.editorIds) ? p.editorIds.filter(id => Number(id) !== p.ownerId) : [];
      const memberAvatars = editorIds.slice(0, 4).map(eid => {
        const eu = uMap[eid]; if (!eu) return '';
        const init = (eu.displayName || eu.username).charAt(0).toUpperCase();
        return eu.avatarBase64
          ? `<img class="project-card-v2-member-avatar project-card-v2-user-click" src="${esc(eu.avatarBase64)}" title="${esc(eu.displayName || eu.username)}" data-action="show-user-profile" data-user-id="${eu.id}">`
          : `<span class="project-card-v2-member-avatar project-card-v2-user-click" ${userColorStyle(eu)} title="${esc(eu.displayName || eu.username)}" data-action="show-user-profile" data-user-id="${eu.id}">${init}</span>`;
      }).join('');
      return `<div class="project-card-v2" role="link" tabindex="0" data-action="open-project-card" data-project-id="${p.id}" style="--card-accent:${accent}">
        <div class="project-card-v2-accent-bar"></div>
        <div class="project-card-v2-body">
          <div class="project-card-v2-badges">${typeBadge(p.type)} ${statusBadge(p.status)} ${departmentBadge(dept)} ${projectModeBadge(p)} ${p.workflowTemplate ? badge(workflowTemplateLabel(p.workflowTemplate), 'accent') : ''} ${!editable ? badge('View Only', 'muted') : (!mine ? badge('Editor', 'blue') : '')}</div>
          <h3 class="project-card-v2-title" title="${esc(p.name)}">${esc(p.name)}${attachmentCount ? `<span class="project-attach-indicator" title="${attachmentCount} attachment${attachmentCount === 1 ? '' : 's'}">${ICONS.paperclip}</span>` : ''}</h3>
          <p class="project-card-v2-notes">${esc(p.notes || 'No description')}</p>
          ${renderProjectCardVisibleFields(pinnedFields)}
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
              <button class="project-card-v2-ct-title" data-action="open-task-detail" data-id="${ct.id}" title="Open task details">${esc(ct.title)}</button>
            </div>
            ${ctAssignee ? `<span class="project-card-v2-ct-assignee" ${userColorStyle(ctAssignee)} title="${esc(ctAssignee.displayName || ctAssignee.username)}">${(ctAssignee.displayName || ctAssignee.username).charAt(0).toUpperCase()}</span>` : ''}
          </div>` : ''}
        </div>
        <div class="project-card-v2-footer">
          <span class="project-card-v2-owner">
            <span class="project-card-v2-owner-avatar project-card-v2-user-click" ${userColorStyle(owner)} ${owner ? `data-action="show-user-profile" data-user-id="${owner.id}"` : ''}>${ownerInit}</span>
            <span class="project-card-v2-owner-name project-card-v2-user-click" ${owner ? `data-action="show-user-profile" data-user-id="${owner.id}"` : ''}>${owner ? esc(owner.displayName || owner.username) : 'Unknown'}${owner?.role === 'admin' ? ` <span class="admin-crown" title="Admin">${ICONS.crown}</span>` : ''}</span>
            ${memberAvatars ? `<span class="project-card-v2-members">${memberAvatars}</span>` : ''}
          </span>
          <span class="project-card-v2-time">${timeAgo(p.updatedAt)}</span>
        </div>
      </div>`;
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

/* Parse a textarea (one task per line) into workflow template steps. */
function parseTemplateSteps(raw) {
  return String(raw || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(title => ({ title, priority: 'medium' }));
}

/* Board ordering: synced sortOrder ascending, oldest-first as the tiebreaker. */
function sortTasksByOrder(tasks) {
  return [...tasks].sort((a, b) => {
    const ao = a.sortOrder ?? 0, bo = b.sortOrder ?? 0;
    if (ao !== bo) return ao - bo;
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });
}

/* ──── Task view renderers ──── */

function _insertZoneHtml(afterId, status, projectId) {
  return `<div class="task-insert-zone" data-after="${afterId}" data-status="${esc(status)}" data-project-id="${projectId}">
    <div class="task-insert-line"></div>
    <button class="task-insert-btn" data-action="quick-add-task" data-after="${afterId}" data-status="${esc(status)}" data-project-id="${projectId}" title="Add task here">+</button>
  </div>`;
}

function renderTaskListViewHtml(tasks, uMap, editable, projectId, attachments = []) {
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
    const taskAtts = attachments.filter(a => Number(a.taskId) === Number(t.id));
    const imgAtt = taskAtts.find(a => a.mimeType?.startsWith('image/'));
    const fileBadge = taskAtts.length ? `<span class="task-attachment-chip" title="${taskAtts.length} attachment${taskAtts.length === 1 ? '' : 's'}">${imgAtt ? 'IMG' : 'FILE'} ${taskAtts.length}</span>` : '';
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
            ${fileBadge}
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

function projectVisibleCustomFields(tasks = []) {
  return tasks.flatMap(task => (task.customFields || [])
    .filter(field => field && field.showInProject && (field.label || field.value))
    .map(field => ({
      taskId: task.id,
      taskTitle: task.title || 'Task',
      label: field.label || 'Custom field',
      value: field.value || ''
    })));
}

function renderProjectVisibleFields(fields = []) {
  if (!fields.length) return '';
  return `<div class="project-visible-fields" aria-label="Pinned task details">
    ${fields.map(field => `<button type="button" class="project-visible-field" data-action="copy-pinned-field" data-copy="${esc(field.value)}" title="Copy ${esc(field.label)}">
      <span class="project-visible-field-task">${esc(field.taskTitle)}</span>
      <span class="project-visible-field-main"><span>${esc(field.label)}</span><strong>${esc(field.value)}</strong></span>
    </button>`).join('')}
  </div>`;
}

function renderProjectCardVisibleFields(fields = []) {
  if (!fields.length) return '';
  return `<div class="project-card-v2-fields" aria-label="Pinned project fields">
    ${fields.slice(0, 3).map(field => `<button type="button" class="project-card-v2-field" data-action="copy-pinned-field" data-copy="${esc(field.value)}" title="Copy ${esc(field.label)}">
      <span class="project-card-v2-field-label">${esc(field.label)}</span>
      <strong>${esc(field.value)}</strong>
    </button>`).join('')}
    ${fields.length > 3 ? `<span class="project-card-v2-field-more">+${fields.length - 3} more</span>` : ''}
  </div>`;
}

function customFieldActivitySummary(before = [], after = []) {
  const keyFor = (f) => `${(f.label || '').trim().toLowerCase()}::${(f.value || '').trim()}`;
  const beforeMap = new Map((before || []).filter(f => f?.label || f?.value).map(f => [keyFor(f), f]));
  const afterFields = (after || []).filter(f => f?.label || f?.value);
  const added = afterFields.find(f => !beforeMap.has(keyFor(f)));
  const pinned = afterFields.find(f => f.showInProject && !beforeMap.get(keyFor(f))?.showInProject);
  const changed = added || pinned;
  if (!changed) return afterFields.length !== (before || []).filter(f => f?.label || f?.value).length ? 'custom fields updated' : '';
  const label = changed.label || 'custom field';
  const value = changed.value ? `: ${changed.value}` : '';
  return `${changed.showInProject ? 'pinned to project description - ' : 'custom field added - '}${label}${value}`;
}

function renderTaskBoardViewHtml(tasks, uMap, editable, projectId, attachments = []) {
  const cols = [
    { key: 'todo',  label: 'To Do',      color: '#f59e0b', bg: 'rgba(245,158,11,0.05)' },
    { key: 'doing', label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.05)' },
    { key: 'done',  label: 'Done',        color: '#10b981', bg: 'rgba(16,185,129,0.05)' },
  ];
  const ordered = sortTasksByOrder(tasks);
  return `<div class="task-board-v2">
    ${cols.map(col => {
      const colTasks = ordered.filter(t => t.status === col.key);
      return `<div class="task-board-col-v2" data-status="${col.key}" style="--col-color:${col.color};--col-bg:${col.bg}">
        <div class="task-board-col-head-v2">
          <div class="task-board-col-name-v2"><span class="task-board-col-dot-v2"></span>${col.label}</div>
          <span class="task-board-col-cnt-v2">${colTasks.length}</span>
        </div>
        <div class="task-board-cards-v2">
          ${colTasks.map(t => {
            const od = isOverdue(t.dueDate) && t.status !== 'done';
            const assignee = uMap[t.assigneeId];
            const taskAtts = attachments.filter(a => Number(a.taskId) === Number(t.id));
            const imgAtt = taskAtts.find(a => a.mimeType?.startsWith('image/'));
            const fileBadge = taskAtts.length ? `<span class="task-attachment-chip" title="${taskAtts.length} attachment${taskAtts.length === 1 ? '' : 's'}">${imgAtt ? 'IMG' : 'FILE'} ${taskAtts.length}</span>` : '';
            return `<div class="task-board-card-v2${t.status === 'done' ? ' task-done' : ''}" data-task-id="${t.id}" draggable="${editable ? 'true' : 'false'}" style="--card-color:${col.color}">
              <button type="button" class="task-board-card-title-v2" data-action="open-task-detail" data-id="${t.id}" title="Open details">${esc(t.title)}</button>
              <div class="task-board-card-footer-v2">
                ${assigneeChipHtml(assignee)}
                <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap">
                  ${t.dueDate ? `<span style="display:flex;align-items:center;gap:3px;font-size:0.78rem" class="${od ? 'overdue' : 'text-muted'}">${ICONS.calendar}${formatDateShort(t.dueDate)}</span>` : ''}
                  ${prioBadge(t.priority)}
                  ${fileBadge}
                </div>
              </div>
              ${editable ? `<div class="task-board-card-actions-v2">
                <button class="status-dot status-dot-${t.status}" style="width:18px;height:18px" data-action="cycle-task-status" data-id="${t.id}" title="Next status"></button>
                <button class="btn-icon" data-action="delete-task" data-id="${t.id}" title="Delete">${ICONS.trash}</button>
              </div>` : ''}
            </div>`;
          }).join('') || `<div class="task-board-col-empty-v2">No tasks here</div>`}
        </div>
        ${editable ? `<button class="task-board-add-v2" data-action="add-task" data-project-id="${projectId}" data-default-status="${col.key}">${ICONS.plus} Add ${col.label} task</button>` : ''}
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

/* ──── Board drag-and-drop (status change + reorder) ──── */

function _boardDragAfterElement(container, y) {
  const cards = [...container.querySelectorAll('.task-board-card-v2:not(.task-dragging)')];
  let closest = { offset: -Infinity, el: null };
  for (const card of cards) {
    const box = card.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) closest = { offset, el: card };
  }
  return closest.el;
}

function setupTaskBoardDragDrop(projectId) {
  const container = document.getElementById('tab-content');
  if (!container) return;
  let draggedId = null;

  container.querySelectorAll('.task-board-card-v2[draggable=true]').forEach(card => {
    card.addEventListener('dragstart', e => {
      draggedId = Number(card.dataset.taskId);
      card.classList.add('task-dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(draggedId));
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('task-dragging');
      container.querySelectorAll('.task-board-col-v2.drop-active').forEach(c => c.classList.remove('drop-active'));
    });
  });

  container.querySelectorAll('.task-board-col-v2').forEach(col => {
    const cardsWrap = col.querySelector('.task-board-cards-v2');
    if (!cardsWrap) return;
    col.addEventListener('dragover', e => {
      if (draggedId == null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      container.querySelectorAll('.task-board-col-v2.drop-active').forEach(c => { if (c !== col) c.classList.remove('drop-active'); });
      col.classList.add('drop-active');
      const dragging = container.querySelector('.task-board-card-v2.task-dragging');
      if (!dragging) return;
      const empty = cardsWrap.querySelector('.task-board-col-empty-v2');
      if (empty) empty.remove();
      const afterEl = _boardDragAfterElement(cardsWrap, e.clientY);
      if (afterEl == null) cardsWrap.appendChild(dragging);
      else cardsWrap.insertBefore(dragging, afterEl);
    });
    col.addEventListener('dragleave', e => { if (!col.contains(e.relatedTarget)) col.classList.remove('drop-active'); });
    col.addEventListener('drop', async e => {
      e.preventDefault();
      col.classList.remove('drop-active');
      if (draggedId == null) return;
      const movedId = draggedId;
      draggedId = null;
      await persistBoardOrder(projectId, movedId);
    });
  });
}

async function persistBoardOrder(projectId, movedId) {
  const container = document.getElementById('tab-content');
  if (!container) return;
  const p = await DB.getProject(projectId);
  if (!p || !canEdit(p)) return;
  const uid = actorId();

  // Read the resulting visual order across all columns → assign small 1-based sortOrder.
  const desired = [];
  let order = 1;
  container.querySelectorAll('.task-board-col-v2').forEach(col => {
    const status = col.dataset.status;
    col.querySelectorAll('.task-board-card-v2').forEach(card => {
      desired.push({ id: Number(card.dataset.taskId), status, sortOrder: order++ });
    });
  });

  const tasks = await DB.getTasks({ projectId });
  const byId = Object.fromEntries(tasks.map(t => [t.id, t]));
  const moved = byId[movedId];
  const movedTarget = desired.find(d => d.id === movedId);

  // Validate the moved card's status change (logistics workflow guards) before committing.
  if (moved && movedTarget && moved.status !== movedTarget.status) {
    const projectAttachments = await DB.getAttachments(projectId);
    const blocked = validateLogisticsTaskTransition(moved, movedTarget.status, p, tasks, projectAttachments);
    if (blocked) {
      showToast(blocked, 'warning');
      await renderTab('tasks', projectId, canEdit(p));
      return;
    }
  }

  let movedStatusChanged = false;
  for (const d of desired) {
    const t = byId[d.id];
    if (!t) continue;
    const changes = {};
    if (t.status !== d.status) changes.status = d.status;
    if ((t.sortOrder ?? 0) !== d.sortOrder) changes.sortOrder = d.sortOrder;
    if (!Object.keys(changes).length) continue;
    await DB.updateTask(d.id, changes, uid);
    if (d.id === movedId && changes.status) movedStatusChanged = true;
  }

  if (movedStatusChanged && moved && movedTarget) {
    await applyTaskStatusSideEffects(p, moved, movedTarget.status, uid, tasks, await DB.getAttachments(projectId));
  }

  bustWorkspaceCache();
  await renderTab('tasks', projectId, canEdit(p));
}

/* Hook fired when a project transitions into the completed state (Phase 6):
 * notify everyone in the project's classroom, credit the owner + editors, and
 * trigger an animated celebration. Ranking is computed live, so finishing a
 * project automatically lifts the contributors' scores. Guarded so it only
 * fires once per completion. */
const _celebratedProjects = new Set();
async function onProjectCompleted(project, actorUserId) {
  if (!project || _celebratedProjects.has(project.id)) return;
  _celebratedProjects.add(project.id);
  setTimeout(() => _celebratedProjects.delete(project.id), 60000);

  let users = [];
  try { users = await DB.getUsers(); } catch (_) {}
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));
  const owner = uMap[project.ownerId];
  const editors = (project.editorIds || []).map(id => uMap[Number(id)]).filter(Boolean);
  const credits = [owner, ...editors].filter(Boolean);
  const creditNames = credits.map(u => u.displayName || u.username);
  const creditLabel = creditNames.length
    ? (creditNames.length === 1 ? creditNames[0] : `${creditNames.slice(0, -1).join(', ')} & ${creditNames[creditNames.length - 1]}`)
    : 'the team';

  // Notify everyone in the project's classroom (fallback: everyone).
  let memberIds = [];
  try {
    if (project.classroomId && DB.getClassroomMemberIds) memberIds = await DB.getClassroomMemberIds(project.classroomId);
  } catch (_) {}
  if (!memberIds.length) memberIds = users.map(u => u.id);

  const message = `${project.name} was completed by ${creditLabel}. Ranks updated!`;
  const discordMsg = `**${project.name}** was completed by ${creditLabel}! Their contributor ranks just went up.`;
  for (const mid of memberIds) {
    if (mid === actorUserId) continue;
    await notifyUser({ userId: mid, type: 'project_completed', message, projectId: project.id, entityType: 'project', entityId: project.id, actorUserId }).catch(() => {});
  }
  // Mirror to Discord once.
  fireDiscordEvent({ projectId: project.id, content: discordMsg }).catch(() => {});

  showProjectCelebration(project, creditLabel);
}

function showProjectCelebration(project, creditLabel) {
  const existing = document.getElementById('project-celebration');
  if (existing) existing.remove();
  const confettiColors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];
  const pieces = Array.from({ length: 36 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = (Math.random() * 0.6).toFixed(2);
    const dur = (1.6 + Math.random() * 1.4).toFixed(2);
    const color = confettiColors[i % confettiColors.length];
    const rot = Math.floor(Math.random() * 360);
    return `<span class="celebration-confetti" style="left:${left}%;background:${color};animation-delay:${delay}s;animation-duration:${dur}s;transform:rotate(${rot}deg)"></span>`;
  }).join('');
  const overlay = document.createElement('div');
  overlay.id = 'project-celebration';
  overlay.className = 'celebration-overlay';
  overlay.innerHTML = `
    <div class="celebration-confetti-layer">${pieces}</div>
    <div class="celebration-card">
      <div class="celebration-trophy">🏆</div>
      <h2>Project complete!</h2>
      <p class="celebration-project">${esc(project.name)}</p>
      <p class="celebration-credit">Completed by <strong>${esc(creditLabel)}</strong></p>
      <p class="celebration-rank">Contributor ranks updated ↑</p>
      <button type="button" class="btn btn-primary" data-action="dismiss-celebration">Nice!</button>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('celebration-overlay--show'));
  setTimeout(() => { if (document.getElementById('project-celebration') === overlay) dismissCelebration(); }, 7000);
}

function dismissCelebration() {
  const ov = document.getElementById('project-celebration');
  if (!ov) return;
  ov.classList.remove('celebration-overlay--show');
  setTimeout(() => ov.remove(), 300);
}

/* Shared side-effects when a task's status changes (used by board DnD + status cycle). */
async function applyTaskStatusSideEffects(p, task, nextStatus, uid, projectTasks, projectAttachments) {
  const workflowProjectStatus = await syncWorkflowProjectStatus(p, uid);
  await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} changed task "${task.title}" in "${p.name}" to ${TSTATUS[nextStatus]?.l || nextStatus}.`);
  if (workflowProjectStatus) {
    await mirrorBacklogActivity(`[Backlog] "${p.name}" automatically moved to ${STAT_CFG[workflowProjectStatus]?.l || workflowProjectStatus} after the logistics workflow changed.`);
  }
  if (!isLogisticsWorkflow(p) && (p.status === 'active' || p.status === 'completed')) {
    const tasksAfterUpdate = (projectTasks || []).map(pt => pt.id === task.id ? { ...pt, status: nextStatus } : pt);
    const allDone = tasksAfterUpdate.length > 0 && tasksAfterUpdate.every(pt => pt.status === 'done');
    if (allDone && p.status !== 'completed') {
      await DB.updateProject(p.id, { status: 'completed' }, uid);
      showToast(`"${p.name}" completed — all tasks done!`, 'success');
      await mirrorBacklogActivity(`[Backlog] "${p.name}" automatically moved to Completed after all tasks were done.`);
      await onProjectCompleted(p, uid).catch(() => {});
    } else if (!allDone && p.status === 'completed') {
      await DB.updateProject(p.id, { status: 'active' }, uid);
      await mirrorBacklogActivity(`[Backlog] "${p.name}" moved back to Active after a task was reopened.`);
    }
  }
  if (nextStatus === 'done' && p.ownerId && p.ownerId !== uid) {
    const actor = await DB.getUser(uid);
    const msg = `${actor?.displayName || 'Someone'} marked "${task.title}" as done in ${p.name}.`;
    const discordMsg = `${actor?.displayName || 'Someone'} marked **${task.title}** as done in *${p.name}*.`;
    await notifyUser({ userId: p.ownerId, type: 'task_done', message: msg, projectId: p.id, entityType: 'task', entityId: task.id, actorUserId: uid, discordContent: discordMsg });
  }
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
  if (!isAdmin()) {
    const allowedClassroomIds = await userClassroomIds();
    const allowedSet = Array.isArray(allowedClassroomIds) ? new Set(allowedClassroomIds.map(Number)) : null;
    const inAllowedClassroom = !allowedSet || project.classroomId == null || allowedSet.has(Number(project.classroomId));
    if (!inAllowedClassroom || isHiddenFromUser(project, s?.userId)) {
      hideDocumentPanel();
      if (main) main.classList.remove('with-doc-panel');
      content.innerHTML = `<div class="view-header"><a href="#/projects" class="btn btn-ghost">${ICONS.arrowLeft} Back</a></div>${emptyState({ icon:'lock', title:'Project not visible', description:'You are not assigned to this classroom or the project is hidden from you.' })}`;
      return;
    }
  }
  const editable = canEdit(project);
  const manageAccess = canManageProjectAccess(project);
  // Backfill logistics workflow steps when opening a shipment project (tasks may
  // be missing if the project was created before workflow seeding or after a sync gap).
  if (isLogisticsWorkflow(project) && editable) {
    const uid = actorId();
    if (uid) await ensureProjectWorkflowTasks(project, uid);
  }
  const [allProjectTasks, milestones, users, attList] = await Promise.all([
    DB.getTasks({ projectId }),
    DB.getMilestones(projectId),
    getUsersCached(),
    DB.getAttachments(projectId)
  ]);
  const visibleTasks = allProjectTasks;
  const canSeeTasks = true;
  const progress = projectProgressFromTaskList(allProjectTasks);
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
  const visibleCustomFields = canSeeTasks ? projectVisibleCustomFields(allProjectTasks) : [];
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
    : '';
  const requestAccessBtn = !editable && s?.userId !== project.ownerId
    ? `<button class="btn btn-ghost" data-action="request-project-access" data-project-id="${project.id}">${ICONS.userCog} Request edit access</button>` : '';

  content.innerHTML = `
    <div class="view-header">
      <div class="breadcrumb">
        <a href="#/projects" class="breadcrumb-link">${ICONS.arrowLeft} Projects</a>
        <span class="breadcrumb-sep">/</span><span>${esc(project.name)}</span>
      </div>
      <div class="view-actions">
        <button type="button" class="btn btn-ghost ${state.docPanelOpen ? 'active' : ''}" data-action="toggle-doc-panel" title="Documents panel">${ICONS.file} Files (${attCount})</button>
        ${requestAccessBtn}
        ${manageAccess ? `<button class="btn btn-ghost" data-action="manage-project-access" data-project-id="${project.id}">${ICONS.userCog} Access</button>` : ''}
        ${editable ? `<button class="btn btn-ghost" data-action="edit-project" data-id="${project.id}">${ICONS.edit} Edit</button>` : ''}
        ${canDeleteProject() ? `<button class="btn btn-ghost btn-danger-text" data-action="delete-project" data-id="${project.id}">${ICONS.trash} Delete</button>` : ''}
        ${!editable && !canDeleteProject() ? badge('View Only', 'muted') : ''}
      </div>
    </div>
    <div class="project-hero">
      <div class="project-hero-badges">${typeBadge(project.type)} ${statusBadge(project.status)} ${departmentBadge(department)} ${prioBadge(project.priority)} ${projectModeBadge(project)} ${project.workflowTemplate ? badge(workflowTemplateLabel(project.workflowTemplate), 'accent') : ''}</div>
      <h1>${esc(project.name)}</h1>
      <p class="text-secondary">${esc(project.notes || 'No description added.')}</p>
      ${renderProjectVisibleFields(visibleCustomFields)}
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
  if (!item) { showToast('File not found', 'error'); return; }
  // Local blob (offline / pending) vs. cloud file fetched on demand by URL.
  let url = '';
  let isBlobUrl = false;
  if (item.blob) {
    url = URL.createObjectURL(item.blob);
    isBlobUrl = true;
  } else if (item.storagePath && DB.getAttachmentUrl) {
    url = DB.getAttachmentUrl(item.storagePath);
  }
  if (!url) { showToast('File is not available — it may still be syncing.', 'error'); return; }
  if (state._previewUrl) try { URL.revokeObjectURL(state._previewUrl); } catch (_) {}
  state._previewUrl = isBlobUrl ? url : null;
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
    let text = '';
    try { text = item.blob ? await item.blob.text() : await (await fetch(url)).text(); } catch (_) { text = '(Could not load file contents.)'; }
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
    const attachments = cache?.attList ?? await DB.getAttachments(projectId);
    const uMap = Object.fromEntries(users.map(u => [u.id, u]));

    el.innerHTML = `<div class="task-view-header">
      <span class="text-muted text-sm tab-hint">${editable ? 'Drag cards to change status or reorder. Click a card to open details.' : 'Tasks assigned to you. Click a card to open details.'}</span>
      ${editable ? `<div class="task-view-actions">
        ${tasks.length ? `<button class="btn btn-sm btn-ghost" data-action="save-tasks-as-template" data-project-id="${projectId}">Save as template</button>` : ''}
        <button class="btn btn-sm btn-primary" data-action="add-task" data-project-id="${projectId}">${ICONS.plus} Add Task</button>
      </div>` : ''}
    </div>
    <div id="task-view-body">
      ${renderTaskBoardViewHtml(tasks, uMap, editable, projectId, attachments)}
    </div>`;

    if (editable) {
      setupTaskBoardDragDrop(projectId);
    }
  } else if (tab === 'timeline') {
    const cache = state._detailCache?.projectId === projectId ? state._detailCache : null;
    const allTasks = cache?.allProjectTasks ?? await DB.getTasks({ projectId });
    const s = getSession();
    const tasks = editable ? allTasks : allTasks.filter(t => t.assigneeId === s.userId);
    const users = cache?.users ?? await getUsersCached();
    const uMap = Object.fromEntries(users.map(u => [u.id, u]));
    el.innerHTML = `<div style="padding-top:4px">${renderTaskChainTimelineHtml(tasks, uMap)}</div>`;
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

function renderGlobalTasksBoardHtml(tasks, pMap, uMap) {
  const projectIds = [...new Set(tasks.map(t => t.projectId))].sort((a, b) =>
    (pMap[a]?.name || '').localeCompare(pMap[b]?.name || ''));
  if (!projectIds.length) return emptyState({ icon: 'tasks', title: 'No tasks yet', description: 'Create a project and add tasks.', cta: 'New Task', ctaAction: 'add-task' });
  return `<div class="global-task-board">
    ${projectIds.map(pid => {
      const proj = pMap[pid];
      if (!proj) return '';
      const pt = tasks.filter(t => t.projectId === pid);
      const doing = pt.filter(t => t.status === 'doing').length;
      const todo = pt.filter(t => t.status === 'todo').length;
      const ordered = [...pt.filter(t=>t.status==='doing'), ...pt.filter(t=>t.status==='todo'), ...pt.filter(t=>t.status==='done')];
      return `<div class="gtb-column">
        <div class="gtb-col-header">
          <a href="#/projects/${pid}" class="gtb-proj-name">${ICONS.folder} ${esc(proj.name)}</a>
          <div class="gtb-col-badges">
            ${doing ? `<span class="badge badge-blue">${doing}</span>` : ''}
            ${todo ? `<span class="badge badge-amber">${todo}</span>` : ''}
          </div>
        </div>
        <div class="gtb-col-tasks">
          ${ordered.map(t => {
            const assignee = uMap[t.assigneeId];
            return `<a href="#/projects/${pid}" class="gtb-task-card${t.status === 'done' ? ' task-done' : ''}" title="Go to project">
              <span class="status-dot status-dot-${t.status}" style="width:10px;height:10px;flex-shrink:0"></span>
              <span class="gtb-task-title${t.status === 'done' ? ' text-strikethrough' : ''}">${esc(t.title)}</span>
              ${assignee ? `<span class="gtb-task-assignee" ${userColorStyle(assignee)} title="${esc(assignee.displayName || assignee.username)}">${(assignee.displayName || assignee.username).charAt(0).toUpperCase()}</span>` : ''}
            </a>`;
          }).join('') || '<p class="text-muted text-sm" style="padding:8px 10px">No tasks</p>'}
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

async function renderTasks() {
  const content = document.getElementById('content');
  const s = getSession();
  const { projects: rawProjects, tasks: allTasks, users: allUsers } = await getWorkspaceData();
  const attachmentRows = await Promise.all((rawProjects || []).map(p => DB.getAttachments(p.id).catch(() => [])));
  const taskAttachmentMap = new Map();
  attachmentRows.flat().forEach(a => {
    if (a.taskId == null) return;
    const key = Number(a.taskId);
    if (!taskAttachmentMap.has(key)) taskAttachmentMap.set(key, []);
    taskAttachmentMap.get(key).push(a);
  });
  const allowedClassroomIds = await userClassroomIds();
  const allProjects = filterProjectsByClassroom(rawProjects, allowedClassroomIds);
  const visibleProjectIds = new Set(allProjects.map(p => p.id));
  const editableProjectIds = new Set(allProjects.filter(p => canEdit(p)).map(p => p.id));
  const uMap = Object.fromEntries(allUsers.map(u => [u.id, u]));
  let all = allTasks.filter(t => visibleProjectIds.has(t.projectId));
  if (!isAdmin()) all = all.filter(t => visibleProjectIds.has(t.projectId));
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
    const taskAtts = taskAttachmentMap.get(Number(t.id)) || [];
    const imgAtt = taskAtts.find(a => a.mimeType?.startsWith('image/'));
    const fileBadge = taskAtts.length ? `<span class="task-attachment-chip" title="${taskAtts.length} attachment${taskAtts.length === 1 ? '' : 's'}">${imgAtt ? 'IMG' : 'FILE'} ${taskAtts.length}</span>` : '';
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
            ${hasNotes ? `<span class="task-note-dot" title="Has notes">📝</span>` : ''}
          </div>
        </div>
        ${fileBadge ? `<div class="task-card-fields">${fileBadge}</div>` : ''}
        ${t.customFields?.length ? `<div class="task-card-fields">${t.customFields.slice(0,2).map(f => `<span class="task-cf-chip" data-action="open-task-detail" data-id="${t.id}" title="Click to edit"><span class="task-cf-label">${esc(f.label)}</span><span class="task-cf-value">${esc(f.value)}</span></span>`).join('')}${t.customFields.length > 2 ? `<span class="task-cf-more">+${t.customFields.length-2} more</span>` : ''}</div>` : ''}
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

  const vm = state.globalTaskViewMode || 'list';
  const viewToggle = `<div class="task-view-toggle">
    <button class="tvt-btn${vm === 'list' ? ' active' : ''}" data-action="global-task-view" data-view="list">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
      List
    </button>
    <button class="tvt-btn${vm === 'board' ? ' active' : ''}" data-action="global-task-view" data-view="board">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="18" rx="1"/><rect x="17" y="3" width="5" height="18" rx="1"/></svg>
      Board
    </button>
  </div>`;
  const boardBody = vm === 'board' ? renderGlobalTasksBoardHtml(all, pMap, uMap) : body;
  content.innerHTML = `
    <div class="projects-page-header">
      <div class="projects-page-title"><h1>Tasks</h1><span class="projects-page-count">${all.length} visible</span></div>
      <div class="projects-page-actions" style="display:flex;gap:8px;align-items:center">${viewToggle}<button class="btn btn-primary" data-action="add-task">${ICONS.plus} New Task</button></div>
    </div>
    <div class="projects-status-pills">
      <button class="status-pill ${f==='all'?'active':''}" data-action="filter-tasks" data-filter="all">All <span class="status-pill-count">${cnt.all}</span></button>
      <button class="status-pill ${f==='doing'?'active':''}" data-action="filter-tasks" data-filter="doing">In Progress <span class="status-pill-count">${cnt.doing}</span></button>
      <button class="status-pill ${f==='todo'?'active':''}" data-action="filter-tasks" data-filter="todo">To Do <span class="status-pill-count">${cnt.todo}</span></button>
      <button class="status-pill ${f==='done'?'active':''}" data-action="filter-tasks" data-filter="done">Done <span class="status-pill-count">${cnt.done}</span></button>
    </div>
    ${boardBody}`;
}

async function renderAdmin() {
  if (!isAdmin()) { window.location.hash = '#/projects'; return; }
  const content = document.getElementById('content');
  const s = getSession();
  await ensureDepartmentCfg();
  const [{ users, projects }, hasMk, projectHooksAll, departments, bugReports, classrooms] = await Promise.all([
    getWorkspaceData(),
    DB.hasMasterKey(),
    getWebhooksCached(),
    DB.getDepartments(),
    DB.getBugReports ? DB.getBugReports({ limit: 25 }) : [],
    DB.getClassrooms ? DB.getClassrooms() : []
  ]);
  const userRoomMap = {};
  if (DB.getUserClassroomIds) {
    await Promise.all(users.map(async u => { userRoomMap[u.id] = await DB.getUserClassroomIds(u.id).catch(() => []); }));
  }
  const generalHook = projectHooksAll.find(h => h.scope === 'general');
  const hookByProject = Object.fromEntries(projectHooksAll.filter(h => h.scope === 'project').map(h => [h.projectId, h]));
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));
  const BUG_STATUS = [
    { v: 'open', l: 'Open' },
    { v: 'in_progress', l: 'In progress' },
    { v: 'sent', l: 'Sent to GitHub' },
    { v: 'fixed', l: 'Fixed' },
    { v: 'closed', l: 'Closed' },
    { v: 'wont_fix', l: "Won't fix" },
  ];
  const openBugCount = bugReports.filter(r => !['fixed', 'closed', 'wont_fix'].includes(r.status || 'open')).length;
  const bugSection = `
    <section class="section-card" style="margin-bottom:24px">
      <div class="section-header"><h2>${ICONS.alertTriangle} Bug Reports ${openBugCount ? `<span class="projects-page-count">${openBugCount} open</span>` : ''}</h2></div>
      <div class="section-body bug-report-list">
        ${bugReports.length ? bugReports.map(r => {
          const who = uMap[r.userId];
          const st = r.status || 'open';
          const resolved = ['fixed', 'closed', 'wont_fix'].includes(st);
          return `<div class="bug-report-row ${resolved ? 'bug-report-row--resolved' : ''}">
            <div class="bug-report-main">
              <div class="bug-report-titleline">
                <strong>${esc(r.title)}</strong>
                ${badge(BUG_STATUS.find(s => s.v === st)?.l || st, resolved ? 'green' : (st === 'in_progress' ? 'blue' : 'amber'))}
              </div>
              <span>${esc(r.description)}</span>
              ${r.screenshots?.length ? `<div class="bug-report-thumbs">${r.screenshots.slice(0, 3).map(img => `<img src="${esc(img.dataUrl)}" alt="${esc(img.name || 'screenshot')}">`).join('')}</div>` : ''}
              <small>${esc(who?.displayName || who?.username || 'Unknown')} · ${esc(r.severity)} · v${esc(r.appVersion || '?')} · ${timeAgo(r.createdAt)}</small>
              ${r.resolutionNote ? `<div class="bug-report-resolution">${esc(r.resolutionNote)}</div>` : ''}
              <form data-form="update-bug-report" data-bug-id="${r.id}" class="bug-report-manage">
                <select name="status" class="bug-report-status-select">
                  ${BUG_STATUS.map(s => `<option value="${s.v}" ${s.v === st ? 'selected' : ''}>${s.l}</option>`).join('')}
                </select>
                <input type="url" name="githubIssueUrl" placeholder="GitHub issue URL" value="${esc(r.githubIssueUrl || '')}">
                <input type="text" name="resolutionNote" placeholder="Resolution note (shown to reporter)" value="${esc(r.resolutionNote || '')}">
                <button type="submit" class="btn btn-sm btn-primary">Update</button>
                ${r.githubIssueUrl ? `<a class="btn btn-sm btn-ghost" href="${esc(r.githubIssueUrl)}" target="_blank" rel="noreferrer">Open issue</a>` : ''}
              </form>
            </div>
          </div>`;
        }).join('') : '<p class="text-muted text-sm" style="padding:16px 20px">No bug reports yet.</p>'}
      </div>
    </section>`;
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
      <div><h1>Admin</h1><p class="view-subtitle">People management &amp; monitoring</p></div>
      <div class="view-actions"><button class="btn btn-primary" data-action="add-user">${ICONS.plus} Add User</button></div>
    </div>
    ${masterKeySection}
    ${bugSection}
    <div class="admin-section-head">
      <h2>Team Members <span class="projects-page-count">${users.length}</span></h2>
    </div>
    <div class="admin-user-board">
      ${users.map(u => {
        const init = (u.displayName || u.username).charAt(0).toUpperCase();
        const avatarHtml = u.avatarBase64
          ? `<img src="${esc(u.avatarBase64)}" class="admin-ucard-avatar-img admin-ucard-avatar-clickable" data-action="show-user-profile" data-user-id="${u.id}" title="View profile" alt="${esc(init)}">`
          : `<div class="admin-ucard-avatar admin-ucard-avatar-clickable" ${userColorStyle(u)} data-action="show-user-profile" data-user-id="${u.id}" title="View profile">${init}</div>`;
        return `<div class="admin-ucard">
          <div class="admin-ucard-header">
            ${avatarHtml}
            <div class="admin-ucard-meta">
              <div class="admin-ucard-name" data-action="show-user-profile" data-user-id="${u.id}" style="cursor:pointer" title="View profile">${esc(u.displayName || u.username)}</div>
              <div class="admin-ucard-sub">@${esc(u.username)}${u.email ? ` · ${esc(u.email)}` : ''}</div>
              <div class="admin-ucard-badges">${badge(u.role === 'admin' ? 'Admin' : 'Member', u.role === 'admin' ? 'purple' : 'blue')} ${departmentBadge(u.department || '')}</div>
              <div class="admin-ucard-badges">${(userRoomMap[u.id] || []).map(id => {
                const room = classrooms.find(c => Number(c.id) === Number(id));
                return room ? badge(room.name, 'accent') : '';
              }).join('')}</div>
            </div>
          </div>
          ${u.bio ? `<p class="admin-ucard-bio">${esc(u.bio)}</p>` : ''}
          <div class="admin-ucard-actions">
            <button class="btn btn-sm btn-ghost" data-action="edit-user" data-id="${u.id}">${ICONS.edit} Edit</button>
            <button class="btn btn-sm btn-ghost" data-action="edit-user-classrooms" data-id="${u.id}">Classrooms</button>
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
    </div>`;
}

/* ──── Settings (admin only) ──── */

async function renderSettings() {
  if (!isAdmin()) { window.location.hash = '#/projects'; return; }
  const content = document.getElementById('content');
  await ensureDepartmentCfg();
  const [{ users, projects }, departments, classrooms, projectHooksAll, workflowTemplates] = await Promise.all([
    getWorkspaceData(),
    DB.getDepartments(),
    DB.getClassrooms ? DB.getClassrooms() : Promise.resolve([]),
    getWebhooksCached(),
    DB.getWorkflowTemplates ? DB.getWorkflowTemplates().catch(() => []) : Promise.resolve([]),
  ]);
  const generalHook  = projectHooksAll.find(h => h.scope === 'general');
  const hookByProject = Object.fromEntries(projectHooksAll.filter(h => h.scope === 'project').map(h => [h.projectId, h]));

  const templatesSection = `
    <section class="section-card" style="margin-bottom:24px">
      <div class="section-header">
        <div>
          <h2>Workflow Templates</h2>
          <p class="view-subtitle" style="margin-top:2px;font-size:0.8rem">Reusable task checklists. Pick one when creating a project to auto-fill editable starting tasks. One task per line.</p>
        </div>
      </div>
      <div class="section-body wf-tpl-list" style="padding:16px 20px;display:flex;flex-direction:column;gap:14px">
        ${(workflowTemplates || []).map(t => `
          <form data-form="edit-workflow-template" data-template-id="${t.id}" class="wf-tpl-card">
            <div class="wf-tpl-head">
              <input class="wf-tpl-name" type="text" name="name" value="${esc(t.name)}" placeholder="Template name" required>
              <button type="submit" class="btn btn-sm btn-ghost">Save</button>
              <button type="button" class="btn-icon btn-icon-danger" data-action="delete-workflow-template" data-id="${t.id}" title="Delete template">${ICONS.trash}</button>
            </div>
            <input class="wf-tpl-desc" type="text" name="description" value="${esc(t.description || '')}" placeholder="Description (optional)">
            <textarea class="wf-tpl-steps" name="steps" rows="${Math.max(3, (t.steps || []).length + 1)}" placeholder="One task per line…">${esc((t.steps || []).map(s => s.title).join('\n'))}</textarea>
          </form>`).join('') || '<p class="text-muted text-sm">No templates yet. Create one below.</p>'}
        <form data-form="add-workflow-template" class="wf-tpl-card wf-tpl-card--add">
          <div class="wf-tpl-head">
            <input class="wf-tpl-name" type="text" name="name" placeholder="New template name" required>
            <button type="submit" class="btn btn-sm btn-primary">Create</button>
          </div>
          <input class="wf-tpl-desc" type="text" name="description" placeholder="Description (optional)">
          <textarea class="wf-tpl-steps" name="steps" rows="3" placeholder="One task per line…"></textarea>
        </form>
      </div>
    </section>`;

  // Hidden-from-users section (per project)
  const hiddenSection = `
    <section class="section-card" style="margin-bottom:24px">
      <div class="section-header">
        <div>
          <h2>Project Visibility</h2>
          <p class="view-subtitle" style="margin-top:2px;font-size:0.8rem">Hide specific projects from individual members. Hidden projects are fully invisible unless the user is the owner or an editor.</p>
        </div>
      </div>
      <div class="section-body" style="padding:16px 20px;display:flex;flex-direction:column;gap:18px">
        ${(() => {
          const roomMap = Object.fromEntries((classrooms || []).map(c => [Number(c.id), c]));
          const projectVisibilityRow = (p) => {
            const hiddenFrom = Array.isArray(p.hiddenFromIds) ? p.hiddenFromIds : [];
            return `<div class="visibility-row">
              <div class="visibility-row-name">${ICONS.folder} <strong>${esc(p.name)}</strong></div>
              <div class="visibility-row-users">
                ${users.filter(u => u.id !== p.ownerId).map(u => {
                  const isHidden = hiddenFrom.includes(u.id);
                  return `<label class="visibility-toggle" title="${isHidden ? 'Unhide' : 'Hide'} from ${esc(u.displayName || u.username)}">
                    <input type="checkbox" data-action="toggle-project-visibility"
                      data-project-id="${p.id}" data-user-id="${u.id}" ${isHidden ? 'checked' : ''}>
                    <span class="visibility-user-chip ${isHidden ? 'is-hidden' : ''}">
                      ${esc(u.displayName || u.username)}
                    </span>
                  </label>`;
                }).join('')}
              </div>
            </div>`;
          };
          // Group projects by classroom; preserve classroom order, then "No classroom" last.
          const groups = new Map();
          for (const c of (classrooms || [])) groups.set(Number(c.id), []);
          const orphans = [];
          for (const p of projects) {
            const cid = p.classroomId != null ? Number(p.classroomId) : null;
            if (cid != null && groups.has(cid)) groups.get(cid).push(p);
            else orphans.push(p);
          }
          const blocks = [];
          for (const [cid, list] of groups) {
            if (!list.length) continue;
            const room = roomMap[cid];
            blocks.push(`<div class="visibility-group">
              <div class="visibility-group-head">${esc(room?.name || 'Classroom')} <span class="projects-page-count">${list.length}</span></div>
              <div class="visibility-group-body">${list.map(projectVisibilityRow).join('')}</div>
            </div>`);
          }
          if (orphans.length) {
            blocks.push(`<div class="visibility-group">
              <div class="visibility-group-head">No classroom <span class="projects-page-count">${orphans.length}</span></div>
              <div class="visibility-group-body">${orphans.map(projectVisibilityRow).join('')}</div>
            </div>`);
          }
          return blocks.join('') || '<p class="text-muted text-sm">No projects yet.</p>';
        })()}
      </div>
    </section>`;

  content.innerHTML = `
    <div class="view-header">
      <div><h1>Settings</h1><p class="view-subtitle">Workspace configuration</p></div>
    </div>
    <section class="section-card" style="margin-bottom:24px">
      <div class="section-header">
        <div>
          <h2>Classrooms</h2>
          <p class="view-subtitle" style="margin-top:2px;font-size:0.8rem">Separate project canvases for different teams.</p>
        </div>
      </div>
      <div class="section-body classroom-admin">
        <div class="classroom-list">
          ${classrooms.map(c => `<div class="classroom-admin-row">
            <span class="classroom-color-dot" style="background:${esc(c.color || '#4f46e5')}"></span>
            <div class="classroom-admin-row-info">
              <strong>${esc(c.name)}</strong>
              ${c.description ? `<small>${esc(c.description)}</small>` : ''}
            </div>
            <button type="button" class="btn btn-sm btn-ghost" data-action="delete-classroom" data-id="${c.id}">Remove</button>
          </div>`).join('') || '<p class="text-muted text-sm" style="padding:12px 16px">No classrooms yet.</p>'}
        </div>
        <form data-form="add-classroom" class="classroom-add-form">
          <label class="classroom-add-field">
            <span>Classroom name</span>
            <input name="name" type="text" placeholder="e.g. Logistics team" required>
          </label>
          <label class="classroom-add-field">
            <span>Description</span>
            <input name="description" type="text" placeholder="What this classroom is for">
          </label>
          <div class="classroom-add-form-row">
            <input name="color" type="color" value="#4f46e5" title="Pick a colour">
            <button type="submit" class="btn btn-primary" style="flex:1">+ Add Classroom</button>
          </div>
        </form>
      </div>
    </section>
    ${hiddenSection}
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
    ${templatesSection}
    <section class="section-card" style="margin-bottom:24px">
      <div class="section-header"><h2>${ICONS.chat} Discord Integrations</h2></div>
      <div class="section-body" style="padding:20px">
        <p class="text-secondary text-sm" style="margin-bottom:14px">
          Each channel is bound to a <strong>Discord webhook URL</strong>. The app posts chat messages and event notifications to that URL.
          To create one in Discord: <em>Server Settings → Integrations → Webhooks → New Webhook → Copy URL</em>.
        </p>
        <div class="integrations-grid">
          <div class="integration-card">
            <h3>${ICONS.chat} #general channel</h3>
            <form data-form="webhook-general">
              <div class="webhook-input">
                <input type="url" name="url" placeholder="https://discord.com/api/webhooks/..." value="${esc(generalHook?.url || '')}">
                <button type="submit" class="btn btn-sm btn-primary">Save</button>
              </div>
              <div class="webhook-input">
                <input type="url" name="channelUrl" placeholder="Optional: Discord channel URL" value="${esc(generalHook?.channelUrl || '')}">
              </div>
              ${generalHook ? `<span class="integration-meta">Saved ${timeAgo(generalHook.updatedAt || generalHook.createdAt)} · <button type="button" class="btn-link" data-action="test-webhook" data-scope="general">Send test ping</button></span>` : ''}
            </form>
          </div>
          ${projects.map(p => {
            const h = hookByProject[p.id];
            return `<div class="integration-card">
              <h3>${ICONS.folder} ${esc(p.name)}</h3>
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
    <section class="section-card">
      <div class="section-header"><h2>Data Management</h2></div>
      <div class="section-body" style="padding:20px;display:flex;gap:12px;flex-wrap:wrap">
        <button class="btn btn-ghost" data-action="user-export">${ICONS.download} Export Data</button>
        <button class="btn btn-ghost" data-action="user-import">${ICONS.upload} Import Data</button>
        <button class="btn btn-ghost btn-danger-text" data-action="reset-sample-data">${ICONS.trash} Reset to Sample Data</button>
      </div>
    </section>`;
}

/* ──── Chat (Discord bridge) ──── */

async function getChatMessagesForChannel(channelId) {
  if (channelId?.startsWith('dm-')) {
    const otherId = Number(channelId.slice(3));
    const rows = DB.getDirectMessages ? await DB.getDirectMessages(actorId(), otherId, { limit: 150 }) : [];
    return rows.map(m => ({
      id: `dm-${m.id}`,
      userId: m.fromUserId,
      details: m.content,
      source: 'direct',
      createdAt: m.createdAt
    }));
  }
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

function _activeChatPane() {
  return document.getElementById('chat-dock-pane') || document.getElementById('chat-messages-pane');
}

function appendChatMessageToPane(message, uMap) {
  const pane = _activeChatPane();
  if (!pane) return;
  const empty = pane.querySelector('.chat-empty-v2, .chat-empty');
  if (empty) pane.innerHTML = renderChatMessagesHtml([message], uMap);
  else {
    let container = pane.querySelector('.chat-msgs-wrap');
    if (!container) {
      pane.innerHTML = renderChatMessagesHtml([message], uMap);
      container = pane.querySelector('.chat-msgs-wrap');
    }
    if (container) {
      const wrap = document.createElement('div');
      wrap.innerHTML = renderChatMessagesHtml([message], uMap);
      const row = wrap.querySelector('.chat-msg-row');
      if (row) container.appendChild(row);
    }
  }
  pane.scrollTop = pane.scrollHeight;
}

async function refreshChatPane() {
  const pane = _activeChatPane();
  if (!pane) return;
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

/* ──── Docked hybrid chat (Phase 5) ──── */
// Facebook/G+ style pop-out chat: a launcher in the corner that expands into a
// panel with a contacts list (favorites, online, everyone) + channels, and a
// conversation view. Lives outside #content so it survives route changes.

let _chatDockData = null;   // { users, projects, generalHook, favIds } cached for the open panel
let _chatDockTimer = null;

// The old full-page route now just pops the dock open.
async function renderChat() {
  openChatDock(state.chatChannel);
  if (window.location.hash === '#/chat') window.location.hash = '#/projects';
}

function openChatDock(channelId = null) {
  state.chatDockOpen = true;
  if (channelId) { state.chatChannel = channelId; state.chatDockView = 'convo'; }
  else if (!state.chatDockView) state.chatDockView = 'list';
  renderChatDock();
}
function closeChatDock() {
  state.chatDockOpen = false;
  stopChatDockPolling();
  renderChatDock();
}
function toggleChatDock() { state.chatDockOpen ? closeChatDock() : openChatDock(); }

function startChatDockPolling() {
  stopChatDockPolling();
  _chatDockTimer = setInterval(() => {
    if (state.chatDockOpen && state.chatDockView === 'convo') refreshChatPane().catch(() => {});
  }, 8000);
}
function stopChatDockPolling() {
  if (_chatDockTimer) { clearInterval(_chatDockTimer); _chatDockTimer = null; }
}

function chatChannelInfo(channelId, users, projects, generalHook) {
  if (!channelId) channelId = 'general';
  if (channelId.startsWith('dm-')) {
    const u = users.find(x => x.id === Number(channelId.slice(3)));
    return { id: channelId, type: 'direct', name: u?.displayName || u?.username || 'User', user: u };
  }
  if (channelId.startsWith('project-')) {
    const p = projects.find(x => x.id === Number(channelId.split('-')[1]));
    return { id: channelId, type: 'project', name: p?.name || 'project', projectId: p?.id };
  }
  return { id: 'general', type: 'general', name: 'general', channelUrl: generalHook?.channelUrl || '', live: !!generalHook?.url };
}

function chatDockContactRow(u, isFav) {
  const initials = (u.displayName || u.username || '?').charAt(0).toUpperCase();
  const avatarInner = u.avatarBase64
    ? `<img src="${esc(u.avatarBase64)}" alt="${esc(initials)}">`
    : initials;
  const sub = isUserOnline(u) ? 'Online' : (u.lastSeenAt ? timeAgo(u.lastSeenAt) : 'Offline');
  return `<button type="button" class="chat-dock-contact" data-action="open-chat-channel" data-channel-id="dm-${u.id}">
    <span class="chat-dock-contact-av" ${userColorStyle(u)}>${avatarInner}${presenceDotHtml(u)}</span>
    <span class="chat-dock-contact-meta"><span class="chat-dock-contact-name">${esc(u.displayName || u.username)}</span><small>${sub}</small></span>
    <span class="chat-dock-fav ${isFav ? 'is-fav' : ''}" data-action="toggle-chat-favorite" data-user-id="${u.id}" title="${isFav ? 'Unpin contact' : 'Pin contact'}">${isFav ? '★' : '☆'}</span>
  </button>`;
}

function chatDockListBodyHtml() {
  const d = _chatDockData;
  if (!d) return '';
  const s = getSession();
  const q = (state.chatDockSearch || '').trim().toLowerCase();
  const people = d.users.filter(u => u.id !== s?.userId);
  const filtered = q ? people.filter(u => (u.displayName || u.username || '').toLowerCase().includes(q)) : people;
  const favs = filtered.filter(u => d.favIds.has(u.id));
  const online = filtered.filter(u => !d.favIds.has(u.id) && isUserOnline(u));
  const others = filtered.filter(u => !d.favIds.has(u.id) && !isUserOnline(u))
    .sort((a, b) => (a.displayName || a.username).localeCompare(b.displayName || b.username));

  const projectChannels = (d.projects || []).filter(p => canEdit(p));
  const channelsHtml = `
    <button type="button" class="chat-dock-contact" data-action="open-chat-channel" data-channel-id="general">
      <span class="chat-dock-contact-av chat-dock-channel-ic">#</span>
      <span class="chat-dock-contact-meta"><span class="chat-dock-contact-name">general</span><small>${d.generalHook?.url ? 'Discord connected' : 'Team channel'}</small></span>
    </button>
    ${projectChannels.map(p => `<button type="button" class="chat-dock-contact" data-action="open-chat-channel" data-channel-id="project-${p.id}">
      <span class="chat-dock-contact-av chat-dock-channel-ic">#</span>
      <span class="chat-dock-contact-meta"><span class="chat-dock-contact-name">${esc(p.name)}</span><small>Project channel</small></span>
    </button>`).join('')}`;

  const section = (label, html) => html ? `<div class="chat-dock-section-label">${label}</div>${html}` : '';
  return `
    ${section('Channels', channelsHtml)}
    ${section('Pinned', favs.map(u => chatDockContactRow(u, true)).join(''))}
    ${section('Online', online.map(u => chatDockContactRow(u, false)).join(''))}
    ${section(q ? 'Results' : 'Everyone', others.map(u => chatDockContactRow(u, false)).join('') || (q ? '<p class="chat-dock-empty">No matches</p>' : ''))}`;
}

async function chatDockPanelHtml() {
  const s = getSession();
  const [{ users, projects }, allHooks, favRows] = await Promise.all([
    getWorkspaceData(),
    getWebhooksCached(),
    DB.getFavorites ? DB.getFavorites(s?.userId).catch(() => []) : Promise.resolve([]),
  ]);
  const generalHook = allHooks.find(h => h.scope === 'general');
  state.chatUsersMap = Object.fromEntries(users.map(u => [u.id, u]));
  _chatDockData = { users, projects, generalHook, favIds: new Set((favRows || []).map(f => Number(f.favoriteUserId))) };

  if (state.chatDockView === 'convo') {
    const active = chatChannelInfo(state.chatChannel, users, projects, generalHook);
    state.chatChannel = active.id;
    const messages = await getChatMessagesForChannel(active.id);
    const messagesHtml = renderChatMessagesHtml(messages, state.chatUsersMap);
    const prefix = active.type === 'direct' ? '@' : '#';
    const subtitle = active.type === 'direct'
      ? (isUserOnline(active.user) ? 'Online' : (active.user?.lastSeenAt ? `Last active ${timeAgo(active.user.lastSeenAt)}` : 'Offline'))
      : (active.live ? 'Live · Discord' : 'Team channel');
    return `<div class="chat-dock-panel">
      <div class="chat-dock-head chat-dock-head--convo">
        <button type="button" class="chat-dock-icon-btn" data-action="chat-dock-back" title="Back">${ICONS.chevronLeft || '‹'}</button>
        <div class="chat-dock-convo-title">
          <span class="chat-dock-convo-name">${prefix} ${esc(active.name)}</span>
          <small>${subtitle}</small>
        </div>
        ${active.channelUrl ? `<a href="${esc(active.channelUrl)}" target="_blank" rel="noopener" class="chat-dock-icon-btn" title="Open in Discord">${ICONS.externalLink || '↗'}</a>` : ''}
        <button type="button" class="chat-dock-icon-btn" data-action="close-chat-dock" title="Close">${ICONS.close || '×'}</button>
      </div>
      <div class="chat-dock-pane" id="chat-dock-pane">${messagesHtml}</div>
      <form class="chat-dock-compose" data-form="chat-send" data-channel-id="${active.id}">
        <textarea class="chat-dock-input" name="content" rows="1" placeholder="Message ${prefix}${esc(active.name)}…" required></textarea>
        <button type="submit" class="chat-dock-send" title="Send">${ICONS.send}</button>
      </form>
    </div>`;
  }

  return `<div class="chat-dock-panel">
    <div class="chat-dock-head">
      <span class="chat-dock-title">Messages</span>
      <button type="button" class="chat-dock-icon-btn" data-action="close-chat-dock" title="Close">${ICONS.close || '×'}</button>
    </div>
    <input type="text" class="chat-dock-search" id="chat-dock-search" placeholder="Search people…" value="${esc(state.chatDockSearch || '')}">
    <div class="chat-dock-list" id="chat-dock-list">${chatDockListBodyHtml()}</div>
  </div>`;
}

async function renderChatDock() {
  const root = document.getElementById('chat-dock-root');
  if (!root) return;
  const open = !!state.chatDockOpen;
  root.classList.toggle('chat-dock-open', open);
  const panel = open ? await chatDockPanelHtml() : '';
  root.innerHTML = `
    ${panel}
    <button type="button" class="chat-dock-launcher" data-action="toggle-chat-dock" title="Messages" aria-label="Messages">
      ${open ? (ICONS.close || '×') : ICONS.chat}
    </button>`;

  if (open && state.chatDockView === 'list') {
    const search = document.getElementById('chat-dock-search');
    if (search) {
      search.addEventListener('input', () => {
        state.chatDockSearch = search.value;
        const list = document.getElementById('chat-dock-list');
        if (list) list.innerHTML = chatDockListBodyHtml();
      });
    }
  }
  if (open && state.chatDockView === 'convo') {
    startChatDockPolling();
    requestAnimationFrame(() => {
      const pane = document.getElementById('chat-dock-pane');
      if (pane) pane.scrollTop = pane.scrollHeight;
      const input = document.querySelector('.chat-dock-input');
      if (input) input.focus();
    });
  } else {
    stopChatDockPolling();
  }
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
  const taskStatusRows = [
    ['Done', tasks.filter(t => t.status === 'done').length, 'green'],
    ['In progress', tasks.filter(t => t.status === 'doing').length, 'blue'],
    ['To do', tasks.filter(t => t.status === 'todo').length, 'amber'],
  ];
  const topContributors = users
    .map(u => ({ user: u, stats: userProfileStats(u.id, projects, tasks) }))
    .sort((a, b) => b.stats.score - a.stats.score)
    .slice(0, 5);
  const maxContributorScore = Math.max(1, ...topContributors.map(r => r.stats.score));

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
    <div class="dash-graph-grid">
      <div class="dash-panel">
        <div class="dash-panel-head"><h3>Task Flow</h3><span class="projects-page-count">${tasks.length}</span></div>
        <div class="dash-bars">
          ${taskStatusRows.map(([label, value, tone]) => `<div class="dash-bar-row">
            <span>${label}</span>
            <div class="dash-bar-track"><div class="dash-bar-fill dash-bar-fill--${tone}" style="width:${tasks.length ? Math.max(4, Math.round((value / tasks.length) * 100)) : 0}%"></div></div>
            <strong>${value}</strong>
          </div>`).join('')}
        </div>
      </div>
      <div class="dash-panel">
        <div class="dash-panel-head"><h3>Contributor Rank</h3><span class="projects-page-count">Top ${topContributors.length}</span></div>
        <div class="dash-bars">
          ${topContributors.map(({ user, stats }) => `<div class="dash-bar-row dash-bar-row-user">
            <span>${esc(user.displayName || user.username)}</span>
            <div class="dash-bar-track"><div class="dash-bar-fill dash-bar-fill--purple" style="width:${Math.max(5, Math.round((stats.score / maxContributorScore) * 100))}%"></div></div>
            <strong class="rank-label">${rankIcon(stats.rank.label, 15)}${esc(stats.rank.label)}</strong>
          </div>`).join('') || '<p class="text-muted text-sm">No ranked activity yet.</p>'}
        </div>
      </div>
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
    const contributors = (project.editorIds || [])
      .map(Number)
      .filter(id => id && id !== Number(project.ownerId))
      .map(id => uMap[id])
      .filter(Boolean)
      .map(u => u.displayName || u.username);
    return {
      project,
      owner,
      contributors,
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
        <th>Co-authors</th>
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
        <td>${(row.contributors && row.contributors.length) ? `<span class="report-coauthors">${row.contributors.map(n => `<span class="report-coauthor-chip">${esc(n)}</span>`).join('')}</span>` : '<span class="text-muted">—</span>'}</td>
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
  if (!supabaseUrl) { showToast('Cloud mode required for AI reports', 'error'); return; }

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
  const TYPE_ICON = { assignment: '👤', task_done: '✅', mention: '💬', update: '📋', access_request: '🔐', access_approved: '✅', access_declined: '⛔', bug_report: '⚠️', project_completed: '🏆' };
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
  const users = await DB.getUsers();
  const classrooms = DB.getClassrooms ? await DB.getClassrooms().catch(() => []) : [];
  const allowedRooms = await userClassroomIds();
  const allowedRoomSet = Array.isArray(allowedRooms) ? new Set(allowedRooms.map(Number)) : null;
  const roomOptions = allowedRoomSet ? classrooms.filter(c => allowedRoomSet.has(Number(c.id))) : classrooms;
  const defaultClassroomId = p?.classroomId || roomOptions[0]?.id || '';
  const defaultDepartment = p?.department || currentUser?.department || '';
  const isE = !!p;
  const templates = DB.getWorkflowTemplates ? await DB.getWorkflowTemplates().catch(() => []) : [];
  const editorSet = new Set((p?.editorIds || []).map(Number));
  const editorOptions = users
    .filter(u => u.id !== p?.ownerId)
    .map(u => `<label class="project-editor-option">
      <input type="checkbox" name="editorIds" value="${u.id}" ${editorSet.has(u.id) ? 'checked' : ''}>
      <span>${esc(u.displayName || u.username)}${u.department ? ` · ${departmentLabel(u.department)}` : ''}${u.role === 'admin' ? ' · Admin' : ''}</span>
    </label>`).join('');

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
          <span class="pf-meta-label">Classroom</span>
          <select name="classroomId" class="pf-meta-select">
            ${roomOptions.map(c => `<option value="${c.id}" ${Number(defaultClassroomId) === Number(c.id) ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
          </select>
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
            ${!isE && templates.length ? `<optgroup label="Templates">${templates.map(t => `<option value="tpl:${t.id}">${esc(t.name)} (${(t.steps||[]).length})</option>`).join('')}</optgroup>` : ''}
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
      ${isE && canManageProjectAccess(p) ? `
      <div class="pf-editors-block">
        <div class="pf-tasks-header">
          <span class="pf-tasks-title">Editors</span>
          <span class="pf-tasks-hint">Can update this project</span>
        </div>
        <div class="project-editor-list">${editorOptions || '<p class="text-muted text-sm">No other users yet.</p>'}</div>
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

    // Selecting a workflow template (built-in or saved) auto-fills editable starting tasks.
    const wfSelect = document.querySelector('form[data-form="project"] select[name="workflowTemplate"]');
    wfSelect?.addEventListener('change', () => {
      let stepTitles = null;
      let label = '';
      if (wfSelect.value.startsWith('tpl:')) {
        const tpl = templates.find(t => String(t.id) === wfSelect.value.slice(4));
        if (!tpl) return;
        stepTitles = (tpl.steps || []).map(s => s.title || '');
        label = tpl.name;
      } else if (wfSelect.value === 'logistics-shipment') {
        stepTitles = LOGISTICS_WORKFLOW_STEPS.map(s => s.title);
        label = WORKFLOW_TEMPLATE_CFG['logistics-shipment']?.l || 'Logistics shipment flow';
      } else if (BUILTIN_TEMPLATE_STEPS[wfSelect.value]) {
        stepTitles = BUILTIN_TEMPLATE_STEPS[wfSelect.value].slice();
        label = WORKFLOW_TEMPLATE_CFG[wfSelect.value]?.l || 'template';
      } else {
        return;
      }
      list.innerHTML = '';
      stepTitles.forEach(title => {
        addBulkRow(false);
        const inputs = list.querySelectorAll('.bulk-task-input');
        inputs[inputs.length - 1].value = title;
      });
      if (!stepTitles.length) addBulkRow(false);
      renumber();
      showToast(`Loaded ${stepTitles.length} task${stepTitles.length === 1 ? '' : 's'} from "${label}"`, 'info');
    });

    addBulkRow(false);
  }
}

async function showTaskModal(preId = null, defaultStatus = 'todo') {
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
        <div class="form-group"><label>Status</label><select name="status"><option value="todo" ${defaultStatus === 'todo' ? 'selected' : ''}>To Do</option><option value="doing" ${defaultStatus === 'doing' ? 'selected' : ''}>In Progress</option><option value="done" ${defaultStatus === 'done' ? 'selected' : ''}>Done</option></select></div>
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

function renderTaskChainTimelineHtml(tasks, uMap) {
  if (!tasks.length) return `<div class="timeline-empty-v2">
    ${ICONS.calendar}
    <p style="font-size:0.95rem;font-weight:600;margin-top:8px">No tasks yet</p>
    <p class="text-muted text-sm">Add tasks to see the project chain.</p>
  </div>`;
  const statusWeight = { done: 0, doing: 1, todo: 2 };
  const ordered = [...tasks].sort((a, b) => {
    const sw = (statusWeight[a.status] ?? 3) - (statusWeight[b.status] ?? 3);
    if (sw) return sw;
    return (a.dueDate || '9999-12-31').localeCompare(b.dueDate || '9999-12-31');
  });
  return `<div class="task-timeline-v2 task-timeline-chain">
    ${ordered.map((t, index) => {
      const assignee = uMap[t.assigneeId];
      const od = t.dueDate && isOverdue(t.dueDate) && t.status !== 'done';
      const init = assignee ? (assignee.displayName || assignee.username || '?').charAt(0).toUpperCase() : '?';
      return `<div class="timeline-chain-step timeline-chain-step--${t.status}" data-task-id="${t.id}">
        <div class="timeline-chain-node"><span>${index + 1}</span></div>
        <button type="button" class="timeline-chain-card" data-action="open-task-detail" data-id="${t.id}">
          <strong>${esc(t.title)}</strong>
          <span>${TSTATUS[t.status]?.l || t.status}${t.dueDate ? ` · ${formatDateShort(t.dueDate)}` : ''}${od ? ' · overdue' : ''}</span>
          <small title="${esc(assignee?.displayName || assignee?.username || 'Unassigned')}">${init} ${esc(assignee?.displayName || assignee?.username || 'Unassigned')}</small>
        </button>
      </div>`;
    }).join('')}
  </div>`;
}

async function showRequestProjectAccessModal(projectId) {
  const project = await DB.getProject(projectId);
  if (!project) { showToast('Project not found', 'error'); return; }
  if (canEdit(project)) { showToast('You already have edit access', 'info'); return; }
  const pending = DB.getProjectAccessRequests
    ? (await DB.getProjectAccessRequests({ projectId, requesterId: actorId(), status: 'pending' }))[0]
    : null;
  showModal('Request Edit Access', `
    <form data-form="project-access-request" data-project-id="${project.id}">
      <p class="text-muted text-sm" style="margin-bottom:14px">Ask the project owner for permission to edit <strong>${esc(project.name)}</strong>.</p>
      ${pending ? `<p class="text-muted text-sm" style="margin-bottom:12px">${ICONS.bell} You already have a pending request.</p>` : ''}
      <div class="form-group"><label>Message</label><textarea name="message" rows="3" class="fixed-textarea" placeholder="Why do you need access?">${esc(pending?.message || '')}</textarea></div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">${pending ? 'Update Request' : 'Send Request'}</button></div>
    </form>`);
}

async function showProjectAccessModal(projectId) {
  const project = await DB.getProject(projectId);
  if (!project || !canManageProjectAccess(project)) { showToast('Permission denied', 'error'); return; }
  const [users, requests] = await Promise.all([
    DB.getUsers(),
    DB.getProjectAccessRequests ? DB.getProjectAccessRequests({ projectId }) : []
  ]);
  const uMap = Object.fromEntries(users.map(u => [u.id, u]));
  const editorSet = new Set((project.editorIds || []).map(Number));
  const editorRows = users
    .filter(u => u.id !== project.ownerId)
    .map(u => `<label class="project-editor-option">
      <input type="checkbox" name="editorIds" value="${u.id}" ${editorSet.has(u.id) ? 'checked' : ''}>
      <span>${esc(u.displayName || u.username)}${u.department ? ` · ${departmentLabel(u.department)}` : ''}${u.role === 'admin' ? ' · Admin' : ''}</span>
    </label>`).join('');
  const pendingRows = requests.filter(r => r.status === 'pending').map(r => {
    const user = uMap[r.requesterId];
    return `<div class="access-request-row">
      <div><strong>${esc(user?.displayName || user?.username || 'Unknown user')}</strong><span>${esc(r.message || 'No message')} · ${timeAgo(r.createdAt)}</span></div>
      <div class="access-request-actions">
        <button type="button" class="btn btn-sm btn-primary" data-action="approve-project-access" data-request-id="${r.id}" data-project-id="${project.id}">Approve</button>
        <button type="button" class="btn btn-sm btn-ghost" data-action="decline-project-access" data-request-id="${r.id}" data-project-id="${project.id}">Decline</button>
      </div>
    </div>`;
  }).join('');
  showModal('Project Access', `
    <form data-form="project-editors" data-project-id="${project.id}">
      <p class="text-muted text-sm" style="margin-bottom:14px">Editors can add tasks, update status, upload files, and change project details.</p>
      <div class="project-editor-list">${editorRows || '<p class="text-muted text-sm">No other users yet.</p>'}</div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Save Access</button></div>
    </form>
    <div class="access-request-block">
      <div class="pf-tasks-header"><span class="pf-tasks-title">Pending requests</span></div>
      ${pendingRows || '<p class="text-muted text-sm">No pending requests.</p>'}
    </div>`);
}

function showBugReportModal() {
  const version = getAppVersion();
  showModal('Report Bug', `
    <form data-form="bug-report">
      <p class="text-muted text-sm" style="margin-bottom:14px">Send a bug report to the admins. They can track and update its status until it is resolved.</p>
      <div class="form-group"><label>Title</label><input name="title" type="text" placeholder="Short summary" maxlength="140" required autofocus></div>
      <div class="form-group"><label>Severity</label><select name="severity"><option value="normal" selected>Normal</option><option value="high">High</option><option value="critical">Critical</option><option value="low">Low</option></select></div>
      <div class="form-group"><label>What happened?</label><textarea name="description" rows="5" class="fixed-textarea" placeholder="What were you doing, what did you expect, and what happened instead?" required></textarea></div>
      <div class="form-group"><label>Images</label><input id="bug-report-images" type="file" accept="image/*" multiple><p class="text-muted text-sm" style="margin-top:4px">Optional. Up to 3 screenshots, 2 MB each.</p><div id="bug-report-preview" class="bug-report-preview"></div></div>
      <input type="hidden" name="screenshots" id="bug-report-screenshots" value="[]">
      <input type="hidden" name="appVersion" value="${esc(version)}">
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Send Report</button></div>
    </form>`);
  const input = document.getElementById('bug-report-images');
  const hidden = document.getElementById('bug-report-screenshots');
  const preview = document.getElementById('bug-report-preview');
  input?.addEventListener('change', async () => {
    const files = Array.from(input.files || []).slice(0, 3).filter(f => f.size <= 2 * 1024 * 1024);
    const images = [];
    for (const file of files) {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      images.push({ name: file.name, mimeType: file.type || 'image/png', dataUrl });
    }
    hidden.value = JSON.stringify(images);
    preview.innerHTML = images.map(img => `<img src="${esc(img.dataUrl)}" alt="${esc(img.name)}">`).join('');
    if ((input.files || []).length > images.length) showToast('Some screenshots were skipped. Max 3 images, 2 MB each.', 'warning');
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
  return `<span class="assignee-chip" ${userColorStyle(user)} data-action="show-user-profile" data-user-id="${user.id}" title="${esc(user.displayName || user.username)}"><span class="assignee-avatar">${avatarInner}</span>${esc((user.displayName || user.username).split(' ')[0])}</span>`;
}

// Simple, theme-colored chess-piece silhouettes for each rank tier.
function rankIcon(label, size = 18) {
  const k = String(label || '').toLowerCase();
  const paths = {
    pawn: '<circle cx="12" cy="7" r="3.1"/><path d="M9.3 10h5.4l1.3 4H8z"/><path d="M7 20l1.4-6.2h7.2L17 20z"/>',
    knight: '<path d="M8.5 20H17c0-5-1-8.3-4.2-10.8.5-1 .3-2.1-.6-2.9L10.8 4l-.6 2.2-2.4 1.3C6 8.5 5.3 10.2 5.3 12c0 .9.7 1.5 1.6 1.3l1.7-.3-1 3-2 2z"/>',
    bishop: '<path d="M12 3c1.5 1 2.3 2.2 2.3 3.5 0 1-.5 1.7-1.1 2.3 1.9 1.2 3.1 3.1 3.1 5.4 0 1-.3 1.9-.9 2.6H6.6c-.6-.7-.9-1.6-.9-2.6 0-2.3 1.2-4.2 3.1-5.4-.6-.6-1.1-1.3-1.1-2.3C7.7 5.2 8.5 4 10 3z"/><path d="M6.8 20h10.4v1.6H6.8z"/>',
    rook: '<path d="M6.4 6h2.1v1.7h2V6h3v1.7h2V6h2.1v4.2l-1.6 1.4.6 6.9H7.4l.6-6.9-1.6-1.4z"/><path d="M5.8 19.2h12.4V21H5.8z"/>',
    queen: '<path d="M4.8 9l1.9 9.3h10.6L19.2 9l-3.1 3.2-2.1-5.3-2 5.3-2-5.3-2.1 5.3z"/><path d="M5.8 19.4h12.4V21H5.8z"/><circle cx="4.8" cy="7.8" r="1.5"/><circle cx="12" cy="5.6" r="1.5"/><circle cx="19.2" cy="7.8" r="1.5"/>',
    king: '<path d="M11 2.6h2v2h2v2h-2v1.6h-2V6.6H9v-2h2z"/><path d="M5.4 10c2.1 1.1 4.1 1.6 6.6 1.6S16.5 11.1 18.6 10l-1.4 8.4H6.8z"/><path d="M5.8 19.4h12.4V21H5.8z"/>',
  };
  const body = paths[k] || paths.pawn;
  return `<svg class="rank-icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${body}</svg>`;
}

function profileRank(score) {
  if (score >= 120) return { label: 'King', tone: 'purple', next: null };
  if (score >= 80) return { label: 'Queen', tone: 'purple', next: 120 - score };
  if (score >= 50) return { label: 'Rook', tone: 'blue', next: 80 - score };
  if (score >= 28) return { label: 'Bishop', tone: 'green', next: 50 - score };
  if (score >= 12) return { label: 'Knight', tone: 'amber', next: 28 - score };
  return { label: 'Pawn', tone: 'muted', next: 12 - score };
}

function userProfileStats(userId, projects = [], tasks = []) {
  const uid = Number(userId);
  const founded = projects.filter(p => Number(p.ownerId) === uid);
  const coediting = projects.filter(p => Number(p.ownerId) !== uid && (p.editorIds || []).map(Number).includes(uid));
  const assigned = tasks.filter(t => Number(t.assigneeId) === uid);
  const completedTasks = assigned.filter(t => t.status === 'done');
  const completedFounded = founded.filter(p => p.status === 'completed' || projectStatsFromTasks(tasks, p.id).progress === 100);
  const score = founded.length * 8 + completedFounded.length * 10 + coediting.length * 5 + completedTasks.length * 3 + assigned.filter(t => t.status === 'doing').length;
  return {
    founded: founded.length,
    completedFounded: completedFounded.length,
    coediting: coediting.length,
    assigned: assigned.length,
    completedTasks: completedTasks.length,
    score,
    rank: profileRank(score)
  };
}

async function showUserProfileModal(userId) {
  const user = await DB.getUser(Number(userId));
  if (!user) { showToast('User not found', 'error'); return; }
  const { projects, tasks } = await getWorkspaceData();
  const stats = userProfileStats(user.id, projects, tasks);
  const joined = user.createdAt ? formatDateShort(user.createdAt) : 'Unknown';
  const isSelf = Number(user.id) === Number(actorId());
  const initials = (user.displayName || user.username || '?').charAt(0).toUpperCase();
  const avatar = user.avatarBase64
    ? `<img src="${esc(user.avatarBase64)}" class="profile-view-avatar-img" alt="${esc(initials)}">`
    : `<div class="profile-view-avatar" ${userColorStyle(user)}>${initials}</div>`;
  showModal(esc(user.displayName || user.username), `
    <div class="profile-view-card profile-view-card-rich">
      <div class="profile-view-hero" style="--profile-color:${esc(user.color || userColor(user))}">
        <div class="profile-view-avatar-ring">${avatar}</div>
        <div class="profile-view-meta">
          <h3>${esc(user.displayName || user.username)}</h3>
          <span>@${esc(user.username)} · Joined ${esc(joined)}</span>
          <div class="admin-ucard-badges">${badge(user.role === 'admin' ? 'Admin' : 'Member', user.role === 'admin' ? 'purple' : 'blue')} ${departmentBadge(user.department || '')}</div>
        </div>
        <div class="profile-rank profile-rank--${esc(stats.rank.tone)}">
          <span class="rank-label">${rankIcon(stats.rank.label, 16)}${esc(stats.rank.label)}</span>
          <strong>${stats.score}</strong>
        </div>
      </div>
      <div class="profile-stat-grid">
        <div><strong>${stats.founded}</strong><span>Founded</span></div>
        <div><strong>${stats.completedFounded}</strong><span>Projects completed</span></div>
        <div><strong>${stats.coediting}</strong><span>Co-editing</span></div>
        <div><strong>${stats.completedTasks}</strong><span>Tasks completed</span></div>
      </div>
      <div class="profile-rank-track">
        <div class="profile-rank-track-fill" style="width:${Math.min(100, Math.round((stats.score / (stats.score + (stats.rank.next || 0) || 1)) * 100))}%"></div>
      </div>
      <p class="profile-view-bio">${user.bio ? esc(user.bio) : 'No bio added yet.'}</p>
      ${stats.rank.next ? `<p class="text-muted text-sm">${stats.rank.next} more points to the next rank.</p>` : '<p class="text-muted text-sm">Top rank reached.</p>'}
    </div>
    <div class="form-actions">
      <button type="button" class="btn btn-ghost" data-action="close-modal">Close</button>
      ${isSelf ? `<button type="button" class="btn btn-primary" data-action="edit-my-profile">Edit profile</button>` : `<button type="button" class="btn btn-primary" data-action="select-chat-channel" data-channel-id="dm-${user.id}">Message</button>`}
    </div>`);
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

async function showUserClassroomsModal(uid) {
  if (!isAdmin()) { showToast('Admins only', 'error'); return; }
  const [user, classrooms, selected] = await Promise.all([
    DB.getUser(uid),
    DB.getClassrooms ? DB.getClassrooms() : [],
    DB.getUserClassroomIds ? DB.getUserClassroomIds(uid) : []
  ]);
  if (!user) { showToast('User not found', 'error'); return; }
  const selectedSet = new Set((selected || []).map(Number));
  showModal('User Classrooms', `
    <form data-form="user-classrooms" data-user-id="${uid}">
      <p class="text-muted text-sm" style="margin-bottom:12px">Choose which project canvases ${esc(user.displayName || user.username)} can access.</p>
      <div class="project-editor-list">
        ${classrooms.map(c => `<label class="project-editor-option">
          <input type="checkbox" name="classroomIds" value="${c.id}" ${selectedSet.has(Number(c.id)) ? 'checked' : ''}>
          <span>${esc(c.name)}</span>
        </label>`).join('') || '<p class="text-muted text-sm">Create a classroom first.</p>'}
      </div>
      <div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button><button type="submit" class="btn btn-primary">Save Classrooms</button></div>
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
      <input type="hidden" name="avatarBase64" id="profile-avatar-b64" value="${esc(avatarUrl)}">
      <div class="form-group"><label>Display Name</label><input name="displayName" type="text" value="${esc(user.displayName || '')}" placeholder="e.g. Akram" required></div>
      <div class="form-group"><label>Email</label><input name="email" type="email" value="${esc(user.email || '')}" placeholder="you@example.com"></div>
      <div class="form-group"><label>Bio / About</label><textarea name="bio" rows="3" class="fixed-textarea" placeholder="What do you do? e.g. Project lead at Everlasting">${esc(user.bio || '')}</textarea></div>
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
          <div class="about-version">Version ${esc(getAppVersion())} · Built by Everlasting</div>
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
        <span class="text-muted text-sm">Local-first with secure cloud sync · Built with ❤️</span>
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
      <div class="td-section">
        <span class="td-section-label">Title</span>
        ${editable
          ? `<input type="text" class="td-title-input" data-td="title" value="${esc(task.title)}" placeholder="Task title" maxlength="200">`
          : `<h3 class="td-title-view">${esc(task.title)}</h3>`}
      </div>
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
              <label class="td-cf-pin" title="Show this field in the main project description">
                <input type="checkbox" data-cf="showInProject" data-idx="${i}" ${f.showInProject ? 'checked' : ''}>
                <span class="td-cf-pin-box">${ICONS.checkCircle}</span>
                <span class="td-cf-pin-text">Show in project</span>
              </label>
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
        <label class="td-cf-pin" title="Show this field in the main project description">
          <input type="checkbox" data-cf="showInProject" data-idx="${idx}">
          <span class="td-cf-pin-box">${ICONS.checkCircle}</span>
          <span class="td-cf-pin-text">Show in project</span>
        </label>
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
        classroomId: fd.get('classroomId') ? Number(fd.get('classroomId')) : null,
        workflowTemplate: fd.get('workflowTemplate') || '',
        isOngoing: fd.get('isOngoing') === '1',
        cadence: fd.get('cadence') || ''
      };
      // Custom templates only seed editable starting tasks — they are not a
      // persisted workflow type, so don't store the "tpl:<id>" sentinel.
      if (typeof data.workflowTemplate === 'string' && data.workflowTemplate.startsWith('tpl:')) data.workflowTemplate = '';
      if (form.querySelector('[name="editorIds"]')) {
        data.editorIds = fd.getAll('editorIds').map(Number).filter(Boolean);
      }
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
        if (updated && existing?.status !== 'completed' && updated.status === 'completed') {
          await onProjectCompleted(updated, uid).catch(() => {});
        }
        await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} updated project "${updated?.name || existing?.name || 'Project'}" (${departmentLabel(projectDepartmentValue(updated || existing))}).`);
        bustWorkspaceCache();
        const unsaved = projectSaveMismatchFields(data, updated);
        if (unsaved.length) showToast(`Project updated, but ${unsaved.join(', ')} could not be saved yet.`, 'warning');
        else showToast('Project updated', 'success');
      } else {
        data.ownerId = getSession().userId;
        data.actorUserId = uid;
        const nid = await DB.createProject(data);
        const created = await DB.getProject(nid);
        const isLogisticsCreate = (created?.workflowTemplate || data.workflowTemplate) === 'logistics-shipment';
        await ensureProjectWorkflowTasks(created, uid);
        // Logistics workflow tasks are created with workflowStepKey above — skip
        // generic bulk rows so steps are not duplicated without step keys.
        const bulkTitles = isLogisticsCreate ? [] : [...document.querySelectorAll('input[name="bulk_task[]"]')]
          .map(i => i.value.trim()).filter(Boolean);
        for (const title of bulkTitles) {
          await DB.createTask({ projectId: nid, title, status: 'todo', priority: 'medium', assigneeId: data.ownerId || uid, actorUserId: uid });
        }
        await mirrorBacklogActivity(`[Backlog] ${getSession()?.displayName || getSession()?.username || 'Someone'} created project "${created?.name || data.name}" (${departmentLabel(projectDepartmentValue(created))})${bulkTitles.length ? ` with ${bulkTitles.length} task${bulkTitles.length !== 1 ? 's' : ''}` : ''}.`);
        bustWorkspaceCache();
        const unsaved = projectSaveMismatchFields(data, created);
        if (unsaved.length) showToast(`Project created, but ${unsaved.join(', ')} could not be saved yet.`, 'warning');
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
    } else if (type === 'project-access-request') {
      const projectId = Number(form.dataset.projectId);
      const project = await DB.getProject(projectId);
      if (!project) { showToast('Project not found', 'error'); return; }
      if (!DB.requestProjectAccess) { showToast('Run the latest app database update first', 'warning'); return; }
      const message = fd.get('message')?.trim() || '';
      const reqId = await DB.requestProjectAccess({ projectId, requesterId: uid, message });
      const requester = await DB.getUser(uid);
      await notifyUser({
        userId: project.ownerId,
        type: 'access_request',
        message: `${requester?.displayName || requester?.username || 'Someone'} requested edit access to "${project.name}".`,
        projectId,
        entityType: 'project_access_request',
        entityId: reqId,
        actorUserId: uid
      });
      hideModal();
      showToast('Access request sent', 'success');
    } else if (type === 'project-editors') {
      const projectId = Number(form.dataset.projectId);
      const project = await DB.getProject(projectId);
      if (!project || !canManageProjectAccess(project)) { showToast('Permission denied', 'error'); return; }
      const editorIds = fd.getAll('editorIds').map(Number).filter(Boolean);
      await DB.updateProject(projectId, { editorIds }, uid);
      bustWorkspaceCache();
      hideModal();
      await router();
      showToast('Project access updated', 'success');
    } else if (type === 'bug-report') {
      if (!DB.createBugReport) { showToast('Bug reporting needs the latest database update', 'warning'); return; }
      const title = fd.get('title')?.trim();
      const description = fd.get('description')?.trim();
      const severity = fd.get('severity') || 'normal';
      const appVersion = fd.get('appVersion') || getAppVersion();
      let screenshots = [];
      try { screenshots = JSON.parse(fd.get('screenshots') || '[]'); } catch (_) { screenshots = []; }
      if (!title || !description) { showToast('Title and description are required', 'warning'); return; }
      const reportId = await DB.createBugReport({ userId: uid, title, description, severity, appVersion, screenshots });
      const admins = (await DB.getUsers()).filter(u => u.role === 'admin');
      const reporter = await DB.getUser(uid);
      for (const admin of admins) {
        await notifyUser({
          userId: admin.id,
          type: 'bug_report',
          message: `${reporter?.displayName || reporter?.username || 'Someone'} reported a ${severity} bug: ${title}`,
          entityType: 'bug_report',
          entityId: reportId,
          actorUserId: uid
        });
      }
      hideModal();
      showToast('Bug report sent', 'success');
    } else if (type === 'update-bug-report') {
      if (!isAdmin()) { showToast('Admins only', 'error'); return; }
      if (!DB.updateBugReport) { showToast('Bug ticket management needs the latest database update', 'warning'); return; }
      const bugId = Number(form.dataset.bugId);
      const existing = (await DB.getBugReports({ limit: 500 })).find(b => Number(b.id) === bugId);
      const status = fd.get('status') || 'open';
      const githubIssueUrl = (fd.get('githubIssueUrl') || '').trim();
      const resolutionNote = (fd.get('resolutionNote') || '').trim();
      await DB.updateBugReport(bugId, { status, githubIssueUrl, resolutionNote });
      // Tell the reporter when their ticket is resolved or progresses.
      if (existing && existing.userId && existing.userId !== uid && status !== existing.status) {
        const STATUS_LABEL = { open: 'reopened', in_progress: 'in progress', sent: 'sent to GitHub', fixed: 'fixed', closed: 'closed', wont_fix: 'closed as won\'t fix' };
        const msg = `Your bug report "${existing.title}" was marked ${STATUS_LABEL[status] || status}.${resolutionNote ? ` Note: ${resolutionNote}` : ''}`;
        await notifyUser({ userId: existing.userId, type: 'bug_report', message: msg, entityType: 'bug_report', entityId: bugId, actorUserId: uid }).catch(() => {});
      }
      await renderAdmin();
      showToast('Bug ticket updated', 'success');
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
      if (channelId?.startsWith('dm-')) {
        const toUserId = Number(channelId.slice(3));
        await DB.createDirectMessage({ fromUserId: uid, toUserId, content });
        form.reset();
        await refreshChatPane();
        return;
      }
      let hook = null;
      if (channelId === 'general') hook = await DB.getGeneralWebhook();
      else if (channelId?.startsWith('project-')) hook = await DB.getProjectWebhook(Number(channelId.split('-')[1]));
      if (hook?.url) {
        const result = await postToDiscordWebhook(hook.url, {
          username: discordWebhookUsername(session),
          content
        });
        if (!result.ok) showToast(discordFailToast(result), 'warning');
      }
      form.reset();
      const projectId = hook?.projectId ?? (channelId?.startsWith('project-') ? Number(channelId.split('-')[1]) : null);
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
      const avatarBase64 = fd.get('avatarBase64') || '';
      if (!displayName) { showToast('Display name is required', 'warning'); return; }
      const profileData = { displayName, email, department, bio, avatarBase64, ...(color && { color }) };
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
    } else if (type === 'add-workflow-template') {
      if (!isAdmin()) { showToast('Admins only', 'error'); return; }
      const name = fd.get('name')?.trim();
      if (!name) return;
      const steps = parseTemplateSteps(fd.get('steps'));
      await DB.createWorkflowTemplate({ name, description: fd.get('description')?.trim() || '', steps, createdBy: actorId(), actorUserId: actorId() });
      showToast('Template created', 'success');
      await renderSettings();
      return;
    } else if (type === 'edit-workflow-template') {
      if (!isAdmin()) { showToast('Admins only', 'error'); return; }
      const id = Number(form.dataset.templateId);
      const name = fd.get('name')?.trim();
      if (!id || !name) return;
      const steps = parseTemplateSteps(fd.get('steps'));
      await DB.updateWorkflowTemplate(id, { name, description: fd.get('description')?.trim() || '', steps });
      showToast('Template saved', 'success');
      await renderSettings();
      return;
    } else if (type === 'add-classroom') {
      if (!isAdmin()) { showToast('Admins only', 'error'); return; }
      const name = fd.get('name')?.trim();
      if (!name) return;
      await DB.createClassroom({
        name,
        description: fd.get('description')?.trim() || '',
        color: fd.get('color') || '#4f46e5'
      });
      bustWorkspaceCache();
      showToast('Classroom added', 'success');
      await renderAdmin();
      return;
    } else if (type === 'user-classrooms') {
      if (!isAdmin()) { showToast('Admins only', 'error'); return; }
      const targetId = Number(form.dataset.userId);
      await DB.setUserClassrooms(targetId, fd.getAll('classroomIds').map(Number).filter(Boolean));
      hideModal();
      bustWorkspaceCache();
      showToast('Classrooms updated', 'success');
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
  'add-task': (b) => showTaskModal(Number(b.dataset.projectId) || null, b.dataset.defaultStatus || 'todo'),
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
    await applyTaskStatusSideEffects(p, t, nextStatus, uid, projectTasks, projectAttachments);
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
  'user-view-profile': async () => { closeUserMenu(); await showUserProfileModal(actorId()); },
  'edit-my-profile': async () => { await showProfileModal(); },
  'report-bug': () => { closeUserMenu(); showBugReportModal(); },
  'user-show-howto': () => { closeUserMenu(); showOnboardingModal(true); },
  'toggle-help-menu': () => { state.helpMenuOpen = !state.helpMenuOpen; updateSidebarUser(); },
  'check-updates': () => {
    closeUserMenu();
    if (window.workTrackerDesktop?.checkForUpdates) {
      showToast('Checking for updates…', 'info');
      window.workTrackerDesktop.checkForUpdates();
    } else {
      showToast('Updates are managed in the installed desktop app.', 'info');
    }
  },
  'close-howto': () => hideModal(),
  'open-sync-diagnostics': async () => {
    closeUserMenu();
    await showSyncDiagnosticsModal();
  },
  'show-user-profile': async (b) => {
    await showUserProfileModal(Number(b.dataset.userId));
  },
  'show-sync-diagnostics': async () => {
    await showSyncDiagnosticsModal();
  },
  'auth-sync-cloud': async (b) => {
    const oldHtml = b.innerHTML;
    b.disabled = true;
    b.innerHTML = `${ICONS.refresh} Syncing...`;
    showAuthError('Checking the cloud for existing accounts...');
    try {
      const hasUsers = await forceCloudAuthSync();
      if (hasUsers) {
        renderLogin();
        showAuthError('Cloud workspace found. Sign in with your existing account.');
      } else {
        renderAdminSetup();
        showAuthError('The cloud is reachable, but no accounts were found. Create the first admin only if this is a new workspace.');
      }
    } catch (err) {
      console.warn('[auth-sync-cloud] failed', err);
      showAuthError(`Cloud sync failed: ${err?.message || 'check your connection'}`);
    } finally {
      if (b.isConnected) {
        b.disabled = false;
        b.innerHTML = oldHtml;
      }
    }
  },
  'sync-now': async () => {
    closeUserMenu();
    if (!isCloudMode()) {
      showToast('Cloud sync is not enabled for this build.', 'info');
      return;
    }
    if (isOffline()) {
      showToast('You are offline. Sync will run when the connection returns.', 'warning');
      return;
    }
    showToast('Syncing…', 'info');
    try {
      if (window.SyncEngine) {
        await SyncEngine.pull();
        await SyncEngine.flush();
      } else if (DB.retrySyncNow) {
        await DB.retrySyncNow();
      } else if (DB.flushPendingSync) {
        await DB.flushPendingSync();
      }
      bustWorkspaceCache();
      await getWorkspaceData(true).catch(() => null);
      renderSyncStatusIndicator();
      updateOfflineSyncBanner();
      const status = _getSyncStatus();
      if (!status.failed && !status.pending && !status.syncing) {
        showToast('Cloud sync is up to date.', 'success');
      } else if (status.failed) {
        showToast('Cloud sync needs attention. Open sync details for more.', 'warning');
      } else {
        showToast('Cloud sync is still working through pending changes.', 'info');
      }
    } catch (err) {
      console.warn('[sync-now] failed', err);
      renderSyncStatusIndicator();
      showToast(`Cloud sync failed: ${err?.message || 'check sync details'}`, 'warning');
    }
  },
  'sync-retry-now': async () => {
    if (window.SyncEngine && SyncEngine.retry) {
      showToast('Retrying sync…', 'info');
      try {
        await SyncEngine.pull();
        await SyncEngine.retry();
        bustWorkspaceCache();
        await getWorkspaceData(true).catch(() => null);
      } catch (_) {}
      renderSyncStatusIndicator();
      updateOfflineSyncBanner();
      await showSyncDiagnosticsModal();
      return;
    }
    await actions['sync-now']();
    renderSyncStatusIndicator();
    await showSyncDiagnosticsModal();
  },
  'sync-force-reload': async () => {
    try {
      localStorage.removeItem('wt-supabase-shadow-v1');
      localStorage.removeItem('wt-supabase-sync-queue-v1');
      if (window.SupabaseDB) {
        window.SupabaseDB._shadowState = window.SupabaseDB._emptyShadowState();
        window.SupabaseDB._syncQueue = [];
      }
    } catch(_) {}
    bustWorkspaceCache();
    hideModal();
    if (window.SyncEngine) await SyncEngine.pull();
    showToast('Cache cleared — reloading fresh data from the cloud…', 'info');
    await router();
  },
  'sync-copy-errors': async () => {
    const jobs = (window.SyncEngine && SyncEngine.getQueueDetails)
      ? SyncEngine.getQueueDetails()
      : (DB.getSyncQueueDetails ? DB.getSyncQueueDetails() : []);
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
    const removed = (window.SyncEngine && SyncEngine.clearFailed)
      ? SyncEngine.clearFailed()
      : (DB.clearFailedSyncJobs ? DB.clearFailedSyncJobs() : 0);
    renderSyncStatusIndicator();
    updateOfflineSyncBanner();
    updateSidebarUser();
    hideModal();
    showToast(removed ? `Cleared ${removed} failed job${removed > 1 ? 's' : ''}` : 'No failed jobs to clear', 'info');
  },
  'user-logout': async () => {
    closeUserMenu();
    stopPresenceHeartbeat();
    stopChatDockPolling();
    state.chatDockOpen = false;
    const dockRoot = document.getElementById('chat-dock-root');
    if (dockRoot) { dockRoot.innerHTML = ''; dockRoot.style.display = 'none'; }
    const s = getSession();
    if (s) await DB.logActivity({ userId: s.userId, action: 'logged_out', entityType: 'session', details: s.username });
    clearSession({ trusted: true });
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
    const saveBtn = b; saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
    try {
      const taskId = Number(b.dataset.id);
      const title = document.querySelector('[data-td="title"]')?.value?.trim();
      const status = document.querySelector('[data-td="status"]')?.value;
      const priority = document.querySelector('[data-td="priority"]')?.value;
      const dueDate = document.querySelector('[data-td="dueDate"]')?.value || '';
      const assigneeIdRaw = document.querySelector('[data-td="assigneeId"]')?.value;
      const assigneeId = assigneeIdRaw ? Number(assigneeIdRaw) : null;
      const notes = document.querySelector('[data-td="notes"]')?.value?.trim() || '';
      const cfRows = document.querySelectorAll('.td-cf-row');
      const customFields = [...cfRows].map(row => ({
        label: row.querySelector('[data-cf="label"]')?.value?.trim() || '',
        value: row.querySelector('[data-cf="value"]')?.value?.trim() || '',
        showInProject: !!row.querySelector('[data-cf="showInProject"]')?.checked
      })).filter(f => f.label || f.value);
      const uid = actorId();
      const oldTask = await DB.getTask(taskId);
      const activityDetails = customFieldActivitySummary(oldTask?.customFields || [], customFields);
      const changes = { dueDate, notes, customFields };
      if (activityDetails) changes.activityDetails = activityDetails;
      if (title && title !== oldTask?.title) {
        changes.title = title;
        changes.activityDetails = `renamed task to "${title}"`;
      }
      if (status) changes.status = status;
      if (priority) changes.priority = priority;
      if (assigneeId) changes.assigneeId = assigneeId;
      await DB.updateTask(taskId, changes, uid);
      bustWorkspaceCache();
      hideModal();
      await router();
      showToast('Task saved', 'success');
    } catch(err) {
      saveBtn.disabled = false; saveBtn.textContent = 'Save Changes';
      showToast('Save failed: ' + (err?.message || 'Unknown error'), 'error');
    }
  },
  'clear-all-notifications': async () => {
    const uid = actorId(); if (!uid) return;
    await DB.markAllNotificationsRead(uid);
    refreshNotificationBadge();
    await renderNotificationsPage();
    renderNotificationPanel();
    showToast('All notifications marked as read', 'info');
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
  'open-project-card': (b) => {
    const pid = Number(b.dataset.projectId);
    if (pid) window.location.hash = `#/projects/${pid}`;
  },
  'request-project-access': async (b) => {
    await showRequestProjectAccessModal(Number(b.dataset.projectId));
  },
  'manage-project-access': async (b) => {
    await showProjectAccessModal(Number(b.dataset.projectId));
  },
  'approve-project-access': async (b) => {
    if (!DB.respondProjectAccess) return;
    const req = await DB.respondProjectAccess(Number(b.dataset.requestId), { status: 'approved', decidedBy: actorId() });
    const project = await DB.getProject(Number(b.dataset.projectId));
    await notifyUser({
      userId: req.requesterId,
      type: 'access_approved',
      message: `Your edit access request for "${project?.name || 'a project'}" was approved.`,
      projectId: project?.id || null,
      entityType: 'project',
      entityId: project?.id || null,
      actorUserId: actorId()
    });
    bustWorkspaceCache();
    await showProjectAccessModal(Number(b.dataset.projectId));
    showToast('Access approved', 'success');
  },
  'decline-project-access': async (b) => {
    if (!DB.respondProjectAccess) return;
    const req = await DB.respondProjectAccess(Number(b.dataset.requestId), { status: 'declined', decidedBy: actorId() });
    const project = await DB.getProject(Number(b.dataset.projectId));
    await notifyUser({
      userId: req.requesterId,
      type: 'access_declined',
      message: `Your edit access request for "${project?.name || 'a project'}" was declined.`,
      projectId: project?.id || null,
      entityType: 'project',
      entityId: project?.id || null,
      actorUserId: actorId()
    });
    await showProjectAccessModal(Number(b.dataset.projectId));
    showToast('Access declined', 'info');
  },
  'copy-pinned-field': async (b) => {
    const value = b.dataset.copy || '';
    if (!value) return;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(value);
      else {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      showToast('Copied tracking info', 'success');
    } catch (_) {
      showToast('Could not copy automatically', 'warning');
    }
  },
  'filter-projects': async (b) => { state.projectFilter = b.dataset.filter; await renderProjects(); },
  'filter-tasks': async (b) => { state.taskFilter = b.dataset.filter; await renderTasks(); },
  'global-task-view': async (b) => { state.globalTaskViewMode = b.dataset.view; await renderTasks(); },
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
  'edit-user-classrooms': (b) => showUserClassroomsModal(Number(b.dataset.id)),
  'reset-password': (b) => showResetPwModal(Number(b.dataset.id)),
  'delete-user': async (b) => {
    const uid = Number(b.dataset.id); const s = getSession();
    if (uid === s.userId) { showToast('Cannot delete yourself', 'error'); return; }
    if (!confirm('Delete this user? Their projects will be transferred to you.')) return;
    await DB.deleteUser(uid, s.userId); showToast('User deleted', 'success'); bustWorkspaceCache(); await router();
  },
  'save-tasks-as-template': async (b) => {
    const pid = Number(b.dataset.projectId);
    const p = await DB.getProject(pid);
    if (!p || !canEdit(p)) { showToast('Permission denied', 'error'); return; }
    const tasks = sortTasksByOrder(await DB.getTasks({ projectId: pid }));
    if (!tasks.length) { showToast('No tasks to save', 'warning'); return; }
    const name = prompt('Template name:', `${p.name} workflow`);
    if (!name?.trim()) return;
    const steps = tasks.map(t => ({ title: t.title, priority: t.priority || 'medium' }));
    await DB.createWorkflowTemplate({ name: name.trim(), description: `Saved from "${p.name}"`, steps, createdBy: actorId(), actorUserId: actorId() });
    showToast(`Saved "${name.trim()}" with ${steps.length} task${steps.length === 1 ? '' : 's'}`, 'success');
  },
  'delete-workflow-template': async (b) => {
    if (!isAdmin()) { showToast('Admins only', 'error'); return; }
    const id = Number(b.dataset.id);
    if (!id) return;
    if (!confirm('Delete this workflow template? Projects already created keep their tasks.')) return;
    await DB.deleteWorkflowTemplate(id);
    showToast('Template deleted', 'success');
    await renderSettings();
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
  'delete-classroom': async (b) => {
    if (!isAdmin()) { showToast('Admins only', 'error'); return; }
    if (!confirm('Remove this classroom? Projects will move to another classroom.')) return;
    try {
      await DB.deleteClassroom(Number(b.dataset.id));
      bustWorkspaceCache();
      showToast('Classroom removed', 'success');
      await renderSettings();
    } catch (err) {
      showToast(err?.message || 'Could not remove classroom', 'error');
    }
  },
  'toggle-project-visibility': async (b) => {
    if (!isAdmin()) return;
    const projectId = Number(b.dataset.projectId);
    const userId    = Number(b.dataset.userId);
    const hidden    = b.checked;
    try {
      const project = (await getWorkspaceData()).projects.find(p => p.id === projectId);
      if (!project) return;
      let ids = Array.isArray(project.hiddenFromIds) ? [...project.hiddenFromIds] : [];
      if (hidden) { if (!ids.includes(userId)) ids.push(userId); }
      else { ids = ids.filter(id => id !== userId); }
      await DB.updateProject(projectId, { hiddenFromIds: ids }, actorId());
      bustWorkspaceCache();
      // Update chip style immediately without full re-render
      const chip = b.closest('label')?.querySelector('.visibility-user-chip');
      if (chip) chip.classList.toggle('is-hidden', hidden);
    } catch (err) { showToast(err?.message || 'Could not update visibility', 'error'); }
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
    hideModal();
    openChatDock(b.dataset.channelId);
  },
  'dismiss-celebration': () => { dismissCelebration(); },
  'toggle-chat-dock': () => { toggleChatDock(); },
  'close-chat-dock': () => { closeChatDock(); },
  'chat-dock-back': () => { state.chatDockView = 'list'; renderChatDock(); },
  'open-chat-channel': (b) => { openChatDock(b.dataset.channelId); },
  'toggle-chat-favorite': async (b) => {
    const favUserId = Number(b.dataset.userId);
    const meId = actorId();
    if (!favUserId || !meId || !DB.getFavorites) return;
    const favs = await DB.getFavorites(meId).catch(() => []);
    const isFav = favs.some(f => Number(f.favoriteUserId) === favUserId);
    if (isFav) await DB.removeFavorite(meId, favUserId);
    else await DB.addFavorite({ userId: meId, favoriteUserId: favUserId });
    if (_chatDockData) {
      if (isFav) _chatDockData.favIds.delete(favUserId);
      else _chatDockData.favIds.add(favUserId);
      const list = document.getElementById('chat-dock-list');
      if (list) list.innerHTML = chatDockListBodyHtml();
    }
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

/* ──── Presence (Phase 4) ──── */

const PRESENCE_ONLINE_MS = 3 * 60 * 1000; // a user seen within 3 min is "online"
let _presenceTimer = null;

function startPresenceHeartbeat() {
  stopPresenceHeartbeat();
  const beat = () => {
    const uid = actorId();
    if (uid && DB.touchLastSeen) DB.touchLastSeen(uid).catch(() => {});
  };
  beat();
  _presenceTimer = setInterval(beat, 60 * 1000);
}
function stopPresenceHeartbeat() {
  if (_presenceTimer) { clearInterval(_presenceTimer); _presenceTimer = null; }
}
function isUserOnline(user) {
  if (!user?.lastSeenAt) return false;
  const t = Date.parse(user.lastSeenAt);
  return !isNaN(t) && (Date.now() - t) < PRESENCE_ONLINE_MS;
}
function presenceDotHtml(user) {
  const on = isUserOnline(user);
  return `<span class="presence-dot ${on ? 'presence-dot--on' : ''}" title="${on ? 'Online' : (user?.lastSeenAt ? 'Last active ' + timeAgo(user.lastSeenAt) : 'Offline')}"></span>`;
}

/* ──── Ranking explanation (Phase 4) ──── */

function rankingExplanationHtml() {
  const tiers = [
    { l: 'Pawn', r: '0 – 11', tone: 'muted' },
    { l: 'Knight', r: '12 – 27', tone: 'amber' },
    { l: 'Bishop', r: '28 – 49', tone: 'green' },
    { l: 'Rook', r: '50 – 79', tone: 'blue' },
    { l: 'Queen', r: '80 – 119', tone: 'purple' },
    { l: 'King', r: '120+', tone: 'purple' },
  ];
  return `<section class="section-card ranking-explainer" style="margin-bottom:24px">
    <div class="section-header">
      <div>
        <h2>How ranking works</h2>
        <p class="view-subtitle" style="margin-top:2px;font-size:0.8rem">The more you found, co-edit and complete, the higher your chess rank climbs.</p>
      </div>
    </div>
    <div class="section-body" style="padding:16px 20px">
      <div class="ranking-points">
        <span class="ranking-point">Found a project <strong>+8</strong></span>
        <span class="ranking-point">Complete a founded project <strong>+10</strong></span>
        <span class="ranking-point">Co-edit a project <strong>+5</strong></span>
        <span class="ranking-point">Complete a task <strong>+3</strong></span>
        <span class="ranking-point">Task in progress <strong>+1</strong></span>
      </div>
      <div class="ranking-tiers">
        ${tiers.map(t => `<div class="ranking-tier profile-rank--${t.tone}"><span class="rank-label">${rankIcon(t.l, 18)}${t.l}</span><small>${t.r} pts</small></div>`).join('')}
      </div>
    </div>
  </section>`;
}

async function renderUsers() {
  const content = document.getElementById('content');
  if (!content) return;
  const [users, { projects, tasks }] = await Promise.all([
    getUsersCached(true),
    getWorkspaceData(),
  ]);
  const enriched = users.map(u => ({ u, stats: userProfileStats(u.id, projects, tasks) }))
    .sort((a, b) => b.stats.score - a.stats.score);

  const cards = enriched.map(({ u, stats }, i) => {
    const initials = (u.displayName || u.username || '?').charAt(0).toUpperCase();
    const avatarInner = u.avatarBase64
      ? `<img src="${esc(u.avatarBase64)}" alt="${esc(initials)}">`
      : initials;
    return `<div class="user-card" data-action="show-user-profile" data-user-id="${u.id}" role="button" tabindex="0" title="View ${esc(u.displayName || u.username)}'s profile">
      <div class="user-card-rank-num">#${i + 1}</div>
      <div class="user-card-avatar-wrap">
        <div class="user-card-avatar" ${userColorStyle(u)}>${avatarInner}</div>
        ${presenceDotHtml(u)}
      </div>
      <div class="user-card-info">
        <div class="user-card-name">${esc(u.displayName || u.username)}</div>
        <div class="user-card-sub">@${esc(u.username)}${u.department ? ` · ${departmentLabel(u.department)}` : ''}</div>
        <div class="user-card-badges">
          <span class="profile-rank profile-rank--${esc(stats.rank.tone)}"><span class="rank-label">${rankIcon(stats.rank.label, 15)}${esc(stats.rank.label)}</span><strong>${stats.score}</strong></span>
          ${u.role === 'admin' ? badge('Admin', 'purple') : ''}
        </div>
      </div>
      ${u.bio ? `<p class="user-card-bio">${esc(u.bio)}</p>` : ''}
      <div class="user-card-stats">
        <div><strong>${stats.founded}</strong><span>Founded</span></div>
        <div><strong>${stats.completedFounded}</strong><span>Completed</span></div>
        <div><strong>${stats.coediting}</strong><span>Co-editing</span></div>
        <div><strong>${stats.completedTasks}</strong><span>Tasks done</span></div>
      </div>
      <div class="user-card-foot">${isUserOnline(u) ? '<span class="user-card-online">Online now</span>' : `Last active ${u.lastSeenAt ? timeAgo(u.lastSeenAt) : 'a while ago'}`}</div>
    </div>`;
  }).join('');

  content.innerHTML = `
    <div class="view-header">
      <div><h1>Users</h1><p class="view-subtitle">${users.length} member${users.length === 1 ? '' : 's'} · ranked by contribution</p></div>
    </div>
    ${rankingExplanationHtml()}
    <div class="user-grid">${cards || '<p class="text-muted text-sm">No users yet.</p>'}</div>`;
}

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
  else if (hash === '/users') await renderUsers();
  else if (hash === '/chat') await renderChat();
  else if (hash === '/notifications') await renderNotificationsPage();
  else if (hash === '/activity') await renderActivityPage();
  else if (hash === '/admin') await renderAdmin();
  else if (hash === '/settings') await renderSettings();
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
  const savedSession = getSession() || restoreTrustedSession();

  if (!savedSession || !isOffline()) {
    let hasUsers = true;
    try {
      hasUsers = await DB.hasUsers();
      if (!hasUsers) {
        await waitForInitialCloudUsers();
        hasUsers = await DB.hasUsers();
      }
    } catch (err) {
      if (!savedSession && isOffline()) {
        document.getElementById('app').style.display = 'none';
        document.getElementById('menu-toggle').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        renderLogin();
        showAuthError('You are offline. Sign in once while online to keep this device remembered.');
        return;
      }
      if (!savedSession || !isOffline()) throw err;
    }
    if (!hasUsers) {
      document.getElementById('app').style.display = 'none';
      document.getElementById('menu-toggle').style.display = 'none';
      document.getElementById('auth-screen').style.display = 'flex';
      renderAdminSetup();
      return;
    }
  }

  if (hash === '/recovery') {
    document.getElementById('app').style.display = 'none';
    document.getElementById('menu-toggle').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    await renderRecovery();
    return;
  }
  const s = savedSession;
  if (s) {
    const user = isOffline() ? s : await DB.getUser(s.userId);
    if (!user) {
      clearSession({ trusted: true });
      wtAppBootstrapped = false;
      document.getElementById('app').style.display = 'none';
      document.getElementById('menu-toggle').style.display = 'none';
      document.getElementById('auth-screen').style.display = 'flex';
      renderLogin();
      return;
    }
    if (!isOffline()) setSession(user, { remember: !!getTrustedSession() });
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
      showToast('Cloud database unavailable — using browser-only storage for now.', 'warning');
    }
    document.getElementById('auth-content').addEventListener('submit', handleAuth);
    window.addEventListener('wt-sync-status', () => {
      renderSyncStatusIndicator();
      updateOfflineSyncBanner();
      if (state.userMenuOpen) renderUserMenu();
    });
    window.addEventListener('wt-sync-error', (e) => {
      const { summary, error } = e.detail || {};
      const label = summary ? `"${summary}"` : 'A change';
      const hint = error ? ` — ${error.slice(0, 120)}` : '';
      showToast(`Cloud sync failed: ${label} couldn't be saved${hint}`, 'error');
      updateOfflineSyncBanner();
    });
    window.addEventListener('online', () => { handleNetworkOnline(); });
    window.addEventListener('offline', () => { handleNetworkOffline(); });
    window.addEventListener('wt-sync-pulled', () => {
      if (!wtAppBootstrapped) return;
      bustWorkspaceCache();
      router().catch(() => {});
    });
    document.addEventListener('click', async (e) => {
      const syncBtn = e.target.closest('#sync-status-indicator');
      if (syncBtn && !syncBtn.classList.contains('hidden')) {
        e.preventDefault();
        e.stopPropagation();
        await actions['sync-now']();
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
        if (b.dataset.action === 'copy-pinned-field') {
          e.preventDefault();
          e.stopPropagation();
        }
        await actions[b.dataset.action](b);
      }
    });
    document.addEventListener('keydown', (e) => {
      const card = e.target.matches?.('.project-card-v2[data-action="open-project-card"]') ? e.target : null;
      if (card && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        actions['open-project-card'](card);
        return;
      }
      const ta = e.target.closest('form[data-form="chat-send"] textarea, .chat-compose textarea');
      if (ta && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const form = ta.closest('form');
        if (form) form.requestSubmit();
      }
    });
    document.getElementById('modal-overlay').addEventListener('submit', handleFormSubmit);
    document.getElementById('content').addEventListener('submit', handleFormSubmit);
    document.getElementById('chat-dock-root')?.addEventListener('submit', handleFormSubmit);
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
      } else if (target?.dataset?.projectFilterInput === 'classroom') {
        state.classroomFilter = target.value || 'all';
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
