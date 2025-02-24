"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AddProduct = () => {
    const router = useRouter();
    const [product, setProduct] = useState({
        title: "",
        description: "",
        image: null as File | null,
        price: null as number | null,
    });

    /* 
    e: Event object which contains information about the event that occurred
    e.target: Element that triggered the event
    e.target.name: Name attribute of the input field (title, description, image, price)
    e.target.value: Current value of the input field
    prev: Previous state of the product object
    ...prev (spread operator): Creates a shallow copy of the previous state
    */
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
            const res = await axios.post("http://localhost:8080/products", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
            });
            
            if (res.status === 200) {
                setProduct({
                    title: "",
                    description: "",
                    price: null,
                    image: null,
                });
                console.log("moving to home page");
                router.push('/');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Failed to add product:", error.response?.data);
            } else {
                console.error("Error submitting form:", error);
            }
        }
    };

    return ( 
        <div className="flex w-full h-full border-2 border-red-600">
            <div className='flex flex-col justify-center items-center w-full'>
                <h1 className='flex text-3xl font-bold'>
                    Add Product
                </h1>
                <form
                    className='flex flex-col gap-2 justify-center items-center border-2 border-red-600'
                    action="http://localhost:8080/products" 
                    encType="multipart/form-data"
                    onSubmit={handleSubmit}
                    >
                    <input 
                        className='border-2 border-gray-300 rounded-md'
                        type="file" 
                        name="image" 
                        onChange={handleChange} 
                        required
                        />
                    <input 
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text" 
                        name="title" 
                        onChange={handleChange} 
                        placeholder="Product Title" 
                        required
                        />
                    <input
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text" 
                        name="description" 
                        onChange={handleChange} 
                        placeholder="Product Description" 
                        required
                        />
                    <input 
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text" 
                        name="price" 
                        onChange={handleChange}
                        placeholder='0.00'
                        required
                        />
                    <button type="submit" className='border-2 border-gray-300 w-16 rounded-lg font-semibold'>
                        Upload
                    </button>
                </form>
            </div>
        </div>
     );
}
 
export default AddProduct;