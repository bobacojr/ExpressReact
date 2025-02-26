"use client"
import React, { useEffect, useState } from 'react';
import Navbar from '../(components)/navbar/page';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const AddCategories = () => {
    const router = useRouter();
    const [category, setCategory] = useState({
        name: "",
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', category.name);

        try {
            const res = await axios.post("http://localhost:8080/categories", {
                name: category.name,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.status === 200) {
                setCategory({
                    name: "",
                });
                console.log(`New category created: ${category.name}`)
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("Failed to create new category:", error);
            } else {
                console.error("Error submitting form:", error);
            }
        }
    }


    return ( 
        <div className="flex w-full h-full border-2 border-red-600">
            <div className="fixed top-0 left-0 w-full z-20">
                <Navbar />
            </div>
            <div className='flex flex-col justify-center items-center w-full mt-24'>
                <h1 className='flex text-3xl font-bold'>
                    Add Category
                </h1>
                <form
                    className='flex flex-col gap-2 justify-center items-center border-2 border-red-600'
                    onSubmit={handleSubmit}
                    >
                    <input 
                        className='border-2 border-gray-300 rounded-md'
                        type="text" 
                        name="name" 
                        onChange={handleInputChange} 
                        required
                        placeholder='Category name'
                        />
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
 
export default AddCategories;
