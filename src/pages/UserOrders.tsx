
import React, { useEffect, useState } from 'react';
import { getOrders } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Order, OrderStatus } from '../types.ts';
import { Package, Truck, CheckCircle, Clock, MapPin, ChevronDown, ChevronUp, ShoppingBag, ChefHat, XCircle, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserOrders: React.FC = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getOrders().then(allOrders => {
                const myOrders = allOrders
                    .filter((o: any) => o.userId === user.id)
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setOrders(myOrders);
                setLoading(false);
            });
        }
    }, [user]);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.slice(-6).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-red"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-full mb-6 animate-bounce-slow">
                    <ShoppingBag className="w-16 h-16 text-brand-red" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">No orders yet</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">You haven't placed any orders yet. Delicious pizza is just a few clicks away!</p>
                <Link to="/" className="bg-brand-red text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-red-700 transition transform hover:-translate-y-1 flex items-center">
                    Browse Menu <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        )
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case OrderStatus.DELIVERED: return 'text-green-700 bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
            case OrderStatus.CANCELLED: return 'text-red-700 bg-red-100 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
            case OrderStatus.OUT_FOR_DELIVERY: return 'text-blue-700 bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
            case OrderStatus.PREPARING: return 'text-orange-700 bg-orange-100 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800';
            default: return 'text-yellow-700 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        }
    };

    const getStatusStep = (status: OrderStatus) => {
        if (status === OrderStatus.CANCELLED) return -1;
        const steps = [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED];
        return steps.indexOf(status);
    };

    const steps = [
        { label: 'Placed', icon: Clock },
        { label: 'Preparing', icon: ChefHat },
        { label: 'On the Way', icon: Truck },
        { label: 'Delivered', icon: CheckCircle },
    ];

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
                    <Package className="mr-3 w-8 h-8 text-brand-red" /> My Orders
                </h1>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Last 6 digits..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red transition-all shadow-sm dark:text-white"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className="bg-gray-50 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matching orders</h3>
                    <p className="text-gray-500 dark:text-gray-400">We couldn't find any orders matching "{searchTerm}".</p>
                    <button
                        onClick={() => setSearchTerm('')}
                        className="mt-4 text-brand-red font-bold hover:underline"
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order, index) => {
                        const currentStep = getStatusStep(order.status);
                        const isCancelled = order.status === OrderStatus.CANCELLED;

                        return (
                            <div key={order.id || (order as any)._id || `order-${index}`} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-300">
                                {/* Order Header */}
                                <div
                                    className="p-6 cursor-pointer"
                                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-3 rounded-xl ${getStatusColor(order.status)}`}>
                                                {isCancelled ? <XCircle className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 dark:text-white text-lg">Order #{order.id.slice(-6)}</span>
                                                    <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{new Date(order.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between w-full md:w-auto md:space-x-8">
                                            <div className="text-left md:text-right">
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Total</p>
                                                <p className="font-extrabold text-slate-900 dark:text-white text-xl">Rs. {order.totalAmount.toLocaleString()}</p>
                                            </div>
                                            <div className="hidden md:block text-right">
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">Items</p>
                                                <p className="font-bold text-slate-900 dark:text-slate-200">{order.items.reduce((acc, i) => acc + i.quantity, 0)} items</p>
                                            </div>
                                            <div className={`ml-4 transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-180 text-brand-red' : 'text-gray-400'}`}>
                                                <ChevronDown />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {expandedOrder === order.id && (
                                    <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-6 md:p-8 animate-fade-in">

                                        {/* Progress Stepper */}
                                        {!isCancelled && (
                                            <div className="mb-10 relative px-4">
                                                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -translate-y-1/2 rounded-full z-0"></div>
                                                <div
                                                    className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full z-0 transition-all duration-1000"
                                                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                                                ></div>

                                                <div className="relative z-10 flex justify-between">
                                                    {steps.map((step, index) => {
                                                        const Icon = step.icon;
                                                        const isActive = index <= currentStep;
                                                        const isCompleted = index < currentStep;

                                                        return (
                                                            <div key={index} className="flex flex-col items-center">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isActive ? 'bg-green-500 border-green-500 dark:border-green-600 text-white scale-110 shadow-lg' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600'}`}>
                                                                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                                                </div>
                                                                <span className={`mt-3 text-[10px] md:text-xs font-bold uppercase tracking-tighter ${isActive ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-600'}`}>{step.label}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {isCancelled && (
                                            <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl p-4 flex items-center text-red-700 dark:text-red-400">
                                                <XCircle className="w-6 h-6 mr-3 flex-shrink-0" />
                                                <p className="font-medium text-sm">This order was cancelled. If you have questions, please contact support.</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                                            {/* Order Items */}
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg"><ShoppingBag className="w-5 h-5 mr-2 text-brand-red" /> Order Summary</h4>
                                                <ul className="space-y-4">
                                                    {order.items.map((item, idx) => (
                                                        <li key={idx} className="flex items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                                            <div className="relative">
                                                                <img src={item.image} className="w-16 h-16 rounded-lg object-cover mr-4" />
                                                                <span className="absolute -top-2 -right-2 bg-brand-red text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                                                                    {item.quantity}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Size: {item.size}</p>
                                                            </div>
                                                            <p className="font-bold text-gray-900 dark:text-white text-lg">Rs. {(item.totalPrice * item.quantity).toLocaleString()}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Delivery & Timeline */}
                                            <div className="space-y-8">
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg"><MapPin className="w-5 h-5 mr-2 text-brand-red" /> Delivery Details</h4>
                                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                        <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">Delivery Address</p>
                                                        <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">{order.address}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center text-lg"><Clock className="w-5 h-5 mr-2 text-brand-red" /> Activity Log</h4>
                                                    <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 space-y-6 py-2">
                                                        {order.logs.map((log, idx) => (
                                                            <div key={idx} className="relative pl-8">
                                                                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-brand-red border-2 border-white dark:border-gray-900 shadow-sm"></div>
                                                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{log.status}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                                                                {log.note && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">"{log.note}"</p>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default UserOrders;
