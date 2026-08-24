const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, Menu, MenuItem, ipcMain, session, shell, clipboard, powerMonitor } = require('electron');

let mainWindow;
let checkingForUpdates = false;
let autoCheckDone = false;
let autoUpdater;

const isDev = !app.isPackaged;
const packageMeta = getPackageMeta();
const bootLogEnabled = process.env.WT_BOOT_LOG === '1' || process.env.WT_EXECUTIVE_BLACK === '1' || packageMeta.executiveBlack === true;
function bootLog(message, extra = '') {
  if (!bootLogEnabled) return;
  try {
    const dir = path.join(process.env.APPDATA || app.getPath('temp'), 'ExecutiveBlack');
    fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, 'boot.log'), `[${new Date().toISOString()}] ${message}${extra ? ` ${extra}` : ''}\n`, 'utf8');
  } catch (_) {}
}
process.on('uncaughtException', (error) => {
  bootLog('uncaughtException', error?.stack || error?.message || String(error));
  throw error;
});
process.on('unhandledRejection', (error) => {
  bootLog('unhandledRejection', error?.stack || error?.message || String(error));
});
bootLog('main-start', `packaged=${app.isPackaged}`);

// IMPORTANT: pin the user-data directory to the legacy "WorkTracker" name.
// Electron derives userData from productName, so the v3.3.0 rename to "Orbitrack"
// would otherwise move every desktop user to a FRESH profile — logging them out,
// resetting local data (re-synced from cloud), and orphaning the persisted
// Supabase Auth session (→ "Document storage authorization is missing"). Pinning
// the path keeps everyone on their existing profile across the rebrand. Must run
// before app 'ready'. (Override with WT_USERDATA_DIR if ever needed.)
try {
  const executiveProfile = process.env.WT_EXECUTIVE_BLACK === '1'
    || process.env.WT_REACT === '1'
    || packageMeta.executiveBlack === true
    || process.env.WT_APP_MODE === 'executive'
    || packageMeta.orbitaskMode === 'executive';
  const profileName = process.env.WT_USERDATA_DIR || (executiveProfile ? 'ExecutiveBlack' : 'WorkTracker');
  app.setPath('userData', path.join(app.getPath('appData'), profileName));
  bootLog('userData', app.getPath('userData'));
} catch (e) {
  console.warn('[userData] could not pin legacy path:', e?.message || e);
  bootLog('userData-error', e?.message || String(e));
}
// GPU acceleration for the arcade's WebGL renderers (Pixi treasure map + Phaser
// games). Electron enables hardware accel by default, but on many Windows setups
// Chromium's driver blocklist silently drops WebGL to the software SwiftShader
// backend — which is what makes the canvas games feel laggy. Forcing past the
// blocklist + GPU rasterization keeps everything on the real GPU. Set
// WT_DISABLE_GPU=1 to fall back to software if a machine has broken drivers.
if (process.env.WT_DISABLE_GPU === '1') {
  try { app.disableHardwareAcceleration(); } catch (_) {}
} else {
  try {
    app.commandLine.appendSwitch('ignore-gpu-blocklist');
    app.commandLine.appendSwitch('enable-gpu-rasterization');
    app.commandLine.appendSwitch('enable-zero-copy');
  } catch (_) {}
}

const launchMode = process.env.WT_APP_MODE || packageMeta.orbitaskMode || '';
const useModularApp = process.env.WT_MODULAR === '1' || launchMode === 'workspace' || launchMode === 'control';
const modularDevUrl = process.env.WT_MODULAR_URL || 'http://127.0.0.1:5174/modular/';
const modularStartRoute = process.env.WT_MODULAR_ROUTE || (launchMode === 'control' ? '#/control' : '#/app');
// Local React/Vite UI rewrite (test build). Default OFF — only active when
// WT_REACT=1, so the shipping app is byte-for-byte unchanged otherwise.
const useReactApp = process.env.WT_REACT === '1' || packageMeta.executiveBlack === true || launchMode === 'executive';
const reactDevMode = process.env.WT_REACT_DEV === '1'; // use the Vite dev server instead of the built dist
const reactDevUrl = process.env.WT_REACT_URL || 'http://127.0.0.1:5175/';
const reactStartRoute = process.env.WT_REACT_ROUTE || '#/admin/overview';
const isExecutiveBlack = useReactApp && (process.env.WT_EXECUTIVE_BLACK === '1' || packageMeta.executiveBlack === true || launchMode === 'executive');
// The window keeps the native OS frame. Kept as a constant so the security
// status the renderer reads is derived from the value actually passed to
// BrowserWindow rather than restated by hand.
const WINDOW_HAS_NATIVE_FRAME = true;
let cspInstalled = false;

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

