
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { createOrder, validateCoupon } from '../services/api.ts';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, MapPin, CreditCard, ShoppingBag, ArrowRight, Check, Tag, Loader2, X } from 'lucide-react';
import { Order } from '../types.ts';

const Checkout: React.FC = () => {
    const { items, total, removeFromCart, updateQuantity, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [verifiedLocation, setVerifiedLocation] = useState<any>(null);
    const [isOrdering, setIsOrdering] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');

    const [couponCode, setCouponCode] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    useEffect(() => {
        const savedLoc = localStorage.getItem('ph_verified_location');
        if (savedLoc) {
            const parsed = JSON.parse(savedLoc);
            setVerifiedLocation(parsed);
            setAddress(parsed.fullAddress || '');
        }
    }, []);

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in-up">
                <div className="bg-slate-100 dark:bg-slate-900 p-12 rounded-[3rem] mb-10 transition-colors">
                    <ShoppingBag className="w-20 h-20 text-slate-300 dark:text-slate-700" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase">Your feast awaits</h2>
                <button onClick={() => navigate('/')} className="bg-red-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-red-200">Start Ordering</button>
            </div>
        );
    }

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        setCouponError('');
        try {
            const result = await validateCoupon(couponCode, total);
            setAppliedCoupon(result.coupon);
            setDiscountAmount(result.discountAmount);
        } catch (err: any) {
            setCouponError(err.message || 'Invalid coupon.');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode('');
    };

    const deliveryFee = verifiedLocation?.deliveryFee || 0;
    const grandTotal = total + deliveryFee - discountAmount;

    const handlePlaceOrder = async () => {
        if (!user) { navigate('/login'); return; }
        if (!address) { alert('Please enter a delivery address'); return; }

        setIsOrdering(true);
        try {
            const orderData: Partial<Order> = {
                userId: user.id,
                userEmail: user.email,
                items: items,
                subtotal: total,
                discount: discountAmount,
                deliveryFee: deliveryFee,
                totalAmount: grandTotal,
                address: address,
                deliveryDetails: verifiedLocation || { deliveryFee: 0, fullAddress: address },
                couponCode: appliedCoupon?.code
            };
            await createOrder(orderData);
            clearCart();
            navigate('/orders');
        } catch (error: any) {
            alert(error.message || "Failed to place order.");
        } finally {
            setIsOrdering(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-12 tracking-tighter uppercase">Order Overview</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-10">
                    {/* 1. Items List */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-50 dark:border-slate-800 overflow-hidden">
                        <div className="p-8 space-y-8">
                            {items.map((item) => (
                                <div key={item.cartId} className="flex flex-col sm:flex-row items-center gap-8 border-b border-slate-50 dark:border-slate-800 pb-8 last:border-0 last:pb-0 group">
                                    <div className="w-28 h-28 rounded-3xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className="font-black text-slate-900 dark:text-white text-xl mb-2">{item.name}</h3>
                                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                            <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-0.5 rounded">{item.size}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">{item.crust}</span>
                                            {item.toppings.map(t => (
                                                <span key={t} className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-50 dark:bg-green-900/10 px-2 py-0.5 rounded">+{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-1 shadow-inner">
                                            <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="p-2 text-slate-400 hover:text-red-600"><Minus className="w-4 h-4" /></button>
                                            <span className="px-4 font-black text-slate-900 dark:text-white">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="p-2 text-slate-400 hover:text-red-600"><Plus className="w-4 h-4" /></button>
                                        </div>
                                        <div className="text-right min-w-[100px]">
                                            <p className="font-black text-slate-900 dark:text-white">Rs. {(item.totalPrice * item.quantity).toLocaleString()}</p>
                                            <button onClick={() => removeFromCart(item.cartId)} className="text-slate-300 hover:text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 flex items-center gap-1">
                                                <Trash2 className="w-3 h-3" /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Delivery Address */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-50 dark:border-slate-800">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-600" />
                            Delivery Address
                        </h2>
                        <textarea
                            rows={3}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-0 focus:ring-2 focus:ring-red-500 text-sm font-bold outline-none resize-none text-slate-900 dark:text-white"
                            placeholder="Enter your full delivery address..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                        {verifiedLocation && (
                            <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-2 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Location Verified
                            </p>
                        )}
                    </div>

                    {/* 3. Payment Method */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-50 dark:border-slate-800">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-red-600" />
                            Payment Method
                        </h2>
                        <div className="space-y-4">
                            <button onClick={() => setPaymentMethod('card')} className={`flex items-center justify-between w-full p-5 rounded-[1.5rem] border-2 transition-all ${paymentMethod === 'card' ? 'border-red-600 bg-red-50 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
                                <span className={`font-black text-xs uppercase tracking-widest ${paymentMethod === 'card' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Digital Wallet</span>
                                {paymentMethod === 'card' && <Check className="w-4 h-4 text-red-600" />}
                            </button>
                            <button onClick={() => setPaymentMethod('cod')} className={`flex items-center justify-between w-full p-5 rounded-[1.5rem] border-2 transition-all ${paymentMethod === 'cod' ? 'border-red-600 bg-red-50 dark:bg-red-900/10' : 'border-slate-100 dark:border-slate-800'}`}>
                                <span className={`font-black text-xs uppercase tracking-widest ${paymentMethod === 'cod' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Cash on Delivery</span>
                                {paymentMethod === 'cod' && <Check className="w-4 h-4 text-red-600" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 4. Summary Column */}
                <div className="lg:col-span-4">
                    <div className="bg-slate-900 rounded-[3rem] p-10 sticky top-28 shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-red-600/10 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                        <h2 className="text-2xl font-black mb-10 uppercase tracking-tight">Summary</h2>

                        {/* Coupon Section */}
                        <div className="mb-10 p-6 bg-white/5 rounded-[1.5rem] border border-white/10">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Apply Promo Code</h4>
                            {!appliedCoupon ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="PROMO CODE"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="bg-transparent border border-white/20 rounded-xl px-4 py-2 text-xs font-bold focus:ring-0 outline-none w-full"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={isValidatingCoupon || !couponCode}
                                        className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                    >
                                        {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between bg-red-600/20 border border-red-600/30 p-3 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-red-500" />
                                        <span className="text-xs font-black">{appliedCoupon.code}</span>
                                    </div>
                                    <button onClick={handleRemoveCoupon} className="text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                            {couponError && <p className="text-[10px] font-bold text-red-500 mt-2">{couponError}</p>}
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-4 text-slate-400 mb-10 border-b border-slate-800 pb-10 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex justify-between"><span>Subtotal</span><span className="text-white">Rs. {total.toLocaleString()}</span></div>
                            <div className="flex justify-between"><span>Delivery Fee</span><span className="text-white">Rs. {deliveryFee.toLocaleString()}</span></div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-red-500"><span>Discount</span><span>- Rs. {discountAmount.toLocaleString()}</span></div>
                            )}
                        </div>

                        <div className="flex flex-col mb-12">
                            <span className="text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Grand Total</span>
                            <span className="text-5xl font-black text-white tracking-tighter">Rs. {grandTotal.toLocaleString()}</span>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={isOrdering || !address.trim()}
                            className="w-full py-6 rounded-[2rem] font-black text-xl bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-900/50 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                        >
                            {isOrdering ? 'PROCESSING...' : 'CONFIRM ORDER'}
                            {!isOrdering && <ArrowRight className="w-6 h-6" />}
                        </button>
                        <p className="text-[8px] text-center font-bold text-slate-500 uppercase tracking-widest mt-6 opacity-50">Secure SSL Encrypted Checkout</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
