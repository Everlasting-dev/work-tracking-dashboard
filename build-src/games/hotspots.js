/* Treasure map hotspot layout — shared by MapScene and hub metadata */

// left/top are the badge centres as a PERCENTAGE of the map image (1024×768).
// Tune with window.__arcadeCalibrate = true, then click a badge (see map-pixi.js).
// v1: only Crystal Cave (Shared Spaceship Repair) is live. The other stations
// are charted but "coming soon" — their games return in a future update.
export const HOTSPOTS = [
  { id: 1, label: 'Puzzle Ruins', left: 16.8, top: 14.3, soon: true },
  { id: 2, label: 'Lighthouse Challenge', left: 17.4, top: 41.9, soon: true },
  { id: 3, label: 'Summit Climb', left: 45.1, top: 13.0, soon: true },
  { id: 4, label: 'Haunted Castle', left: 73.0, top: 18.0, soon: true },
  { id: 5, label: 'Harbor Dash', left: 31.1, top: 62.2, soon: true },
  { id: 6, label: 'Forest Cabin', left: 47.7, top: 37.8, soon: true },
  { id: 7, label: 'Oasis Escape', left: 77.9, top: 41.9, soon: true },
  { id: 8, label: 'Crystal Cave', left: 69.5, top: 62.2, game: 'repair' },
  { id: 9, label: 'Command Center', left: 50.6, top: 63.8, hub: true },
];

export const SCENE_BY_GAME = {
  repair: 'RepairScene',
};

export const GAME_META = {
  pong: {
    id: 'pong', title: 'Orbit Pong', desc: '2-player rally · host-authoritative', players: '2P',
    tutorial: {
      how: 'First to 7 wins. The two players each control one paddle and rally the ball back and forth — miss and your opponent scores. Playing solo pits you against a simple AI.',
      controls: 'Move your paddle with W / S or the ↑ / ↓ arrow keys.',
    },
  },
  constellation: {
    id: 'constellation', title: 'Constellation Connect', desc: 'Co-op · light the shape together', players: 'Co-op',
    tutorial: {
      how: 'Work together to draw the hidden constellation. Click one star, then another, to link them. Correct links glow blue; wrong links show red. Complete every target edge to win.',
      controls: 'Click two stars to connect them. Click a selected star again to deselect.',
    },
  },
  snake: {
    id: 'snake', title: 'Cooperative Snake', desc: 'Co-op · one snake, many pilots', players: 'Co-op',
    tutorial: {
      how: 'One snake, steered by the whole room. Eat orange orbs to grow; crashing ends the run. Reach 10 points for a win.',
      controls: 'Steer with W A S D or the arrow keys. Everyone in the room can steer.',
    },
  },
  relay: {
    id: 'relay', title: 'Task Relay Race', desc: 'Turn-based · pass the baton', players: 'Co-op',
    tutorial: {
      how: 'A relay of 5 task legs. When it is your leg, tap to fill your segment, then the baton passes to the next runner.',
      controls: 'When the banner says "Your leg", press Space or click Tap repeatedly.',
    },
  },
  repair: {
    id: 'repair', title: 'Shared Spaceship Repair', desc: 'Co-op · patch systems before the hull fails', players: 'Co-op',
    tutorial: {
      how: 'Six ship systems decay constantly. Click a station to patch it. Get ALL six to 100% at once to win.',
      controls: 'Click any station to repair that system. Repair faster than the decay!',
    },
  },
};
