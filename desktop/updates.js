(function () {
  const desktop = window.workTrackerDesktop;
  if (!desktop?.isDesktop) return;

  let updateNotice;
  let progressBar;
  let hideTimer;
  let lastManualCheck = false;

  function setVersion(version) {
    window.WT_APP_VERSION = version;
    document.querySelectorAll('.splash-version').forEach((el) => {
      el.textContent = `v${version}`;
    });
  }

  function ensureNotice() {
    if (updateNotice) return updateNotice;

    updateNotice = document.createElement('div');
    updateNotice.className = 'desktop-update-notice hidden';
    updateNotice.setAttribute('role', 'status');
    updateNotice.setAttribute('aria-live', 'polite');
    updateNotice.innerHTML = `
      <div class="desktop-update-icon" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 1 1-2.64-6.36"/>
          <path d="M21 3v6h-6"/>
          <path d="M12 7v5l3 2"/>
        </svg>
      </div>
      <div class="desktop-update-body">
        <strong id="desktop-update-title">Update available</strong>
        <span id="desktop-update-message">Downloading quietly in the background.</span>
        <div class="desktop-update-progress hidden"><span></span></div>
      </div>
      <div class="desktop-update-actions">
        <button type="button" class="desktop-update-later" data-update-action="later">Later</button>
        <button type="button" class="desktop-update-primary hidden" data-update-action="install">Restart</button>
      </div>
    `;

    progressBar = updateNotice.querySelector('.desktop-update-progress');
    document.body.appendChild(updateNotice);

    updateNotice.addEventListener('click', (event) => {
      const action = event.target?.dataset?.updateAction;
      if (action === 'later') hideNotice();
      if (action === 'install') desktop.installUpdate();
    });

    return updateNotice;
  }

  function showNotice({ title, message, canInstall = false, progress = null, temporary = false }) {
    const notice = ensureNotice();
    clearTimeout(hideTimer);

    notice.querySelector('#desktop-update-title').textContent = title;
    notice.querySelector('#desktop-update-message').textContent = message;
    notice.querySelector('[data-update-action="install"]').classList.toggle('hidden', !canInstall);
    notice.querySelector('[data-update-action="later"]').textContent = canInstall ? 'Later' : 'Dismiss';

    if (Number.isFinite(progress)) {
      progressBar.classList.remove('hidden');
      progressBar.querySelector('span').style.width = `${Math.max(0, Math.min(100, progress))}%`;
    } else {
      progressBar.classList.add('hidden');
    }

    notice.classList.remove('hidden');
    requestAnimationFrame(() => notice.classList.add('visible'));

    if (temporary) {
      hideTimer = setTimeout(hideNotice, 3600);
    }
  }

  function hideNotice() {
    if (!updateNotice) return;
    updateNotice.classList.remove('visible');
    setTimeout(() => updateNotice?.classList.add('hidden'), 240);
  }

  function quietToast(message, type = 'info') {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
    }
  }

  function friendlyUpdateMessage(message, fallback) {
    const raw = String(message || '');
    if (/404|latest\.ya?ml|HttpError|github\.com|electron-updater|builder-util-runtime|app\.asar/i.test(raw)) {
      return fallback || 'No new updates available.';
    }
    if (/not digitally signed|not signed|SignerCertificate|publisherNames|signature|code signing/i.test(raw)) {
      return 'This update needs a manual install from GitHub Releases.';
    }
    return raw || fallback || 'Could not check for updates right now.';
  }

  desktop.getVersion().then(setVersion).catch(() => {});

  desktop.onUpdateStatus((status) => {
    if (!status) return;
    lastManualCheck = Boolean(status.manual || lastManualCheck);

    if (status.state === 'checking' && status.manual) {
      quietToast('Checking for updates...', 'info');
      hideNotice();
      return;
    }

    if (status.state === 'available') {
      showNotice({
        title: `WorkTracker ${status.version} is available`,
        message: 'Downloading quietly in the background.',
        progress: 0
      });
      return;
    }

    if (status.state === 'downloading') {
      showNotice({
        title: 'Downloading update',
        message: `${status.percent || 0}% complete. You can keep working.`,
        progress: status.percent || 0
      });
      return;
    }

    if (status.state === 'downloaded') {
      showNotice({
        title: `WorkTracker ${status.version} is ready`,
        message: 'Restart when convenient to finish updating.',
        canInstall: true,
        progress: 100
      });
      lastManualCheck = false;
      return;
    }

    if (status.state === 'idle' && lastManualCheck) {
      quietToast(friendlyUpdateMessage(status.message, 'No new updates available.'), 'success');
      hideNotice();
      lastManualCheck = false;
      return;
    }

    if (status.state === 'error' && lastManualCheck) {
      const msg = friendlyUpdateMessage(status.message, 'Could not check for updates right now.');
      quietToast(msg, msg.toLowerCase().includes('no new update') || msg.toLowerCase().includes('up to date') ? 'success' : 'warning');
      hideNotice();
      lastManualCheck = false;
      return;
    }

    if (status.state === 'error') hideNotice();
  });
})();
