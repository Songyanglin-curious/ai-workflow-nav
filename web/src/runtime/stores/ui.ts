import { defineStore } from 'pinia';

export type RuntimeThemeMode = 'system' | 'light' | 'dark';
export type RuntimeDensity = 'comfortable' | 'compact';

export interface RuntimeUiState {
  sidebarCollapsed: boolean;
  density: RuntimeDensity;
  themeMode: RuntimeThemeMode;
  activePanelId: string | null;
}

export const useUiStore = defineStore('runtime-ui', {
  state: (): RuntimeUiState => ({
    sidebarCollapsed: false,
    density: 'comfortable',
    themeMode: 'system',
    activePanelId: null,
  }),
  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed;
    },
    setDensity(density: RuntimeDensity) {
      this.density = density;
    },
    setThemeMode(themeMode: RuntimeThemeMode) {
      this.themeMode = themeMode;
    },
    setActivePanelId(activePanelId: string | null) {
      this.activePanelId = activePanelId;
    },
    reset() {
      this.sidebarCollapsed = false;
      this.density = 'comfortable';
      this.themeMode = 'system';
      this.activePanelId = null;
    },
  },
});
