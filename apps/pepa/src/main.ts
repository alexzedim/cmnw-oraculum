import { NestFactory } from '@nestjs/core';
import { PepaModule } from './pepa.module';

async function bootstrap() {
  const app = await NestFactory.create(PepaModule);
  await app.listen(3001);
}
bootstrap();
