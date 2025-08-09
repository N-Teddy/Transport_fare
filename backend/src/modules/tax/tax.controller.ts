import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TaxService } from './tax.service';
import { PayTaxDto, DriverTaxQueryDto } from '../../dto/request/tax.dto';
import { TaxAccountDto, PayTaxResponseDto } from '../../dto/response/tax.dto';
import { ApiResponseDto } from '../../dto/response/common.dto';
import { ApiResponseStatus, ApiResponseMessage } from '../../common/enum/global.enum';

@ApiTags('tax')
@ApiBearerAuth('access-token')
@Controller('tax')
export class TaxController {
    constructor(private readonly taxService: TaxService) {}

    @Get('driver/:driverId')
    @ApiOperation({ summary: 'Get tax accounts for a driver' })
    @ApiResponse({ status: 200, description: 'List of tax accounts.', type: [TaxAccountDto] })
    async getDriverTaxAccounts(
        @Param() params: DriverTaxQueryDto,
    ): Promise<ApiResponseDto<TaxAccountDto[]>> {
        const result = await this.taxService.getDriverTaxAccounts(params.driverId);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.TAX_ACCOUNTS_FETCHED,
            data: result,
        };
    }

    @Post('pay')
    @ApiOperation({ summary: 'Pay tax for a period' })
    @ApiResponse({ status: 200, description: 'Tax payment processed.', type: PayTaxResponseDto })
    async payTax(@Body() body: PayTaxDto): Promise<ApiResponseDto<PayTaxResponseDto>> {
        const result = await this.taxService.payTax(body);
        return {
            status: ApiResponseStatus.SUCCESS,
            message: ApiResponseMessage.TAX_PAID,
            data: result,
        };
    }
}
