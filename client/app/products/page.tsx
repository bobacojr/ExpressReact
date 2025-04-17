"use client"
import React, { useEffect, useState, useRef, useCallback } from 'react';
import axios from '../(components)/axiosConfig';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import withAuth from '../(components)/ProtectedRoute';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '../(components)/context/CartContext';

const Products = ({ addingToCart, onAddingToCart, onClosePopup }: ProductsProps) => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]); // Used for fetching all products
    const [categories, setCategories] = useState<Category[]>([]); // Used for fetching all categories
    const [currentCategory, setCurrentCategory] = useState('All'); // Default search filter is All
    const [isProductAdded, setIsProductAdded] = useState(false); // Used for tracking if a product has been added to the users cart
    const [userRole, setUserRole] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Used to display the selected product
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const slidingMenuRef = useRef<HTMLDivElement>(null); // Ref for the add-to-cart sliding menu

    /* Product variants */
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const [availableQuantity, setAvailableQuantity] = useState<number>(0);

    /* Colors */
    const colorMap: Record<string, string> = {
        "velvet red": "#9c0000",
        "gray": "#808080",
        "railroad gray": "#9d9d9d",
        "xavier blue": "#21304E",
        "white": "#FFFFFF",
        "black": "#000000",
    };

    function getMappedColor(color: string): string {
        const colorString = color.toLowerCase().trim();

        return colorMap[colorString] || colorString.replace(/\s+/g, '');
    }

    const { fetchCart } = useCart();

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

    /* Handles closing out of the sliding menu */
    useEffect(() => {
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

    /* Fetch products and categories for landing page */
    useEffect(() => {
        console.log("Fetching all products...");
        // Fetch all products
        const fetchAllProducts = async () => {
            try {
                const res = await axios.get("http://localhost:8080/products", {
                    params: { category_id: currentCategory === "All" ? null : currentCategory },
                    withCredentials: true,
                });
                const productData = res.data;
                setProducts(productData);

                if (productData.variants && productData.variants.length > 0) { // Default to first variant
                    setSelectedVariant(productData.variants[0]);
                }

                setFilteredProducts(productData);
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

    /* Filtering products */
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

    /* Add a product/variant to the cart */
    const addToCart = async () => {
        if (!selectedProduct) return;

        try {
            const payload = {
                product_id: selectedProduct.id,
                variant_id: selectedVariant ? selectedVariant.variant_id : null,
                variant_image: displayedImage,
                variant_color: selectedVariant ? selectedVariant.variant_color : null,
                variant_size: selectedVariant ? selectedVariant.variant_size : null,
                variant_quantity: availableQuantity,
                variant_price: displayedPrice,
                quantity: quantity
            };
            await axios.post('http://localhost:8080/cart/add', payload, {
                withCredentials: true,
            });

            setIsProductAdded(true);
            fetchCart();
        } catch (error) { // Will need to look into these error messages
            console.error("Failed to add to cart:",  error);
        }
    };

    /* Fetch the product's available quantity */
    const getAvailableQuantity = useCallback(async () => {
        if (!selectedProduct) return;

        try {
            const res = await axios.get(`http://localhost:8080/products/${selectedProduct.id}/quantity_check`, {
                params: {
                    variant_id: selectedVariant?.variant_id ?? null
                },
                withCredentials: true
            });

            setAvailableQuantity(res.data.available_quantity);
        } catch (error) {
            console.error("Failed to fetch available quantity:", error);
            setAvailableQuantity(0);
        }
    }, [selectedProduct, selectedVariant?.variant_id]);

    useEffect(() => {
        getAvailableQuantity();
    }, [getAvailableQuantity]);

    /* Set defaults for variants */
    useEffect(() => {
        if (selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0) {
            const uniqueColors = [... new Set(selectedProduct.variants.map((v) => v.variant_color))];
            const defaultColor = uniqueColors[0];
            const defaultSize = "S";

            setSelectedColor(defaultColor ?? null);
            setSelectedSize(defaultSize);

            const defaultVariant = selectedProduct.variants.find((v) => v.variant_color === defaultColor && v.variant_size?.toLowerCase() === defaultSize);
            setSelectedVariant(defaultVariant ?? null);
        }
    }, [selectedProduct]);

    useEffect(() => {
        if (!selectedProduct?.variants || selectedProduct.variants.length === 0 || !selectedColor || !selectedSize) return;
        {
            const variant = selectedProduct.variants.find((v) => 
                v.variant_color?.toLowerCase() === selectedColor.toLocaleLowerCase() &&
                v.variant_size?.toLowerCase() === selectedSize.toLowerCase()
            );
            setSelectedVariant(variant || null);
        }
    }, [selectedColor, selectedSize, selectedProduct?.variants]);

    const handleEditClick = (product_id: number) => {
        console.log("Moving to edit product page");
        router.push(`/edit_product/${product_id}`);
    };

    const handleAddingToCart = async (product: Product) => {
        setSelectedProduct(product);
        setSelectedVariant(null);
        setSelectedColor(null);
        setSelectedSize(null);
        onAddingToCart();
    };

    const handleViewCart = async () => {
        console.log("Moving to show_cart page");
        router.push('/show_cart');
    }

    const displayedImage = selectedVariant && selectedVariant.variant_image ? selectedVariant.variant_image : selectedProduct?.image;
    const displayedPrice = selectedVariant && selectedVariant.variant_price ? selectedVariant.variant_price : selectedProduct?.price;

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
                                            className='rounded-2xl pt-2' 
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
                            
                            <div className='flex flex-row gap-2'>
                                {userRole === 'admin' && (
                                    <motion.button 
                                        className='flex justify-center items-center border-2 border-gray-300 p-2 font-semibold rounded-xl mt-3 mb-3'
                                        onClick={() => handleEditClick(product.id)}
                                        whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e" }}
                                        whileTap={{ scale: 0.9 }}
                                        >
                                        Edit
                                    </motion.button>
                                )}
                                <motion.button 
                                    className='flex justify-center items-center border-2 border-gray-300 p-2 rounded-xl font-semibold mt-3 mb-3'
                                    onClick={() => handleAddingToCart(product)}
                                    whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e" }}
                                    whileTap={{ scale: 0.9 }}
                                    >
                                    Add to Cart
                                </motion.button>
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
                                            src={`http://localhost:8080/${displayedImage}`}
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
                                        <span className='text-sm italic'>
                                            {selectedProduct.brand}
                                        </span>
                                        <span className=' text-sm italic'>
                                            {selectedProduct.author}
                                        </span>
                                        <span className='text-red-500 font-semibold'>
                                            ${displayedPrice}
                                        </span>
                                    </div>
                                </div>

                                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                                    <div className="mt-4">
                                        <span className='flex'>
                                            Color: {selectedColor}
                                        </span>
                                        <div className='flex gap-2'>
                                            {[... new Set(selectedProduct.variants.map((v) => v.variant_color))].sort((a, b) => a!.localeCompare(b!)).map((colorValue) => (
                                                <button
                                                    key={colorValue}
                                                    onClick={() => {
                                                        setSelectedColor(colorValue!);
                                                    }}
                                                        
                                                    className={`w-10 h-10 rounded ${selectedColor === colorValue ? 'border-2 border-blue-500' : 'border border-gray-400'}`}
                                                    style={{ backgroundColor: getMappedColor(colorValue!) }}
                                                    title={`Color: ${colorValue}`}
                                                    >
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedColor && (
                                    <div className="mt-4">
                                        <span className='flex'>
                                            Size: {selectedSize}
                                        </span>
                                        <div className="flex gap-2">
                                            {[...new Set(selectedProduct.variants!
                                                .filter((v) => v.variant_color === selectedColor)
                                                .map((v) => v.variant_size))]
                                                .sort((a, b) => {
                                                    const sizeOrder = ['s', 'm', 'l', 'xl', 'xxl'];
                                                    const aLower = a?.toLowerCase();
                                                    const bLower = b?.toLowerCase();
                                                    return sizeOrder.indexOf(aLower!) - sizeOrder.indexOf(bLower!);
                                                })
                                                .map((sizeValue) => (
                                                    <button
                                                        key={sizeValue}
                                                        onClick={() => {
                                                            setSelectedSize(sizeValue!);
                                                        }}

                                                        className={`w-10 h-10 rounded ${selectedSize === sizeValue ? 'text-blue-500 border border-blue-500' : 'text-gray-600 border border-gray-400'}`}
                                                        >
                                                    {(sizeValue || "N/A").toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    )}

                                <div className='flex flex-col justify-center items-center mt-6'>
                                    {isProductAdded ? (
                                        <div className='flex flex-col w-full justify-center items-center gap-3'>
                                            <motion.button
                                                className='border-2 w-11/12 p-2 border-gray-300  text-gray-500 rounded-2xl font-semibold'
                                                onClick={() => { onClosePopup(); setIsProductAdded(false) }}
                                                whileHover={{ scale: 1.06, borderColor: "#ef4444", color: "#ef4444"  }}
                                                whileTap={{ scale: 0.9 }}
                                                initial={{ opacity: 0, x: '110%' }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                >
                                                Continue Shopping
                                            </motion.button>
                                            <motion.button
                                                className='border-2 w-11/12 p-2 border-gray-300  text-gray-500 rounded-2xl font-semibold'
                                                onClick={handleViewCart}
                                                whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e"  }}
                                                whileTap={{ scale: 0.9 }}
                                                initial={{ opacity: 0, x: '110%' }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                >
                                                View Cart & Checkout
                                            </motion.button>
                                        </div>
                                    ) : (
                                        availableQuantity > 0 ? (
                                            <div className='flex flex-col w-full  sm:justify-normal gap-6'>
                                                <div className='flex flex-row items-center gap-1'>
                                                    <select
                                                        className='border-2 border-gray-300 p-2 rounded-2xl'
                                                        value={quantity}
                                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                                        >
                                                        {[...Array(Math.max(Number(availableQuantity), 0)).keys()].map((num) => (
                                                            <option key={num + 1} value={num + 1}>
                                                                Quantity: {num + 1}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className='flex flex-row text-orange-500 font-semibold'>
                                                        <p>Only {availableQuantity} left!</p>
                                                    </div>
                                                </div>
                                                <div className='flex justify-center'>
                                                    <motion.button
                                                        className='border-2 w-11/12 p-2 border-gray-300  text-gray-500 rounded-2xl font-semibold items-center'
                                                        onClick={() => addToCart()}
                                                        whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e"  }}
                                                        whileTap={{ scale: 0.9 }}
                                                        >
                                                        Add to Cart
                                                    </motion.button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                Out of stock, please check back later
                                            </div>
                                        )
                                    
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

export default withAuth<ProductsProps>(Products);