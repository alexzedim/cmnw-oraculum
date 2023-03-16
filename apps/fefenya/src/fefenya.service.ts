import { Injectable } from '@nestjs/common';

@Injectable()
export class FefenyaService {
  getHello(): string {
    return 'Hello World!';
  }
}
