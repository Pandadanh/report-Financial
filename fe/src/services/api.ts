import axios, { AxiosError } from 'axios';

const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  }
};

const api = axios.create(API_CONFIG);

interface ErrorResponse {
  message: string;
  error?: string;
}

const handleError = (error: AxiosError<ErrorResponse>) => {
  if (error.response) {
    throw new Error(error.response.data.message || 'Server error');
  } else if (error.request) {
    throw new Error('Network error');
  } else {
    throw new Error('An error occurred');
  }
};

export interface Email {
  id: number;
  emailId: string;
  expense: string;
  createdAt: string;
  month: number;
  price: number;
  isRead: boolean;
  category: string;
  note?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
  expenseDistribution: Record<string, number>;
  monthlyTrend: number[];
}

export const apiService = {
  getEmails: async () => {
    try {
      const response = await api.get<Email[]>('/api/emails');
      return response;
    } catch (error) {
      handleError(error as AxiosError<ErrorResponse>);
    }
  },

  getEmail: async (id: number) => {
    try {
      const response = await api.get<Email>(`/api/emails/${id}`);
      return response;
    } catch (error) {
      handleError(error as AxiosError<ErrorResponse>);
    }
  },

  createEmail: async (data: Omit<Email, 'id' | 'createdAt' | 'isRead'>) => {
    try {
      const response = await api.post<Email>('/api/emails', data);
      return response;
    } catch (error) {
      handleError(error as AxiosError<ErrorResponse>);
    }
  },

  updateEmail: async (id: number, data: Partial<Email>) => {
    try {
      const response = await api.put<Email>(`/api/emails/${id}`, data);
      return response;
    } catch (error) {
      handleError(error as AxiosError<ErrorResponse>);
    }
  },

  deleteEmail: async (id: number) => {
    try {
      const response = await api.delete(`/api/emails/${id}`);
      return response;
    } catch (error) {
      handleError(error as AxiosError<ErrorResponse>);
    }
  },

  getFinancialSummary: async () => {
    try {
      const response = await api.get<FinancialSummary>('/api/financial-summary');
      return response;
    } catch (error) {
      handleError(error as AxiosError<ErrorResponse>);
    }
  },
}; 