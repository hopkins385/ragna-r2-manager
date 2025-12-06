import { R2Object } from "@/actions";
import { useTreeViewStore } from "@/stores/tree-view.store";
import { useMemo, useState } from "react";

// Helper type for virtual folder items
interface FolderItem {
  name: string;
  isFolder: true;
  fullPath: string;
}

interface FileItem {
  name: string;
  isFolder: false;
  object: {
    key: string;
    size?: number;
    lastModified?: Date;
  };
}

export type DisplayItem = FolderItem | FileItem;

export function useTreeView(objects: R2Object[]) {
  const { treeViewEnabled, setTreeViewEnabled } = useTreeViewStore();
  const [currentPrefix, setCurrentPrefix] = useState<string>("");

  // Parse objects into folders and files based on current prefix
  const displayItems = useMemo<DisplayItem[]>(() => {
    if (!treeViewEnabled) {
      // Return all objects as-is when tree view is disabled
      return objects.map((obj) => ({
        name: obj.key,
        isFolder: false as const,
        object: obj,
      }));
    }

    const folders = new Set<string>();
    const files: FileItem[] = [];

    objects.forEach((obj) => {
      // Check if the key starts with the current prefix
      if (!obj.key.startsWith(currentPrefix)) {
        return;
      }

      // Get the remaining part after the current prefix
      const remaining = obj.key.slice(currentPrefix.length);

      // Find the first slash in the remaining part
      const slashIndex = remaining.indexOf("/");

      if (slashIndex === -1) {
        // No slash means this is a file at the current level
        files.push({
          name: remaining,
          isFolder: false,
          object: obj,
        });
      } else {
        // There's a slash, so extract the folder name
        const folderName = remaining.slice(0, slashIndex);
        folders.add(folderName);
      }
    });

    // Convert folders to FolderItems
    const folderItems: FolderItem[] = Array.from(folders).map((name) => ({
      name,
      isFolder: true,
      fullPath: currentPrefix + name + "/",
    }));

    // Sort folders first, then files
    return [
      ...folderItems.sort((a, b) => a.name.localeCompare(b.name)),
      ...files.sort((a, b) => a.name.localeCompare(b.name)),
    ];
  }, [objects, treeViewEnabled, currentPrefix]);

  // Navigate into a folder
  const navigateToFolder = (folderPath: string) => {
    setCurrentPrefix(folderPath);
  };

  // Navigate up to parent folder
  const navigateUp = () => {
    if (!currentPrefix) return;
    const parts = currentPrefix.split("/").filter(Boolean);
    parts.pop();
    setCurrentPrefix(parts.length > 0 ? parts.join("/") + "/" : "");
  };

  // Get breadcrumb parts
  const breadcrumbs = useMemo(() => {
    if (!currentPrefix) return [];
    return currentPrefix.split("/").filter(Boolean);
  }, [currentPrefix]);

  // Reset prefix when tree view is toggled
  const resetPrefix = () => {
    setCurrentPrefix("");
  };

  return {
    treeViewEnabled,
    setTreeViewEnabled,
    currentPrefix,
    setCurrentPrefix,
    displayItems,
    navigateToFolder,
    navigateUp,
    breadcrumbs,
    resetPrefix,
  };
}
