import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useToast,
  useColorMode,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { apiService, Email } from '../services/api';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Email;
  onSuccess: () => void;
}

const CATEGORIES = [
  'Ăn uống',
  'Di chuyển',
  'Mua sắm',
  'Hóa đơn & Tiện ích',
  'Giải trí',
  'Sức khỏe',
  'Giáo dục',
  'Khác',
];

// Convert Vietnamese text to uppercase without diacritics
const convertToUpperCase = (text: string): string => {
  const vietnameseMap: { [key: string]: string } = {
    'à': 'A', 'á': 'A', 'ả': 'A', 'ã': 'A', 'ạ': 'A',
    'ă': 'A', 'ằ': 'A', 'ắ': 'A', 'ẳ': 'A', 'ẵ': 'A', 'ặ': 'A',
    'â': 'A', 'ầ': 'A', 'ấ': 'A', 'ẩ': 'A', 'ẫ': 'A', 'ậ': 'A',
    'è': 'E', 'é': 'E', 'ẻ': 'E', 'ẽ': 'E', 'ẹ': 'E',
    'ê': 'E', 'ề': 'E', 'ế': 'E', 'ể': 'E', 'ễ': 'E', 'ệ': 'E',
    'ì': 'I', 'í': 'I', 'ỉ': 'I', 'ĩ': 'I', 'ị': 'I',
    'ò': 'O', 'ó': 'O', 'ỏ': 'O', 'õ': 'O', 'ọ': 'O',
    'ô': 'O', 'ồ': 'O', 'ố': 'O', 'ổ': 'O', 'ỗ': 'O', 'ộ': 'O',
    'ơ': 'O', 'ờ': 'O', 'ớ': 'O', 'ở': 'O', 'ỡ': 'O', 'ợ': 'O',
    'ù': 'U', 'ú': 'U', 'ủ': 'U', 'ũ': 'U', 'ụ': 'U',
    'ư': 'U', 'ừ': 'U', 'ứ': 'U', 'ử': 'U', 'ữ': 'U', 'ự': 'U',
    'ỳ': 'Y', 'ý': 'Y', 'ỷ': 'Y', 'ỹ': 'Y', 'ỵ': 'Y',
    'đ': 'D',
  };

  return text
    .toLowerCase()
    .split('')
    .map(char => vietnameseMap[char] || char.toUpperCase())
    .join('')
    .replace(/\s+/g, '_');
};

// Format VND currency
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function TransactionForm({ isOpen, onClose, transaction, onSuccess }: TransactionFormProps) {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    emailId: '',
    expense: '',
    month: new Date().getMonth() + 1,
    price: '',
    category: 'Khác',
    note: '',
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        emailId: transaction.emailId,
        expense: transaction.expense,
        month: transaction.month,
        price: transaction.price.toString(),
        category: transaction.category || 'Khác',
        note: transaction.note || '',
      });
    } else {
      setFormData({
        emailId: '',
        expense: '',
        month: new Date().getMonth() + 1,
        price: '',
        category: 'Khác',
        note: '',
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const convertedCategory = convertToUpperCase(formData.category);
      if (transaction) {
        await apiService.updateEmail(transaction.id, {
          expense: formData.expense,
          month: formData.month,
          price: parseFloat(formData.price),
          category: convertedCategory,
          note: formData.note,
        });
        toast({
          title: 'Cập nhật thành công',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await apiService.createEmail({
          emailId: formData.emailId,
          expense: formData.expense,
          month: formData.month,
          price: parseFloat(formData.price),
          category: convertedCategory,
          note: formData.note,
        });
        toast({
          title: 'Tạo mới thành công',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Đã xảy ra lỗi',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {transaction ? 'Chỉnh Sửa Giao Dịch' : 'Tạo Giao Dịch Mới'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {!transaction && (
                <FormControl isRequired>
                  <FormLabel>ID Email</FormLabel>
                  <Input
                    value={formData.emailId}
                    onChange={(e) => setFormData({ ...formData, emailId: e.target.value })}
                    placeholder="Nhập ID email"
                  />
                </FormControl>
              )}
              <FormControl isRequired>
                <FormLabel>Mô Tả Chi Tiêu</FormLabel>
                <Input
                  value={formData.expense}
                  onChange={(e) => setFormData({ ...formData, expense: e.target.value })}
                  placeholder="Nhập mô tả chi tiêu"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Tháng</FormLabel>
                <Select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('vi-VN', { month: 'long' })}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Số Tiền</FormLabel>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Nhập số tiền"
                  step="1000"
                  min="0"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Danh Mục</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Ghi Chú</FormLabel>
                <Input
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Nhập ghi chú (tùy chọn)"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Hủy
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
            >
              {transaction ? 'Cập Nhật' : 'Tạo Mới'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
} 