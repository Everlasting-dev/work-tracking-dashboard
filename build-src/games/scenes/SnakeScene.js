/* SnakeScene — cooperative shared snake */
import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene.js';
import { GAME_META } from '../hotspots.js';
import { isHost } from '../net.js';

const META = GAME_META.snake;
const COLS = 24;
const ROWS = 16;
const TICK = 0.12;

export class SnakeScene extends BaseGameScene {
  constructor() {
    super('SnakeScene', META);
    this.snake = [{ x: 8, y: 8 }];
    this.dir = { x: 1, y: 0 };
    this.pendingDir = { x: 1, y: 0 };
    this.food = { x: 14, y: 8 };
    this.score = 0;
    this.dead = false;
    this.acc = 0;
    this.gfx = null;
    this.host = true;
    this.lastPush = 0;
  }

  onGameCreate() {
    this.gfx = this.add.graphics();
    this.statusText = this.add.text(12, this.scale.height - 16, '', { fontSize: '12px', color: '#cbd5e1' });
    this.host = isHost(this.net);
    this.food = this.randFood();
    this.netHandlers.onState = (p) => {
      if (!this.host) {
        this.snake = p.snake;
        this.food = p.food;
        this.score = p.score;
        this.dead = p.dead;
      }
    };
    this.netHandlers.onInput = (p) => { if (this.host) this.pendingDir = { x: p.x, y: p.y }; };
    this.input.keyboard.on('keydown', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || k === 'arrowup') this.steer(0, -1);
      else if (k === 's' || k === 'arrowdown') this.steer(0, 1);
      else if (k === 'a' || k === 'arrowleft') this.steer(-1, 0);
      else if (k === 'd' || k === 'arrowright') this.steer(1, 0);
    });
    this.scale.on('resize', () => this.statusText.setPosition(12, this.scale.height - 16));
  }

  onPresenceChange() { this.host = isHost(this.net); }

  steer(x, y) {
    this.pendingDir = { x, y };
    if (this.net && !this.host) this.net.sendInput({ x, y });
  }

  randFood() {
    let f;
    do { f = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 }; }
    while (this.snake.some((s) => s.x === f.x && s.y === f.y));
    return f;
  }

  pushState() { if (this.net && this.host) this.net.sendState({ snake: this.snake, food: this.food, score: this.score, dead: this.dead }); }

  tick() {
    if (this.dead) return;
    if (this.pendingDir.x !== -this.dir.x || this.pendingDir.y !== -this.dir.y) this.dir = { ...this.pendingDir };
    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS || this.snake.some((s) => s.x === head.x && s.y === head.y)) {
      this.dead = true;
      this.toast(`Snake crashed at ${this.score} points. Restarting…`, 'error');
      this.award(this.score >= 10 ? 'win' : 'lose');
      this.award('score', { score: this.score });
      if (this.score >= 10) this.award('finish');
      this.time.delayedCall(1400, () => this.resetGame());
      return;
    }
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) { this.score++; this.food = this.randFood(); }
    else this.snake.pop();
  }

  resetGame() {
    this.snake = [{ x: 8, y: 8 }];
    this.dir = { x: 1, y: 0 };
    this.pendingDir = { x: 1, y: 0 };
    this.food = this.randFood();
    this.score = 0;
    this.dead = false;
    this.pushState();
  }

  update(_t, dtMs) {
    const dt = Math.min(0.1, dtMs / 1000);
    if (this.host) {
      this.acc += dt;
      while (this.acc >= TICK) { this.acc -= TICK; this.tick(); }
      const now = performance.now();
      if (this.net && now - this.lastPush > 90) { this.lastPush = now; this.pushState(); }
    }
    const W = this.scale.width;
    const H = this.scale.height;
    const cell = Math.min(Math.floor(W / COLS), Math.floor(H / ROWS));
    const ox = (W - cell * COLS) / 2;
    const oy = (H - cell * ROWS) / 2;
    const g = this.gfx;
    g.clear();
    g.fillStyle(0xffffff, 0.03);
    g.fillRect(ox, oy, cell * COLS, cell * ROWS);
    g.fillStyle(0xf59e0b, 1);
    g.fillCircle(ox + this.food.x * cell + cell / 2, oy + this.food.y * cell + cell / 2, cell * 0.34);
    this.snake.forEach((s, i) => {
      const alpha = i === 0 ? 1 : Math.max(0.35, 1 - i * 0.03);
      g.fillStyle(i === 0 ? 0x38bdf8 : 0x818cf8, alpha);
      g.fillRect(ox + s.x * cell + 1, oy + s.y * cell + 1, cell - 2, cell - 2);
    });
    this.statusText.setText(`Score ${this.score} · everyone can steer (WASD/arrows)${this.host ? '' : ' · synced'}`);
  }
}
