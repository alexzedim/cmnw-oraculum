import { JobsOptions } from 'bullmq';
import { QueueInterface } from '@cmnw/shared';

const queueOptions: JobsOptions = {
  removeOnComplete: 10,
  removeOnFail: 10,
};

export const chatQueue: QueueInterface = {
  name: 'ORA:chat',
  workerOptions: {
    concurrency: 1,
    limiter: {
      duration: 7_000,
      max: 1,
    },
  },
  options: {
    defaultJobOptions: queueOptions,
  },
};
