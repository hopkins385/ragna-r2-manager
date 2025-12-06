export interface FileWithPath {
  file: File;
  relativePath: string;
}

const MAX_DEPTH = 3;

/**
 * Process a directory entry and extract all files with their relative paths
 * Limits traversal to MAX_DEPTH levels deep
 */
async function processDirectoryEntry(
  entry: FileSystemDirectoryEntry,
  basePath: string = "",
  currentDepth: number = 0,
): Promise<FileWithPath[]> {
  if (currentDepth >= MAX_DEPTH) {
    console.warn(`Skipping directory ${basePath} - max depth ${MAX_DEPTH} reached`);
    return [];
  }

  const files: FileWithPath[] = [];
  const reader = entry.createReader();

  // Read all entries in this directory
  const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
    reader.readEntries(resolve, reject);
  });

  for (const childEntry of entries) {
    const childPath = basePath ? `${basePath}/${childEntry.name}` : childEntry.name;

    if (childEntry.isFile) {
      const fileEntry = childEntry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve, reject) => {
        fileEntry.file(resolve, reject);
      });

      files.push({
        file,
        relativePath: childPath,
      });
    } else if (childEntry.isDirectory) {
      const dirEntry = childEntry as FileSystemDirectoryEntry;
      const nestedFiles = await processDirectoryEntry(
        dirEntry,
        childPath,
        currentDepth + 1,
      );
      files.push(...nestedFiles);
    }
  }

  return files;
}

/**
 * Process dropped items and extract all files with their folder structure
 * Supports both files and folders (up to MAX_DEPTH levels deep)
 */
export async function processDroppedItems(
  dataTransferItems: DataTransferItemList,
): Promise<FileWithPath[]> {
  const files: FileWithPath[] = [];

  for (let i = 0; i < dataTransferItems.length; i++) {
    const item = dataTransferItems[i];

    if (item.kind !== "file") continue;

    const entry = item.webkitGetAsEntry();
    if (!entry) continue;

    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve, reject) => {
        fileEntry.file(resolve, reject);
      });

      files.push({
        file,
        relativePath: file.name,
      });
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const folderFiles = await processDirectoryEntry(dirEntry, entry.name, 0);
      files.push(...folderFiles);
    }
  }

  return files;
}

/**
 * Calculate the depth of a path
 */
export function getPathDepth(path: string): number {
  return path.split("/").filter(Boolean).length;
}

/**
 * Validate that all file paths are within the max depth limit
 */
export function validatePathDepths(files: FileWithPath[]): boolean {
  return files.every((f) => getPathDepth(f.relativePath) <= MAX_DEPTH);
}
