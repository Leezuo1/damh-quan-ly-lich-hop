import * as dns from 'dns';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// DNS hệ thống trên một số máy Windows dùng resolver IPv6-only khiến Node
// không querySrv được (mongodb+srv://) dù OS resolve DNS bình thường.
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
