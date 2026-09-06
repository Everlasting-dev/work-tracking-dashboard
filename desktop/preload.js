const { contextBridge, ipcRenderer } = require('electron');
const PKG_VERSION = process.env.npm_package_version || '3.6.3';

contextBridge.exposeInMainWorld('workTrackerDesktop', {
  isDesktop: true,
  platform: process.platform,
  // Synchronously available fallback. The IPC value below is authoritative, but
  // the renderer reads a version before any promise can settle.
  packageVersion: PKG_VERSION,
  getVersion: () => ipcRenderer.invoke('app:get-version'),
  getSecurityStatus: () => ipcRenderer.invoke('desktop:get-security-status'),
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  installUpdate: () => ipcRenderer.invoke('updater:install'),
  onUpdateStatus: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('updater:status', listener);
    return () => ipcRenderer.removeListener('updater:status', listener);
  },
  onIdleState: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('idle:state', listener);
    return () => ipcRenderer.removeListener('idle:state', listener);
  }
});

// With contextIsolation on, `window` here is the isolated world — assigning
// window.WT_APP_VERSION from this file never reached the page. The renderer
// reads the version through workTrackerDesktop.packageVersion / getVersion()
// instead (see index.html and desktop/updates.js).
