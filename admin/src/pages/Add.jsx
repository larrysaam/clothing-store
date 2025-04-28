import React, { useEffect, useRef } from 'react'
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


const Add = ({token}) => {
  const pondRef = useRef()

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
    sizes: z.array(z.string()).nonempty({message: "Choose at least 1 size"}),
    bestseller: z.boolean()
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
      sizes: [],
      bestseller: false,
    },
  })
 
  async function onSubmit(values) {
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
      formData.append('category', values.category);
      formData.append('subcategory', values.subcategory);
      formData.append('sizes', JSON.stringify(sortedSizes));
      formData.append('bestseller', values.bestseller);
      for (let i=0; i < values.images.length; i++) {
        formData.append(`image${i+1}`, values.images[i].file);
      }

      const response = await axios.post(backendUrl + '/api/product/add', formData,
        {headers: {token}}
      );
      if (response.data.success) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
        console(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    reset()
    pondRef.current.removeFiles()
  }, [isSubmitSuccessful])

  const images = watch('images') || [];

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
                <Select {...field} ref={ref} error={errors.category?.message} 
                className='border-2 border-gray-300 px-2' value={field.value || ""}
                onValueChange={(value) => field.onChange(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Men">Men</SelectItem>
                  <SelectItem value="Women">Women</SelectItem>
                  <SelectItem value="Kids">Kids</SelectItem>
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
            <Select {...field} ref={ref} error={errors.subcategory?.message} 
              className='w-full max-w-[500px] px-3 py-2' value={field.value || ""}
              onValueChange={(value) => field.onChange(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Choose..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Topwear">Topwear</SelectItem>
              <SelectItem value="Bottomwear">Bottomwear</SelectItem>
              <SelectItem value="Winterwear">Winterwear</SelectItem>
            </SelectContent>
          </Select>
          )}
        />
        {errors.subcategory && <p className="text-red-500 text-sm">{errors.subcategory.message}</p>}
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

      <div className='w-full'>
        <p className='mb-2'>Product Sizes</p>
        <Controller
          name="sizes"
          control={control}
          render={({ field, ref }) => (
            <ToggleGroup type="multiple" {...field} ref={ref} error={errors.sizes?.message} size="lg" className='gap-1'
            value={field.value || ""} onValueChange={(value) => field.onChange(value)}>
              <ToggleGroupItem className='border rounded-md data-[state=on]:bg-gray-100 data-[state=on]:font-medium data-[state=on]:border-black'
              value="XS">XS</ToggleGroupItem>
              <ToggleGroupItem className='border rounded-md data-[state=on]:bg-gray-100 data-[state=on]:font-medium data-[state=on]:border-black'
              value="S">S</ToggleGroupItem>
              <ToggleGroupItem className='border rounded-md data-[state=on]:bg-gray-100 data-[state=on]:font-medium data-[state=on]:border-black'
              value="M">M</ToggleGroupItem>
              <ToggleGroupItem className='border rounded-md data-[state=on]:bg-gray-100 data-[state=on]:font-medium data-[state=on]:border-black'
              value="L">L</ToggleGroupItem>
              <ToggleGroupItem className='border rounded-md data-[state=on]:bg-gray-100 data-[state=on]:font-medium data-[state=on]:border-black'
              value="XL">XL</ToggleGroupItem>
            </ToggleGroup>
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

      <button type='submit' className='group text-sm mt-4 cursor-pointer bg-gray-700 hover:bg-gray-900 text-white pl-5 pr-4 py-2 rounded-lg flex items-center'>
        <p>Add product</p>
        <svg className='transistion-all duration-200 group-hover:rotate-90 ml-2 text-white' width="30" height="30" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="1.5"/><path stroke="#ffffff" strokeLinecap="round" strokeWidth="1.5" d="M15 12h-3m0 0H9m3 0V9m0 3v3"/></svg>
      </button>
    </form>
  )
}

export default Add