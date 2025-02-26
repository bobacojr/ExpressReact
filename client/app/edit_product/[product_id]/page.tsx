"use client"
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Navbar from '@/app/(components)/navbar/page';

interface Category {
    id: number;
    name: string;
}

const EditProduct = () => {
    const params = useParams();
    const { product_id } = params;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [product, setProduct] = useState({
        title: "",
        description: "",
        image: null as File | null,
        price: "" as string | number,
        existingImage: "",
        category_id: null as number | null,
        size: "",
        color: "",
        author: "",
        brand: "",
        model: "",
        quantity: ""
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    useEffect(() => {
        if (!product_id) return; // Ensure product_id is defined
        
        const fetchProduct = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("No token found, please log in");
                return;
            }
            try {
                const res = await axios.get(`http://localhost:8080/products/${product_id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                });
                const productData = res.data.data[0];
                setProduct({
                    title: productData.title,
                    description: productData.description,
                    price: productData.price,
                    image: null,
                    existingImage: productData.image,
                    category_id: productData.category_id,
                    size: productData.size,
                    color: productData.color,
                    author: productData.author,
                    brand: productData.brand,
                    model: productData.model,
                    quantity: productData.quantity
                });
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
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
        fetchProduct();
        fetchCategories();
    }, [product_id]);

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
            [name]: value,
        }));
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("No token found, please log in");
            return;
        }

        const formData = new FormData();
        formData.append("title", product.title);
        formData.append("description", product.description);
        formData.append("price", String(product.price));
        formData.append("category_id", String(product.category_id));
        formData.append("size", product.size || "");
        formData.append("color", product.color || "");
        formData.append("author", product.author || "");
        formData.append("brand", product.brand || "");
        formData.append("model", product.model || "");
        formData.append("quantity", product.quantity || "");
        if (product.image) {
            formData.append("image", product.image);
        }
        try {
            const res = await axios.put(`http://localhost:8080/products/${product_id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}` // Add token for user auth
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

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log("No token found, please log in");
            return;
        }

        try {
            const res = await axios.delete(`http://localhost:8080/products/${product_id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            });
            if (res.status === 200) {
                router.push('/');
            }
        } catch (error) {
            console.error("Failed to delete product:", error);
        }
    };

    const handleCancel = async () => {
        router.push('/');
    };

    const getCategoryName = (category_id: number | null) => {
        const category = categories.find((cat) => cat.id === category_id);
        return category ? category.name : null;
    };

    const DeleteModal = () => {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md mx-auto">
                    <h2 className="text-lg font-semibold mb-4">
                        Are you sure you want to delete this product?
                    </h2>
                    <div className="flex justify-end gap-4">
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            onClick={() => { handleDelete(); setIsDeleteModalOpen(false); }}
                        >
                            Yes
                        </button>
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const UpdateModal = () => {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md mx-auto">
                    <h2 className="text-lg font-semibold mb-4">
                        Are you sure you want to update this product?
                    </h2>
                    <div className="flex justify-end gap-4">
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            onClick={() => { handleSubmit(); setIsUpdateModalOpen(false); }}
                        >
                            Yes
                        </button>
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            onClick={() => setIsUpdateModalOpen(false)}
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex w-full h-full">
            <div className="fixed top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            {isDeleteModalOpen && <DeleteModal />}
            {isUpdateModalOpen && <UpdateModal />}
            <div className='flex flex-col justify-center items-center w-full mt-24'>
                <h1 className='flex text-3xl font-bold'>
                    Edit Product
                </h1>
                <form
                    className='flex flex-col gap-2 justify-center items-center border-2 border-red-600'
                    encType="multipart/form-data"
                >
                    <input
                        className='border-2 border-gray-300 rounded-md'
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                    />
                    {product.existingImage && (
                        <div className='flex flex-col justify-center items-center'>
                            <p>Current Image</p>
                            <Image
                                src={`http://localhost:8080/${product.existingImage}`}
                                alt={product.title}
                                width={280}
                                height={170}
                                className='rounded-lg p-1'
                                style={{ objectFit: "contain" }}
                                priority
                            />
                        </div>
                    )}
                    <input
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text"
                        name="title"
                        placeholder="Product Title"
                        value={product.title}
                        onChange={handleInputChange}
                    />
                    <input
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text"
                        name="description"
                        placeholder="Product Description"
                        value={product.description}
                        onChange={handleInputChange}
                    />
                    <input
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text"
                        name="price"
                        value={Number(product.price) || ""}
                        placeholder={'0.00'}
                        onChange={handleInputChange}
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
                                value={product.brand || ""}
                                required
                            />
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="size"
                                onChange={handleInputChange}
                                value={product.size || ""}
                                required
                            />
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="color"
                                onChange={handleInputChange}
                                value={product.color || ""}
                                required
                            />
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="quantity"
                                onChange={handleInputChange}
                                value={product.quantity || ""}
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
                                value={product.author || ""}
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
                                value={product.brand || ""}
                                required
                            />
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="model"
                                onChange={handleInputChange}
                                value={product.model || ""}
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
                                value={product.brand || ""}
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
                                value={product.brand || ""}
                                required
                            />
                        </>
                    )}
                    <div className='flex flex-col gap-2 p-2 items-center'>
                        <button type='button' className='border-2 border-gray-300 w-[6em] rounded-lg font-semibold' onClick={handleCancel}>
                            Cancel Edit
                        </button>
                        <div className='flex flex-row gap-2'>
                            <button type="button" className='border-2 border-gray-300 w-[7em] rounded-lg font-semibold' onClick={() => setIsUpdateModalOpen(true)}>
                                Save Changes
                            </button>
                            <button type="button" className='border-2 border-gray-300 w-[8em] rounded-lg font-semibold' onClick={() => setIsDeleteModalOpen(true)}>
                                Delete Product
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;