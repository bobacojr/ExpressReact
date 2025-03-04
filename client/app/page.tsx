"use client"
import React, { useEffect, useState } from "react";
import Navbar from "./(components)/navbar/page";
import Products from '@/app/products/page';
import axios from './(components)/axiosConfig';
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from 'motion/react';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:8080/auth/me");
        setIsAuthenticated(true);
      } catch (error) {
        console.log("Authentication check failed, please login");
        router.push('/login');
      }
    };
    checkAuth();
  }, [router]);

  if (!isAuthenticated) {
    return null; // or a loading spinner
  }

  const handleAddingToCart = async () => {
    setAddingToCart(true);
  };

  const handleClosePopup = async () => {
    setAddingToCart(false);
  };

  return (
    <div className="flex w-screen h-screen justify-center overflow-x-hidden">
      <AnimatePresence>
        {addingToCart && (
          <motion.div
            key='overlay'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-20" 
            onClick={handleClosePopup}>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="fixed top-0 left-0 w-full z-10">
        <Navbar 
          />
      </div>
      <div className="flex w-full mt-24">
        <Products 
          addingToCart={addingToCart} 
          onAddingToCart={handleAddingToCart} 
          onClosePopup={handleClosePopup}
          />
      </div>
    </div>
  );
}
