# Tax Module

This module manages driver tax accounts, calculates monthly taxes, and provides endpoints for tax management.

## Features
- Monthly cron job to calculate and update taxes for all drivers
- Endpoints to view driver tax accounts and pay tax
- Swagger documentation for all endpoints

## Cron Job
- **Schedule:** Runs at midnight on the 1st of each month
- **Purpose:** Calculates and updates tax owed for each driver based on their trips and revenue
- **Implementation:** Uses `@nestjs/schedule` and the `@Cron` decorator

## Endpoints
- `GET /tax/driver/:driverId` — Get all tax accounts for a driver
- `POST /tax/pay` — Pay tax for a period

## Usage
1. Import `TaxModule` in your app module.
2. Ensure `@nestjs/schedule` and TypeORM are configured.
3. Use the endpoints to manage and pay driver taxes.

## Extending
- Add more endpoints for tax summaries, admin views, etc.
- Integrate with payment systems for automated tax collection.

---

