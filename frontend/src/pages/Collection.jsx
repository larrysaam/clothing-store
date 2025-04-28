import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '@/context/ShopContext'
import Title from '@/components/Title'
import ProductItem from '@/features/shared/ProductItem'
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { assets } from '@/assets/assets'
import { CollectionSkeleton } from '@/features/collection/CollectionSkeleton'

const Collection = () => {
  const { products, search, showSearch, isLoading } = useContext(ShopContext)

  // State for filters
  const [showFilter, setShowFilter] = useState(false)
  const [filterProducts, setFilterProducts] = useState([])
  const [category, setCategory] = useState([])
  const [subCategory, setSubCategory] = useState([])
  const [sortType, setSortType] = useState('relevant')
  const [bestsellerOnly, setBestsellerOnly] = useState(false) // Bestseller filter

  // Toggle category filter
  const toggleCategory = (value) => {
    setCategory(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value])
  }

  // Toggle subcategory filter
  const toggleSubCategory = (value) => {
    setSubCategory(prev => prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value])
  }

  // Apply filters to products
  const applyFilter = () => {
    let filtered = products;

    // Search filter
    if (showSearch && search) {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))
    }

    // Category filter
    if (category.length > 0) {
      filtered = filtered.filter(item => category.includes(item.category))
    }

    // Subcategory filter
    if (subCategory.length > 0) {
      filtered = filtered.filter(item => subCategory.includes(item.subcategory))
    }

    // Bestseller filter
    if (bestsellerOnly) {
      filtered = filtered.filter(item => item.bestseller) // Assuming `bestseller` is a boolean
    }

    setFilterProducts(filtered)
  }

  // Sort products
  const sortProduct = () => {
    let sorted = [...filterProducts];

    switch (sortType) {
      case 'low-high':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'high-low':
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        applyFilter(); // Reset filter if "relevant"
        return;
    }

    setFilterProducts(sorted);
  }

  // Run filter logic when dependencies change
  useEffect(() => {
    applyFilter()
  }, [category, subCategory, search, showSearch, products, bestsellerOnly])

  useEffect(() => {
    sortProduct()
  }, [sortType])

  return (
    <div className='flex flex-col md:flex-row gap-1 sm:gap-10 pt-10 border-t animate-fade animate-duration-500'>
      {/* Filter Sidebar */}
      <div className='min-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2'>
          FILTERS
          <img src={assets.arrow} alt='dropdown-icon' className={`fill-gray-500 transition-all duration-200 h-3 rotate-270 md:hidden ${showFilter ? 'rotate-180' : ''}`} />
        </p>

        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} md:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-3 text-sm font-light text-gray-700'>
            {["Men", "Women", "Kids"].map(cat => (
              <div key={cat} className="items-center flex space-x-2">
                <Checkbox id={cat} onCheckedChange={() => toggleCategory(cat)} />
                <label htmlFor={cat} className="text-sm leading-none">{cat}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Subcategory Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} md:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-3 text-sm font-light text-gray-700'>
            {["Topwear", "Bottomwear", "Winterwear"].map(subCat => (
              <div key={subCat} className="items-center flex space-x-2">
                <Checkbox id={subCat} onCheckedChange={() => toggleSubCategory(subCat)} />
                <label htmlFor={subCat} className="text-sm leading-none">{subCat}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Bestseller Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} md:block`}>
          <p className='mb-3 text-sm font-medium'>EXTRAS</p>
          <div className="items-center flex space-x-2">
            <Checkbox id="Bestseller" onCheckedChange={() => setBestsellerOnly(!bestsellerOnly)} />
            <label htmlFor="Bestseller" className="text-sm leading-none font-light">Bestsellers</label>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1='ALL' text2='COLLECTIONS' />
          
          {/* Product Sort Dropdown */}
          <Select defaultValue='relevant' onValueChange={setSortType} className='border-2 border-gray-300 text-sm px-2'>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevant">Sort by: Relevant</SelectItem>
              <SelectItem value="low-high">Sort by: Low to High</SelectItem>
              <SelectItem value="high-low">Sort by: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Grid */}
        {isLoading ? <CollectionSkeleton /> : (
          <div>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
              {filterProducts.map((item) => (
                <ProductItem key={item._id} id={item._id} name={item.name} price={item.price} image={item.image} />
              ))}
            </div>
            {!filterProducts.length && (
              <p className='text-center text-gray-600 mt-5'>Sorry, no products were found! Please try another search.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection
