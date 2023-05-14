import { NestFactory } from '@nestjs/core';
import { RodrigaModule } from './rodriga.module';

async function bootstrap() {
  const app = await NestFactory.create(RodrigaModule);
  await app.listen(3000);
}
bootstrap();
