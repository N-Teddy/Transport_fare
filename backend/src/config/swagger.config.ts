import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
    const configService = app.get(ConfigService);
    const config = new DocumentBuilder()
        .setTitle(configService.get<string>('APP_NAME') || 'Transport Fare App API')
        .setDescription(
            configService.get<string>('APP_DESCRIPTION') ||
                'Transport Fare App Backend API Documentation',
        )
        .setVersion(configService.get<string>('APP_VERSION') || '1.0.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                in: 'header',
                description: 'Enter your JWT token in the format: Bearer <token>',
            },
            'access-token', // This name should match the @ApiBearerAuth('access-token') decorator
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'none',
            filter: true,
            showRequestDuration: true,
        },
    });
}
