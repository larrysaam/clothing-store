import React, { useContext, useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { assets } from '@/assets/assets'
import { ShopContext } from '@/context/ShopContext'
import { toast } from 'sonner'

const Navbar = () => {
  const [visible, setVisible] = useState(false)
  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { showSearch, setShowSearch, getCartCount, navigate, token, setToken } = useContext(ShopContext)

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    navigate('/')
    toast.success('Successfully logged out')
  }

  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY) {
        setShowNavbar(false) // Hide navbar when scrolling down
      } else {
        setShowNavbar(true) // Show navbar when scrolling up
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <>
      {/* Add a spacer div to prevent the navbar from overlapping the content */}
      <div className="h-[80px]"></div> {/* Adjust the height to match the navbar's height */}
      <div
        className={`fixed top-0 left-0 w-full pl-2 pr-2 sm:pl-16 sm:pr-16 z-50 bg-white transition-transform duration-300 ${
          showNavbar ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className='flex items-center justify-between py-5 font-medium'>
          <Link to='/' className='cursor-pointer'>
            <img src={assets.KMlogo} alt='logo' className='w-16 sm:w-18' />
          </Link>
          <ul className='hidden sm:flex gap-5 text-sm text-black'>
            <NavLink to='/' className='flex flex-col text-[18px] items-center gap-1 group'>
              <p>New & Featured</p>
              <hr className='w-3/4 border-none h-[2px] bg-black scale-0 transition-all duration-500 group-hover:scale-100 group-[.active]:scale-100' />
            </NavLink>
            <NavLink to='/collection' className='flex text-[18px] flex-col items-center gap-1 group'>
              <p>Men</p>
              <hr className='w-3/4 border-none h-[2px] bg-black scale-0 transition-all duration-500 group-hover:scale-100 group-[.active]:scale-100' />
            </NavLink>
            <NavLink to='/about' className='flex flex-col text-[18px] items-center gap-1 group'>
              <p>Women</p>
              <hr className='w-3/4 border-none h-[2px] bg-black scale-0 transition-all duration-500 group-hover:scale-100 group-[.active]:scale-100' />
            </NavLink>
            <NavLink to='/contact' className='flex flex-col text-[18px] items-center gap-1 group'>
              <p>Kids</p>
              <hr className='w-3/4 border-none h-[2px] bg-black scale-0 transition-all duration-500 group-hover:scale-100 group-[.active]:scale-100' />
            </NavLink>
          </ul>
  
          <div className='flex items-center gap-6'>
            <img
              src={assets.search}
              alt='search-icon'
              className='w-5 cursor-pointer transition-all duration-300 hover:scale-[125%]'
              onClick={() => {
                if (!location.pathname.includes('collection')) {
                  navigate('/collection')
                }
                showSearch ? setShowSearch(!showSearch) : setTimeout(() => setShowSearch(!showSearch), 200)
              }}
            />
            <div className='group relative'>
              <img
                onClick={() => (token ? null : navigate('/login'))}
                src={assets.profile}
                alt='profileIcon'
                className='w-5 cursor-pointer transition-all duration-300 group-hover:scale-[125%]'
              />
              {/* Dropdown Menu */}
              {token && (
                <div
                  className='absolute right-0 pt-4 
                      transition-all duration-300 ease-in-out 
                      opacity-0 group-hover:opacity-100 
                      translate-y-[-10px] group-hover:translate-y-0 z-10
                      invisible group-hover:visible'
                >
                  <div
                    className='flex flex-col w-32 border bg-white
                          text-gray-600'
                  >
                    <p
                      onClick={() => toast.info('Sorry, this page was not yet implemented!')}
                      className='cursor-pointer hover:text-black hover:bg-gray-100 duration-300 py-2 px-5'
                    >
                      My profile
                    </p>
                    <p
                      onClick={() => navigate('/orders')}
                      className='cursor-pointer hover:text-black hover:bg-gray-100 duration-300 py-2 px-5'
                    >
                      Orders
                    </p>
                    <p
                      className='cursor-pointer hover:text-black py-2 px-5 hover:bg-gray-100 duration-300'
                      onClick={logout}
                    >
                      Logout
                    </p>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => (token ? navigate('/cart') : navigate('/login'))}
              className='relative transition-all duration-300 hover:scale-[125%]'
            >
              <img src={assets.cart} alt='cartIcon' className='w-5 min-w-5 ' />
              <p
                className='absolute -right-[5px] -bottom-[5px] w-4 text-center 
                  leading-4 bg-black text-white  aspect-square rounded-full text-[10px]'
              >
                {getCartCount()}
              </p>
            </button>
            <img
              src={assets.burger}
              onClick={() => setVisible(true)}
              alt='menu-icon'
              className='w-5 cursor-pointer sm:hidden'
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar