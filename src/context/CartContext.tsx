
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, PizzaSize } from '../types.ts';

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'cartId'>) => void;
    removeFromCart: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('ph_cart_v2');
        if (storedCart) {
            setItems(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('ph_cart_v2', JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: Omit<CartItem, 'cartId'>) => {
        setItems((prev) => {
            const existingIdx = prev.findIndex(
                (i) => i.productId === newItem.productId && i.size === newItem.size
            );

            if (existingIdx > -1) {
                const newItems = [...prev];
                newItems[existingIdx].quantity += newItem.quantity;
                return newItems;
            }

            return [...prev, { ...newItem, cartId: Date.now().toString() }];
        });
    };

    const removeFromCart = (cartId: string) => {
        setItems((prev) => prev.filter((item) => item.cartId !== cartId));
    };

    const updateQuantity = (cartId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(cartId);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
