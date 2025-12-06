import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TreeViewState {
  treeViewEnabled: boolean;
  setTreeViewEnabled: (enabled: boolean) => void;
}

export const useTreeViewStore = create<TreeViewState>()(
  persist(
    (set) => ({
      treeViewEnabled: false,
      setTreeViewEnabled: (enabled: boolean) =>
        set(() => ({ treeViewEnabled: enabled })),
    }),
    {
      name: "tree-view-storage",
    },
  ),
);
