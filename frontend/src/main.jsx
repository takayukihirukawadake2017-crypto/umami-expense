import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AdminPage from './pages/AdminPage';
import ExpenseForm from './pages/ExpenseForm';
import ExpenseList from './pages/ExpenseList';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/expense/new" element={<ExpenseForm />} />
        <Route path="/expense/:id" element={<ExpenseForm />} />
        <Route path="/expenses" element={<ExpenseList />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/expenses" element={<AdminPage tab="expenses" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
