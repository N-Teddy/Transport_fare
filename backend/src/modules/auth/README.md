# Authentication Module

This module provides a complete authentication system for the Transport Fare App backend.

## Features

- **User Registration & Login**: Secure user registration and login with bcrypt password hashing
- **JWT Authentication**: JWT-based authentication with access and refresh tokens
- **Role-Based Access Control**: Role-based authorization using guards and decorators
- **Password Reset**: Forgot password and reset password functionality
- **Profile Management**: User profile retrieval and updates
- **Token Refresh**: Automatic token refresh mechanism
- **Swagger Documentation**: Complete API documentation

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update user profile | Yes |
| PUT | `/auth/change-password` | Change user password | Yes |
| POST | `/auth/logout` | Logout user | Yes |

## User Roles

The system supports the following user roles:

- `admin` - Full system access
- `government_official` - Government official access
- `developer` - Developer access
- `tax_officer` - Tax officer access
- `viewer` - Read-only access (default)

## Usage Examples

### 1. Register a New User

```typescript
POST /auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "viewer"
}
```

### 2. Login

```typescript
POST /auth/login
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

Response:
```json
{
  "tokens": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 900
  },
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "viewer"
  }
}
```

### 3. Access Protected Routes

Include the access token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Refresh Token

```typescript
POST /auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Protecting Routes

### Authentication Only

```typescript
@Get('protected')
@UseGuards(JwtAuthGuard)
async protectedRoute(@Request() req) {
  return { message: 'Protected route', user: req.user };
}
```

### Role-Based Access

```typescript
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN)
async adminOnlyRoute(@Request() req) {
  return { message: 'Admin only', user: req.user };
}
```

### Multiple Roles

```typescript
@Get('government-access')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleEnum.ADMIN, UserRoleEnum.GOVERNMENT_OFFICIAL)
async governmentAccessRoute(@Request() req) {
  return { message: 'Government access', user: req.user };
}
```

## Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=10
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure JWT tokens with configurable expiration
- **Refresh Tokens**: Automatic token refresh mechanism
- **Role-Based Access**: Fine-grained access control
- **Input Validation**: Comprehensive input validation using class-validator
- **Rate Limiting**: Built-in rate limiting (can be configured)
- **CORS Protection**: Cross-origin resource sharing protection

## Error Handling

The authentication system provides comprehensive error handling:

- `401 Unauthorized`: Invalid credentials or missing token
- `403 Forbidden`: Insufficient permissions
- `409 Conflict`: Username or email already exists
- `400 Bad Request`: Invalid input data
- `500 Internal Server Error`: Server-side errors

## Testing

To test the authentication system:

1. Start the application
2. Register a new user
3. Login to get tokens
4. Use the access token to access protected routes
5. Test role-based access control
6. Test password reset functionality

## Dependencies

- `@nestjs/jwt` - JWT handling
- `@nestjs/passport` - Authentication strategies
- `passport-jwt` - JWT strategy
- `passport-local` - Local strategy
- `bcrypt` - Password hashing
- `uuid` - Token generation
- `class-validator` - Input validation
- `@nestjs/swagger` - API documentation