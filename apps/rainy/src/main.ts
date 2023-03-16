import { NestFactory } from '@nestjs/core';
import { RainyModule } from './rainy.module';

async function bootstrap() {
  const app = await NestFactory.create(RainyModule);
  await app.listen(3000);
}
bootstrap();
