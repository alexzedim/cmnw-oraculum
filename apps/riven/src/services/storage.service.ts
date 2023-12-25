import { Injectable, Logger } from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name, {
    timestamp: true,
  });

  constructor(@InjectS3() private readonly s3: S3) {}

  async listBuckets() {
    const params = {
      // Bucket: "<имя_бакета>", // Имя бакета, например 'sample-bucket-101'.
      // Key: "<имя_объекта>", // Имя объекта, например 'sample_upload.txt'.
      // Body: "<содержимое_объекта>", // Содержимое объекта, например 'Hello world!".
    };

    const data = await this.s3.listBuckets({});
    console.log(data);
  }

  async listObjects() {
    const data = await this.s3.listObjects({
      Bucket: 'ya-test-s3',
      // The default and maximum number of keys returned is 1000. This limits it to
      // one for demonstration purposes.
      MaxKeys: 1,
    });

    console.log(data);
  }

  async get() {
    const data = await this.s3.getObject({
      Bucket: 'ya-test-s3',
      Key: 'lythande.png',
    });

    console.log(data);
  }
}
