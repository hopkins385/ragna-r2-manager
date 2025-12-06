"use server";

import { s3Client } from "@/lib/s3-client";
import {
  DeleteObjectsCommand,
  GetObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

export interface R2Object {
  key: string;
  lastModified?: Date;
  size?: number;
}

export async function listBuckets() {
  try {
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    return (
      response.Buckets?.map((b) => b.Name).filter((n): n is string => !!n) || []
    );
  } catch (error) {
    console.error("Error listing buckets:", error);
    // Fallback to env var if listing fails (e.g. permissions)
    const envBucket = process.env.R2_BUCKET_NAME;
    if (envBucket) return [envBucket];
    return [];
  }
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
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      ContinuationToken: cursor,
      MaxKeys: 50,
    });

    const response = await s3Client.send(command);

    const objects: R2Object[] =
      response.Contents?.map((item) => ({
        key: item.Key || "",
        lastModified: item.LastModified,
        size: item.Size,
      })) || [];

    return {
      objects,
      nextCursor: response.NextContinuationToken,
      isTruncated: response.IsTruncated,
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
    const command = new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
        Quiet: false,
      },
    });

    const response = await s3Client.send(command);

    return {
      deleted: response.Deleted || [],
      errors: response.Errors || [],
    };
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
  let continuationToken: string | undefined = undefined;
  let hasMore = true;

  try {
    while (hasMore) {
      const listCommand = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      });

      const listResponse: ListObjectsV2CommandOutput =
        await s3Client.send(listCommand);

      const objects = listResponse.Contents;
      if (!objects || objects.length === 0) {
        hasMore = false;
        break;
      }

      const keys = objects.map((o) => ({ Key: o.Key }));

      const deleteCommand = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: keys,
          Quiet: true,
        },
      });

      await s3Client.send(deleteCommand);
      deletedCount += keys.length;

      continuationToken = listResponse.NextContinuationToken;
      hasMore = !!continuationToken;
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

    // Construct the full key with the prefix (folder path) and relative path
    // If relativePath is provided, use it (this preserves folder structure)
    // Otherwise, just use the file name
    let key: string;
    if (relativePath) {
      key = prefix ? `${prefix}${relativePath}` : relativePath;
    } else {
      key = prefix ? `${prefix}${file.name}` : file.name;
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);
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
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("No data returned from S3");
    }

    // Convert the stream to a buffer
    const buffer = await response.Body.transformToByteArray();

    return {
      data: Buffer.from(buffer).toString("base64"),
      contentType: response.ContentType || "application/octet-stream",
      contentLength: response.ContentLength,
    };
  } catch (error) {
    console.error("Error downloading object:", error);
    throw new Error("Failed to download object");
  }
}
