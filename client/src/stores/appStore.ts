import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  notificationOpen: boolean;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setSearchOpen: (open: boolean) => void;
  setNotificationOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  searchOpen: false,
  notificationOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setNotificationOpen: (open) => set({ notificationOpen: open }),
}));
