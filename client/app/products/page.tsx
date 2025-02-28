"use client"
import React, { useEffect, useState } from 'react';
import axios from '../(components)/axiosConfig';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Products = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([])
    const [currentCategory, setCurrentCategory] = useState('All'); // Default search filter is All

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
    }

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
                        <div key={product.id} className='flex flex-col w-full border-2 items-center border-gray-300 rounded-lg '>
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
                                    onClick={() => addToCart(product.id)}
                                    >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Products;