"use client"
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import * as variants from '../variants/variants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from '../axiosConfig';
import withAuth from '../ProtectedRoute';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAccount, setIsAccount] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState<Product[]>([]);
    const [username, setUsername] = useState('');
    const router = useRouter();

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const res = await axios.get("http://localhost:8080/auth/me"); // Returns user_id, username, and role
                setUsername(res.data.user.username);
                setIsLoggedIn(true);
            } catch (error) {
                setIsLoggedIn(false);
                setUsername('');
                console.error("Authentication check failed");
            }
        };
        checkAuthentication();
    }, []);

    const handleIsOpenClick = () => {
        setIsOpen((prev) => !prev);
    };

    const handleAccountClick = () => {
        setIsAccount((prev) => !prev);
    };

    const handleCartClick = async () => {
        setIsCartOpen((prev) => !prev);
        if (!isCartOpen) {
            await fetchCart();
        }
    }

    const handleSignOut = async () => {
        try {
            await axios.post("http://localhost:8080/auth/logout");
            setIsLoggedIn(false);
            setUsername('');
            router.push('/login');
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const fetchCart = async () => {
        try {
            const res = await axios.get("http://localhost:8080/cart");
            console.log(`CartItems: ${res.data}`)
            setCartItems(res.data.data);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        }
    };

    return ( 
        <div className="flex w-screen h-20 overflow-x-hidden bg-white border-b-2 border-gray-300">
            <div className='flex flex-row w-full h-auto items-center justify-between'>
                <motion.div className='flex flex-col ml-6 w-16 h-auto justify-center'
                    onClick={handleIsOpenClick}
                    >
                    <motion.div className='flex flex-col w-1/2 cursor-pointer z-20'>
                        <motion.span className='line' variants={variants.hamMenuLine1} animate={isOpen ? 'animate' : 'initial'} initial='initial'/>
                        <motion.span className='line' variants={variants.hamMenuLine2} animate={isOpen ? 'animate' : 'initial'} initial='initial'/>
                        <motion.span className='line' variants={variants.hamMenuLine3} animate={isOpen ? 'animate' : 'initial'} initial='initial'/>
                    </motion.div>
                </motion.div>

                <div className='flex flex-col justify-center items-center text-lg font-semibold'>
                    <Link href={'/'}>
                        <span>
                            E-Shop
                        </span>
                    </Link>
                </div>

                <div className='flex gap-3 justify-between items-center mr-8 w-16 h-auto'>
                    <motion.span 
                        className='w-1/2 cursor-pointer'
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleCartClick}
                        >
                        <Link href="/show_cart">
                            <svg width="25px" height="25px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.787 15.981l14.11-1.008L23.141 6H5.345L5.06 4.37a1.51 1.51 0 0 0-1.307-1.23l-2.496-.286-.114.994 2.497.286a.502.502 0 0 1 .435.41l1.9 10.853-.826 1.301A1.497 1.497 0 0 0 6 18.94v.153a1.5 1.5 0 1 0 1 0V19h11.5a.497.497 0 0 1 .356.15 1.502 1.502 0 1 0 1.074-.08A1.497 1.497 0 0 0 18.5 18H6.416a.5.5 0 0 1-.422-.768zM19.5 21a.5.5 0 1 1 .5-.5.5.5 0 0 1-.5.5zm-13 0a.5.5 0 1 1 .5-.5.5.5 0 0 1-.5.5zM21.86 7l-1.757 7.027-13.188.942L5.52 7z"/>
                                <path fill="none" d="M0 0h24v24H0z"/>
                            </svg>
                        </Link>
                    </motion.span>

                    <motion.span 
                        className='w-1/2 cursor-pointer'
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleAccountClick}
                        >
                        <svg width="25px" height="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="#292D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </motion.span>

                    {/* Account dropdown menu */}
                    <motion.div
                        className='flex justify-center items-center fixed w-[7rem] h-28 flex-col gap-2 right-0 top-[4.88rem] bg-white border-gray-300 border-l-2 border-b-2 rounded-bl-lg'
                        initial={{ x: '120%' }}
                        animate={isAccount ? { x: 0, transition: { ease: 'easeInOut', duration: 0.3 } } : { x: '120%' }}
                        >
                        {isLoggedIn ? (
                            <div className='flex w-full h-full flex-col items-center gap-2'>
                                <span className='font-semibold text-[1.08rem]'>
                                    {username}
                                </span>
                                <button className=''>
                                    settings
                                </button>
                                <button className='' onClick={handleSignOut}>
                                    sign out
                                </button>
                            </div>
                        ) : (
                            <div className='flex w-full h-full flex-col items-center gap-2 mt-5'>
                                <Link href='/login' className='cursor-pointer'>
                                    sign in
                                </Link>
                                <Link href='/register' className='cursor-pointer'>
                                    register
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
            <motion.div
                className='flex fixed flex-col gap-6 left-0 w-40 h-full overflow-hidden items-center bg-opacity-95 bg-white z-10 border-2 border-red-600'
                initial={{ x: '-100%', opacity: 1 }}
                animate={isOpen ? { x: 0, opacity: 1 } : { x: '-100%', opacity: 1 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                <span className='mt-24 font-bold text-lg'>
                    Admin Tools
                </span>
                <Link className='flex left-0' href={'/add_products'}>
                    Add Products
                </Link>
                <Link className='flex left-0' href={'/add_categories'}>
                    Add Categories
                </Link>
            </motion.div>
        </div>
     );
}
 
export default withAuth(Navbar);