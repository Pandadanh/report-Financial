import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  IconButton,
  Button,
  Container,
  SimpleGrid,
  useColorMode,
  useToast,
  Spinner,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useBreakpointValue,
  VStack,
  Badge,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, AddIcon, EditIcon, DownloadIcon } from '@chakra-ui/icons';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { apiService, Email, FinancialSummary } from '../services/api';
import { TransactionForm } from './TransactionForm';
import { keyframes } from '@emotion/react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Format VND currency
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Chart colors
const CHART_COLORS = {
  income: '#4CAF50', // Green for income
  expense: '#FF6B6B', // Red for expenses
  categories: [
    '#FF6B6B', // Red - Ăn uống
    '#FFB946', // Orange - Di chuyển
    '#4CAF50', // Green - Mua sắm
    '#4E7FFF', // Blue - Hóa đơn & Tiện ích
    '#9B59B6', // Purple - Giải trí
    '#E67E22', // Dark Orange - Sức khỏe
    '#2ECC71', // Light Green - Giáo dục
    '#3498DB', // Light Blue - Khác
  ],
};

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

function Dashboard() {
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Email | undefined>();
  const [financialData, setFinancialData] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netChange: 0,
    expenseDistribution: {},
    monthlyTrend: Array(12).fill(0),
  });
  const [recentTransactions, setRecentTransactions] = useState<Email[]>([]);

  // Update responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });
  const chartHeight = useBreakpointValue({ base: '250px', md: '300px' });
  const containerPadding = useBreakpointValue({ base: 4, md: 6, lg: 8 });

  // Animation styles
  const cardAnimation = {
    animation: `${fadeIn} 0.5s ease-out forwards`,
    transition: 'all 0.3s ease-in-out',
    _hover: {
      transform: 'translateY(-4px)',
      boxShadow: 'lg',
      animation: `${pulse} 0.5s ease-in-out`,
    },
  };

  const transactionAnimation = {
    animation: `${slideIn} 0.3s ease-out forwards`,
    transition: 'all 0.2s ease-in-out',
    _hover: {
      transform: 'translateX(4px)',
      bg: colorMode === 'light' ? 'gray.100' : 'gray.500',
    },
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [financialResponse, transactionsResponse] = await Promise.all([
        apiService.getFinancialSummary(),
        apiService.getEmails(),
      ]);

      if (financialResponse?.data) {
        setFinancialData(financialResponse.data);
      }
      if (transactionsResponse?.data) {
        setRecentTransactions(transactionsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Lỗi khi tải dữ liệu',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  const handleCreateTransaction = () => {
    setSelectedTransaction(undefined);
    setIsFormOpen(true);
  };

  const handleEditTransaction = (transaction: Email) => {
    setSelectedTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      return;
    }

    try {
      await apiService.deleteEmail(id);
      toast({
        title: 'Xóa giao dịch thành công',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: 'Lỗi khi xóa giao dịch',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Prepare data for the line chart
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Thu Nhập',
        data: financialData.monthlyTrend.map(value => value > 0 ? value : 0),
        borderColor: CHART_COLORS.income,
        backgroundColor: CHART_COLORS.income + '40',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Chi Tiêu',
        data: financialData.monthlyTrend.map(value => value < 0 ? Math.abs(value) : 0),
        borderColor: CHART_COLORS.expense,
        backgroundColor: CHART_COLORS.expense + '40',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Calculate expense percentages
  const calculateExpensePercentages = (distribution: Record<string, number>) => {
    // Filter out positive values and get only expenses
    const expenses = Object.entries(distribution).filter(([, value]) => value < 0);
    const totalExpenses = expenses.reduce((sum, [, value]) => sum + Math.abs(value), 0);
    
    return expenses.map(([category, amount]) => ({
      category,
      amount: Math.abs(amount),
      percentage: totalExpenses > 0 ? (Math.abs(amount) / totalExpenses) * 100 : 0,
    }));
  };

  // Prepare data for the expense distribution pie chart
  const pieChartData = {
    labels: Object.entries(financialData.expenseDistribution || {})
      .filter(([, value]) => value < 0)
      .map(([category]) => category),
    datasets: [
      {
        data: Object.entries(financialData.expenseDistribution || {})
          .filter(([, value]) => value < 0)
          .map(([, value]) => Math.abs(value)),
        backgroundColor: CHART_COLORS.categories,
        borderWidth: 1,
      },
    ],
  };

  // Get expense percentages for labels
  const expensePercentages = calculateExpensePercentages(financialData.expenseDistribution || {});

  if (isLoading) {
    return (
      <Box w="100%" minH="100vh">
        <Flex justify="center" align="center" minH="60vh">
          <Spinner size="xl" />
        </Flex>
      </Box>
    );
  }

  return (
    <Box w="100%" minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}>
      <Container maxW="100%" p={containerPadding}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          mb={6}
          gap={4}
          animation={`${fadeIn} 0.5s ease-out forwards`}
        >
          <Heading size="lg">Financial Dashboard</Heading>
          <HStack spacing={2} flexWrap="wrap">
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              size="sm"
              transition="all 0.2s"
              _hover={{ transform: 'rotate(180deg)' }}
            />
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              onClick={handleCreateTransaction}
              size="sm"
              transition="all 0.2s"
              _hover={{ transform: 'scale(1.05)' }}
            >
              Add Transaction
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="purple"
              size="sm"
              variant="outline"
              transition="all 0.2s"
              _hover={{ transform: 'scale(1.05)' }}
            >
              Export
            </Button>
          </HStack>
        </Flex>

        <SimpleGrid columns={gridColumns} spacing={6} mb={6}>
          <Card
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            borderRadius="lg"
            boxShadow="sm"
            {...cardAnimation}
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.500">Tổng Thu Nhập</StatLabel>
                <StatNumber color="green.500" fontSize="2xl">
                  {formatVND(financialData.totalIncome || 0)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Thu nhập tháng này
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            borderRadius="lg"
            boxShadow="sm"
            {...cardAnimation}
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.500">Tổng Chi Tiêu</StatLabel>
                <StatNumber color="red.500" fontSize="2xl">
                  {formatVND(financialData.totalExpenses || 0)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                  Chi tiêu tháng này
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            borderRadius="lg"
            boxShadow="sm"
            {...cardAnimation}
          >
            <CardBody>
              <Stat>
                <StatLabel color="gray.500">Thay Đổi Ròng</StatLabel>
                <StatNumber
                  color={financialData.netChange >= 0 ? 'green.500' : 'red.500'}
                  fontSize="2xl"
                >
                  {formatVND(financialData.netChange || 0)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={financialData.netChange >= 0 ? 'increase' : 'decrease'}
                  />
                  {financialData.netChange >= 0 ? 'Tăng' : 'Giảm'} so với tháng trước
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
          <Card
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            borderRadius="lg"
            boxShadow="sm"
            {...cardAnimation}
          >
            <CardHeader>
              <Heading size="md">Xu Hướng Tài Chính</Heading>
            </CardHeader>
            <CardBody>
              <Box height={chartHeight}>
                <Line
                  data={lineChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 1000,
                      easing: 'easeInOutQuart',
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => formatVND(Number(value)),
                        },
                      },
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            return `${label}: ${formatVND(value)}`;
                          },
                        },
                      },
                    },
                  }}
                />
              </Box>
            </CardBody>
          </Card>

          <Card
            bg={colorMode === 'light' ? 'white' : 'gray.700'}
            borderRadius="lg"
            boxShadow="sm"
            {...cardAnimation}
          >
            <CardHeader>
              <Heading size="md">Phân Phối Chi Tiêu</Heading>
            </CardHeader>
            <CardBody>
              <Box height={chartHeight}>
                <Pie
                  data={pieChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 1000,
                      easing: 'easeInOutQuart',
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed;
                            const percentage = expensePercentages.find(p => p.category === label)?.percentage || 0;
                            return [
                              `${label}: ${formatVND(value)}`,
                              `Tỷ lệ: ${percentage.toFixed(1)}%`,
                            ];
                          },
                        },
                      },
                      legend: {
                        position: isMobile ? 'bottom' : 'right',
                        labels: {
                          generateLabels: (chart) => {
                            const data = chart.data;
                            if (data.labels && data.datasets) {
                              return data.labels.map((label, i) => {
                                const percentage = expensePercentages.find(p => p.category === label)?.percentage || 0;
                                return {
                                  text: `${label}: ${percentage.toFixed(1)}%`,
                                  fillStyle: CHART_COLORS.categories[i],
                                  hidden: false,
                                  index: i,
                                };
                              });
                            }
                            return [];
                          },
                        },
                      },
                    },
                  }}
                />
              </Box>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card
          bg={colorMode === 'light' ? 'white' : 'gray.700'}
          borderRadius="lg"
          boxShadow="sm"
          {...cardAnimation}
        >
          <CardHeader>
            <Heading size="md">Giao Dịch Gần Đây</Heading>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <VStack spacing={4} align="stretch">
                {recentTransactions.map((transaction, index) => (
                  <Box
                    key={transaction.id}
                    p={4}
                    bg={colorMode === 'light' ? 'gray.50' : 'gray.600'}
                    borderRadius="md"
                    {...transactionAnimation}
                    animation={`${slideIn} 0.3s ease-out ${index * 0.1}s forwards`}
                  >
                    <Flex 
                      direction={{ base: 'column', md: 'row' }}
                      justify="space-between" 
                      align={{ base: 'stretch', md: 'center' }}
                      gap={4}
                    >
                      <VStack align="start" spacing={2} flex={1} minW={0}>
                        <Text 
                          fontWeight="medium"
                          noOfLines={2}
                          wordBreak="break-word"
                        >
                          {transaction.expense || 'Không có mô tả'}
                        </Text>
                        <HStack spacing={2} flexWrap="wrap">
                          <Badge colorScheme={transaction.price >= 0 ? 'green' : 'red'}>
                            {transaction.category || 'Chưa phân loại'}
                          </Badge>
                          <Text color="gray.500" fontSize="sm">
                            {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                          </Text>
                        </HStack>
                      </VStack>
                      <HStack 
                        spacing={2} 
                        align="center"
                        justify={{ base: 'flex-end', md: 'flex-start' }}
                      >
                        <Text
                          fontWeight="bold"
                          color={transaction.price >= 0 ? 'green.500' : 'red.500'}
                          fontSize={{ base: 'sm', md: 'md' }}
                        >
                          {formatVND(transaction.price)}
                        </Text>
                        <HStack spacing={1}>
                          <IconButton
                            aria-label="Edit transaction"
                            icon={<EditIcon />}
                            size="sm"
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleEditTransaction(transaction)}
                            transition="all 0.2s"
                            _hover={{ transform: 'scale(1.1)' }}
                          />
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDelete(transaction.id)}
                            transition="all 0.2s"
                            _hover={{ transform: 'scale(1.1)' }}
                          >
                            Delete
                          </Button>
                        </HStack>
                      </HStack>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Box>
          </CardBody>
        </Card>

        <TransactionForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedTransaction(undefined);
          }}
          transaction={selectedTransaction}
          onSuccess={fetchData}
        />
      </Container>
    </Box>
  );
}

export default Dashboard; 