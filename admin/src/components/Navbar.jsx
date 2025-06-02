import React from 'react'
import { assets } from '../assets/assets'


const Navbar = ({setToken}) => {
  return (
    <div className='flex items-center py-2 px-[4%] justify-left sm:justify-between'>
        <img className='sm:w-[max(5%,30px)] w-10 ' src={assets.logo} alt='' />
        <div className='text-xl mx-6'>Our Shop's Admin Panel</div>
       
    </div>
  )
}

export default Navbar