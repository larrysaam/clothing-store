import { useState } from 'react'
import { toast } from 'sonner'

export const useImageUpload = () => {
  const [heroFiles, setHeroFiles] = useState([])
  const [bannerFile, setBannerFile] = useState(null)
  const [lookFiles, setLookFiles] = useState({})
  const [trendFiles, setTrendFiles] = useState({})

  const handleHeroImagesChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 5) {
      toast.error('Maximum 5 hero images allowed')
      return
    }
    setHeroFiles(files)
  }

  const handleBannerImageChange = (e) => {
    setBannerFile(e.target.files[0])
  }

  const handleLookImageChange = (index, file) => {
    setLookFiles(prev => ({
      ...prev,
      [index]: file
    }))
  }

  const handleTrendImageChange = (index, file) => {
    setTrendFiles(prev => ({
      ...prev,
      [index]: file
    }))
  }

  return {
    heroFiles,
    bannerFile,
    lookFiles,
    trendFiles,
    handleHeroImagesChange,
    handleBannerImageChange,
    handleLookImageChange,
    handleTrendImageChange
  }
}
