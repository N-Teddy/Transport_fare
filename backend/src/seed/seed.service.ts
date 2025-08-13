import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { usersSeed } from './data/users.seed-data';
import { City } from 'src/entities/city.entity';
import { citiesSeed } from './data/cities.seed-data';
import { CityEnum } from 'src/common/enum/city.enum';
import { FareRate } from 'src/entities/fare-rates.entity';
import { fareSeed } from './data/fare.seed-data';
import { RegionalFareMultiplier } from 'src/entities/regional-fare-rates.entity';
import { RegionalFareMultiplierSeed } from './data/regional-multiplier.seed-data';
import { Trip } from 'src/entities/trip.entity';
import { tripSeeds } from './data/trip.seed-data';
import { DriverRating } from 'src/entities/driver-rating.entity';
import { ratingsSeed } from './data/rating.seed-data';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(City) private readonly cityRepo: Repository<City>,
        @InjectRepository(FareRate) private readonly fareRepo: Repository<FareRate>,
        @InjectRepository(RegionalFareMultiplier)
        private readonly regionalMultiplierRepo: Repository<RegionalFareMultiplier>,
        @InjectRepository(Trip) private readonly tripRepo: Repository<Trip>,
        @InjectRepository(DriverRating) private readonly ratingRepo: Repository<DriverRating>,
    ) {}

    async onApplicationBootstrap() {
        await this.seedUsers();
        await this.seedCities();
        await this.seedFares();
        await this.seedRegionalMultipliers();
        await this.seedTrips();
        await this.seedRatings();
    }

    private async seedUsers() {
        console.log('🌱 Seeding users...');

        for (const user of usersSeed) {
            const exists = await this.userRepo.findOne({
                where: [{ email: user.email }, { username: user.username }],
            });

            if (exists) {
                console.log(`⏩ Skipping user ${user.email} (already exists)`);
                continue;
            }

            const passwordHash = await bcrypt.hash(user.password, 10);

            await this.userRepo.save(
                this.userRepo.create({
                    ...user,
                    passwordHash,
                }),
            );

            console.log(`✅ Inserted user ${user.email}`);
        }

        console.log('✅ User seeding complete.');
    }

    private async seedCities() {
        console.log('🌱 Seeding cities...');

        for (const city of citiesSeed) {
            const cityEnumValue =
                CityEnum[Object.keys(CityEnum).find((key) => CityEnum[key] === city.name)!];

            if (!cityEnumValue) {
                console.warn(`⚠️ City name "${city.name}" not found in CityEnum. Skipping.`);
                continue;
            }

            const exists = await this.cityRepo.findOne({
                where: { name: cityEnumValue, regionId: city.regionId },
            });

            if (exists) {
                console.log(`⏩ Skipping city ${city.name} (already exists)`);
                continue;
            }

            await this.cityRepo.save(
                this.cityRepo.create({
                    regionId: city.regionId,
                    name: cityEnumValue,
                    isMajorCity: city.isMajorCity,
                }),
            );

            console.log(`✅ Inserted city ${city.name}`);
        }

        console.log('✅ City seeding complete.');
    }

    private async seedFares() {
        console.log('🌱 Seeding fares...');

        for (const fare of fareSeed) {
            const exists = await this.fareRepo.findOne({
                where: {
                    vehicleTypeId: fare.vehicleTypeId,
                    effectiveFrom: fare.effectiveFrom,
                },
            });

            if (exists) {
                console.log(`⏩ Skipping fare for vehicle ${fare.vehicleTypeId} (already exists)`);
                continue;
            }

            await this.fareRepo.save(this.fareRepo.create(fare));
            console.log(`✅ Inserted fare for vehicle ${fare.vehicleTypeId}`);
        }

        console.log('✅ Fare seeding complete.');
    }

    private async seedRegionalMultipliers() {
        console.log('🌱 Seeding regional multipliers...');

        for (const multiplier of RegionalFareMultiplierSeed) {
            const exists = await this.regionalMultiplierRepo.findOne({
                where: {
                    regionId: multiplier.regionId,
                },
            });

            if (exists) {
                console.log(
                    `⏩ Skipping multiplier for region ${multiplier.regionId} (already exists)`,
                );
                continue;
            }

            await this.regionalMultiplierRepo.save(this.regionalMultiplierRepo.create(multiplier));
            console.log(`✅ Inserted multiplier for region ${multiplier.regionId}`);
        }

        console.log('✅ Regional multiplier seeding complete.');
    }

    private async seedTrips() {
        console.log('🌱 Seeding trips...');

        for (const trip of tripSeeds) {
            const exists = await this.tripRepo.findOne({
                where: {
                    paymentReference: trip.paymentReference,
                },
            });

            if (exists) {
                console.log(`⏩ Skipping trip ${trip.paymentReference} (already exists)`);
                continue;
            }

            await this.tripRepo.save(this.tripRepo.create(trip));
            console.log(`✅ Inserted trip ${trip.paymentReference}`);
        }

        console.log('✅ Trip seeding complete.');
    }

    private async seedRatings() {
        console.log('🌱 Seeding ratings...');

        for (const rating of ratingsSeed) {
            const exists = await this.ratingRepo.findOne({
                where: {
                    passengerPhone: rating.passengerPhone,
                    driverId: rating.driverId,
                },
            });

            if (exists) {
                console.log(`⏩ Skipping trip ${rating.driverId} (already exists)`);
                continue;
            }

            await this.ratingRepo.save(
                this.ratingRepo.create({
                    ...rating,
                    driver: { id: rating.driverId },
                }),
            );

            console.log(`✅ Inserted rating for trip ${rating.driverId}`);
        }

        console.log('✅ Rating seeding complete.');
    }
}
