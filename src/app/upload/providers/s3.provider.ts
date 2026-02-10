import { randomUUID } from 'node:crypto';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

import { Logger } from '@nestjs/common';
import { UploadDriver } from '~/app/upload/upload.interface';
import { AppConfig } from '~/config';
import { AppBucket } from '~/config/storage';

export class S3UploadProvider implements UploadDriver {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;
  private logger = new Logger(S3UploadProvider.name);

  constructor(config: ConfigService<AppConfig>, bucket: AppBucket | undefined) {
    this.bucket = bucket || config.get('S3_BUCKET')!;
    this.publicUrl = config.get('S3_PUBLIC_URL')!;

    this.s3 = new S3Client({
      region: config.get('S3_REGION'),
      endpoint: config.get('S3_ENDPOINT'),
      credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY')!,
        secretAccessKey: config.get('S3_SECRET_KEY')!
      },
      forcePathStyle: true
    });
  }

  getKeyAndBucket() {
    this.logger.debug(
      `Getting key and bucket for bucket string: ${this.bucket}`
    );
    const [Bucket, ...prefix] = this.bucket.split('/');
    const folders = prefix.join('/');
    this.logger.debug(`Parsed Bucket: ${Bucket}, Folders: ${folders}`);

    return { Bucket, folders };
  }

  async upload(file: Express.Multer.File) {
    this.logger.debug(
      `Uploading file: ${file.originalname} to bucket: ${this.bucket}`
    );
    const id = randomUUID().concat(file.originalname);
    this.logger.debug(`Generated unique ID for file: ${id}`);
    const [bucket, ...folders] = this.bucket.split('/');
    const key = folders.length ? `${folders.join('/')}/${id}` : id;
    this.logger.debug(`Final S3 Key for upload: ${key}`);

    await this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000, immutable'
      })
    );
    const url = new URL(`${bucket}/${key}`, this.publicUrl).toString();

    this.logger.debug(`File uploaded successfully. Accessible at: ${url}`);

    return {
      key,
      url
    };
  }

  async delete(key: string): Promise<void> {
    this.logger.debug(
      `Deleting file with key: ${key} from bucket: ${this.bucket}`
    );

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.getKeyAndBucket().Bucket,
        Key: key
      })
    );

    this.logger.debug(`File with key: ${key} deleted successfully.`);
  }
}
