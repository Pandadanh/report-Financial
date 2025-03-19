import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { apiService } from '../services/api';

interface EmailFormData {
  emailId: string;
  expense: string;
  month: number;
  price: number;
  category: string;
  note?: string;
}

function EmailForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState<EmailFormData>({
    emailId: '',
    expense: '',
    month: new Date().getMonth() + 1,
    price: 0,
    category: 'Others',
    note: '',
  });

  const categories = [
    'Food',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills',
    'Others',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createEmail(formData);
      toast({
        title: 'Transaction added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error adding transaction',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  return (
    <Box maxW="600px" mx="auto">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email ID</FormLabel>
            <Input
              name="emailId"
              value={formData.emailId}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Expense Description</FormLabel>
            <Input
              name="expense"
              value={formData.expense}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Month</FormLabel>
            <Select name="month" value={formData.month} onChange={handleChange}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2024, month - 1).toLocaleString('default', {
                    month: 'long',
                  })}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Amount</FormLabel>
            <Input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Category</FormLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Note</FormLabel>
            <Textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
            />
          </FormControl>

          <Button type="submit" colorScheme="blue" width="full">
            Add Transaction
          </Button>
        </VStack>
      </form>
    </Box>
  );
}

export default EmailForm; 