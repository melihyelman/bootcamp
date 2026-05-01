import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await cartService.get();
      setCart(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (product, quantity = 1) => {
    setError(null);
    try {
      const res = await cartService.addItem({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity,
      });
      setCart(res.data.data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateItem = async (itemId, quantity) => {
    setError(null);
    try {
      const res = await cartService.updateItem(itemId, quantity);
      setCart(res.data.data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeItem = async (itemId) => {
    setError(null);
    try {
      const res = await cartService.removeItem(itemId);
      setCart(res.data.data);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const clearCart = async () => {
    setError(null);
    try {
      await cartService.clear();
      setCart(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const itemCount = cart?.itemCount || 0;
  const totalPrice = cart?.totalPrice || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        fetchCart,
        itemCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
