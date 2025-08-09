# Fare Module

The Fare module provides comprehensive management of fare rates and regional fare multipliers for the transport fare system. It handles fare rate setting, regional pricing adjustments, fare calculations, and provides detailed analytics and reporting.

## Features

### Core Functionality
- **Fare Rate Management**: Create, update, and manage fare rates for different vehicle types
- **Regional Multipliers**: Set regional price adjustments based on economic factors
- **Fare Calculation**: Real-time fare calculation with multiple factors
- **Effective Date Management**: Time-based fare rate and multiplier management
- **Statistics & Analytics**: Comprehensive reporting and insights

### Advanced Features
- **Multiplier System**: Night time, regional, and custom multipliers
- **Waiting Time Charges**: Additional charges for waiting time
- **Historical Tracking**: Track fare rate changes over time
- **Validation & Constraints**: Ensure data integrity and business rules

## API Endpoints

### Authentication Required
All endpoints require JWT authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Fare Rate Management

#### Create Fare Rate
```http
POST /fares/rates
```
**Roles**: admin, government_official
**Body**:
```json
{
  "vehicleTypeId": 1,
  "baseFare": 500,
  "perKmRate": 150,
  "nightMultiplier": 1.2,
  "effectiveFrom": "2024-01-15T00:00:00Z",
  "notes": "Standard taxi fare rate for urban areas"
}
```

#### Get All Fare Rates
```http
GET /fares/rates?page=1&limit=10&vehicleTypeId=1&isActive=true
```
**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `vehicleTypeId`: Filter by vehicle type ID
- `isActive`: Filter by active status
- `effectiveDate`: Filter by effective date
- `sortBy`: Sort field (baseFare, perKmRate, effectiveFrom, createdAt)
- `sortOrder`: Sort order (ASC, DESC)

#### Get Fare Rate by ID
```http
GET /fares/rates/:id
```

#### Get Active Fare Rate for Vehicle Type
```http
GET /fares/rates/vehicle-type/:vehicleTypeId
```

#### Update Fare Rate
```http
PATCH /fares/rates/:id
```
**Roles**: admin, government_official

#### Delete Fare Rate
```http
DELETE /fares/rates/:id
```
**Roles**: admin

### Regional Fare Multiplier Management

#### Create Regional Multiplier
```http
POST /fares/regional-multipliers
```
**Roles**: admin, government_official
**Body**:
```json
{
  "regionId": 1,
  "multiplier": 1.15,
  "reason": "Higher fuel costs in remote area",
  "effectiveFrom": "2024-01-15T00:00:00Z"
}
```

#### Get All Regional Multipliers
```http
GET /fares/regional-multipliers?page=1&limit=10&regionId=1&isActive=true
```

#### Get Regional Multiplier by ID
```http
GET /fares/regional-multipliers/:id
```

#### Get Active Regional Multiplier for Region
```http
GET /fares/regional-multipliers/region/:regionId
```

#### Update Regional Multiplier
```http
PATCH /fares/regional-multipliers/:id
```
**Roles**: admin, government_official

#### Delete Regional Multiplier
```http
DELETE /fares/regional-multipliers/:id
```
**Roles**: admin

### Fare Calculation

#### Calculate Fare
```http
POST /fares/calculate
```
**Body**:
```json
{
  "vehicleTypeId": 1,
  "distance": 10.5,
  "regionId": 1,
  "isNightTrip": false,
  "waitingTime": 15,
  "customMultiplier": 1.1
}
```

### Statistics & Reporting

#### Get Fare Statistics
```http
GET /fares/statistics
```

#### Get Active Fare Rates
```http
GET /fares/rates/active
```

#### Get Active Regional Multipliers
```http
GET /fares/regional-multipliers/active
```

## Data Models

