/* BaseGameScene — shared Supabase channel lifecycle for arcade games */
import Phaser from 'phaser';
import { joinGameChannel } from '../net.js';
import * as Arcade from '../achievements.js';

export class BaseGameScene extends Phaser.Scene {
  constructor(key, meta) {
    super(key);
    this.meta = meta;
    this.net = null;
    this.role = 'host';
  }

  create() {
    this.cameras.main.setBackgroundColor(0x0b0e14);
    this.netHandlers = {};
    this.net = joinGameChannel(this.meta.id, {
      onState: (p) => { try { this.netHandlers.onState?.(p); } catch (_) {} },
      onInput: (p) => { try { this.netHandlers.onInput?.(p); } catch (_) {} },
      onPresence: (players) => {
        this.assignRole(players);
        try { this.onPresenceChange?.(players); } catch (_) {}
        window.__arcadeHub?.renderPeers?.(players);
      },
    });
    this.assignRole(this.net?.players?.() || []);
    if (!this.net) window.__arcadeHub?.toast?.('Offline — playing solo. Sign in with cloud sync for live multiplayer.', '');
    try { Arcade.award('game-start', { gameId: this.meta.id, title: this.meta.title }); } catch (_) {}
    window.__arcadeHub?.renderPeers?.(this.net ? this.net.players() : null);
    this.onGameCreate();
  }

  assignRole(players) {
    if (!this.net) { this.role = 'host'; return; }
    const list = players || this.net.players();
    const idx = list.findIndex((p) => String(p.id) === String(this.net.me.id));
    if (idx === 0) this.role = 'host';
    else if (idx === 1) this.role = 'away';
    else this.role = list.length > 1 ? 'spectator' : 'host';
    this.isHost = this.role === 'host';
  }

  shutdown() {
    try { this.onGameShutdown?.(); } catch (_) {}
    try { this.net?.leave(); } catch (_) {}
    this.net = null;
  }

  award(event, extra = {}) {
    try { window.OrbiArcade?.award(event, { gameId: this.meta.id, title: this.meta.title, ...extra }); } catch (_) {}
  }

  toast(msg, kind) {
    try { window.OrbiGamesToast?.(msg, kind); } catch (_) {}
  }

  onGameCreate() {} // override
}
