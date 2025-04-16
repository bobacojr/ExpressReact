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

    const [category, setCategory] = useState({
        name: "",
        parentName: "",
    });
    
    const [categories, setCategtories] = useState<Category[]>([]);
    const [editCategories, setEditCategories] = useState<{ [id: number]: string}>({});

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

    const handleEditState = (cat: Category) => {
        setEditCategories((prev) => ({ ...prev, [cat.id]: cat.name }));
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>, id: number) => {
        const { value } = e.target;
        setEditCategories((prev) => ({ ...prev, [id]: value}))
    }

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
        if (category.parentName.trim() !== "") {
            const allCategories = flattenCategories(categories);
            const matchedCategory = allCategories.find((cat) =>
                (cat.name ?? "").toLowerCase() === category.parentName.trim().toLowerCase()
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
                        <div 
                            className="flex flex-row justify-between items-center text-xl">
                            <input
                                type="text"
                                value={editCategories[category.id]}
                                onChange={(e) => handleEditInputChange(e, category.id)}
                                className="w-1/2 font-semibold !m-0 !p-0"
                                />
                            <AnimatePresence>
                                <motion.div 
                                    className='flex flex-row' 
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
                                        className="cursor-pointer pl-2" 
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
                            <div className='flex flex-row'>
                                <motion.div 
                                    className="cursor-pointer" 
                                    whileHover={{ color: "#22c55e" }} 
                                    onClick={() => handleEditState(category)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22px" height="26px" viewBox="0 0 24 24">
                                            <g fill="none" stroke="currentColor">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1l1-4l9.5-9.5z"/>
                                            </g>
                                        </svg>
                                </motion.div>
                                <motion.div 
                                    className="cursor-pointer pl-2" 
                                    whileHover={{ color: "#ef4444" }} 
                                    onClick={() => handleDelete(category.id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 128 128" width="22px" height="26px" className=''>
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
            <div className='flex flex-col w-64 justify-center items-center mt-24 border-2 border-gray-300 rounded-lg p-3'>
                <h1 className='flex text-2xl font-bold mb-1'>
                    Add Category
                </h1>
                <form
                    className='flex flex-col gap-2 justify-center items-center'
                    onSubmit={handleSubmit}
                    >
                    <input 
                        className='border-2 border-gray-300 rounded-md pl-1 text-[15px]'
                        type="text" 
                        name="name" 
                        onChange={handleInputChange}  
                        required
                        placeholder='Category name'
                        />
                    <input 
                        className='border-2 border-gray-300 rounded-md pl-1 text-[15px]'
                        type="text" 
                        name="parentName" 
                        onChange={handleInputChange} 
                        placeholder='Parent Category Name'
                        />
                    {errorMsg && 
                        <p className='flex items-center italic text-sm w-full text-[#ef4444]'>
                            {errorMsg}
                        </p>
                    }
                    <div className='flex flex-row gap-2 p-1'>
                        <button type='button' className='border-2 border-gray-300 pl-2 pr-2 rounded-lg font-semibold' onClick={handleCancel}>
                            Cancel
                        </button>
                        <button type="submit" className='border-2 border-gray-300 pl-2 pr-2 rounded-lg font-semibold'>
                            Add
                        </button>
                    </div>
                </form>
            </div>
            <div className='flex mt-24 w-72 border-2 border-gray-300 rounded-lg p-4 flex-col'>
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
