import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name, { timestamp: true });
  constructor(
    @InjectRedis()
    private readonly redisService: Redis,
  ) {}
}
