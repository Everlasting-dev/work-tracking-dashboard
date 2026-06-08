/* realtime-sync.js — Supabase Realtime → LocalDB hydration */

const RealtimeSync = (() => {
  let _channel = null;
  let _client = null;
  let _uid = null;
  let _connected = false;

  function _getSession() {
    try {
      if (typeof window.WT_getActiveSession === 'function') return window.WT_getActiveSession();
      const raw = sessionStorage.getItem('wt-session');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  async function _put(table, row) {
    if (!table || row?.id == null) return;
    try { await table.put(row); } catch (err) { console.warn('[RealtimeSync] put failed', err); }
  }

  function _mapNotification(r) {
    return window.SupabaseDB?._mapNotification?.(r) || {
      id: r.id, userId: r.user_id, type: r.type, entityType: r.entity_type,
      entityId: r.entity_id, projectId: r.project_id, message: r.message || '',
      actorUserId: r.actor_user_id, readAt: r.read_at, createdAt: r.created_at
    };
  }

  function _mapActivity(r) {
    return window.SupabaseDB?._mapActivity?.(r) || {
      id: r.id, userId: r.user_id, projectId: r.project_id, action: r.action,
      entityType: r.entity_type, entityId: r.entity_id, details: r.details || '',
      createdAt: r.created_at
    };
  }

  function _mapDirectMessage(r) {
    return {
      id: r.id,
      fromUserId: r.from_user_id,
      toUserId: r.to_user_id,
      content: r.content || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at || r.created_at,
      deliveredAt: r.delivered_at || null,
      readAt: r.read_at || null
    };
  }

  function _mapBugReport(r) {
    return {
      id: r.id, userId: r.user_id, title: r.title || '',
      description: r.description || '', severity: r.severity || 'normal',
      status: r.status || 'open', appVersion: r.app_version || '',
      createdAt: r.created_at
    };
  }

  function _mapAccessRequest(r) {
    return window.SupabaseDB?._mapProjectAccessRequest?.(r) || {
      id: r.id, projectId: r.project_id, requesterId: r.requester_id, message: r.message || '',
      status: r.status || 'pending', decidedBy: r.decided_by || null, decidedAt: r.decided_at || null,
      createdAt: r.created_at, updatedAt: r.updated_at
    };
  }

  function _mapDiscordMessage(r) {
    return {
      id: r.id,
      channelId: r.channel_id,
      discordMessageId: r.discord_message_id,
      discordAuthorId: r.author_id,
      discordAuthorName: r.author_username,
      discordDisplayName: r.author_display_name || r.author_username,
      discordAvatar: r.author_avatar || '',
      content: r.content || '',
      createdAt: r.created_at
    };
  }

  function _mapUser(r) {
    return window.SupabaseDB?._mapUser?.(r) || null;
  }

  function _mapProject(r) {
    return window.SupabaseDB?._mapProject?.(r) || null;
  }

  function _mapTask(r) {
    return window.SupabaseDB?._mapTask?.(r) || null;
  }

  function _mapUpdate(r) {
    return window.SupabaseDB?._mapUpdate?.(r) || null;
  }

  function _channelIdFromActivity(row) {
    if (row.projectId == null) return 'general';
    return `project-${row.projectId}`;
  }

  async function _handleNotification(row, eventType) {
    const mapped = _mapNotification(row);
    const ldb = window.LocalDB?.db;
    if (ldb?.notifications) await _put(ldb.notifications, mapped);
    window.dispatchEvent(new CustomEvent('wt-realtime-notification', {
      detail: { row: mapped, eventType }
    }));
  }

  async function _handleDirectMessage(row, eventType) {
    const uid = _uid;
    if (!uid) return;
    if (row.from_user_id !== uid && row.to_user_id !== uid) return;
    const mapped = _mapDirectMessage(row);
    const ldb = window.LocalDB?.db;
    if (ldb?.directMessages) await _put(ldb.directMessages, mapped);
    // Auto-mark as delivered when recipient receives a new message via realtime
    if (eventType === 'INSERT' && row.to_user_id === uid) {
      window.DB?.markDMDelivered?.(row.id);
    }
    const channelId = `dm-${row.from_user_id === uid ? row.to_user_id : row.from_user_id}`;
    window.dispatchEvent(new CustomEvent('wt-realtime-chat', {
      detail: {
        channelId,
        message: {
          id: `dm-${mapped.id}`,
          userId: mapped.fromUserId,
          details: mapped.content,
          source: 'direct',
          createdAt: mapped.createdAt,
          deliveredAt: mapped.deliveredAt,
          readAt: mapped.readAt
        },
        eventType
      }
    }));
  }

  async function _handleBugReport(row, eventType) {
    const mapped = _mapBugReport(row);
    window.dispatchEvent(new CustomEvent('wt-realtime-bug-report', {
      detail: { row: mapped, eventType }
    }));
  }

  async function _handleActivityLog(row, eventType) {
    const mapped = _mapActivity(row);
    const ldb = window.LocalDB?.db;
    if (ldb?.activityLog) await _put(ldb.activityLog, mapped);
    window.dispatchEvent(new CustomEvent('wt-realtime-activity', {
      detail: { row: mapped, eventType }
    }));
    if (row.action === 'sent_message' && row.entity_type === 'chat') {
      window.dispatchEvent(new CustomEvent('wt-realtime-chat', {
        detail: {
          channelId: _channelIdFromActivity(mapped),
          message: {
            id: mapped.id,
            userId: mapped.userId,
            details: mapped.details,
            source: 'app',
            createdAt: mapped.createdAt
          },
          eventType
        }
      }));
    }
  }

  async function _handleAccessRequest(row, eventType) {
    const mapped = _mapAccessRequest(row);
    const ldb = window.LocalDB?.db;
    if (ldb?.projectAccessRequests) await _put(ldb.projectAccessRequests, mapped);
    window.dispatchEvent(new CustomEvent('wt-realtime-access-request', {
      detail: { row: mapped, eventType }
    }));
  }

  async function _handleDiscordMessage(row, eventType) {
    const mapped = _mapDiscordMessage(row);
    const ldb = window.LocalDB?.db;
    if (ldb?.discordMessages) await _put(ldb.discordMessages, mapped);
    window.dispatchEvent(new CustomEvent('wt-realtime-chat', {
      detail: {
        channelId: mapped.channelId,
        message: {
          id: `discord-${mapped.id}`,
          userId: null,
          discordAuthorName: mapped.discordAuthorName,
          discordDisplayName: mapped.discordDisplayName,
          discordAvatar: mapped.discordAvatar,
          details: mapped.content,
          source: 'discord',
          createdAt: mapped.createdAt
        },
        eventType
      }
    }));
  }

  async function _handleUser(row, eventType) {
    const mapped = _mapUser(row);
    if (!mapped) return;
    const ldb = window.LocalDB?.db;
    if (ldb?.users) await _put(ldb.users, mapped);
    window.dispatchEvent(new CustomEvent('wt-realtime-user', { detail: { row: mapped, eventType } }));
  }

  async function _handleProject(row, eventType) {
    const mapped = _mapProject(row);
    if (!mapped) return;
    const ldb = window.LocalDB?.db;
    if (ldb?.projects) await _put(ldb.projects, mapped);
    window.dispatchEvent(new CustomEvent('wt-realtime-project', { detail: { row: mapped, eventType } }));
  }

  async function _handleTask(row, eventType) {
    const mapped = _mapTask(row);
    if (!mapped) return;
    const ldb = window.LocalDB?.db;
    if (ldb?.tasks) await _put(ldb.tasks, mapped);
    window.dispatchEvent(new CustomEvent('wt-realtime-task', { detail: { row: mapped, eventType } }));
  }

  async function _handleUpdate(row, eventType) {
    const mapped = _mapUpdate(row);
    if (!mapped) return;
    const ldb = window.LocalDB?.db;
    if (ldb?.updates) await _put(ldb.updates, mapped);
    window.dispatchEvent(new CustomEvent('wt-realtime-update', { detail: { row: mapped, eventType } }));
  }

  function _subscribe(table, handler, filter) {
    const cfg = { event: '*', schema: 'public', table };
    if (filter) cfg.filter = filter;
    _channel.on('postgres_changes', cfg, (payload) => {
      const row = payload.new || payload.old;
      if (!row) return;
      handler(row, payload.eventType).catch(err => console.warn('[RealtimeSync]', table, err));
    });
  }

  function stop() {
    if (_channel) {
      try { _channel.unsubscribe(); } catch (_) {}
      _channel = null;
    }
    _connected = false;
    _uid = null;
    window.dispatchEvent(new CustomEvent('wt-realtime-status', { detail: { connected: false } }));
  }

  function isConnected() { return _connected; }

  async function init(userId) {
    stop();
    const uid = Number(userId);
    if (!uid || !navigator.onLine) return false;

    _client = window.SyncEngine?.getClient?.() || window.SupabaseDB?._client;
    if (!_client) return false;

    _uid = uid;
    _channel = _client.channel(`wt-live-${uid}`);

    _subscribe('wt_notifications', _handleNotification, `user_id=eq.${uid}`);
    _subscribe('wt_direct_messages', _handleDirectMessage);
    _subscribe('wt_activity_log', _handleActivityLog);
    _subscribe('wt_project_access_requests', _handleAccessRequest);
    _subscribe('wt_discord_messages', _handleDiscordMessage);
    _subscribe('wt_bug_reports', _handleBugReport);
    _subscribe('wt_users', _handleUser);
    _subscribe('wt_projects', _handleProject);
    _subscribe('wt_tasks', _handleTask);
    _subscribe('wt_updates', _handleUpdate);

    return new Promise((resolve) => {
      _channel.subscribe((status) => {
        _connected = status === 'SUBSCRIBED';
        window.dispatchEvent(new CustomEvent('wt-realtime-status', { detail: { connected: _connected, status } }));
        if (status === 'SUBSCRIBED') resolve(true);
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') resolve(false);
      });
    });
  }

  async function restart() {
    const session = _getSession();
    if (!session?.userId) return stop();
    return init(session.userId);
  }

  return { init, stop, restart, isConnected };
})();

window.RealtimeSync = RealtimeSync;
