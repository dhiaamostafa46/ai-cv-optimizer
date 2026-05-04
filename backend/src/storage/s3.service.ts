import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(S3Service.name);
  private readonly useS3: boolean;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const region = process.env.S3_REGION || 'us-east-1';
    const accessKey = process.env.S3_ACCESS_KEY;
    const secretKey = process.env.S3_SECRET_KEY;
    this.bucketName = process.env.S3_BUCKET || 'cv-optimizer-files';
    this.useS3 = !!endpoint;

    const clientConfig: any = { region };

    if (endpoint && accessKey && secretKey) {
      clientConfig.endpoint = endpoint;
      clientConfig.credentials = { accessKey, secretKey };
      clientConfig.forcePathStyle = true; // For MinIO compatibility
    }

    this.s3Client = new S3Client(clientConfig);
    this.logger.log(
      `S3 initialized - ${this.useS3 ? 'S3 mode' : 'local storage mode'}`,
    );
  }

  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await this.s3Client.send(command);
      this.logger.debug(`File uploaded to S3: ${key}`);
      return key;
    } catch (error) {
      this.logger.error(`S3 upload failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('Empty response body from S3');
      }

      // Convert stream to Buffer
      const stream = response.Body as Readable;
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk: Buffer) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      this.logger.error(`S3 download failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  generateFileKey(prefix: string, filename: string): string {
    const timestamp = Date.now();
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${prefix}/${timestamp}_${sanitized}`;
  }
}