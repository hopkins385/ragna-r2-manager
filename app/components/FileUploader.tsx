"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "./ui/card";
import { Upload } from "lucide-react";

interface FileUploaderProps {
    onUpload: (files: File[]) => Promise<void>;
    disabled?: boolean;
}

export default function FileUploader({ onUpload, disabled }: FileUploaderProps) {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        setUploading(true);
        try {
            await onUpload(acceptedFiles);
        } finally {
            setUploading(false);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        disabled: disabled || uploading
    });

    return (
        <Card
            {...getRootProps()}
            className={`border-2 border-dashed cursor-pointer transition-all ${
                isDragActive ? "border-primary bg-primary/5" : "hover:border-primary/50"
            } ${(disabled || uploading) ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            <CardContent className="flex flex-col items-center justify-center py-10">
                <input {...getInputProps()} />
                <Upload className={`h-10 w-10 mb-4 ${isDragActive ? "text-primary" : "text-muted-foreground"}`} />
                {uploading ? (
                    <p className="text-sm font-medium">Uploading files...</p>
                ) : isDragActive ? (
                    <p className="text-sm font-medium text-primary">Drop the files here</p>
                ) : (
                    <div className="text-center">
                        <p className="text-sm font-medium mb-1">Drag & drop files here</p>
                        <p className="text-xs text-muted-foreground">or click to select files to upload</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
