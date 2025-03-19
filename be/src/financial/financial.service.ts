import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FinancialService {
  constructor(private prisma: PrismaService) {}

  async getFinancialSummary() {
    // Get all transactions
    const transactions = await this.prisma.email.findMany();

    // Calculate total income (positive values)
    const totalIncome = transactions
      .filter(t => t.price > 0)
      .reduce((sum, t) => sum + t.price, 0);

    // Calculate total expenses (negative values)
    const totalExpenses = transactions
      .filter(t => t.price < 0)
      .reduce((sum, t) => sum + Math.abs(t.price), 0);

    // Calculate net change
    const netChange = totalIncome - totalExpenses;

    // Calculate expense distribution by category
    const expenseDistribution = transactions
      .filter(t => t.price < 0)
      .reduce((acc, t) => {
        const category = t.category || 'Others';
        acc[category] = (acc[category] || 0) + t.price;
        return acc;
      }, {} as Record<string, number>);

    // Calculate monthly trend
    const monthlyTrend = Array(12).fill(0);
    transactions.forEach(t => {
      const month = new Date(t.createdAt).getMonth();
      monthlyTrend[month] += t.price;
    });

    return {
      totalIncome,
      totalExpenses,
      netChange,
      expenseDistribution,
      monthlyTrend,
    };
  }
} 