import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //middleware to parse cookies
  app.use(cookieParser());

  //enable CORS with credentials
  app.enableCors({
    origin: 'http://localhost:4200', // Adjust this to your frontend's URL
    credentials: true, // Allow cookies to be sent
  });

 //enable validation globally 
 app.useGlobalPipes(new ValidationPipe({
  whitelist: true, //strip properties that do not have any decorators
  forbidNonWhitelisted: true, //throw error if non-whitelisted properties are present
  transform: true, //automatically transform payloads to DTO instances
 }));

 //swagger Documentation setup
  const config = new DocumentBuilder()
    .setTitle('Financial Planner API')
    .setDescription('API documentation for the Financial Planner application')
    .setVersion('1.0')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);  
//end swagger setup



  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
