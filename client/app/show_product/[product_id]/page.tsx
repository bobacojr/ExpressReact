"use client"
import React, { useEffect, useState } from 'react';
import withAuth from '@/app/(components)/ProtectedRoute';
import axios from "@/app/(components)/axiosConfig";
import Navbar from '@/app/(components)/navbar/page';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from "motion/react";

const ShowProduct = () => {
    const router = useRouter();
    const params = useParams();
    const { product_id } = params;
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isProductAdded, setIsProductAdded] = useState(false);

    useEffect(() => {
        if (!product_id) return;

        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/products/${product_id}`, {
                    withCredentials: true
                });
                const productData = res.data.data[0];
                setProduct({
                    id: productData.id,
                    title: productData.title,
                    description: productData.description,
                    image: productData.image,
                    price: productData.price,
                    size: productData.size,
                    color: productData.color,
                    author: productData.author,
                    brand: productData.brand,
                    model: productData.model,
                    quantity: productData.quantity,
                    category_id: productData.category_id
                });
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
            }
        }
        const fetchCategories = async () => {
            try {
                const res = await axios.get("http://localhost:8080/categories", {
                    withCredentials: true,
                });
                setCategories(res.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchProduct();
        fetchCategories();
    }, [product_id]);

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            const res = await axios.post('http://localhost:8080/cart/add', {
                product_id: product.id,
                quantity: quantity
            }, {
                withCredentials: true,
            });
            setIsProductAdded(true);
            console.log("Product added to cart:", res.data);
            setQuantity(1); // Revert quantity back to the default
        } catch (error) {
            console.error("Failed to add product to cart:", error);
            alert("Failed to add product to cart. Please try again.");
        }
    }

    const handleContinueShopping = async () => {
        router.push('/');
    }

    const handleViewCart = async () => {
        router.push('/show_cart');
    }

    const getCategoryName = (category_id: number | null) => {
        const category = categories.find((cat) => cat.id === category_id);
        return category ? category.name : null;
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!product) {
        return <div>Product not found</div>;
    }

    return ( 
        <div className="flex w-screen h-auto">
            <div className="fixed top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            <div className='flex flex-col justify-center sm:items-center w-full mt-24'>
            {isProductAdded ? (
                        <AnimatePresence>
                            <div className='flex flex-row items-center justify-center gap-2'>
                                <motion.span className='text-2xl tracking-wider font-semibold'
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="30px" height="30px" stroke='#22c55e'>
                                        <path d="M 25 2 C 12.317 2 2 12.317 2 25 C 2 37.683 12.317 48 25 48 C 37.683 48 48 37.683 48 25 C 48 20.44 46.660281 16.189328 44.363281 12.611328 L 42.994141 14.228516 C 44.889141 17.382516 46 21.06 46 25 C 46 36.579 36.579 46 25 46 C 13.421 46 4 36.579 4 25 C 4 13.421 13.421 4 25 4 C 30.443 4 35.393906 6.0997656 39.128906 9.5097656 L 40.4375 7.9648438 C 36.3525 4.2598437 30.935 2 25 2 z M 43.236328 7.7539062 L 23.914062 30.554688 L 15.78125 22.96875 L 14.417969 24.431641 L 24.083984 33.447266 L 44.763672 9.046875 L 43.236328 7.7539062 z"/>
                                    </svg>
                                </motion.span>
                                <motion.span className='text-2xl tracking-wider font-semibold'
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}>
                                    Item Added to Cart
                                </motion.span>
                            </div>
                        </AnimatePresence>
                    ) : (
                        <div className='text-2xl tracking-wider font-semibold'>
                            Selected Product
                        </div>
                    )}
                <div className='flex flex-col sm:flex-row rounded-lg p-2 gap-1'>
                    {product.image && (
                        <div className='flex flex-col w-full justify-center items-center max-w-[60em]'>
                            <Image
                                src={`http://localhost:8080/${product.image}`}
                                alt={product.title}
                                width={360}
                                height={180}
                                className='rounded-lg p-1'
                                style={{ objectFit: "contain" }}
                                priority
                            />
                        </div>
                    )}
                    <div className='flex flex-col w-full items-center sm:items-start'>
                        {getCategoryName(product.category_id) === "Clothes" && (
                            <>
                                <div className='flex flex-row'>
                                    <p className='text-lg font-semibold'>{product.title}</p>
                                </div>
                                <div className='flex flex-row text-sm italic'>
                                    <p>{product.brand}</p>
                                </div>
                                <div className='flex flex-row'>
                                    <p className='text-md text-gray-500'>{product.description}</p>
                                </div>
                                <div className='flex flex-row text-red-500 font-semibold'>
                                    <p>${product.price}</p>
                                </div>
                            </>
                        )}
                        {getCategoryName(product.category_id) === "Books" && (
                            <>
                                <div className='flex flex-row sm:items-start'>
                                    <p className='text-lg font-semibold'>{product.title}</p>
                                </div>
                                <div className='flex flex-row italic'>
                                    <p>{product.author}</p>
                                </div>
                                <div className='flex flex-row'>
                                    <p className='text-md text-gray-500'>{product.description}</p>
                                </div>
                                <div className='flex flex-row text-red-500 font-semibold'>
                                    <p>${product.price}</p>
                                </div>
                            </>
                        )}
                        {getCategoryName(product.category_id) === "Electronics" && (
                            <>
                                <div className='flex flex-row sm:items-start'>
                                    <p className='text-lg font-semibold'>{product.title}</p>
                                </div>
                                <div className='flex flex-row text-sm italic'>
                                    <p>{product.brand}</p>
                                </div>
                                <div className='flex flex-row'>
                                    <p className='text-md text-gray-500'>{product.description}</p>
                                </div>
                                <div className='flex flex-row text-red-500 font-semibold'>
                                    <p>${product.price}</p>
                                </div>
                            </>
                        )}
                        {getCategoryName(product.category_id) === "Toys" && (
                            <>
                                <div className='flex flex-row sm:items-start'>
                                    <p className='text-lg font-semibold'>{product.title}</p>
                                </div>
                                <div className='flex flex-row text-sm italic'>
                                    <p>{product.brand}</p>
                                </div>
                                <div className='flex flex-row'>
                                    <p className='text-md text-gray-500'>{product.description}</p>
                                </div>
                                <div className='flex flex-row text-red-500 font-semibold'>
                                    <p>${product.price}</p>
                                </div>
                            </>
                        )}
                        {getCategoryName(product.category_id) === "Games" && (
                            <>
                                <div className='flex flex-row sm:items-start'>
                                    <p className='text-lg font-semibold'>{product.title}</p>
                                </div>
                                <div className='flex flex-row text-sm italic'>
                                    <p>{product.brand}</p>
                                </div>
                                <div className='flex flex-row'>
                                    <p className='text-md text-gray-500'>{product.description}</p>
                                </div>
                                <div className='flex flex-row text-red-500 font-semibold'>
                                    <p>${product.price}</p>
                                </div>
                            </>
                        )}
                        <div className='flex flex-col w-full justify-end mt-auto'>
                            {isProductAdded ? (
                                <div className='flex flex-col w-full justify-center items-center mt-6 gap-6'>
                                    <motion.button
                                        className='border-2 w-11/12 p-2 border-gray-300  text-gray-500 rounded-2xl font-semibold'
                                        whileHover={{ scale: 1.06, borderColor: "#ef4444", color: "#ef4444"  }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleContinueShopping}
                                        >
                                        Continue Shopping
                                    </motion.button>
                                    <motion.button
                                        className='border-2 w-11/12 p-2 border-gray-300  text-gray-500 rounded-2xl font-semibold'
                                        whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e"  }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleViewCart}
                                        >
                                        View Cart & Checkout
                                    </motion.button>
                                </div>
                            ) : (
                                <div className='flex flex-row w-full justify-center items-center mt-6 gap-6'>
                                    <div className='flex border-2 border-gray-300 p-2 rounded-2xl'>
                                        <select
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            >
                                            {[...Array(7).keys()].slice(1).map((num) => (
                                                <option key={num} value={num}>
                                                    Quantity: {num}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <motion.button
                                        className='border-2 w-full max-w-80 p-2 border-gray-300 text-gray-500 rounded-2xl font-semibold'
                                        whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e"  }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleAddToCart}
                                        >
                                        Add to Cart
                                    </motion.button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
     );
}
 
export default withAuth(ShowProduct);