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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
    }, 5000) // 2 seconds interval

    return () => clearInterval(interval)
  }, [images.length])

  return (
    <div className='relative w-full h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden'>
      {/* Background Image */}
      <img
        src={images[currentIndex]}
        alt={`hero-background-${currentIndex}`}
        className='w-full h-full object-cover transition-opacity duration-2000'
      />

      {/* Text and Buttons */}
      <div className='absolute bottom-10 left-10 text-white'>
        <h1 className='text-xl sm:text-5xl lg:text-7xl font-bold leading-tight'>
          TURN OFFSEASON ON
        </h1>
        <p className='mt-4 text-lg sm:text-xl'>
          Get set for summer with gear that can take the heat.
        </p>
        <div className='mt-6 flex gap-4'>
          <Link
            to='/shop'
            className='px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition'
          >
            Shop
          </Link>
          <Link
            to='/shop-kids'
            className='px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition'
          >
            Shop Kids'
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Hero