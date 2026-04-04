import React, { useState, useEffect } from 'react';
import {
    Package, Search, Plus, Edit2, Trash2,
    ChevronDown, Star, AlertTriangle, XCircle,
    Loader2, Filter, Image as ImageIcon, CheckCircle2
} from 'lucide-react';
import { Product } from '../types.ts';
import { getProducts, saveProduct, deleteProduct, uploadImage } from '../services/api.ts';

interface AdminProductsProps {
    showToast: (msg: string) => void;
    isSimulated: boolean;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ showToast, isSimulated }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const categories = ['all', ...new Set(products.map(p => p.category))];

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            showToast("Error loading products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleProductDelete = async (productId: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        // Optimistic UI update
        const previousProducts = [...products];
        setProducts(products.filter((p) => (p.id || (p as any)._id) !== productId));

        try {
            await deleteProduct(productId);
            showToast("Product deleted successfully!");
            // Re-fetch to sync with backend and get updated counts
            fetchProducts();
        } catch (apiError: any) {
            // Revert on failure
            setProducts(previousProducts);
            console.error("Delete error:", apiError);
            alert(`Failed to delete product: ${apiError.message || 'Unknown error'}`);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setImagePreview(product.image);
        } else {
            setEditingProduct({
                name: '',
                description: '',
                basePrice: 0,
                category: 'Pizza',
                isVegetarian: false,
                isAvailable: true,
                ingredients: [],
                sizes: [{ size: 'Small', priceModifier: -300 }, { size: 'Medium', priceModifier: 0 }, { size: 'Large', priceModifier: 400 }],
                crustOptions: [{ name: 'Hand Tossed', price: 0 }, { name: 'Thin Crust', price: 0 }, { name: 'Cheese Burst', price: 300 }],
                extraToppings: [{ name: 'Extra Cheese', price: 150 }, { name: 'Olives', price: 100 }],
                rating: 4.5,
                reviewsCount: 0,
                image: ''
            });
            setImagePreview(null);
        }
        setImageFile(null);
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        setModalLoading(true);
        try {
            let imageUrl = editingProduct.image || '';
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            } else if (!imageUrl) {
                alert("Please provide an image URL or upload a file");
                setModalLoading(false);
                return;
            }

            const productToSave = { ...editingProduct, image: imageUrl } as Product;
            await saveProduct(productToSave);

            showToast(editingProduct.id || (editingProduct as any)._id ? "Product updated!" : "Product added!");
            setIsModalOpen(false);
            fetchProducts();
        } catch (error: any) {
            console.error("Save error:", error);
            alert(`Failed to save product: ${error.message || 'Unknown error'}`);
        } finally {
            setModalLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading && products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Catalog...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">Inventory Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your product catalog, pricing, and availability.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-red-600 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-100 dark:shadow-none transform active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Add New Item
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-2 focus:ring-red-600/20 transition-all outline-none"
                    />
                </div>
                <div className="flex items-center gap-3 min-w-[200px]">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl px-4 py-4 text-xs font-black uppercase tracking-widest outline-none dark:text-white"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((p) => {
                    const pid = p.id || (p as any)._id;
                    return (
                        <div key={pid} className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 group transition-all hover:shadow-2xl">
                            <div className="relative h-48 overflow-hidden">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                                    {p.category}
                                </div>
                                {!p.isAvailable && (
                                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                                        <span className="px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{p.name}</h3>
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-black">{p.rating}</span>
                                    </div>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6 line-clamp-2">{p.description}</p>
                                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Base Price</span>
                                        <span className="text-xl font-black text-slate-900 dark:text-white">Rs. {p.basePrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(p)}
                                            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleProductDelete(pid)}
                                            className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all transform active:scale-95"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
                        <Package className="w-16 h-16 text-slate-200 mb-6" />
                        <p className="text-lg font-black text-slate-400 uppercase tracking-widest">No Products Found</p>
                    </div>
                )}
            </div>

            {/* Product Edit/Add Modal */}
            {isModalOpen && editingProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-8 right-8 p-3 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-red-600 transition-all z-10"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>

                        <form onSubmit={handleSaveProduct} className="p-10 md:p-14">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="p-4 bg-red-600 text-white rounded-[1.5rem] shadow-xl shadow-red-200 dark:shadow-none">
                                    <Package className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                                        {editingProduct.id || (editingProduct as any)._id ? 'Refine Product' : 'Craft New Item'}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">Define your culinary masterpiece's details.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="group">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-red-600 transition-colors">Product Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={editingProduct.name}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                            placeholder="e.g. Smoky BBQ Feast"
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-red-600/20 transition-all placeholder:opacity-30"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-red-600 transition-colors">Description</label>
                                        <textarea
                                            rows={4}
                                            required
                                            value={editingProduct.description}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                            placeholder="Describe the flavors and ingredients..."
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-red-600/20 transition-all placeholder:opacity-30 resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="group">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-red-600 transition-colors">Base Price (Rs.)</label>
                                            <input
                                                type="number"
                                                required
                                                value={editingProduct.basePrice}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, basePrice: Number(e.target.value) })}
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black dark:text-white outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                                            />
                                        </div>
                                        <div className="group">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-red-600 transition-colors">Category</label>
                                            <input
                                                type="text"
                                                required
                                                value={editingProduct.category}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-bold dark:text-white outline-none focus:ring-2 focus:ring-red-600/20 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-6 pt-2">
                                        <label className="flex items-center gap-4 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={editingProduct.isVegetarian}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, isVegetarian: e.target.checked })}
                                                />
                                                <div className={`w-14 h-8 rounded-full transition-all ${editingProduct.isVegetarian ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${editingProduct.isVegetarian ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:text-green-600 transition-colors">Vegetarian</span>
                                        </label>

                                        <label className="flex items-center gap-4 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={editingProduct.isAvailable}
                                                    onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                                                />
                                                <div className={`w-14 h-8 rounded-full transition-all ${editingProduct.isAvailable ? 'bg-red-600' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${editingProduct.isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:text-red-600 transition-colors">Available</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-4 block">Flavor Image</label>
                                        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center group/img">
                                            {imagePreview ? (
                                                <>
                                                    <img src={imagePreview} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                                        <button
                                                            type="button"
                                                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                            className="p-4 bg-red-600 text-white rounded-2xl shadow-xl transform scale-75 group-hover/img:scale-100 transition-all"
                                                        >
                                                            <XCircle className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center">
                                                    <div className="p-5 bg-white dark:bg-slate-700 rounded-3xl shadow-xl mb-4 group-hover/img:scale-110 transition-all">
                                                        <ImageIcon className="w-8 h-8 text-slate-400" />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload or drop image</span>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setImageFile(file);
                                                                setImagePreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="group">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-red-600 transition-colors">External Image URL (Optional)</label>
                                        <input
                                            type="url"
                                            value={typeof editingProduct.image === 'string' ? editingProduct.image : ''}
                                            onChange={(e) => {
                                                setEditingProduct({ ...editingProduct, image: e.target.value });
                                                setImagePreview(e.target.value);
                                            }}
                                            placeholder="https://images.unsplash.com/..."
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-medium dark:text-white outline-none focus:ring-2 focus:ring-red-600/20 transition-all placeholder:opacity-30"
                                        />
                                    </div>

                                    <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                                        <h4 className="flex items-center gap-3 text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">
                                            <AlertTriangle className="w-4 h-4 text-red-600" /> Pro Tip
                                        </h4>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                            "Make sure the description highlights the sensory experience. High-quality imagery increases conversion by 80%."
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-14 pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={modalLoading}
                                    className="px-12 py-5 bg-red-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-[0_15px_30px_rgba(220,38,38,0.2)] flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                >
                                    {modalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                    {editingProduct.id || (editingProduct as any)._id ? 'Confirm Refinement' : 'Publish Masterpiece'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProducts;
