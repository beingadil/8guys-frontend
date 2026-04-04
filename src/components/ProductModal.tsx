import React, { useState, useEffect } from 'react';
import { Product, ProductSize, ToppingOption, CrustOption } from '../types.ts';
import { X, ArrowRight, Minus, Plus, Star, Check } from 'lucide-react';

interface ProductModalProps {
    product: Product;
    onClose: () => void;
    onAddToCart: (product: Product, size: string, crust: string, toppings: string[], quantity: number, price: number) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
    const [selectedSize, setSelectedSize] = useState<ProductSize>(
        (product.sizes && product.sizes.length > 1) ? product.sizes[1] : (product.sizes && product.sizes[0]) || { size: 'Standard', priceModifier: 0 }
    );
    const [selectedCrust, setSelectedCrust] = useState<CrustOption>(
        (product.crustOptions && product.crustOptions[0]) || { name: 'Hand Tossed', price: 0 }
    );
    const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const sizePrice = product.basePrice + (selectedSize.priceModifier || 0);
        const crustPrice = selectedCrust.price || 0;
        const toppingsPrice = selectedToppings.reduce((acc, t) => acc + (t.price || 0), 0);
        setTotalPrice((sizePrice + crustPrice + toppingsPrice) * quantity);
    }, [selectedSize, selectedCrust, selectedToppings, quantity, product]);

    const toggleTopping = (topping: ToppingOption) => {
        setSelectedToppings(prev =>
            prev.find(t => t.name === topping.name)
                ? prev.filter(t => t.name !== topping.name)
                : [...prev, topping]
        );
    };

    const handleAdd = () => {
        onAddToCart(
            product,
            selectedSize.size,
            selectedCrust.name,
            selectedToppings.map(t => t.name),
            quantity,
            totalPrice / quantity
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>

            <div className="relative bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden max-w-5xl w-full mx-auto transform animate-scale-in flex flex-col lg:flex-row max-h-[90vh]">
                {/* Left: Product Info */}
                <div className="relative lg:w-2/5 h-64 lg:h-auto overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-black">{product.rating}</span>
                        </div>
                        <h3 className="text-4xl font-black tracking-tighter leading-none mb-4 uppercase">{product.name}</h3>
                        <p className="text-slate-300 text-sm font-medium line-clamp-3">{product.description}</p>
                    </div>
                </div>

                {/* Right: Customization */}
                <div className="lg:w-3/5 p-8 lg:p-12 overflow-y-auto bg-white dark:bg-slate-900">
                    <button onClick={onClose} className="absolute top-6 right-8 p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl hover:text-red-600 transition-all">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="space-y-10">
                        {/* 1. Size Selection */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">1. Select Size</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {(product.sizes || []).map((s) => (
                                    <button
                                        key={s.size}
                                        onClick={() => setSelectedSize(s)}
                                        className={`py-4 px-3 rounded-2xl border-2 transition-all flex flex-col items-center
                                    ${selectedSize.size === s.size
                                                ? 'border-red-600 bg-red-600/5 dark:bg-red-600/10'
                                                : 'border-slate-50 dark:border-slate-800 text-slate-400 hover:border-red-600/20'}`}
                                    >
                                        <span className={`text-sm font-black mb-1 ${selectedSize.size === s.size ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>{s.size}</span>
                                        <span className="text-[10px] font-bold">
                                            {s.priceModifier >= 0 ? '+' : ''}Rs. {s.priceModifier}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Crust Selection */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">2. Crust Style</h4>
                            <div className="flex flex-wrap gap-3">
                                {(product.crustOptions || []).map((c) => (
                                    <button
                                        key={c.name}
                                        onClick={() => setSelectedCrust(c)}
                                        className={`px-6 py-3 rounded-2xl border-2 transition-all text-xs font-black
                                    ${selectedCrust.name === c.name
                                                ? 'border-red-600 bg-red-600/5 dark:bg-red-600/10 text-red-600'
                                                : 'border-slate-50 dark:border-slate-800 text-slate-400 dark:text-slate-500'}`}
                                    >
                                        {c.name} {c.price > 0 && `(+Rs. ${c.price})`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Extra Toppings */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-4">3. Add Extra Toppings</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {(product.extraToppings || []).map((t) => {
                                    const isSelected = selectedToppings.find(st => st.name === t.name);
                                    return (
                                        <button
                                            key={t.name}
                                            onClick={() => toggleTopping(t)}
                                            className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between
                                        ${isSelected
                                                    ? 'border-red-600 bg-red-600/5 dark:bg-red-600/10'
                                                    : 'border-slate-50 dark:border-slate-800'}`}
                                        >
                                            <div className="flex flex-col text-left">
                                                <span className={`text-xs font-black ${isSelected ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>{t.name}</span>
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 text-xs">Rs. {t.price}</span>
                                            </div>
                                            {isSelected && <Check className="w-4 h-4 text-red-600" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-8">
                            <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl shadow-inner">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"><Minus className="w-5 h-5" /></button>
                                <span className="w-12 text-center font-black text-slate-900 dark:text-white text-xl">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-red-600 transition-colors"><Plus className="w-5 h-5" /></button>
                            </div>
                            <div className="text-center sm:text-right">
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Item Total</p>
                                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Rs. {totalPrice.toLocaleString()}</p>
                            </div>
                        </div>
                        <button onClick={handleAdd} className="w-full bg-red-600 text-white py-6 rounded-[2.5rem] font-black text-xl hover:bg-red-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-red-200 dark:shadow-none active:scale-95">
                            Confirm & Add to Cart <ArrowRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
