"use server";

import { createS3Client } from "@/lib/s3-client";

export interface R2Object {
  key: string;
  lastModified?: Date;
  size?: number;
}

export async function listBuckets() {
  const names = process.env.R2_BUCKET_NAMES;
  if (!names) return [];
  return names.split(",").map((b) => b.trim()).filter(Boolean);
}

export async function listObjects(
  bucketName: string,
  prefix: string = "",
  cursor?: string,
) {
  if (!bucketName) {
    throw new Error("Bucket name is required");
  }

  try {
    const s3 = createS3Client(bucketName);
    const response = await s3.listObjectsPaged("/", prefix, 50, cursor);

    const objects: R2Object[] =
      response?.objects?.map((item) => ({
        key: item.Key || "",
        lastModified: item.LastModified,
        size: item.Size,
      })) || [];

    return {
      objects,
      nextCursor: response?.nextContinuationToken,
      isTruncated: !!response?.nextContinuationToken,
    };
  } catch (error) {
    console.error("Error listing objects:", error);
    throw new Error("Failed to list objects");
  }
}

export async function deleteObjects(bucketName: string, keys: string[]) {
  if (!bucketName) {
    throw new Error("Bucket name is required");
  }

  if (keys.length === 0) return { deleted: [], errors: [] };

  try {
    const s3 = createS3Client(bucketName);
    const results = await s3.deleteObjects(keys);

    const deleted = keys
      .filter((_, i) => results[i])
      .map((key) => ({ Key: key }));
    const errors = keys
      .filter((_, i) => !results[i])
      .map((key) => ({ Key: key, Message: "Delete failed" }));

    return { deleted, errors };
  } catch (error) {
    console.error("Error deleting objects:", error);
    throw new Error("Failed to delete objects");
  }
}

export async function deleteAllObjects(bucketName: string) {
  if (!bucketName) {
    throw new Error("Bucket name is required");
  }

  let deletedCount = 0;
  let token: string | undefined = undefined;
  let hasMore = true;

  try {
    const s3 = createS3Client(bucketName);

    while (hasMore) {
      const page = await s3.listObjectsPaged("/", "", 1000, token);
      const objects = page?.objects;

      if (!objects || objects.length === 0) {
        hasMore = false;
        break;
      }

      const objectKeys = objects.map((o) => o.Key);
      await s3.deleteObjects(objectKeys);
      deletedCount += objectKeys.length;

      token = page?.nextContinuationToken;
      hasMore = !!token;
    }

    return { success: true, count: deletedCount };
  } catch (error) {
    console.error("Error deleting all objects:", error);
    throw new Error("Failed to delete all objects");
  }
}

export async function uploadObject(
  bucketName: string,
  formData: FormData,
  prefix: string = "",
  relativePath?: string,
) {
  if (!bucketName) {
    throw new Error("Bucket name is required");
  }

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("File is required");
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let key: string;
    if (relativePath) {
      key = prefix ? `${prefix}${relativePath}` : relativePath;
    } else {
      key = prefix ? `${prefix}${file.name}` : file.name;
    }

    const s3 = createS3Client(bucketName);
    await s3.putAnyObject(key, buffer, file.type);

    return { success: true, key };
  } catch (error) {
    console.error("Error uploading object:", error);
    throw new Error("Failed to upload object");
  }
}

export async function downloadObject(bucketName: string, key: string) {
  if (!bucketName) {
    throw new Error("Bucket name is required");
  }

  if (!key) {
    throw new Error("Object key is required");
  }

  try {
    const s3 = createS3Client(bucketName);
    const response = await s3.getObjectResponse(key);

    if (!response) {
      throw new Error("No data returned from S3");
    }

    const buffer = await response.arrayBuffer();

    return {
      data: Buffer.from(buffer).toString("base64"),
      contentType: response.headers.get("content-type") || "application/octet-stream",
      contentLength: Number(response.headers.get("content-length")) || undefined,
    };
  } catch (error) {
    console.error("Error downloading object:", error);
    throw new Error("Failed to download object");
  }
}
