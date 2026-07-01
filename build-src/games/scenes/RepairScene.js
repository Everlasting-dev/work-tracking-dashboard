/* RepairScene — shared spaceship repair */
import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene.js';
import { GAME_META } from '../hotspots.js';
import { isHost } from '../net.js';

const META = GAME_META.repair;
const STATIONS = ['Reactor', 'Shields', 'Thrusters', 'O2 Scrubber', 'Nav Array', 'Comms'];
const REPAIR = 9;
const DECAY = 4.2;

export class RepairScene extends BaseGameScene {
  constructor() {
    super('RepairScene', META);
    this.health = STATIONS.map(() => 40 + Math.random() * 20);
    this.over = 0;
    this.host = true;
    this.stationUi = [];
    this.hullText = null;
  }

  onGameCreate() {
    this.host = isHost(this.net);
    this.hullText = this.add.text(this.scale.width / 2, 28, '', { fontSize: '16px', color: '#94a3b8', align: 'center', wordWrap: { width: this.scale.width - 40 } }).setOrigin(0.5, 0);
    const cols = 2;
    const cardW = (this.scale.width - 60) / cols;
    STATIONS.forEach((name, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 30 + col * (cardW + 12) + cardW / 2;
      const y = 80 + row * 72;
      const bg = this.add.rectangle(x, y, cardW, 56, 0x1e293b).setStrokeStyle(1, 0x334155).setInteractive({ useHandCursor: true });
      const barBg = this.add.rectangle(x - cardW / 2 + 90, y, cardW - 110, 9, 0x0f172a);
      const barFill = this.add.rectangle(x - cardW / 2 + 90, y, 0, 9, 0xf59e0b).setOrigin(0, 0.5);
      const label = this.add.text(x - cardW / 2 + 8, y, name, { fontSize: '12px', color: '#e2e8f0' }).setOrigin(0, 0.5);
      const pct = this.add.text(x + cardW / 2 - 8, y, '0%', { fontSize: '11px', color: '#94a3b8' }).setOrigin(1, 0.5);
      bg.on('pointerdown', () => this.repair(i));
      this.stationUi.push({ bg, barBg, barFill, label, pct, x, y, cardW });
    });
    this.netHandlers.onState = (p) => { if (!this.host) { this.health = p.health; this.over = p.over; this.renderUi(); } };
    this.netHandlers.onInput = (p) => {
      if (this.host && p && typeof p.station === 'number') {
        this.health[p.station] = Math.min(100, this.health[p.station] + REPAIR);
        if (this.health.every((h) => h >= 100)) { this.over = 1; this.finish(true); }
        else this.pushState();
      }
    };
    this.renderUi();
  }

  onPresenceChange() { this.host = isHost(this.net); }

  hull() { return this.health.reduce((a, b) => a + b, 0) / this.health.length; }

  repair(i) {
    if (this.over) return;
    if (this.host) { this.health[i] = Math.min(100, this.health[i] + REPAIR); this.pushState(); }
    else this.net.sendInput({ station: i });
    this.renderUi();
  }

  pushState() { if (this.net && this.host) this.net.sendState({ health: this.health, over: this.over }); }

  tick(dt) {
    if (!this.host || this.over) return;
    for (let i = 0; i < this.health.length; i++) {
      this.health[i] = Math.max(0, this.health[i] - DECAY * dt * (0.6 + Math.random() * 0.8));
    }
    if (this.health.every((h) => h >= 100)) { this.over = 1; this.finish(true); }
    else if (this.hull() <= 0.5) { this.over = -1; this.finish(false); }
    else this.pushState();
  }

  finish(win) {
    this.pushState();
    if (win) { try { window.OrbiFun?.celebrate?.({ big: true }); } catch (_) {} }
    this.toast(win ? 'Ship fully restored! 🚀' : 'Hull integrity lost… run failed.', win ? 'success' : 'error');
    this.award(win ? 'win' : 'lose');
    if (win) this.award('finish');
    this.time.delayedCall(1800, () => this.resetGame());
  }

  resetGame() {
    this.health = STATIONS.map(() => 40 + Math.random() * 20);
    this.over = 0;
    this.pushState();
    this.renderUi();
  }

  renderUi() {
    const hp = Math.round(this.hull());
    let hullMsg = `Hull integrity ${hp}%`;
    if (this.over === 1) hullMsg += ' · Restored!';
    else if (this.over === -1) hullMsg += ' · Failed';
    else hullMsg += ' · click stations to patch damage';
    this.hullText.setText(hullMsg);
    this.stationUi.forEach((ui, i) => {
      const h = Math.round(this.health[i]);
      const tone = h >= 100 ? 0x22c55e : h < 30 ? 0xef4444 : 0xf59e0b;
      const barW = ui.cardW - 110;
      ui.barFill.setSize((barW * h) / 100, 9).setFillStyle(tone);
      ui.pct.setText(`${h}%`);
      ui.bg.setAlpha(this.over ? 0.5 : 1);
    });
  }

  update(_t, dtMs) {
    this.tick(Math.min(0.1, dtMs / 1000));
    this.renderUi();
  }
}
