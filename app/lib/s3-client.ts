import { S3mini } from "s3mini";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accountId || !accessKeyId || !secretAccessKey) {
  throw new Error("Missing R2 credentials. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.");
}

export function createS3Client(bucketName: string): S3mini {
  return new S3mini({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com/${bucketName}`,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
  });
}
