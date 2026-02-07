import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.setGlobalPrefix('api');

  // Seed sample data on startup
  const doctorSeederService = app.get('DoctorSeederService');
  if (doctorSeederService) {
    try {
      await doctorSeederService.seedSampleDoctors();
    } catch (error) {
      console.error('Failed to seed sample doctors:', error);
    }
  }

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
  console.log(`Server listening on ${await app.getUrl()}`);
}

bootstrap();
