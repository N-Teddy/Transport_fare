export const ActionEnum = {
    INSERT: 'INSERT',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    SELECT: 'SELECT',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE_PROFILE: 'UPDATE_PROFILE',
    DELETE_ACCOUNT: 'DELETE_ACCOUNT',
    UPLOAD_DOCUMENT: 'UPLOAD_DOCUMENT',
    VERIFY_DOCUMENT: 'VERIFY_DOCUMENT',
    REJECT_DOCUMENT: 'REJECT_DOCUMENT',
};

export const TaxPeriodEnum = {
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
};

export const MobilePaymentOperatorEnum = {
    MTN: 'MTN',
    ORANGE: 'ORANGE',
};

export const PaymentMethodEnum = {
    CASH: 'cash',
    MTN_MOMO: 'mtn_momo',
    ORANGE_MONEY: 'orange_money',
};

export const UserRoleEnum = {
    ADMIN: 'admin',
    GOVERNMENT_OFFICIAL: 'government_official',
    DEVELOPER: 'developer',
    TAX_OFFICER: 'tax_officer',
    VIEWER: 'viewer',
    DRIVER: 'driver',
};

export const VehicleTypeEnum = {
    TAXI: 'taxi',
    BUS: 'bus',
    TRUCK: 'truck',
    MOTORCYCLE: 'motorcycle',
    SHARED_TAXI: 'shared_taxi',
    TRICYCLE: 'tricycle',
};

export enum ApiResponseStatus {
    SUCCESS = 'success',
    ERROR = 'error',
    FAILED = 'failed',
}

export enum ApiResponseMessage {
    // Generic messages
    FETCHED_SUCCESSFULLY = 'Data fetched successfully',
    CREATED_SUCCESSFULLY = 'Data created successfully',
    UPDATED_SUCCESSFULLY = 'Data updated successfully',
    DELETED_SUCCESSFULLY = 'Data deleted successfully',
    NOT_FOUND = 'Data not found',
    UNAUTHORIZED = 'Unauthorized access',
    FORBIDDEN = 'Forbidden - insufficient permissions',
    VALIDATION_ERROR = 'Validation error',
    INTERNAL_SERVER_ERROR = 'Internal server error',

    // User specific messages
    USERS_FETCHED = 'Users fetched successfully',
    USER_CREATED = 'User created successfully',
    USER_UPDATED = 'User updated successfully',
    USER_DELETED = 'User deleted successfully',
    USER_NOT_FOUND = 'User not found',
    PASSWORD_CHANGED = 'Password changed successfully',
    CANNOT_DELETE_ADMIN = 'Cannot delete admin users',

    // Driver specific messages
    DRIVERS_FETCHED = 'Drivers fetched successfully',
    DRIVER_CREATED = 'Driver created successfully',
    DRIVER_UPDATED = 'Driver updated successfully',
    DRIVER_DELETED = 'Driver deleted successfully',
    DRIVER_NOT_FOUND = 'Driver not found',
    DRIVER_PHOTOS_VERIFIED = 'Driver photos verification status updated successfully',
    DRIVER_RATINGS_FETCHED = 'Driver ratings fetched successfully',
    DRIVER_RATING_CREATED = 'Driver rating created successfully',
    DRIVER_RATING_UPDATED = 'Driver rating updated successfully',
    DRIVER_RATING_DELETED = 'Driver rating deleted successfully',
    DRIVER_RATING_NOT_FOUND = 'Driver rating not found',
    DRIVER_RATING_STATS_FETCHED = 'Driver rating statistics retrieved successfully',
    DRIVER_STATS_FETCHED = 'Driver statistics fetched successfully',

    // Vehicle specific messages
    VEHICLES_FETCHED = 'Vehicles fetched successfully',
    VEHICLE_CREATED = 'Vehicle created successfully',
    VEHICLE_UPDATED = 'Vehicle updated successfully',
    VEHICLE_DELETED = 'Vehicle deleted successfully',
    VEHICLE_NOT_FOUND = 'Vehicle not found',
    VEHICLE_TYPES_FETCHED = 'Vehicle types fetched successfully',
    VEHICLE_TYPE_CREATED = 'Vehicle type created successfully',
    VEHICLE_TYPE_UPDATED = 'Vehicle type updated successfully',
    VEHICLE_TYPE_DELETED = 'Vehicle type deleted successfully',
    VEHICLE_TYPE_NOT_FOUND = 'Vehicle type not found',
    VEHICLE_TYPE_STATISTICS_FETCHED = 'Vehicle type stat fetched successfully',
    VEHICLE_PHOTOS_VERIFIED = 'Vehicle photos verification status updated successfully',
    VEHICLE_STATS_FETCHED = 'Vehicle statistics fetched successfully',
    VEHICLE_BULK_STATUS_UPDATED = 'Vehicle statuses updated successfully',

    // Trip specific messages
    TRIP_CREATED = 'Trip created successfully',
    TRIP_ENDED = 'Trip ended successfully',
    TRIP_FETCHED = 'Trip details fetched successfully',
    TRIP_NOT_FOUND = 'Trip not found',
    GPS_LOG_ADDED = 'GPS log added successfully',
    GPS_LOGS_ADDED = 'GPS logs added successfully',
    GPS_LOGS_FETCHED = 'GPS logs fetched successfully',
    TRIP_STATS_FETCHED = 'Trip statistics fetched successfully',
    DRIVER_TRIP_STATS_FETCHED = 'Driver trip statistics fetched successfully',
    VEHICLE_TRIP_STATS_FETCHED = 'Vehicle trip statistics fetched successfully',
    DAILY_TRIP_STATS_FETCHED = 'Daily trip statistics fetched successfully',

