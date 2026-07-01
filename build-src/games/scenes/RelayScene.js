/* RelayScene — task relay race */
import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene.js';
import { GAME_META } from '../hotspots.js';
import { isHost } from '../net.js';

const META = GAME_META.relay;
const LEGS = 5;
const PER_LEG = 100;

export class RelayScene extends BaseGameScene {
  constructor() {
    super('RelayScene', META);
    this.state = { progress: 0, leg: 0, startedAt: 0, finishedAt: 0 };
    this.taps = 0;
    this.players = [];
    this.host = true;
    this.ui = {};
  }

  onGameCreate() {
    this.host = isHost(this.net);
    this.players = this.net ? this.net.players() : [];
    this.ui.status = this.add.text(this.scale.width / 2, 40, '', { fontSize: '18px', color: '#ffffff', fontStyle: 'bold', align: 'center', wordWrap: { width: this.scale.width - 40 } }).setOrigin(0.5, 0);
    this.ui.legs = [];
    for (let i = 0; i < LEGS; i++) {
      const y = 90 + i * 52;
      const barBg = this.add.rectangle(this.scale.width / 2, y, this.scale.width - 80, 14, 0x1e293b).setStrokeStyle(1, 0x334155);
      const barFill = this.add.rectangle(this.scale.width / 2 - (this.scale.width - 80) / 2, y, 0, 14, 0x818cf8).setOrigin(0, 0.5);
      const label = this.add.text(40, y + 14, '', { fontSize: '11px', color: '#94a3b8' });
      this.ui.legs.push({ barBg, barFill, label, y });
    }
    this.ui.tapBtn = this.add.text(this.scale.width / 2, this.scale.height - 50, '[ Tap / Space ]', {
      fontSize: '16px', color: '#22c55e', fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.ui.tapBtn.on('pointerdown', () => this.tapOnce());
    this.input.keyboard.on('keydown-SPACE', (e) => { e.preventDefault(); if (this.myTurn() && !this.state.finishedAt) this.tapOnce(); });
    this.netHandlers.onState = (p) => { if (!this.host) { Object.assign(this.state, p); this.renderUi(); } };
    this.netHandlers.onInput = (p) => { if (this.host && p?.tap) this.applyTap(); };
    this.renderUi();
  }

  onPresenceChange(list) {
    this.players = list || (this.net ? this.net.players() : []);
    this.host = isHost(this.net);
    this.renderUi();
  }

  runnerIdForLeg(leg) {
    if (!this.players.length) return this.net?.me?.id || 'solo';
    return this.players[leg % this.players.length].id;
  }

  myTurn() {
    if (!this.net) return true;
    return String(this.runnerIdForLeg(this.state.leg)) === String(this.net.me.id);
  }

  tapOnce() {
    if (this.state.finishedAt) return;
    if (!this.state.startedAt) this.state.startedAt = Date.now();
    if (this.host) this.applyTap();
    else if (this.myTurn()) this.net.sendInput({ tap: 1 });
  }

  applyTap() {
    if (this.state.finishedAt) return;
    this.taps += 1;
    this.state.progress = Math.min(PER_LEG, this.taps);
    if (this.state.progress >= PER_LEG) {
      this.taps = 0;
      this.state.progress = 0;
      this.state.leg += 1;
      if (this.state.leg >= LEGS) {
        this.state.leg = LEGS;
        this.state.finishedAt = Date.now();
        this.onFinish();
      }
    }
    this.pushState();
    this.renderUi();
  }

  pushState() { if (this.net && this.host) this.net.sendState({ ...this.state }); }

  onFinish() {
    try { window.OrbiFun?.celebrate?.({ big: true }); } catch (_) {}
    const secs = ((this.state.finishedAt - this.state.startedAt) / 1000).toFixed(1);
    this.toast(`Relay done in ${secs}s! Baton home.`, 'success');
    this.award('win');
    this.award('finish');
  }

  resetGame() {
    this.state = { progress: 0, leg: 0, startedAt: 0, finishedAt: 0 };
    this.taps = 0;
    this.pushState();
    this.renderUi();
  }

  renderUi() {
    const mine = this.myTurn();
    const runner = this.players.find((p) => String(p.id) === String(this.runnerIdForLeg(this.state.leg)));
    const W = this.scale.width;
    if (this.state.finishedAt) this.ui.status.setText('Finished! 🏁').setColor('#38bdf8');
    else if (mine) this.ui.status.setText('Your leg — TAP!').setColor('#22c55e');
    else this.ui.status.setText(`Waiting for ${runner?.name || 'runner'}…`).setColor('#f59e0b');
    this.ui.status.setPosition(W / 2, 40);
    const barW = W - 80;
    this.ui.legs.forEach((leg, i) => {
      const fill = i < this.state.leg ? 100 : (i === this.state.leg ? this.state.progress : 0);
      const runnerP = this.players.length ? this.players[i % this.players.length] : null;
      leg.barBg.setPosition(W / 2, leg.y).setSize(barW, 14);
      leg.barFill.setPosition(W / 2 - barW / 2, leg.y).setSize((barW * fill) / 100, 14);
      leg.barFill.setFillStyle(parseInt((runnerP?.color || '#818cf8').replace('#', ''), 16) || 0x818cf8);
      leg.label.setText(`Leg ${i + 1}${runnerP ? ' · ' + runnerP.name : ''}`);
    });
    this.ui.tapBtn.setPosition(W / 2, this.scale.height - 50);
    this.ui.tapBtn.setAlpha(this.state.finishedAt || !mine ? 0.35 : 1);
  }
}
