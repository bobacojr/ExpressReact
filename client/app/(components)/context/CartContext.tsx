import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from '../axiosConfig';

const CartContext = createContext<CartContextType>({
    cartItems: [],
    fetchCart: async () => {},
});

interface CartContextType {
    cartItems: Product[];
    fetchCart: () => Promise<void>;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState([]);

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://localhost:8080/cart", { withCredentials: true });
      setCartItems(res.data.data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);