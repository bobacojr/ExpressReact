"use client"
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import axios from "@/app/(components)/axiosConfig";
import Image from 'next/image';
import Navbar from '@/app/(components)/navbar/page';
import withAuth from '@/app/(components)/ProtectedRoute';

const EditProduct = () => {
    const params = useParams();
    const { product_id } = params;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    useEffect(() => {
        if (!product_id) return; // Ensure product_id is defined
        
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/products/${product_id}`, {
                    withCredentials: true,
                });
                const productData = res.data.data;
                setProduct(productData);
                if (productData.variants && productData.variants.length > 0) { // Default to first variant
                    setSelectedVariant(productData.variants[0])
                }
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                console.log("An error occurred whil attempting to fetch the product: ", error);
            }
        };
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
        if (!product) return;

        const formData = new FormData();
        formData.append("title", product.title);
        formData.append("description", product.description);
        formData.append("price", String(product.price));
        formData.append("category_id", String(product.category_id));
        formData.append("author", product.author || "");
        formData.append("brand", product.brand || "");
        formData.append("model", product.model || "");
        formData.append("quantity", product.quantity || "");

        if (product.image) {
            formData.append("image", product.image);
        }

        try {
            const res = await axios.put(`http://localhost:8080/products/${product_id}`, formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            if (res.status === 200) {
                router.push('/');
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Failed to update product:", error.response?.data);
            } else {
                console.error("Error submitting form:", error);
            }
        }
    };

    const handleDelete = async () => {
        try {
            const res = await axios.delete(`http://localhost:8080/products/${product_id}`, {
                withCredentials: true,
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

    const displayedImage = selectedVariant && selectedVariant.variant_image ? selectedVariant.variant_image : product?.image;

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
                    className='flex flex-col justify-center  border-2 border-gray-300 rounded-lg p-2 gap-1'
                    encType="multipart/form-data"
                    >
                    <input
                        className='border-2 border-gray-300 rounded-md'
                        type="file"
                        name="image"
                        onChange={handleFileChange}
                        />
                    {displayedImage && (
                        <div className='flex flex-col justify-center items-center'>
                            <p className='font-semibold'>Current Image:</p>
                            <Image
                                src={`http://localhost:8080/${displayedImage}`}
                                alt={product!.title}
                                width={280}
                                height={170}
                                className='rounded-lg p-1'
                                style={{ objectFit: "contain" }}
                                priority
                            />
                        </div>
                    )}
                    <div className='flex flex-row'>
                        <h1 className='font-semibold pr-1'>Title:</h1>
                        <input
                            className='border-2 border-gray-300 rounded-md pl-1 w-full'
                            type="text"
                            name="title"
                            placeholder="Product Title"
                            value={product!.title}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className='flex flex-row'>
                        <h1 className='font-semibold pr-1'>Description:</h1>
                        <input
                            className='border-2 border-gray-300 rounded-md pl-1 w-full'
                            type="text"
                            name="description"
                            placeholder="Product Description"
                            value={product!.description}
                            onChange={handleInputChange}
                            />
                    </div>
                    <div className='flex flex-row'>
                        <h1 className='font-semibold pr-1'>Price:</h1>
                        <input
                            className='border-2 border-gray-300 rounded-md pl-1 w-full'
                            type="text"
                            name="price"
                            value={Number(product!.price) || ""}
                            placeholder={'0.00'}
                            onChange={handleInputChange}
                            />
                    </div>
                    <div className='flex flex-row'>
                        <h1 className='font-semibold pr-1'>Category:</h1>
                        <select
                            className='border-2 border-gray-300 rounded-md pl-1 w-full'
                            name='category_id'
                            value={product!.category_id || ""}
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
                    </div>
                    <div className='flex flex-row'>
                        <h1 className='font-semibold pr-1'>Quantity:</h1>
                        <input
                            className='border-2 border-gray-300 rounded-md pl-1 w-full'
                            type="text"
                            name="quantity"
                            onChange={handleInputChange}
                            value={product!.quantity || ""}
                            required
                            />
                    </div>
                    {getCategoryName(product!.category_id) === "Clothes" && (
                        <>
                        <div className='flex flex-row'>
                            <h1 className='font-semibold pr-1'>Brand:</h1>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="brand"
                                onChange={handleInputChange}
                                value={product!.brand || ""}
                                required
                                />
                        </div>
                        <div className='flex flex-row'>
                            <h1 className='font-semibold pr-1'>Size:</h1>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="size"
                                onChange={handleInputChange}
                                value={product!.size || ""}
                                required
                                />
                        </div>
                        <div className='flex flex-row'>
                            <h1 className='font-semibold pr-1'>Color:</h1>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="color"
                                onChange={handleInputChange}
                                value={product!.color || ""}
                                required
                                />
                        </div>
                        </>
                    )}
                    {getCategoryName(product!.category_id) === "Books" && (
                        <>
                        <div className='flex flex-row'>
                            <h1 className='font-semibold pr-1'>Author:</h1>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="author"
                                onChange={handleInputChange}
                                value={product!.author || ""}
                                required
                                />
                        </div>                          
                        </>
                    )}
                    {getCategoryName(product!.category_id) === "Electronics" && (
                        <>
                        <div className='flex flex-row'>
                            <h1 className='font-semibold pr-1'>Brand:</h1>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="brand"
                                onChange={handleInputChange}
                                value={product!.brand || ""}
                                required
                                />
                        </div>
                        <div className='flex flex-row'>
                            <h1 className='font-semibold pr-1'>Model:</h1>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="model"
                                onChange={handleInputChange}
                                value={product!.model || ""}
                                required
                                />
                        </div>                                                       
                        </>
                    )}
                    {getCategoryName(product!.category_id) === "Toys" && (
                        <>
                        <div className='flex flex-row'>
                            <h1 className='font-semibold pr-1'>Brand:</h1>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="brand"
                                onChange={handleInputChange}
                                value={product!.brand || ""}
                                required
                                />
                        </div>
                        </>
                    )}
                    {getCategoryName(product!.category_id) === "Games" && (
                        <>
                        <div className='flex flex-row'>
                            <h1 className='font-semibold pr-1'>Brand:</h1>
                            <input
                                className='border-2 border-gray-300 rounded-md pl-1 w-full'
                                type="text"
                                name="brand"
                                onChange={handleInputChange}
                                value={product!.brand || ""}
                                required
                                />
                        </div>
                        </>
                    )}
                    <div className='flex flex-col gap-2 p-2 items-center'>
                        <button type='button' className='border-2 border-gray-300 p-1 rounded-lg font-semibold' onClick={handleCancel}>
                            Cancel Edit
                        </button>
                        <div className='flex flex-row gap-2'>
                            <button type="button" className='border-2 border-gray-300 p-1 rounded-lg font-semibold' onClick={() => setIsUpdateModalOpen(true)}>
                                Save Changes
                            </button>
                            <button type="button" className='border-2 border-gray-300 p-1 rounded-lg font-semibold' onClick={() => setIsDeleteModalOpen(true)}>
                                Delete Product
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default withAuth(EditProduct);