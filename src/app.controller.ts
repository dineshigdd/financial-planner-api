import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getRoot() {
    return {
      message: 'Financial Planner API',
      version: '1.0.0',
      status: 'running',
    };
  }

  @Get('health')
  async healthCheck() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'disconnected',
        error: error.message,
      };
    }
  }


  @Get('db-test')
  async testDatabaseConnection() {
    try {
      const userCount = await this.prisma.user.count();
      return {
        status: 'success',
        message: 'Database connection successful',
        userCount,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  } 
}