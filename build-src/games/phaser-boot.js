/* phaser-boot.js — Phaser lifecycle for arcade games only (map uses Pixi) */
import Phaser from 'phaser';
import { RepairScene } from './scenes/RepairScene.js';
// v1 ships only Shared Spaceship Repair. Pong / Constellation / Snake / Relay
// scenes still live under scenes/ and return in a future update — re-add their
// imports here + entries in hotspots.js SCENE_BY_GAME to bring them back.

/* An idle scene that boots first so Phaser never auto-starts a real game
   (and never joins a realtime channel) until the player picks a station. */
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }
  create() { this.cameras.main.setBackgroundColor(0x0b0e14); }
}

const GAME_SCENES = [BootScene, RepairScene];

let game = null;

export function startArcadePhaser(parent, width, height) {
  if (!parent) return null;
  if (game) return game;
  const w = Math.max(320, Math.floor(width || parent.clientWidth || 640));
  const h = Math.max(240, Math.floor(height || parent.clientHeight || 400));
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: w,
    height: h,
    backgroundColor: '#0b0e14',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: w,
      height: h,
    },
    scene: GAME_SCENES,
  });
  return game;
}

export function resizeArcadePhaser(width, height) {
  if (!game) return;
  const w = Math.max(320, Math.floor(width));
  const h = Math.max(240, Math.floor(height));
  game.scale.resize(w, h);
}

export function startScene(key, data) {
  if (!game) return;
  const scenes = game.scene;
  scenes.getScenes(true).forEach((s) => {
    if (s.scene.key !== key && s.sys?.isActive?.()) scenes.stop(s.scene.key);
  });
  if (scenes.isActive(key)) scenes.stop(key);
  scenes.start(key, data || {});
}

/* Stop whatever game scene is running and return to the idle BootScene
   (this fires each scene's shutdown() so its realtime channel is left). */
export function stopArcadeScenes() {
  if (!game) return;
  game.scene.getScenes(true).forEach((s) => {
    if (s.scene.key !== 'BootScene' && s.sys?.isActive?.()) game.scene.stop(s.scene.key);
  });
  if (!game.scene.isActive('BootScene')) game.scene.start('BootScene');
}

export function getArcadeGame() {
  return game;
}

export function destroyArcadePhaser() {
  if (game) {
    try { game.destroy(true); } catch (_) {}
    game = null;
  }
}