function reactUrlWithRoute(url) {
  const next = new URL(url);
  next.hash = reactStartRoute;
  return next.toString();
}

function isSafeExternalUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    // http: is deliberately excluded: nothing in the app needs to open a
    // cleartext page, and allowing it lets a renderer defect launch the
    // default browser at an arbitrary drive-by download.
    return ['https:', 'mailto:'].includes(parsed.protocol);
  } catch (_) {
    return false;
  }
}

// A dev-server URL comes from the environment, so it must be pinned to loopback
// before it can be handed to loadURL with the preload bridge attached.
function isLocalDevUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    return ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(parsed.hostname);
  } catch (_) {
    return false;
  }
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
  bootLog('createWindow');
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1120,
    minHeight: 720,
    title: isExecutiveBlack ? 'Executive Black' : (app.getName() || 'Orbitrack'),
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    frame: WINDOW_HAS_NATIVE_FRAME,
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

  // The dev-server branch is gated on isDev and loopback: in a packaged build
  // WT_REACT_DEV=1 plus WT_REACT_URL would otherwise be enough to render a
  // remote origin in the main window with the privileged preload attached.
  if (useReactApp && reactDevMode && isDev && isLocalDevUrl(reactDevUrl)) {
    bootLog('load-react-dev', reactUrlWithRoute(reactDevUrl));
    mainWindow.loadURL(reactUrlWithRoute(reactDevUrl));
  } else if (useReactApp) {
    if (reactDevMode) bootLog('load-react-dev-refused', reactDevUrl);
    const reactIndex = path.join(__dirname, '..', 'orbitrack-react', 'dist', 'index.html');
    bootLog('load-react-built', reactIndex);
    mainWindow.loadFile(reactIndex, {
      hash: reactStartRoute.replace(/^#/, '')
    });
  } else if (isDev && useModularApp && isLocalDevUrl(modularDevUrl)) {
    bootLog('load-modular-dev', modularUrlWithRoute(modularDevUrl));
    mainWindow.loadURL(modularUrlWithRoute(modularDevUrl));
  } else if (useModularApp) {
    bootLog('load-modular-built');
    mainWindow.loadFile(path.join(__dirname, '..', 'modular-dist', 'modular', 'index.html'), {
      hash: modularStartRoute.replace(/^#/, '')
    });
  } else {
    bootLog('load-lite');
    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    bootLog('ready-to-show');
    mainWindow.show();
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    bootLog('did-fail-load', `${errorCode} ${errorDescription} ${validatedURL}`);
  });

  // With WT_BOOT_LOG=1, renderer console output lands in boot.log. Renderer
  // errors are otherwise invisible without opening DevTools by hand, which makes
  // things like a Content-Security-Policy refusal hard to spot in a packaged run.
  if (bootLogEnabled) {
    mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
      if (level < 1) return; // skip plain console.log noise
      bootLog('renderer-console', `[${level}] ${message} (${sourceId}:${line})`);
    });
  }
  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    bootLog('render-process-gone', JSON.stringify(details));
  });
  mainWindow.on('closed', () => {
    bootLog('window-closed');
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const currentUrl = mainWindow.webContents.getURL();
    if (url.startsWith('blob:')) {
      event.preventDefault();
      return;
    }
    if (url !== currentUrl && !url.startsWith('file://')) {
      event.preventDefault();
      if (isSafeExternalUrl(url)) {
        shell.openExternal(url);
      }
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
  // Preserve electron-updater's default signature verification. Unsigned Windows
  // updates must fail closed rather than being installed automatically.

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

// Only the app's own top frame may drive privileged IPC. Without this a nested
// frame — e.g. the blob: PDF preview iframe — could call updater:install.
function fromMainFrame(event) {
  const wc = mainWindow && !mainWindow.isDestroyed() ? mainWindow.webContents : null;
  if (!wc) return false;
  try {
    return event?.senderFrame === wc.mainFrame;
  } catch (_) {
    // senderFrame throws if the frame was disposed mid-call.
    return false;
  }
}

// Reported to the renderer's Local Health panel. Every field is read back from
// live state: a hardcoded set of `true`s made the panel structurally incapable
// of ever reporting a problem, which is worse than showing nothing.
function collectSecurityStatus() {
  const wc = mainWindow && !mainWindow.isDestroyed() ? mainWindow.webContents : null;
  let prefs = {};
  try { prefs = wc?.getLastWebPreferences?.() || {}; } catch (_) { prefs = {}; }
  let signatureVerification = true;
  try {
    if (autoUpdater && typeof autoUpdater.verifyUpdateCodeSignature === 'boolean') {
      signatureVerification = autoUpdater.verifyUpdateCodeSignature;
    }
  } catch (_) {}
  return {
    desktop: true,
    platform: process.platform,
    vanillaFrameless: !WINDOW_HAS_NATIVE_FRAME,
    contextIsolation: prefs.contextIsolation !== false,
    nodeIntegration: prefs.nodeIntegration === true,
    sandbox: prefs.sandbox !== false,
    webSecurity: prefs.webSecurity !== false,
    externalNavigationGuard: true,
    contentSecurityPolicy: cspInstalled,
    updateSignatureVerification: signatureVerification,
    // This build is not Authenticode-signed, so say so rather than implying a
    // trusted update path exists.
    signedBuild: false
  };
}

// Guarded like the rest, so "every ipcMain.handle validates its sender" holds
// with no exceptions to reason about — even for a read-only value.
ipcMain.handle('app:get-version', (event) => (fromMainFrame(event) ? app.getVersion() : null));
ipcMain.handle('desktop:get-security-status', (event) => {
  if (!fromMainFrame(event)) return null;
  return collectSecurityStatus();
});
ipcMain.handle('shell:open-external', async (event, url) => {
  if (!fromMainFrame(event)) return false;
  if (!isSafeExternalUrl(url)) return false;
  await shell.openExternal(url);
  return true;
});
ipcMain.handle('updater:check', (event) => {
  if (!fromMainFrame(event)) return null;
  return checkForUpdates({ manual: true });
});
ipcMain.handle('updater:install', (event) => {
  if (!fromMainFrame(event)) return;
  if (!isDev && autoUpdater) {
    try {
      const verPath = path.join(app.getPath('userData'), 'last-installed-version');
      fs.writeFileSync(verPath, app.getVersion(), 'utf8');
    } catch (_) {}
    autoUpdater.quitAndInstall(false, true);
  }
});

// Content-Security-Policy for the packaged renderer. The app loads every script
// from disk and installs no inline handlers, so script-src can stay at 'self'
// with no 'unsafe-inline'/'unsafe-eval'. Inline *styles* are unavoidable: the
// views build HTML with style="" attributes throughout.
// `file:` is listed alongside 'self' because a file:// document has an opaque
// origin, so 'self' does not reliably match its own sibling files in Chromium.
// It still blocks every remote script/style origin, which is the point.
const RENDERER_CSP = [
  "default-src 'self' file:",
  "script-src 'self' file:",
  "style-src 'self' file: 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' file: data: https://fonts.gstatic.com",
  // blob: covers generated report/preview objects; the Drive hosts serve
  // profile-photo thumbnails.
  "img-src 'self' file: data: blob: https://drive.google.com https://*.googleusercontent.com",
  "media-src 'self' file: data: blob:",
  "connect-src 'self' file: data: blob: https://*.supabase.co wss://*.supabase.co https://*.googleapis.com",
  // The PDF preview renders a blob: URL inside an iframe.
  "frame-src 'self' file: blob:",
  "worker-src 'self' file: blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'"
].join('; ');

// Permissions the app actually uses. Everything else is denied rather than
// left to Electron's permissive default.
const ALLOWED_PERMISSIONS = new Set(['notifications', 'clipboard-sanitized-write', 'fullscreen']);

function hardenSession(targetSession) {
  // Only stamp the policy on locally-loaded content. A Vite dev server needs
  // inline scripts and a ws: connection for HMR, and that path is dev-only.
  targetSession.webRequest.onHeadersReceived((details, callback) => {
    if (!details.url.startsWith('file://')) {
      callback({});
      return;
    }
    const responseHeaders = { ...(details.responseHeaders || {}) };
    delete responseHeaders['content-security-policy'];
    delete responseHeaders['Content-Security-Policy'];
    responseHeaders['Content-Security-Policy'] = [RENDERER_CSP];
    callback({ responseHeaders });
  });
  cspInstalled = true;

  targetSession.setPermissionRequestHandler((_wc, permission, callback) => {
    const granted = ALLOWED_PERMISSIONS.has(permission);
    if (!granted) bootLog('permission-denied', permission);
    callback(granted);
  });
  targetSession.setPermissionCheckHandler((_wc, permission) => ALLOWED_PERMISSIONS.has(permission));
}

app.whenReady().then(() => {
  bootLog('app-ready');
  app.setAppUserModelId(packageMeta.orbitaskAppId || 'com.everlasting.worktracker');
  session.defaultSession.setSpellCheckerLanguages(['en-US']);
  hardenSession(session.defaultSession);
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
  bootLog('window-all-closed');
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
