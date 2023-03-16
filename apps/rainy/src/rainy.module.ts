import { Module } from '@nestjs/common';
import { RainyController } from './rainy.controller';
import { RainyService } from './rainy.service';

@Module({
  imports: [],
  controllers: [RainyController],
  providers: [RainyService],
})
export class RainyModule {}
