import { useState, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Heading,
  Select,
  Badge,
} from '@chakra-ui/react';
import axios from 'axios';

interface Email {
  id: number;
  emailId: string;
  expense: string;
  month: number;
  price: number;
  category: string;
  note?: string;
  createdAt: string;
}

function EmailList() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );

  useEffect(() => {
    fetchEmails();
  }, [selectedMonth]);

  const fetchEmails = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/emails?month=${selectedMonth}`);
      setEmails(response.data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Financial Transactions
      </Heading>

      <Select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
        mb={4}
        maxW="200px"
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
          <option key={month} value={month}>
            {new Date(2024, month - 1).toLocaleString('default', {
              month: 'long',
            })}
          </option>
        ))}
      </Select>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Category</Th>
            <Th>Expense</Th>
            <Th isNumeric>Amount</Th>
            <Th>Note</Th>
          </Tr>
        </Thead>
        <Tbody>
          {emails.map((email) => (
            <Tr key={email.id}>
              <Td>{formatDate(email.createdAt)}</Td>
              <Td>
                <Badge colorScheme={getCategoryColor(email.category)}>
                  {email.category}
                </Badge>
              </Td>
              <Td>{email.expense}</Td>
              <Td isNumeric>{formatPrice(email.price)}</Td>
              <Td>{email.note}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    Food: 'green',
    Transportation: 'blue',
    Shopping: 'purple',
    Entertainment: 'pink',
    Bills: 'red',
    Others: 'gray',
  };
  return colors[category] || 'gray';
}

export default EmailList; 