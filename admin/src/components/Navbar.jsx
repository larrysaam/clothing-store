import React from 'react'
import { assets } from '../assets/assets'


const Navbar = ({setToken}) => {
  return (
    <div className='flex items-center py-2 px-[4%] justify-between'>
        <img className='w-[max(7%,30px)]' src={assets.logo} alt='' />
        <div className='text-xl'>Our Shop's Admin Panel</div>
        <button 
        onClick={()=>setToken('')}
        className='cursor-pointer bg-gray-700 hover:bg-gray-900 text-white px-5 py-2 sm:px-7 sm:py-3 rounded-lg text-xs sm:text-sm'>
            Logout
        </button>
    </div>
  )
}

export default Navbar