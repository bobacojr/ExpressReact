"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';

const RegistrationForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8080/auth/register", {
                username,
                password,
                email
            });
            setMessage(res.data.message);
            router.push('/login'); // Move to login page after successful registration
        } catch (error) {
            setMessage("An error has occurred, please reload the page and try again");
            console.log("An error occurred while attempting to login: ", error);
        }
    };

    const handleSignIn = async () => {
        console.log("Moving from register page -> login page")
        router.push('/login');
    };

    return ( 
        <div className='flex flex-col w-screen h-screen items-center'>
            <h2 className='flex justify-center items-center text-xl font-bold mt-20'>
                Create your E-Shop account
            </h2>
            <form onSubmit={handleSubmit} className='flex flex-col w-full justify-center items-center gap-2 mt-2'>
                <div className='flex justify-center items-center w-full pl-1 pr-1'>
                    <input
                        type="email"
                        name='email'
                        autoComplete='true'
                        placeholder='Email address'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className='flex w-full max-w-[30em] border-2 border-gray-300 rounded-lg p-1'
                        />
                </div>
                <div className='flex justify-center items-center w-full pl-1 pr-1'>
                    <input
                        type="text"
                        name='username'
                        autoComplete='true'
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className='flex w-full max-w-[30em] border-2 border-gray-300 rounded-lg p-1'
                        />
                </div>
                <div className='flex justify-center items-center w-full pl-1 pr-1'>
                    <input
                        type="password"
                        name='password'
                        autoComplete='true'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className='flex w-full max-w-[30em] border-2 border-gray-300 rounded-lg p-1'
                        />
                </div>
                <motion.button 
                    type="submit"
                    className='border-2 border-gray-300 rounded-2xl font-semibold pl-3 pr-3 p-1'
                    whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e"  }}
                    whileTap={{ scale: 0.9 }}
                    >
                    Create account
                </motion.button>
                <span className='flex items-center justify-center font-semibold'>
                    OR
                </span>
                <motion.button
                    className='border-2 border-gray-300 pl-3 pr-3 rounded-2xl font-semibold p-1'
                    type='button'
                    whileHover={{ scale: 1.06, borderColor: "#22c55e", color: "#22c55e"  }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSignIn}
                    >
                    Sign in
                </motion.button>
            </form>
            {message && 
                <p className='flex mt-3 border-2 border-gray-300 rounded-lg p-2 text-red-700'>
                    {message}
                </p>
            }
        </div>
     );
}
 
export default RegistrationForm;