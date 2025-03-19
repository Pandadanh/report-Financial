import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('api/emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  async getAllEmails() {
    return this.emailService.getAllEmails();
  }

  @Get(':id')
  async getEmail(@Param('id') id: string) {
    return this.emailService.getEmail(parseInt(id));
  }

  @Post()
  async createEmail(@Body() data: {
    emailId: string;
    expense: string;
    month: number;
    price: number;
    category?: string;
    note?: string;
  }) {
    return this.emailService.createEmail(data);
  }

  @Put(':id')
  async updateEmail(
    @Param('id') id: string,
    @Body() data: {
      expense?: string;
      month?: number;
      price?: number;
      isRead?: boolean;
      category?: string;
      note?: string;
    },
  ) {
    return this.emailService.updateEmail(parseInt(id), data);
  }

  @Delete(':id')
  async deleteEmail(@Param('id') id: string) {
    return this.emailService.deleteEmail(parseInt(id));
  }
} 