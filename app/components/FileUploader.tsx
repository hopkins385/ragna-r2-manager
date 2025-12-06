"use client";

import { processDroppedItems } from "@/lib/folder-utils";
import type { FileWithPath } from "@/lib/folder-utils";
import { Card, CardContent } from "@/ui/card";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

interface FileUploaderProps {
  onUpload: (files: FileWithPath[], prefix?: string) => Promise<void>;
  disabled?: boolean;
  prefix?: string;
}

export default function FileUploader({
  onUpload,
  disabled,
  prefix,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();

      if (disabled || uploading) return;

      setUploading(true);
      try {
        const items = event.dataTransfer.items;
        const filesWithPaths = await processDroppedItems(items);

        if (filesWithPaths.length === 0) {
          toast.error("No files found in the dropped items");
          return;
        }

        await onUpload(filesWithPaths, prefix);
      } catch (error) {
        console.error("Error processing dropped items:", error);
        toast.error("Failed to process dropped files/folders");
      } finally {
        setUploading(false);
      }
    },
    [onUpload, prefix, disabled, uploading],
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      try {
        // Convert Files to FileWithPath, preserving folder structure
        const filesWithPaths: FileWithPath[] = acceptedFiles.map((file) => ({
          file,
          // webkitRelativePath contains the full path including folder structure
          // If empty (single file), use just the file name
          relativePath: (file as any).webkitRelativePath || file.name,
        }));

        await onUpload(filesWithPaths, prefix);
      } finally {
        setUploading(false);
      }
    },
    [onUpload, prefix],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || uploading,
    noClick: false,
  });

  return (
    <Card
      {...getRootProps()}
      onDrop={handleDrop}
      className={`cursor-pointer border-2 border-dashed transition-all ${
        isDragActive ? "border-primary bg-primary/5" : "hover:border-primary/50"
      } ${disabled || uploading ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <CardContent className="flex flex-col items-center justify-center py-10">
        <input {...getInputProps()} />
        <Upload
          className={`mb-4 h-10 w-10 ${isDragActive ? "text-primary" : "text-muted-foreground"}`}
        />
        {uploading ? (
          <p className="text-sm font-medium">Uploading files...</p>
        ) : isDragActive ? (
          <p className="text-primary text-sm font-medium">
            Drop the files or folders here
          </p>
        ) : (
          <div className="text-center">
            <p className="mb-1 text-sm font-medium">Drag & drop files or folders here</p>
            <p className="text-muted-foreground text-xs">
              or click to select files to upload (folders up to 3 levels deep)
            </p>
            {prefix && (
              <p className="text-muted-foreground mt-2 text-xs">
                Upload to: <span className="font-medium">{prefix}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
