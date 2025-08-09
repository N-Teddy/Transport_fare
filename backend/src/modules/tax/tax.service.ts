import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DriverTaxAccount } from '../../entities/driver-tax-account.entity';
import { Driver } from '../../entities/driver.entity';
import { Trip } from '../../entities/trip.entity';
import { TaxPaymentStatusEnum } from 'src/common/enum/status.enum';
import { TaxPeriodEnum } from 'src/common/enum/global.enum';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class TaxService {
    private readonly logger = new Logger(TaxService.name);

    constructor(
        @InjectRepository(DriverTaxAccount)
        private readonly taxRepo: Repository<DriverTaxAccount>,
        @InjectRepository(Driver)
        private readonly driverRepo: Repository<Driver>,
        @InjectRepository(Trip)
        private readonly tripRepo: Repository<Trip>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async calculateMonthlyTaxes() {
        this.logger.log('Running monthly tax calculation...');
        const drivers = await this.driverRepo.find();
        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        for (const driver of drivers) {
            // Calculate total trips and revenue for the period
            const trips = await this.tripRepo.find({
                where: {
                    driverId: driver.id,
                    startTime: Between(periodStart, periodEnd),
                },
            });
            const totalTrips = trips.length;
            const totalRevenue = trips.reduce((sum, t) => sum + (t.totalFare || 0), 0);
            const taxRate = 0.05; // 5% tax rate (example)
            const taxOwed = Math.round(totalRevenue * taxRate);
            // Create or update tax account
            let taxAccount = await this.taxRepo.findOne({
                where: {
                    driverId: driver.id,
                    taxPeriod: TaxPeriodEnum.MONTHLY,
                    periodStart,
                    periodEnd,
                },
            });
            if (!taxAccount) {
                taxAccount = this.taxRepo.create({
                    driverId: driver.id,
                    taxPeriod: TaxPeriodEnum.MONTHLY,
                    periodStart,
                    periodEnd,
                    totalTrips,
                    totalRevenue,
                    taxRate,
                    taxOwed,
                    taxPaid: 0,
                    paymentDueDate: new Date(now.getFullYear(), now.getMonth(), 10), // Due 10th of month
                    status: TaxPaymentStatusEnum.PENDING,
                });
            } else {
                taxAccount.totalTrips = totalTrips;
                taxAccount.totalRevenue = totalRevenue;
                taxAccount.taxOwed = taxOwed;
                taxAccount.status = TaxPaymentStatusEnum.PENDING;
            }
            await this.taxRepo.save(taxAccount);
        }
        this.logger.log('Monthly tax calculation completed.');
    }

    async getDriverTaxAccounts(driverId: string) {
        return this.taxRepo.find({ where: { driverId }, order: { periodStart: 'DESC' } });
    }

    async payTax(body: { driverId: string; periodStart: string; amount: number }) {
        const { driverId, periodStart, amount } = body;
        const taxAccount = await this.taxRepo.findOne({
            where: { driverId, periodStart: new Date(periodStart) },
        });
        if (!taxAccount) throw new NotFoundException('Tax account not found');
        if (taxAccount.taxPaid + amount > taxAccount.taxOwed)
            throw new BadRequestException('Overpayment not allowed');
        taxAccount.taxPaid += amount;
        if (taxAccount.taxPaid >= taxAccount.taxOwed) {
            taxAccount.status = TaxPaymentStatusEnum.PAID;
        }
        await this.taxRepo.save(taxAccount);
        await this.cacheManager.del('tax:list');
        return { success: true, status: taxAccount.status, taxPaid: taxAccount.taxPaid };
    }

    // Additional methods for controller endpoints will go here
}
