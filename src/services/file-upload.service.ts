import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";
import { env } from "../config/env";
import { HttpException } from "../core/HttpException";

export type UploadedFile = {
  url: string;
  key: string;
  bucket: string;
  mimeType: string;
  size: number;
  originalName: string;
};

export class FileUploadService {
  private client?: S3Client;

  async uploadMany(
    files: Express.Multer.File[] = [],
    options: { folder: string }
  ): Promise<UploadedFile[]> {
    if (!files.length) return [];

    const client = this.getClient();
    const bucket = this.requireBucket();

    return Promise.all(
      files.map(async (file) => {
        const key = this.buildKey(file.originalname, options.folder);

        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
          })
        );

        return {
          url: this.buildPublicUrl(bucket, key),
          key,
          bucket,
          mimeType: file.mimetype,
          size: file.size,
          originalName: file.originalname,
        };
      })
    );
  }

  private getClient() {
    if (this.client) return this.client;

    if (!env.AWS_REGION) {
      throw new HttpException(500, "AWS_REGION is required for file uploads.");
    }

    this.client = new S3Client({
      region: env.AWS_REGION,
      credentials:
        env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: env.AWS_ACCESS_KEY_ID,
              secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });

    return this.client;
  }

  private requireBucket() {
    if (!env.S3_BUCKET_NAME) {
      throw new HttpException(500, "S3_BUCKET_NAME is required for file uploads.");
    }
    return env.S3_BUCKET_NAME;
  }

  private buildKey(originalName: string, folder: string) {
    const ext = path.extname(originalName).toLowerCase();
    const safeBase = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);
    const unique = `${Date.now()}-${crypto.randomUUID()}`;

    return `${folder.replace(/^\/+|\/+$/g, "")}/${unique}-${safeBase || "file"}${ext}`;
  }

  private buildPublicUrl(bucket: string, key: string) {
    if (env.S3_PUBLIC_BASE_URL) {
      return `${env.S3_PUBLIC_BASE_URL.replace(/\/+$/g, "")}/${key}`;
    }

    return `https://${bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }
}
