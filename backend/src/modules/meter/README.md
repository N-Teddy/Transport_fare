# Meter Module

The Meter module provides comprehensive management of taxi meters in the transport fare system. It handles meter registration, assignment to vehicles, calibration tracking, status management, and provides detailed statistics and reporting capabilities.

## Features

### Core Functionality
- **Meter Registration**: Create and manage meter records with detailed information
- **Vehicle Assignment**: Assign meters to vehicles and track assignments
- **Calibration Management**: Track calibration dates and schedule maintenance
- **Status Management**: Monitor meter status (active, maintenance, faulty)
- **Search & Filtering**: Advanced search and filtering capabilities
- **Statistics & Reporting**: Comprehensive analytics and reporting

### Security Features
- **Role-based Access Control**: Different permissions for admin, manager, and technician roles
- **JWT Authentication**: Secure API access with token-based authentication
- **Input Validation**: Comprehensive validation for all inputs
- **Audit Trail**: Track all meter operations and changes

## API Endpoints

### Authentication Required
All endpoints require JWT authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Meter Management

#### Create Meter
```http
POST /meters
```
**Roles**: admin, manager
**Body**:
```json
{
  "meterSerial": "MTR-2024-001234",
  "vehicleId": 1,
  "manufacturer": "TaxiMeter Pro",
  "model": "TM-2000",
  "firmwareVersion": "v2.1.0",
  "installationDate": "2024-01-15",
  "status": "active"
}
```

#### Get All Meters
```http
GET /meters?page=1&limit=10&search=MTR&status=active&manufacturer=TaxiMeter
```
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search in serial, manufacturer, or model
- `status`: Filter by status (active, maintenance, faulty)
- `vehicleId`: Filter by vehicle ID
- `manufacturer`: Filter by manufacturer
- `sortBy`: Sort field (meterSerial, manufacturer, model, installationDate, lastCalibration, status, createdAt)
- `sortOrder`: Sort order (ASC, DESC)

#### Get Meter by ID
```http
GET /meters/:id
```

#### Get Meter with Vehicle Info
```http
GET /meters/:id/with-vehicle
```

#### Update Meter
```http
PATCH /meters/:id
```
**Roles**: admin, manager

#### Delete Meter
```http
DELETE /meters/:id
```
**Roles**: admin

### Vehicle Assignment

#### Assign Meter to Vehicle
```http
POST /meters/assign
```
**Roles**: admin, manager
**Body**:
```json
{
  "meterId": 1,
  "vehicleId": 1
}
```

#### Unassign Meter from Vehicle
```http
POST /meters/:id/unassign
```
**Roles**: admin, manager

### Calibration Management

#### Calibrate Meter
```http
POST /meters/:id/calibrate
```
**Roles**: admin, manager, technician
**Body**:
```json
{
  "calibrationDate": "2024-01-15",
  "notes": "Annual calibration completed successfully"
}
```

#### Get Meters Due for Calibration
```http
GET /meters/calibration-due?days=30
```

### Status Management

#### Update Meter Status
```http
PATCH /meters/:id/status
```
**Roles**: admin, manager, technician
**Body**:
```json
{
  "status": "maintenance",
  "reason": "Scheduled maintenance"
}
```

### Reporting & Analytics

#### Get Statistics
```http
GET /meters/statistics
```
Returns comprehensive statistics including:
- Total meters count
- Meters by status
- Calibration due counts
- Unassigned meters
- Meters by manufacturer

#### Search Meters
```http
GET /meters/search?q=MTR-2024
```

#### Get Unassigned Meters
```http
GET /meters/unassigned
```

#### Get Meters by Manufacturer
```http
GET /meters/by-manufacturer/TaxiMeter Pro
```

#### Get Meters by Status
```http
GET /meters/by-status/active
```

## Data Models

### Meter Entity
```typescript
{
  id: number;
  meterSerial: string;
  vehicleId?: number;
  manufacturer?: string;
  model?: string;
  firmwareVersion?: string;
  installationDate?: Date;
  lastCalibration?: Date;
  nextCalibrationDue?: Date;
  status: string; // active, maintenance, faulty
  encryptionKey?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Meter Status Enum
- `active`: Meter is operational and assigned to a vehicle
- `maintenance`: Meter is under maintenance or repair
- `faulty`: Meter has technical issues and needs attention

## Usage Examples

### Creating a New Meter
```typescript
const newMeter = await meterService.create({
  meterSerial: 'MTR-2024-001234',
  manufacturer: 'TaxiMeter Pro',
  model: 'TM-2000',
  firmwareVersion: 'v2.1.0',
  installationDate: '2024-01-15',
  status: 'active'
});
```

### Assigning a Meter to a Vehicle
```typescript
const assignment = await meterService.assignToVehicle(1, 1);
```

### Updating Meter Status
```typescript
const statusUpdate = await meterService.updateStatus(1, {
  status: 'maintenance',
  reason: 'Scheduled maintenance'
});
```

### Getting Calibration Due Meters
```typescript
const dueMeters = await meterService.getCalibrationDueMeters(30); // 30 days ahead
```

## Error Handling

The module includes comprehensive error handling for:
- **Validation Errors**: Invalid input data
- **Not Found Errors**: Meter or vehicle not found
- **Conflict Errors**: Duplicate meter serial or assignment conflicts
- **Permission Errors**: Insufficient role permissions
- **Database Errors**: Connection or query failures

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role-based access control for different operations
3. **Input Validation**: All inputs are validated using class-validator
4. **SQL Injection Protection**: TypeORM provides parameterized queries
5. **Data Encryption**: Encryption keys are stored for secure data transmission

## Dependencies

- **TypeORM**: Database ORM for meter and vehicle entities
- **class-validator**: Input validation
- **class-transformer**: Data transformation
- **@nestjs/swagger**: API documentation
- **JWT Guards**: Authentication and authorization

## Testing

The module can be tested using:
1. **Unit Tests**: Test individual service methods
2. **Integration Tests**: Test API endpoints with database
3. **E2E Tests**: Test complete workflows
4. **Swagger UI**: Interactive API testing at `/api`

## Monitoring

Key metrics to monitor:
- Meter assignment/unassignment frequency
- Calibration compliance rates
- Status change patterns
- Error rates and types
- API response times