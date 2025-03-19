import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FinancialController } from './financial/financial.controller';
import { FinancialService } from './financial/financial.service';
import { EmailController } from './email/email.controller';
import { EmailService } from './email/email.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [FinancialController, EmailController],
  providers: [FinancialService, EmailService, PrismaService],
})
export class AppModule {} 