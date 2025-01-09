import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "./s3";

const EXPIRES_IN_SECONDS = 24 * 60 * 60; // 24h;

type Params = {
  bucket: string;
  fileKey: string;
};

export async function getPresignedUrl({ bucket, fileKey }: Params) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: fileKey });

  return await getSignedUrl(s3Client, command, {
    expiresIn: EXPIRES_IN_SECONDS,
  });
}
