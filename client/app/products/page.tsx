"use client"
import React, { useEffect, useState, useRef } from 'react';
import axios from '../(components)/axiosConfig';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import withAuth from '../(components)/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [currentCategory, setCurrentCategory] = useState('All'); // Default search filter is All
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Create a ref for the sliding menu
    const slidingMenuRef = useRef<HTMLDivElement>(null);

    // Close the sliding menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (slidingMenuRef.current && !slidingMenuRef.current.contains(event.target as Node)) {
                setAddingToCart(false); // Close the sliding menu
                setSelectedProduct(null); // Clear the selected product
            }
        };

        // Attach the event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up the event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Fetch all products
        const fetchAllProducts = async () => {
            try {
                const res = await axios.get("http://localhost:8080/products", {
                    params: { category_id: currentCategory === "All" ? null : currentCategory },
                    withCredentials: true,
                });
                setProducts(res.data);
            } catch (error) {
                console.log(error);
            }
        };
        const fetchCategories = async () => {
            try {
                const res = await axios.get("http://localhost:8080/categories");
                setCategories(res.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchAllProducts();
        fetchCategories();
    }, [currentCategory]);

    // Add product to cart
    const addToCart = async (product_id: number) => {
        try {
            const quantity = 1; // Will need to implement choosing a specific quantity
            const res = await axios.post("http://localhost:8080/cart/add", 
                { product_id: product_id, quantity: quantity },
                { withCredentials: true },
            );
            console.log(res.data.message);
        } catch (error: any) { // Will need to look into these error messages
            console.error("Failed to add to cart:", error.response?.data || error.message);
            alert(`Failed to add to cart: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleClick = (product_id: number) => {
        console.log("Moving to edit product page");
        router.push(`/edit_product/${product_id}`);
    };

    const handleAddingToCart = async (product: Product) => {
        setSelectedProduct(product);
        setAddingToCart(true);
    };

    const handleClosePopup = async () => {
        setAddingToCart(false);
        setSelectedProduct(null);
    };

    return ( 
        <div className="flex w-screen h-screen">
            <div className='flex flex-col w-full items-center m-3'>
                <h1 className='flex text-lg font-bold items-center mb-3'>
                    Products
                </h1>
                <select
                    value={currentCategory}
                    onChange={(e) => setCurrentCategory(e.target.value)}
                    className='border-2 border-gray-300 rounded-lg p-2 mb-4'
                >
                    <option value="All">All</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
                <div className='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-[17em] sm:w-full'>
                    {products.map((product) => (
                        <div key={product.id} className='flex flex-col w-full border-2 items-center border-gray-300 rounded-lg'>
                            <div className='w-full relative h-52'>
                                {product.image && 
                                    <Image src={`http://localhost:8080/${product.image}`} 
                                    fill 
                                    alt={product.title} 
                                    sizes='(max-width: 200px)' 
                                    priority 
                                    className='rounded-lg p-1' 
                                    style={{objectFit: "contain"}}/>
                                }
                            </div>
                            <h1 className='flex justify-center items-center'>
                                {product.title}
                            </h1>
                            <h1 className='text-center text-sm font-semibold'>
                                Price: ${product.price}
                            </h1>
                            <p className='flex items-center overflow-hidden text-wrap h-16 w-full text-center justify-center'>
                                {product.description}
                            </p>
                            <div className='flex flex-row'>
                                <button 
                                    className='flex justify-center items-center border-2 border-gray-300 w-12 rounded-lg m-1'
                                    onClick={() => handleClick(product.id)}
                                >
                                    Edit
                                </button>
                                <button 
                                    className='flex justify-center items-center border-2 border-gray-300 w-24 rounded-lg m-1'
                                    onClick={() => handleAddingToCart(product)}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {addingToCart && (
                    <motion.div
                        ref={slidingMenuRef}
                        className='flex fixed right-0 top-[4.88rem] w-full sm:w-[28em] h-full border-l-2 border-gray-300 bg-opacity-95 bg-white z-10'
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }} 
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                    >
                        {selectedProduct && (
                            <div className='flex flex-col w-full h-full p-2 pt-3'>
                                <span className='text-2xl tracking-wider font-semibold pb-1 pt-1 border-b-2 border-gray-300'>
                                    Choose Options
                                </span>
                                <div className='flex flex-row w-full pt-1'>
                                    <div className='w-1/2 h-64 relative flex-shrink-0'>
                                        <Image 
                                            src={`http://localhost:8080/${selectedProduct.image}`}
                                            fill
                                            alt={selectedProduct.title}
                                            sizes='(max-width: 100px)'
                                            className='rounded-lg pb-6'
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                    <div className='flex w-full h-full flex-col pl-2'>
                                        <span className='text-lg font-semibold'>
                                            {selectedProduct.title}
                                        </span>
                                        <span className='text-sm font-thin italic pb-2'>
                                            {selectedProduct.brand}
                                        </span>
                                        <span className='text-md text-gray-500 text-wrap overflow-wrap break-word whitespace-normal w-48 max-h-[6em]'>
                                            {selectedProduct.description}
                                        </span>
                                        <span className='text-red-500 font-semibold'>
                                            ${selectedProduct.price}
                                        </span>
                                    </div>
                                </div>

                                <div className='flex flex-col justify-center items-center mt-4'>
                                    <motion.button
                                        className='border-2 w-3/4 p-2 border-gray-300  text-gray-500 rounded-xl'
                                        onClick={() => addToCart(selectedProduct.id)}
                                        whileHover={{ scale: 1.1, borderColor: "#22c55e", color: "#22c55e"  }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        Add to Cart
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default withAuth(Products);