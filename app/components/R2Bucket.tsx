"use client";

import { useEffect } from "react";
import { useR2Bucket } from "../hooks/useR2Bucket";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import FileUploader from "./FileUploader";

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
        error,
        fetchObjects,
        toggleSelect,
        toggleSelectAll,
        handleDelete,
        handleDeleteAll,
        handleUpload
    } = useR2Bucket();

    // Fetch buckets on mount
    useEffect(() => {
        loadBuckets();
    }, []);

    return (
<>
                {error && (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <p className="text-destructive">{error}</p>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Select Bucket</CardTitle>
                        <CardDescription>Choose an R2 bucket to manage its objects</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a bucket" />
                            </SelectTrigger>
                            <SelectContent>
                                {buckets.map(b => (
                                    <SelectItem key={b} value={b}>{b}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {selectedBucket && (
                    <FileUploader onUpload={handleUpload} disabled={loading || deleting} />
                )}

                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <Badge variant="secondary">{objects.length} objects loaded</Badge>
                        <Badge variant="secondary">{selectedKeys.size} selected</Badge>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={selectedKeys.size === 0 || deleting}
                        >
                            {deleting ? "Deleting..." : "Delete Selected"}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAll}
                            disabled={!selectedBucket || deleting}
                        >
                            Delete ALL Objects
                        </Button>
                    </div>
                </div>

                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={objects.length > 0 && selectedKeys.size === objects.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Key</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Last Modified</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {objects.map((obj) => (
                                <TableRow key={obj.key} className={selectedKeys.has(obj.key) ? "bg-muted/50" : ""}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedKeys.has(obj.key)}
                                            onCheckedChange={() => toggleSelect(obj.key)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium truncate max-w-md" title={obj.key}>
                                        {obj.key}
                                    </TableCell>
                                    <TableCell>
                                        {obj.size ? (obj.size / 1024).toFixed(2) + " KB" : "-"}
                                    </TableCell>
                                    <TableCell>
                                        {obj.lastModified ? new Date(obj.lastModified).toLocaleString() : "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {objects.length === 0 && !loading && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        {selectedBucket ? "No objects found or bucket is empty." : "Select a bucket to view objects."}
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
