import React, { useContext, useState, useEffect } from 'react'
import { MdOutlineArrowRightAlt, MdOutlineKeyboardBackspace } from "react-icons/md";
import { Link, NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { assets } from '@/assets/assets'
import { ShopContext } from '@/context/ShopContext'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false) // State to toggle sidebar
  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [activeDropdown, setActiveDropdown] = useState(null) // State for dropdown visibility
  const [dropdownTimeout, setDropdownTimeout] = useState(null) // Timeout for dropdown delay
  const [categories, setCategories] = useState({
    'All Products': {
      subcategories: ['']
    },
    Men: { subcategories: [] },
    Women: { subcategories: [] },
    Kids: { subcategories: [] }
  })
  const [isLoading, setIsLoading] = useState(true)
  const {
    showSearch, setShowSearch, getCartCount, getPreorderCartCount, navigate, token, setToken,
    cartItems, products, currency, getCartAmount, updateQuantity // Added for mini-cart
  } = useContext(ShopContext)

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

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        }
      })
      const data = await response.json()

      console.log('Fetched categories:', data)

      if (data.success) {
        // Transform backend data to match our structure
        const formattedCategories = {
          'All Products': categories['All Products'],
          ...Object.keys(data.categories).reduce((acc, mainCat) => {
            acc[mainCat] = {
              subcategories: data.categories[mainCat].subcategories.map(sub => ({
                name: sub.name,
                subcategories: sub.subcategories || []
              }))
            };
            return acc;
          }, {})
        };
        setCategories(formattedCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en');
  };

  // Helper functions for dropdown management
  const handleDropdownEnter = (category) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(category);
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // Small delay to allow moving between nav item and dropdown
    setDropdownTimeout(timeout);
  };

  const handleDropdownStay = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
  };

  const renderSubcategories = (category) => {
    if (category === 'All Products' || activeDropdown !== category) return null;

    return (
      <div className="fixed opacity-100 transition-all duration-300 pt-5 bg-white shadow-lg z-50"
           style={{
             left: '0',
             right: '0',
             width: '100vw',
             top: '80px' // Adjust based on your navbar height
           }}
           onMouseEnter={handleDropdownStay}
           onMouseLeave={handleDropdownLeave}>
        <div className="container mx-auto px-4 sm:px-8 lg:px-16 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories[category].subcategories.map((firstLevel) => (
              <div key={firstLevel.name} className="flex flex-col gap-4">
                {/* First level subcategory as heading */}
                <Link
                  to={`/collection?category=${category}&subcategory=${firstLevel.name}`}
                  className="font-medium text-black hover:text-gray-700"
                  onClick={() => setActiveDropdown(null)}
                >
                  {firstLevel.name}
                </Link>
                {/* Second level subcategories */}
                <div className="flex flex-col gap-2">
                  {firstLevel.subcategories.map((secondLevel) => (
                    <Link
                      key={secondLevel}
                      to={`/collection?category=${category}&subcategory=${firstLevel.name}&second=${secondLevel}`}
                      className="text-gray-600 hover:text-black text-sm"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {secondLevel}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Mini Cart Logic
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);

  const getMiniCartItems = () => {
    const items = [];
    if (!products || products.length === 0 || !cartItems) {
      return items;
    }

    for (const productId in cartItems) {
      if (cartItems.hasOwnProperty(productId)) {
        const product = products.find(p => p._id === productId);
        if (product) {
          for (const cartKey in cartItems[productId]) {
            if (cartItems[productId].hasOwnProperty(cartKey) && cartItems[productId][cartKey] > 0) {
              const quantity = cartItems[productId][cartKey];
              const [size, colorHex] = cartKey.includes('-') ? cartKey.split('-') : [cartKey, undefined];
              
              let colorName = '';
              let itemImage = product.image?.[0];

              if (colorHex && product.colors) {
                const colorData = product.colors.find(c => c.colorHex === colorHex);
                if (colorData) {
                  colorName = colorData.colorName;
                  if (colorData.colorImages && colorData.colorImages.length > 0) {
                    itemImage = colorData.colorImages[0];
                  }
                }
              }

              items.push({
                id: productId,
                cartKey: cartKey,
                name: product.name,
                price: product.price,
                image: itemImage,
                size: size,
                colorName: colorName,
                colorHex: colorHex,
                quantity: quantity,
                totalPrice: product.price * quantity
              });
            }
          }
        }
      }
    }
    return items;
  };

  const miniCartDisplayItems = getMiniCartItems();

  return (
    <>
      {/* Add a spacer div to prevent the navbar from overlapping the content */}
      <div className="h-[80px]"></div> {/* Adjust the height to match the navbar's height */}
      <div
        id="google_translate_element"
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
            {Object.keys(categories).map((category) => (
              <div key={category} className="group relative">
                <NavLink
                  to={category === 'All Products' ? '/collection' : '#'}
                  className='flex flex-col text-[16px] items-center gap-1'
                  onMouseEnter={() => category !== 'All Products' && handleDropdownEnter(category)}
                  onMouseLeave={handleDropdownLeave}
                  onClick={(e) => {
                    if (category !== 'All Products') {
                      e.preventDefault();
                    } else {
                      setActiveDropdown(null);
                    }
                  }}
                >
                  <p>{category}</p>
                  <hr className={`w-3/4 border-none h-[2px] bg-black transition-all duration-500 ${
                    activeDropdown === category ? 'scale-100' : 'scale-0 group-hover:scale-100'
                  }`} />
                </NavLink>
              </div>
            ))}
          </ul>

          {/* Render dropdown outside of the navigation items */}
          {Object.keys(categories).map((category) => renderSubcategories(category))}
  
          <div className='flex items-center gap-6'>
            {/* Language toggle button */}
            <button 
              onClick={toggleLanguage}
              className='px-2 py-1 text-sm border rounded hover:bg-gray-100'
            >
              {i18n.language === 'en' ? 'FR' : 'EN'}
            </button>

            {/* pre-order button */}
            <button className='w-40 h-8 hidden sm:block rounded-full bg-black text-white text-sm'>
              <Link to="/collection?preorder=true">
                <span>{t('preorder_now')}</span>
                <MdOutlineArrowRightAlt className='inline-block ml-2 bg-white text-black rounded-full w-5 h-5' />
              </Link>
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
                      onClick={() => navigate('/my-profile')}
                      className='cursor-pointer hover:text-black hover:bg-gray-100 duration-300 py-2 px-5'
                    >
                      {t('my_profile')}
                    </p>
                    <p
                      onClick={() => navigate('/orders')}
                      className='cursor-pointer hover:text-black hover:bg-gray-100 duration-300 py-2 px-5'
                    >
                      {t('orders')}
                    </p>
                    <p
                      className='cursor-pointer hover:text-black py-2 px-5 hover:bg-gray-100 duration-300'
                      onClick={logout}
                    >
                      {t('logout')}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Cart Icon and Mini-Cart Dropdown */}
            <div 
              className='relative group'
              onMouseEnter={() => setIsMiniCartOpen(true)}
              onMouseLeave={() => setIsMiniCartOpen(false)}
            >
              <button
                onClick={() => navigate('/cart')}
                className='relative transition-all duration-300 group-hover:scale-[115%]' // Slightly less scale on hover for group
              >
                <img src={assets.cart} alt='cartIcon' className='w-5 min-w-5 ' />
                {(getCartCount() + getPreorderCartCount()) > 0 && (
                  <p
                    className='absolute -right-[5px] -bottom-[5px] w-4 text-center
                      leading-4 bg-black text-white aspect-square rounded-full text-[10px]'
                  >
                    {getCartCount() + getPreorderCartCount()}
                  </p>
                )}
              </button>

              {/* Mini-Cart Dropdown - Hidden on mobile */}
              {isMiniCartOpen && (
                <div
                  className="hidden md:block absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-xl z-20
                             opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-in-out custom-scrollbar w-96" // Slide-down animation
                >
                  {miniCartDisplayItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">Your cart is empty.</div>
                  ) : (
                    <>
                      <div className="p-4 max-h-96 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"> {/* Increased max-height */}
                        {miniCartDisplayItems.map(item => (
                          <div key={`${item.id}-${item.cartKey}`} className="flex items-start gap-3 border-b pb-3 last:border-b-0 last:pb-0">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md flex-shrink-0" />
                            <div className="flex-grow text-sm">
                              <p className="font-medium text-gray-800 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                Size: {item.size} {item.colorName && `| Color: ${item.colorName}`}
                              </p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-sm font-medium text-gray-700 whitespace-nowrap">
                              {currency}{(item.price * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-700">Subtotal:</span>
                          <span className="font-bold text-lg text-black">{currency}{getCartAmount().toFixed(2)}</span>
                        </div>
                        <button
                          onClick={() => { navigate('/cart'); setIsMiniCartOpen(false); }}
                          className="w-full bg-black text-white py-2.5 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                          View Cart & Checkout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
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
            <span>{t('go_back')}</span>
          </button>
          <ul className='mt-5 flex flex-col gap-4'>
            <NavLink to='/' onClick={() => setVisible(false)} className='py-2 pl-6 border-t hover:text-black'>
              {t('home')}
            </NavLink>
            <NavLink to='/collection' onClick={() => setVisible(false)} className='py-2 pl-6 border-t hover:text-black'>
              {t('collection')}
            </NavLink>
            <NavLink to='/about' onClick={() => setVisible(false)} className='py-2 pl-6 border-t hover:text-black'>
              {t('about')}
            </NavLink>
            <NavLink to='/contact' onClick={() => setVisible(false)} className='py-2 pl-6 border-t hover:text-black'>
              {t('contact')}
            </NavLink>
          </ul>
        </div>
      </div>
    </>
  )
}

export default Navbar