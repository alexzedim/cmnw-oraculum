import { Controller, Get } from '@nestjs/common';
import { RainyService } from './rainy.service';

@Controller()
export class RainyController {
  constructor(private readonly rainyService: RainyService) {}

  @Get()
  getHello(): string {
    return this.rainyService.getHello();
  }
}
