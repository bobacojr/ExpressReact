"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8080/auth/login", {
                username,
                password,
            });
            setMessage(res.data.message);
            localStorage.setItem("token", res.data.token); // Store the token
            router.push('/'); // Move to home page
        } catch (error) {
            setMessage("Invalid username or password, please try again");
        }
    };

    const handleSignIn = async () => {
        console.log("Moving from login page -> register page")
        router.push('/register');
    };

    return ( 
        <div className='flex flex-col w-screen h-screen items-center border-2 border-red-600'>
            <h2 className='flex justify-center items-center text-xl font-bold mt-8'>
                Sign in to  your E-Shop account
            </h2>
            <form onSubmit={handleSubmit} className='flex flex-col w-full justify-center items-center gap-2 mt-2'>
                <div className='flex justify-center items-center w-full'>
                    <input
                        type="text"
                        autoComplete='true'
                        name='username'
                        placeholder='Username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className='flex w-full max-w-[30em] border-2 border-gray-300 rounded-lg p-1'
                        />
                </div>
                <div className='flex justify-center items-center w-full'>
                    <input
                        type="password"
                        name='password'
                        placeholder='Password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className='flex w-full max-w-[30em] border-2 border-gray-300 rounded-lg p-1'
                        />
                </div>
                <button 
                    type="submit"
                    className='border-2 border-gray-300 w-[4.6em] rounded-lg font-semibold p-1'
                    >
                    Sign in
                </button>
                <span className='flex items-center justify-center font-semibold'>
                    OR
                </span>
                <button
                    className='border-2 border-gray-300 w-[8em] rounded-lg font-semibold p-1'
                    type='button'
                    onClick={handleSignIn}
                    >
                    Create Account
                </button>
            </form>
            {message && 
                <p className='flex mt-3 border-2 border-gray-300 rounded-lg p-2 text-red-700'>
                    {message}
                </p>
            }
        </div>
     );
}
 
export default LoginForm;