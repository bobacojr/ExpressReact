"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Products = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const res = await axios.get("http://localhost:8080/products");
                setProducts(res.data);
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllProducts();
    }, []);

    const handleClick = (product_id: number) => {
        console.log("Moving to edit product page");
        router.push(`/edit_product/${product_id}`);
    }

    return ( 
        <div className="flex w-screen h-screen">
            <div className='flex flex-col w-full items-center m-3'>
                <h1 className='flex text-xl font-bold items-center'>
                    Products
                </h1>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full'>
                    {products.map((product) => (
                        <div key={product.id} className='flex flex-col w-full border-2 border-gray-300 rounded-lg overflow-hidden '>
                            <div className='w-full relative h-40'>
                                {product.image && 
                                    <Image src={`http://localhost:8080/${product.image}`} 
                                    fill 
                                    alt={product.title} 
                                    sizes='(max-width: 100px)' 
                                    priority 
                                    className='rounded-lg p-1' 
                                    style={{objectFit: "contain"}}/>
                                }
                            </div>
                            <h1 className='flex justify-center items-center'>
                                {product.title}
                            </h1>
                            <h1 className='text-center text-sm'>
                                Price: ${product.price}
                            </h1>
                            <p className=''>
                                {product.description}
                            </p>
                            <button onClick={() => handleClick(product.id)}>
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Products;