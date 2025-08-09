import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello() {
        return {
            message: 'Transport Fare App Backend is running!',
            port: 'Application is running on: http://localhost:3000/api',
            swagger: 'Swagger documentation: http://localhost:3000/api/docs',
        };
    }
}
