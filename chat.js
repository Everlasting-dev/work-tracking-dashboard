/* chat.js - docked chat, direct messages, unread state, and Discord bridge. */

(function () {
/* ──── Chat (Discord bridge) ──── */

const CHAT_READ_KEY = 'wt-chat-read-v2';
let _chatUnreadTimer = null;

function chatReadStorageKey() {
  const uid = actorId();
  return uid ? `${CHAT_READ_KEY}-${uid}` : null;
}
function loadChatReadMap() {
  const key = chatReadStorageKey();
  if (!key) return {};
  try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; }
}
function saveChatReadMap(map) {
  const key = chatReadStorageKey();
  if (key) localStorage.setItem(key, JSON.stringify(map));
}
function markChatChannelRead(channelId) {
  if (!channelId) return;
  const map = loadChatReadMap();
  map[channelId] = new Date().toISOString();
  saveChatReadMap(map);
  if (!state.chatUnreadChannels) state.chatUnreadChannels = new Set();
  state.chatUnreadChannels.delete(channelId);
  if (state.chatUnreadCounts) delete state.chatUnreadCounts[channelId];
  updateChatUnreadBadge();
  // Mark DMs as read in the database so sender sees the read receipt
  if (channelId.startsWith('dm-')) {
    const otherId = Number(channelId.slice(3));
    const me = actorId();
    if (otherId && me) DB.markDMRead?.(otherId, me).catch(() => {});
  }
  if (state.chatDockOpen && state.chatDockView === 'list') {
    const list = document.getElementById('chat-dock-list');
    if (list && _chatDockData) list.innerHTML = chatDockListBodyHtml();
  }
}
function isChannelUnread(channelId, latestMsg) {
  if (!latestMsg?.createdAt) return false;
  const me = actorId();
  const senderId = latestMsg.userId ?? latestMsg.fromUserId;
  if (senderId && Number(senderId) === Number(me)) return false;
  const readAt = loadChatReadMap()[channelId];
  if (!readAt) return true;
  return latestMsg.createdAt > readAt;
}
async function getChannelLatestMessage(channelId) {
  const msgs = await getChatMessagesForChannel(channelId);
  return msgs.length ? msgs[msgs.length - 1] : null;
}
function updateChatUnreadBadge() {
  const btn = document.querySelector('.chat-dock-launcher');
  if (!btn) return;
  const has = state.chatUnreadChannels?.size > 0;
  btn.classList.toggle('has-unread', has);
  let badge = btn.querySelector('.dock-launcher-badge');
  if (has && !badge) {
    badge = document.createElement('span');
    badge.className = 'dock-launcher-badge';
    badge.setAttribute('aria-hidden', 'true');
    btn.appendChild(badge);
  } else if (!has && badge) badge.remove();
}
async function refreshChatUnreadState() {
  const uid = actorId();
  if (!uid) {
    state.chatUnreadChannels = new Set();
    updateChatUnreadBadge();
    return;
  }
  if (!state.chatUnreadChannels) state.chatUnreadChannels = new Set();
  const prevUnread = new Set(state.chatUnreadChannels);

  let users = _chatDockData?.users;
  if (!users) {
    const data = await getWorkspaceData();
    users = data.users || [];
  }

  const channelIds = [
    'general',
    ...users.filter(x => x.id !== uid).map(u => `dm-${u.id}`)
  ];

  const results = await Promise.all(
    channelIds.map(ch =>
      getChannelLatestMessage(ch).then(msg => ({ ch, msg })).catch(() => ({ ch, msg: null }))
    )
  );

  const unread = new Set();
  for (const { ch, msg } of results) {
    if (isChannelUnread(ch, msg)) unread.add(ch);
  }

  // Play sound when polling detects a new unread channel (realtime handler covers live events)
  for (const ch of unread) {
    if (!prevUnread.has(ch)) {
      NotificationSounds?.play?.('chat');
      break;
    }
  }

  state.chatUnreadChannels = unread;
  updateChatUnreadBadge();
  if (state.chatDockOpen && state.chatDockView === 'list') {
    const list = document.getElementById('chat-dock-list');
    if (list && _chatDockData) list.innerHTML = chatDockListBodyHtml();
  }
}
function _chatPollMs() {
  return window.RealtimeSync?.isConnected?.() ? 15000 : 5000;
}
function startChatUnreadPolling() {
  stopChatUnreadPolling();
  state.chatUnreadChannels = new Set();
  state.chatUnreadCounts = {};
  updateChatUnreadBadge();
}
function stopChatUnreadPolling() {
  if (_chatUnreadTimer) { clearInterval(_chatUnreadTimer); _chatUnreadTimer = null; }
}

async function getChatMessagesForChannel(channelId) {
  if (!channelId) return [];
  if (channelId.startsWith('dm-')) {
    const otherId = Number(channelId.slice(3));
    const uid = actorId();
    if (!uid || !otherId) return [];
    const db = (window.SupabaseDB && !isOffline()) ? window.SupabaseDB : DB;
    const rows = await db.getDirectMessages(uid, otherId, { limit: 150 }).catch(() => []);
    return (rows || []).map(m => ({
      id: `dm-${m.id}`,
      userId: m.fromUserId,
      details: m.content,
      source: 'direct',
      createdAt: m.createdAt,
      deliveredAt: m.deliveredAt || null,
      readAt: m.readAt || null
    }));
  }
  const [activity, discord] = await Promise.all([
    DB.getChatActivityLog(channelId).catch(() => []),
    DB.getDiscordMessages(channelId).catch(() => [])
  ]);
  return [...(activity || []), ...(discord || [])]
    .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
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
  let messages;

  // DM channels: always pull fresh from Supabase so new messages appear even when
  // realtime isn't delivering events (IndexedDB would stay stale otherwise).
  if (channelId.startsWith('dm-') && window.SupabaseDB?._sb?.() && navigator.onLine !== false) {
    try {
      const otherId = Number(channelId.slice(3));
      const rows = await window.SupabaseDB.getDirectMessages(actorId(), otherId, { limit: 150 });
      messages = rows.map(r => ({
        id: `dm-${r.id}`,
        userId: r.fromUserId,
        details: r.content || '',
        source: 'direct',
        createdAt: r.createdAt,
        deliveredAt: r.deliveredAt || null,
        readAt: r.readAt || null
      }));
    } catch (_) {
      messages = await getChatMessagesForChannel(channelId);
    }
  } else {
    messages = await getChatMessagesForChannel(channelId);
  }

  pane.innerHTML = renderChatMessagesHtml(messages, uMap);
  pane.scrollTop = pane.scrollHeight;
  markChatChannelRead(channelId);
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
    const avatarBg = isDiscord ? 'background:#000000' : (who ? `background:${userColor(who)}` : '');
    const avatarContent = isDiscord && m.discordAvatar
      ? `<img src="${esc(m.discordAvatar)}" alt="${esc(name)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">` : init;
    const msgDate = new Date(m.createdAt).toLocaleDateString('en-US', { month:'short', day:'numeric' });
    if (msgDate !== lastDate) {
      html += `<div class="chat-date-divider"><span>${msgDate}</span></div>`;
      lastDate = msgDate;
    }
    const isDirect = m.source === 'direct';
    let receiptHtml = '';
    if (mine && isDirect) {
      if (m.readAt) {
        receiptHtml = `<span class="chat-msg-receipt chat-msg-receipt--read" title="Read">✓✓ Read</span>`;
      } else if (m.deliveredAt) {
        receiptHtml = `<span class="chat-msg-receipt chat-msg-receipt--delivered" title="Delivered">✓✓ Delivered</span>`;
      } else {
        receiptHtml = `<span class="chat-msg-receipt" title="Sent">✓ Sent</span>`;
      }
    }
    html += `<div class="chat-msg-row ${mine ? 'chat-msg-mine' : ''} ${isDiscord ? 'chat-msg-discord' : ''}">
      ${!mine ? `<div class="chat-msg-avatar" style="${avatarBg}" title="${esc(name)}">${avatarContent}</div>` : ''}
      <div class="chat-msg-body">
        ${!mine ? `<div class="chat-msg-name">${esc(name)} ${isDiscord ? `<span class="chat-discord-badge">${ICONS.discordMark}</span>` : ''}</div>` : ''}
        <div class="chat-msg-bubble">${esc(m.details || '').replace(/\n/g, '<br>')}</div>
        <div class="chat-msg-time">${timeAgo(m.createdAt)}${receiptHtml}</div>
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
  if (channelId) {
    state.chatChannel = channelId;
    state.chatDockView = 'convo';
    markChatChannelRead(channelId);
  } else if (!state.chatDockView) state.chatDockView = 'list';
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
  // Always poll at 5s for DM conversations — refreshChatPane goes to Supabase directly,
  // so the interval is the max wait time for a new message when realtime isn't firing.
  _chatDockTimer = setInterval(() => {
    if (state.chatDockOpen && state.chatDockView === 'convo') refreshChatPane().catch(() => {});
  }, 5000);
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
  const channelId = `dm-${u.id}`;
  const isUnread = state.chatUnreadChannels?.has(channelId);
  const unreadCount = state.chatUnreadCounts?.[channelId] || 0;
  const unreadCls = isUnread ? ' chat-dock-contact--unread' : '';
  const unreadBadge = isUnread ? `<span class="chat-unread-badge">${unreadCount > 99 ? '99+' : unreadCount || ''}</span>` : '';
  return `<button type="button" class="chat-dock-contact${unreadCls}" data-action="open-chat-channel" data-channel-id="${channelId}">
    <span class="chat-dock-contact-av" ${userColorStyle(u)}>${avatarInner}${presenceDotHtml(u)}</span>
    <span class="chat-dock-contact-meta"><span class="chat-dock-contact-name">${esc(u.displayName || u.username)}</span><small>${sub}</small></span>
    ${unreadBadge}
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

  // Unread DMs bubble to the top section; remove them from their regular section to avoid duplicates
  const unreadDMs = sortUsersByPresence(filtered.filter(u => state.chatUnreadChannels?.has(`dm-${u.id}`)));
  const unreadIds = new Set(unreadDMs.map(u => u.id));

  const favs = sortUsersByPresence(filtered.filter(u => d.favIds.has(u.id) && !unreadIds.has(u.id)));
  const online = sortUsersByPresence(filtered.filter(u => !d.favIds.has(u.id) && isUserOnline(u) && !unreadIds.has(u.id)));
  const others = sortUsersByPresence(filtered.filter(u => !d.favIds.has(u.id) && !isUserOnline(u) && !unreadIds.has(u.id)));

  const generalIsUnread = state.chatUnreadChannels?.has('general');
  const generalUnreadCount = state.chatUnreadCounts?.['general'] || 0;
  const generalBadge = generalIsUnread ? `<span class="chat-unread-badge">${generalUnreadCount > 99 ? '99+' : generalUnreadCount || ''}</span>` : '';
  const channelsHtml = `
    <button type="button" class="chat-dock-contact${generalIsUnread ? ' chat-dock-contact--unread' : ''}" data-action="open-chat-channel" data-channel-id="general">
      <span class="chat-dock-contact-av chat-dock-channel-ic">#</span>
      <span class="chat-dock-contact-meta"><span class="chat-dock-contact-name">general</span><small>${d.generalHook?.url ? 'Discord connected' : 'Team channel'}</small></span>
      ${generalBadge}
    </button>`;

  const section = (label, html) => html ? `<div class="chat-dock-section-label">${label}</div>${html}` : '';
  return `
    ${section('Channels', channelsHtml)}
    ${section('Unread', unreadDMs.map(u => chatDockContactRow(u, d.favIds.has(u.id))).join(''))}
    ${section('Pinned', favs.map(u => chatDockContactRow(u, true)).join(''))}
    ${section('Online', online.map(u => chatDockContactRow(u, false)).join(''))}
    ${section(q ? 'Results' : 'Everyone', others.map(u => chatDockContactRow(u, false)).join('') || (q ? '<p class="chat-dock-empty">No matches</p>' : ''))}`;
}

async function chatDockPanelHtml() {
  if (!state.chatDockView) state.chatDockView = 'list';
  _chatDockData = null;

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
  const notesOpen = !!window.WTNotes?.isOpen?.();
  const chatUnread = !open && state.chatUnreadChannels?.size > 0;
  root.innerHTML = `
    ${panel}
    <div class="dock-launchers">
      <button type="button" class="dock-launcher notes-dock-launcher${notesOpen ? ' is-active' : ''}" data-action="open-notes" title="Notes" aria-label="Notes">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
      </button>
      <button type="button" class="dock-launcher chat-dock-launcher${open ? ' is-active' : ''}${chatUnread ? ' has-unread' : ''}" data-action="toggle-chat-dock" title="Messages" aria-label="Messages">
        ${open ? (ICONS.close || '×') : ICONS.chat}
        ${chatUnread ? '<span class="dock-launcher-badge" aria-hidden="true"></span>' : ''}
      </button>
    </div>`;

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

async function handleSend(form, fd, uid) {
      const channelId = form.dataset.channelId;
      const content = fd.get('content')?.trim();
      if (!content) return;
      const session = getSession();
      if (channelId?.startsWith('dm-')) {
        const toUserId = Number(channelId.slice(3));
        const uMap = state.chatUsersMap || {};
        const optimistic = {
          id: `optimistic-${Date.now()}`,
          userId: uid,
          details: content.slice(0, 2000),
          source: 'direct',
          createdAt: new Date().toISOString()
        };
        form.reset();
        appendChatMessageToPane(optimistic, uMap);
        markChatChannelRead(channelId);
        try {
          await DB.createDirectMessage({ fromUserId: uid, toUserId, content });
        } catch (err) {
          console.warn('DM send failed:', err);
          showToast('Message could not be sent. Please try again.', 'warning');
          await refreshChatPane();
        }
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
      markChatChannelRead(channelId);
      return;
}

function backToList() {
  state.chatDockView = 'list';
  renderChatDock();
}

async function toggleFavorite(b) {
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
}

function handleRealtimeEvent(e) {
  const { channelId, message } = e.detail || {};
  if (!channelId || !message) return;
  const me = actorId();
  const senderId = message.userId ?? message.fromUserId;
  const isMine = senderId && Number(senderId) === Number(me);
  if (!isMine && e.detail?.eventType === 'INSERT') {
    const chatActive = state.chatDockOpen && state.chatDockView === 'convo' && state.chatChannel === channelId;
    if (!chatActive) NotificationSounds?.play?.('chat');
    if (!state.chatUnreadChannels) state.chatUnreadChannels = new Set();
    if (!state.chatUnreadCounts) state.chatUnreadCounts = {};
    state.chatUnreadChannels.add(channelId);
    state.chatUnreadCounts[channelId] = (state.chatUnreadCounts[channelId] || 0) + 1;
    updateChatUnreadBadge();
    if (state.chatDockOpen && state.chatDockView === 'list') {
      const list = document.getElementById('chat-dock-list');
      if (list && _chatDockData) list.innerHTML = chatDockListBodyHtml();
    }
  }
  const active = state.chatChannel === channelId
    && (state.chatDockOpen && state.chatDockView === 'convo');
  if (active && e.detail?.eventType === 'INSERT' && !isMine) {
    const uMap = state.chatUsersMap || {};
    appendChatMessageToPane(message, uMap);
    markChatChannelRead(channelId);
  } else if (active && e.detail?.eventType === 'INSERT' && isMine) {
    // Own INSERT: optimistic message already shown - skip to avoid duplicate
  } else if (active && e.detail?.eventType === 'UPDATE') {
    // UPDATE fires when delivered_at / read_at changes - refresh to show ticks
    refreshChatPane().catch(() => {});
  } else if (active) {
    refreshChatPane().catch(() => {});
  }
}

function handleUserIdResolved(staleId, canonicalId) {
  if (!staleId || !canonicalId || staleId === canonicalId) return;
  const staleChannel = 'dm-' + staleId;
  const canonicalChannel = 'dm-' + canonicalId;
  if (state.chatChannel === staleChannel) {
    state.chatChannel = canonicalChannel;
  }
  if (_chatDockData?.users) {
    _chatDockData.users = _chatDockData.users.map(u =>
      u.id === staleId ? { ...u, id: canonicalId } : u
    );
  }
  if (state.chatUsersMap?.[staleId]) {
    state.chatUsersMap[canonicalId] = { ...state.chatUsersMap[staleId], id: canonicalId };
    delete state.chatUsersMap[staleId];
  }
}

function reset() {
  stopChatDockPolling();
  stopChatUnreadPolling();
  state.chatDockOpen = false;
  state.chatChannel = null;
  state.chatDockView = 'list';
  state.chatDockSearch = '';
  state.chatUsersMap = {};
  _chatDockData = null;
  const dockRoot = document.getElementById('chat-dock-root');
  if (dockRoot) { dockRoot.innerHTML = ''; dockRoot.style.display = 'none'; }
  if (state.chatUnreadChannels) state.chatUnreadChannels.clear();
  state.chatUnreadCounts = {};
}

window.WTChat = {
  renderRoute: renderChat,
  renderDock: renderChatDock,
  openDock: openChatDock,
  closeDock: closeChatDock,
  toggleDock: toggleChatDock,
  refreshPane: refreshChatPane,
  refreshUnreadState: refreshChatUnreadState,
  startUnreadPolling: startChatUnreadPolling,
  stopUnreadPolling: stopChatUnreadPolling,
  startDockPolling: startChatDockPolling,
  stopDockPolling: stopChatDockPolling,
  updateUnreadBadge: updateChatUnreadBadge,
  markChannelRead: markChatChannelRead,
  appendMessageToPane: appendChatMessageToPane,
  openChannel: openChatDock,
  backToList,
  toggleFavorite,
  handleSend,
  handleRealtimeEvent,
  handleUserIdResolved,
  reset
};

// Compatibility for any older inline handlers or route references.
window.renderChat = renderChat;
})();
