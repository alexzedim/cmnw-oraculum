import { NestFactory } from '@nestjs/core';
import { RivenModule } from './riven.module';

async function bootstrap() {
  const app = await NestFactory.create(RivenModule);
  await app.listen(3000);
}
bootstrap();
