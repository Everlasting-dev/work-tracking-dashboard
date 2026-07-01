/* ConstellationScene — co-op star linking */
import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene.js';
import { GAME_META } from '../hotspots.js';

const META = GAME_META.constellation;
const STARS = [
  [0.14, 0.24], [0.30, 0.15], [0.46, 0.28], [0.62, 0.14], [0.80, 0.26],
  [0.22, 0.52], [0.40, 0.60], [0.58, 0.50], [0.76, 0.58], [0.88, 0.44],
  [0.16, 0.80], [0.34, 0.74], [0.52, 0.84], [0.70, 0.78], [0.86, 0.72],
];
const TARGET = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 9], [9, 8], [8, 7], [7, 6], [6, 5], [5, 0],
  [2, 7], [7, 12], [12, 11], [11, 6], [12, 13],
];
const edgeKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const TARGET_SET = new Set(TARGET.map(([a, b]) => edgeKey(a, b)));

export class ConstellationScene extends BaseGameScene {
  constructor() {
    super('ConstellationScene', META);
    this.edges = new Set();
    this.selected = -1;
    this.hover = -1;
    this.won = false;
    this.gfx = null;
    this.starSprites = [];
  }

  onGameCreate() {
    this.gfx = this.add.graphics();
    this.statusText = this.add.text(12, this.scale.height - 16, '', { fontSize: '12px', color: '#cbd5e1' });
    this.starSprites = STARS.map((_, i) => {
      const s = this.add.circle(0, 0, 6, 0xffffff, 0.75).setInteractive({ useHandCursor: true });
      s.setData('idx', i);
      s.on('pointerover', () => { this.hover = i; });
      s.on('pointerout', () => { if (this.hover === i) this.hover = -1; });
      s.on('pointerdown', () => this.onStarClick(i));
      return s;
    });
    this.netHandlers.onState = (p) => this.applyRemote(p?.edges);
    if (this.net) this.net.sendState({ edges: [] });
    this.scale.on('resize', () => this.layoutStars());
    this.layoutStars();
  }

  px(i) { return STARS[i][0] * this.scale.width; }
  py(i) { return STARS[i][1] * this.scale.height; }

  layoutStars() {
    this.starSprites.forEach((s, i) => s.setPosition(this.px(i), this.py(i)));
    this.statusText.setPosition(12, this.scale.height - 16);
  }

  broadcast() { if (this.net) this.net.sendState({ edges: Array.from(this.edges) }); }

  applyRemote(list) {
    let changed = false;
    (list || []).forEach((k) => { if (!this.edges.has(k)) { this.edges.add(k); changed = true; } });
    if (changed) this.checkWin();
  }

  onStarClick(i) {
    if (this.won) return;
    if (this.selected < 0) { this.selected = i; return; }
    if (this.selected === i) { this.selected = -1; return; }
    this.edges.add(edgeKey(this.selected, i));
    this.selected = -1;
    this.broadcast();
    this.checkWin();
  }

  checkWin() {
    if (this.won) return;
    for (const k of TARGET_SET) if (!this.edges.has(k)) return;
    this.won = true;
    try { window.OrbiFun?.celebrate?.({ big: true }); } catch (_) {}
    this.toast('Constellation complete! Nice teamwork.', 'success');
    this.award('win');
    this.award('finish');
  }

  resetGame() {
    this.edges.clear();
    this.selected = -1;
    this.won = false;
    this.broadcast();
  }

  onPresenceChange() { this.broadcast(); }

  update() {
    const g = this.gfx;
    g.clear();
    this.edges.forEach((k) => {
      const [a, b] = k.split('-').map(Number);
      const good = TARGET_SET.has(k);
      g.lineStyle(good ? 2.4 : 1.6, good ? 0x38bdf8 : 0xef4444, good ? 0.9 : 0.55);
      g.beginPath();
      g.moveTo(this.px(a), this.py(a));
      g.lineTo(this.px(b), this.py(b));
      g.strokePath();
    });
    if (this.selected >= 0 && this.hover >= 0) {
      g.lineStyle(1.5, 0xffffff, 0.35);
      g.beginPath();
      g.moveTo(this.px(this.selected), this.py(this.selected));
      g.lineTo(this.px(this.hover), this.py(this.hover));
      g.strokePath();
    }
    this.starSprites.forEach((s, i) => {
      const sel = i === this.selected;
      const hov = i === this.hover;
      s.setRadius(sel ? 8 : 5.5);
      s.setFillStyle(sel ? 0xf59e0b : (hov ? 0xffffff : 0xffffff), sel ? 1 : (hov ? 1 : 0.75));
    });
    let done = 0;
    TARGET_SET.forEach((k) => { if (this.edges.has(k)) done++; });
    this.statusText.setText(this.won ? 'Complete!' : `Linked ${done}/${TARGET_SET.size} · click two stars to connect`);
  }
}
