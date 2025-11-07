import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      name: 'Financial Planner API',
      version: '1.0.0',
      description: 'Personal financial management application',
    };
  }
}