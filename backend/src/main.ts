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
  try {
    const { DoctorSeederService } = await import('./doctors/doctor-seeder.service');
    const doctorSeederService = app.get(DoctorSeederService, { strict: false });
    if (doctorSeederService) {
      await doctorSeederService.seedSampleDoctors();
    }
  } catch (error) {
    console.warn('Doctor seeder not available or failed:', (error as Error).message);
  }

  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Server listening on port ${port}`);
}

bootstrap();
