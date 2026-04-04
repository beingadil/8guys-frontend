import React, { useState, useEffect } from 'react';
import { getProducts, getSiteSettings, getOrders, updateOrderStatus, getDashboardStats, getAllUsers, toggleUserBlock, saveSiteSettings, getIsSimulationLocked, resetSimulationLock } from '../services/api.ts';
import AdminProducts from './AdminProducts.tsx';
import { Order, OrderStatus, Product, SiteSettings, User, DashboardStats, UserRole, ProductSize } from '../types.ts';
import {
  Settings, Users, Package, ShoppingBag, Plus, Edit2, Trash2, MapPin, X, Eye, Menu, LayoutDashboard,
  DollarSign, Search, Check, Upload, Image as ImageIcon, ChevronLeft, ChevronRight, AlertTriangle,
  Filter, TrendingUp, Calendar, Clock, Save, Mail, Phone, ShieldCheck, UserCheck, UserX, Download, UserPlus, MoreHorizontal, ArrowUpRight, ToggleLeft, ToggleRight, Globe, Loader2
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'users' | 'settings'>('orders');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState({ type: '', text: '' });
  const [newCityCode, setNewCityCode] = useState('');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'All' | UserRole>('All');
  const [userStatusFilter, setUserStatusFilter] = useState<'All' | 'Active' | 'Blocked'>('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [globalError, setGlobalError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [dismissSimulationBanner, setDismissSimulationBanner] = useState(false);

  const fetchData = async () => {
    if (!stats) setLoading(true);
    try {
      const [statsData, ordersData, usersData, settingsData] = await Promise.all([
        getDashboardStats(),
        getOrders(),
        getAllUsers(),
        getSiteSettings()
      ]);
      setStats(statsData || { totalUsers: 0, totalOrders: 0, totalRevenue: 0, totalProducts: 0 });
      setOrders(Array.isArray(ordersData) ? ordersData.map((o: any) => ({ ...o, id: o.id || o._id })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : []);
      setUsers(Array.isArray(usersData) ? usersData.map((u: any) => ({ ...u, id: u.id || u._id })) : []);
      setSiteSettings(settingsData);
    } catch (error: any) {
      console.error("Failed to fetch admin data", error);
      setGlobalError(error.message || "Failed to load admin data. Please check your connection or log in again.");
      setTimeout(() => setGlobalError(''), 10000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteSettings) return;
    setSettingsLoading(true);
    setSettingsMsg({ type: '', text: '' });
    try {
      await saveSiteSettings(siteSettings);
      setSettingsMsg({ type: 'success', text: 'Settings updated successfully!' });
      window.dispatchEvent(new Event('storage'));
      setTimeout(() => setSettingsMsg({ type: '', text: '' }), 3000);
    } catch (error) {
      setSettingsMsg({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setSettingsLoading(false);
    }
  };

  const addCityCode = () => {
    if (!newCityCode.trim() || !siteSettings?.delivery) return;
    const code = newCityCode.trim().toUpperCase();
    if (siteSettings.delivery.allowedCityCodes.includes(code)) return;

    setSiteSettings({
      ...siteSettings,
      delivery: {
        ...siteSettings.delivery,
        allowedCityCodes: [...siteSettings.delivery.allowedCityCodes, code]
      }
    });
    setNewCityCode('');
  };

  const removeCityCode = (code: string) => {
    if (!siteSettings?.delivery) return;
    setSiteSettings({
      ...siteSettings,
      delivery: {
        ...siteSettings.delivery,
        allowedCityCodes: siteSettings.delivery.allowedCityCodes.filter(c => c !== code)
      }
    });
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = (o.id || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.userEmail || '').toLowerCase().includes(orderSearch.toLowerCase());
    const matchesFilter = orderFilter === 'All' || o.status === orderFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter;
    const matchesStatus = userStatusFilter === 'All' || (userStatusFilter === 'Active' ? !u.isBlocked : u.isBlocked);
    return matchesSearch && matchesRole && matchesStatus;
  });


  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      // Optimistic update
      const previousOrders = [...orders];
      setOrders(orders.map(o => (o.id === orderId || (o as any)._id === orderId) ? { ...o, status } : o));

      try {
        await updateOrderStatus(orderId, status);
        showToast(`Order status updated to ${status}`);
        fetchData();
      } catch (apiError) {
        setOrders(previousOrders);
        throw apiError;
      }
    } catch (err: any) {
      console.error('Status update error:', err);
      setGlobalError(err.message || 'Failed to update order status');
      setTimeout(() => setGlobalError(''), 5000);
      fetchData();
    }
  };

  const handleUserBlock = async (userId: string) => {
    if (window.confirm('Toggle block status for this user?')) {
      await toggleUserBlock(userId);
      fetchData();
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div></div>;

  const isSimulated = getIsSimulationLocked();

  const handleResetSimulation = () => {
    resetSimulationLock();
    fetchData();
    showToast("Attempting to reconnect to backend...");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-500">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-[100] w-64 bg-white dark:bg-slate-900 shadow-xl flex-col lg:static lg:flex ${isSidebarOpen ? 'flex' : 'hidden'} `}>
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center tracking-tight">
            <div className="bg-red-600 p-1.5 rounded-lg mr-3 shadow-lg shadow-red-200 dark:shadow-none">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            Admin Panel
          </h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white p-2 md:hidden">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 z-[200] bg-green-500 text-white px-6 py-3 rounded-[1.5rem] shadow-xl font-bold text-sm flex items-center gap-3 animate-fade-in-up">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            {toastMessage}
          </div>
        )}

        {globalError && (
          <div className="fixed top-4 right-4 z-[200] bg-red-600 text-white px-6 py-3 rounded-[1.5rem] shadow-xl font-bold text-sm flex items-center gap-3 animate-fade-in-up">
            <AlertTriangle className="w-5 h-5" />
            {globalError}
            <button onClick={() => setGlobalError('')} className="ml-2 hover:text-white/80"><X className="w-4 h-4" /></button>
          </div>
        )}

        <nav className="p-4 space-y-2">
          {(['overview', 'products', 'orders', 'users', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex items-center space-x-3 px-5 py-4 rounded-xl transition-all font-bold capitalize ${activeTab === tab ? 'bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none translate-x-1' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-red-600'} `}
            >
              {tab === 'overview' ? <Package className="w-5 h-5" /> :
                tab === 'products' ? <Edit2 className="w-5 h-5" /> :
                  tab === 'orders' ? <ShoppingBag className="w-5 h-5" /> :
                    tab === 'users' ? <Users className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
              <span>{tab}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-6 md:p-10 overflow-y-auto relative">
        {isSimulated && !dismissSimulationBanner && (
          <div className="mb-6 p-6 bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-200 dark:border-orange-800 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 animate-pulse"></div>
            <div className="flex items-center gap-4 text-orange-800 dark:text-orange-400">
              <div className="p-3 bg-orange-200 dark:bg-orange-800/50 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tight">Offline Simulation Mode</p>
                <p className="text-xs font-bold opacity-80">Connected to local vault. System will auto-reconnect once the server is reachable (checking every 30s).</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleResetSimulation}
                className="flex-1 md:flex-none px-8 py-3 bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 dark:shadow-none whitespace-nowrap"
              >
                Reconnect Now
              </button>
              <button
                onClick={() => setDismissSimulationBanner(true)}
                className="p-3 bg-white dark:bg-slate-800 text-orange-600 rounded-2xl hover:bg-orange-50 transition-all shadow-sm"
                title="Dismiss banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'overview' && stats && (
          <div className="space-y-10 animate-fade-in max-w-7xl mx-auto">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Welcome back, Admin. System synchronized.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl"><DollarSign className="w-6 h-6" /></div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Revenue</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">Rs. {(stats.totalRevenue || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl"><ShoppingBag className="w-6 h-6" /></div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Orders</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalOrders || 0}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl"><Package className="w-6 h-6" /></div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Products</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalProducts || 0}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl"><Users className="w-6 h-6" /></div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Users</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.totalUsers || 0}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden mt-10">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-xs font-black text-red-600 hover:text-red-700 uppercase tracking-widest flex items-center gap-2 transition-all">
                  View All <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id || (order as any)._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-5 text-sm font-bold text-slate-900 dark:text-white uppercase">#{(order.id || (order as any)._id || '').slice(-6)}</td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-600 flex items-center justify-center font-black text-[10px]">
                              {(order.userEmail || '?').charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{order.userEmail}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white">Rs. {order.totalAmount.toLocaleString()}</td>
                        <td className="px-8 py-5">
                          <span className={`px - 3 py - 1 rounded - full text - [10px] font - black uppercase tracking - widest ${order.status === OrderStatus.DELIVERED ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                            order.status === OrderStatus.CANCELLED ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                              'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                            } `}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <AdminProducts showToast={showToast} isSimulated={isSimulated} />
        )}

        {activeTab === 'settings' && siteSettings && (
          <div className="animate-fade-in max-w-3xl mx-auto space-y-10">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Site Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Configure global application behavior and delivery policies.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-3 mb-8">
                  <Globe className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Delivery System</h2>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <div>
                      <p className="font-black text-sm text-slate-900 dark:text-white mb-1">Location-Based Delivery</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">When enabled, uses GPS and branch radius. When disabled, uses City Code verification.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => siteSettings.delivery && setSiteSettings({
                        ...siteSettings,
                        delivery: { ...siteSettings.delivery, isLocationBasedEnabled: !siteSettings.delivery.isLocationBasedEnabled }
                      })}
                      className={`p - 2 rounded - xl transition - all ${siteSettings.delivery?.isLocationBasedEnabled ? 'text-red-600' : 'text-slate-300 dark:text-slate-600'} `}
                    >
                      {siteSettings.delivery?.isLocationBasedEnabled ? <ToggleRight className="w-12 h-12" /> : <ToggleLeft className="w-12 h-12" />}
                    </button>
                  </div>

                  {siteSettings.delivery && !siteSettings.delivery.isLocationBasedEnabled && (
                    <div className="space-y-6 animate-fade-in">
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Allowed City Codes</p>
                      <div className="flex flex-wrap gap-3">
                        {(siteSettings.delivery.allowedCityCodes || []).map(code => (
                          <div key={code} className="flex items-center gap-2 bg-red-600/10 text-red-600 px-4 py-2 rounded-xl text-xs font-black">
                            {code}
                            <button type="button" onClick={() => removeCityCode(code)} className="hover:text-red-700">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter code (e.g. GRW)"
                          value={newCityCode}
                          onChange={(e) => setNewCityCode(e.target.value)}
                          className="flex-1 p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={addCityCode}
                          className="px-6 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all border border-slate-800"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <div className="flex items-center gap-3 mb-8">
                  <Mail className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Contact Info</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Support Email</label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Support Phone</label>
                    <input
                      type="text"
                      value={siteSettings.contactPhone}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {settingsMsg.text && (
                <div className={`p - 4 rounded - 2xl text - sm font - bold text - center ${settingsMsg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'} `}>
                  {settingsMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={settingsLoading}
                className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200 dark:shadow-none flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {settingsLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {settingsLoading ? 'SAVING...' : 'SAVE ALL SETTINGS'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-fade-in max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">User Management</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Monitor user activity and manage access control.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-red-600/10 focus:border-red-600 outline-none transition-all dark:text-white"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-red-600/10 focus:border-red-600 outline-none transition-all dark:text-white"
              >
                <option value="All">All Roles</option>
                <option value={UserRole.ADMIN}>Administrators</option>
                <option value={UserRole.USER}>Regular Users</option>
              </select>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as any)}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-red-600/10 focus:border-red-600 outline-none transition-all dark:text-white"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Blocked">Blocked Only</option>
              </select>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Join Date</th>
                      <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                      <tr key={user.id || (user as any)._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-red-200 dark:shadow-none">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{user.name}</p>
                              <p className="text-xs font-bold text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px - 4 py - 1.5 rounded - xl text - [10px] font - black uppercase tracking - widest inline - flex items - center gap - 2 ${user.role === UserRole.ADMIN
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                            } `}>
                            {user.role === UserRole.ADMIN && <ShieldCheck className="w-3 h-3" />}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px - 4 py - 1.5 rounded - xl text - [10px] font - black uppercase tracking - widest inline - flex items - center gap - 2 ${user.isBlocked
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-600'
                            } `}>
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => handleUserBlock(user.id || (user as any)._id)}
                            className={`p - 3 rounded - 2xl transition - all ${user.isBlocked
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 hover:scale-110'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 hover:scale-110'
                              } `}
                            title={user.isBlocked ? "Unblock User" : "Block User"}
                          >
                            {user.isBlocked ? <UserCheck className="w-5 h-5" /> : <UserX className="w-5 h-5" />}
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-full">
                              <Users className="w-12 h-12 text-slate-300" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">No users found</p>
                              <p className="text-xs font-bold text-slate-400">Try adjusting your filters or search query.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'orders' && (
          <div className="animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white uppercase tracking-tighter">Order Management</h1>
              <div className="flex gap-4">
                <div className="relative group w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-red-600/10 focus:border-red-600 outline-none transition-all dark:text-white"
                  />
                </div>
                <select
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value as any)}
                  className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold focus:ring-4 focus:ring-red-600/10 focus:border-red-600 outline-none transition-all dark:text-white"
                >
                  <option value="All">All Status</option>
                  {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.length > 0 ? filteredOrders.map((order, index) => (
                    <tr key={order.id || (order as any)._id || `order - ${index} `} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">#{(order.id || (order as any)._id || '').slice(-6)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center font-black mr-2 text-[10px]">{(order.userEmail || '?').charAt(0).toUpperCase()}</div>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{order.userEmail}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">Rs. {(order.totalAmount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id || (order as any)._id, e.target.value as OrderStatus)}
                          className="text-[10px] border-0 rounded-lg p-2 font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-red-600 transition-all"
                        >
                          {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedOrder(order)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><Eye className="w-5 h-5" /></button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold">No orders found matching your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {selectedOrder && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm print:hidden" onClick={() => setSelectedOrder(null)}></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden max-w-2xl w-full mx-auto transform animate-scale-in p-10 flex flex-col gap-8 print:shadow-none print:rounded-none print:max-w-full print:h-auto print:overflow-visible print:p-8">
                  <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-8 p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl hover:text-red-600 transition-all print:hidden"><X className="w-5 h-5" /></button>

                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Order Details</h2>
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Order ID: {selectedOrder.id}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin className="w-3 h-3" /> Delivery Spot</h3>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{selectedOrder.address}</p>
                      {selectedOrder.deliveryDetails && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-1">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                            {selectedOrder.deliveryDetails.cityCode ? 'Zone Verification' : 'Coordinates'}
                          </p>
                          <p className="text-xs font-bold text-red-600">
                            {selectedOrder.deliveryDetails.cityCode || `${selectedOrder.deliveryDetails.customerLat?.toFixed(6)}, ${selectedOrder.deliveryDetails.customerLng?.toFixed(6)} `}
                          </p>
                          {selectedOrder.deliveryDetails.customerLat && (
                            <a
                              href={`https://www.google.com/maps?q=${selectedOrder.deliveryDetails.customerLat},${selectedOrder.deliveryDetails.customerLng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block mt-3 px-5 py-2.5 bg-slate-900 dark:bg-slate-700 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-slate-200 dark:shadow-none print:hidden"
                            >
                              Track on Maps
                            </a >
                          )}
                        </div >
                      )}
                    </div >
                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <h3 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2"><ShoppingBag className="w-3 h-3" /> Summary</h3>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-500 dark:text-slate-400">{item.quantity}x {item.name}</span>
                            <span className="text-slate-900 dark:text-white">Rs. {item.totalPrice.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="pt-3 mt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-slate-900 dark:text-white">
                          <span className="text-[10px] font-black uppercase tracking-widest">Grand Total</span>
                          <span className="text-lg font-black tracking-tighter">Rs. {selectedOrder.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div >

                  {selectedOrder.logs && selectedOrder.logs.length > 0 && (
                    <div className="mt-2 bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Clock className="w-3 h-3" /> Status History</h3>
                      <div className="space-y-4">
                        {selectedOrder.logs.slice().reverse().map((log: any, i: number) => (
                          <div key={i} className="flex gap-4">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{log.status}</p>
                              <p className="text-[10px] text-slate-400 font-bold">{log.note}</p>
                              <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 print:hidden">
                    <button onClick={() => window.print()} className="flex-1 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-slate-200 dark:shadow-none active:scale-95">Print Invoice</button>
                    <button onClick={() => setSelectedOrder(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">Close View</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
