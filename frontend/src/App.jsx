import { useEffect, useState, useMemo } from 'react';
import * as api from './api';
import { 
  TrendingUp, TrendingDown, Wallet, PieChart as PieChartIcon, 
  ArrowUpRight, ArrowDownRight, Trash2, Download, 
  PlusCircle, Coins, RefreshCw, Layers, BarChart3, LogOut, 
  UserCheck, ShieldCheck, Mail, Lock, Eye, EyeOff, KeyRound, Sparkles, User, Edit3, Check, X, Calendar
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

const CHART_COLORS = ['#38bdf8', '#818cf8', '#fbbf24', '#34d399', '#f43f5e', '#a855f7'];

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ft_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN', 'REGISTER', 'FORGOT'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [regId, setRegId] = useState('');
  const [regName, setRegName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Loading screen states (0 to 100%)
  const [initialLoading, setInitialLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Exact 2.0-second timer (100 steps * 20ms = 2000ms)
  useEffect(() => {
    if (!initialLoading) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [initialLoading]);

  // Hold at 100% briefly so the user sees the completed state
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        setInitialLoading(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const [txDate, setTxDate] = useState(getTodayDate());
  const [invDate, setInvDate] = useState(getTodayDate());

  // Price edit states
  const [editingInvId, setEditingInvId] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');

  // Dashboard states
  const [data, setData] = useState({ metrics: {}, transactions: [], investments: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('TX');

  // Transaction form states
  const [txType, setTxType] = useState('INCOME');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('');

  // Investment form states
  const [invSymbol, setInvSymbol] = useState('');
  const [invQty, setInvQty] = useState('');
  const [invBuyPrice, setInvBuyPrice] = useState('');
  const [invMarketPrice, setInvMarketPrice] = useState('');
  const [invFee, setInvFee] = useState('');

  const loadData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const res = await api.getDashboardData(currentUser.id);
      setData(res);
    } catch (err) {
      console.error('Failed to load portfolio metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Handle Authentication (Login / Register / Forgot Password)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      if (authMode === 'LOGIN') {
        const userResponse = await api.loginUser(authEmail, authPassword);
        setCurrentUser(userResponse);
        localStorage.setItem('ft_user', JSON.stringify(userResponse));
      } else if (authMode === 'REGISTER') {
        const userResponse = await api.registerUser(regId, regName, authEmail, authPassword);
        setCurrentUser(userResponse);
        localStorage.setItem('ft_user', JSON.stringify(userResponse));
      } else if (authMode === 'FORGOT') {
        const res = await api.resetPassword(authEmail, resetNewPassword);
        setAuthSuccess(res.message || 'Password reset successfully! You can now log in.');
        setResetNewPassword('');
        setAuthPassword('');
        setAuthMode('LOGIN');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ft_user');
    setData({ metrics: {}, transactions: [], investments: [] });
    setAuthEmail('');
    setAuthPassword('');
    setRegId('');
    setRegName('');
    setAuthError('');
    setAuthMode('LOGIN');
  };

  // Prepare Asset Allocation Data for Donut Chart
  const assetAllocationData = useMemo(() => {
    if (!data.investments || data.investments.length === 0) return [];
    const grouped = {};
    data.investments.forEach((inv) => {
      const val = (inv.quantity || 0) * (inv.currentMarketPrice || 0);
      const key = inv.symbol || inv.assetType;
      grouped[key] = (grouped[key] || 0) + val;
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [data.investments]);

  // Prepare Cash Flow Data for Bar Chart
  const cashFlowData = useMemo(() => {
    if (!data.transactions || data.transactions.length === 0) return [];
    const grouped = {};
    data.transactions.forEach((tx) => {
      const cat = tx.category || 'General';
      if (!grouped[cat]) grouped[cat] = { category: cat, income: 0, expense: 0 };
      if (tx.type === 'INCOME') grouped[cat].income += tx.amount;
      else grouped[cat].expense += tx.amount;
    });
    return Object.values(grouped);
  }, [data.transactions]);

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    if (!txAmount || !txCategory || !currentUser) return;
    try {
      if (txType === 'INCOME') {
        await api.addIncome(txAmount, txCategory, currentUser.id, txDate); 
      } else {
        await api.addExpense(txAmount, txCategory, currentUser.id, txDate);
      }
      setTxAmount('');
      setTxCategory('');
      setTxDate(getTodayDate());
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Buys investment position, automatically deducting cost basis (+ direct trading fee) from liquid balance
  const handleInvSubmit = async (e) => {
    e.preventDefault();
    if (!invSymbol || !invQty || !invBuyPrice || !invMarketPrice || !currentUser) return;

    try {
      if (activeTab === 'STOCK') {
        await api.addStock(invSymbol.toUpperCase(), invQty, invBuyPrice, invMarketPrice, currentUser.id, invDate);
      } else if (activeTab === 'CRYPTO') {
        await api.addCrypto(invSymbol.toUpperCase(), invQty, invBuyPrice, invMarketPrice, invFee || 0, currentUser.id, invDate);
      } else if (activeTab === 'GOLD') {
        await api.addGold(invSymbol.toUpperCase(), invQty, invBuyPrice, invMarketPrice, currentUser.id, invDate);
      }

      setInvSymbol('');
      setInvQty('');
      setInvBuyPrice('');
      setInvMarketPrice('');
      setInvFee('');
      setInvDate(getTodayDate());
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Sells/exits position, crediting total proceeds back to liquid balance
  const handleSellInv = async (inv) => {
    const enteredPrice = prompt(
      `Sell ${inv.symbol} (${inv.quantity} units)\nEnter selling price per unit in ₹:`,
      inv.currentMarketPrice || inv.purchasePrice
    );
    if (!enteredPrice || isNaN(enteredPrice) || parseFloat(enteredPrice) <= 0) return;

    try {
      const msg = await api.sellInvestment(inv.id, enteredPrice);
      alert(msg);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTx = async (id) => {
    try {
      await api.deleteTransaction(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteInv = async (id) => {
    try {
      await api.deleteInvestment(id);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleExportExcel = async () => {
    if (!currentUser) return;
    try {
      await api.downloadExcelReport(currentUser.id);
    } catch (err) {
      alert('Error exporting Excel report: ' + err.message);
    }
  };

  const handleStartEditPrice = (inv) => {
    setEditingInvId(inv.id);
    setEditingPrice(inv.currentMarketPrice || '');
  };

  const handleSavePrice = async (id) => {
    try {
      await api.updateInvestmentPrice(id, editingPrice);
      setEditingInvId(null);
      setEditingPrice('');
      loadData();
    } catch (err) {
      alert('Failed to update price: ' + err.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingInvId(null);
    setEditingPrice('');
  };

  // =========================================================================
  // Full-Screen Application Loading Screen (0% to 100%)
  // =========================================================================
  if (initialLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070b14',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        fontFamily: 'inherit'
      }}>
        <div style={{
          position: 'absolute',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, transparent 70%)',
          filter: 'blur(75px)',
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem',
          zIndex: 10,
          width: '100%',
          maxWidth: '360px',
          padding: '0 1.5rem'
        }}>
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '22px',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(99, 102, 241, 0.2))',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 0 35px rgba(56, 189, 248, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={40} color="#38bdf8" />
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: '900',
              letterSpacing: '-0.04em',
              margin: '0 0 0.35rem 0',
              background: 'linear-gradient(135deg, #ffffff 40%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              VestFlow
            </h1>
            <p style={{
              fontSize: '0.8rem',
              color: '#64748b',
              margin: 0,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: '700'
            }}>
              Unified Portfolio & Ledger Engine
            </p>
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#94a3b8'
            }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {progress < 35 ? 'Connecting...' : progress < 75 ? 'Loading Assets...' : progress < 100 ? 'Finalizing...' : 'Ready'}
              </span>
              <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: '800' }}>
                {progress}%
              </span>
            </div>

            <div style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                borderRadius: '999px',
                transition: 'width 20ms linear',
                boxShadow: '0 0 12px rgba(56, 189, 248, 0.6)'
              }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Auth Screen (VestFlow Branded)
  // =========================================================================
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070b14',
        position: 'relative',
        overflow: 'hidden',
        padding: '1.5rem',
        fontFamily: 'inherit'
      }}>
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(56, 189, 248, 0) 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '420px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, rgba(129, 140, 248, 0) 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '440px',
          padding: '2.75rem 2.25rem',
          borderRadius: '24px',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 35px rgba(56, 189, 248, 0.08)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(129, 140, 248, 0.15))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.2)',
              marginBottom: '1rem'
            }}>
              <ShieldCheck size={28} />
            </div>

            <div style={{
              fontSize: '0.85rem',
              fontWeight: '800',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#38bdf8',
              marginBottom: '0.25rem'
            }}>
              VestFlow
            </div>
            
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '800',
              color: '#ffffff',
              letterSpacing: '-0.03em',
              margin: '0 0 0.4rem 0'
            }}>
              {authMode === 'LOGIN' ? 'Welcome to VestFlow' : authMode === 'REGISTER' ? 'Create VestFlow Account' : 'Reset VestFlow Password'}
            </h1>
            
            <p style={{
              fontSize: '0.875rem',
              color: '#94a3b8',
              margin: 0,
              lineHeight: 1.5
            }}>
              {authMode === 'LOGIN' && 'Unified Portfolio Analytics & Cash Flow Engine'}
              {authMode === 'REGISTER' && 'Track assets, investments & real-time capital valuations'}
              {authMode === 'FORGOT' && 'Enter your registered email to assign a new password'}
            </p>
          </div>

          {authSuccess && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Sparkles size={16} />
              <span>{authSuccess}</span>
            </div>
          )}

          {authError && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fb7185',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '1.25rem'
            }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {authMode === 'REGISTER' && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>
                    User Identifier
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={17} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="e.g. U101"
                      value={regId}
                      onChange={(e) => setRegId(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem 0.85rem 2.85rem',
                        borderRadius: '12px',
                        background: 'rgba(2, 6, 23, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#f8fafc',
                        fontSize: '0.925rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={17} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="e.g. Alex Vance"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem 0.85rem 2.85rem',
                        borderRadius: '12px',
                        background: 'rgba(2, 6, 23, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#f8fafc',
                        fontSize: '0.925rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  autoComplete="off"
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem 0.85rem 2.85rem',
                    borderRadius: '12px',
                    background: 'rgba(2, 6, 23, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f8fafc',
                    fontSize: '0.925rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {authMode !== 'FORGOT' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <label style={{ fontSize: '0.725rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Password
                  </label>
                  {authMode === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('FORGOT');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.85rem 2.85rem 0.85rem 2.85rem',
                      borderRadius: '12px',
                      background: 'rgba(2, 6, 23, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      fontSize: '0.925rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.85rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {authMode === 'FORGOT' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.45rem' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem 0.85rem 2.85rem',
                      borderRadius: '12px',
                      background: 'rgba(2, 6, 23, 0.5)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f8fafc',
                      fontSize: '0.925rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              style={{
                marginTop: '0.6rem',
                padding: '0.95rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.925rem',
                cursor: 'pointer',
                boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.4)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {authLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>
                  {authMode === 'LOGIN' ? 'Sign In to VestFlow' : authMode === 'REGISTER' ? 'Join VestFlow' : 'Update Password'}
                </span>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: '#64748b' }}>
            {authMode === 'LOGIN' ? (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('REGISTER'); setAuthError(''); setAuthSuccess(''); }}
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  Create one now
                </button>
              </span>
            ) : (
              <span>
                Remember your credentials?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('LOGIN'); setAuthError(''); setAuthSuccess(''); }}
                  style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  Back to Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const { metrics = {}, transactions = [], investments = [] } = data;
  const isProfit = metrics.status === 'PROFIT';
  const isLoss = metrics.status === 'LOSS';

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 12px var(--accent-emerald)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-emerald)' }}>Active Session</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ background: 'linear-gradient(135deg, #fff 40%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              VestFlow
            </span>
            <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-muted)' }}>| Analytics Engine</span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <UserCheck size={16} color="var(--accent-cyan)" />
            <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--accent-emerald)' }}>Active Account</div>
            </div>
          </div>

          <button 
            onClick={loadData}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', 
              border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.6rem 1rem', 
              cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' 
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          
          <button 
            onClick={handleExportExcel}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', 
              background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', 
              border: 'none', borderRadius: '10px', padding: '0.6rem 1.25rem', 
              cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
              boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Download size={15} /> Export (.xlsx)
          </button>

          <button 
            onClick={handleLogout}
            title="Log Out"
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', 
              background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', 
              border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', padding: '0.6rem 0.9rem', 
              cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' 
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Liquid Balance</span>
            <Wallet size={18} color="var(--accent-cyan)" />
          </div>
          <div className="mono" style={{ fontSize: '1.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            ₹{metrics.netBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Cumulative Cash Flow (Incomes – Outflows)
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset Valuation</span>
            <PieChartIcon size={18} color="var(--accent-indigo)" />
          </div>
          <div className="mono" style={{ fontSize: '1.9rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            ₹{metrics.portfolioValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Stocks + Crypto + Gold holdings
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unrealized Gain / Loss</span>
            {isProfit ? <TrendingUp size={18} color="var(--accent-emerald)" /> : <TrendingDown size={18} color="var(--accent-rose)" />}
          </div>
          <div className="mono" style={{ 
            fontSize: '1.9rem', 
            fontWeight: '700', 
            color: isProfit ? 'var(--accent-emerald)' : isLoss ? 'var(--accent-rose)' : 'var(--text-muted)' 
          }}>
            {metrics.totalProfitLoss >= 0 ? '+' : ''}₹{metrics.totalProfitLoss?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              display: 'inline-block',
              fontSize: '0.7rem', 
              fontWeight: '800', 
              padding: '0.2rem 0.55rem', 
              borderRadius: '6px', 
              background: isProfit ? 'rgba(16, 185, 129, 0.15)' : isLoss ? 'rgba(244, 63, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)',
              color: isProfit ? 'var(--accent-emerald)' : isLoss ? 'var(--accent-rose)' : 'var(--text-muted)',
              border: `1px solid ${isProfit ? 'rgba(16, 185, 129, 0.3)' : isLoss ? 'rgba(244, 63, 94, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`
            }}>
              {metrics.status || 'NEUTRAL'}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Portfolio State</span>
          </div>
        </div>
      </section>

      {/* Visual Analytics */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PieChartIcon size={16} color="var(--accent-cyan)" /> Asset Distribution (Holdings)
          </h2>
          <div style={{ height: '220px' }}>
            {assetAllocationData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No assets logged yet to chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={assetAllocationData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5}>
                    {assetAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} 
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BarChart3 size={16} color="var(--accent-emerald)" /> Inflow vs. Outflow Breakdown
          </h2>
          <div style={{ height: '220px' }}>
            {cashFlowData.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                No transactions recorded yet to chart.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <RechartsTooltip 
                    formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} 
                  />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '2rem' }}>
        
        {/* Left Column: Form Controls */}
        <div className="glass-panel" style={{ padding: '1.75rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} color="var(--accent-cyan)" /> Enter Ledger Entry
          </h2>

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid var(--border-subtle)' }}>
            {[
              { id: 'TX', label: 'Cash Flow' },
              { id: 'STOCK', label: 'Stock' },
              { id: 'CRYPTO', label: 'Crypto' },
              { id: 'GOLD', label: 'Gold' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '0.5rem 0',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  border: 'none',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  background: activeTab === tab.id ? 'var(--accent-indigo)' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'TX' && (
            <form onSubmit={handleTxSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setTxType('INCOME')}
                  style={{
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    background: txType === 'INCOME' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    borderColor: txType === 'INCOME' ? 'var(--accent-emerald)' : 'var(--border-subtle)',
                    color: txType === 'INCOME' ? 'var(--accent-emerald)' : 'var(--text-muted)'
                  }}
                >
                  + Income
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('EXPENSE')}
                  style={{
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    background: txType === 'EXPENSE' ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
                    borderColor: txType === 'EXPENSE' ? 'var(--accent-rose)' : 'var(--border-subtle)',
                    color: txType === 'EXPENSE' ? 'var(--accent-rose)' : 'var(--text-muted)'
                  }}
                >
                  - Expense
                </button>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Amount (INR)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  style={{
                    width: '100%', marginTop: '0.4rem', padding: '0.75rem', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)',
                    color: '#fff', fontSize: '0.95rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Category</label>
                <input
                  type="text"
                  placeholder="e.g. Salary, Rent, Freelance"
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  style={{
                    width: '100%', marginTop: '0.4rem', padding: '0.75rem', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)',
                    color: '#fff', fontSize: '0.95rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} color="var(--accent-cyan)" /> Transaction Date
                </label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  style={{
                    width: '100%', marginTop: '0.4rem', padding: '0.75rem', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)',
                    color: '#fff', fontSize: '0.95rem', colorScheme: 'dark'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem', padding: '0.85rem', borderRadius: '8px', border: 'none',
                  background: 'var(--accent-emerald)', color: '#090d16', fontWeight: '700',
                  fontSize: '0.9rem', cursor: 'pointer'
                }}
              >
                Log Cash Flow
              </button>
            </form>
          )}

          {activeTab !== 'TX' && (
            <form onSubmit={handleInvSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  {activeTab === 'GOLD' ? 'Bond / Gold Code' : 'Ticker / Symbol'}
                </label>
                <input
                  type="text"
                  placeholder={activeTab === 'GOLD' ? 'SGB-2026-IV' : activeTab === 'CRYPTO' ? 'SOL / ETH' : 'TCS / INFY'}
                  value={invSymbol}
                  onChange={(e) => setInvSymbol(e.target.value)}
                  style={{
                    width: '100%', marginTop: '0.4rem', padding: '0.75rem', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)',
                    color: '#fff', fontSize: '0.95rem'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    {activeTab === 'GOLD' ? 'Grams' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={invQty}
                    onChange={(e) => setInvQty(e.target.value)}
                    style={{
                      width: '100%', marginTop: '0.4rem', padding: '0.75rem', borderRadius: '8px',
                      background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)',
                      color: '#fff', fontSize: '0.95rem'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Cost Price</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={invBuyPrice}
                    onChange={(e) => setInvBuyPrice(e.target.value)}
                    style={{
                      width: '100%', marginTop: '0.4rem', padding: '0.75rem', borderRadius: '8px',
                      background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)',
                      color: '#fff', fontSize: '0.95rem'
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Live Market Price</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={invMarketPrice}
                  onChange={(e) => setInvMarketPrice(e.target.value)}
                  style={{
                    width: '100%', marginTop: '0.4rem', padding: '0.75rem', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)',
                    color: '#fff', fontSize: '0.95rem'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={13} color="var(--accent-indigo)" /> Purchase Date
                </label>
                <input
                  type="date"
                  value={invDate}
                  onChange={(e) => setInvDate(e.target.value)}
                  style={{
                    width: '100%', marginTop: '0.4rem', padding: '0.75rem', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)',
                    color: '#fff', fontSize: '0.95rem', colorScheme: 'dark'
                  }}
                  required
                />
              </div>

              {activeTab === 'CRYPTO' && (
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Gas / Trading Fee (INR)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={invFee}
                    onChange={(e) => setInvFee(e.target.value)}
                    style={{
                      width: '100%', marginTop: '0.4rem', padding: '0.75rem', borderRadius: '8px',
                      background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)',
                      color: '#fff', fontSize: '0.95rem'
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                style={{
                  marginTop: '0.5rem', padding: '0.85rem', borderRadius: '8px', border: 'none',
                  background: 'var(--accent-indigo)', color: '#fff', fontWeight: '700',
                  fontSize: '0.9rem', cursor: 'pointer'
                }}
              >
                Log {activeTab} Position
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Tables */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Holdings */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coins size={18} color="var(--accent-amber)" /> Portfolio Holdings
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{investments.length} Assets Registered</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                    <th style={{ paddingBottom: '0.75rem' }}>Asset</th>
                    <th style={{ paddingBottom: '0.75rem' }}>Type</th>
                    <th style={{ paddingBottom: '0.75rem' }}>Date</th>
                    <th style={{ paddingBottom: '0.75rem' }}>Holdings</th>
                    <th style={{ paddingBottom: '0.75rem' }}>Market Price</th>
                    <th style={{ paddingBottom: '0.75rem' }}>Position Val</th>
                    <th style={{ paddingBottom: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No investment holdings logged.</td>
                    </tr>
                  ) : (
                    investments.map((inv) => {
                      const posVal = (inv.quantity || 0) * (inv.currentMarketPrice || 0);
                      const costVal = (inv.quantity || 0) * (inv.purchasePrice || 0) + (inv.fee || 0);
                      const gain = posVal - costVal;

                      return (
                        <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{ padding: '0.85rem 0', fontWeight: '700', color: '#fff' }}>
                            <div>{inv.symbol}</div>
                            {inv.fee > 0 && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                                Fee: ₹{inv.fee.toLocaleString('en-IN')}
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.7rem', fontWeight: '700', padding: '0.15rem 0.5rem', borderRadius: '4px',
                              background: inv.assetType === 'CRYPTO' ? 'rgba(99, 102, 241, 0.15)' : inv.assetType === 'GOLD' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                              color: inv.assetType === 'CRYPTO' ? 'var(--accent-indigo)' : inv.assetType === 'GOLD' ? 'var(--accent-amber)' : 'var(--accent-cyan)'
                            }}>
                              {inv.assetType}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {inv.purchaseDate || '—'}
                          </td>
                          <td className="mono">{inv.quantity}</td>
                          <td className="mono" style={{ color: 'var(--text-muted)' }}>
                            {editingInvId === inv.id ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <input
                                  type="number"
                                  step="any"
                                  value={editingPrice}
                                  onChange={(e) => setEditingPrice(e.target.value)}
                                  autoFocus
                                  style={{
                                    width: '90px',
                                    padding: '0.3rem 0.5rem',
                                    borderRadius: '6px',
                                    background: '#090d16',
                                    border: '1px solid var(--accent-cyan)',
                                    color: '#fff',
                                    fontSize: '0.85rem'
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSavePrice(inv.id);
                                    if (e.key === 'Escape') handleCancelEdit();
                                  }}
                                />
                                <button
                                  onClick={() => handleSavePrice(inv.id)}
                                  title="Save Price"
                                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer', padding: '2px' }}
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  title="Cancel"
                                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>₹{inv.currentMarketPrice?.toLocaleString('en-IN')}</span>
                                <button
                                  onClick={() => handleStartEditPrice(inv)}
                                  title="Edit Market Price"
                                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-cyan)'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                                >
                                  <Edit3 size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="mono" style={{ fontWeight: '600' }}>
                            <div>₹{posVal.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: '0.75rem', color: gain >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                              {gain >= 0 ? '+' : ''}₹{gain.toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem', padding: '0.85rem 0' }}>
                            <button
                              onClick={() => handleSellInv(inv)}
                              title="Sell position and credit proceeds to liquid funds"
                              style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: 'var(--accent-emerald)',
                                borderRadius: '6px',
                                padding: '0.25rem 0.55rem',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              Sell
                            </button>

                            <button
                              onClick={() => handleDeleteInv(inv.id)}
                              title="Delete position"
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-rose)'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="var(--accent-cyan)" /> Transaction Ledger
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{transactions.length} Records</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                    <th style={{ paddingBottom: '0.75rem' }}>Flow</th>
                    <th style={{ paddingBottom: '0.75rem' }}>Category</th>
                    <th style={{ paddingBottom: '0.75rem' }}>Date</th>
                    <th style={{ paddingBottom: '0.75rem' }}>Amount</th>
                    <th style={{ paddingBottom: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>No cash flow records.</td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '0.85rem 0' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            fontSize: '0.75rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '4px',
                            background: tx.type === 'INCOME' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                            color: tx.type === 'INCOME' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                          }}>
                            {tx.type === 'INCOME' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                            {tx.type}
                          </span>
                        </td>
                        <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{tx.category}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {tx.date || '—'}
                        </td>
                        <td className="mono" style={{ fontWeight: '600', color: tx.type === 'INCOME' ? 'var(--accent-emerald)' : '#fff' }}>
                          {tx.type === 'INCOME' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteTx(tx.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-rose)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-dim)'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}