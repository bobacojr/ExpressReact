"use client"
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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
        }
    };

    const handleSignIn = async () => {
        console.log("Moving from register page -> login page")
        router.push('/login');
    };

    return ( 
        <div className='flex flex-col w-screen h-screen items-center border-2 border-red-600'>
            <h2 className='flex justify-center items-center text-xl font-bold mt-8'>
                Create your E-Shop account
            </h2>
            <form onSubmit={handleSubmit} className='flex flex-col w-full justify-center items-center gap-2 mt-2'>
                <div className='flex justify-center items-center w-full'>
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
                <div className='flex justify-center items-center w-full'>
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
                <div className='flex justify-center items-center w-full'>
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
                <button 
                    type="submit"
                    className='border-2 border-gray-300 w-[8em] rounded-lg font-semibold p-1'
                    >
                    Create account
                </button>
                <span className='flex items-center justify-center font-semibold'>
                    OR
                </span>
                <button
                    className='border-2 border-gray-300 w-[4.6em] rounded-lg font-semibold p-1'
                    type='button'
                    onClick={handleSignIn}
                    >
                    Sign in
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
 
export default RegistrationForm;