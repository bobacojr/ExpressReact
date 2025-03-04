"use client"
import React, { useState } from 'react';
import axios from '../(components)/axiosConfig';
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
            sessionStorage.setItem("token", res.data.token); // Store the token
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
        <div className='flex flex-col w-screen h-screen items-center'>
            <h2 className='flex justify-center items-center text-xl font-bold mt-20'>
                Sign in to  your E-Shop account
            </h2>
            <div className='flex flex-row gap-4 mt-4 items-center'>
                <input type='checkbox' className='w-4 h-4'/>
                <span className='text-lg'>
                    Keep me signed in
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="22px" height="22px">
                    <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z"/>
                </svg>
            </div>
            <form onSubmit={handleSubmit} className='flex flex-col w-full justify-center items-center gap-2 mt-2'>
                <div className='flex justify-center items-center w-full mt-2'>
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
                    className='border-2 border-gray-300 pl-3 pr-3 rounded-2xl font-semibold p-1'
                    >
                    Sign in
                </button>
                <span className='flex items-center justify-center font-semibold'>
                    OR
                </span>
                <button
                    className='border-2 border-gray-300 pl-3 pr-3 rounded-2xl font-semibold p-1'
                    type='button'
                    onClick={handleSignIn}
                    >
                    Register Account
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