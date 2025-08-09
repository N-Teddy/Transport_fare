# Trip Module

This module manages trips and GPS tracking logs for the Transport Fare App backend. It provides endpoints for trip management, GPS log ingestion, and rich statistics for analytics and reporting.

## Features
- Create, end, and retrieve trips
- Add single or batch GPS tracking logs to trips
- Retrieve all GPS logs for a trip
- Real-time event publishing via RabbitMQ
- Comprehensive trip and revenue statistics (overall, per driver, per vehicle, daily)
- Swagger API documentation for all endpoints

## Endpoints

### Trip Management
- `POST /trip` — Create a new trip
- `POST /trip/end` — End a trip
- `GET /trip/:id` — Get trip details by ID

### GPS Tracking Logs
- `POST /trip/gps` — Add a GPS tracking log to a trip
- `POST /trip/gps/batch` — Add multiple GPS tracking logs to a trip
- `GET /trip/:id/gps` — Get all GPS tracking logs for a trip

### Statistics
- `GET /trip/stats/overall` — Get overall trip statistics
- `GET /trip/stats/driver/:driverId` — Get trip statistics for a driver
- `GET /trip/stats/vehicle/:vehicleId` — Get trip statistics for a vehicle
- `GET /trip/stats/daily?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` — Get daily trip statistics for a date range

## Usage
1. Import `TripModule` in your app module.
2. Ensure TypeORM and RabbitMQ are configured.
3. Use the endpoints to manage trips, GPS logs, and retrieve statistics.
4. Access Swagger UI at `/api` (or your configured path) for interactive API docs.

## Security
- All endpoints are protected with bearer authentication (`@ApiBearerAuth('access-token')`).

## Extending
- Add more analytics (e.g., by region, by payment method)
- Integrate with external analytics or reporting tools
- Add real-time GPS tracking or driver behavior analysis

---