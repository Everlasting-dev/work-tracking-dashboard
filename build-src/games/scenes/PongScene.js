/* PongScene — host-authoritative 2-player rally */
import Phaser from 'phaser';
import { BaseGameScene } from './BaseGameScene.js';
import { GAME_META } from '../hotspots.js';

const META = GAME_META.pong;
const PADDLE_H = 74;
const PADDLE_W = 10;
const BALL_R = 8;
const PADDLE_SPEED = 420;
const WIN_SCORE = 7;

export class PongScene extends BaseGameScene {
  constructor() {
    super('PongScene', META);
    this.state = { ballX: 320, ballY: 180, vx: 260, vy: 150, leftY: 150, rightY: 150, leftScore: 0, rightScore: 0 };
    this.awayInput = 150;
    this.myPaddleY = 150;
    this.keys = null;
    this.gfx = null;
    this.ended = false;
    this.lastSent = 0;
  }

  onGameCreate() {
    this.W = this.scale.width;
    this.H = this.scale.height;
    this.gfx = this.add.graphics();
    this.scoreText = this.add.text(this.W / 2, 28, '0   0', { fontSize: '28px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.hintText = this.add.text(this.W / 2, this.H - 14, '', { fontSize: '12px', color: '#94a3b8' }).setOrigin(0.5);
    this.keys = this.input.keyboard.addKeys({ up: Phaser.Input.Keyboard.KeyCodes.W, down: Phaser.Input.Keyboard.KeyCodes.S, up2: Phaser.Input.Keyboard.KeyCodes.UP, down2: Phaser.Input.Keyboard.KeyCodes.DOWN });
    this.resetBall(Math.random() < 0.5 ? 1 : -1);
    this.myPaddleY = this.H / 2 - PADDLE_H / 2;
    this.netHandlers.onState = (p) => this.applyState(p);
    this.netHandlers.onInput = (p) => { if (this.role === 'host') this.awayInput = p.y * this.H; };
    this.scale.on('resize', () => { this.W = this.scale.width; this.H = this.scale.height; });
  }

  mySide() { return this.role === 'away' ? 'right' : (this.role === 'spectator' ? null : 'left'); }

  resetBall(dir) {
    this.state.ballX = this.W / 2;
    this.state.ballY = this.H / 2;
    this.state.vx = dir * 300;
    this.state.vy = (Math.random() * 2 - 1) * 180;
  }

  resetMatch() {
    this.state.leftScore = 0;
    this.state.rightScore = 0;
    this.ended = false;
    this.resetBall(Math.random() < 0.5 ? 1 : -1);
    this.myPaddleY = this.H / 2 - PADDLE_H / 2;
  }

  applyState(p) {
    if (this.role === 'host') return;
    this.state.ballX = p.bx * this.W;
    this.state.ballY = p.by * this.H;
    this.state.leftY = p.ly * this.H;
    this.state.rightY = p.ry * this.H;
    this.state.leftScore = p.ls;
    this.state.rightScore = p.rs;
  }

  step(dt) {
    const up = this.keys.up.isDown || this.keys.up2.isDown;
    const down = this.keys.down.isDown || this.keys.down2.isDown;
    const move = (up ? -1 : 0) + (down ? 1 : 0);
    this.myPaddleY = Phaser.Math.Clamp(this.myPaddleY + move * PADDLE_SPEED * dt, 0, this.H - PADDLE_H);

    if (this.role === 'host') {
      this.state.leftY = this.myPaddleY;
      if (this.net) this.state.rightY = this.awayInput;
      else {
        const target = this.state.ballY - PADDLE_H / 2;
        this.state.rightY += Phaser.Math.Clamp(target - this.state.rightY, -PADDLE_SPEED * dt, PADDLE_SPEED * dt) * 0.9;
        this.state.rightY = Phaser.Math.Clamp(this.state.rightY, 0, this.H - PADDLE_H);
      }
      this.state.ballX += this.state.vx * dt;
      this.state.ballY += this.state.vy * dt;
      if (this.state.ballY < BALL_R) { this.state.ballY = BALL_R; this.state.vy *= -1; }
      if (this.state.ballY > this.H - BALL_R) { this.state.ballY = this.H - BALL_R; this.state.vy *= -1; }
      if (this.state.ballX - BALL_R < PADDLE_W + 6 && this.state.ballY > this.state.leftY && this.state.ballY < this.state.leftY + PADDLE_H && this.state.vx < 0) {
        this.state.vx *= -1.06;
        this.state.vy += ((this.state.ballY - (this.state.leftY + PADDLE_H / 2)) / (PADDLE_H / 2)) * 120;
      }
      if (this.state.ballX + BALL_R > this.W - PADDLE_W - 6 && this.state.ballY > this.state.rightY && this.state.ballY < this.state.rightY + PADDLE_H && this.state.vx > 0) {
        this.state.vx *= -1.06;
        this.state.vy += ((this.state.ballY - (this.state.rightY + PADDLE_H / 2)) / (PADDLE_H / 2)) * 120;
      }
      if (this.state.ballX < -20) { this.state.rightScore++; this.resetBall(1); }
      if (this.state.ballX > this.W + 20) { this.state.leftScore++; this.resetBall(-1); }
      const now = performance.now();
      if (this.net && now - this.lastSent > 50) {
        this.lastSent = now;
        this.net.sendState({
          bx: this.state.ballX / this.W, by: this.state.ballY / this.H,
          ly: this.state.leftY / this.H, ry: this.state.rightY / this.H,
          ls: this.state.leftScore, rs: this.state.rightScore,
        });
      }
    } else if (this.role === 'away') {
      this.state.rightY = this.myPaddleY;
      const now = performance.now();
      if (this.net && now - this.lastSent > 50) { this.lastSent = now; this.net.sendInput({ y: this.myPaddleY / this.H }); }
    }
  }

  checkEnd() {
    if (this.ended) return;
    if (this.state.leftScore < WIN_SCORE && this.state.rightScore < WIN_SCORE) return;
    this.ended = true;
    const side = this.mySide();
    if (side) {
      const myScore = side === 'left' ? this.state.leftScore : this.state.rightScore;
      const opp = side === 'left' ? this.state.rightScore : this.state.leftScore;
      const win = myScore > opp;
      this.award(win ? 'win' : 'lose');
      this.award('finish');
      this.award('score', { score: myScore });
      this.toast(win ? `You won ${myScore}–${opp}! 🏓` : `You lost ${opp}–${myScore}.`, win ? 'success' : 'error');
    }
    this.time.delayedCall(1600, () => this.resetMatch());
  }

  draw() {
    const g = this.gfx;
    g.clear();
    g.fillStyle(0xffffff, 0.06);
    for (let y = 8; y < this.H; y += 26) g.fillRect(this.W / 2 - 1, y, 2, 14);
    g.fillStyle(0x818cf8, 1);
    g.fillRect(4, this.state.leftY, PADDLE_W, PADDLE_H);
    g.fillStyle(0x38bdf8, 1);
    g.fillRect(this.W - PADDLE_W - 4, this.state.rightY, PADDLE_W, PADDLE_H);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(this.state.ballX, this.state.ballY, BALL_R);
    this.scoreText.setText(`${this.state.leftScore}   ${this.state.rightScore}`);
    this.scoreText.setPosition(this.W / 2, 28);
    this.hintText.setText(this.role === 'spectator' ? 'Spectating' : (this.role === 'host' ? 'You: left paddle (W/S or ↑/↓)' : 'You: right paddle (W/S or ↑/↓)'));
    this.hintText.setPosition(this.W / 2, this.H - 14);
  }

  update(_t, dtMs) {
    const dt = Math.min(0.05, dtMs / 1000);
    if (!this.ended) this.step(dt);
    this.checkEnd();
    this.draw();
  }

  onGameShutdown() {
    this.scale.off('resize');
  }
}

// Hub reset hook
PongScene.prototype.resetGame = function resetGame() { this.resetMatch(); };
