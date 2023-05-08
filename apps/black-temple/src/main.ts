import { NestFactory } from '@nestjs/core';
import { BlackTempleModule } from './black-temple.module';

async function bootstrap() {
  const app = await NestFactory.create(BlackTempleModule);
  await app.listen(3000);
}
bootstrap();
