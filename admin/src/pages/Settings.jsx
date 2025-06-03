import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { backendUrl } from '../App'


const Settings = ({ token }) => {
  const [settings, setSettings] = useState({
    currency: { name: '', sign: '' },
    email: { notifications: '' },
    images: { hero: [], banner: '' }
  })
  const [heroFiles, setHeroFiles] = useState([])
  const [bannerFile, setBannerFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/settings`, {
        headers: { token }
      })
      if (response.data.success) {
        setSettings(response.data.settings)
      }
    } catch (error) {
      toast.error('Failed to fetch settings')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append('currency[name]', settings.currency.name)
      formData.append('currency[sign]', settings.currency.sign)
      formData.append('email[notifications]', settings.email.notifications)
      
      // Handle multiple hero images
      heroFiles.forEach(file => {
        formData.append('hero', file)
      })
      
      if (bannerFile) {
        formData.append('banner', bannerFile)
      }

      const response = await axios.put(`${backendUrl}/api/settings`, formData, {
        headers: { 
          token,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        toast.success('Settings updated successfully')
        setSettings(response.data.settings)
        setHeroFiles([])
      }
    } catch (error) {
      toast.error('Failed to update settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handleHeroImagesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      toast.error('Maximum 5 hero images allowed')
      return
    }
    setHeroFiles(files)
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Store Settings</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Currency Settings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Currency Name</label>
              <Input
                value={settings.currency.name}
                onChange={(e) => setSettings({
                  ...settings,
                  currency: { ...settings.currency, name: e.target.value }
                })}
                placeholder="USD"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Currency Sign</label>
              <Input
                value={settings.currency.sign}
                onChange={(e) => setSettings({
                  ...settings,
                  currency: { ...settings.currency, sign: e.target.value }
                })}
                placeholder="$"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Notification Settings</h2>
          <div>
            <label className="block text-sm mb-2">Notification Email</label>
            <Input
              type="email"
              value={settings.email.notifications}
              onChange={(e) => setSettings({
                ...settings,
                email: { ...settings.email, notifications: e.target.value }
              })}
              placeholder="notifications@example.com"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Image Settings</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm mb-2">Hero Images (up to 5)</label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleHeroImagesChange}
                className="mb-4"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {settings.images.hero.map((image, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={`${image}`}
                      alt={`Hero ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        const newHeroImages = settings.images.hero.filter((_, i) => i !== index)
                        setSettings({
                          ...settings,
                          images: { ...settings.images, hero: newHeroImages }
                        })
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full 
                               opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Banner Image</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files[0])}
              />
              {settings.images.banner && (
                <img 
                  src={`${settings.images.banner}`}
                  alt="Banner"
                  className="mt-2 max-w-full h-auto"
                />
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full sm:w-auto px-6 py-2 bg-black text-white rounded-lg 
                   hover:bg-gray-800 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}

export default Settings