import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProducts } from '../services/api.ts';
import { Product, ProductSize, ToppingOption, CrustOption } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import {
    Star, Plus, Minus, ArrowLeft, ShoppingBag,
    Info, Leaf, Flame, ShieldAlert, ChevronRight,
    Clock, Award, Heart, Check
} from 'lucide-react';

const ProductDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
    const [selectedCrust, setSelectedCrust] = useState<CrustOption | null>(null);
    const [selectedToppings, setSelectedToppings] = useState<ToppingOption[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const allProducts = await getProducts();
                const found = allProducts.find((p: any) => (p.id === id || p._id === id));
                if (found) {
                    setProduct(found);
                    setRelatedProducts(allProducts.filter((p: any) => p.category === found.category && (p.id !== id && p._id !== id)).slice(0, 4));

                    // Initialize selections
                    setSelectedSize(found.sizes[1] || found.sizes[0] || { size: 'Standard', priceModifier: 0 });
                    setSelectedCrust(found.crustOptions[0] || { name: 'Hand Tossed', price: 0 });
                }
            } catch (err) {
                console.error("Failed to fetch product details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!product || !selectedSize || !selectedCrust) return;
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

    const handleAddToCart = () => {
        if (!product || !selectedSize || !selectedCrust) return;
        addToCart({
            productId: product.id || (product as any)._id,
            name: product.name,
            basePrice: product.basePrice,
            totalPrice: totalPrice / quantity,
            quantity: quantity,
            size: selectedSize.size,
            crust: selectedCrust.name,
            toppings: selectedToppings.map(t => t.name),
            image: product.image
        });
        navigate('/cart');
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[70vh]">
                <div className="animate-spin rounded-full h-20 w-20 border-[3px] border-slate-200 border-t-red-600"></div>
                <p className="mt-8 font-black text-slate-400 uppercase tracking-[0.3em] text-[10px] animate-pulse">Authenticating Flavors...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">
                <div className="p-8 bg-red-50 dark:bg-red-900/10 rounded-[3rem] mb-10">
                    <ShieldAlert className="w-20 h-20 text-red-600" />
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tighter">PRODUCT NOT FOUND</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-12 font-medium">This masterpiece might have been retired from our kitchen or moved to another section.</p>
                <Link to="/" className="px-12 py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl">Back to Menu</Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Top Navigation */}
            <div className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="group flex items-center gap-3 text-slate-500 hover:text-red-600 transition-all">
                    <div className="p-3 bg-white dark:bg-slate-900 shadow-xl rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Back</span>
                </button>
                <div className="flex items-center gap-2">
                    <Link to="/" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-600">Home</Link>
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{product.name}</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Visual Exposure Section */}
                    <div className="space-y-12">
                        <div className="relative aspect-square rounded-[4rem] overflow-hidden shadow-2xl group">
                            <img
                                src={product.image.startsWith('/') ? `${window.location.origin}${product.image}` : product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[10s]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
                            <div className="absolute top-8 left-8 flex flex-col gap-3">
                                {product.isVegetarian && (
                                    <div className="bg-green-600 text-white px-5 py-2 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg">
                                        <Leaf className="w-4 h-4" /> Veg
                                    </div>
                                )}
                                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-5 py-2 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    <Award className="w-4 h-4 text-red-600" /> Best Seller
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                                <Info className="w-4 h-4 text-red-600" /> The Secret Ingredients
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {product.ingredients?.length ? product.ingredients.map(ing => (
                                    <div key={ing} className="bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700">
                                        {ing}
                                    </div>
                                )) : (
                                    <p className="text-xs font-medium text-slate-400 italic">Chef's traditional secret recipe components.</p>
                                )}
                            </div>

                            <div className="mt-12 grid grid-cols-3 gap-6 pt-10 border-t border-slate-200 dark:border-slate-800">
                                <div className="text-center">
                                    <Clock className="w-6 h-6 text-red-600 mx-auto mb-2" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prep Time</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase mt-1">15-20m</p>
                                </div>
                                <div className="text-center">
                                    <Flame className="w-6 h-6 text-red-600 mx-auto mb-2" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Heat Level</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase mt-1">Medium</p>
                                </div>
                                <div className="text-center">
                                    <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calories</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase mt-1">~280 Cal</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interaction & Selection Section */}
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                                {product.name}
                            </h1>
                            <div className="p-4 bg-yellow-400 text-slate-900 rounded-3xl flex flex-col items-center justify-center font-black shadow-xl">
                                <Star className="w-6 h-6 fill-current" />
                                <span className="text-lg mt-1">{product.rating}</span>
                            </div>
                        </div>
                        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium mb-12 leading-relaxed">
                            {product.description}
                        </p>

                        <div className="w-20 h-2 bg-red-600 rounded-full mb-16"></div>

                        <div className="space-y-12">
                            {/* Size Selection */}
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-6">1. Precision Sizing</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    {(product.sizes || []).map((s) => (
                                        <button
                                            key={s.size}
                                            onClick={() => setSelectedSize(s)}
                                            className={`py-6 px-4 rounded-3xl border-2 transition-all flex flex-col items-center relative overflow-hidden group
                                        ${selectedSize?.size === s.size
                                                    ? 'border-red-600 bg-red-600/5 dark:bg-red-600/10 scale-105 z-10'
                                                    : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-red-600/30'}`}
                                        >
                                            <span className={`text-sm font-black mb-1 transition-colors uppercase ${selectedSize?.size === s.size ? 'text-red-600' : 'text-slate-900 dark:text-slate-100'}`}>{s.size}</span>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                {s.priceModifier >= 0 ? '+' : ''}Rs. {s.priceModifier}
                                            </span>
                                            {selectedSize?.size === s.size && (
                                                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Crust Selection */}
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mb-6">2. Crust Foundation</h4>
                                <div className="flex flex-wrap gap-4">
                                    {(product.crustOptions || []).map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => setSelectedCrust(c)}
                                            className={`px-8 py-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest
                                        ${selectedCrust?.name === c.name
                                                    ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-200 dark:shadow-none'
                                                    : 'border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                        >
                                            {c.name} {c.price > 0 && `(+Rs. ${c.price})`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Toppings Selection */}
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">3. Culinary Accents</h4>
                                    <span className="text-[10px] font-black text-red-600 uppercase bg-red-50 dark:bg-red-900/10 px-3 py-1 rounded-full">Optional</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {(product.extraToppings || []).map((t) => {
                                        const isSelected = selectedToppings.find(st => st.name === t.name);
                                        return (
                                            <button
                                                key={t.name}
                                                onClick={() => toggleTopping(t)}
                                                className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between group
                                            ${isSelected
                                                        ? 'border-red-600 bg-red-600/5 dark:bg-red-600/10'
                                                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                                            >
                                                <div className="flex flex-col text-left">
                                                    <span className={`text-xs font-black uppercase tracking-tighter transition-colors ${isSelected ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>{t.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 mt-1">Rs. {t.price}</span>
                                                </div>
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-red-600 text-white scale-110 shadow-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-300'}`}>
                                                    {isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-4 h-4" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Finalization Section */}
                        <div className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-800 group/footer">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-10 mb-12">
                                <div className="flex items-center bg-white dark:bg-slate-900 p-3 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-16 h-16 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-red-600 hover:text-white transition-all transform active:scale-90"
                                    >
                                        <Minus className="w-6 h-6" />
                                    </button>
                                    <span className="w-16 text-center font-black text-slate-900 dark:text-white text-3xl tabular-nums">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-16 h-16 flex items-center justify-center rounded-2xl text-slate-400 hover:bg-red-600 hover:text-white transition-all transform active:scale-90"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="text-center sm:text-right">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.5em] mb-2">Total Selection Value</p>
                                    <p className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                                        Rs. <span className="group-hover/footer:text-red-600 transition-colors uppercase">{totalPrice.toLocaleString()}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-red-600 text-white py-8 rounded-[3rem] font-black text-xl uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-6 shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:shadow-[0_25px_60px_rgba(220,38,38,0.4)] transform hover:-translate-y-2 active:scale-95"
                            >
                                <ShoppingBag className="w-7 h-7" /> Add Masterpiece to Cart
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-40 border-t border-slate-100 dark:border-slate-800 pt-24">
                        <div className="flex justify-between items-end mb-16 px-4">
                            <div>
                                <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Complete the Ensemble</h3>
                                <div className="w-20 h-2 bg-red-600 rounded-full mt-6"></div>
                            </div>
                            <Link to="/" className="text-xs font-black text-red-600 uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 px-6 py-3 rounded-2xl transition-all">View All Products</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map(rp => (
                                <Link
                                    to={`/product/${rp.id || (rp as any)._id}`}
                                    key={rp.id || (rp as any)._id}
                                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group flex flex-col h-full"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img src={rp.image.startsWith('/') ? `${window.location.origin}${rp.image}` : rp.image} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">
                                            {rp.category}
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 group-hover:text-red-600 transition-colors">{rp.name}</h4>
                                        <div className="flex items-center gap-1 text-yellow-500 mb-6">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span className="text-[10px] font-black">{rp.rating}</span>
                                        </div>
                                        <div className="mt-auto flex justify-between items-center">
                                            <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Rs. {rp.basePrice.toLocaleString()}</span>
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center group-hover:bg-red-600 transition-colors">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductDetails;
