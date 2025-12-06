"use client";

import FileUploader from "@/components/FileUploader";
import { useR2Bucket } from "@/hooks/useR2Bucket";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Checkbox } from "@/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { ChevronRightIcon, FolderIcon, Trash2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TableMenu } from "./TableMenu";

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

type DisplayItem = FolderItem | FileItem;

export default function R2Bucket() {
  const {
    loadBuckets,
    buckets,
    selectedBucket,
    setSelectedBucket,
    objects,
    selectedKeys,
    loading,
    deleting,
    hasMore,
    fetchObjects,
    toggleSelect,
    toggleSelectAll,
    handleDelete,
    handleDeleteAll,
    handleUpload,
  } = useR2Bucket();

  // Tree view state
  const [treeViewEnabled, setTreeViewEnabled] = useState(false);
  const [currentPrefix, setCurrentPrefix] = useState("");

  // Fetch buckets on mount
  useEffect(() => {
    loadBuckets();
  }, []);

  // Reset prefix when bucket changes or tree view is toggled
  useEffect(() => {
    setCurrentPrefix("");
  }, [selectedBucket, treeViewEnabled]);

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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Select Bucket</CardTitle>
          <CardDescription>
            Choose an R2 bucket to manage its objects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedBucket} onValueChange={setSelectedBucket}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a bucket" />
            </SelectTrigger>
            <SelectContent>
              {buckets.map((bucket) => (
                <SelectItem key={bucket} value={bucket}>
                  {bucket}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedBucket && (
        <FileUploader onUpload={handleUpload} disabled={loading || deleting} />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">{objects.length} objects loaded</Badge>
          <Badge variant="secondary">{selectedKeys.size} selected</Badge>
          <div className="flex items-center gap-2">
            <Checkbox
              id="tree-view"
              checked={treeViewEnabled}
              onCheckedChange={(checked) =>
                setTreeViewEnabled(checked === true)
              }
            />
            <label
              htmlFor="tree-view"
              className="cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Tree View
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={selectedKeys.size === 0 || deleting}
            className="hover:text-destructive"
          >
            <Trash2Icon className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete Selected"}
          </Button>
          <TableMenu
            handleDeleteAll={handleDeleteAll}
            selectedBucket={selectedBucket}
            deleting={deleting}
          />
        </div>
      </div>

      {treeViewEnabled && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPrefix("")}
            className="h-7 px-2"
          >
            Root
          </Button>
          {breadcrumbs.map((part, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const path = breadcrumbs.slice(0, index + 1).join("/") + "/";
            return (
              <div key={index} className="flex items-center gap-2">
                <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                {isLast ? (
                  <span className="font-medium">{part}</span>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPrefix(path)}
                    className="h-7 px-2"
                  >
                    {part}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    objects.length > 0 && selectedKeys.size === objects.length
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Modified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayItems.map((item) => {
              if (item.isFolder) {
                return (
                  <TableRow
                    key={item.fullPath}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigateToFolder(item.fullPath)}
                  >
                    <TableCell></TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FolderIcon className="h-4 w-4 text-blue-500" />
                        <span>{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      Folder
                    </TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                );
              }

              return (
                <TableRow
                  key={item.object.key}
                  className={
                    selectedKeys.has(item.object.key) ? "bg-muted/50" : ""
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedKeys.has(item.object.key)}
                      onCheckedChange={() => toggleSelect(item.object.key)}
                    />
                  </TableCell>
                  <TableCell
                    className="max-w-md truncate font-medium"
                    title={item.object.key}
                  >
                    {treeViewEnabled ? item.name : item.object.key}
                  </TableCell>
                  <TableCell>
                    {item.object.size
                      ? (item.object.size / 1024).toFixed(2) + " KB"
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {item.object.lastModified
                      ? new Date(item.object.lastModified).toLocaleString()
                      : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
            {displayItems.length === 0 && !loading && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground h-24 text-center"
                >
                  {selectedBucket
                    ? treeViewEnabled && currentPrefix
                      ? "No items in this folder."
                      : "No objects found or bucket is empty."
                    : "Select a bucket to view objects."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {hasMore && selectedBucket && (
        <div className="text-center">
          <Button
            onClick={() => fetchObjects(false)}
            disabled={loading}
            variant="outline"
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </>
  );
}
