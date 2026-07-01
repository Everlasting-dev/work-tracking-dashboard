/* phaser-boot.js — Phaser lifecycle for arcade games only (map uses Leaflet+Pixi) */
import Phaser from 'phaser';
import { PongScene } from './scenes/PongScene.js';
import { ConstellationScene } from './scenes/ConstellationScene.js';
import { SnakeScene } from './scenes/SnakeScene.js';
import { RelayScene } from './scenes/RelayScene.js';
import { RepairScene } from './scenes/RepairScene.js';

const GAME_SCENES = [PongScene, ConstellationScene, SnakeScene, RelayScene, RepairScene];

let game = null;

export function startArcadePhaser(parent, width, height) {
  if (!parent) return null;
  destroyArcadePhaser();
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

export function getArcadeGame() {
  return game;
}

export function destroyArcadePhaser() {
  if (game) {
    try { game.destroy(true); } catch (_) {}
    game = null;
  }
}
