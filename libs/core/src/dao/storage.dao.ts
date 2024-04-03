import { S3 } from 'nestjs-s3';
import { random } from '@cmnw/core/utils';

export const getByEmotion = async (storage: S3, bucket: string) => {
  const listObjects = await storage.listObjects({
    Bucket: bucket,
    Prefix: 'nmdc', // TODO janesina-
    // Delimiter: '-',
  });

  const { Contents: content } = listObjects;

  const itx = random(0, content.length);

  const { Key: key } = content[itx];

  const data = await storage.getObject({
    Bucket: bucket,
    Key: key,
  });

  //  const t = await this.s3.link
  // TODO download file or link?
  console.log(data);
};
