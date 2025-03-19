import { Controller, Get } from '@nestjs/common';
import { FinancialService } from './financial.service';

@Controller('api/financial-summary')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get()
  async getFinancialSummary() {
    return this.financialService.getFinancialSummary();
  }
} 