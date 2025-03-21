"use client"
import React, { useEffect, useState } from 'react';
import axios from '../(components)/axiosConfig';
import Navbar from '../(components)/navbar/page';
import { motion } from 'motion/react';
import withAuth from '../(components)/ProtectedRoute';
import Image from 'next/image';
import { useCart } from '../(components)/context/CartContext';

const ShowCart = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [totalQuantity, setTotalQuantity] = useState<number>(0);
    const { cartItems, fetchCart } = useCart();

    const handleDelete = async (cart_id: number, quantity: number) => {
        console.log(`Quantity to remove: ${quantity}`)
        console.log(`id: ${cart_id}`)
        try {
            await axios.delete(`http://localhost:8080/cart/remove/${cart_id}`, {
                data: { quantity },
                withCredentials: true,
            });
            await fetchCart();
        } catch (error) {
            console.error("Error deleting item from cart:", error);
        }
    };

    const updateQuantity = async (cart_id: number, newQuantity: number) => {
        try {
            await axios.put(`http://localhost:8080/cart/update/${cart_id}`, {
                quantity: newQuantity,
            }, {
                withCredentials: true
            });
            await fetchCart();
        } catch (error) {
            console.error("Error updating item quantity:", error);
        }
    }

    useEffect(() => {
        const getCart = async () => {
            setIsLoading(true);
            setError(null);
            try {
                await fetchCart(); // Fetch cart data using the context
            } catch (error) {
                console.error("Error fetching cart:", error);
                setError("Failed to fetch cart data.");
            } finally {
                setIsLoading(false);
            }
        };
        getCart();
    }, [fetchCart]);

    useEffect(() => {
        // Calculate subtotal and total quantity whenever cartItems changes
        /*
            reduce: Iterate over the array and accumulate a single value, here we are finding the subtotal
            (sum, item): Accumulator function
                sum: Is the accumulator which holds the running total of the subtotal
                item: The current item being processed in the array
            
            IF item.id === cart_id THEN USE newQuantity ELSE USE THE NORMAL QUANTITY
        */
        const newSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newTotalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        setSubtotal(newSubtotal);
        setTotalQuantity(newTotalQuantity);
    }, [cartItems]);

    if (isLoading) {
        return <div>Loading cart...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (isLoading) {
        return <div>Loading cart...</div>
    }

    if (error) {
        return <div>Error: {error}</div>
    }

    return ( 
        <div className='flex w-screen h-screen'>
            <div className="flex fixed top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            <div className='flex flex-col mt-24 ml-4'>
                <span className='text-xl font-semibold'>
                    Cart
                </span>
                <span className='text-gray-500 font-semibold'>
                    ${subtotal} subtotal <span >&#8226;</span> {totalQuantity} items
                </span>
            </div>
            <div className='flex w-full justify-center fixed flex-col mt-40 border-2 border-gray-300 p-3'>
                {cartItems.length === 0 ? (
                    <p>
                        Your cart is currently empty... Lets do some shopping!
                    </p>
                ) : (
                    <ul className='flex flex-col gap-2 w-full max-w-lg'>
                        {cartItems.map((item) => (
                            <li key={item.id} className='flex flex-row w-full items-center p-2 gap- border-2 border-gray-300 rounded-lg shadow-md'>
                                <Image src={`http://localhost:8080/${item.image}`}
                                    width={80}
                                    height={80}
                                    alt={item.title}
                                    className='w-20 h-20 object-cover' 
                                    />
                                <div className='flex w-full justify-between items-center'>
                                    <div className='flex flex-col pl-2'>
                                        <p>
                                            {item.title}
                                        </p>
                                        <p className='text-red-500 font-bold'>
                                            ${item.price}
                                        </p>
                                        <div className='flex flex-row'>
                                            <select
                                                defaultValue={item.quantity}
                                                onChange={(e) => {
                                                    const newQuantity = Number(e.target.value);
                                                    if (newQuantity === 0) {
                                                        handleDelete(item.id, item.quantity); // Remove item if quantity is 0
                                                    } else {
                                                        updateQuantity(item.id, newQuantity);
                                                    }
                                                }}
                                                >
                                                {[...Array(20).keys()].map((num) => (
                                                    <option key={num} value={num}>
                                                        Quantity: {num}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <motion.div
                                        className='cursor-pointer'
                                        whileHover={{ color: 'rgb(255, 0, 0)', }}
                                        onClick={() => handleDelete(item.id, item.quantity)}
                                        >
                                        <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 128 128" width="26px" height="26px" className=''>
                                            <path fill='currentColor' stroke='currentColor' d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"/>
                                        </svg>
                                    </motion.div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
 
export default withAuth(ShowCart);