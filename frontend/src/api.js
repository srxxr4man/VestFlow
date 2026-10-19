const BASE_URL = 'http://localhost:8080/api/finance';

// ==========================================
// Authentication Endpoints
// ==========================================

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || 'Authentication failed');
  }
  return res.json();
};

export const registerUser = async (id, name, email, password) => {
  const res = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, email, password }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || 'Registration failed');
  }
  return res.json();
};

export const resetPassword = async (email, newPassword) => {
  const res = await fetch(`${BASE_URL}/users/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || 'Password reset failed');
  }
  return res.json();
};

// ==========================================
// Dashboard Data & Metrics (User Scoped)
// ==========================================

export const getDashboardData = async (userId = '') => {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const res = await fetch(`${BASE_URL}/all${query}`);
  if (!res.ok) throw new Error('Failed to load portfolio metrics');
  return res.json();
};

// ==========================================
// Transaction Mutators
// ==========================================

export const addIncome = async (amount, category, userId = '', date = '') => {
  const res = await fetch(`${BASE_URL}/income`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      amount: parseFloat(amount) || 0, 
      category: category.trim(),
      userId,
      date
    }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || `Failed to log income (HTTP ${res.status})`);
  }
  return res.text();
};

export const addExpense = async (amount, category, userId = '', date = '') => {
  const res = await fetch(`${BASE_URL}/expense`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      amount: parseFloat(amount) || 0, 
      category: category.trim(),
      userId,
      date
    }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || `Failed to log expense (HTTP ${res.status})`);
  }
  return res.text();
};

export const deleteTransaction = async (id) => {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || `Failed to delete transaction (HTTP ${res.status})`);
  }
  return res.text();
};

// ==========================================
// Investment Mutators (Buy, Sell & Delete)
// ==========================================

export const addStock = async (symbol, qty, buyPrice, marketPrice, userId = '', date = '') => {
  const res = await fetch(`${BASE_URL}/investment/stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbol: symbol.trim().toUpperCase(),
      qty: parseFloat(qty) || 0,
      buyPrice: parseFloat(buyPrice) || 0,
      marketPrice: parseFloat(marketPrice) || 0,
      userId,
      date
    }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || `Failed to add stock (HTTP ${res.status})`);
  }
  return res.text();
};

export const addCrypto = async (symbol, qty, buyPrice, marketPrice, fee = 0, userId = '', date = '') => {
  const res = await fetch(`${BASE_URL}/investment/crypto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbol: symbol.trim().toUpperCase(),
      qty: parseFloat(qty) || 0,
      buyPrice: parseFloat(buyPrice) || 0,
      marketPrice: parseFloat(marketPrice) || 0,
      fee: parseFloat(fee) || 0,
      userId,
      date
    }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || `Failed to add crypto (HTTP ${res.status})`);
  }
  return res.text();
};

export const addGold = async (symbol, quantityGrams, purchasePricePerGram, pricePerGram, userId = '', date = '') => {
  const res = await fetch(`${BASE_URL}/investment/gold`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      symbol: symbol.trim().toUpperCase(),
      quantityGrams: parseFloat(quantityGrams) || 0,
      purchasePricePerGram: parseFloat(purchasePricePerGram) || 0,
      pricePerGram: parseFloat(pricePerGram) || 0,
      userId,
      date
    }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || `Failed to add gold (HTTP ${res.status})`);
  }
  return res.text();
};

export const sellInvestment = async (id, sellPrice) => {
  const res = await fetch(`${BASE_URL}/investments/${id}/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sellPrice: parseFloat(sellPrice) || 0 }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || `Failed to sell position (HTTP ${res.status})`);
  }
  return res.text();
};

export const updateInvestmentPrice = async (id, marketPrice) => {
  const res = await fetch(`${BASE_URL}/investments/${id}/price`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marketPrice: parseFloat(marketPrice) || 0 }),
  });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || `Failed to update price (HTTP ${res.status})`);
  }
  return res.json();
};

export const deleteInvestment = async (id) => {
  const res = await fetch(`${BASE_URL}/investments/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorMsg = await res.text();
    throw new Error(errorMsg || `Failed to delete investment (HTTP ${res.status})`);
  }
  return res.text();
};

// ==========================================
// Excel Report Export
// ==========================================

export const downloadExcelReport = async (userId = '') => {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  const res = await fetch(`${BASE_URL}/report/export/excel${query}`);
  if (!res.ok) throw new Error(`Failed to export statement (HTTP ${res.status})`);

  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `portfolio_statement_${userId || 'summary'}_${Date.now()}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(downloadUrl);
};