    // Fare specific messages
    FARE_RATES_FETCHED = 'Fare rates fetched successfully',
    FARE_RATE_CREATED = 'Fare rate created successfully',
    FARE_RATE_UPDATED = 'Fare rate updated successfully',
    FARE_RATE_DELETED = 'Fare rate deleted successfully',
    FARE_RATE_NOT_FOUND = 'Fare rate not found',
    FARE_CALCULATED = 'Fare calculated successfully',
    REGIONAL_MULTIPLIERS_FETCHED = 'Regional multipliers fetched successfully',
    REGIONAL_MULTIPLIER_CREATED = 'Regional multiplier created successfully',
    REGIONAL_MULTIPLIER_UPDATED = 'Regional multiplier updated successfully',
    REGIONAL_MULTIPLIER_DELETED = 'Regional multiplier deleted successfully',
    REGIONAL_MULTIPLIER_NOT_FOUND = 'Regional multiplier not found',
    FARE_STATS_FETCHED = 'Fare statistics fetched successfully',

    // Meter specific messages
    METERS_FETCHED = 'Meters fetched successfully',
    METER_CREATED = 'Meter created successfully',
    METER_UPDATED = 'Meter updated successfully',
    METER_DELETED = 'Meter deleted successfully',
    METER_NOT_FOUND = 'Meter not found',
    METER_ASSIGNED = 'Meter assigned to vehicle successfully',
    METER_UNASSIGNED = 'Meter unassigned from vehicle successfully',
    METER_CALIBRATED = 'Meter calibrated successfully',
    METER_STATUS_UPDATED = 'Meter status updated successfully',
    METER_STATS_FETCHED = 'Meter statistics fetched successfully',
    METER_SEARCH_RESULTS = 'Meter search results fetched successfully',
    UNASSIGNED_METERS_FETCHED = 'Unassigned meters fetched successfully',
    CALIBRATION_DUE_METERS_FETCHED = 'Meters due for calibration fetched successfully',

    // Geography specific messages
    REGIONS_FETCHED = 'Regions fetched successfully',
    REGION_CREATED = 'Region created successfully',
    REGION_UPDATED = 'Region updated successfully',
    REGION_DELETED = 'Region deleted successfully',
    REGION_NOT_FOUND = 'Region not found',
    REGION_WITH_CITIES_FETCHED = 'Region with cities fetched successfully',
    CITIES_FETCHED = 'Cities fetched successfully',
    CITY_CREATED = 'City created successfully',
    CITY_UPDATED = 'City updated successfully',
    CITY_DELETED = 'City deleted successfully',
    CITY_NOT_FOUND = 'City not found',
    CITIES_BY_REGION_FETCHED = 'Cities by region fetched successfully',
    MAJOR_CITIES_FETCHED = 'Major cities fetched successfully',
    GEOGRAPHY_STATS_FETCHED = 'Geography statistics fetched successfully',

    // Document specific messages
    DOCUMENTS_FETCHED = 'Documents fetched successfully',
    DOCUMENT_UPLOADED = 'Document uploaded successfully',
    DOCUMENTS_UPLOADED = 'Documents uploaded successfully',
    DOCUMENT_UPDATED = 'Document updated successfully',
    DOCUMENT_DELETED = 'Document deleted successfully',
    DOCUMENT_NOT_FOUND = 'Document not found',
    DOCUMENT_VERIFIED = 'Document verified successfully',
    DOCUMENTS_VERIFIED = 'Documents verified successfully',
    DOCUMENT_PROCESSED = 'Document processed successfully',
    DOCUMENTS_PROCESSED = 'Documents processed successfully',
    DOCUMENT_DOWNLOADED = 'Document downloaded successfully',
    DOCUMENT_STATS_FETCHED = 'Document statistics fetched successfully',
    DOCUMENT_EXPORTED = 'Documents exported successfully',

    // Tax specific messages
    TAX_ACCOUNTS_FETCHED = 'Tax accounts fetched successfully',
    TAX_PAID = 'Tax payment processed successfully',

    // Audit specific messages
    AUDIT_LOG_CREATED = 'Audit log created successfully',
    AUDIT_LOGS_FETCHED = 'Audit logs fetched successfully',
    AUDIT_LOG_FETCHED = 'Audit log fetched successfully',

    // Auth specific messages
    LOGIN_SUCCESSFUL = 'Login successful',
    LOGOUT_SUCCESSFUL = 'Logout successful',
    REFRESH_SUCCESSFUL = 'Token refreshed successfully',
    PASSWORD_RESET_SENT = 'Password reset email sent successfully',
    PASSWORD_RESET_SUCCESSFUL = 'Password reset successful',
    ACCOUNT_VERIFIED = 'Account verified successfully',
    OTP_SENT = 'OTP sent successfully',

    // Error messages
    CONFLICT_ERROR = 'Conflict - data already exists',
    BAD_REQUEST = 'Bad request',
    NOT_FOUND_ERROR = 'Resource not found',
    UNAUTHORIZED_ERROR = 'Unauthorized',
    // FORBIDDEN_ERROR = 'Forbidden - insufficient permissions',
    VALIDATION_ERROR_MSG = 'Validation error occurred',
    INTERNAL_ERROR = 'Internal server error occurred',
    CANNOT_DELETE_WITH_RELATIONS = 'Cannot delete item with associated data',
}
