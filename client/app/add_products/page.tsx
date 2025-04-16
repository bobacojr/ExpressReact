
"use client"
import React, { useEffect, useState } from 'react';
import axios from '../(components)/axiosConfig';
import { useRouter } from 'next/navigation';
import Navbar from '../(components)/navbar/page';
import withAuth from '../(components)/ProtectedRoute';
import { motion } from 'motion/react';

const AddProduct = () => {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isVisibleProducts, setIsVisibleProducts] = useState({});
    const [isVisibleVariants, setIsVisibleVariants] = useState({});
    const [product, setProduct] = useState<Product>({});

    useEffect(() => {
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
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get('http://localhost:8080/products', {
                    withCredentials: true
                });
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };
        fetchProducts();
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

        const formData = new FormData();
        if (product.title) formData.append("title", product.title);
        if (product.description) formData.append("description", product.description);
        if (product.price) formData.append("price", String(product.price)); // Stringify the price
        if (product.category_id) formData.append("category_id", String(product.category_id));
        if (product.size) formData.append("size", product.size); // Default to empty string if undefined
        if (product.color) formData.append("color", product.color);
        if (product.author) formData.append("author", product.author);
        if (product.brand) formData.append("brand", product.brand);
        if (product.model) formData.append("model", product.model);
        if (product.quantity) formData.append("quantity", String(product.quantity));

        if (product.image) {
            formData.append("image", product.image);
        }

        try {
            const res = await axios.post("http://localhost:8080/products", formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            if (res.status === 200) {
                setProduct({
                    title: "",
                    description: "",
                    price: 0.00,
                    image: "",
                    category_id: 0,
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
        const category = allCategoriesFlat.find((cat) => cat.id === category_id);
        return category ? category.name : null;
    };

    const handleSetCategory = async (categoryId: number) => {
        setProduct(prev => ({
            ...prev,
            category_id: categoryId
        }));
    };

    const handleCancel = async () => {
        router.push('/')
    };

    const toggleProducts = async (categoryId) => {
        setIsVisibleProducts(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };  

    const toggleVariants = async (productId) => {
        setIsVisibleVariants(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    const RenderCategory = ({ category, onSelectCategory }: { category: Category; onSelectCategory: (categoryId: number) => void }) => {
        const categoryProducts = products.filter((product) => product.category_id === category.id);

        return (
            <div className="flex flex-col border-l-2 pl-2 text-lg">
                <div className="flex flex-row gap-1 font-semibold cursor-pointer">
                    {isVisibleProducts[category.id] ? (
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="30px" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V5m0 14-4-4m4 4 4-4"/>
                            </svg>
                        </div>
                    ) : (
                        <div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="30px" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
                            </svg>
                        </div>
                    )}
                    <div onClick={() => toggleProducts(category.id)}>
                        {category.name}
                    </div>
                    <motion.span 
                        whileHover={{ scale: 1.1, borderColor: "#22c55e", color: "#22c55e"  }}
                        whileTap={{ scale: 0.9 }}
                        title={`Create new ${category.name} product`}
                        className='group'
                        onClick={() => onSelectCategory(category.id)}
                        >
                        <svg width="20px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="Edit / Add_Plus_Circle">
                                <path id="Vector" d="M8 12H12M12 12H16M12 12V16M12 12V8M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" className='text-black group-hover:text-[#22c55e] transition-colors duration-200' stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                        </svg>
                    </motion.span>
                </div>
                {categoryProducts.map((product) => (
                    <div key={product.id} className={isVisibleProducts[category.id] ? 'flex flex-row ml-4' : 'hidden'}>
                        {isVisibleVariants[product.id] ? (
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="30px" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19V5m0 14-4-4m4 4 4-4"/>
                                </svg>
                            </div>
                        ) : (
                            <div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="30px" viewBox="0 0 24 24">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
                                </svg>
                            </div>
                        )}
                        <span onClick={() => toggleVariants(product.id)} className='cursor-pointer'>
                            {product.title}
                            <div className='flex'>
                                {product.variants && product.variants.length > 0 && (
                                    <motion.div className={isVisibleVariants[product.id] ? 'flex flex-col ml-4' : 'hidden'}>
                                        {product.variants.map((variant) => (
                                            <div key={variant.variant_id} className='italic'>
                                                {product.title} - {variant.variant_color} - {variant.variant_size}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </span>
                        
                    </div>
                ))}
                <div>
                    {category.subcategories && category.subcategories.length > 0 && (
                        <div className="ml-2">
                            {category.subcategories.map((sub) => (
                                <RenderCategory key={sub.id} category={sub} onSelectCategory={handleSetCategory} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const flattenCategories = (categoryList: Category[], depth = 0): Category[] => {
        return categoryList.flatMap(category => {
            const subList = category.subcategories
                ? flattenCategories(category.subcategories, depth + 1) : [];

                return [{ ...category, depth }, ...subList];
        });
    };

    const allCategoriesFlat = flattenCategories(categories);

    return ( 
        <div className="flex w-full h-full justify-center">
            <div className="fixed top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            <div className='flex flex-col items-center mt-24 border-2 border-gray-300 p-1 rounded-lg'>
                <h1 className='flex text-2xl font-bold'>
                    Create New Product
                </h1>
                <form
                    className='flex flex-col gap-2 justify-center items-center'
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
                        placeholder='Price: 0.00'
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
                            {allCategoriesFlat.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                    </select>

                    {(getCategoryName(product.category_id) === "Clothes" ||
                     getCategoryName(product.category_id) === "Shirts" || 
                     getCategoryName(product.category_id) === "Pants") && (
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
                    {(getCategoryName(product.category_id) === "Toys" ||
                     getCategoryName(product.category_id) === "Games") && (
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
                    <input
                        className='border-2 border-gray-300 rounded-md pl-1 w-full'
                        type="text" 
                        name="quantity" 
                        onChange={handleInputChange}
                        placeholder='Quantity'
                        required
                        />
                    <div className='flex flex-row gap-2 p-2'>
                        <button type='button' className='border-2 border-gray-300 p-1 rounded-lg font-semibold' onClick={handleCancel}>
                            Cancel
                        </button>
                        <button type="submit" className='border-2 border-gray-300 p-1 rounded-lg font-semibold'>
                            Add
                        </button>
                    </div>
                </form>
            </div>
            <div className="ml-2 mt-24 flex w-1/2 border-2 border-gray-300 rounded-lg">
                <div className='flex flex-col p-4'>
                    <h1 className='flex  text-2xl font-bold mb-1'>
                        Existing Categories & Products
                    </h1>
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <RenderCategory key={cat.id} category={cat} onSelectCategory={handleSetCategory}/>
                            
                        ))
                    ) : (
                        <p>No categories or subcategories created.</p>
                    )}
                </div>
            </div>
        </div>
     );
}
 
export default withAuth(AddProduct);