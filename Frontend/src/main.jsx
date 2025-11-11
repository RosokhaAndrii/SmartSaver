import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router';
import App from './App'; 
import Home from './pages/Home/Home';
import Transactions from './pages/Transactions/Transactions';
import Wallets from './pages/Wallets/Wallets';
import Goals from './pages/Goals/Goals';
import Auth from './pages/Auth/Auth';
import { AuthProvider } from './components/AuthProvider/AuthProvider';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<App />}>
          <Route path='home' element={<Home />} />
          <Route path="transactions" element={ <Transactions /> } />
          <Route path="wallets" element={<Wallets />} />
          <Route path="goals" element={<Goals />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
