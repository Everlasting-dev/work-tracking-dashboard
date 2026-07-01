# Rive assets

Drop `.riv` files here. The player card looks for **`player-card.riv`** and mounts it
over the avatar (see `app.js` → `showUserProfileModal`, and `build-src/orbirive.js`).

- Until a file exists here, the slot stays invisible and the normal avatar shows —
  nothing breaks. As soon as `player-card.riv` loads successfully, it appears.
- If your file uses a state machine, set its name where `OrbiRive.mount` is called
  (currently `stateMachine: 'State Machine 1'`), or pass `animation:` instead.
- The runtime is bundled locally (`vendor/orbirive/orbirive.js` + `rive.wasm`), so no
  CDN is contacted. Rebuild the island with `npm run build:orbirive`.

Author `.riv` files in the Rive editor: https://rive.app
