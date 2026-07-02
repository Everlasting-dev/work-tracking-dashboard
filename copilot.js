/* copilot.js — Orbitrack Copilot: a focused, local-AI (Ollama) assistant drawer.
 * Talks to the model only through the Electron main process (window.orbitrackAI),
 * with a direct localhost fallback for web/dev. Read-only in v1: it suggests,
 * it never silently changes data. */

(function () {
  const DEFAULT_MODEL = 'llama3.1:8b';
  const STATUS_TO_ORBIT = { todo: 'docked', doing: 'burning', review: 'burning', blocked: 'blocked', done: 'landed' };

  const QUICK_PROMPTS = [
    { key: 'plan-day', label: 'Plan my day' },
    { key: 'summarize-project', label: 'Summarize this project' },
    { key: 'find-blocked', label: 'Find blocked / overdue' },
    { key: 'create-from-note', label: 'Create tasks from a note' },
  ];

  const SYSTEM_PROMPT = [
    'You are Orbitrack Copilot, a focused work assistant living inside a project and task tracker.',
    'Be concise, calm, and practical — think Linear, not a chatty assistant. Use short sections and tight bullets.',
    'Orbitrack task statuses: docked = not started, burning = in progress, blocked = stuck, landed = completed.',
    'You can help create projects and tasks, but only the app performs the write after the user clicks a Create button. Never claim you already created, updated, or deleted anything.',
    'When the user describes a body of work, offer to turn it into a project and briefly list the tasks you would propose.',
  ].join(' ');

  let state_ = {
    open: false,
    busy: false,
    model: DEFAULT_MODEL,
    connected: null, // null = unknown, true/false after status check
    messages: [],    // { role: 'user'|'assistant'|'note'|'proposal', content, html?, proposal? }
    pendingProposal: null,
  };

  const esc_ = (s) => (window.esc ? window.esc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));

  function orbitStatus(s) { return STATUS_TO_ORBIT[s] || s || 'docked'; }

  /* ── Transport ────────────────────────────────────────────────── */
  async function aiStatus() {
    if (window.orbitrackAI?.status) { try { return await window.orbitrackAI.status(); } catch (e) { return { ok: false, error: String(e) }; } }
    try {
      const res = await fetch('http://localhost:11434/api/tags');
      if (!res.ok) return { ok: false, error: 'Ollama status ' + res.status };
      const d = await res.json();
      return { ok: true, models: (d.models || []).map(m => m.name) };
    } catch (e) { return { ok: false, error: 'Ollama not reachable at localhost:11434' }; }
  }

  // Streaming transport. Resolves to { ok, content, error } once the stream ends.
  // Tokens arrive via handlers.onToken. A watchdog fails fast if the model hangs.
  function aiChatStream(messages, handlers = {}, opts = {}) {
    const model = opts.model || state_.model;
    if (window.orbitrackAI?.chatStream) {
      return new Promise((resolve) => {
        let cancel = () => {};
        let timer;
        const fail = (msg) => { clearTimeout(timer); try { cancel(); } catch (_) {} resolve({ ok: false, error: msg }); };
        const arm = (ms, msg) => { clearTimeout(timer); timer = setTimeout(() => fail(msg), ms); };
        arm(90000, 'The model took too long to respond — it may still be loading into memory. Try again in a moment, or use a lighter model like llama3.2:3b.');
        cancel = window.orbitrackAI.chatStream({ messages, model, temperature: opts.temperature }, {
          onToken: (t) => { arm(45000, 'The model stalled mid-response. Try again or switch models.'); handlers.onToken && handlers.onToken(t); },
          onDone: (full) => { clearTimeout(timer); resolve({ ok: true, content: full }); },
          onError: (e) => { clearTimeout(timer); resolve({ ok: false, error: e }); },
        });
      });
    }
    // Fallback: direct streaming fetch (web/dev, no Electron bridge).
    return (async () => {
      try {
        const res = await fetch('http://localhost:11434/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages, stream: true }) });
        if (!res.ok || !res.body) return { ok: false, error: 'Ollama error ' + res.status };
        const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = '', full = '';
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          buf += dec.decode(value, { stream: true }); let nl;
          while ((nl = buf.indexOf('\n')) !== -1) {
            const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1); if (!line) continue;
            try { const o = JSON.parse(line); const t = o?.message?.content || ''; if (t) { full += t; handlers.onToken && handlers.onToken(t); } if (o.done) return { ok: true, content: full }; } catch (_) {}
          }
        }
        return { ok: true, content: full };
      } catch (e) { return { ok: false, error: 'Ollama not reachable at localhost:11434' }; }
    })();
  }

  async function aiChat(messages, opts = {}) {
    const model = opts.model || state_.model;
    if (window.orbitrackAI?.chat) {
      try { return await window.orbitrackAI.chat({ messages, model, temperature: opts.temperature }); }
      catch (e) { return { ok: false, error: String(e) }; }
    }
    try {
      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false })
      });
      if (!res.ok) return { ok: false, error: 'Ollama error ' + res.status };
      const data = await res.json();
      return { ok: true, content: data?.message?.content || '', model };
    } catch (e) { return { ok: false, error: 'Ollama not reachable at localhost:11434' }; }
  }

  /* ── Data gathering (read-only) ───────────────────────────────── */
  async function loadWorkspace() {
    try {
      if (typeof getWorkspaceData === 'function') return await getWorkspaceData();
    } catch (_) {}
    try {
      const [projects, tasks, users] = await Promise.all([
        DB.getProjects ? DB.getProjects() : [],
        DB.getTasks ? DB.getTasks() : [],
        DB.getUsers ? DB.getUsers() : [],
      ]);
      return { projects: projects || [], tasks: tasks || [], users: users || [] };
    } catch (_) { return { projects: [], tasks: [], users: [] }; }
  }

  function taskLine(t, pMap) {
    const due = t.dueDate ? t.dueDate : 'no due date';
    const overdue = (window.isOverdue ? isOverdue(t.dueDate) : false) && t.status !== 'done';
    const proj = pMap[t.projectId]?.name || 'No project';
    return `- ${t.title || 'Untitled'} [${orbitStatus(t.status)}${overdue ? ', OVERDUE' : ''}] · priority: ${t.priority || 'medium'} · due: ${due} · project: ${proj}`;
  }

  async function buildPlanDayMessages() {
    const { projects, tasks } = await loadWorkspace();
    const pMap = Object.fromEntries(projects.map(p => [p.id, p]));
    const uid = window.getSession ? getSession()?.userId : null;
    let mine = tasks.filter(t => t.status !== 'done');
    const assigned = mine.filter(t => uid && Number(t.assigneeId) === Number(uid));
    if (assigned.length) mine = assigned;
    if (!mine.length) return { empty: true };
    const lines = mine.slice(0, 60).map(t => taskLine(t, pMap)).join('\n');
    const user = `Here are my open tasks:\n${lines}\n\nPlan my day. Pick the few things I should focus on now, ordered by urgency (overdue and blocked first, then high priority and soonest due dates). Give a short, scannable plan with reasons. Keep it under ~12 lines.`;
    return { messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: user }] };
  }

  async function buildSummarizeProjectMessages() {
    const pid = (typeof state !== 'undefined' && state) ? state.currentProjectId : null;
    if (!pid) return { needProject: true };
    const { projects, tasks } = await loadWorkspace();
    const project = projects.find(p => Number(p.id) === Number(pid));
    if (!project) return { needProject: true };
    const pMap = { [project.id]: project };
    const pt = tasks.filter(t => Number(t.projectId) === Number(pid));
    const counts = pt.reduce((a, t) => { const k = orbitStatus(t.status); a[k] = (a[k] || 0) + 1; return a; }, {});
    const lines = pt.slice(0, 80).map(t => taskLine(t, pMap)).join('\n') || '(no tasks)';
    const user = `Project: ${project.name}\nStatus counts: ${JSON.stringify(counts)}\nTasks:\n${lines}\n\nSummarize this project's progress: what's done, what's in motion, what's at risk (overdue/blocked), and the single most useful next step. Keep it tight.`;
    return { messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: user }] };
  }

  async function buildFindBlockedMessages() {
    const { projects, tasks } = await loadWorkspace();
    const pMap = Object.fromEntries(projects.map(p => [p.id, p]));
    const flagged = tasks.filter(t => t.status !== 'done' && (t.status === 'blocked' || (window.isOverdue ? isOverdue(t.dueDate) : false)));
    if (!flagged.length) return { empty: true, emptyMsg: 'Nothing looks blocked or overdue right now. 🎉' };
    const lines = flagged.slice(0, 60).map(t => taskLine(t, pMap)).join('\n');
    const user = `These tasks are blocked or overdue:\n${lines}\n\nGroup them by what's likely holding them up and suggest how to unblock each. Be specific and brief.`;
    return { messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: user }] };
  }

  /* ── Agentic: propose a real project the user can create with one click ── */
  const CREATE_INTENT_RE = /\b(create|make|set ?up|start|build|spin up|add|generate|design|plan|draft|produce|scaffold|put together|come up with|whip up)\b[\s\S]{0,90}?\bproject\b/i;
  const PROPOSAL_SYSTEM = 'You are Orbitrack Copilot. Turn the conversation into ONE concrete project the user can create, and make it feel like a real small team is working on it. Give a short project name (max 6 words), a one-line description, and a priority (low, medium, or high). Then list the tasks discussed (up to 20 if the user asked for many, otherwise 3 to 8). For EACH task include: a short human title; a one-line "note" describing it; a "status" (one of exactly: "not started", "in progress", "blocked", "done"); a "priority" (low, medium, high); an "effort" estimate in days as a number; a "dueDate" as YYYY-MM-DD or an empty string; 1 to 3 "tags"; and "dependencies" as an array of the EXACT titles of other tasks in this list it depends on (empty array if none). Vary the statuses so some are done, some in progress, some blocked, and some not started. Use natural human wording. Respond with ONLY raw JSON, no markdown fences and no commentary, in EXACTLY this shape: {"project":{"name":"","description":"","priority":"medium"},"tasks":[{"title":"","note":"","status":"not started","priority":"medium","effort":3,"dueDate":"","tags":[],"dependencies":[]}]}';

  function extractJson(text) {
    if (!text) return null;
    const s = text.indexOf('{'), e = text.lastIndexOf('}');
    if (s === -1 || e === -1 || e <= s) return null;
    const raw = text.slice(s, e + 1);
    try { return JSON.parse(raw); } catch (_) {}
    try { return JSON.parse(raw.replace(/,(\s*[}\]])/g, '$1')); } catch (_) {}
    return null;
  }

  function normalizeProposal(obj) {
    if (!obj || typeof obj !== 'object') return null;
    const p = obj.project || obj;
    const name = String(p.name || obj.name || '').trim();
    if (!name) return null;
    const rawTasks = Array.isArray(obj.tasks) ? obj.tasks : (Array.isArray(p.tasks) ? p.tasks : []);
    const depTitle = (d) => String(typeof d === 'string' ? d : (d?.['task title'] || d?.title || d?.name || '')).trim();
    const toTags = (v) => Array.isArray(v) ? v.map(x => String(x).trim()).filter(Boolean)
      : (v ? String(v).split(',').map(x => x.trim()).filter(Boolean) : []);
    const tasks = rawTasks
      .map(t => (typeof t === 'string' ? { title: t } : t))
      .map(t => ({
        title: String(t?.title || t?.name || '').trim(),
        note: String(t?.note || t?.notes || t?.description || '').trim(),
        status: t?.status,
        priority: t?.priority,
        effort: t?.effort ?? t?.effortEstimate ?? t?.['effort estimate'],
        dueDate: t?.dueDate ?? t?.['due date'] ?? '',
        tags: toTags(t?.tags),
        dependencies: (Array.isArray(t?.dependencies) ? t.dependencies : (Array.isArray(t?.deps) ? t.deps : [])).map(depTitle).filter(Boolean)
      }))
      .filter(t => t.title)
      .slice(0, 24);
    return { name: name.slice(0, 120), description: String(p.description || p.notes || '').trim(), priority: p.priority, tasks };
  }

  async function proposeProject(sourceText) {
    if (state_.busy) return;
    const ctx = state_.messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map(m => `${m.role === 'user' ? 'User' : 'Copilot'}: ${m.content}`)
      .join('\n');
    const messages = [
      { role: 'system', content: PROPOSAL_SYSTEM },
      { role: 'user', content: `Conversation so far:\n${ctx || '(none)'}\n\nRequest: ${sourceText}\n\nReturn the project JSON now.` }
    ];
    state_.busy = true; render();
    const res = await aiChat(messages, { temperature: 0.3 });
    state_.busy = false;
    if (!res.ok) { state_.connected = false; state_.messages.push({ role: 'assistant', content: '', html: `<p class="copilot-error">${esc_(res.error || 'Could not reach the model.')}</p>` }); render(); return; }
    const spec = normalizeProposal(extractJson(res.content));
    if (!spec) { state_.messages.push({ role: 'assistant', content: res.content || 'I could not shape that into a project — try describing the work in a bit more detail.' }); render(); return; }
    // Offer the classrooms this user can create in, so they can pick one.
    try { spec._classrooms = window.copilotGetClassrooms ? await window.copilotGetClassrooms() : []; }
    catch (_) { spec._classrooms = []; }
    state_.pendingProposal = spec;
    state_.messages.push({ role: 'proposal', proposal: spec });
    render();
  }

  async function createFromProposal() {
    const spec = state_.pendingProposal;
    if (!spec) return;
    if (!window.copilotCreateProjectWithTasks) { state_.messages.push({ role: 'assistant', content: '', html: '<p class="copilot-error">Project creation is only available in the desktop app.</p>' }); render(); return; }
    // Read the chosen classroom before the re-render below removes the select.
    const roomSel = document.querySelector('#copilot-body [data-copilot-room]');
    const classroomId = roomSel && roomSel.value ? roomSel.value : undefined;
    state_.pendingProposal = null;
    const pm = [...state_.messages].reverse().find(m => m.role === 'proposal' && !m.applied);
    if (pm) pm.applied = true;
    state_.busy = true; render();
    try {
      const r = await window.copilotCreateProjectWithTasks(spec, { classroomId });
      state_.busy = false;
      state_.messages.push({ role: 'assistant', content: '', html: `<p>✅ Created <strong>${esc_(r.name)}</strong> with ${r.taskCount} task${r.taskCount === 1 ? '' : 's'}. Opening it…</p>` });
      render();
      setTimeout(() => { try { window.location.hash = '#/projects/' + r.id; } catch (_) {} close(); }, 800);
    } catch (e) {
      state_.busy = false;
      state_.messages.push({ role: 'assistant', content: '', html: `<p class="copilot-error">${esc_(e.message || 'Could not create the project.')}</p>` });
      render();
    }
  }

  function cancelProposal() {
    state_.pendingProposal = null;
    const pm = [...state_.messages].reverse().find(m => m.role === 'proposal' && !m.applied);
    if (pm) { pm.role = 'note'; pm.content = 'Suggestion dismissed.'; }
    render();
  }

  /* ── Rendering ────────────────────────────────────────────────── */
  function renderMarkdownLite(text) {
    let html = esc_(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`([^`]+?)`/g, '<code>$1</code>');
    // Bullet / numbered lines → list items wrapped in <ul>
    const lines = html.split(/\r?\n/);
    let out = '', inList = false;
    for (const raw of lines) {
      const line = raw.trimEnd();
      const m = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
      if (m) { if (!inList) { out += '<ul>'; inList = true; } out += `<li>${m[1]}</li>`; }
      else { if (inList) { out += '</ul>'; inList = false; } out += line ? `<p>${line}</p>` : ''; }
    }
    if (inList) out += '</ul>';
    return out || '<p></p>';
  }

  function statusPillHtml() {
    if (state_.connected === true) return `<span class="copilot-status copilot-status--ok" title="Connected to Ollama">${esc_(state_.model)}</span>`;
    if (state_.connected === false) return `<span class="copilot-status copilot-status--off" title="Ollama not reachable">offline</span>`;
    return `<span class="copilot-status">checking…</span>`;
  }

  function proposalHtml(m) {
    const p = m.proposal;
    const statusClass = (s) => 'copilot-tstatus copilot-tstatus--' + String(s || 'not started').toLowerCase().replace(/[^a-z]+/g, '-');
    const tasks = (p.tasks || []).map(t => `<li>
        ${t.status ? `<span class="${statusClass(t.status)}">${esc_(t.status)}</span>` : ''}
        <span class="copilot-tname">${esc_(t.title)}</span>
        ${t.priority ? `<span class="copilot-prio">${esc_(t.priority)}</span>` : ''}
        ${(t.tags && t.tags.length) ? `<span class="copilot-ttags">${esc_(t.tags.join(', '))}</span>` : ''}
      </li>`).join('');
    return `<div class="copilot-msg copilot-msg--ai"><div class="copilot-bubble copilot-proposal">
      <div class="copilot-proposal-head"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9L9.6 3.9A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>New project</div>
      <strong class="copilot-proposal-name">${esc_(p.name)}</strong>
      ${p.description ? `<p class="copilot-proposal-desc">${esc_(p.description)}</p>` : ''}
      <div class="copilot-proposal-count">${(p.tasks || []).length} task${(p.tasks || []).length === 1 ? '' : 's'}</div>
      <ul class="copilot-proposal-tasks">${tasks}</ul>
      ${(!m.applied && p._classrooms && p._classrooms.length)
        ? `<label class="copilot-room-field"><span>Classroom</span>
            <select class="copilot-room-select" data-copilot-room>
              ${p._classrooms.map(r => `<option value="${esc_(String(r.id))}">${esc_(r.name)}</option>`).join('')}
            </select></label>`
        : ''}
      ${m.applied
        ? '<div class="copilot-proposal-applied">✅ Created</div>'
        : `<div class="copilot-proposal-actions">
            <button type="button" class="copilot-btn copilot-btn--primary" data-copilot-action="create-project">Create project</button>
            <button type="button" class="copilot-btn" data-copilot-action="cancel-proposal">Cancel</button>
          </div>`}
    </div></div>`;
  }

  function messageHtml(m) {
    if (m.role === 'user') return `<div class="copilot-msg copilot-msg--user"><div class="copilot-bubble">${esc_(m.content)}</div></div>`;
    if (m.role === 'proposal') return proposalHtml(m);
    if (m.role === 'assistant') return `<div class="copilot-msg copilot-msg--ai"${m.mid ? ` data-mid="${m.mid}"` : ''}><div class="copilot-bubble">${m.html || renderMarkdownLite(m.content) || '<span class="copilot-caret"></span>'}</div></div>`;
    return `<div class="copilot-msg copilot-msg--note">${esc_(m.content)}</div>`;
  }

  function render() {
    const body = document.getElementById('copilot-body');
    if (!body) return;
    const head = document.getElementById('copilot-statuswrap');
    if (head) head.innerHTML = statusPillHtml();
    if (!state_.messages.length) {
      body.innerHTML = `<div class="copilot-welcome">
        <div class="copilot-welcome-mark"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9z"/></svg></div>
        <strong>Orbitrack Copilot</strong>
        <p>Your local AI work assistant. Try a quick action below — it reads your tasks and suggests, it never changes anything on its own.</p>
      </div>`;
    } else {
      body.innerHTML = state_.messages.map(messageHtml).join('') + (state_.busy ? `<div class="copilot-msg copilot-msg--ai"><div class="copilot-bubble copilot-typing"><span></span><span></span><span></span></div></div>` : '');
    }
    body.scrollTop = body.scrollHeight;
  }

  /* ── Flow ─────────────────────────────────────────────────────── */
  async function ensureStatus() {
    const s = await aiStatus();
    state_.connected = !!s.ok;
    if (s.ok && Array.isArray(s.models) && s.models.length && !s.models.includes(state_.model)) {
      state_.model = s.models[0];
    }
    render();
  }

  let _msgSeq = 0;
  function updateStreamingBubble(msg) {
    const el = document.querySelector(`[data-mid="${msg.mid}"] .copilot-bubble`);
    if (el) el.innerHTML = renderMarkdownLite(msg.content) || '<span class="copilot-caret"></span>';
    const body = document.getElementById('copilot-body');
    if (body) body.scrollTop = body.scrollHeight;
  }

  // Streams an assistant reply token-by-token into a live bubble.
  async function sendMessages(messages) {
    if (state_.busy) return;
    state_.busy = true;
    render();
    const msg = { role: 'assistant', content: '', streaming: true, mid: 'm' + (++_msgSeq) };
    let started = false;
    const res = await aiChatStream(messages, {
      onToken: (tok) => {
        if (!started) { started = true; state_.busy = false; state_.messages.push(msg); render(); }
        msg.content += tok;
        updateStreamingBubble(msg);
      }
    }, { temperature: 0.4 });
    state_.busy = false;
    if (!started) {
      if (res.ok && (res.content || '').trim()) { msg.content = res.content; msg.streaming = false; state_.messages.push(msg); }
      else if (res.ok) { state_.messages.push({ role: 'assistant', content: '', html: '<p class="copilot-error">The model returned an empty response.</p><p class="copilot-error-hint">Try a stronger model like <code>llama3.1:8b</code> (<code>ollama pull llama3.1:8b</code>).</p>' }); }
      else { state_.connected = false; state_.messages.push({ role: 'assistant', content: '', html: `<p class="copilot-error">${esc_(res.error || 'The local model could not respond.')}</p><p class="copilot-error-hint">Make sure Ollama is running (<code>ollama serve</code>) and a model is pulled.</p>` }); }
      render();
      return;
    }
    msg.streaming = false;
    render();
  }

  async function runQuickPrompt(key) {
    if (state_.busy) return;
    let built, label = QUICK_PROMPTS.find(q => q.key === key)?.label || key;
    if (key === 'plan-day') { state_.messages.push({ role: 'user', content: 'Plan my day' }); built = await buildPlanDayMessages(); }
    else if (key === 'summarize-project') { state_.messages.push({ role: 'user', content: 'Summarize this project' }); built = await buildSummarizeProjectMessages(); }
    else if (key === 'find-blocked') { state_.messages.push({ role: 'user', content: 'Find blocked or overdue tasks' }); built = await buildFindBlockedMessages(); }
    else if (key === 'create-from-note') {
      const note = window.prompt('Paste your rough note — I\'ll turn it into a project you can create:');
      if (!note || !note.trim()) return;
      state_.messages.push({ role: 'user', content: 'Create a project from this note:\n' + note.trim() });
      render();
      await proposeProject('Create a project and tasks from this note:\n' + note.trim());
      return;
    }
    if (built?.needProject) { state_.messages.push({ role: 'assistant', content: '', html: '<p>Open a project first, then ask me to summarize it.</p>' }); render(); return; }
    if (built?.empty) { state_.messages.push({ role: 'assistant', content: '', html: `<p>${esc_(built.emptyMsg || 'You have no open tasks right now.')}</p>` }); render(); return; }
    render();
    await sendMessages(built.messages);
  }

  async function handleSend() {
    const input = document.getElementById('copilot-input');
    if (!input) return;
    const text = (input.value || '').trim();
    if (!text || state_.busy) return;
    input.value = '';
    state_.messages.push({ role: 'user', content: text });
    // If they're asking to create a project, switch to the structured proposal flow.
    if (CREATE_INTENT_RE.test(text)) { render(); await proposeProject(text); return; }
    // Give the model lightweight task context so answers are grounded, not generic.
    const { projects, tasks } = await loadWorkspace();
    const pMap = Object.fromEntries(projects.map(p => [p.id, p]));
    const open = tasks.filter(t => t.status !== 'done').slice(0, 40).map(t => taskLine(t, pMap)).join('\n');
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: `Current open tasks for context (may be empty):\n${open || '(none)'}` },
      ...state_.messages.filter(m => m.role !== 'note').slice(-8).map(m => ({ role: m.role, content: m.content })),
    ];
    render();
    await sendMessages(messages);
  }

  /* ── DOM / open-close ─────────────────────────────────────────── */
  function ensureDom() {
    if (document.getElementById('copilot-drawer')) return;
    const backdrop = document.createElement('div');
    backdrop.id = 'copilot-backdrop';
    backdrop.className = 'copilot-backdrop hidden';
    backdrop.addEventListener('click', close);

    const drawer = document.createElement('aside');
    drawer.id = 'copilot-drawer';
    drawer.className = 'copilot-drawer hidden';
    drawer.setAttribute('aria-label', 'Orbitrack Copilot');
    drawer.innerHTML = `
      <header class="copilot-header">
        <div class="copilot-title">
          <span class="copilot-title-mark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z"/></svg></span>
          <div><strong>Copilot</strong><span id="copilot-statuswrap" class="copilot-statuswrap">${statusPillHtml()}</span></div>
        </div>
        <button type="button" class="copilot-close" id="copilot-close" aria-label="Close Copilot">&times;</button>
      </header>
      <div class="copilot-quickrow">
        ${QUICK_PROMPTS.map(q => `<button type="button" class="copilot-chip" data-copilot-prompt="${q.key}">${esc_(q.label)}</button>`).join('')}
      </div>
      <div class="copilot-body" id="copilot-body"></div>
      <form class="copilot-inputbar" id="copilot-form">
        <input type="text" id="copilot-input" class="copilot-input" placeholder="Ask the Copilot…" autocomplete="off">
        <button type="submit" class="copilot-send" aria-label="Send"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
      </form>`;

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    drawer.querySelector('#copilot-close').addEventListener('click', close);
    drawer.querySelector('#copilot-form').addEventListener('submit', (e) => { e.preventDefault(); handleSend(); });
    drawer.querySelectorAll('[data-copilot-prompt]').forEach(b => b.addEventListener('click', () => runQuickPrompt(b.dataset.copilotPrompt)));
    // Delegated: proposal Create/Cancel buttons (the body is re-rendered each turn).
    drawer.querySelector('#copilot-body').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-copilot-action]');
      if (!btn) return;
      if (btn.dataset.copilotAction === 'create-project') createFromProposal();
      else if (btn.dataset.copilotAction === 'cancel-proposal') cancelProposal();
    });
  }

  function isAdminUser() {
    try { return (window.getSession ? getSession()?.role : null) === 'admin'; } catch (_) { return false; }
  }
  function open() {
    // Copilot is an admin-only feature.
    if (!isAdminUser()) { try { window.showToast?.('Copilot is available to admins only.', 'info'); } catch (_) {} return; }
    ensureDom();
    state_.open = true;
    document.body.classList.add('copilot-open');
    document.getElementById('copilot-drawer')?.classList.remove('hidden');
    document.getElementById('copilot-backdrop')?.classList.remove('hidden');
    render();
    ensureStatus();
    setTimeout(() => document.getElementById('copilot-input')?.focus(), 80);
  }

  function close() {
    state_.open = false;
    document.body.classList.remove('copilot-open');
    document.getElementById('copilot-drawer')?.classList.add('hidden');
    document.getElementById('copilot-backdrop')?.classList.add('hidden');
  }

  function toggle() { return state_.open ? close() : open(); }
  function isOpen() { return state_.open; }

  // Open the drawer and turn supplied text (e.g. a brainstorm canvas) straight
  // into a project proposal the user can approve. Used by the canvas hand-off.
  function proposeFromText(text) {
    if (!text || !text.trim()) return;
    open();
    state_.messages.push({ role: 'user', content: text.trim() });
    render();
    proposeProject(text.trim());
  }

  window.WTCopilot = { open, close, toggle, isOpen, proposeFromText };
})();
