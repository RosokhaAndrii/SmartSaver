import React from 'react'
import './index.css'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'   
import App from './App'
import Auth from './pages/Auth/Auth'
import Registration from './pages/Registraition/Registraition.jsx'
import Home from './pages/Home/Home.jsx'
import Wallets from './pages/Wallets/Wallets.jsx'
import Transactions from './pages/Transactions/Transactions.jsx'
import Goals from './pages/Goals/Goals.jsx' 
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.jsx'
import { AuthProvider } from './components/AuthProvider/AuthProvider'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/" element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }>
            <Route index element={<Home />} />              
            <Route path="home" element={<Home />} />         
            <Route path="wallets" element={<Wallets />} />   
            <Route path="transactions" element={<Transactions />} />
            <Route path="goals" element={<Goals />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
