"use client"

import React, { useEffect, useState, useCallback } from 'react';
import withAuth from '@/app/(components)/ProtectedRoute';
import axios from "@/app/(components)/axiosConfig";
import Navbar from '@/app/(components)/navbar/page';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from "motion/react";
import { useCart } from '@/app/(components)/context/CartContext';

const ShowProduct = () => {
    const router = useRouter();
    const params = useParams();
    const { product_id } = params;
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isProductAdded, setIsProductAdded] = useState(false);
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [isSpecificationOpen, setIsSpecificationOpen] = useState(false);
    const [isReviewsOpen, setIsReviewsOpen] = useState(false);

    const { fetchCart } = useCart();

    const [metadata, setMetadata] = useState<{ [key: string]: string }>({});

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
        if (!color) return "";
        const colorString = color.toLowerCase().trim();

        return colorMap[colorString] || colorString.replace(/\s+/g, '');
    }

    const toggleDescription = () => {
        setIsDescriptionOpen(!isDescriptionOpen);
    };

    const toggleSpecification = () => {
        setIsSpecificationOpen(!isSpecificationOpen);
    };

    const toggleReviews = () => {
        setIsReviewsOpen(!isReviewsOpen);
    }

    useEffect(() => {
        if (!product_id) return;

        const fetchProduct = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/products/${product_id}`, {
                    withCredentials: true
                });
                const productData = res.data.data;
                setProduct(productData);



                if (productData.variants && productData.variants.length > 0) { // Default to first variant
                    setSelectedVariant(productData.variants[0]);
                }
                
                setIsLoading(false);
            } catch (error) {
                console.log("Failed to fetch product: ", error);
                setIsLoading(false);
            }
        }
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

    /* Set defaults */
    useEffect(() => {
        if (product && product.variants && product.variants.length > 0) {
            const uniqueColors = [... new Set(product.variants.map((v) => v.variant_color))].sort((a, b) => a.localeCompare(b));
            const defaultColor = uniqueColors[0];
            const defaultSize = "S";

            setSelectedColor(defaultColor ?? null);
            setSelectedSize(defaultSize);

            const defaultVariant = product.variants.find((v) => v.variant_color === defaultColor && v.variant_size?.toLowerCase() === defaultSize);
            setSelectedVariant(defaultVariant ?? null);
        }
    }, [product]);

    useEffect(() => {
        if (!product?.variants || product.variants.length === 0 || !selectedColor) return;
    
        let variant: Variant | undefined;
    
        if (selectedSize) {
            // Try to find a variant with both color and size
            variant = product.variants.find(
                (v) =>
                    v.variant_color?.toLowerCase() === selectedColor.toLowerCase() &&
                    v.variant_size?.toLowerCase() === selectedSize.toLowerCase()
            );
        }
    
        if (!variant) {
            // Fallback to color only (for controllers, etc.)
            variant = product.variants.find(
                (v) => v.variant_color?.toLowerCase() === selectedColor.toLowerCase()
            );
        }
    
        setSelectedVariant(variant || null);
    }, [selectedColor, selectedSize, product?.variants]);    

    const normalizeMetadataKeys = (data: Record<string, string>) => {
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key.toLowerCase(), value])
        );
    };      

    useEffect(() => {
        // Fallback order:
        // 1. If variant metadata exists, use it
        // 2. Else if product metadata exists, use that
        // 3. Else, empty object
        try {
            if (selectedVariant?.variant_metadata) {
                const raw = typeof selectedVariant.variant_metadata === "string"
                    ? JSON.parse(selectedVariant.variant_metadata || "{}")
                    : selectedVariant.variant_metadata;
            
                setMetadata(normalizeMetadataKeys(raw));
                } else if (product?.metadata) {
                    const raw = typeof product.metadata === "string"
                        ? JSON.parse(product.metadata || "{}")
                        : product.metadata;
            
                    setMetadata(normalizeMetadataKeys(raw));
                } else {
                    setMetadata({});
                }
            } catch (error) {
                console.warn("Failed to parse metadata:", error);
                setMetadata({});
            }
        }, [selectedVariant, product]);      

    const handleAddToCart = async () => {
        if (!product) return;

        try {
            const payload = {
                product_id: product.id,
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
        } catch (error) {
            console.error("Failed to add product to cart:", error);
            alert("Failed to add product to cart. Please try again.");
        }
    }

    /* Fetch the product's available quantity */
    const getAvailableQuantity = useCallback(async () => {
        if (!product) return;

        try {
            const res = await axios.get(`http://localhost:8080/products/${product.id}/quantity_check`, {
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
    }, [product, selectedVariant?.variant_id]);

    useEffect(() => {
        getAvailableQuantity();
    }, [getAvailableQuantity]);

    const handleContinueShopping = async () => {
        router.push('/');
    }

    const handleViewCart = async () => {
        router.push('/show_cart');
    }

    const displayedImage = selectedVariant && selectedVariant.variant_image ? selectedVariant.variant_image : product?.image;
    const displayedPrice = selectedVariant && selectedVariant.variant_price ? selectedVariant.variant_price : product?.price;

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!product) {
        return <div>Product not found</div>;
    }

    return ( 
        <div className="flex w-screen h-screen overflow-x-hidden">
            <div className="fixed top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            <div className='flex flex-col mb-36 sm:items-center w-full h-full mt-24 p-1'>
            {isProductAdded ? (
                        <AnimatePresence>
                            <div className='flex flex-row items-center justify-center gap-2'>
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
                        <div className='flex text-xl sm:text-2xl tracking-wider font-semibold justify-center items-center'>
                            Selected Product
                        </div>
                    )}
                <div className='flex flex-col w-full h-auto sm:w-3/4 max-w-[76em] md:flex-row rounded-lg p-4 gap-1 border-2 border-gray-500'>
                    {displayedImage && (
                        <div className='flex flex-col w-full justify-center items-center'>
                            <Image
                                src={`http://localhost:8080/${displayedImage}`}
                                alt={product.title}
                                width={600}
                                height={360}
                                className='rounded-lg p-1'
                                priority
                            />
                        </div>
                    )}
                    <div className='flex flex-col w-full items-center sm:items-start'>
                        <>
                            <div className='flex flex-row'>
                                <p className='text-lg font-semibold'>{product.title}</p>
                            </div>
                            <div className='flex flex-row text-sm italic'>
                                <p>{product.brand}</p>
                            </div>
                            <div className='flex flex-row text-sm italic'>
                                <p>{product.author}</p>
                            </div>
                            <div className='flex flex-row text-red-500 font-semibold'>
                                <p>${displayedPrice}</p>
                            </div>
                        </>
                        {product.variants && product.variants.length > 0 && (
                            <div className="mt-4">
                                <span className='flex justify-center sm:justify-normal'>
                                    Color: {selectedColor}
                                </span>
                                <div className='flex gap-2'>
                                    {[... new Set(product.variants.map((v) => v.variant_color))].sort((a, b) => a!.localeCompare(b!)).map((colorValue) => (
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
                                <span className='flex justify-center sm:justify-normal'>
                                    Size: {selectedSize}
                                </span>
                                <div className="flex gap-2">
                                    {
                                    [...new Set(product.variants!.filter((v) => v.variant_color === selectedColor).map((v) => v.variant_size))
                                        ].map((sizeValue) => (
                                            <button
                                                key={sizeValue}
                                                onClick={() => {
                                                    setSelectedSize(sizeValue!);
                                                }}

                                                className={`w-10 h-10 rounded ${selectedSize === sizeValue ? 'text-blue-500 border border-blue-500' : 'text-gray-600 border border-gray-400'}`}
                                                >
                                            {(sizeValue || "").toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className='flex flex-row text-orange-500 font-semibold'>
                            <p>Only {availableQuantity} more available!</p>
                        </div>
                        <div className='flex flex-col w-full justify-end mt-auto'>
                            {isProductAdded ? (
                                <div className='flex flex-col w-full justify-center items-center mt-6 gap-6'>
                                    <motion.button
                                        className='border-2 w-11/12 p-2 border-gray-300  text-gray-500 rounded-2xl font-semibold'
                                        whileHover={{ scale: 1.06, borderColor: "#ef4444", color: "#ef4444"  }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleContinueShopping}
                                        >
                                        Continue Shopping
                                    </motion.button>
                                    <motion.button
                                        className='border-2 w-11/12 p-2 border-gray-300 text-gray-500 rounded-2xl font-semibold'
                                        whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e"  }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleViewCart}
                                        >
                                        View Cart & Checkout
                                    </motion.button>
                                </div>
                            ) : (
                                availableQuantity > 0 ? (
                                    <div className='flex flex-row w-full items-center justify-center sm:justify-normal mt-6 gap-6'>
                                        <div className='flex border-2 border-gray-300 p-2 rounded-2xl'>
                                            <select
                                                value={quantity}
                                                onChange={(e) => setQuantity(Number(e.target.value))}
                                                >
                                                {[...Array(Math.max(Number(availableQuantity), 0)).keys()].map((num) => (
                                                    <option key={num + 1} value={num + 1}>
                                                        Quantity: {num + 1}
                                                    </option>
                                                ))}

                                            </select>
                                        </div>
                                        <motion.button
                                            className='border-2 w-full max-w-80 p-2 border-gray-300 text-gray-500 rounded-2xl font-semibold'
                                            whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e"  }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleAddToCart}
                                            >
                                            Add to Cart
                                        </motion.button>
                                    </div>
                                ) : (
                                    <div>
                                        Out of stock, please check back later
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
                <span className='flex flex-col font-semibold items-center text-xl sm:text-2xl mt-6'>
                    Additional Details
                </span>
                <div className='flex flex-col w-full sm:w-3/4 border-2 border-gray-500 rounded-lg pl-3 pr-3'>
                    <div className='flex w-full h-10 font-semibold text-xl sm:text-xl justify-between items-center border-b-2 border-gray-300 p-6'>
                        <span>
                            Description
                        </span>
                        <motion.svg
                            initial={{ rotate: 0 }}
                            animate={{ rotate: isDescriptionOpen ? -180 : 0 }}
                            transition={{ duration: 0.2 }}
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 100 100" 
                            width="24" 
                            height="24" 
                            className='stroke-black stroke-[10px] fill-none mr-4 cursor-pointer'
                            onClick={toggleDescription}
                            >
                            <path d="M10,40 L50,80 L90,40" />
                        </motion.svg>
                    </div>
                    <AnimatePresence>
                        {isDescriptionOpen && (
                            <motion.div className='flex flex-col justify-center w-full border-b-2 border-gray-300 pl-6'
                                key='description'
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 80, opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                >
                                    {product.description}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className='flex w-full h-10 font-semibold text-xl sm:text-xl justify-between items-center border-b-2 border-gray-300 p-6'>
                        <span>
                            Specifications
                        </span>
                        <motion.svg
                            initial={{ rotate: 0 }}
                            animate={{ rotate: isSpecificationOpen ? -180 : 0 }}
                            transition={{ duration: 0.2 }}
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 100 100" 
                            width="24" 
                            height="24" 
                            className='stroke-black stroke-[10px] fill-none mr-4 cursor-pointer'
                            onClick={toggleSpecification}
                            >
                            <path d="M10,40 L50,80 L90,40" />
                        </motion.svg>
                    </div>
                    <AnimatePresence>
                        {isSpecificationOpen && (
                            <motion.div className='flex flex-col justify-center w-full border-b-2 border-gray-300 pl-6'
                                key='specifications'
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 80, opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                >
                                    Enter text here...
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className='flex w-full h-10 font-semibold text-xl sm:text-xl justify-between items-center border-b-2 border-gray-300 p-6'>
                        <span>
                            Reviews
                        </span>
                        <motion.svg
                            initial={{ rotate: 0 }}
                            animate={{ rotate: isReviewsOpen ? -180 : 0 }}
                            transition={{ duration: 0.2 }}
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 100 100" 
                            width="24" 
                            height="24" 
                            className='stroke-black stroke-[10px] fill-none mr-4 cursor-pointer'
                            onClick={toggleReviews}
                            >
                            <path d="M10,40 L50,80 L90,40" />
                        </motion.svg>
                    </div>
                    <AnimatePresence>
                        {isReviewsOpen && (
                            <motion.div className='flex flex-col justify-center w-full pl-6'
                                key='reviews'
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 80, opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                >
                                    Enter text here...
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
     );
}
 
export default withAuth(ShowProduct);