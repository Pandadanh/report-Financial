import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import Dashboard from './components/Dashboard';
import EmailList from './components/EmailList';
import EmailForm from './components/EmailForm';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/emails" element={<EmailList />} />
          <Route path="/add" element={<EmailForm />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
