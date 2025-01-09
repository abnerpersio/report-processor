import { s3Client } from "@/lib/clients/s3";
import {
  AbortMultipartUploadCommand,
  CompletedPart,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from "@aws-sdk/client-s3";

export class S3MPUManager {
  private uploadId: string | undefined;

  private partNumber = 1;

  private uploadedParts: CompletedPart[] = [];

  constructor(
    private readonly bucketName: string,
    private readonly fileKey: string
  ) {}

  async start() {
    const command = new CreateMultipartUploadCommand({
      Key: this.fileKey,
      Bucket: this.bucketName,
    });

    const { UploadId } = await s3Client.send(command);

    if (!UploadId) {
      throw new Error("Failed uploading multipart file");
    }

    this.uploadId = UploadId;
  }

  async uploadPart(body: Buffer) {
    if (!this.uploadId) {
      throw new Error("Upload multipart did not started");
    }

    const previousPartNumber = this.partNumber;
    this.partNumber++;

    const command = new UploadPartCommand({
      Key: this.fileKey,
      Bucket: this.bucketName,
      UploadId: this.uploadId,
      PartNumber: previousPartNumber,
      Body: body,
    });

    const { ETag } = await s3Client.send(command);

    this.uploadedParts.push({ ETag, PartNumber: previousPartNumber });
  }

  async complete() {
    if (!this.uploadId) {
      throw new Error("Upload multipart did not started");
    }

    const command = new CompleteMultipartUploadCommand({
      Key: this.fileKey,
      Bucket: this.bucketName,
      UploadId: this.uploadId,
      MultipartUpload: {
        Parts: this.uploadedParts,
      },
    });

    await s3Client.send(command);
  }

  async abort() {
    if (!this.uploadId) {
      throw new Error("Upload multipart did not started");
    }

    const command = new AbortMultipartUploadCommand({
      Key: this.fileKey,
      Bucket: this.bucketName,
      UploadId: this.uploadId,
    });

    await s3Client.send(command);
  }
}
