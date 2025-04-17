"use client"
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Navbar from '../(components)/navbar/page';
import axios from '../(components)/axiosConfig';
import { useRouter } from 'next/navigation';
import withAuth from '../(components)/ProtectedRoute';

const AddCategories = () => {
    const router = useRouter();
    const [errorMsg, setErrorMsg] = useState<string>("");

    type CategoryForm = Partial<Category>;
    const [category, setCategory] = useState<CategoryForm>({
        default_metadata: {},
    });

    const [categories, setCategtories] = useState<Category[]>([]);
    const [editCategories, setEditCategories] = useState<{ [id: number]: string}>({});
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const DeleteModal = () => {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md mx-auto">
                    <h2 className="text-lg font-semibold mb-4">
                        Are you sure you want to delete this category?
                    </h2>
                    <div className="flex justify-end gap-4">
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            onClick={async () => {
                                if (pendingDeleteId !== null) {
                                    await handleDelete(pendingDeleteId);
                                }
                                setPendingDeleteId(null);
                                setIsDeleteModalOpen(false);
                            }}
                            >
                            Yes
                        </button>
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            onClick={() => {
                                setPendingDeleteId(null);
                                setIsDeleteModalOpen(false);
                            }}
                            >
                            No
                        </button>
                    </div>
                </div>
            </div>
        );
    };
    

    const fetchCategories = async () => {
        try {
            const res = await axios.get("http://localhost:8080/categories", {
                withCredentials: true,
            });
            if (res.status == 200) {
                setCategtories(res.data);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Failed to get all categories", error);
            } else {
                console.error("Error getting all categories", error);
            }
        }
    };

    const handleParentCategory = (cat: Category) => {
        let metadataObj: Record<string, string> = {};
        
        try {
            if (typeof cat.default_metadata === 'string') {
                metadataObj = JSON.parse(cat.default_metadata);
            } else {
                metadataObj = cat.default_metadata ?? {};
            }
        } catch {
            console.warn("Metadata parsing failed. Defaulting to empty.");
        }
    
        setCategory((prev) => ({
            ...prev,
            parentName: cat.name,
            default_metadata: metadataObj,
        }));
    };
    

    const handleEditState = (cat: Category) => {
        setEditCategories((prev) => ({ ...prev, [cat.id]: cat.name }));
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const { value } = e.target;
        setEditCategories((prev) => ({ ...prev, [id]: value}))
    };

    const handleSaveEdit = async (cat: Category) => {
        try {
          const res = await axios.put(
            `http://localhost:8080/categories/${cat.id}`,
            {
              name: editCategories[cat.id],
              parent_id: cat.parent_id,
            },
            {
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          if (res.status === 200) {
            // Remove that category from editing state.
            setEditCategories((prev) => {
                const updated = { ...prev };
                delete updated[cat.id];
                return updated;
            });
                await fetchCategories();
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Failed to update category:", error);
            } else {
                console.error("Error updating category:", error);
            }
        }
    };
    
    // Cancel editing for a specific category.
    const handleCancelEdit = (id: number) => {
        setEditCategories((prev) => {
            const updated = { ...prev };
            delete updated[id];
            return updated;
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCategory((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCancel = async () => {
        router.push('/')
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await axios.delete(`http://localhost:8080/categories/${id}`, {
                withCredentials: true
            });
            if (res.status === 200) {
                await fetchCategories();
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Failed to delete category:", error);
            } else {
                console.error("Error deleting category:", error);
            }
        }
    };

    const flattenCategories = (nodes: Category[]): Category[] => {
        let flat: Category[] = [];
        for (const node of nodes) {
            flat.push(node);
            if (node.subcategories && node.subcategories.length > 0) {
                flat = flat.concat(flattenCategories(node.subcategories));
            }
        }
        return flat;
    };
    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        let parent_id: number | null = null;
        if (category.parentName?.trim() !== "") {
            const allCategories = flattenCategories(categories);
            const matchedCategory = allCategories.find((cat) =>
                (cat.name ?? "").toLowerCase() === category.parentName?.trim().toLowerCase()
            );

            if (matchedCategory) {
                parent_id = matchedCategory.id;
            } else {
                setErrorMsg("Parent category not found. Please check spelling or leave empty to create a top-level category.");
                return;
            }
        }
        try {
            const res = await axios.post("http://localhost:8080/categories", {
                name: category.name,
                parent_id: parent_id,
                default_metadata: JSON.stringify(category.default_metadata ?? {}),
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            if (res.status === 200) {
                setCategory({
                    name: "",
                    parentName: "",
                    default_metadata: {}
                });
                console.log(`New category created: ${category.name}`)
                await fetchCategories();
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Failed to create new category:", error);
            } else {
                console.error("Error submitting form:", error);
            }
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);
    

    // Recursive logic to allow for unlimited nesting of categories/subcategories
    const RenderCategory = ({ category }: { category: Category }) => {
        const isEditing = editCategories[category.id] !== undefined;
    
        return (
            <div className="ml-2 flex flex-col border-l pl-2">
                    {isEditing ? (
                        <div className="flex flex-row justify-between items-center text-lg">
                            <input
                                type="text"
                                value={editCategories[category.id]}
                                onChange={(e) => handleEditInputChange(e, category.id)}
                                className="w-1/2 font-semibold !m-0 !p-0"
                                />
                            <AnimatePresence>
                                <motion.div 
                                    className='flex flex-row gap-3' 
                                    key={isEditing ? `edit-${category.id}` : `view-${category.id}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    >
                                    <motion.div 
                                        className="cursor-pointer" 
                                        whileHover={{ color: "#ef4444" }} 
                                        onClick={() => handleCancelEdit(category.id)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="0 0 20 20">
                                                <path fill="currentColor" d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10L4.293 5.707a1 1 0 0 1 0-1.414Z"/>
                                            </svg>
                                    </motion.div>
                                    <motion.div 
                                        className="cursor-pointer" 
                                        whileHover={{ color: "#22c55e" }} 
                                        onClick={() => handleSaveEdit(category)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="0 0 376 384">
                                                <path fill="currentColor" d="M119 282L346 55l29 30l-256 256L0 222l30-30z"/>
                                            </svg>
                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.div className="flex flex-row items-center justify-between text-lg">
                            <span className="font-semibold">
                                {category.name}
                            </span>
                            <div className='flex flex-row gap-3'>
                                <motion.div 
                                    className="cursor-pointer"
                                    whileHover={{ color: "#22c55e", scale: 1.1 }}
                                    onClick={() => handleParentCategory(category)}
                                    >
                                    <svg width="20px" height="30px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g id="Edit / Add_Plus_Circle">
                                            <path id="Vector" d="M8 12H12M12 12H16M12 12V16M12 12V8M12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </g>
                                    </svg>
                                </motion.div>
                                <motion.div 
                                    className="cursor-pointer" 
                                    whileHover={{ color: "#DAA520", scale: 1.1 }} 
                                    onClick={() => handleEditState(category)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="26px" viewBox="0 0 24 24">
                                            <g fill="none" stroke="currentColor">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1l1-4l9.5-9.5z"/>
                                            </g>
                                        </svg>
                                </motion.div>
                                <motion.div 
                                    className="cursor-pointer" 
                                    whileHover={{ color: "#ef4444", scale: 1.1 }} 
                                    onClick={() => {setPendingDeleteId(category.id); setIsDeleteModalOpen(true)}}>
                                        <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 128 128" width="22px" height="26px">
                                            <path fill='currentColor' stroke='currentColor' d="M 49 1 C 47.34 1 46 2.34 46 4 C 46 5.66 47.34 7 49 7 L 79 7 C 80.66 7 82 5.66 82 4 C 82 2.34 80.66 1 79 1 L 49 1 z M 24 15 C 16.83 15 11 20.83 11 28 C 11 35.17 16.83 41 24 41 L 101 41 L 101 104 C 101 113.37 93.37 121 84 121 L 44 121 C 34.63 121 27 113.37 27 104 L 27 52 C 27 50.34 25.66 49 24 49 C 22.34 49 21 50.34 21 52 L 21 104 C 21 116.68 31.32 127 44 127 L 84 127 C 96.68 127 107 116.68 107 104 L 107 40.640625 C 112.72 39.280625 117 34.14 117 28 C 117 20.83 111.17 15 104 15 L 24 15 z M 24 21 L 104 21 C 107.86 21 111 24.14 111 28 C 111 31.86 107.86 35 104 35 L 24 35 C 20.14 35 17 31.86 17 28 C 17 24.14 20.14 21 24 21 z M 50 55 C 48.34 55 47 56.34 47 58 L 47 104 C 47 105.66 48.34 107 50 107 C 51.66 107 53 105.66 53 104 L 53 58 C 53 56.34 51.66 55 50 55 z M 78 55 C 76.34 55 75 56.34 75 58 L 75 104 C 75 105.66 76.34 107 78 107 C 79.66 107 81 105.66 81 104 L 81 58 C 81 56.34 79.66 55 78 55 z"/>
                                        </svg>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                
                {category.subcategories && category.subcategories.length > 0 && (
                    <div className="ml-2">
                        {category.subcategories.map((sub) => (
                            <RenderCategory key={sub.id} category={sub} />
                        ))}
                    </div>
                )}
            </div>
        );
    };    

    return ( 
        <div className="flex w-full h-full justify-center items-center flex-col sm:flex-row sm:gap-3">
            <div className="fixed top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            {isDeleteModalOpen && <DeleteModal />}
            <div className='flex flex-col justify-center items-center mt-24 border-2 border-gray-300 rounded-lg p-3'>
                <h1 className='flex text-2xl font-bold mb-1'>
                    Create Category
                </h1>
                <form
                    className='flex flex-col justify-center items-center'
                    onSubmit={handleSubmit}
                    >
                    <input 
                        className='border-2 w-full border-gray-300 rounded-md pl-1 text-[15px]'
                        type="text" 
                        name="name" 
                        onChange={handleInputChange}  
                        required
                        value={category.name ?? ""}
                        placeholder='Category name'
                        />
                    <input 
                        className='border-2 w-full mt-1 border-gray-300 rounded-md pl-1 text-[15px]'
                        type="text" 
                        name="parentName" 
                        onChange={handleInputChange}
                        value={category.parentName ?? ""}
                        placeholder='Parent Category Name'
                        />
                    <div className="flex flex-col w-full">
                        {category.default_metadata && Object.keys(category.default_metadata).length > 0 && (
                            <div className='flex justify-center items-center text-2xl font-bold mt-1'>
                                Default Metadata
                            </div>
                        )}
                        {category.default_metadata && Object.entries(category.default_metadata).map(([key, value], index) => (
                            <div key={index} className="flex w-full mt-1">
                                <input
                                    className="border-2 w-full pl-1 border-gray-300 rounded-md text-[15px]"
                                    type="text"
                                    value={key}
                                    readOnly
                                    />
                                </div>
                            ))}
                    </div>

                    {errorMsg && 
                        <p className='flex items-center italic text-sm w-full text-[#ef4444]'>
                            {errorMsg}
                        </p>
                    }
                    <div className='flex flex-row gap-2 p-1 mt-1'>
                        <button type='button' className='border-2 border-gray-300 pl-2 pr-2 rounded-lg font-semibold' onClick={handleCancel}>
                            Cancel
                        </button>
                        <button type="submit" className='border-2 border-gray-300 pl-2 pr-2 rounded-lg font-semibold'>
                            Create
                        </button>
                    </div>
                </form>
            </div>
            <div className='flex mt-24 w-1/2 border-2 border-gray-300 rounded-lg p-4 flex-col'>
                <h1 className='flex text-2xl font-bold mb-1'>
                    Existing Categories
                </h1>
                    {categories.length > 0 ? (
                        categories.map((cat) => (
                            <RenderCategory key={cat.id} category={cat} />
                        ))
                    ) : (
                        <p>No categories or subcategories created.</p>
                    )}
            </div>
        </div>
     );
}
 
export default withAuth(AddCategories);
