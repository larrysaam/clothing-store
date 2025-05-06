import React, { useState, useEffect } from 'react'
import { assets } from '@/assets/assets'
import { Link } from 'react-router-dom'

const Hero = () => {
  const images = [
    assets.hero1, // Replace with the actual image paths
    assets.hero2,
    assets.hero3,
    assets.hero4,
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
        setFade(false)
      }, 500) // Half a second for fade-out
    }, 5000) // 5 seconds delay

    return () => clearInterval(interval)
  }, [images.length])

return (
    <div className='flex flex-col sm:flex-row border border-gray-400'>
        {/* hero left side */}
        <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
            <div className='text-[#414141]'>
                <div className='flex items-center gap-2 '>
                    <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
                    <p>OUR BESTSELLERS</p>
                </div>
                <h1
                    className='prata-regular text-3xl sm:py-3 lg:text-7xl 
                            leading-relxed'
                >
                    Latest arrivals
                </h1>
                <div className='flex items-center gap-2'>
                    <Link to='/collection' className='text-sm md:text-base'>
                        SHOP NOW
                    </Link>
                    <p className='w-8 md:w-11 h-[1px] bg-[#414141]'></p>
                </div>
            </div>
        </div>
        {/* hero right side */}
        <div className='w-full sm:w-1/2 overflow-hidden relative flex justify-center items-center'>
            <img
                className={`w-full max-w-[550px] min-w-[550px] sm:max-h-[550px] sm:min-h-[550px] h-[400px] object-cover object-top transition-opacity duration-500 ease-in-out ${
                    fade ? 'opacity-0' : 'opacity-100'
                }`}
                src={images[currentIndex]}
                alt={`hero-img-${currentIndex}`}
            />
        </div>
    </div>
)
}

export default Hero