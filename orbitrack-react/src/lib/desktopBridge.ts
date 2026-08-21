interface WorkTrackerDesktopBridge {
  isDesktop?: boolean;
  platform?: string;
  getVersion?: () => Promise<string>;
  openExternal?: (url: string) => Promise<boolean>;
  checkForUpdates?: () => Promise<unknown>;
  installUpdate?: () => Promise<unknown>;
  onUpdateStatus?: (callback: (payload: unknown) => void) => () => void;
  onIdleState?: (callback: (payload: unknown) => void) => () => void;
}

declare global {
  interface Window {
    workTrackerDesktop?: WorkTrackerDesktopBridge;
    WT_APP_VERSION?: string;
  }
}

function safeExternalUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    return ["https:", "http:", "mailto:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export async function openExternalUrl(rawUrl: string) {
  if (!safeExternalUrl(rawUrl)) return false;

  if (window.workTrackerDesktop?.openExternal) {
    try {
      return await window.workTrackerDesktop.openExternal(rawUrl);
    } catch {
      return false;
    }
  }

  window.open(rawUrl, "_blank", "noopener,noreferrer");
  return true;
}
