import { Injectable } from '@nestjs/common';

@Injectable()
export class RainyService {
  getHello(): string {
    return 'Hello World!';
  }
}
