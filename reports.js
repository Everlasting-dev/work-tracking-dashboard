/* reports.js - isolated HTML report generation for Orbitask/WorkTracker.
 *
 * This module intentionally reads through the existing window.DB API and avoids
 * writing to app data. Keeping reports read-only makes them a good first step
 * toward pulling unstable feature code out of app.js.
 */

(function () {
const REPORT_ACCENT = '#2f5d7c';
const REPORT_BG = '#fcfcfa';
const REPORT_TEXT = '#181b22';

  let currentPreviewUrl = '';

  function esc(value) {
    const d = document.createElement('div');
    d.textContent = value == null ? '' : String(value);
    return d.innerHTML;
  }

  function asNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function sameId(a, b) {
    const na = asNumber(a);
    const nb = asNumber(b);
    return na != null && nb != null && na === nb;
  }

  function safeFileName(value, fallback = 'report') {
    const base = String(value || fallback)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return base || fallback;
  }

  function formatDate(value) {
    if (!value) return 'Not set';
    try {
      const date = String(value).includes('T') ? new Date(value) : new Date(`${value}T00:00:00`);
      if (Number.isNaN(date.getTime())) return String(value);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (_) {
      return String(value);
    }
  }

  function formatDateTime(value) {
    if (!value) return 'Not set';
    try {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch (_) {
      return String(value);
    }
  }

  function statusLabel(value) {
    return {
      active: 'Active',
      completed: 'Completed',
      archived: 'Archived',
      'on-hold': 'On Hold',
      todo: 'To Do',
      doing: 'In Progress',
      done: 'Done',
      blocked: 'Blocked'
    }[value] || (value ? String(value) : 'Not set');
  }

  function priorityLabel(value) {
    return {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent'
    }[value] || (value ? String(value) : 'Not set');
  }

  function projectProgress(tasks) {
    if (!tasks.length) return 0;
    const done = tasks.filter(t => t.status === 'done').length;
    return Math.round((done / tasks.length) * 100);
  }

  function getSession() {
    try {
      const raw = sessionStorage.getItem('wt-session');
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function userName(user) {
    if (!user) return 'Unknown';
    return user.displayName || user.username || `User ${user.id}`;
  }

  function userLine(user) {
    if (!user) return 'Unknown user';
    const bits = [
      user.username ? `@${user.username}` : '',
      user.role ? statusLabel(user.role) : '',
      user.department ? `Department: ${user.department}` : '',
      user.createdAt ? `Joined: ${formatDate(user.createdAt)}` : '',
      user.lastSeenAt ? `Last seen: ${formatDateTime(user.lastSeenAt)}` : ''
    ].filter(Boolean);
    return bits.join(' | ') || 'No profile details recorded.';
  }

  function taskTitle(task) {
    return task?.title || `Task ${task?.id || ''}`.trim();
  }

  function taskMeta(task, projectMap = {}, reason = '') {
    const project = projectMap[task.projectId];
    return [
      project ? project.name : '',
      statusLabel(task.status),
      priorityLabel(task.priority),
      task.dueDate ? `Due ${formatDate(task.dueDate)}` : '',
      reason
    ].filter(Boolean).join(' | ');
  }

  function getTaskCreatedByMap(activity) {
    const map = new Map();
    for (const row of activity || []) {
      if (row?.entityType === 'task' && row?.action === 'created' && row.entityId != null && row.userId != null) {
        if (!map.has(Number(row.entityId))) map.set(Number(row.entityId), Number(row.userId));
      }
    }
    return map;
  }

  function getUserTouchedTaskIds(activity, userId) {
    const ids = new Set();
    for (const row of activity || []) {
      if (sameId(row?.userId, userId) && row?.entityType === 'task' && row.entityId != null) {
        ids.add(Number(row.entityId));
      }
    }
    return ids;
  }

  function htmlList(items, emptyText = 'No items found.') {
    if (!items.length) return `<p class="empty">${esc(emptyText)}</p>`;
    return `<ul class="clean-list">${items.join('')}</ul>`;
  }

  function taskItem(task, projectMap, reason = '') {
    return `<li><strong>${esc(taskTitle(task))}</strong><span>${esc(taskMeta(task, projectMap, reason))}</span>${task.notes ? `<small>${esc(task.notes).slice(0, 260)}</small>` : ''}</li>`;
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve) => {
      if (!blob) return resolve('');
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => resolve('');
      reader.readAsDataURL(blob);
    });
  }

  async function attachmentPreviewSource(att) {
    if (!att || !(att.mimeType || '').startsWith('image/')) return '';
    if (att.blob) return blobToDataUrl(att.blob);
    if (att.storagePath && window.DB?.getAttachmentUrl) return window.DB.getAttachmentUrl(att.storagePath);
    return '';
  }

  async function normalizeAttachments(attachments, users, tasks) {
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));
    const taskMap = Object.fromEntries(tasks.map(t => [t.id, t]));
    const rows = [];
    for (const att of attachments || []) {
      rows.push({
        ...att,
        uploadedByName: userName(userMap[att.uploadedBy]),
        taskName: att.taskId ? taskTitle(taskMap[att.taskId]) : 'Project file',
        imageSrc: await attachmentPreviewSource(att),
        url: att.storagePath && window.DB?.getAttachmentUrl ? window.DB.getAttachmentUrl(att.storagePath) : ''
      });
    }
    return rows;
  }

  function reportShell(title, subtitle, body) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: light; --paper:#fcfcfa; --ink:#181b22; --muted:#6b7180; --faint:#9aa0ad; --line:#e9e7e0; --line2:#f0eee8; --accent:#2f5d7c; --accent-soft:#eaf1f6; --todo:#c9cdd6; --doing:#d9a441; --done:#2f7a55; --disp:'Space Grotesk',system-ui,sans-serif; --body:'Inter',system-ui,sans-serif; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: ${REPORT_BG};
      color: ${REPORT_TEXT};
      font-family: var(--body);
      font-size: 14px;
      line-height: 1.35;
    }
    .sheet {
      max-width: 900px;
      width: min(900px, calc(100vw - 36px));
      margin: 0 auto;
      padding: 56px 28px 80px;
      background: var(--paper);
      border: 0;
    }
    .report-top {
      position: relative;
      margin-bottom: 34px;
      padding-bottom: 34px;
      border-bottom: 1px solid var(--line);
      display: flex;
      justify-content: space-between;
      gap: 32px;
      align-items: flex-end;
    }
    .report-top::before {
      content: 'Progress brief';
      display: block;
      position: absolute;
      transform: translateY(-22px);
      font-family: var(--disp);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: .18em;
      text-transform: uppercase;
      color: var(--accent);
    }
    .report-top h1 {
      margin: 0;
      font-family: var(--disp);
      font-size: 40px;
      line-height: 1;
      font-weight: 600;
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    .report-top p { margin: 10px 0 0; max-width: 60ch; color: var(--muted); text-transform: none; font-size: 15px; }
    .generated { text-align: right; font-size: 12px; color: var(--faint); text-transform: none; }
    .block {
      background: transparent;
      border-top: 1px solid var(--line2);
      padding: 16px 0;
      margin-bottom: 0;
      min-height: 0;
      overflow: hidden;
    }
    .block:last-of-type { border-bottom: 1px solid var(--line2); }
    .block h2 {
      margin: 0 0 10px;
      font-family: var(--disp);
      font-size: 18px;
      line-height: 1.05;
      font-weight: 600;
      letter-spacing: -0.01em;
      text-transform: none;
    }
    .block h3 {
      margin: 0 0 8px;
      font-size: 16px;
      text-transform: uppercase;
    }
    .grid {
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(210px, 1fr);
      gap: 16px;
      align-items: stretch;
    }
    .side-stack {
      display: grid;
      gap: 16px;
    }
    .tasks-block { min-height: 410px; }
    .status-block { min-height: 180px; }
    .attachments-block { min-height: 214px; }
    .remarks-block { min-height: 72px; }
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 8px;
      margin-top: 10px;
    }
    .kpi {
      border: 1px solid var(--line);
      border-radius: 10px;
      padding: 8px;
      min-height: 54px;
      background: var(--accent-soft);
    }
    .kpi strong { display: block; font-family: var(--disp); font-size: 26px; line-height: 1; color: var(--accent); }
    .kpi span { display: block; margin-top: 5px; color: var(--muted); font-size: 12px; text-transform: none; }
    .clean-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 8px;
    }
    .clean-list li {
      border-bottom: 1px dashed var(--line2);
      padding-bottom: 7px;
    }
    .clean-list strong { display: block; font-size: 13.5px; text-transform: none; }
    .clean-list span, .clean-list small { display: block; font-size: 11px; }
    .clean-list small { margin-top: 3px; color: #333; }
    .empty { margin: 0; font-size: 12px; text-transform: uppercase; }
    .status-pill {
      display: inline-block;
      padding: 5px 8px;
      border: 1px solid #d8e4ec;
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      margin: 2px 0 12px;
    }
    .progress-track {
      width: 100%;
      height: 13px;
      border: 0;
      border-radius: 999px;
      background: var(--line2);
      margin: 8px 0 12px;
    }
    .progress-fill {
      height: 100%;
      border-radius: 999px;
      background: var(--done);
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      text-transform: uppercase;
    }
    .meta-table td {
      padding: 4px 0;
      border-bottom: 1px solid var(--line2);
      vertical-align: top;
    }
    .meta-table td:first-child { width: 42%; font-weight: 700; }
    .attachment-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 8px;
    }
    .attachment-card {
      min-height: 92px;
      border: 1px solid rgba(0,0,0,0.2);
      border-radius: 10px;
      background: var(--accent-soft);
      padding: 7px;
      overflow: hidden;
    }
    .attachment-card img {
      width: 100%;
      height: 74px;
      object-fit: cover;
      display: block;
      margin-bottom: 6px;
      border: 1px solid rgba(0,0,0,0.22);
    }
    .attachment-card strong,
    .attachment-card span {
      display: block;
      font-size: 10px;
      word-break: break-word;
    }
    .full-document {
      margin: 0 0 14px;
      page-break-inside: avoid;
    }
    .full-document img {
      width: 100%;
      max-height: 480px;
      object-fit: contain;
      background: rgba(255,255,255,0.22);
      border: 1px solid rgba(0,0,0,0.24);
    }
    .full-document figcaption { font-size: 11px; margin-top: 5px; text-transform: uppercase; }
    .remarks { white-space: pre-wrap; }
    @media print {
      body { background: #fff; }
      .sheet {
        width: auto;
        margin: 0;
        border: 0;
        padding: 14mm;
        background: #fff;
      }
      .block { break-inside: avoid; }
      a { color: inherit; text-decoration: none; }
    }
    @media (max-width: 720px) {
      .sheet { width: calc(100vw - 20px); padding: 16px; border-width: 6px; }
      .grid, .kpis { grid-template-columns: 1fr; }
      .report-top { display: block; }
      .generated { text-align: left; margin-top: 10px; }
    }
  </style>
</head>
<body>
  <main class="sheet">
    <div class="report-top">
      <div>
        <h1>${esc(title)}</h1>
        <p>${esc(subtitle)}</p>
      </div>
      <div class="generated">Generated ${esc(formatDateTime(new Date().toISOString()))}</div>
    </div>
    ${body}
  </main>
</body>
</html>`;
  }

  function showReportPreview(title, html, fileName) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    if (currentPreviewUrl) {
      try { URL.revokeObjectURL(currentPreviewUrl); } catch (_) {}
    }
    currentPreviewUrl = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    overlay.innerHTML = `
      <div class="modal modal-fullscreen report-preview-modal">
        <div class="modal-header">
          <h2>${esc(title)}</h2>
          <div class="report-preview-actions">
            <button type="button" class="btn btn-sm btn-ghost" data-action="print-report-preview">Print / Save PDF</button>
            <a href="${esc(currentPreviewUrl)}" download="${esc(fileName)}" class="btn btn-sm btn-primary">Download HTML</a>
            <button type="button" class="btn-icon" data-action="close-modal" aria-label="Close report preview">x</button>
          </div>
        </div>
        <div class="modal-body report-preview-body">
          <iframe id="report-preview-frame" class="report-preview-frame" src="${esc(currentPreviewUrl)}" title="${esc(title)}"></iframe>
        </div>
      </div>`;
    overlay.classList.remove('hidden');
  }

  function printCurrentPreview() {
    const frame = document.getElementById('report-preview-frame');
    try {
      frame?.contentWindow?.focus();
      frame?.contentWindow?.print();
    } catch (_) {
      window.open(currentPreviewUrl, '_blank');
    }
  }

  async function generateCurrentUserReport() {
    const session = getSession();
    if (!session?.userId) {
      window.showToast?.('Sign in first', 'warning');
      return;
    }
    await generateUserReport(session.userId);
  }

  async function generateUserReport(userId) {
    try {
      const [user, users, projects, tasks, activity] = await Promise.all([
        window.DB.getUser(Number(userId)),
        window.DB.getUsers(),
        window.DB.getProjects(),
        window.DB.getTasks(),
        window.DB.getActivityLog ? window.DB.getActivityLog({ limit: 1500 }) : Promise.resolve([])
      ]);
      if (!user) {
        window.showToast?.('User not found', 'error');
        return;
      }

      const projectMap = Object.fromEntries(projects.map(p => [p.id, p]));
      const createdBy = getTaskCreatedByMap(activity);
      const touchedIds = getUserTouchedTaskIds(activity, user.id);
      const ownedProjectIds = new Set(projects.filter(p => sameId(p.ownerId, user.id)).map(p => Number(p.id)));

      const createdTasks = tasks.filter(t => sameId(createdBy.get(Number(t.id)), user.id));
      const assignedTasks = tasks.filter(t => sameId(t.assigneeId, user.id));
      const involvedTasks = tasks.filter(t =>
        sameId(t.assigneeId, user.id) ||
        createdTasks.some(ct => sameId(ct.id, t.id)) ||
        touchedIds.has(Number(t.id)) ||
        ownedProjectIds.has(Number(t.projectId))
      );
      const completed = involvedTasks.filter(t => t.status === 'done');
      const overdue = involvedTasks.filter(t => t.dueDate && t.status !== 'done' && t.dueDate < new Date().toISOString().slice(0, 10));
      const touchedRows = activity.filter(a => sameId(a.userId, user.id)).slice(0, 18);

      const involvementReason = (task) => {
        const reasons = [];
        if (sameId(task.assigneeId, user.id)) reasons.push('assigned');
        if (createdTasks.some(t => sameId(t.id, task.id))) reasons.push('created');
        if (touchedIds.has(Number(task.id))) reasons.push('activity');
        if (ownedProjectIds.has(Number(task.projectId))) reasons.push('project owner');
        return reasons.length ? `Involved: ${reasons.join(', ')}` : '';
      };

      const completionRate = involvedTasks.length ? Math.round((completed.length / involvedTasks.length) * 100) : 0;
      const body = `
        <section class="block">
          <h2>User Profile</h2>
          <p><strong>${esc(userName(user))}</strong></p>
          <p>${esc(userLine(user))}</p>
          ${user.bio ? `<p>${esc(user.bio)}</p>` : ''}
          <div class="kpis">
            <div class="kpi"><strong>${involvedTasks.length}</strong><span>Involved tasks</span></div>
            <div class="kpi"><strong>${createdTasks.length}</strong><span>Created tasks</span></div>
            <div class="kpi"><strong>${completed.length}</strong><span>Completed tasks</span></div>
            <div class="kpi"><strong>${completionRate}%</strong><span>Completion rate</span></div>
          </div>
        </section>
        <section class="block">
          <h2>Project Profile</h2>
          <p>${esc(userName(user))} owns ${ownedProjectIds.size} project${ownedProjectIds.size === 1 ? '' : 's'} and is currently linked to ${involvedTasks.length} task${involvedTasks.length === 1 ? '' : 's'} through ownership, assignment, creation, or activity.</p>
        </section>
        <div class="grid">
          <section class="block tasks-block">
            <h2>Tasks and Status</h2>
            <h3>Tasks created by this user</h3>
            ${htmlList(createdTasks.map(t => taskItem(t, projectMap)), 'No created-task activity was found for this user.')}
            <h3 style="margin-top:18px">Tasks involved by this user</h3>
            ${htmlList(involvedTasks.map(t => taskItem(t, projectMap, involvementReason(t))), 'No involved tasks found.')}
          </section>
          <div class="side-stack">
            <section class="block status-block">
              <h2>Current Status</h2>
              <span class="status-pill">${completed.length}/${involvedTasks.length} completed</span>
              <div class="progress-track"><div class="progress-fill" style="width:${completionRate}%"></div></div>
              <table class="meta-table">
                <tr><td>Active</td><td>${involvedTasks.filter(t => t.status !== 'done').length}</td></tr>
                <tr><td>Overdue</td><td>${overdue.length}</td></tr>
                <tr><td>Last activity</td><td>${formatDateTime(touchedRows[0]?.createdAt)}</td></tr>
              </table>
            </section>
            <section class="block attachments-block">
              <h3>Recent Activity</h3>
              ${htmlList(touchedRows.map(row => `<li><strong>${esc(row.action || 'activity')} ${esc(row.entityType || '')}</strong><span>${esc(row.details || '')}</span><small>${esc(formatDateTime(row.createdAt))}</small></li>`), 'No recent activity found.')}
            </section>
          </div>
        </div>
        <section class="block remarks-block">
          <h2>Remarks</h2>
          <p class="remarks">${esc(overdue.length ? `${overdue.length} task(s) need attention. Review due dates and blocked work first.` : 'No automatic remarks. Use this space for manager comments after exporting.')}</p>
        </section>`;

      const title = `${userName(user)} Progress Report`;
      showReportPreview(title, reportShell(title, 'Individual progress and task involvement', body), `${safeFileName(userName(user))}-progress-report.html`);
    } catch (err) {
      console.error('[Reports] user report failed', err);
      window.showToast?.(`Report failed: ${err?.message || 'unknown error'}`, 'error');
    }
  }

  async function showProjectReportOptions(projectId) {
    const project = await window.DB.getProject(Number(projectId)).catch(() => null);
    if (!project) {
      window.showToast?.('Project not found', 'error');
      return;
    }
    window.showModal?.('Create project report', `
      <div class="report-options">
        <p class="text-muted text-sm" style="margin-bottom:14px">Generate a project report for <strong>${esc(project.name)}</strong>.</p>
        <div class="report-option-grid">
          <label class="report-choice">
            <input type="checkbox" id="report-full-documents">
            <span><strong>Include full documents</strong><small>Image documents will be embedded large. Other files are listed with names and links when available.</small></span>
          </label>
          <label class="report-choice">
            <input type="checkbox" id="report-activity" checked>
            <span><strong>Include activity remarks</strong><small>Add recent project activity to the remarks area.</small></span>
          </label>
        </div>
        <div class="form-group" style="margin-top:14px">
          <label>Additional remarks</label>
          <textarea id="report-remarks" rows="4" class="fixed-textarea" placeholder="Optional note to include at the end of the report"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" data-action="close-modal">Cancel</button>
          <button type="button" class="btn btn-primary" data-action="generate-project-report" data-project-id="${Number(projectId)}">Generate Report</button>
        </div>
      </div>`);
  }

  async function generateProjectReportFromModal(projectId) {
    const includeFullDocuments = !!document.getElementById('report-full-documents')?.checked;
    const includeActivity = !!document.getElementById('report-activity')?.checked;
    const remarks = document.getElementById('report-remarks')?.value || '';
    await generateProjectReport(projectId, { includeFullDocuments, includeActivity, remarks });
  }

  async function generateProjectReport(projectId, options = {}) {
    try {
      const pid = Number(projectId);
      const [project, tasks, milestones, users, attachments, activity] = await Promise.all([
        window.DB.getProject(pid),
        window.DB.getTasks({ projectId: pid }),
        window.DB.getMilestones(pid).catch(() => []),
        window.DB.getUsers(),
        window.DB.getAttachments(pid),
        options.includeActivity && window.DB.getActivityLog ? window.DB.getActivityLog({ projectId: pid, limit: 80 }) : Promise.resolve([])
      ]);
      if (!project) {
        window.showToast?.('Project not found', 'error');
        return;
      }

      const userMap = Object.fromEntries(users.map(u => [u.id, u]));
      const owner = userMap[project.ownerId];
      const normalizedAttachments = await normalizeAttachments(attachments, users, tasks);
      const progress = projectProgress(tasks);
      const done = tasks.filter(t => t.status === 'done').length;
      const activeTask = tasks.find(t => t.status === 'doing') || tasks.find(t => t.status !== 'done');
      const started = formatDate(project.createdAt);
      const ended = project.completedAt ? formatDate(project.completedAt) : 'Not completed';

      const attachmentCards = normalizedAttachments.map(att => `
        <div class="attachment-card">
          ${att.imageSrc ? `<img src="${esc(att.imageSrc)}" alt="${esc(att.fileName || 'Attachment')}">` : ''}
          <strong>${esc(att.fileName || 'File')}</strong>
          <span>${esc(att.mimeType || 'file')}</span>
          <span>${esc(att.taskName || 'Project file')}</span>
          <span>${esc(att.uploadedByName)}</span>
        </div>`).join('');

      const fullDocuments = options.includeFullDocuments
        ? normalizedAttachments.map(att => {
            if (att.imageSrc) {
              return `<figure class="full-document"><img src="${esc(att.imageSrc)}" alt="${esc(att.fileName || 'Document')}"><figcaption>${esc(att.fileName || 'Document')} | ${esc(att.taskName)}</figcaption></figure>`;
            }
            const link = att.url ? `<a href="${esc(att.url)}">${esc(att.fileName || 'Open file')}</a>` : esc(att.fileName || 'File');
            return `<div class="attachment-card full-document"><strong>${link}</strong><span>${esc(att.mimeType || 'file')}</span><span>${esc(att.taskName)}</span></div>`;
          }).join('')
        : '';

      const activityRemarks = options.includeActivity && activity.length
        ? activity.slice(0, 12).map(row => `${formatDateTime(row.createdAt)} - ${userName(userMap[row.userId])}: ${row.action || 'activity'} ${row.entityType || ''}${row.details ? ` - ${row.details}` : ''}`).join('\n')
        : '';

      const body = `
        <section class="block">
          <h2>User Profile</h2>
          <p><strong>${esc(userName(owner))}</strong></p>
          <p>${esc(userLine(owner))}</p>
          <p>Report generated by ${esc(userName(getSession()))}.</p>
        </section>
        <section class="block">
          <h2>Project Profile</h2>
          <p><strong>${esc(project.name || 'Untitled project')}</strong></p>
          <p>${esc(project.notes || 'No project description added.')}</p>
          <div class="kpis">
            <div class="kpi"><strong>${tasks.length}</strong><span>Total tasks</span></div>
            <div class="kpi"><strong>${done}</strong><span>Completed</span></div>
            <div class="kpi"><strong>${progress}%</strong><span>Progress</span></div>
            <div class="kpi"><strong>${attachments.length}</strong><span>Attachments</span></div>
          </div>
        </section>
        <div class="grid">
          <section class="block tasks-block">
            <h2>Tasks and Status</h2>
            ${htmlList(tasks.map(t => taskItem(t, {}, t.assigneeId ? `Assigned to ${userName(userMap[t.assigneeId])}` : 'Unassigned')), 'No tasks found for this project.')}
          </section>
          <div class="side-stack">
            <section class="block status-block">
              <h2>Current Status</h2>
              <span class="status-pill">${esc(statusLabel(project.status))}</span>
              <div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div>
              <table class="meta-table">
                <tr><td>Start date</td><td>${esc(started)}</td></tr>
                <tr><td>End date</td><td>${esc(ended)}</td></tr>
                <tr><td>Priority</td><td>${esc(priorityLabel(project.priority))}</td></tr>
                <tr><td>Current task</td><td>${esc(activeTask ? taskTitle(activeTask) : 'None')}</td></tr>
                <tr><td>Milestones</td><td>${milestones.length}</td></tr>
              </table>
            </section>
            <section class="block attachments-block">
              <h3>Attachments List</h3>
              ${normalizedAttachments.length ? `<div class="attachment-grid">${attachmentCards}</div>` : '<p class="empty">No attachments found.</p>'}
            </section>
          </div>
        </div>
        ${options.includeFullDocuments && fullDocuments ? `<section class="block"><h2>Documents</h2>${fullDocuments}</section>` : ''}
        <section class="block remarks-block">
          <h2>Remarks</h2>
          <p class="remarks">${esc([options.remarks, activityRemarks].filter(Boolean).join('\n\n') || 'No remarks added.')}</p>
        </section>`;

      const title = `${project.name || 'Project'} Report`;
      window.hideModal?.();
      setTimeout(() => showReportPreview(title, reportShell(title, 'Project profile, task status, and attachments', body), `${safeFileName(project.name, 'project')}-report.html`), 0);
    } catch (err) {
      console.error('[Reports] project report failed', err);
      window.showToast?.(`Report failed: ${err?.message || 'unknown error'}`, 'error');
    }
  }

  window.WTReports = {
    generateCurrentUserReport,
    generateUserReport,
    showProjectReportOptions,
    generateProjectReportFromModal,
    generateProjectReport,
    printCurrentPreview
  };
})();
