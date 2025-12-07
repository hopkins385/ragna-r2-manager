export interface FileWithPath {
  file: File;
  relativePath: string;
}

export const MAX_DEPTH = 10;

/**
 * Format the relative path to use forward slashes and remove leading slashes
 */
export function formatRelativePath(path: string): string {
  // remove first slash if present
  if (path.startsWith("/")) {
    path = path.slice(1);
  }
  // Normalize to use forward slashes
  return path.replace(/\\/g, "/");
}

export function formatDroppedFiles(files: File[]): FileWithPath[] {
  const filesWithPaths: FileWithPath[] = files.map((file) => ({
    file,
    relativePath: formatRelativePath((file as any).relativePath) || file.name,
  }));

  return filesWithPaths;
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
