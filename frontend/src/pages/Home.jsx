import React from 'react'
import Hero from '@/features/home/Hero'
import LatestCollection from '@/features/home/LatestCollection'
import Bestseller from '@/features/home/Bestseller'
import OurPolicy from '@/features/home/OurPolicy'
import NewsletterBox from '@/features/shared/NewsletterBox'
import NewLook from '@/features/home/NewLook'
import Trends from '@/features/home/Trends'
import { Picks } from '@/features/home/Picks'
import { useSettings } from '@/hooks/useSettings'
import Newsletter from '@/components/layout/Newsletter'

const Home = () => {
  const { settings, loading, error } = useSettings();

  // Default to showing sections if settings are loading or not available
  const showNewLook = settings?.sectionVisibility?.showNewLook !== false;
  const showTrends = settings?.sectionVisibility?.showTrends !== false;

  return (
    <div className=' animate-fade animate-duration-500'>
      <Hero/>
      {showNewLook && <NewLook/>}
      {showTrends && <Trends/>}
      {/* <LatestCollection/> */}
      {/* <Bestseller/> */}
      <Picks/>

        <Newsletter/>
    </div>
  )
}

export default Home