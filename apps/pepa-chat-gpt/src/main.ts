import { NestFactory } from '@nestjs/core';
import { PepaChatGptModule } from './pepa-chat-gpt.module';

async function bootstrap() {
  const app = await NestFactory.create(PepaChatGptModule);
  await app.listen(3001);
}
bootstrap();
