"use client";

import { Card, CardContent } from "@/ui/card";
import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  disabled?: boolean;
}

export default function FileUploader({
  onUpload,
  disabled,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      try {
        await onUpload(acceptedFiles);
      } finally {
        setUploading(false);
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || uploading,
  });

  return (
    <Card
      {...getRootProps()}
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
            Drop the files here
          </p>
        ) : (
          <div className="text-center">
            <p className="mb-1 text-sm font-medium">Drag & drop files here</p>
            <p className="text-muted-foreground text-xs">
              or click to select files to upload
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
