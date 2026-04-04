import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import { getSiteSettings } from '../services/api.ts';
import { SiteSettings } from '../types.ts';

const Contact: React.FC = () => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        getSiteSettings().then(setSettings);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase">Get in Touch</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                    Have a question about our menu, delivery, or want to share your experience? We're here to listen.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Contact Information</h2>

                        <div className="space-y-8">
                            <div className="flex items-center gap-6 group">
                                <div className="p-4 bg-red-600/10 rounded-2xl group-hover:bg-red-600 transition-all">
                                    <Mail className="w-6 h-6 text-red-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Us</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{settings?.contactEmail || 'support@8guys.com'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 group">
                                <div className="p-4 bg-red-600/10 rounded-2xl group-hover:bg-red-600 transition-all">
                                    <Phone className="w-6 h-6 text-red-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Call Us</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{settings?.contactPhone || '+92 300 1234567'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 group">
                                <div className="p-4 bg-red-600/10 rounded-2xl group-hover:bg-red-600 transition-all">
                                    <MapPin className="w-6 h-6 text-red-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visit Us</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">123 Pizza Lane, Downtown District</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 group">
                                <div className="p-4 bg-red-600/10 rounded-2xl group-hover:bg-red-600 transition-all">
                                    <Clock className="w-6 h-6 text-red-600 group-hover:text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Opening Hours</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Mon - Sun: 11:00 AM - 12:00 AM</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-32 bg-red-600/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Follow the Aroma</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8">Join our community for exclusive deals and behind-the-scenes looks at our kitchen.</p>
                        <div className="flex gap-4">
                            {['Instagram', 'Facebook', 'Twitter'].map(social => (
                                <button key={social} className="px-6 py-2 bg-white/10 hover:bg-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    {social}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
                    {isSubmitted ? (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-scale-in">
                            <div className="p-6 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Message Received!</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                                Thank you for reaching out. Our team will get back to you within 24 hours.
                            </p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="bg-slate-900 dark:bg-slate-800 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all"
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tight">Send a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Your Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none text-slate-900 dark:text-white"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none text-slate-900 dark:text-white"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
                                    <select className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none appearance-none text-slate-900 dark:text-white">
                                        <option>General Inquiry</option>
                                        <option>Delivery Feedback</option>
                                        <option>Menu Question</option>
                                        <option>Business Partnership</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-0 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-600 outline-none resize-none text-slate-900 dark:text-white"
                                        placeholder="Tell us what's on your mind..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-red-700 transition-all shadow-xl shadow-red-200 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                                    {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;
