# Vehicle Module

The Vehicle module provides comprehensive management for vehicles and vehicle types in the transport fare system. It handles vehicle registration, type management, photo verification, and statistical analysis.

## Features

### Vehicle Management
- **CRUD Operations**: Create, read, update, and delete vehicles
- **Search & Filtering**: Search by license plate, make, model with various filters
- **Pagination**: Efficient pagination for large datasets
- **Status Management**: Track vehicle status (active, inactive, maintenance)
- **Photo Verification**: Manage vehicle document photo verification status
- **Bulk Operations**: Bulk update vehicle statuses
- **Statistics**: Comprehensive vehicle statistics and analytics

### Vehicle Type Management
- **Type Categories**: Support for taxi, bus, truck, motorcycle, shared taxi, tricycle
- **Passenger Capacity**: Track maximum passenger capacity per type
- **Safety Requirements**: Track helmet requirements for specific vehicle types
- **CRUD Operations**: Full management of vehicle types
- **Statistics**: Vehicle type analytics

## API Endpoints

### Vehicle Types

| Method | Endpoint | Description | Roles Required |
|--------|----------|-------------|----------------|
| POST | `/vehicles/types` | Create vehicle type | ADMIN, GOVERNMENT_OFFICIAL |
| GET | `/vehicles/types` | Get all vehicle types | All authenticated users |
| GET | `/vehicles/types/:id` | Get vehicle type by ID | All authenticated users |
| PATCH | `/vehicles/types/:id` | Update vehicle type | ADMIN, GOVERNMENT_OFFICIAL |
| DELETE | `/vehicles/types/:id` | Delete vehicle type | ADMIN |
| GET | `/vehicles/types/statistics` | Get vehicle type statistics | All authenticated users |

### Vehicles

| Method | Endpoint | Description | Roles Required |
|--------|----------|-------------|----------------|
| POST | `/vehicles` | Create vehicle | ADMIN, GOVERNMENT_OFFICIAL, TAX_OFFICER |
| GET | `/vehicles` | Get all vehicles | All authenticated users |
| GET | `/vehicles/:id` | Get vehicle by ID | All authenticated users |
| PATCH | `/vehicles/:id` | Update vehicle | ADMIN, GOVERNMENT_OFFICIAL, TAX_OFFICER |
| DELETE | `/vehicles/:id` | Delete vehicle | ADMIN, GOVERNMENT_OFFICIAL |
| POST | `/vehicles/bulk-update-status` | Bulk update vehicle status | ADMIN, GOVERNMENT_OFFICIAL |
| POST | `/vehicles/photo-verification` | Update photo verification | ADMIN, GOVERNMENT_OFFICIAL, TAX_OFFICER |
| GET | `/vehicles/statistics` | Get vehicle statistics | All authenticated users |

## Data Models

### Vehicle Type
```typescript
{
  id: number;
  typeName: string; // taxi, bus, truck, motorcycle, shared_taxi, tricycle
  description?: string;
  maxPassengers?: number;
  requiresHelmet: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Vehicle
```typescript
{
  id: number;
  vehicleTypeId: number;
  licensePlate: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  engineCapacity?: number; // For motorcycles
  insuranceNumber?: string;
  insuranceExpiry?: Date;
  inspectionExpiry?: Date;
  ownerDriverId?: number;
  registrationDate: Date;
  status: string; // active, inactive, maintenance
  photosVerified: boolean;
  lastPhotoUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
  vehicleType?: VehicleTypeResponseDto;
  ownerDriver?: any;
}
```

## Query Parameters

### Vehicle Types
- `search`: Search in type name or description
- `requiresHelmet`: Filter by helmet requirement (boolean)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order - ASC or DESC (default: ASC)

### Vehicles
- `search`: Search in license plate, make, or model
- `vehicleTypeId`: Filter by vehicle type ID
- `status`: Filter by vehicle status
- `ownerDriverId`: Filter by owner driver ID
- `photosVerified`: Filter by photo verification status
- `insuranceStatus`: Filter by insurance status (expired/active)
- `inspectionStatus`: Filter by inspection status (expired/active)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order - ASC or DESC (default: DESC)

## Statistics

### Vehicle Statistics
- Total vehicles count
- Active/inactive vehicles count
- Vehicles with verified photos
- Vehicles with expired insurance/inspection
- Vehicles grouped by type
- Vehicles grouped by status

### Vehicle Type Statistics
- Total vehicle types count
- Types requiring helmets
- Types grouped by passenger capacity

## Usage Examples

### Create a Vehicle Type
```bash
curl -X POST http://localhost:3000/vehicles/types \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "typeName": "taxi",
    "description": "Standard taxi vehicle for passenger transport",
    "maxPassengers": 4,
    "requiresHelmet": false
  }'
```

### Create a Vehicle
```bash
curl -X POST http://localhost:3000/vehicles \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleTypeId": 1,
    "licensePlate": "ABC123",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "color": "White",
    "insuranceNumber": "INS123456789",
    "insuranceExpiry": "2024-12-31",
    "inspectionExpiry": "2024-06-30",
    "ownerDriverId": 1
  }'
```

### Search Vehicles
```bash
curl -X GET "http://localhost:3000/vehicles?search=ABC&status=active&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Bulk Update Vehicle Status
```bash
curl -X POST http://localhost:3000/vehicles/bulk-update-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleIds": [1, 2, 3, 4, 5],
    "status": "inactive"
  }'
```

### Update Photo Verification
```bash
curl -X POST http://localhost:3000/vehicles/photo-verification \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 1,
    "photosVerified": true
  }'
```

## Error Handling

The module includes comprehensive error handling for:
- **404 Not Found**: Vehicle or vehicle type not found
- **409 Conflict**: Duplicate license plate or vehicle type name
- **400 Bad Request**: Invalid data or business rule violations
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions for the operation

## Business Rules

1. **License Plate Uniqueness**: Each vehicle must have a unique license plate
2. **Vehicle Type Validation**: Vehicles must reference valid vehicle types
3. **Owner Driver Validation**: If specified, owner driver must exist
4. **Deletion Constraints**: Vehicle types cannot be deleted if they have associated vehicles
5. **Status Management**: Vehicles can be active, inactive, or in maintenance
6. **Photo Verification**: Tracks whether vehicle documents have been verified
7. **Expiry Tracking**: Monitors insurance and inspection expiry dates

## Integration

The Vehicle module integrates with:
- **Driver Module**: Links vehicles to owner drivers
- **Document Photo Module**: Manages vehicle document photos
- **Meter Module**: Associates meters with vehicles
- **Trip Module**: Tracks trips made by vehicles
- **Fare Rates Module**: Links vehicle types to fare rates

## Testing

Test the vehicle module endpoints using Swagger UI at `/api` or use the provided curl examples above. Ensure you have proper authentication and authorization tokens for protected endpoints.