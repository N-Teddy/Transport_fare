import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './config/swagger.config';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const app = await NestFactory.create(AppModule, adapter);

    // Apply configurations
    app.enableCors({
        origin: true,
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.setGlobalPrefix(process.env.API_PREFIX || 'api');
    setupSwagger(app);

    await app.init();

    // Local development
    const port = process.env.PORT;
    await app.listen(port, '0.0.0.0');
    console.log(
        `Server running on http://localhost:${port}/api`,
        `Doc running on http://localhost:${port}/api/docs`,
    );
}
bootstrap();
