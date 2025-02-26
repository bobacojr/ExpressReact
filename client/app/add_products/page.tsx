"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Navbar from '../(components)/navbar/page';

const AddProduct = () => {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([])
    const [product, setProduct] = useState({
        title: "", // Every produict gets this
        description: "", // Every produict gets this
        image: null as File | null, // Every produict gets this
        price: null as number | null, // Every product gets this
        category_id: null as number | null, // Every product gets this
        size: "", // Category = Clothes
        color: "", // Category = Clothes
        author: "", // Category = Books
        brand: "", // Category = Clothes OR Electronics OR Toys OR Games
        model: "", // Category = Electronics
        quantity: null as number | null,
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get("http://localhost:8080/categories");
                setCategories(res.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    /* 
    e: Event object which contains information about the event that occurred
    e.target: Element that triggered the event
    e.target.name: Name attribute of the input field (title, description, image, price)
    e.target.value: Current value of the input field
    prev: Previous state of the product object
    ...prev (spread operator): Creates a shallow copy of the previous state
    */

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setProduct((prev) => ({
                ...prev,
                image: e.target.files![0],
            }));
        }
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProduct((prev) => ({
            ...prev,
            [name]: name === "category_id" || name === "price" || name === "quantity" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            console.log("No token found, please log in");
            return;
        }

        const formData = new FormData();
        formData.append("title", product.title);
        formData.append("description", product.description);
        formData.append("price", String(product.price)); // Stringify the price
        formData.append("category_id", String(product.category_id));
        formData.append("size", product.size || ""); // Default to empty string if undefined
        formData.append("color", product.color || "");
        formData.append("author", product.author || "");
        formData.append("brand", product.brand || "");
        formData.append("model", product.model || "");
        formData.append("quantity", String(product.quantity || 0));

        if (product.image) {
            formData.append("image", product.image);
        }

        try {
            const res = await axios.post("http://localhost:8080/products", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}` // Add token for user
                },
            });
            
            if (res.status === 200) {
                setProduct({
                    title: "",
                    description: "",
                    price: null,
                    image: null,
                    category_id: null,
                    size: "",
                    color: "",
                    author: "",
                    brand: "",
                    model: "",
                    quantity: 0,
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

    // Helper function to get category name based on id
    const getCategoryName = (category_id: number | null) => {
        const category = categories.find((cat) => cat.id === category_id);
        return category ? category.name : null;
    }

    const handleCancel = async () => {
        router.push('/')
    };

    return ( 
        <div className="flex w-full h-full border-2 border-red-600">
            <div className="fixed top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            <div className='flex flex-col justify-center items-center w-full mt-24'>
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
                        onChange={handleFileChange} 
                        required
                        />
                    <input 
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text" 
                        name="title" 
                        onChange={handleInputChange} 
                        placeholder="Product Title" 
                        required
                        />
                    <input
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text" 
                        name="description" 
                        onChange={handleInputChange} 
                        placeholder="Product Description" 
                        required
                        />
                    <input 
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text" 
                        name="price" 
                        onChange={handleInputChange}
                        placeholder='0.00'
                        required
                        />
                    <select
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        name='category_id'
                        value={product.category_id || ""}
                        onChange={handleInputChange}
                        required
                            >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                    </select>

                    {getCategoryName(product.category_id) === "Clothes" && (
                        <>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text" 
                                name="brand" 
                                onChange={handleInputChange}
                                placeholder='Brand'
                                required
                                />
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text" 
                                name="size" 
                                onChange={handleInputChange}
                                placeholder='Size'
                                required
                                />
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text" 
                                name="color" 
                                onChange={handleInputChange}
                                placeholder='Color'
                                required
                                />
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text" 
                                name="quantity" 
                                onChange={handleInputChange}
                                placeholder='Quantity'
                                required
                                />
                        </>
                    )}
                    {getCategoryName(product.category_id) === "Books" && (
                        <>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text" 
                                name="author" 
                                onChange={handleInputChange}
                                placeholder='Author'
                                required
                                />
                        </>
                    )}
                    {getCategoryName(product.category_id) === "Electronics" && (
                        <>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text" 
                                name="brand" 
                                onChange={handleInputChange}
                                placeholder='Brand'
                                required
                                />
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text" 
                                name="model" 
                                onChange={handleInputChange}
                                placeholder='Model'
                                required
                                />
                        </>
                    )}
                    {getCategoryName(product.category_id) === "Toys" && (
                        <>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text" 
                                name="brand" 
                                onChange={handleInputChange}
                                placeholder='Brand'
                                required
                                />
                        </>
                    )}
                    {getCategoryName(product.category_id) === "Games" && (
                        <>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text" 
                                name="brand" 
                                onChange={handleInputChange}
                                placeholder='Brand'
                                required
                                />
                        </>
                    )}
                    <div className='flex flex-row gap-2 p-2'>
                        <button type='button' className='border-2 border-gray-300 w-[4em] rounded-lg font-semibold' onClick={handleCancel}>
                            Cancel
                        </button>
                        <button type="submit" className='border-2 border-gray-300 w-16 rounded-lg font-semibold'>
                            Upload
                        </button>
                    </div>
                </form>
            </div>
        </div>
     );
}
 
export default AddProduct;