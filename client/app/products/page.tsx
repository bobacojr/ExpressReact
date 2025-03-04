"use client"
import React, { useEffect, useState, useRef } from 'react';
import axios from '../(components)/axiosConfig';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import withAuth from '../(components)/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { filter } from 'motion/react-client';

const Products = ({ addingToCart, onAddingToCart, onClosePopup }: ProductsProps) => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]); // Used for fetching all products
    const [categories, setCategories] = useState<Category[]>([]); // Used for fetching all categories
    const [currentCategory, setCurrentCategory] = useState('All'); // Default search filter is All
    const [isProductAdded, setIsProductAdded] = useState(false); // Used for tracking if a product has been added to the users cart
    const [userRole, setUserRole] = useState<string | null>(null);
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Used to display the selected product
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const slidingMenuRef = useRef<HTMLDivElement>(null); // Ref for the add-to-cart sliding menu

    const fetchUserRole = async () => {
        try {
            const res = await axios.get('http://localhost:8080/auth/me', {
                withCredentials: true
            });
            return res.data.user.role;
        } catch (error) {
            console.error("Failed to fetch user role:", error);
            return null;
        }
    };

    useEffect(() => {
        const getUserRole = async () => {
            const role = await fetchUserRole();
            setUserRole(role);
        };
        getUserRole();
    }, []);

    useEffect(() => { // Close the sliding menu when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (slidingMenuRef.current && !slidingMenuRef.current.contains(event.target as Node)) {
                onClosePopup(); // Close the sliding menu
                setSelectedProduct(null); // Clear the selected product
                setIsProductAdded(false); // Product has not been added to the cart
            }
        };
        // Attach the event listener
        document.addEventListener('mousedown', handleClickOutside);
        // Clean up the event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClosePopup]); 

    useEffect(() => {
        // Fetch all products
        const fetchAllProducts = async () => {
            try {
                const res = await axios.get("http://localhost:8080/products", {
                    params: { category_id: currentCategory === "All" ? null : currentCategory },
                    withCredentials: true,
                });
                setProducts(res.data);
                setFilteredProducts(res.data);
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

    useEffect(() => {
        const filtered = products.filter((product) => {
            const category = categories.find((cat) => cat.id === product.category_id);
            const categoryName = category ? category.name.toLowerCase() : '';
            return (
                product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                categoryName.includes(searchQuery.toLowerCase())
            );
        });
        setFilteredProducts(filtered);
    }, [searchQuery, products, categories]);

    // Add product to cart
    const addToCart = async (product_id: number) => {
        try {
            const quantity = 1; // Will need to implement choosing a specific quantity
            const res = await axios.post("http://localhost:8080/cart/add", 
                { product_id: product_id, quantity: quantity },
                { withCredentials: true },
            );
            setIsProductAdded(true)
        } catch (error: any) { // Will need to look into these error messages
            console.error("Failed to add to cart:", error.response?.data || error.message);
            alert(`Failed to add to cart: ${error.response?.data?.message || error.message}`);
        }
    };

    const handleEditClick = (product_id: number) => {
        console.log("Moving to edit product page");
        router.push(`/edit_product/${product_id}`);
    };

    const handleAddingToCart = async (product: Product) => {
        setSelectedProduct(product);
        onAddingToCart();
    };

    const handleViewCart = async () => {
        console.log("Moving to show_cart page");
        router.push('/show_cart');
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
                <input
                    type='text'
                    placeholder='Search...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='border-2 border-gray-300 rounded-lg p-2 mb-4 w-full max-w-lg'
                    />
                <div className='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-[17em] sm:w-full'>
                    {filteredProducts.map((product) => (
                        <div key={product.id} className='flex flex-col w-full border-2 items-center border-gray-300 rounded-lg'>
                            <Link href={`/show_product/${product.id}`} className='w-full'>
                                <div className='w-full relative h-52'>
                                    {product.image && 
                                        <Image src={`http://localhost:8080/${product.image}`} 
                                            fill 
                                            alt={product.title} 
                                            sizes='(max-width: 200px)' 
                                            priority 
                                            className='rounded-lg p-1' 
                                            style={{objectFit: "contain"}}
                                            />
                                    }
                                </div>
                            </Link>
                            <h1 className='flex justify-center items-center'>
                                {product.title}
                            </h1>
                            <h1 className='text-center text-sm font-semibold'>
                                Price: ${product.price}
                            </h1>
                            <p className='flex items-center overflow-hidden text-wrap whitespace-normal break-word h-16 w-full text-center justify-center'>
                                {product.description}
                            </p>
                            <div className='flex flex-row'>
                                {userRole === 'admin' && (
                                    <button 
                                        className='flex justify-center items-center border-2 border-gray-300 p-1 pr-2 pl-2 rounded-lg m-1'
                                        onClick={() => handleEditClick(product.id)}
                                        >
                                        Edit
                                    </button>
                                )}
                                <button 
                                    className='flex justify-center items-center border-2 border-gray-300 p-1 pr-2 pl-2 rounded-lg m-1'
                                    onClick={() => handleAddingToCart(product)}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {addingToCart && (
                    <motion.div
                        ref={slidingMenuRef}
                        className='flex fixed right-0 top-0 w-full xs:w-[24em] h-full border-l-2 border-gray-300 bg-white z-20'
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }} 
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                    >
                        {selectedProduct && (
                            <div className='flex flex-col w-full h-full p-2'>
                                <div className='flex w-full flex-row items-center justify-between border-b-2 border-gray-300'>
                                    {isProductAdded ? (
                                        <AnimatePresence>
                                            <div className='flex flex-row items-center pb-3 pt-1 gap-2'>
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
                                        <span className='text-2xl tracking-wider font-semibold pb-3 pt-1'>
                                            Choose Options
                                        </span>
                                    )}
                                    <motion.div 
                                        className='relative w-[26px] h-[26px] flex items-center justify-center cursor-pointer z-20 group'
                                        onClick={() => { onClosePopup(); setIsProductAdded(false) }}
                                        >
                                        <motion.span className='absolute w-[26px] h-[4px] rounded-[12px] border border-black bg-black transform rotate-45 group-hover:bg-red-500 group-hover:border-red-500 transition-colors duration-200' />
                                        <motion.span className='absolute w-[26px] h-[4px] rounded-[12px] border border-black bg-black transform -rotate-45 group-hover:bg-red-500 group-hover:border-red-500 transition-colors duration-200' />
                                    </motion.div>
                                </div>
                                <div className='flex flex-row w-full pt-2'>
                                    <div className='w-44 h-44 xs:w-48 xs:h-48 relative flex-shrink-0'>
                                        <Image 
                                            src={`http://localhost:8080/${selectedProduct.image}`}
                                            fill
                                            alt={selectedProduct.title}
                                            sizes='(max-width: 100px)'
                                            className='rounded-lg'
                                            style={{ objectFit: 'contain' }}
                                        />
                                    </div>
                                    <div className='flex w-full h-full flex-col pl-2'>
                                        <span className='text-lg font-semibold'>
                                            {selectedProduct.title}
                                        </span>
                                        <span className='text-sm italic pb-2'>
                                            {selectedProduct.brand}
                                        </span>
                                        <span className='text-md text-gray-500 text-wrap overflow-wrap break-word whitespace-normal w-full max-h-[6em]'>
                                            {selectedProduct.description}
                                        </span>
                                        <span className='text-red-500 font-semibold'>
                                            ${selectedProduct.price}
                                        </span>
                                    </div>
                                </div>

                                <div className='flex flex-col justify-center items-center mt-6'>
                                    {isProductAdded ? (
                                        <div className='flex flex-col w-full justify-center items-center gap-3'>
                                            <motion.button
                                                className='border-2 w-11/12 p-2 border-gray-300  text-gray-500 rounded-2xl font-semibold'
                                                onClick={() => { onClosePopup(); setIsProductAdded(false) }}
                                                whileHover={{ scale: 1.06, borderColor: "#ef4444", color: "#ef4444"  }}
                                                whileTap={{ scale: 0.9 }}
                                                >
                                                Continue Shopping
                                            </motion.button>
                                            <motion.button
                                                className='border-2 w-11/12 p-2 border-gray-300  text-gray-500 rounded-2xl font-semibold'
                                                onClick={handleViewCart}
                                                whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e"  }}
                                                whileTap={{ scale: 0.9 }}
                                                >
                                                View Cart & Checkout
                                            </motion.button>
                                        </div>
                                    ) : (
                                    <motion.button
                                        className='border-2 w-11/12 p-2 border-gray-300  text-gray-500 rounded-2xl font-semibold'
                                        onClick={() => addToCart(selectedProduct.id)}
                                        whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e"  }}
                                        whileTap={{ scale: 0.9 }}
                                        >
                                        Add to Cart
                                    </motion.button>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            
        </div>
    );
}

export default withAuth(Products);