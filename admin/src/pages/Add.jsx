import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

// Register the FilePond plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

const CLOTHING_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
const SHOE_SIZES = Array.from({ length: 23 }, (_, i) => (i + 26).toString())
const KIDS_SHOE_SIZES = Array.from({ length: 13 }, (_, i) => (i + 26).toString())

const Add = ({token}) => {
  const pondRef = useRef()
  const [availableSubcategories, setAvailableSubcategories] = useState([])
  const [availableSubSubcategories, setAvailableSubSubcategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState({})
  const [sizeType, setSizeType] = useState('clothing') // Add this line

  // Update validation schema
  const validationSchema = z.object({
    images: z.any()
    .refine(() => images.length > 0, {
      message: 'Please select at least one file.',
    })
    .refine(() => images.length < 5, {
      message: 'You can upload maximus 4 images at once',
    }),
    name: z.string().min(2, {message: "Enter product name"}),
    description: z.string().min(2, {message: "Description is required"}),
    price: z.coerce.number().positive({message : "Please enter product price"}),
    category: z.string().min(1, {message: "Category is required"}),
    subcategory: z.string().min(1, {message: "Subcategory is required"}),
    subsubcategory: z.string().min(1, {message: "Second level category is required"}),
    sizes: z.array(z.object({
      size: z.string(),
      quantity: z.number().min(0, "Quantity cannot be negative")
    })).nonempty({ message: "Choose at least 1 size with quantity" }),
    bestseller: z.boolean(),
    preorder: z.boolean(),
    label: z.string().optional(),
    sizeType: z.string(),
  })

  const { control, handleSubmit, reset, watch, formState: { errors, isSubmitSuccessful } } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      images: [],
      name: "",
      description: "",
      price: "",
      category: "",
      subcategory: "",
      subsubcategory: "",
      sizes: [],
      bestseller: false,
      preorder: false,
      label: "none", // Changed from empty string to "none"
      sizeType: 'clothing',
    },
  })
 
  async function onSubmit(values) {
    setIsSubmitting(true)
    try {
      const formData = new FormData()

      let sizesWeights = {
        'XS':1, 
        'S':2, 
        'M':3, 
        'L':4, 
        'XL':5
      };
      let sortedSizes = values.sizes.sort((a,b)=>sizesWeights[a]-sizesWeights[b]);

      formData.append('name', values.name);
      formData.append('description', values.description);
      formData.append('price', values.price);
      formData.append('category', values.category)
      formData.append('subcategory', values.subcategory)
      formData.append('subsubcategory', values.subsubcategory)
      formData.append('sizes', JSON.stringify(sortedSizes));
      formData.append('bestseller', values.bestseller);
      formData.append('preorder', values.preorder);
      formData.append('label', values.label)
      for (let i=0; i < values.images.length; i++) {
        formData.append(`image${i+1}`, values.images[i].file);
      }

      const response = await axios.post(backendUrl + '/api/product/add', formData,
        {headers: {token}}
      );
      
      if (response.data.success) {
        toast.success('Product added successfully!')
        reset() // Reset form
        pondRef.current.removeFiles() // Clear images
      } else {
        toast.error(response.data.message || 'Failed to add product')
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || 'Failed to add product')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update the fetchCategories function
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/categories`, {
        headers: { token }
      })
      if (response.data.success) {
        // Convert array to object with names as keys
        const categoriesObj = response.data.categories.reduce((acc, cat) => {
          acc[cat.name] = {
            ...cat,
            subcategories: cat.subcategories || []
          }
          return acc
        }, {})
        setCategories(categoriesObj)
      }
    } catch (error) {
      toast.error('Failed to fetch categories')
      console.error(error)
    }
  }

  // Modify the existing useEffect to fetch categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  // Update the fetchSubcategories function
  const fetchSubcategories = async (selectedCategory) => {
    if (categories[selectedCategory]) {
      setAvailableSubcategories(
        categories[selectedCategory].subcategories.map(sub => sub.name)
      )
    }
  }

  // Update the fetchSubSubcategories function
  const fetchSubSubcategories = async (category, subcategory) => {
    if (categories[category]) {
      const subCat = categories[category].subcategories
        .find(sub => sub.name === subcategory)
      if (subCat) {
        setAvailableSubSubcategories(subCat.subcategories)
      }
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const selectedCategory = watch('category')
    if (selectedCategory) {
      fetchSubcategories(selectedCategory)
    }
  }, [])

  useEffect(() => {
    const subcategory = watch('subcategory')
    if (subcategory) {
      // Only reset sizes, don't automatically change size type
      reset({ ...watch(), sizes: [] })
    }
  }, [watch('subcategory')])

  const images = watch('images') || [];

  const getSizeOptions = () => {
  const category = watch('category')
  const sizeType = watch('sizeType')

  if (sizeType === 'shoes') {
    return category === 'Kids' ? KIDS_SHOE_SIZES : SHOE_SIZES
  }
  return CLOTHING_SIZES
}

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className='flex flex-col w-full items-start gap-3'>
      <div className='w-full'>
        <p className='mb-2'>Upload up to 4 images</p>
        <div className='flex flex-col gap-2'>
          <Controller
          name="images"
          control={control}
          render={({ field }) => (
                  <FilePond
                      {...field}
                      ref={pondRef}
                      className='max-w-[500px]'
                      onupdatefiles={fileItems => field.onChange(fileItems)}
                      value={images}
                      acceptedFileTypes={['image/*']}
                      allowReorder={true}
                      allowMultiple={true}
                      imagePreviewHeight={100}
                      styleButtonRemoveItemPosition='right'
                      credits={['https://github.com/ashaldenkov','Powered by Alexey Shaldenkov:)']}
                      labelIdle='Drag & Drop your files or <span class="filepond--label-action">Browse</span>'
                  />
                )}
                />
              {errors.images && <p className="text-red-500 text-sm">{errors.images.message}</p>}
        </div>
      </div>

      <div className='w-full '>
        <p className='mb-2'>Product name</p>
        <Controller
              name="name"
              control={control}
              render={({ field, ref }) => (
                <Input 
                {...field} 
                ref={ref}
                type="text"
                placeholder="Enter product name" 
                className='w-full px-3 py-2 max-w-[500px]'
                error={errors.name?.message} 
                />
              )}
          />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>

      <div className='w-full '>
        <p className='mb-2'>Product description</p>
        <Controller
          name="description"
          control={control}
          render={({ field, ref }) => (
            <Textarea 
              {...field} 
              ref={ref}
              type='text'
              placeholder='Enter description'
              error={errors.description?.message} 
              className='w-full max-w-[500px] px-3 py-2'
            />
          )}
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

        <div>
          <p className='mb-2'>Product category</p>
          <Controller
              name="category"
              control={control}
              render={({ field, ref }) => (
                <Select 
                  {...field} 
                  ref={ref} 
                  error={errors.category?.message} 
                  className='border-2 border-gray-300 px-2' 
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Reset subcategory when category changes
                    reset({ ...watch(), subcategory: '' })
                    // Fetch subcategories for selected category
                    fetchSubcategories(value)
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Choose..." />
                  </SelectTrigger>
                  <SelectContent>
                    {console.log(categories)}
                    {Object.keys(categories).map((categoryName) => (
                      <SelectItem key={categoryName} value={categoryName}>
                        {categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
        {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>

        <div>
          <p className='mb-2'>Subcategory</p>
          <Controller
          name="subcategory"
          control={control}
          render={({ field, ref }) => (
            <Select 
              {...field} 
              ref={ref} 
              error={errors.subcategory?.message} 
              className='w-full max-w-[500px] px-3 py-2' 
              value={field.value || ""}
              onValueChange={(value) => {
                field.onChange(value)
                const category = watch('category')
                if (category && value) {
                  fetchSubSubcategories(category, value)
                }
              }}
              disabled={!watch('category') || availableSubcategories.length === 0}
            >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Choose..." />
            </SelectTrigger>
            <SelectContent>
              {availableSubcategories.map((subcategory) => (
                <SelectItem key={subcategory} value={subcategory}>
                  {subcategory}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          )}
        />
        {errors.subcategory && <p className="text-red-500 text-sm">{errors.subcategory.message}</p>}
        </div>

             <div>
                <p className='mb-2'>Second Level Category</p>
                <Controller
                  name="subsubcategory"
                  control={control}
                  render={({ field, ref }) => (
                    <Select 
                      {...field} 
                      ref={ref} 
                      error={errors.subsubcategory?.message} 
                      className='w-full max-w-[500px] px-3 py-2' 
                      value={field.value || ""}
                      onValueChange={(value) => field.onChange(value)}
                      disabled={!watch('subcategory') || availableSubSubcategories.length === 0}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Choose..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubSubcategories.map((subsubcategory) => (
                          <SelectItem key={subsubcategory.name} value={subsubcategory.name}>
                            {subsubcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subsubcategory && (
                  <p className="text-red-500 text-sm">{errors.subsubcategory.message}</p>
                )}
              </div>

        <div>
          <p className='mb-2'>Product price</p> 
          <Controller
            name="price"
            control={control}
            render={({ field, ref }) => (
              <Input 
              {...field} 
              ref={ref}
              type="number"
              placeholder="0" 
              className='w-full px-3 py-2 sm:w-[120px]'
              error={errors.price?.message} 
              />
            )}
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2">Size Type</p>
        <Controller
          name="sizeType"
          control={control}
          render={({ field }) => (
            <ToggleGroup 
              type="single" 
              value={field.value}
              onValueChange={(value) => {
                if (value) {
                  field.onChange(value)
                  // Reset sizes when changing size type
                  reset({ ...watch(), sizes: [] })
                }
              }}
              className="flex gap-2"
            >
              <ToggleGroupItem 
                value="clothing" 
                className={`px-4 py-2 border rounded-md ${
                  field.value === 'clothing' ? 'bg-black text-white' : ''
                }`}
              >
                Clothing Sizes
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="shoes" 
                className={`px-4 py-2 border rounded-md ${
                  field.value === 'shoes' ? 'bg-black text-white' : ''
                }`}
              >
                Shoe Sizes
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product Sizes and Quantities</p>
        <Controller
          name="sizes"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-[500px]">
              {getSizeOptions().map((size) => (
                <div key={size} className="flex flex-col gap-2 p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{size}</span>
                    <Checkbox 
                      checked={field.value.some(s => s.size === size)}
                      onCheckedChange={(checked) => {
                        const newSizes = checked 
                          ? [...field.value, { size, quantity: 0 }]
                          : field.value.filter(s => s.size !== size);
                        field.onChange(newSizes);
                      }}
                    />
                  </div>
                  {field.value.some(s => s.size === size) && (
                    <Input
                      type="number"
                      min="0"
                      placeholder="Qty"
                      className="w-full"
                      value={field.value.find(s => s.size === size)?.quantity || 0}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 0;
                        const newSizes = field.value.map(s => 
                          s.size === size ? { ...s, quantity } : s
                        );
                        field.onChange(newSizes);
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        />
        {errors.sizes && <p className="text-red-500 text-sm">{errors.sizes.message}</p>}
      </div>

      <div className='flex items-center gap-2 mt-2 '>
        <label
          htmlFor="bestseller"
          className="cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Add to bestseller
        </label>
        <Controller
              name="bestseller"
              control={control}
              render={({ field, ref }) => (
                <Checkbox id="bestseller" aria-checked={field.value} {...field} ref={ref} checked={field.value}
                onCheckedChange={(value)=> field.onChange(value)}
                />
              )}
          />
      </div>

      <div className='flex items-center gap-2 mt-2'>
  <label
    htmlFor="preorder"
    className="cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Set as preorder
  </label>
  <Controller
    name="preorder"
    control={control}
    render={({ field, ref }) => (
      <Checkbox 
        id="preorder" 
        aria-checked={field.value} 
        {...field} 
        ref={ref} 
        checked={field.value}
        onCheckedChange={(value)=> field.onChange(value)}
      />
    )}
  />
</div>

      <div className='w-full'>
        <p className='mb-2'>Product Label</p>
        <Controller
          name="label"
          control={control}
          render={({ field, ref }) => (
            <Select 
              {...field} 
              ref={ref}
              className='w-full max-w-[500px] px-3 py-2'
              value={field.value || null}
              onValueChange={(value) => field.onChange(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a label..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Label</SelectItem>
                <SelectItem value="New model">New model</SelectItem>
                <SelectItem value="Limited Edition">Limited Edition</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <button 
        type='submit' 
        disabled={isSubmitting}
        className={`group text-sm mt-4 cursor-pointer pl-5 pr-4 py-2 rounded-lg flex items-center
          ${isSubmitting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gray-700 hover:bg-gray-900'} 
          text-white`}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Adding Product...
          </span>
        ) : (
          <>
            <p>Add product</p>
            <svg 
              className='transition-all duration-200 group-hover:rotate-90 ml-2 text-white' 
              width="30" 
              height="30" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="1.5"/>
              <path 
                stroke="#ffffff" 
                strokeLinecap="round" 
                strokeWidth="1.5" 
                d="M15 12h-3m0 0H9m3 0V9m0 3v3"
              />
            </svg>
          </>
        )}
      </button>
    </form>
  )
}

export default Add