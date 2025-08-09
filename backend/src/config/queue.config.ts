import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';

export const getQueueConfig = (): RabbitMQConfig => {
    return {
        uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
        exchanges: [
            {
                name: 'document.exchange',
                type: 'topic',
            },
            {
                name: 'notification.exchange',
                type: 'topic',
            },
            {
                name: 'payment.exchange',
                type: 'topic',
            },
            {
                name: 'trip.exchange',
                type: 'topic',
            },
        ],
        queues: [
            {
                name: 'document.upload.queue',
                exchange: 'document.exchange',
                routingKey: 'document.upload',
                options: {
                    durable: true,
                    arguments: {
                        'x-message-ttl': 300000, // 5 minutes TTL
                        'x-max-priority': 10,
                    },
                },
            },
            {
                name: 'document.process.queue',
                exchange: 'document.exchange',
                routingKey: 'document.process',
                options: {
                    durable: true,
                    arguments: {
                        'x-message-ttl': 600000, // 10 minutes TTL
                        'x-max-priority': 10,
                    },
                },
            },
            {
                name: 'document.verification.queue',
                exchange: 'document.exchange',
                routingKey: 'document.verification',
                options: {
                    durable: true,
                    arguments: {
                        'x-message-ttl': 900000, // 15 minutes TTL
                        'x-max-priority': 10,
                    },
                },
            },
            {
                name: 'notification.queue',
                exchange: 'notification.exchange',
                routingKey: 'notification.*',
                options: {
                    durable: true,
                    arguments: {
                        'x-message-ttl': 300000, // 5 minutes TTL
                    },
                },
            },
            {
                name: 'payment.queue',
                exchange: 'payment.exchange',
                routingKey: 'payment.*',
                options: {
                    durable: true,
                    arguments: {
                        'x-message-ttl': 600000, // 10 minutes TTL
                    },
                },
            },
            {
                name: 'trip.queue',
                exchange: 'trip.exchange',
                routingKey: 'trip.*',
                options: {
                    durable: true,
                    arguments: {
                        'x-message-ttl': 300000, // 5 minutes TTL
                    },
                },
            },
        ],
        enableControllerDiscovery: true,
        connectionInitOptions: {
            wait: false,
            reject: false,
            timeout: 30000,
        },
        prefetchCount: 10,
        defaultRpcTimeout: 30000,
        defaultExchangeType: 'topic',
        enableDirectReplyTo: true,
        connectionManagerOptions: {
            heartbeatIntervalInSeconds: 60,
            reconnectTimeInSeconds: 5,
        },
    };
};

// Queue names constants
export const QUEUE_NAMES = {
    DOCUMENT_UPLOAD: 'document.upload.queue',
    DOCUMENT_PROCESS: 'document.process.queue',
    DOCUMENT_VERIFICATION: 'document.verification.queue',
    NOTIFICATION: 'notification.queue',
    PAYMENT: 'payment.queue',
    TRIP: 'trip.queue',
} as const;

// Exchange names constants
export const EXCHANGE_NAMES = {
    DOCUMENT: 'document.exchange',
    NOTIFICATION: 'notification.exchange',
    PAYMENT: 'payment.exchange',
    TRIP: 'trip.exchange',
} as const;

// Routing keys constants
export const ROUTING_KEYS = {
    DOCUMENT: {
        UPLOAD: 'document.upload',
        PROCESS: 'document.process',
        VERIFICATION: 'document.verification',
        VERIFIED: 'document.verified',
        REJECTED: 'document.rejected',
    },
    NOTIFICATION: {
        SMS: 'notification.sms',
        EMAIL: 'notification.email',
        PUSH: 'notification.push',
    },
    PAYMENT: {
        PROCESS: 'payment.process',
        SUCCESS: 'payment.success',
        FAILED: 'payment.failed',
        REFUND: 'payment.refund',
    },
    TRIP: {
        START: 'trip.start',
        END: 'trip.end',
        SYNC: 'trip.sync',
    },
} as const;

// Message types for document processing
export const DOCUMENT_MESSAGE_TYPES = {
    UPLOAD: 'document.upload',
    PROCESS: 'document.process',
    VERIFY: 'document.verify',
    REJECT: 'document.reject',
    DELETE: 'document.delete',
} as const;

// Document processing priorities
export const DOCUMENT_PRIORITIES = {
    HIGH: 10,
    MEDIUM: 5,
    LOW: 1,
} as const;
