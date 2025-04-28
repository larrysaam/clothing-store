import React from 'react'
import { assets } from '@/assets/assets'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row border border-gray-400'>
        {/* hero left side */}
        <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
            <div className='text-[#414141]'>
                <div className='flex items-center gap-2 '>
                    <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
                    <p>OUR BESTSELLERS</p>
                </div>
                <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl 
                leading-relxed'>Latest arrivals</h1>
                <div className='flex items-center gap-2'>
                    <Link to='/collection' className='text-sm md:text-base'>
                    SHOP NOW
                    </Link>
                    <p className='w-8 md:w-11 h-[1px] bg-[#414141]'></p>
                </div>
            </div>
        </div>
        {/* hero right side */}
        <img className='w-full sm:w-1/2' src={assets.hero} alt='hero-img' />
    </div>
  )
}

export default Hero