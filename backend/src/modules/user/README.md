# User Module

This module provides comprehensive user management functionality for the Transport Fare App backend.

## Features

- **User CRUD Operations**: Create, read, update, and delete users
- **User Search & Filtering**: Advanced search and filtering capabilities
- **Pagination**: Efficient pagination for large user lists
- **Role-Based Access Control**: Secure access based on user roles
- **User Statistics**: Comprehensive user analytics and statistics
- **Password Management**: Secure password change functionality
- **User Activation**: Toggle user active/inactive status
- **Swagger Documentation**: Complete API documentation

## API Endpoints

### User Management Endpoints

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| POST | `/users` | Create a new user | ADMIN |
| GET | `/users` | Get all users with pagination | ADMIN, GOVERNMENT_OFFICIAL, TAX_OFFICER |
| GET | `/users/stats` | Get user statistics | ADMIN, GOVERNMENT_OFFICIAL |
| GET | `/users/:id` | Get user by ID | ADMIN, GOVERNMENT_OFFICIAL, TAX_OFFICER |
| PATCH | `/users/:id` | Update user | ADMIN |
| PATCH | `/users/:id/password` | Change user password | ADMIN |
| PATCH | `/users/:id/toggle-status` | Toggle user active status | ADMIN |
| DELETE | `/users/:id` | Delete user | ADMIN |

## User Roles & Permissions

### Admin Access
- Full user management capabilities
- Can create, update, delete any user
- Can change user passwords
- Can toggle user active status
- Access to user statistics

### Government Official Access
- Can view all users
- Can access user statistics
- Read-only access to user data

### Tax Officer Access
- Can view all users
- Read-only access to user data

## Usage Examples

### 1. Create a New User

```typescript
POST /users
Authorization: Bearer <admin_token>
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "tax_officer",
  "regionId": 1,
  "isActive": true
}
```

Response:
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "tax_officer",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get Users with Pagination and Filtering

```typescript
GET /users?page=1&limit=10&role=tax_officer&isActive=true
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "users": [...],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### 3. Update User

```typescript
PATCH /users/1
Authorization: Bearer <admin_token>
{
  "firstName": "Johnny",
  "lastName": "Smith",
  "phone": "+1234567891"
}
```

### 4. Change User Password

```typescript
PATCH /users/1/password
Authorization: Bearer <admin_token>
{
  "newPassword": "newsecurepassword123"
}
```

### 5. Toggle User Status

```typescript
PATCH /users/1/toggle-status
Authorization: Bearer <admin_token>
```

### 6. Get User Statistics

```typescript
GET /users/stats
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "totalUsers": 100,
  "activeUsers": 85,
  "inactiveUsers": 15,
  "usersByRole": {
    "admin": 5,
    "government_official": 10,
    "tax_officer": 25,
    "viewer": 60
  },
  "usersByRegion": {
    "region_1": 30,
    "region_2": 25,
    "no_region": 45
  }
}
```

## Query Parameters

### User List Filtering

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Items per page (default: 10) | `?limit=20` |
| `username` | string | Search by username (partial match) | `?username=john` |
| `email` | string | Search by email (partial match) | `?email=john@` |
| `role` | string | Filter by role | `?role=tax_officer` |
| `regionId` | number | Filter by region ID | `?regionId=1` |
| `isActive` | boolean | Filter by active status | `?isActive=true` |

## Error Handling

The user module provides comprehensive error handling:

- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Insufficient permissions for the operation
- `404 Not Found`: User not found
- `409 Conflict`: Username or email already exists
- `400 Bad Request`: Invalid input data or operation not allowed

## Security Features

- **Authentication Required**: All endpoints require valid JWT token
- **Role-Based Authorization**: Access control based on user roles
- **Input Validation**: Comprehensive validation using class-validator
- **Password Security**: Secure password hashing with bcrypt
- **Audit Trail**: Tracks who created/updated users
- **Admin Protection**: Prevents deletion of admin users

## Database Schema

The user module uses the following database structure:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'viewer',
  regionId INTEGER,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdBy INTEGER,
  updatedBy INTEGER
);
```

## Dependencies

- `@nestjs/typeorm` - Database operations
- `bcrypt` - Password hashing
- `class-validator` - Input validation
- `@nestjs/swagger` - API documentation
- Authentication guards from auth module