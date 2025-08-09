# Audit Module

This module provides comprehensive audit logging functionality for the Transport Fare App backend. It tracks all changes made to entities, user actions, and system events for compliance, debugging, and security purposes.

## Features
- Create audit log entries for any action or change
- Query and filter audit logs by various criteria
- Pagination support for large audit datasets
- Swagger API documentation for all endpoints
- Export service for use in other modules

## Endpoints

### Audit Log Management
- `POST /audit` — Create a new audit log entry
- `GET /audit` — Get audit logs with filtering and pagination
- `GET /audit/:id` — Get audit log by ID

## Usage
1. Import `AuditModule` in your app module.
2. Ensure TypeORM is configured.
3. Use the endpoints to create and query audit logs.
4. Access Swagger UI at `/api` (or your configured path) for interactive API docs.

## Security
- All endpoints are protected with bearer authentication (`@ApiBearerAuth('access-token')`).

## Extending
- Add more advanced filtering options
- Integrate with external logging or monitoring tools
- Add real-time audit log streaming

---