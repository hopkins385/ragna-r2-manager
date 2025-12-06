import {
  deleteAllObjects,
  deleteObjects,
  listBuckets,
  listObjects,
  R2Object,
  uploadObject,
} from "@/actions";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function useR2Bucket() {
  const { confirm } = useConfirmDialog();
  const [buckets, setBuckets] = useState<string[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [objects, setObjects] = useState<R2Object[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadBuckets = useCallback(async () => {
    try {
      const bucketList = await listBuckets();
      setBuckets(bucketList);
      if (bucketList.length > 0) {
        setSelectedBucket(bucketList[0]);
      }
    } catch (err) {
      console.error("Failed to load buckets", err);
      toast.error("Failed to load buckets. Check your credentials.");
    }
  }, []);

  const fetchObjects = useCallback(
    async (reset = false) => {
      if (!selectedBucket) return;

      setLoading(true);
      try {
        const currentCursor = reset ? undefined : cursor;
        const result = await listObjects(selectedBucket, "", currentCursor);

        setObjects((prev) =>
          reset ? result.objects : [...prev, ...result.objects],
        );
        setCursor(result.nextCursor);
        setHasMore(!!result.nextCursor);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load objects.");
      } finally {
        setLoading(false);
      }
    },
    [cursor, selectedBucket],
  );

  // Fetch objects when bucket changes
  useEffect(() => {
    if (selectedBucket) {
      setObjects([]);
      setCursor(undefined);
      setHasMore(true);
      setSelectedKeys(new Set());
      fetchObjects(true);
    }
  }, [selectedBucket]);

  const toggleSelect = (key: string) => {
    const newSelected = new Set(selectedKeys);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedKeys(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedKeys.size === objects.length && objects.length > 0) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(objects.map((o) => o.key)));
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Objects",
      description: `Are you sure you want to delete ${selectedKeys.size} objects from ${selectedBucket}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      const keysToDelete = Array.from(selectedKeys);
      const result = await deleteObjects(selectedBucket, keysToDelete);

      if (result.errors.length > 0) {
        throw new Error("Some objects failed to delete");
      }

      // Remove deleted objects from state
      const deletedSet = new Set(result.deleted?.map((d) => d.Key));
      setObjects((prev) => prev.filter((o) => !deletedSet.has(o.key)));
      setSelectedKeys(new Set());

      // Show success toast
      toast.success(
        `Deleted ${result.deleted?.length || 0} objects from ${selectedBucket}`,
      );

      // If we deleted everything visible and there's more, fetch more
      if (objects.length - deletedSet.size === 0 && hasMore) {
        fetchObjects(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete selected objects.");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    const confirmed1 = await confirm({
      title: "Delete All Objects - Warning",
      description: `This will delete ALL objects in bucket "${selectedBucket}". This action cannot be undone.`,
      confirmText: "Continue",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed1) return;

    const confirmed2 = await confirm({
      title: "Final Confirmation",
      description: `Are you absolutely sure? All data in "${selectedBucket}" will be lost forever.`,
      confirmText: "Delete All",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed2) return;

    setDeleting(true);
    try {
      const result = await deleteAllObjects(selectedBucket);
      if (!result.success) {
        throw new Error("Failed to delete all objects");
      }
      toast.success(`All objects deleted successfully from ${selectedBucket}`);
      fetchObjects(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete all objects.");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = async (files: File[], prefix: string = "") => {
    if (!selectedBucket) return;

    try {
      // We could parallelize this, but let's do it sequentially for simplicity and error handling
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        await uploadObject(selectedBucket, formData, prefix);
      }
      const location = prefix ? `${prefix} folder` : selectedBucket;
      toast.success(`Uploaded ${files.length} files to ${location}`);
      // Refresh object list
      fetchObjects(true);
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Failed to upload files.");
    }
  };

  return {
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
  };
}
