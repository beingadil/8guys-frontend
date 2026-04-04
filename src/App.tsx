import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Layout } from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Checkout from './pages/Checkout.tsx';
import Contact from './pages/Contact.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import UserDashboard from './pages/UserDashboard.tsx';
import UserOrders from './pages/UserOrders.tsx';
import ProductDetails from './pages/ProductDetails.tsx';
import { UserRole } from './types.ts';

// Protected route — redirects to /login if not authenticated
interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly }: ProtectedRouteProps) => {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-600"></div>
            </div>
        );
    }
    if (!user) return <Navigate to="/login" replace />;
    if (adminOnly && user.role !== UserRole.ADMIN) return <Navigate to="/" replace />;
    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <CartProvider>
                <Layout>
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
                        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

                        {/* Cart / Checkout */}
                        <Route path="/cart" element={<Checkout />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/contact" element={<Contact />} />

                        {/* Protected – users */}
                        <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><UserOrders /></ProtectedRoute>} />

                        {/* Protected – admin only */}
                        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            </CartProvider>
        </BrowserRouter>
    );
};

const App: React.FC = () => (
    <AuthProvider>
        <AppRoutes />
    </AuthProvider>
);

export default App;
