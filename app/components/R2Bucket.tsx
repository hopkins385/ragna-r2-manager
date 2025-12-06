"use client";

import FileUploader from "@/components/FileUploader";
import { useR2Bucket } from "@/hooks/useR2Bucket";
import { useTreeView } from "@/hooks/useTreeView";
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
import {
  ChevronRightIcon,
  DownloadIcon,
  FolderIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect } from "react";
import { TableMenu } from "./TableMenu";

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
    handleDownload,
  } = useR2Bucket();

  const {
    treeViewEnabled,
    setTreeViewEnabled,
    currentPrefix,
    setCurrentPrefix,
    displayItems,
    navigateToFolder,
    breadcrumbs,
    resetPrefix,
  } = useTreeView(objects);

  // Watch: When bucket changes or tree view is toggled, Reset prefix to root
  useEffect(() => {
    resetPrefix();
  }, [selectedBucket, treeViewEnabled]);

  // OnMounted: Fetch buckets
  useEffect(() => {
    loadBuckets();
  }, []);

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
        <FileUploader
          onUpload={handleUpload}
          disabled={loading || deleting}
          prefix={treeViewEnabled ? currentPrefix : undefined}
        />
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
              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Tree View
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={selectedKeys.size === 0 || loading}
          >
            <DownloadIcon className="h-4 w-4" />
            Download
          </Button>
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

      <TreeViewBreadcrumb
        treeViewEnabled={treeViewEnabled}
        breadcrumbs={breadcrumbs}
        setCurrentPrefix={setCurrentPrefix}
      />

      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    treeViewEnabled
                      ? displayItems.filter((item) => !item.isFolder).length >
                          0 &&
                        displayItems
                          .filter((item) => !item.isFolder)
                          .every((item) => selectedKeys.has(item.object.key))
                      : objects.length > 0 &&
                        selectedKeys.size === objects.length
                  }
                  onCheckedChange={() =>
                    toggleSelectAll(treeViewEnabled, displayItems)
                  }
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
                    className="hover:bg-muted/50 cursor-pointer"
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

interface BreadcrumbsProps {
  treeViewEnabled?: boolean;
  breadcrumbs: string[];
  setCurrentPrefix: (prefix: string) => void;
}

function TreeViewBreadcrumb({
  treeViewEnabled,
  breadcrumbs,
  setCurrentPrefix,
}: BreadcrumbsProps) {
  if (!treeViewEnabled || breadcrumbs.length === 0) {
    return null;
  }

  return (
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
            <ChevronRightIcon className="text-muted-foreground h-4 w-4" />
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
  );
}
