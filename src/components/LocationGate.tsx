
import React, { useState, useEffect } from 'react';
import { getCurrentPosition, reverseGeocode, verifyLocation, getSiteSettings } from '../services/api.ts';
import { MapPin, Loader2, Edit3, Pizza } from 'lucide-react';
import { SiteSettings } from '../types.ts';

interface LocationGateProps {
    onVerified: (locationDetails: any) => void;
}

const LocationGate: React.FC<LocationGateProps> = ({ onVerified }) => {
    const [isDetecting, setIsDetecting] = useState(false);
    const [error, setError] = useState('');
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [manualAddress, setManualAddress] = useState('');
    const [mode, setMode] = useState<'options' | 'manual'>('options');

    useEffect(() => {
        getSiteSettings().then(setSettings);
    }, []);

    const handleDetect = async () => {
        setIsDetecting(true);
        setError('');
        try {
            const pos = await getCurrentPosition();
            const addr = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
            const verification = await verifyLocation(pos.coords.latitude, pos.coords.longitude, addr.display_name);

            const details = {
                ...verification,
                fullAddress: addr.display_name,
                customerLat: pos.coords.latitude,
                customerLng: pos.coords.longitude
            };

            localStorage.setItem('ph_verified_location', JSON.stringify(details));
            onVerified(details);
        } catch (err: any) {
            setError(err.message || 'Location verification failed.');
        } finally {
            setIsDetecting(false);
        }
    };

    const handleManualVerify = async () => {
        if (!manualAddress.trim()) {
            setError('Please enter your full address.');
            return;
        }
        setIsDetecting(true);
        setError('');
        try {
            const verification = await verifyLocation(undefined, undefined, manualAddress);

            const details = {
                ...verification,
                fullAddress: manualAddress
            };

            localStorage.setItem('ph_verified_location', JSON.stringify(details));
            onVerified(details);
        } catch (err: any) {
            setError(err.message || 'Address verification failed.');
        } finally {
            setIsDetecting(false);
        }
    };

    if (!settings) return null;

    const { isLocationBasedEnabled, allowedCityCodes } = settings.delivery;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-16 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden transform animate-scale-in">
                <div className="absolute top-0 right-0 p-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="inline-block p-6 bg-red-600 rounded-3xl mb-10 shadow-xl shadow-red-200 dark:shadow-none">
                    <Pizza className="w-12 h-12 text-white" />
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase">Where should we deliver?</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-12 max-w-md mx-auto">
                    {isLocationBasedEnabled
                        ? "We only deliver fresh pizza within our specialized delivery zones to ensure peak flavor."
                        : `We are currently delivering in ${allowedCityCodes.join(", ")}. Please include your city code at the end of your address.`}
                </p>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold mb-8">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    {mode === 'options' ? (
                        <>
                            {isLocationBasedEnabled && (
                                <button
                                    onClick={handleDetect}
                                    disabled={isDetecting}
                                    className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-red-700 transition-all flex items-center justify-center gap-4 shadow-xl shadow-red-200 active:scale-95 disabled:opacity-50"
                                >
                                    {isDetecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <MapPin className="w-6 h-6" />}
                                    {isDetecting ? 'VERIFYING...' : 'USE MY LOCATION'}
                                </button>
                            )}

                            {!isLocationBasedEnabled && (
                                <button
                                    onClick={() => setMode('manual')}
                                    disabled={isDetecting}
                                    className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    <Edit3 className="w-6 h-6" />
                                    ENTER ADDRESS
                                </button>
                            )}

                            {isLocationBasedEnabled && (
                                <button
                                    onClick={() => setMode('manual')}
                                    className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                                >
                                    Or enter address manually
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <textarea
                                rows={3}
                                className="w-full p-6 bg-slate-100 dark:bg-slate-800 rounded-3xl border-0 focus:ring-2 focus:ring-red-500 text-sm font-bold outline-none resize-none"
                                placeholder={isLocationBasedEnabled ? "Enter full address..." : "Example: House 4, Street 2 Model Town GRW"}
                                value={manualAddress}
                                onChange={(e) => setManualAddress(e.target.value)}
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setMode('options')}
                                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleManualVerify}
                                    disabled={isDetecting}
                                    className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-200"
                                >
                                    {isDetecting ? 'VERIFYING...' : 'VERIFY ADDRESS'}
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-4">
                        {isLocationBasedEnabled ? "Requires Location Access" : "Address Code Verification Required"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LocationGate;
