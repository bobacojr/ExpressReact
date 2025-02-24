"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import * as variants from '../variants/variants';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleIsOpenClick = () => {
        setIsOpen(!isOpen)
        console.log("Ham Clicked")
    };

    return ( 
        <div className="flex w-screen h-20 overflow-x-hidden">
            <div className='flex flex-row w-full h-auto items-center justify-between'>
                <motion.div className='flex flex-col ml-3 h-auto justify-center'
                    onClick={handleIsOpenClick}
                    >
                    <motion.span className='line' variants={variants.hamMenuLine1} animate={isOpen ? 'animate' : 'initial'} initial='initial'/>
                    <motion.span className='line' variants={variants.hamMenuLine2} animate={isOpen ? 'animate' : 'initial'} initial='initial'/>
                    <motion.span className='line' variants={variants.hamMenuLine3} animate={isOpen ? 'animate' : 'initial'} initial='initial'/>
                </motion.div>
                <div className='flex flex-col justify-center items-center text-md font-semibold'>
                    <span>
                        E-Shop
                    </span>
                </div>
                <div className='flex gap-3 justify-between items-center mr-3 w-16 h-auto'>
                    <span className='w-1/2'>
                        <Image 
                            src="/images/icons/cart.png"
                            width={25}
                            height={25}
                            alt='Cart'
                        />
                    </span>
                    <span className='w-1/2'>
                        <Image 
                            src="/images/icons/account.png"
                            width={25}
                            height={25}
                            alt='Cart'
                        />
                    </span>
                </div>
            </div>
            <div>

            </div>
        </div>
     );
}
 
export default Navbar;