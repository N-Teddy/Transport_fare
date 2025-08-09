export enum ErrorCodes {
    // Authentication errors
    AUTH_INVALID_CREDENTIALS = 1001,
    AUTH_UNAUTHORIZED = 1002,
    AUTH_FORBIDDEN = 1003,

    // Validation errors
    INVALID_CNI = 1101,
    INVALID_LICENSE_PLATE = 1102,
    INVALID_PHONE_NUMBER = 1103,

    // Business errors
    DRIVER_NOT_REGISTERED = 1201,
    VEHICLE_NOT_REGISTERED = 1202,
    DOCUMENT_NOT_VERIFIED = 1203,

    // System errors
    DATABASE_ERROR = 1301,
    FILE_UPLOAD_FAILED = 1302,
}

export const ErrorMessages = {
    [ErrorCodes.AUTH_INVALID_CREDENTIALS]: 'Invalid credentials provided',
    [ErrorCodes.INVALID_CNI]: 'Invalid CNI format',
    // ... other error messages
};
