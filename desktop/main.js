const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, Menu, MenuItem, ipcMain, session, shell, clipboard, powerMonitor } = require('electron');

let mainWindow;
let checkingForUpdates = false;
let autoCheckDone = false;
let autoUpdater;

const isDev = !app.isPackaged;
const packageMeta = getPackageMeta();
const launchMode = process.env.WT_APP_MODE || packageMeta.orbitaskMode || '';
const useModularApp = process.env.WT_MODULAR === '1' || launchMode === 'workspace' || launchMode === 'control';
const modularDevUrl = process.env.WT_MODULAR_URL || 'http://127.0.0.1:5174/modular/';
const modularStartRoute = process.env.WT_MODULAR_ROUTE || (launchMode === 'control' ? '#/control' : '#/app');

function getPackageMeta() {
  try {
    return require(path.join(__dirname, '..', 'package.json'));
  } catch (_) {
    return {};
  }
}

function modularUrlWithRoute(url) {
  const next = new URL(url);
  next.hash = modularStartRoute;
  return next.toString();
}

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
  if (/not digitally signed|not signed|SignerCertificate|publisherNames|signature|code signing/i.test(raw)) {
    return manual
      ? 'This update is available, but this installed build cannot install unsigned updates automatically. Download and run the latest installer from GitHub Releases.'
      : 'An update is available, but it needs to be installed manually from GitHub Releases.';
  }
  return 'Could not check for updates right now.';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1120,
    minHeight: 720,
    title: app.getName() || 'Orbitrack',
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, '..', 'build', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: true,
      // Enable Chromium's built-in PDF viewer so in-app <iframe> PDF previews
      // (blob: URLs streamed from Drive) render instead of showing blank.
      plugins: true
    }
  });

  if (isDev && useModularApp) {
    mainWindow.loadURL(modularUrlWithRoute(modularDevUrl));
  } else if (useModularApp) {
    mainWindow.loadFile(path.join(__dirname, '..', 'modular-dist', 'modular', 'index.html'), {
      hash: modularStartRoute.replace(/^#/, '')
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
  }

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

  mainWindow.webContents.on('context-menu', (_event, params) => {
    const menu = new Menu();
    const hasText = !!(params.selectionText && params.selectionText.trim());

    if (params.misspelledWord && params.dictionarySuggestions?.length) {
      for (const suggestion of params.dictionarySuggestions.slice(0, 6)) {
        menu.append(new MenuItem({
          label: suggestion,
          click: () => mainWindow.webContents.replaceMisspelling(suggestion)
        }));
      }
      menu.append(new MenuItem({ type: 'separator' }));
    }

    if (params.isEditable) {
      // Inputs, textareas, and rich-text fields get the full editing menu.
      menu.append(new MenuItem({ role: 'cut', enabled: params.editFlags.canCut }));
      menu.append(new MenuItem({ role: 'copy', enabled: params.editFlags.canCopy }));
      menu.append(new MenuItem({ role: 'paste', enabled: params.editFlags.canPaste }));
      menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({ role: 'selectAll' }));
    } else if (hasText) {
      // Read-only text (e.g. a project description) — let users copy the selection.
      menu.append(new MenuItem({ role: 'copy', enabled: params.editFlags.canCopy }));
      menu.append(new MenuItem({ role: 'selectAll' }));
    }

    // Offer to copy a link's address whether or not it sits in an editable field.
    if (params.linkURL) {
      if (menu.items.length) menu.append(new MenuItem({ type: 'separator' }));
      menu.append(new MenuItem({
        label: 'Copy Link Address',
        click: () => clipboard.writeText(params.linkURL)
      }));
    }

    if (menu.items.length) menu.popup();
  });
}

function createMenu() {
  Menu.setApplicationMenu(null);
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
  // Install downloaded updates on quit so a broken renderer/preload bridge
  // can never fully block updates — the app self-heals on next launch.
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  autoUpdater.verifyUpdateCodeSignature = false;

  autoUpdater.on('checking-for-update', () => {
    sendUpdateStatus({ state: 'checking', message: 'Checking for updates...' });
  });

  autoUpdater.on('update-available', (info) => {
    sendUpdateStatus({
      state: 'available',
      version: info.version,
      message: `Downloading Orbitrack ${info.version}...`
    });
  });

  autoUpdater.on('update-not-available', () => {
    sendUpdateStatus({ state: 'idle', message: 'Orbitrack is up to date.' });
  });

  autoUpdater.on('download-progress', (progress) => {
    sendUpdateStatus({
      state: 'downloading',
      percent: Math.round(progress.percent || 0),
      message: 'Downloading update...'
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    if (info.version === app.getVersion()) {
      sendUpdateStatus({ state: 'idle', message: 'Orbitrack is up to date.' });
      return;
    }
    sendUpdateStatus({
      state: 'downloaded',
      version: info.version,
      message: `Orbitrack ${info.version} is ready to install.`
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
  if (!isDev && autoUpdater) {
    try {
      const verPath = path.join(app.getPath('userData'), 'last-installed-version');
      fs.writeFileSync(verPath, app.getVersion(), 'utf8');
    } catch (_) {}
    autoUpdater.quitAndInstall(false, true);
  }
});

const OLLAMA_BASE_URL = process.env.WT_OLLAMA_URL || 'http://127.0.0.1:11434';

async function ollamaJson(pathname, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 90000);
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}${pathname}`, {
      method: options.method || 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal
    });
    if (!res.ok) return { ok: false, error: `Ollama error ${res.status}` };
    return { ok: true, data: await res.json() };
  } catch (error) {
    return { ok: false, error: error?.name === 'AbortError' ? 'Ollama timed out.' : 'Ollama is not reachable at localhost:11434.' };
  } finally {
    clearTimeout(timeout);
  }
}

ipcMain.handle('ai:status', async () => {
  const result = await ollamaJson('/api/tags', { timeoutMs: 8000 });
  if (!result.ok) return result;
  return { ok: true, models: (result.data?.models || []).map(m => m.name).filter(Boolean) };
});

ipcMain.handle('ai:chat', async (_event, payload = {}) => {
  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  if (!messages.length) return { ok: false, error: 'No messages supplied.' };
  const model = payload.model || 'llama3.1:8b';
  const result = await ollamaJson('/api/chat', {
    method: 'POST',
    timeoutMs: 120000,
    body: {
      model,
      messages,
      stream: false,
      options: { temperature: Number(payload.temperature ?? 0.3) }
    }
  });
  if (!result.ok) return result;
  return { ok: true, content: result.data?.message?.content || '', model };
});

app.whenReady().then(() => {
  app.setAppUserModelId(packageMeta.orbitaskAppId || 'com.everlasting.worktracker');
  session.defaultSession.setSpellCheckerLanguages(['en-US']);
  createWindow();
  createMenu();
  configureAutoUpdater();

  if (!isDev && !autoCheckDone) {
    autoCheckDone = true;
    setTimeout(() => checkForUpdates({ manual: false }), 10000);
  }

  startIdleReporting();
});

// Report OS idle time to the renderer so it can show active / idle / away
// presence (powerMonitor.getSystemIdleTime returns seconds since last input).
function startIdleReporting() {
  const send = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    let idleSeconds = 0;
    try { idleSeconds = powerMonitor.getSystemIdleTime(); } catch (_) {}
    let state = 'active';
    try { state = powerMonitor.getSystemIdleState(60); } catch (_) {}
    mainWindow.webContents.send('idle:state', { idleSeconds, state });
  };
  setInterval(send, 30000);
  setTimeout(send, 4000);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
