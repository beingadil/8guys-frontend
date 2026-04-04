
import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/api.ts';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { Star, Plus, ChevronDown, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductModal from '../components/ProductModal.tsx';
import LocationGate from '../components/LocationGate.tsx';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [verifiedLocation, setVerifiedLocation] = useState<any>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    const saved = localStorage.getItem('ph_verified_location');
    if (saved) setVerifiedLocation(JSON.parse(saved));

    getProducts().then(data => {
      setProducts(data || []);
      setFilteredProducts(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (filter === 'all') setFilteredProducts(products);
    else if (filter === 'veg') setFilteredProducts(products.filter(p => p.isVegetarian));
    else setFilteredProducts(products.filter(p => !p.isVegetarian));
  }, [filter, products]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-20 w-20 border-[3px] border-slate-200 border-t-brand-red"></div>
        <p className="mt-6 font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">Preparing Delicacies...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {!verifiedLocation && <LocationGate onVerified={setVerifiedLocation} />}

      <section className="relative mb-20 overflow-hidden">
        <div className="relative h-[500px] md:h-[600px] rounded-[3rem] overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-slate-900/60 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80"
            alt="Pizza Hero"
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[20s]"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white text-center px-6">
            <div className="inline-block px-4 py-1.5 bg-brand-red rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-bounce">Authentic Italian</div>
            <h1 className="text-5xl md:text-8xl font-black mb-6 leading-none tracking-tighter">
              SLICE OF <br /> <span className="text-brand-red">HEAVEN</span>
            </h1>
            <p className="text-lg md:text-2xl mb-12 max-w-2xl font-medium text-slate-200 opacity-90">
              Experience the finest hand-crafted pizzas, baked in traditional stone ovens.
            </p>
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
                className="group bg-white text-slate-900 hover:bg-brand-red hover:text-white px-12 py-5 rounded-[2rem] font-black text-lg transition-all shadow-2xl transform hover:-translate-y-2 active:scale-95 flex items-center"
              >
                Explore Menu <ChevronDown className="ml-3 w-5 h-5" />
              </button>
              {verifiedLocation && (
                <div className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <MapPin className="w-4 h-4 text-brand-red" />
                  <span className="text-xs font-black uppercase tracking-widest">
                    {verifiedLocation.branch?.name || verifiedLocation.cityCode || 'Verified'} Zone
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div id="menu" className="mb-20">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-12 gap-8">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">The Artisans Selection</h2>
            <div className="w-20 h-2 bg-brand-red rounded-full mb-6"></div>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[1.5rem] shadow-inner border border-slate-200 dark:border-slate-800">
            {(['all', 'veg', 'non-veg'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-8 py-3 rounded-[1.2rem] text-xs font-black capitalize transition-all duration-500 tracking-widest ${filter === f ? 'bg-white dark:bg-slate-800 text-brand-red shadow-xl' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
              >
                {f === 'non-veg' ? 'Meat' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map((product, index) => {
            const productId = product.id || (product as any)._id || `prod-${index}`;
            const imageUrl = product.image.startsWith('/') ? `${window.location.origin}${product.image}` : product.image;

            return (
              <div
                key={productId}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 group border border-slate-100 dark:border-slate-800 flex flex-col h-full"
              >
                <Link to={`/product/${productId}`} className="relative h-64 overflow-hidden cursor-pointer">
                  <img src={imageUrl} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </Link>

                <div className="p-8 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Link to={`/product/${productId}`}>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none group-hover:text-brand-red transition-colors capitalize">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-black text-slate-900 dark:text-slate-400">{product.rating || 4.5}</span>
                    </div>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium line-clamp-2">{product.description}</p>
                  <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Starting from</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-slate-100">Rs. {product.basePrice.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl font-black hover:bg-brand-red transition-all"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p, size, crust, toppings, qty, price) => {
            addToCart({
              productId: p.id || (p as any)._id,
              name: p.name,
              basePrice: p.basePrice,
              totalPrice: price,
              quantity: qty,
              size: size,
              crust: crust,
              toppings: toppings,
              image: p.image
            });
          }}
        />
      )}
    </div>
  );
};

export default Home;
