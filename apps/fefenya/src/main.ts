import { NestFactory } from '@nestjs/core';
import { FefenyaModule } from './fefenya.module';

async function bootstrap() {
  const app = await NestFactory.create(FefenyaModule);
  await app.listen(3001);
}
bootstrap();
