import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { BsGrid,  } from 'react-icons/bs'
import {  
  BsChatDots // Example icon for messages
} from 'react-icons/bs'
import { HiMenuAlt3 } from 'react-icons/hi'
import { IoMdClose } from 'react-icons/io'
import { assets } from '../assets/assets'
import { IoSettings } from "react-icons/io5";
import { MdLibraryAddCheck } from "react-icons/md";
import { FaUsers } from 'react-icons/fa';
import { MdOutlineMail } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import useAdminPermissions from '../hooks/useAdminPermissions'

const Sidebar = ({ setToken, token }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { permissions, loading } = useAdminPermissions(token)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Helper function to check if user has permission
  const hasPermission = (section, action = 'view') => {
    if (!permissions) return true // Default to true while loading
    if (typeof permissions[section] === 'boolean') {
      return permissions[section]
    }
    return permissions[section]?.[action] || false
  }

  return (
    <>
      {/* Hamburger Button - Only visible on mobile */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 right-4 z-50 md:hidden"
      >
        {isOpen ? (
          <IoMdClose size={24} />
        ) : (
          <HiMenuAlt3 size={24} />
        )}
      </button>

      {/* Overlay - Only visible on mobile when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static top-0 left-0 h-full bg-white z-40
        w-[250px] md:w-[250px] md:min-w-[250px]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        border-r-2 flex flex-col
      `}>
        <div className='flex flex-col gap-4 pt-6 px-4 text-base overflow-y-auto flex-1'>
          {hasPermission('dashboard') && (
            <NavLink 
              to='/' 
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'
              onClick={() => setIsOpen(false)}
            >
              <BsGrid size={20} />
              <p className='block'>Dashboard</p>
            </NavLink>
          )}

          {hasPermission('categories') && (
            <NavLink 
              to='/category' 
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'
              onClick={() => setIsOpen(false)}
            >
              <MdLibraryAddCheck size={20} /> 
              <p className='block'>Category</p>
            </NavLink>
          )}
          
          {hasPermission('products', 'add') && (
            <NavLink 
              to='/add' 
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'
              onClick={() => setIsOpen(false)}
            >
              <img className='w-5 h-5' src={assets.addIcon} alt='add-icon' />
              <p className='block'>Add items</p>
            </NavLink>
          )}

          {hasPermission('products') && (
            <NavLink 
              to='/list' 
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'
              onClick={() => setIsOpen(false)}
            >
              <img className='w-5 h-5' src={assets.arrow} alt='list-icon' />
              <p className='block'>List items</p>
            </NavLink>
          )}

          {hasPermission('orders') && (
            <NavLink 
              to='/orders' 
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'
              onClick={() => setIsOpen(false)}
            >
              <img className='w-5 h-5' src={assets.orderIcon} alt='order-icon' />
              <p className='block'>Orders</p>
            </NavLink>
          )}

          {hasPermission('preorders') && (
            <NavLink 
              to='/preorders' 
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'
              onClick={() => setIsOpen(false)}
            >
              <img className='w-5 h-5' src={assets.orderIcon} alt='order-icon' />
              <p className='block'>PreOrders</p>
            </NavLink>
          )}

          {hasPermission('messages') && (
            <NavLink 
              to='/messages' 
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'
            >
              <BsChatDots size={18} /> 
              <p className='block'>Messages</p>
            </NavLink>
          )}

          {hasPermission('subscribers') && (
            <NavLink 
              to='/subscribers' 
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'
            >
              <FaUsers size={18} /> 
              <p className='block'>Subscribers</p>
            </NavLink>
          )}

          {hasPermission('newsletter', 'send') && (
            <NavLink 
              to='/send-newsletter' 
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'
            >
              <MdOutlineMail size={20} />
              <p className='block'>Send Newsletter</p>
            </NavLink>
          )}

          {hasPermission('adminManagement', 'view') && (
            <NavLink 
              to='/admin-management' 
              onClick={() => setIsOpen(false)}
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'
            >
              <RiAdminLine size={20} />
              <p className='block'>Admin Management</p>
            </NavLink>
          )}

          {hasPermission('settings') && (
            <NavLink 
              to='/settings' 
              className='flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l'
              onClick={() => setIsOpen(false)}
            >
              <IoSettings size={20} />
              <p className='block'>Settings</p>
            </NavLink>
          )}

           <button 
                onClick={()=>setToken('')}
                className='cursor-pointer bg-gray-700 hover:bg-gray-900 text-white px-5 py-2 sm:px-7 sm:py-3 rounded-lg text-xs sm:text-sm'>
                    Logout
            </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
