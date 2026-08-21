import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PerformanceMode = "full" | "balanced" | "low-power";

export interface ShortcutPreference {
  keys: string[];
  enabled: boolean;
}

interface UiState {
  sidebarCollapsed: boolean;
  mobileNavigationOpen: boolean;
  performanceMode: PerformanceMode;
  reducedMotion: boolean;
  blurEffects: boolean;
  routePreloading: boolean;
  realtimeEnabled: boolean;
  pinnedPages: string[];
  recentPages: string[];
  shortcutOverrides: Record<string, ShortcutPreference>;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setMobileNavigationOpen: (open: boolean) => void;
  setPerformanceMode: (mode: PerformanceMode) => void;
  setReducedMotion: (enabled: boolean) => void;
  setBlurEffects: (enabled: boolean) => void;
  setRoutePreloading: (enabled: boolean) => void;
  setRealtimeEnabled: (enabled: boolean) => void;
  rememberPage: (path: string) => void;
  togglePinnedPage: (path: string) => void;
  setShortcutOverride: (id: string, preference: ShortcutPreference) => void;
  resetShortcut: (id: string) => void;
  resetAllShortcuts: () => void;
}

const RECENT_PAGE_LIMIT = 8;

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavigationOpen: false,
      performanceMode: "balanced",
      reducedMotion: false,
      blurEffects: true,
      routePreloading: true,
      realtimeEnabled: true,
      pinnedPages: ["/dashboard", "/projects", "/tasks"],
      recentPages: [],
      shortcutOverrides: {},
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setMobileNavigationOpen: (mobileNavigationOpen) => set({ mobileNavigationOpen }),
      setPerformanceMode: (performanceMode) =>
        set((state) => ({
          performanceMode,
          reducedMotion: performanceMode === "low-power" ? true : state.reducedMotion,
          blurEffects: performanceMode === "low-power" ? false : state.blurEffects,
          routePreloading: performanceMode === "low-power" ? false : state.routePreloading,
          realtimeEnabled: performanceMode === "low-power" ? false : state.realtimeEnabled,
        })),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setBlurEffects: (blurEffects) => set({ blurEffects }),
      setRoutePreloading: (routePreloading) => set({ routePreloading }),
      setRealtimeEnabled: (realtimeEnabled) => set({ realtimeEnabled }),
      rememberPage: (path) =>
        set((state) => ({
          recentPages: [path, ...state.recentPages.filter((item) => item !== path)].slice(0, RECENT_PAGE_LIMIT),
        })),
      togglePinnedPage: (path) =>
        set((state) => ({
          pinnedPages: state.pinnedPages.includes(path)
            ? state.pinnedPages.filter((item) => item !== path)
            : [...state.pinnedPages, path],
        })),
      setShortcutOverride: (id, preference) =>
        set((state) => ({
          shortcutOverrides: { ...state.shortcutOverrides, [id]: preference },
        })),
      resetShortcut: (id) =>
        set((state) => {
          const next = { ...state.shortcutOverrides };
          delete next[id];
          return { shortcutOverrides: next };
        }),
      resetAllShortcuts: () => set({ shortcutOverrides: {} }),
    }),
    {
      name: "orbitrack.ui.foundation.v1",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        performanceMode: state.performanceMode,
        reducedMotion: state.reducedMotion,
        blurEffects: state.blurEffects,
        routePreloading: state.routePreloading,
        realtimeEnabled: state.realtimeEnabled,
        pinnedPages: state.pinnedPages,
        recentPages: state.recentPages,
        shortcutOverrides: state.shortcutOverrides,
      }),
    },
  ),
);