### Fare Rate Entity
```typescript
{
  id: number;
  vehicleTypeId: number;
  baseFare: number; // Base fare in CFA Francs
  perKmRate: number; // Rate per kilometer
  nightMultiplier: number; // Night time multiplier
  effectiveFrom: Date;
  effectiveUntil?: Date;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Regional Fare Multiplier Entity
```typescript
{
  id: number;
  regionId: number;
  multiplier: number; // Regional price adjustment
  reason?: string; // Reason for multiplier
  effectiveFrom: Date;
  effectiveUntil?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Fare Calculation Logic

### Basic Formula
```
Total Fare = (Base Fare + Distance Fare + Waiting Fare) × Multipliers
```

### Components
1. **Base Fare**: Fixed starting fare
2. **Distance Fare**: `distance × perKmRate`
3. **Waiting Fare**: `waitingTime × 5 CFA per minute`
4. **Multipliers**: Product of all applicable multipliers

### Multiplier Types
- **Night Multiplier**: Applied during night hours (default: 1.0)
- **Regional Multiplier**: Applied based on region (default: 1.0)
- **Custom Multiplier**: Special circumstances (default: 1.0)

### Example Calculation
```
Base Fare: 500 CFA
Distance: 10.5 km × 150 CFA/km = 1,575 CFA
Waiting: 15 min × 5 CFA/min = 75 CFA
Subtotal: 2,150 CFA

Multipliers:
- Night: 1.2 (night trip)
- Regional: 1.15 (remote area)
- Custom: 1.0 (none)

Total: 2,150 × 1.2 × 1.15 = 2,967 CFA
```

## Usage Examples

### Creating a New Fare Rate
```typescript
const newFareRate = await fareService.createFareRate({
  vehicleTypeId: 1,
  baseFare: 500,
  perKmRate: 150,
  nightMultiplier: 1.2,
  effectiveFrom: '2024-01-15',
  notes: 'Standard taxi fare rate'
});
```

### Setting Regional Multiplier
```typescript
const regionalMultiplier = await fareService.createRegionalMultiplier({
  regionId: 1,
  multiplier: 1.15,
  reason: 'Higher fuel costs in remote area'
});
```

### Calculating Fare
```typescript
const fareCalculation = await fareService.calculateFare({
  vehicleTypeId: 1,
  distance: 10.5,
  regionId: 1,
  isNightTrip: false,
  waitingTime: 15
});
```

## Business Rules

### Fare Rate Rules
1. Only one active fare rate per vehicle type at a time
2. Fare rates must have effective dates
3. Base fare and per-km rate must be non-negative
4. Night multiplier must be between 0.5 and 3.0

### Regional Multiplier Rules
1. Only one active multiplier per region at a time
2. Multiplier must be between 0.5 and 3.0
3. Must provide reason for multiplier
4. Effective dates are required

### Calculation Rules
1. Distance must be positive and reasonable (0.1 - 1000 km)
2. Waiting time must be non-negative and reasonable (0 - 300 min)
3. All multipliers are applied multiplicatively
4. Final fare is rounded to nearest CFA

## Error Handling

The module includes comprehensive error handling for:
- **Validation Errors**: Invalid input data
- **Not Found Errors**: Fare rates or regions not found
- **Conflict Errors**: Duplicate active rates or multipliers
- **Permission Errors**: Insufficient role permissions
- **Business Rule Violations**: Invalid fare calculations

## Security Considerations

1. **Authentication**: All endpoints require valid JWT tokens
2. **Authorization**: Role-based access control for different operations
3. **Input Validation**: All inputs are validated using class-validator
4. **SQL Injection Protection**: TypeORM provides parameterized queries
5. **Data Integrity**: Business rules prevent invalid fare configurations

## Dependencies

- **TypeORM**: Database ORM for fare-related entities
- **class-validator**: Input validation
- **class-transformer**: Data transformation
- **@nestjs/swagger**: API documentation
- **JWT Guards**: Authentication and authorization

## Testing

The module can be tested using:
1. **Unit Tests**: Test individual service methods
2. **Integration Tests**: Test API endpoints with database
3. **E2E Tests**: Test complete fare calculation workflows
4. **Swagger UI**: Interactive API testing at `/api`

## Monitoring

Key metrics to monitor:
- Fare calculation accuracy and performance
- Regional multiplier usage patterns
- Fare rate change frequency
- Error rates and types
- API response times
- Business rule compliance