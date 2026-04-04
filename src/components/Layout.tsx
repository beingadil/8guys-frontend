
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { UserRole, SiteSettings } from '../types.ts';
import { getSiteSettings } from '../services/api.ts';
import { Pizza, ShoppingCart, LogOut, Shield, Menu, X, Mail, Phone, Sun, Moon, ArrowRight } from 'lucide-react';

const Navbar: React.FC<{ theme: string; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => location.pathname === path
        ? "text-red-600 font-bold"
        : "text-slate-600 dark:text-slate-300 hover:text-red-600 transition-all duration-300";

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'glass shadow-xl py-3' : 'bg-white dark:bg-slate-900 py-5'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14">
                    <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="bg-red-600 p-2.5 rounded-2xl mr-3 shadow-lg shadow-red-200 dark:shadow-none group-hover:rotate-12 transition-transform duration-300">
                            <Pizza className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">8GUYS</span>
                            <span className="text-[10px] font-bold text-red-600 tracking-[0.2em] uppercase">Pizza Crafters</span>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center space-x-8">
                        <Link to="/" className={isActive('/')}>Explore Menu</Link>
                        <Link to="/contact" className={isActive('/contact')}>Contact</Link>

                        {user?.role === UserRole.ADMIN ? (
                            <Link to="/admin" className={`flex items-center gap-2 group ${isActive('/admin')}`}>
                                <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform" /> Admin Control
                            </Link>
                        ) : user?.role === UserRole.USER ? (
                            <Link to="/orders" className={isActive('/orders')}>My Orders</Link>
                        ) : null}

                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-600 transition-all duration-300"
                            title="Toggle Theme"
                        >
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                        </button>

                        {user?.role !== UserRole.ADMIN && (
                            <Link to="/cart" className="relative group">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-red-600 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-red-200">
                                    <ShoppingCart className="w-6 h-6 text-slate-600 dark:text-slate-300 group-hover:text-white" />
                                </div>
                                {itemCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center w-6 h-6 text-[10px] font-black text-white bg-red-600 border-2 border-white dark:border-slate-900 rounded-full animate-bounce">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4 pl-8 border-l border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col text-right">
                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{user.name}</span>
                                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user.role}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                                    title="Logout"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 pl-4">
                                <Link to="/login" className="text-slate-600 dark:text-slate-300 font-bold hover:text-red-600 transition-colors">Sign In</Link>
                                <Link to="/register" className="bg-red-600 text-white px-8 py-3 rounded-2xl hover:bg-red-700 transition-all font-black shadow-xl shadow-red-200 dark:shadow-none transform hover:-translate-y-1 active:scale-95">
                                    Join Now
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center lg:hidden gap-4">
                        {user?.role !== UserRole.ADMIN && (
                            <Link to="/cart" className="relative p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                <ShoppingCart className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className={`lg:hidden fixed inset-x-0 top-[72px] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-all duration-500 ease-in-out transform ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                <div className="px-6 py-10 space-y-6">
                    <Link onClick={() => setIsOpen(false)} to="/" className="flex items-center justify-between text-xl font-bold text-slate-800 dark:text-white">
                        Our Menu <ArrowRight className="w-5 h-5 text-red-600" />
                    </Link>
                    <Link onClick={() => setIsOpen(false)} to="/contact" className="flex items-center justify-between text-xl font-bold text-slate-800 dark:text-white">
                        Contact Us <ArrowRight className="w-5 h-5 text-red-600" />
                    </Link>
                    {user?.role === UserRole.USER && (
                        <Link onClick={() => setIsOpen(false)} to="/orders" className="flex items-center justify-between text-xl font-bold text-slate-800 dark:text-white">
                            My History <ArrowRight className="w-5 h-5 text-red-600" />
                        </Link>
                    )}
                    {user?.role === UserRole.ADMIN && (
                        <Link onClick={() => setIsOpen(false)} to="/admin" className="flex items-center justify-between text-xl font-bold text-red-600">
                            Admin Center <ArrowRight className="w-5 h-5" />
                        </Link>
                    )}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={() => { toggleTheme(); setIsOpen(false); }}
                            className="flex items-center justify-between w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 font-bold"
                        >
                            {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                        </button>
                    </div>
                    {!user ? (
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <Link onClick={() => setIsOpen(false)} to="/login" className="flex items-center justify-center p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-white">Sign In</Link>
                            <Link onClick={() => setIsOpen(false)} to="/register" className="flex items-center justify-center p-4 rounded-2xl bg-red-600 text-white font-bold shadow-lg shadow-red-200">Register</Link>
                        </div>
                    ) : (
                        <button
                            onClick={() => { handleLogout(); setIsOpen(false); }}
                            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-red-600 font-black"
                        >
                            Sign Out
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings>({
        contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'support@8guys.com',
        contactPhone: import.meta.env.VITE_CONTACT_PHONE || '+92 300 1234567',
        delivery: {
            isLocationBasedEnabled: false,
            allowedCityCodes: []
        }
    });

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const fetchSettings = () => {
            getSiteSettings().then((data: any) => setSettings(data));
        };

        fetchSettings();
        window.addEventListener('storage', fetchSettings);
        return () => window.removeEventListener('storage', fetchSettings);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-500">
            <Navbar theme={theme} toggleTheme={toggleTheme} />
            <main className="flex-grow pt-24 pb-12">
                <div className="animate-fade-in-up">
                    {children}
                </div>
            </main>
            <footer className="bg-slate-900 text-white pt-24 pb-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                        <div className="space-y-6">
                            <div className="flex items-center">
                                <div className="bg-red-600 p-2 rounded-xl mr-3">
                                    <Pizza className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-2xl font-black tracking-tight">8GUYS</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
                                Crafting authentic Italian flavors with a modern twist. Experience pizza like never before, delivered with passion.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-red-500">Explore</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-400">
                                <li><Link to="/" className="hover:text-white transition-colors">Our Menu</Link></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                                <li><Link to="/orders" className="hover:text-white transition-colors">Track Order</Link></li>
                                <li><Link to="/register" className="hover:text-white transition-colors">Rewards Program</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-red-500">Support</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-400">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy Center</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Safety & Hygiene</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-red-500">Get in Touch</h4>
                            <div className="space-y-6">
                                <a href={`mailto:${settings.contactEmail}`} className="flex items-center group">
                                    <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-red-600 transition-all mr-4">
                                        <Mail className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{settings.contactEmail}</span>
                                </a>
                                <a href={`tel:${settings.contactPhone}`} className="flex items-center group">
                                    <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-red-600 transition-all mr-4">
                                        <Phone className="w-5 h-5 text-slate-400 group-hover:text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{settings.contactPhone}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">© 2026 8 Guys Premium Pizza. Pure Passion in Every Slice.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
