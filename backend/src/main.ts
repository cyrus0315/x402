import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS - 允许所有来源（Hackathon 演示用）
  app.enableCors({
    origin: true, // 允许所有来源
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-payment', 'x-wallet-address'],
    credentials: true,
  });
  
  // Validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`
  🚀 PayPerInsight Backend is running!
  
  📍 Server:    http://localhost:${port}
  📡 API:       http://localhost:${port}/api
  💰 x402:      Enabled
  
  📋 Endpoints:
     GET  /api/content          - List all content
     GET  /api/content/:id      - Get content (requires x402 payment)
     POST /api/content          - Create content
     GET  /api/user/unlocked    - Get user's unlocked content
  `);
}

bootstrap();

