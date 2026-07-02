/* reports-projects.js — comprehensive, admin-only project report generator.
 *
 * Reads through window.DB (offline-first). Generates a printable report for one
 * project, several hand-picked projects, or every project owned by a chosen
 * person — compiled into a single document you can Print / Save as PDF or download
 * as a self-contained .html. Each project section includes: overview, task
 * breakdown by status, attachments (counts by type + a detail table with file
 * name & format), contributors, a derived effort/time summary, and the activity
 * log. Admin-only (matches the admin Reports tab).
 *
 * Entry points:
 *   • Reports tab → "Export PDF" (window.OrbiProjectReport.open()).
 *   • window.OrbiProjectReport.open() / .generate(idOrIds) from the console.
 */
(function () {
  'use strict';

  var DB = function () { return window.DB || window.LocalDB; };
  function isAdmin() { try { return (window.getSession ? getSession()?.role : null) === 'admin'; } catch (_) { return false; } }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function fmtDate(v) { if (!v) return '—'; var d = new Date(v); return isNaN(d) ? '—' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
  function fmtDateTime(v) { if (!v) return '—'; var d = new Date(v); return isNaN(d) ? '—' : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  function daysBetween(a, b) { var d1 = new Date(a), d2 = new Date(b); if (isNaN(d1) || isNaN(d2)) return null; return Math.max(0, Math.round((d2 - d1) / 86400000)); }
  function fmtBytes(n) { n = Number(n); if (!n || isNaN(n)) return ''; var u = ['B', 'KB', 'MB', 'GB'], i = 0; while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; } return (n < 10 && i > 0 ? n.toFixed(1) : Math.round(n)) + ' ' + u[i]; }
  function attSize(a) { return a.size != null ? a.size : (a.fileSize != null ? a.fileSize : (a.bytes != null ? a.bytes : (a.blob && a.blob.size) || null)); }
  function slug(s) { return String(s || 'report').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'report'; }

  var TYPE_MAP = {
    image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'heic', 'tiff'], pdf: ['pdf'],
    document: ['doc', 'docx', 'odt', 'rtf', 'pages'], spreadsheet: ['xls', 'xlsx', 'csv', 'ods', 'numbers'],
    presentation: ['ppt', 'pptx', 'key', 'odp'], archive: ['zip', 'rar', '7z', 'tar', 'gz'],
    text: ['txt', 'md', 'log', 'json', 'xml', 'yml', 'yaml'], cad: ['dwg', 'dxf', 'step', 'stp', 'iges', 'igs', 'sldprt', 'stl', 'f3d'],
    video: ['mp4', 'mov', 'avi', 'mkv', 'webm'], audio: ['mp3', 'wav', 'ogg', 'm4a'],
  };
  function extOf(name) { var m = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/); return m ? m[1] : ''; }
  function attKind(a) {
    var ext = extOf(a.fileName || a.name || '');
    for (var k in TYPE_MAP) if (TYPE_MAP[k].indexOf(ext) !== -1) return k;
    var mt = String(a.mimeType || '').toLowerCase();
    if (mt.indexOf('image/') === 0) return 'image'; if (mt.indexOf('video/') === 0) return 'video';
    if (mt.indexOf('audio/') === 0) return 'audio'; if (mt.indexOf('pdf') !== -1) return 'pdf';
    if (a.documentType) return String(a.documentType).toLowerCase();
    return ext || 'other';
  }
  function userName(u) { return u ? (u.displayName || u.username || ('User ' + u.id)) : 'Unknown'; }

  async function fetchShared() {
    var db = DB();
    var projects = (await (db.getProjects ? db.getProjects() : [])) || [];
    var tasks = (await (db.getTasks ? db.getTasks() : [])) || [];
    var users = []; try { users = (await (db.getUsers ? db.getUsers() : [])) || []; } catch (_) {}
    var activity = []; try { activity = (await (db.getActivityLog ? db.getActivityLog({ limit: 20000 }) : [])) || []; } catch (_) {}
    var userById = {}; users.forEach(function (u) { userById[Number(u.id)] = u; });
    return { projects: projects, tasks: tasks, users: users, userById: userById, activity: activity };
  }

  async function gatherMany(ids, shared) {
    var db = DB();
    shared = shared || await fetchShared();
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      var pid = Number(ids[i]);
      var project = shared.projects.find(function (p) { return Number(p.id) === pid; });
      if (!project) continue;
      var tasks = shared.tasks.filter(function (t) { return Number(t.projectId) === pid; });
      var taskIds = {}; tasks.forEach(function (t) { taskIds[Number(t.id)] = true; });
      var acts = shared.activity.filter(function (a) { return Number(a.projectId) === pid || (a.entityType === 'task' && taskIds[Number(a.entityId)]); });
      acts.sort(function (a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); });
      var attachments = []; try { attachments = (await db.getAttachments(pid)) || []; } catch (_) {}
      var milestones = []; try { if (db.getMilestones) milestones = (await db.getMilestones(pid)) || []; } catch (_) {}
      out.push({ project: project, tasks: tasks, attachments: attachments, activity: acts, milestones: milestones, userById: shared.userById });
    }
    return out;
  }

  function compute(d) {
    var tasks = d.tasks;
    var byStatus = {}; tasks.forEach(function (t) { (byStatus[t.status] || (byStatus[t.status] = [])).push(t); });
    var doneCount = (byStatus.done || []).length;
    var pct = tasks.length ? Math.round(doneCount / tasks.length * 100) : 0;
    var kindCounts = {}, totalBytes = 0;
    d.attachments.forEach(function (a) { var k = attKind(a); kindCounts[k] = (kindCounts[k] || 0) + 1; var s = attSize(a); if (s) totalBytes += Number(s); });
    var end = d.project.completedAt || new Date().toISOString();
    var lifespan = daysBetween(d.project.createdAt, end);
    var times = d.activity.map(function (a) { return a.createdAt; }).filter(Boolean).slice().sort();
    var firstAct = times[0] || null, lastAct = times[times.length - 1] || null;
    var activeDays = {}; d.activity.forEach(function (a) { if (a.createdAt) activeDays[String(a.createdAt).slice(0, 10)] = true; });
    var contrib = {}; d.activity.forEach(function (a) { var u = Number(a.userId); if (u) contrib[u] = (contrib[u] || 0) + 1; });
    tasks.forEach(function (t) { if (t.assigneeId) contrib[Number(t.assigneeId)] = contrib[Number(t.assigneeId)] || 0; });
    return {
      byStatus: byStatus, doneCount: doneCount, pct: pct, kindCounts: kindCounts, totalBytes: totalBytes,
      lifespan: lifespan, firstAct: firstAct, lastAct: lastAct,
      activeSpan: firstAct && lastAct ? daysBetween(firstAct, lastAct) : null,
      activeDays: Object.keys(activeDays).length, activityCount: d.activity.length, contrib: contrib,
    };
  }

  function projectSection(d, first) {
    var p = d.project, c = compute(d), u = d.userById;
    var kindRows = Object.keys(c.kindCounts).sort(function (a, b) { return c.kindCounts[b] - c.kindCounts[a]; })
      .map(function (k) { return '<tr><td>' + esc(k) + '</td><td class="r">' + c.kindCounts[k] + '</td></tr>'; }).join('');
    var attRows = d.attachments.map(function (a) {
      var task = a.taskId ? d.tasks.find(function (t) { return Number(t.id) === Number(a.taskId); }) : null;
      var fmt = extOf(a.fileName || a.name || '') || attKind(a);
      return '<tr><td>' + esc(a.fileName || a.name || 'file') + '</td><td>' + esc(fmt.toUpperCase()) + '</td><td>' + esc(attKind(a)) + '</td><td>' + esc(fmtBytes(attSize(a)) || '—')
        + '</td><td>' + esc(userName(u[Number(a.uploadedBy)])) + '</td><td>' + esc(fmtDate(a.createdAt)) + '</td><td>'
        + esc(task ? task.title : (a.taskId ? 'task #' + a.taskId : 'project')) + '</td></tr>';
    }).join('') || '<tr><td colspan="7" class="muted">No attachments.</td></tr>';
    var contribRows = Object.keys(c.contrib).sort(function (a, b) { return c.contrib[b] - c.contrib[a]; }).map(function (uid) {
      var assigned = d.tasks.filter(function (t) { return Number(t.assigneeId) === Number(uid); }).length;
      return '<tr><td>' + esc(userName(u[Number(uid)])) + '</td><td class="r">' + c.contrib[uid] + '</td><td class="r">' + assigned + '</td></tr>';
    }).join('') || '<tr><td colspan="3" class="muted">No recorded activity.</td></tr>';
    function taskRows(list) {
      return (list || []).map(function (t) { return '<tr><td>' + esc(t.title || 'Untitled') + '</td><td>' + esc(t.notes || t.description || '') + '</td><td>' + esc(userName(u[Number(t.assigneeId)])) + '</td><td>' + esc(t.priority || '—') + '</td><td>' + esc(fmtDate(t.dueDate)) + '</td><td>' + esc(fmtDate(t.createdAt)) + '</td></tr>'; }).join('') || '<tr><td colspan="6" class="muted">None.</td></tr>';
    }
    var taskSections = [['doing', 'In progress'], ['todo', 'To do'], ['blocked', 'Blocked'], ['done', 'Done']]
      .filter(function (s) { return (c.byStatus[s[0]] || []).length; })
      .map(function (s) { return '<h3>' + esc(s[1]) + ' <span class="badge">' + c.byStatus[s[0]].length + '</span></h3><table class="tbl"><thead><tr><th>Task</th><th>Description</th><th>Assignee</th><th>Priority</th><th>Due</th><th>Created</th></tr></thead><tbody>' + taskRows(c.byStatus[s[0]]) + '</tbody></table>'; }).join('');
    var logRows = d.activity.map(function (a) {
      return '<tr><td>' + esc(fmtDateTime(a.createdAt)) + '</td><td>' + esc(userName(u[Number(a.userId)])) + '</td><td>' + esc((a.action || '') + (a.entityType ? ' ' + a.entityType : '')) + '</td><td>' + esc(a.details || '') + '</td></tr>';
    }).join('') || '<tr><td colspan="4" class="muted">No activity logged.</td></tr>';

    return '<section class="project' + (first ? ' first' : '') + '">'
      + '<h1>' + esc(p.name || 'Project') + '</h1>'
      + '<p class="sub"><span class="pill">' + esc(p.status || 'active') + '</span> ' + esc(p.type || 'project') + (p.department ? ' · ' + esc(p.department) : '') + ' · Owner: ' + esc(userName(u[Number(p.ownerId)])) + '</p>'
      + '<div class="grid">'
      + '<div class="card"><div class="k">Tasks</div><div class="v">' + d.tasks.length + '</div></div>'
      + '<div class="card"><div class="k">Completed</div><div class="v">' + c.doneCount + ' <span class="vs">(' + c.pct + '%)</span></div></div>'
      + '<div class="card"><div class="k">Attachments</div><div class="v">' + d.attachments.length + '</div></div>'
      + '<div class="card"><div class="k">Milestones</div><div class="v">' + d.milestones.length + '</div></div>'
      + '</div>'
      + '<h2>Overview</h2><table class="tbl"><tbody>'
      + '<tr><th>Created</th><td>' + esc(fmtDateTime(p.createdAt)) + '</td><th>Completed</th><td>' + esc(p.completedAt ? fmtDateTime(p.completedAt) : '—') + '</td></tr>'
      + '<tr><th>Priority</th><td>' + esc(p.priority || '—') + '</td><th>Progress</th><td>' + c.pct + '%</td></tr>'
      + (p.notes ? '<tr><th>Notes</th><td colspan="3">' + esc(p.notes) + '</td></tr>' : '') + '</tbody></table>'
      + '<div class="two"><div><h2>Attachments by type</h2><table class="tbl"><thead><tr><th>Type</th><th class="r">Count</th></tr></thead><tbody>'
      + (kindRows || '<tr><td colspan="2" class="muted">No attachments.</td></tr>')
      + '<tr><td><b>Total</b></td><td class="r"><b>' + d.attachments.length + '</b>' + (c.totalBytes ? ' · ' + fmtBytes(c.totalBytes) : '') + '</td></tr></tbody></table></div>'
      + '<div><h2>Effort &amp; time <span class="note">(derived)</span></h2><table class="tbl"><tbody>'
      + '<tr><th>Lifespan</th><td>' + (c.lifespan != null ? c.lifespan + ' days' : '—') + '</td></tr>'
      + '<tr><th>First activity</th><td>' + esc(fmtDateTime(c.firstAct)) + '</td></tr>'
      + '<tr><th>Last activity</th><td>' + esc(fmtDateTime(c.lastAct)) + '</td></tr>'
      + '<tr><th>Active window</th><td>' + (c.activeSpan != null ? c.activeSpan + ' days' : '—') + '</td></tr>'
      + '<tr><th>Active days</th><td>' + c.activeDays + '</td></tr>'
      + '<tr><th>Activity events</th><td>' + c.activityCount + '</td></tr></tbody></table>'
      + '<p class="note">Wall-clock time isn\'t tracked per project; estimated from activity-log timestamps.</p></div></div>'
      + '<h2>Contributors</h2><table class="tbl"><thead><tr><th>Person</th><th class="r">Activity events</th><th class="r">Tasks assigned</th></tr></thead><tbody>' + contribRows + '</tbody></table>'
      + '<h2>Tasks</h2>' + (taskSections || '<p class="muted">No tasks.</p>')
      + '<h2>Documents</h2><table class="tbl"><thead><tr><th>File</th><th>Format</th><th>Category</th><th>Size</th><th>Uploaded by</th><th>Date</th><th>Linked to</th></tr></thead><tbody>' + attRows + '</tbody></table>'
      + '<h2>Activity log</h2><table class="tbl"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Details</th></tr></thead><tbody>' + logRows + '</tbody></table>'
      + '</section>';
  }

  function portfolioSummary(datas, title) {
    var totTasks = 0, totDone = 0, totAtt = 0;
    var rows = datas.map(function (d) {
      var c = compute(d);
      totTasks += d.tasks.length; totDone += c.doneCount; totAtt += d.attachments.length;
      return '<tr><td>' + esc(d.project.name || 'Project') + '</td><td>' + esc(d.project.status || 'active') + '</td><td>' + esc(userName(d.userById[Number(d.project.ownerId)]))
        + '</td><td class="r">' + d.tasks.length + '</td><td class="r">' + c.pct + '%</td><td class="r">' + d.attachments.length + '</td><td>' + esc(fmtDate(d.project.createdAt)) + '</td></tr>';
    }).join('');
    return '<section class="project first"><h1>' + esc(title) + '</h1>'
      + '<p class="sub">' + datas.length + ' projects · Report generated ' + esc(fmtDateTime(new Date().toISOString())) + '</p>'
      + '<div class="grid">'
      + '<div class="card"><div class="k">Projects</div><div class="v">' + datas.length + '</div></div>'
      + '<div class="card"><div class="k">Total tasks</div><div class="v">' + totTasks + '</div></div>'
      + '<div class="card"><div class="k">Completed</div><div class="v">' + totDone + ' <span class="vs">(' + (totTasks ? Math.round(totDone / totTasks * 100) : 0) + '%)</span></div></div>'
      + '<div class="card"><div class="k">Attachments</div><div class="v">' + totAtt + '</div></div></div>'
      + '<h2>Projects in this report</h2><table class="tbl"><thead><tr><th>Project</th><th>Status</th><th>Owner</th><th class="r">Tasks</th><th class="r">Done</th><th class="r">Files</th><th>Created</th></tr></thead><tbody>' + rows + '</tbody></table></section>';
  }

  function wrapDoc(title, inner) {
    var css = 'body{font:13px/1.5 Inter,system-ui,Arial,sans-serif;color:#1f2430;margin:0;padding:32px;background:#fff}'
      + 'h1{font-size:22px;margin:0 0 2px}h2{font-size:15px;margin:24px 0 10px;padding-bottom:6px;border-bottom:2px solid #e6e8f0;color:#4f46e5}'
      + 'h3{font-size:13px;margin:16px 0 6px;color:#374151}.sub{color:#8a90a2;margin:0 0 16px}'
      + '.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:10px 0 4px}'
      + '.card{border:1px solid #e6e8f0;border-radius:10px;padding:12px 14px}.card .k{font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#8a90a2}'
      + '.card .v{font-size:20px;font-weight:800;margin-top:4px}.card .vs{font-size:12px;color:#8a90a2;font-weight:600}'
      + 'table.tbl{width:100%;border-collapse:collapse;margin:4px 0 8px;font-size:12px}'
      + '.tbl th{text-align:left;background:#f4f5fa;color:#5b6172;font-weight:700;padding:7px 9px;border-bottom:1px solid #e6e8f0}'
      + '.tbl td{padding:6px 9px;border-bottom:1px solid #f0f1f6;vertical-align:top}.tbl td.r,.tbl th.r{text-align:right}'
      + '.two{display:grid;grid-template-columns:1fr 1fr;gap:24px}.badge{background:#eef0ff;color:#4f46e5;border-radius:999px;padding:1px 8px;font-size:11px;font-weight:700}'
      + '.muted{color:#9aa0b2}.note{font-size:11px;color:#9aa0b2;font-style:italic}.pill{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:700;background:#eef0f7;color:#5b6172}'
      + '.project:not(.first){break-before:page;padding-top:8px}'
      + '@media print{body{padding:0}h2{break-after:avoid}tr{break-inside:avoid}}';
    return '<!doctype html><html><head><meta charset="utf-8"><title>' + esc(title) + '</title><style>' + css + '</style></head><body>' + inner + '</body></html>';
  }

  function buildDoc(datas, title) {
    if (datas.length === 1) return { html: wrapDoc(title, projectSection(datas[0], true)), file: slug(datas[0].project.name) + '-report' };
    var inner = portfolioSummary(datas, title) + datas.map(function (d) { return projectSection(d, false); }).join('');
    return { html: wrapDoc(title, inner), file: slug(title) };
  }

  function showPreview(html, title, fileName) {
    var old = document.getElementById('opr-overlay'); if (old) old.remove();
    var ov = document.createElement('div');
    ov.id = 'opr-overlay';
    ov.style.cssText = 'position:fixed;inset:0;z-index:12000;background:rgba(15,20,35,.55);display:flex;flex-direction:column;padding:3vh 3vw;font-family:Inter,system-ui,sans-serif';
    ov.innerHTML = '<div style="background:#fff;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;flex:1;box-shadow:0 30px 90px rgba(0,0,0,.4)">'
      + '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #e6e8f0;font-weight:600;color:#1f2430">'
      + '<b style="flex:1">' + esc(title) + '</b>'
      + '<button data-opr-print style="border:none;background:#6366f1;color:#fff;border-radius:9px;padding:8px 14px;font-weight:700;cursor:pointer">Print / Save as PDF</button>'
      + '<button data-opr-dl style="border:1px solid #d3d7e3;background:#fff;color:#374151;border-radius:9px;padding:8px 14px;font-weight:700;cursor:pointer">Download .html</button>'
      + '<button data-opr-close style="border:1px solid #e6e8f0;background:#fff;border-radius:9px;width:34px;height:34px;font-size:18px;cursor:pointer;color:#5b6172">×</button></div>'
      + '<iframe data-opr-frame style="flex:1;border:0;width:100%;background:#fff"></iframe></div>';
    document.body.appendChild(ov);
    var frame = ov.querySelector('[data-opr-frame]'); frame.srcdoc = html;
    ov.querySelector('[data-opr-close]').onclick = function () { ov.remove(); };
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
    ov.querySelector('[data-opr-print]').onclick = function () { try { frame.contentWindow.focus(); frame.contentWindow.print(); } catch (_) {} };
    ov.querySelector('[data-opr-dl]').onclick = function () {
      var blob = new Blob([html], { type: 'text/html' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = (fileName || 'report') + '.html';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    };
    var onEsc = function (e) { if (e.key === 'Escape') { ov.remove(); window.removeEventListener('keydown', onEsc); } };
    window.addEventListener('keydown', onEsc);
  }

  async function open() {
    if (!isAdmin()) { try { window.showToast?.('Reports are available to admins only.', 'info'); } catch (_) {} return; }
    var db = DB();
    if (!db || !db.getProjects) { alert('Project data not available yet.'); return; }
    var shared = await fetchShared();
    var projects = shared.projects.slice().sort(function (a, b) { return (b.createdAt || '').localeCompare(a.createdAt || ''); });
    var owners = {}; projects.forEach(function (p) { if (p.ownerId != null) owners[Number(p.ownerId)] = true; });
    var ownerOpts = '<option value="">All owners</option>' + Object.keys(owners).map(function (id) { return '<option value="' + id + '">' + esc(userName(shared.userById[Number(id)])) + '</option>'; }).join('');
    var statuses = {}; projects.forEach(function (p) { statuses[p.status || 'active'] = true; });
    var statusOpts = '<option value="">All statuses</option>' + Object.keys(statuses).map(function (s) { return '<option value="' + esc(s) + '">' + esc(s) + '</option>'; }).join('');

    var selected = {};
    var old = document.getElementById('opr-picker'); if (old) old.remove();
    var ov = document.createElement('div');
    ov.id = 'opr-picker';
    ov.style.cssText = 'position:fixed;inset:0;z-index:12000;background:rgba(15,20,35,.55);display:flex;align-items:center;justify-content:center;font-family:Inter,system-ui,sans-serif';
    ov.innerHTML = '<div style="background:#fff;border-radius:14px;width:min(560px,94vw);max-height:82vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.4)">'
      + '<div style="padding:14px 16px;border-bottom:1px solid #e6e8f0;font-weight:800;color:#1f2430">Generate project report</div>'
      + '<div style="display:flex;gap:8px;padding:12px 16px 6px;flex-wrap:wrap">'
      + '<select data-opr-owner style="flex:1;min-width:150px;padding:8px 9px;border:1px solid #d3d7e3;border-radius:8px;font-size:13px">' + ownerOpts + '</select>'
      + '<select data-opr-status style="padding:8px 9px;border:1px solid #d3d7e3;border-radius:8px;font-size:13px">' + statusOpts + '</select></div>'
      + '<input data-opr-search placeholder="Filter by name…" style="margin:0 16px;padding:8px 10px;border:1px solid #d3d7e3;border-radius:8px;font-size:13px;outline:none">'
      + '<label style="display:flex;align-items:center;gap:7px;padding:8px 16px 2px;font-size:12px;color:#5b6172;cursor:pointer"><input type="checkbox" data-opr-all> Select all shown</label>'
      + '<div data-opr-list style="overflow:auto;padding:6px 12px 8px;display:flex;flex-direction:column;gap:3px;flex:1"></div>'
      + '<div style="display:flex;align-items:center;gap:10px;padding:12px 16px;border-top:1px solid #e6e8f0">'
      + '<span data-opr-count style="flex:1;font-size:12px;color:#8a90a2">0 selected</span>'
      + '<button data-opr-go style="border:none;background:#6366f1;color:#fff;border-radius:9px;padding:9px 16px;font-weight:750;cursor:pointer">Generate report</button></div></div>';
    document.body.appendChild(ov);

    var listEl = ov.querySelector('[data-opr-list]');
    var ownerSel = ov.querySelector('[data-opr-owner]');
    var statusSel = ov.querySelector('[data-opr-status]');
    var searchEl = ov.querySelector('[data-opr-search]');
    var allEl = ov.querySelector('[data-opr-all]');
    var countEl = ov.querySelector('[data-opr-count]');
    function visible() {
      var o = ownerSel.value, s = statusSel.value, f = (searchEl.value || '').toLowerCase();
      return projects.filter(function (p) {
        if (o && String(p.ownerId) !== o) return false;
        if (s && (p.status || 'active') !== s) return false;
        if (f && String(p.name || '').toLowerCase().indexOf(f) === -1) return false;
        return true;
      });
    }
    function updateCount() { countEl.textContent = Object.keys(selected).filter(function (k) { return selected[k]; }).length + ' selected'; }
    function render() {
      var vis = visible();
      listEl.innerHTML = vis.map(function (p) {
        return '<label style="display:flex;align-items:center;gap:9px;border:1px solid #eef0f7;background:#fbfcfe;border-radius:9px;padding:9px 11px;cursor:pointer;font-size:13px;color:#1f2430">'
          + '<input type="checkbox" data-id="' + p.id + '"' + (selected[p.id] ? ' checked' : '') + '>'
          + '<span style="flex:1"><b style="font-weight:650">' + esc(p.name || 'Untitled') + '</b> <span style="color:#9aa0b2">· ' + esc(p.status || 'active') + ' · ' + esc(userName(shared.userById[Number(p.ownerId)])) + '</span></span></label>';
      }).join('') || '<div style="color:#9aa0b2;padding:10px">No projects match.</div>';
      listEl.querySelectorAll('input[data-id]').forEach(function (cb) { cb.onchange = function () { selected[cb.dataset.id] = cb.checked; updateCount(); }; });
      allEl.checked = vis.length > 0 && vis.every(function (p) { return selected[p.id]; });
    }
    ownerSel.onchange = render; statusSel.onchange = render;
    searchEl.addEventListener('input', render);
    allEl.onchange = function () { visible().forEach(function (p) { selected[p.id] = allEl.checked; }); updateCount(); render(); };
    ov.querySelector('[data-opr-go]').onclick = function () {
      var ids = Object.keys(selected).filter(function (k) { return selected[k]; }).map(Number);
      if (!ids.length) { countEl.textContent = 'Pick at least one project'; return; }
      var title = ids.length === 1 ? null : (ownerSel.value ? userName(shared.userById[Number(ownerSel.value)]) + ' — Projects Report' : 'Projects Report (' + ids.length + ')');
      ov.remove();
      generate(ids, { title: title, shared: shared });
    };
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
    var onEsc = function (e) { if (e.key === 'Escape') { ov.remove(); window.removeEventListener('keydown', onEsc); } };
    window.addEventListener('keydown', onEsc);
    render(); updateCount();
    setTimeout(function () { searchEl.focus(); }, 30);
  }

  async function generate(idOrIds, opts) {
    if (!isAdmin()) { try { window.showToast?.('Reports are available to admins only.', 'info'); } catch (_) {} return; }
    opts = opts || {};
    var ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    try {
      var datas = await gatherMany(ids, opts.shared);
      if (!datas.length) { alert('No matching projects found.'); return; }
      var title = opts.title || (datas.length === 1 ? (datas[0].project.name || 'Project') + ' — Report' : 'Projects Report (' + datas.length + ')');
      var doc = buildDoc(datas, title);
      showPreview(doc.html, title, doc.file);
    } catch (err) {
      alert('Could not build report: ' + (err && err.message || err));
    }
  }

  window.OrbiProjectReport = { open: open, generate: generate };
})();
