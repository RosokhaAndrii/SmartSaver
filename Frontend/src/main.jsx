import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router';
import Transactions from './pages/Transactions/Transactions.jsx';
import Goals from './pages/Goals/Goals.jsx';
import Wallets from './pages/Wallets/Wallets.jsx';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/wallets" element={<Wallets />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
