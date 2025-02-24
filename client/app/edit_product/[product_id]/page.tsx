"use client"
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { title } from 'process';
import Image from 'next/image';

const EditProduct = () => {
    const params = useParams();
    const { product_id } = params;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [product, setProduct] = useState({
        title: "",
        description: "",
        image: null as File | null,
        price: "" as string | number,
        existingImage: ""
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/products/${product_id}`);
                const productData = res.data.data[0];
                setProduct({
                    title: productData.title,
                    description: productData.description,
                    price: productData.price,
                    image: null,
                    existingImage: productData.image
                });
                setIsLoading(false);
                console.log('Product title:', productData.image);
            } catch (error) {
                console.error("Failed to fetch product", error);
                setIsLoading(false);
            }
        }
        fetchProduct();
    }, [product_id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, files} = e.target;
        if (name === "image" && files) {
            setProduct((prev) => ({
                ...prev,
                image: files[0],
            }));
        } else {
            setProduct((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    if (isLoading) {
        return <div>Loading...</div>
    }
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", product.title);
        formData.append("description", product.description);
        formData.append("price", String(product.price)); // Stringify the price
        if (product.image) {
            formData.append("image", product.image);
        }
        try {
            const res = await axios.put(`http://localhost:8080/products/${params.product_id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });
            if (res.status === 200) {
                router.push('/');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Failed to update product:", error);
            } else {
                console.error("Error submitting form:", error);
            }
        }
    };

    return ( 
        <div className="flex w-full h-full border-2 border-red-600">
            <div className='flex flex-col justify-center items-center w-full'>
                <h1 className='flex text-3xl font-bold'>
                    Edit Product
                </h1>
                <form
                    className='flex flex-col gap-2 justify-center items-center border-2 border-red-600' 
                    encType="multipart/form-data"
                    onSubmit={handleSubmit}
                    >
                    <input 
                        className='border-2 border-gray-300 rounded-md'
                        type="file" 
                        name="image" 
                        required
                        onChange={handleChange}
                        />
                        {product.existingImage && (
                            <div className=''>
                                <p>Current Image</p>
                                <Image src={`http://localhost:8080/${product.existingImage}`}
                                     
                                    alt={product.title} 
                                    sizes='100vw' 
                                    width={128}   // Specify the width in pixels
            height={128}
                                    priority 
                                    className='rounded-lg p-1' 
                                    style={{objectFit: "contain"}}
                                    />
                            </div>
                        )}
                    <input 
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text" 
                        name="title" 
                        placeholder="Product Title" 
                        required
                        value={product.title}
                        onChange={handleChange}
                        />
                    <input
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text" 
                        name="description" 
                        placeholder="Product Description" 
                        required
                        value={product.description}
                        onChange={handleChange}
                        />
                    <input 
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text" 
                        name="price"
                        value={Number(product.price) || ""}
                        placeholder={'0.00'}
                        required
                        onChange={handleChange}
                        />
                    <button type="submit" className='border-2 border-gray-300 w-16 rounded-lg font-semibold'>
                        Upload
                    </button>
                </form>
            </div>
        </div>
     );
}
 
export default EditProduct;
