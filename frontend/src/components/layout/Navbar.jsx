import React, { useContext, useState, useEffect } from 'react'
import { MdOutlineArrowRightAlt, MdOutlineKeyboardBackspace } from "react-icons/md";
import { Link, NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { assets } from '@/assets/assets'
import { ShopContext } from '@/context/ShopContext'
import { toast } from 'sonner'

const Navbar = () => {
  const [visible, setVisible] = useState(false) // State to toggle sidebar
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

  const menuItems = {
    'New & Featured': {
      Featured: ['New Releases', 'Best Sellers', 'Y2K Sneakers'],
    },
    Men: {
      Shoes: ['All Shoes', 'Lifestyle', 'Jordan', 'Running', 'Football', 'Basketball', 'Training and Gym', 'Skateboarding', 'Nike By You'],
      Clothing: ['All Clothing', 'Hoodies and Sweatshirts', 'Jackets', 'Trousers and Tights', 'Tracksuits', 'Tops and T-Shirts', 'Shorts', 'Kits and Jerseys'],
      'Discover Sport': ['Running', 'Football', 'Basketball', 'Training & Gym', 'Tennis', 'Golf'],
      'Accessories and Equipment': ['All Accessories and Equipment', 'Bags and Backpacks', 'Headwear', 'Socks'],
    },
    Women:{},
    Kids: {},
    // Add similar structures for Women and Kids
  }

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
          <div>
          </div>
          <ul className='hidden sm:flex gap-5 text-sm text-black'>
            {Object.keys(menuItems).map((category) => (
              <div key={category} className="group relative">
                <NavLink className='flex flex-col text-[16px] items-center gap-1'>
                  <p>{category}</p>
                  <hr className='w-3/4 border-none h-[2px] bg-black scale-0 transition-all duration-500 group-hover:scale-100' />
                </NavLink>
                
                {/* Updated Dropdown Menu */}
                <div className="absolute invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300 left-1/2 -translate-x-1/2 pt-5 w-screen bg-white shadow-lg">
                  <div className="container mx-auto px-16 py-8">
                    <div className="grid grid-cols-4 gap-8">
                      {Object.entries(menuItems[category]).map(([section, items]) => (
                        <div key={section} className="flex flex-col gap-4">
                          <h3 className="font-bold text-black">{section}</h3>
                          <ul className="flex flex-col gap-2">
                            {items.map((item) => (
                              <li key={item}>
                                <Link 
                                  to={`/${category.toLowerCase()}/${item.toLowerCase().replace(/ /g, '-')}`}
                                  className="text-gray-600 hover:text-black text-sm"
                                >
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </ul>
  
          <div className='flex items-center gap-6'>
            {/* pre-order button */}
            <button 
              className='w-40 h-8 hidden sm:block rounded-full bg-black text-white text-sm '
            >
              <span>Pre-Order Now</span>
              <MdOutlineArrowRightAlt className='inline-block ml-2 bg-white text-black rounded-full w-5 h-5' />
            </button>

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

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 right-0 w-full h-full bg-white z-50 transition-transform duration-300 ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='p-5'>
          <button
            onClick={() => setVisible(false)}
            className='flex items-center justify-center text-black text-lg font-bold'
          >
            <MdOutlineKeyboardBackspace className='size-6 mx-2'/> 
            <span>Go Back</span>
          </button>
          <ul className='mt-5 flex flex-col gap-4'>
            <NavLink to='/' onClick={() => setVisible(false)} className='py-2 pl-6 border-t hover:text-black'>
              Home
            </NavLink>
            <NavLink to='/collection' onClick={() => setVisible(false)} className='py-2 pl-6 border-t hover:text-black'>
              Collection
            </NavLink>
            <NavLink to='/about' onClick={() => setVisible(false)} className='py-2 pl-6 border-t hover:text-black'>
              About
            </NavLink>
            <NavLink to='/contact' onClick={() => setVisible(false)} className='py-2 pl-6 border-t hover:text-black'>
              Contact
            </NavLink>
          </ul>
        </div>
      </div>
    </>
  )
}

export default Navbar