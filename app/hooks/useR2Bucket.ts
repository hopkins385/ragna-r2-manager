import {
  deleteAllObjects,
  deleteObjects,
  listBuckets,
  listObjects,
  R2Object,
  uploadObject,
} from "@/actions";
import { useAlert } from "@/hooks/useAlert";
import { useCallback, useEffect, useState } from "react";

export function useR2Bucket() {
  const { showAlert } = useAlert();
  const [buckets, setBuckets] = useState<string[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [objects, setObjects] = useState<R2Object[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadBuckets = async () => {
    try {
      const bucketList = await listBuckets();
      setBuckets(bucketList);
      if (bucketList.length > 0) {
        setSelectedBucket(bucketList[0]);
      }
    } catch (err) {
      console.error("Failed to load buckets", err);
      showAlert("Failed to load buckets. Check your credentials.", {
        variant: "destructive",
        title: "Load Error",
      });
    }
  };

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
        showAlert("Failed to load objects.", {
          variant: "destructive",
          title: "Load Error",
        });
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
    if (
      !confirm(
        `Are you sure you want to delete ${selectedKeys.size} objects from ${selectedBucket}?`,
      )
    )
      return;

    setDeleting(true);
    try {
      const keysToDelete = Array.from(selectedKeys);
      const result = await deleteObjects(selectedBucket, keysToDelete);

      if (result.errors.length > 0) {
        showAlert(
          `Failed to delete some objects: ${result.errors.length} errors.`,
          { variant: "destructive", title: "Delete Error" },
        );
      }

      // Remove deleted objects from state
      const deletedSet = new Set(result.deleted?.map((d) => d.Key));
      setObjects((prev) => prev.filter((o) => !deletedSet.has(o.key)));
      setSelectedKeys(new Set());

      // If we deleted everything visible and there's more, fetch more
      if (objects.length - deletedSet.size === 0 && hasMore) {
        fetchObjects(true);
      }
    } catch (err) {
      console.error(err);
      showAlert("Failed to delete objects.", {
        variant: "destructive",
        title: "Delete Error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    const confirm1 = confirm(
      `WARNING: This will delete ALL objects in bucket "${selectedBucket}". This action cannot be undone.`,
    );
    if (!confirm1) return;

    const confirm2 = confirm(
      `Are you absolutely sure? All data in "${selectedBucket}" will be lost forever.`,
    );
    if (!confirm2) return;

    setDeleting(true);
    try {
      const result = await deleteAllObjects(selectedBucket);
      // show..(`Successfully deleted ${result.count} objects.`, {
      //   title: "Success",
      // });
      // Refresh
      fetchObjects(true);
    } catch (err) {
      console.error(err);
      showAlert("Failed to delete all objects.", {
        variant: "destructive",
        title: "Delete Error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = async (files: File[]) => {
    if (!selectedBucket) return;

    // Optimistic UI or separate loading state for upload could be added here
    // For now, we'll just use the global loading state or a local one if we were inside the component
    // But since this is a hook, let's just return the promise and let the component handle UI feedback if needed,
    // or we can add an uploading state to the hook.

    // Let's add a simple uploading state to the hook?
    // Actually, let's just do it one by one and refresh.

    try {
      // We could parallelize this, but let's do it sequentially for simplicity and error handling
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        await uploadObject(selectedBucket, formData);
      }
      fetchObjects(true);
    } catch (err) {
      console.error("Upload failed", err);
      showAlert("Failed to upload files.", {
        variant: "destructive",
        title: "Upload Error",
      });
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
