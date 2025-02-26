"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./(components)/navbar/page";
import Products from '@/app/products/page';
import AddProduct from "./add_products/page";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);

  const addProduct = (newProduct: Product) => {
    console.log("adding product to main page...")
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };

  return (
    <div className="flex w-screen h-screen justify-center overflow-x-hidden">
        <div className="fixed top-0 left-0 w-full z-20">
          <Navbar />
        </div>
        <div className="flex w-full mt-24">
          <Products />
        </div>
    </div>
  );
}
