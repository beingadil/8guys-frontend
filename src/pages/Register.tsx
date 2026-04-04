
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { registerUser } from '../services/api.ts';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const validatePassword = (pwd: string) => {
        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
        return pwd.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!validatePassword(password)) {
            setError('Password must be at least 8 chars, include uppercase, lowercase, number, and special char.');
            return;
        }
        setLoading(true);
        try {
            const newUser = await registerUser(name, email, password);
            login(newUser);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-12 w-full max-w-md border border-slate-100 dark:border-slate-800">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Join 8GUYS</h1>
                    <p className="text-slate-400 font-medium text-sm">Create your account to start ordering</p>
                </div>
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold text-center">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none text-slate-900 dark:text-white" />
                        <p className="text-[10px] text-slate-400 mt-2 font-bold">8+ chars, uppercase, lowercase, number & symbol</p>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black text-base hover:bg-red-700 transition-all shadow-xl shadow-red-200 dark:shadow-none disabled:opacity-50 mt-2">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">Already have an account?{' '}
                        <Link to="/login" className="font-bold text-red-600 hover:text-red-700">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
