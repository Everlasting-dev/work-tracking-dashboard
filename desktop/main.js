const path = require('path');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

let mainWindow;
let checkingForUpdates = false;
let autoUpdater;

const isDev = !app.isPackaged;

function sendUpdateStatus(payload) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('updater:status', payload);
}

function userUpdateError(error, manual = false) {
  const raw = `${error?.message || error || ''}`;
  console.warn('[updater]', raw);
  if (/404|latest\.ya?ml|release/i.test(raw)) {
    return manual ? 'No new updates available.' : 'No update found.';
  }
  if (/net::|network|fetch|timeout|ENOTFOUND|ECONN/i.test(raw)) {
    return 'Could not check for updates. Check your internet connection and try again.';
  }
  return 'Could not check for updates right now.';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1120,
    minHeight: 720,
    title: 'WorkTracker',
    backgroundColor: '#f6f7fb',
    show: false,
    icon: path.join(__dirname, '..', 'favicon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const currentUrl = mainWindow.webContents.getURL();
    if (url !== currentUrl && !url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

function createMenu() {
  const template = [
    {
      label: 'WorkTracker',
      submenu: [
        { label: `Version ${app.getVersion()}`, enabled: false },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => checkForUpdates({ manual: true })
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function checkForUpdates({ manual = false } = {}) {
  if (!autoUpdater) {
    sendUpdateStatus({
      state: 'idle',
      manual,
      message: 'Updates are not available in this run.'
    });
    return;
  }

  if (isDev) {
    sendUpdateStatus({
      state: 'idle',
      manual,
      message: 'Update checks run in the installed app.'
    });
    return;
  }

  if (checkingForUpdates) return;
  checkingForUpdates = true;

  try {
    if (manual) {
      sendUpdateStatus({ state: 'checking', manual, message: 'Checking for updates...' });
    }
    await autoUpdater.checkForUpdates();
  } catch (error) {
    sendUpdateStatus({
      state: 'error',
      manual,
      message: userUpdateError(error, manual)
    });
  } finally {
    checkingForUpdates = false;
  }
}

function configureAutoUpdater() {
  if (autoUpdater) return;

  try {
    autoUpdater = require('electron-updater').autoUpdater;
  } catch (error) {
    sendUpdateStatus({
      state: 'error',
      message: error?.message || 'The updater could not be loaded.'
    });
    return;
  }

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = true;

  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus({ state: 'checking', message: 'Checking for updates...' });
  });

  autoUpdater.on('update-available', (info) => {
    sendUpdateStatus({
      state: 'available',
      version: info.version,
      message: `Downloading WorkTracker ${info.version}...`
    });
  });

  autoUpdater.on('update-not-available', () => {
    sendUpdateStatus({ state: 'idle', message: 'WorkTracker is up to date.' });
  });

  autoUpdater.on('download-progress', (progress) => {
    sendUpdateStatus({
      state: 'downloading',
      percent: Math.round(progress.percent || 0),
      message: 'Downloading update...'
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    sendUpdateStatus({
      state: 'downloaded',
      version: info.version,
      message: `WorkTracker ${info.version} is ready to install.`
    });
  });

  autoUpdater.on('error', (error) => {
    sendUpdateStatus({
      state: 'error',
      message: userUpdateError(error, false)
    });
  });
}

ipcMain.handle('app:get-version', () => app.getVersion());
ipcMain.handle('updater:check', () => checkForUpdates({ manual: true }));
ipcMain.handle('updater:install', () => {
  if (!isDev && autoUpdater) autoUpdater.quitAndInstall(false, true);
});

app.whenReady().then(() => {
  app.setAppUserModelId('com.subzeromotors.worktracker');
  createWindow();
  createMenu();
  configureAutoUpdater();

  if (!isDev) {
    setTimeout(() => checkForUpdates({ manual: false }), 10000);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
