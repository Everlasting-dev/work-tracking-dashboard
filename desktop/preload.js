const { contextBridge, ipcRenderer } = require('electron');
const PKG_VERSION = process.env.npm_package_version || '3.1.0';

contextBridge.exposeInMainWorld('workTrackerDesktop', {
  isDesktop: true,
  platform: process.platform,
  getVersion: () => ipcRenderer.invoke('app:get-version'),
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

// Inject app version into window for the app to read
ipcRenderer.invoke('app:get-version').then(version => {
  window.WT_APP_VERSION = version;
}).catch(() => {
  window.WT_APP_VERSION = PKG_VERSION;
});
