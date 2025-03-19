import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface EmailData {
  emailId: string;
  expense: string;
  month: number;
  price: number;
  category: string;
  note?: string;
}

interface Email {
  id: number;
  emailId: string;
  expense: string;
  month: number;
  price: number;
  category: string;
  note: string | null;
  createdAt: Date;
  isRead: boolean;
}

@Injectable()
export class EmailService {
  constructor(private prisma: PrismaService) {}

  async getAllEmails() {
    return this.prisma.email.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getEmail(id: number) {
    return this.prisma.email.findUnique({
      where: { id },
    });
  }

  async createEmail(data: {
    emailId: string;
    expense: string;
    month: number;
    price: number;
    category?: string;
    note?: string;
  }) {
    return this.prisma.email.create({
      data: {
        ...data,
        isRead: false,
      },
    });
  }

  async updateEmail(id: number, data: {
    expense?: string;
    month?: number;
    price?: number;
    isRead?: boolean;
    category?: string;
    note?: string;
  }) {
    return this.prisma.email.update({
      where: { id },
      data,
    });
  }

  async deleteEmail(id: number) {
    return this.prisma.email.delete({
      where: { id },
    });
  }

  async getFinancialSummary() {
    const emails = await this.prisma.email.findMany();
    
    const totalExpenses = emails.reduce((sum: number, email) => sum + email.price, 0);
    const monthlyTrend = Array(12).fill(0);
    
    emails.forEach(email => {
      monthlyTrend[email.month - 1] += email.price;
    });

    return {
      totalExpenses,
      monthlyTrend,
    };
  }

  async getEmails() {
    // TODO: Implement actual email fetching logic
    return {
      emails: [],
      total: 0
    };
  }
} 