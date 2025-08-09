# Geography Module

The Geography module provides comprehensive management of regions and cities within the transport fare application. It includes full CRUD operations, search functionality, filtering, and statistics.

## Features

### Regions Management
- Create, read, update, and delete regions
- Search regions by name or code
- Pagination support
- Get regions with associated cities
- Validation to prevent deletion of regions with associated data

### Cities Management
- Create, read, update, and delete cities
- Search cities by name, region, or major city status
- Pagination support
- Get cities by region
- Get major cities only
- Validation to prevent deletion of cities with associated drivers

### Statistics
- Get comprehensive geography statistics
- Count of regions and cities
- Major cities count
- Cities distribution by region

## Authentication & Authorization

All endpoints require JWT authentication. Role-based access control is implemented:

- **ADMIN**: Full access to all operations
- **GOVERNMENT_OFFICIAL**: Read access to all data, statistics access
- **TAX_OFFICER**: Read access to regions and cities
- **VIEWER**: Read access to regions and cities

## API Endpoints

### Regions

#### Create Region
```
POST /geography/regions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Central Region",
  "code": "CR",
  "capitalCity": "Kampala"
}
```

#### Get All Regions
```
GET /geography/regions?page=1&limit=10&name=Central&code=CR
Authorization: Bearer <jwt_token>
```

#### Get Region by ID
```
GET /geography/regions/1
Authorization: Bearer <jwt_token>
```

#### Get Region with Cities
```
GET /geography/regions/1/cities
Authorization: Bearer <jwt_token>
```

#### Update Region
```
PATCH /geography/regions/1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Central Region",
  "capitalCity": "Kampala City"
}
```

#### Delete Region
```
DELETE /geography/regions/1
Authorization: Bearer <jwt_token>
```

### Cities

#### Create City
```
POST /geography/cities
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "KAMPALA",
  "regionId": 1,
  "isMajorCity": true
}
```

#### Get All Cities
```
GET /geography/cities?page=1&limit=10&name=Kampala&regionId=1&isMajorCity=true
Authorization: Bearer <jwt_token>
```

#### Get Major Cities
```
GET /geography/cities/major
Authorization: Bearer <jwt_token>
```

#### Get City by ID
```
GET /geography/cities/1
Authorization: Bearer <jwt_token>
```

#### Get Cities by Region
```
GET /geography/regions/1/cities
Authorization: Bearer <jwt_token>
```

#### Update City
```
PATCH /geography/cities/1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "KAMPALA_CITY",
  "isMajorCity": false
}
```

#### Delete City
```
DELETE /geography/cities/1
Authorization: Bearer <jwt_token>
```

### Statistics

#### Get Geography Statistics
```
GET /geography/stats
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "totalRegions": 5,
  "totalCities": 25,
  "majorCities": 8,
  "citiesByRegion": {
    "Central Region": 10,
    "Eastern Region": 5,
    "Western Region": 4,
    "Northern Region": 3,
    "Southern Region": 3
  },
  "majorCitiesByRegion": {
    "Central Region": 4,
    "Eastern Region": 2,
    "Western Region": 1,
    "Northern Region": 1,
    "Southern Region": 0
  }
}
```

## Data Models

### Region
- `id`: Primary key
- `name`: Region name (unique)
- `code`: Region code (unique)
- `capitalCity`: Capital city name (optional)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### City
- `id`: Primary key
- `name`: City name (enum from CityEnum)
- `regionId`: Foreign key to Region
- `isMajorCity`: Boolean flag for major cities
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Validation Rules

### Region Validation
- Name and code must be unique
- Cannot delete regions with associated cities or users
- Name and code are required for creation

### City Validation
- City name must be valid enum value
- City name must be unique within a region
- Region must exist when creating/updating city
- Cannot delete cities with associated drivers

## Error Handling

The module provides comprehensive error handling:

- **404 Not Found**: When region or city doesn't exist
- **409 Conflict**: When trying to create duplicate data or delete entities with associations
- **403 Forbidden**: When user lacks required permissions
- **400 Bad Request**: When validation fails

## Usage Examples

### Creating a Region with Cities
```typescript
// 1. Create region
const region = await geographyService.createRegion({
  name: "Central Region",
  code: "CR",
  capitalCity: "Kampala"
});

// 2. Create cities in the region
const city1 = await geographyService.createCity({
  name: "KAMPALA",
  regionId: region.region.id,
  isMajorCity: true
});

const city2 = await geographyService.createCity({
  name: "ENTEBBE",
  regionId: region.region.id,
  isMajorCity: false
});
```

### Getting Statistics
```typescript
const stats = await geographyService.getGeographyStats();
console.log(`Total regions: ${stats.totalRegions}`);
console.log(`Total cities: ${stats.totalCities}`);
console.log(`Major cities: ${stats.majorCities}`);
```

## Dependencies

- `@nestjs/typeorm`: Database operations
- `@nestjs/swagger`: API documentation
- `@nestjs/common`: Core NestJS functionality
- `typeorm`: ORM for database interactions

## Related Modules

- **Auth Module**: Provides authentication and authorization
- **User Module**: Manages user data with region associations
- **Seed Module**: Provides initial data seeding