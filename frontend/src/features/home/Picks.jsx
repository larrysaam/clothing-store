import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '@/assets/assets'


export const Picks = () => {
    return (
        <div className='relative w-full h-[400px] sm:h-[500px] lg:h-[700px]'>
            <img
                src={assets.Picks}
                alt='athlete picks'
                className='w-full h-full object-cover object-center'     
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent'></div>
            <div className='absolute bottom-0 left-0 right-0 flex flex-col items-center text-center pb-8 sm:pb-16'>
                <p className='text-white/90 text-xs sm:text-sm mb-1'>Athlete Picks</p>
                <h2 className='text-white text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4'>
                    Kylian Mbappé
                </h2>
                <Link
                    to='/collection'
                    className='bg-white text-black px-6 sm:px-8 py-2 text-sm sm:text-base rounded-full 
                    hover:bg-gray-100 transition-colors'
                >
                    Shop
                </Link>
            </div>
        </div>
    )
}