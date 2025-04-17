
"use client"
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../(components)/axiosConfig';
import { useRouter } from 'next/navigation';
import Navbar from '../(components)/navbar/page';
import withAuth from '../(components)/ProtectedRoute';
import { motion } from 'motion/react';
import Image from 'next/image';
import { create } from 'domain';

const flattenCategories = (categoryList: Category[], depth = 0): Category[] => {
    return categoryList.flatMap(category => {
        const subList = category.subcategories
            ? flattenCategories(category.subcategories, depth + 1) : [];

            return [{ ...category, depth }, ...subList];
    });
};

const AddProduct = () => {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isVisibleProducts, setIsVisibleProducts] = useState({});
    const [isVisibleVariants, setIsVisibleVariants] = useState({});

    type ProductForm = Partial<Product>;
    const [product, setProduct] = useState<ProductForm>({});
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const [metadata, setMetadata] = useState();
    const [metadataValues, setMetadataValues] = useState<{ [key: string]: string }>({});
    const [createMode, setCreateMode] = useState<"product" | "variant">("product");

    const allCategoriesFlat = useMemo(() => flattenCategories(categories), [categories]);

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
        const file = e.target.files?.[0];
        if (!file) return;
    
        const imageUrl = URL.createObjectURL(file);
        setPreviewImage(imageUrl);
    
        setProduct((prev) => ({
            ...prev,
            ...(createMode === "product"
                ? { image: file }
                : { variant_image: file })
        }));
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
    
        if (createMode === "product") {

            //if (metadataValues["author"]) product.author = metadataValues["author"];
            //if (metadataValues["brand"]) product.brand = metadataValues["brand"];
            //if (metadataValues["model"]) product.model = metadataValues["model"];

            if (product.title) formData.append("title", product.title);
            if (product.description) formData.append("description", product.description);
            if (product.price) formData.append("price", String(product.price));
            if (product.category_id) formData.append("category_id", String(product.category_id));
            if (product.author) formData.append("author", product.author);
            if (product.brand) formData.append("brand", product.brand);
            if (product.model) formData.append("model", product.model);
            if (product.quantity) formData.append("quantity", String(product.quantity));
            if (product.image) formData.append("image", product.image);
            if (Object.keys(metadataValues).length > 0) {
                formData.append("metadata", JSON.stringify(metadataValues));
            }
    
            try {
                console.log("Product before submit", product)
                const res = await axios.post("http://localhost:8080/products", formData, {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                });
    
                if (res.status === 200) {
                    setProduct({
                        title: "",
                        description: "",
                        price: 0.00,
                        image: "",
                        category_id: 0,
                        quantity: 0,
                    });
                    setMetadataValues({});
                }
            } catch (error) {
                console.error("Error submitting product:", error);
            }
    
        } else {

            if (product.product_id) formData.append("product_id", product.product_id);
            if (product.variant_price) formData.append("variant_price", String(product.variant_price));
            if (product.variant_quantity) formData.append("variant_quantity", String(product.variant_quantity));
            if (product.variant_size) formData.append("variant_size", product.variant_size);
            if (product.variant_color) formData.append("variant_color", product.variant_color);
            if (product.variant_type) formData.append("variant_type", product.variant_type);
            if (product.variant_image) formData.append("variant_image", product.variant_image);

            if (Object.keys(metadataValues).length > 0) {
                formData.append("variant_metadata", JSON.stringify(metadataValues));
            }
    
            try {
                console.log("Variant before submit", product)
                const res = await axios.post(`http://localhost:8080/products/${product.product_id}/variants`, formData, {
                    withCredentials: true,
                    headers: { "Content-Type": "multipart/form-data" },
                });
    
                if (res.status === 200) {
                    setProduct({});
                    setMetadataValues({});
                }
            } catch (error) {
                console.error("Error submitting variant:", error);
            }
        }
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

    const toggleCreateMode = async () => {
        setCreateMode((prev) => (
            prev === 'product' ? 'variant' : 'product'
        ));
    };

    const getParsedMetadata = (metadata) => {
        if (!metadata) return;
        if (typeof metadata === 'string') {
            try {
                return JSON.parse(metadata);
            } catch (error) {
                console.error("Error while parrsing metadata:", error);
                return {};
            }
        }
        return metadata;
    };

    useEffect(() => {
        setPreviewImage(null);
    }, [createMode]);    

    useEffect(() => {
        if (product.category_id) {
            const selectedCategory = allCategoriesFlat.find(category => category.id === product.category_id);
            if (selectedCategory && selectedCategory.default_metadata) {
                setMetadata(getParsedMetadata(selectedCategory.default_metadata));
            } else {
                setMetadata({});
            }
        }
    }, [product.category_id, allCategoriesFlat])

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
                        <motion.span
                            className='inline-flex w-[20px] h-[30px] cursor-pointer'
                            whileHover={{ scale: 1.1, color: "#800080" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                                setCreateMode("variant");
                              
                                setProduct(prev => {
                                  const newProduct = {
                                    ...prev,
                                    product_id: product.id,
                                    category_id: product.category_id,
                                    variant_size: "",
                                    variant_color: "",
                                    variant_type: "",
                                    variant_quantity: 0,
                                    variant_price: product.price,
                                    variant_image: product.image
                                  };
                              
                                  console.log("Set product for variant creation:", newProduct); // 👈 LOG THIS
                              
                                  return newProduct;
                                });
                              }}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="30px" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M14.5 3 12 7.156 9.857 3H2l10 18L22 3h-7.5ZM4.486 4.5h2.4L12 13.8l5.107-9.3h2.4L12 18.021 4.486 4.5Z"/>
                            </svg>
                        </motion.span>
                        <span onClick={() => toggleVariants(product.id)} className='cursor-pointer'>
                            {product.title}
                        </span>
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

    return ( 
        <div className="flex w-full h-full justify-center">
            <div className="fixed top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            {createMode === 'product' && (
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
                        {previewImage && (
                            <Image 
                                src={previewImage}
                                alt="Preview"
                                width={200}
                                height={200}
                                className="object-cover rounded"
                                />
                        )}
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
                            placeholder="Title" 
                            required
                            />
                        <input
                            className='border-2 border-gray-300 rounded-md pl-1 w-full'
                            type="text" 
                            name="description" 
                            onChange={handleInputChange} 
                            placeholder="Description" 
                            required
                            />
                        <input 
                            className='border-2 border-gray-300 rounded-md pl-1 w-full'
                            type="text" 
                            name="price" 
                            onChange={handleInputChange}
                            placeholder='Price 0.00'
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
                        {metadata && Object.keys(metadata).length > 0 && (
                            <ul className='flex flex-col gap-2 w-full'>
                                {Object.entries(metadata).map(([key, value]) => (
                                    <input 
                                        key={key}
                                        className='border-2 gap-2 border-gray-300 rounded-md pl-1 w-full'
                                        name={key}
                                        placeholder={key}
                                        value={metadataValues[key] || ""}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            const loweredKey = key.toLowerCase();

                                            setMetadataValues(prev => ({
                                                ...prev,
                                                [key]: newValue
                                            }));

                                            const metaKeys = ["author", "brand", "model", "size", "color"];
                                            if (metaKeys.includes(loweredKey)) {
                                                setProduct(prev => ({
                                                    ...prev,
                                                    [loweredKey]: newValue
                                                }));
                                            }
                                        }}
                                        />
                                ))}
                            </ul>
                        )}
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
            )}
            {createMode === 'variant' && (
                <div className='flex flex-col items-center mt-24 border-2 border-gray-300 p-1 rounded-lg'>
                    <h1 className='flex text-2xl font-bold'>
                        Create New Variant
                    </h1>
                    <form
                        className='flex flex-col gap-2 justify-center items-center'
                        action="http://localhost:8080/products" 
                        encType="multipart/form-data"
                        onSubmit={handleSubmit}
                        >
                        <select
                            className="border-2 border-gray-300 rounded-md pl-1 w-full"
                            name="product_id"
                            value={product.product_id || ""}
                            onChange={handleInputChange}
                            required
                            >
                            <option value={product.id || 0}>Select parent product</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title}
                                </option>
                            ))}
                        </select>
                        {previewImage && (
                            <Image 
                                src={previewImage}
                                alt="Preview"
                                width={200}
                                height={200}
                                className="object-cover rounded"
                                />
                        )}
                        <input 
                            className='border-2 border-gray-300 rounded-md'
                            type="file" 
                            name="Variant_image"
                            onChange={handleFileChange} 
                            required
                            />

                        <input
                            className='border-2 border-gray-300 rounded-md pl-1 w-full'
                            type="text" 
                            name="variant_type"
                            value={product.variant_type || ""}
                            onChange={handleInputChange} 
                            placeholder="Variant type" 
                            required
                            />
                        <input
                            className='border-2 border-gray-300 rounded-md pl-1 w-full'
                            type="text" 
                            name="variant_price"
                            value={product.variant_price || 0.0}
                            onChange={handleInputChange}
                            placeholder='Variant Price'
                            required
                            />
                        <input
                            className='border-2 border-gray-300 rounded-md pl-1 w-full'
                            type="text" 
                            name="variant_quantity"
                            value={product.variant_quantity}
                            onChange={handleInputChange}
                            placeholder='Variant quantity'
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
                        {metadata && Object.keys(metadata).length > 0 && (
                            <ul className='flex flex-col gap-2 w-full'>
                                {Object.entries(metadata).map(([key, value]) => (
                                    <input 
                                        key={key}
                                        className='border-2 gap-2 border-gray-300 rounded-md pl-1 w-full'
                                        name={key}
                                        placeholder={key}
                                        value={metadataValues[key] || ""}
                                        onChange={(e) => {
                                            const newValue = e.target.value;
                                            const loweredKey = key.toLowerCase();

                                            setMetadataValues(prev => ({
                                                ...prev,
                                                [key]: newValue
                                            }));

                                            const metaKeys = ["size", "color"];
                                            if (metaKeys.includes(loweredKey)) {
                                                const variantKey = loweredKey === "color" ? "variant_color" : "variant_size";
                                                setProduct(prev => ({
                                                    ...prev,
                                                    [variantKey]: newValue
                                                }));
                                            }
                                        }}
                                        />
                                ))}
                            </ul>
                        )}
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
            )}
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