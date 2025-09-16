import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'

// Hook to get current admin permissions
const useAdminPermissions = (token) => {
  const [permissions, setPermissions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [adminInfo, setAdminInfo] = useState(null)

  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await axios.get(`${backendUrl}/api/adminmgmt/profile`, {
          headers: { token }
        })

        if (response.data.success) {
          setPermissions(response.data.admin.permissions)
          setAdminInfo(response.data.admin)
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error)
        // Fallback: assume superadmin if profile fetch fails (for backward compatibility)
        setPermissions({
          dashboard: true,
          products: { view: true, add: true, edit: true, delete: true },
          orders: { view: true, edit: true },
          preorders: { view: true, edit: true },
          categories: { view: true, manage: true },
          settings: { view: true, edit: true },
          messages: { view: true },
          subscribers: { view: true, manage: true },
          newsletter: { send: true },
          adminManagement: { view: true, manage: true }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAdminProfile()
  }, [token])

  return { permissions, loading, adminInfo }
}

export default useAdminPermissions
