import { Injectable } from '@nestjs/common';

@Injectable()
export class RivenService {
  getHello(): string {
    return 'Hello World!';
  }
}
