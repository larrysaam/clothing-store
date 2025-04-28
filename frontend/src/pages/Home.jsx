import React from 'react'
import Hero from '@/features/home/Hero'
import LatestCollection from '@/features/home/LatestCollection'
import Bestseller from '@/features/home/Bestseller'
import OurPolicy from '@/features/home/OurPolicy'
import NewsletterBox from '@/features/shared/NewsletterBox'

const Home = () => {
  return (
    <div className=' animate-fade animate-duration-500'>
      <Hero/>
      <LatestCollection/>
      <Bestseller/>
      <OurPolicy/>
      <NewsletterBox/>
    </div>
  )
}

export default Home