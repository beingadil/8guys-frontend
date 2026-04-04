
import React, { useEffect, useState } from 'react';
import { getOrders, updateUserProfile, getCurrentPosition, reverseGeocode } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Order, OrderStatus, User, LocationData } from '../types.ts';
import { Package, MapPin, Plus, Trash2, Home, Building, Map, Check, LogOut, User as UserIcon, X, MapPinned, ShoppingBag, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'profile'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [newAddress, setNewAddress] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<LocationData | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getOrders().then(allOrders => {
        const myOrders = Array.isArray(allOrders)
          ? allOrders.filter(o => o.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          : [];
        setOrders(myOrders);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user?.id]);

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const pos = await getCurrentPosition();
      const addrData = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
      setNewAddress(addrData.display_name || '');
      setDetectedLocation(addrData);
    } catch (err: any) {
      alert(err.message || 'Failed to detect location');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim() || !user) return;

    setIsUpdating(true);
    const updatedAddresses = [...(user.savedAddresses || []), newAddress.trim()];
    try {
      const updatedUser = await updateUserProfile(user.id, {
        savedAddresses: updatedAddresses,
        lastLocation: detectedLocation || user.lastLocation
      });
      updateUser(updatedUser);
      setNewAddress('');
      setDetectedLocation(undefined);
      setIsAddingAddress(false);
    } catch (err) {
      alert("Failed to save address");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAddress = async (index: number) => {
    if (!user || !user.savedAddresses) return;

    setIsUpdating(true);
    const updatedAddresses = user.savedAddresses.filter((_, i) => i !== index);
    try {
      const updatedUser = await updateUserProfile(user.id, { savedAddresses: updatedAddresses });
      updateUser(updatedUser);
    } catch (err) {
      alert("Failed to delete address");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading || !user) return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-brand-red"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden sticky top-28">
            <div className="p-10 bg-slate-900 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-brand-red/10 opacity-20 pointer-events-none"></div>
              <div className="w-24 h-24 bg-brand-red rounded-[2.5rem] flex items-center justify-center text-4xl font-black mx-auto mb-6 relative z-10 shadow-xl shadow-red-900/50">{(user.name || 'U').charAt(0)}</div>
              <h2 className="text-2xl font-black truncate relative z-10 tracking-tight">{user.name}</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2 relative z-10">Exclusive Member</p>
            </div>
            <nav className="p-6 space-y-2">
              {[
                { id: 'overview', icon: Map, label: 'Overview' },
                { id: 'orders', icon: Package, label: 'My Orders' },
                { id: 'addresses', icon: MapPinned, label: 'Addresses' },
                { id: 'profile', icon: UserIcon, label: 'Settings' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === item.id ? 'bg-brand-red text-white shadow-lg shadow-red-200' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
              <button onClick={handleLogout} className="w-full text-left px-6 py-4 font-black text-[10px] text-red-500 uppercase tracking-widest flex items-center gap-4 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-12 uppercase tracking-tighter">
            {activeTab === 'overview' && 'Your Dashboard'}
            {activeTab === 'orders' && 'Order History'}
            {activeTab === 'addresses' && 'Delivery Addresses'}
            {activeTab === 'profile' && 'Account Settings'}
          </h1>

          {activeTab === 'overview' && (
            <div className="space-y-10 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:-translate-y-1 transition-all">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Total Orders</p>
                  <div className="flex items-end gap-3">
                    <p className="text-6xl font-black text-slate-900 dark:text-white leading-none">{orders.length}</p>
                    <Package className="w-8 h-8 text-brand-red mb-1 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl group hover:-translate-y-1 transition-all">
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Saved Locations</p>
                  <div className="flex items-end gap-3">
                    <p className="text-6xl font-black text-brand-red leading-none">{(user.savedAddresses || []).length}</p>
                    <MapPin className="w-8 h-8 text-brand-red mb-1 opacity-20 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-100 dark:border-slate-800 shadow-xl">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Recent Activity</h2>
                {orders.length === 0 ? (
                  <p className="text-slate-400 font-medium">No recent activity found.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order, index) => (
                      <div key={order.id || (order as any)._id || `order-rec-${index}`} className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm group-hover:rotate-12 transition-transform"><Package className="w-5 h-5 text-brand-red" /></div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white text-sm">Order #{order.id.slice(-6)}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900 dark:text-white mb-1">Rs. {order.totalAmount.toLocaleString()}</p>
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === OrderStatus.DELIVERED ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{order.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in-up">
              {orders.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] text-center border border-slate-100 dark:border-slate-800 shadow-xl">
                  <ShoppingBag className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-6" />
                  <p className="text-slate-500 font-bold">You haven't placed any orders yet.</p>
                </div>
              ) : (
                orders.map((order, index) => (
                  <div key={order.id || (order as any)._id || `order-full-${index}`} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-2xl transition-all">
                    <div className="flex items-center gap-6">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl group-hover:scale-110 transition-transform"><Package className="w-8 h-8 text-brand-red" /></div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-black text-slate-900 dark:text-white text-xl">Order #{order.id.slice(-6)}</p>
                          <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">NEW</span>
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-left md:text-right w-full md:w-auto">
                      <p className="font-black text-slate-900 dark:text-white text-3xl mb-3">Rs. {order.totalAmount.toLocaleString()}</p>
                      <span className="px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] bg-brand-red/10 text-brand-red border border-brand-red/20">{order.status}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(user.savedAddresses || []).map((addr, index) => (
                  <div key={index} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl relative group flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                        {index === 0 ? <Home className="w-5 h-5 text-brand-red" /> : <Building className="w-5 h-5 text-slate-400" />}
                      </div>
                      <button
                        onClick={() => handleDeleteAddress(index)}
                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                        disabled={isUpdating}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-relaxed mb-6">{addr}</p>
                    <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SAVED LOCATION</span>
                    </div>
                  </div>
                ))}

                {!isAddingAddress ? (
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-slate-400 hover:border-brand-red hover:text-brand-red transition-all group min-h-[220px]"
                  >
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">Add New Address</span>
                  </button>
                ) : (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-brand-red shadow-2xl animate-scale-in">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Add Address</h3>
                      <button onClick={() => setIsAddingAddress(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={handleDetectLocation}
                        disabled={isDetecting}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-red/10 text-brand-red rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-all disabled:opacity-50"
                      >
                        {isDetecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                        {isDetecting ? 'Detecting...' : 'Detect Current Location'}
                      </button>
                    </div>
                    <textarea
                      autoFocus
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-0 focus:ring-0 text-sm font-medium mb-6 resize-none"
                      rows={3}
                      placeholder="Enter address details..."
                      value={newAddress}
                      onChange={(e) => { setNewAddress(e.target.value); setDetectedLocation(undefined); }}
                    />
                    {detectedLocation && (
                      <p className="mb-4 text-[10px] font-black text-green-500 flex items-center gap-1 uppercase tracking-widest">
                        <Check className="w-3 h-3" /> GPS Pinpinned
                      </p>
                    )}
                    <button
                      onClick={handleAddAddress}
                      disabled={!newAddress.trim() || isUpdating}
                      className="w-full py-4 bg-brand-red text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUpdating ? 'SAVING...' : <><Check className="w-4 h-4" /> Save Address</>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
                    <p className="text-lg font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">{user.name}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email Address</label>
                    <p className="text-lg font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Phone Number</label>
                    <p className="text-lg font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">{user.phone || 'Not Provided'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">User ID</label>
                    <p className="text-sm font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl break-all">{user.id}</p>
                  </div>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-end">
                <button className="bg-slate-900 dark:bg-slate-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-red transition-all">Edit Profile</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
