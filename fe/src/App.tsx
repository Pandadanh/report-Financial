import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import theme from './theme';
import Dashboard from './components/Dashboard';
import EmailForm from './components/EmailForm';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transaction/new" element={<EmailForm />} />
          <Route path="/transaction/:id" element={<EmailForm />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
