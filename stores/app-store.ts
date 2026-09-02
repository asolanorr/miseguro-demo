import { create } from "zustand";

type AppStore = {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  isSidebarOpen: false,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}));
