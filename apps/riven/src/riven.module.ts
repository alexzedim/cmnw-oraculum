import { Module } from '@nestjs/common';
import { RivenService, ChatService } from './services';

@Module({
  imports: [],
  controllers: [],
  providers: [RivenService, ChatService],
})
export class RivenModule {}
