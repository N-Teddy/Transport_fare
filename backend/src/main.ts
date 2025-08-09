import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
        origin: true,
        credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.setGlobalPrefix(process.env.API_PREFIX || 'api');
    setupSwagger(app);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`Application is running on: http://localhost:${port}/api`);
    console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
    console.log('RabbitMq admin panel at  👉 http://localhost:15672');
}
bootstrap();
