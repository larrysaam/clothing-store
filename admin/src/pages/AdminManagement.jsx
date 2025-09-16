import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Shield, Trash2, Users, Settings, Crown, UserCheck, UserX, Lock, Unlock } from 'lucide-react'

const AdminManagement = ({ token }) => {
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    permissions: {
      dashboard: true,
      products: {
        view: true,
        add: false,
        edit: false,
        delete: false
      },
      orders: {
        view: true,
        edit: false
      },
      preorders: {
        view: true,
        edit: false
      },
      categories: {
        view: true,
        manage: false
      },
      settings: {
        view: false,
        edit: false
      },
      messages: {
        view: true
      },
      subscribers: {
        view: true,
        manage: false
      },
      newsletter: {
        send: false
      },
      adminManagement: {
        view: false,
        manage: false
      }
    }
  })

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/adminmgmt/list`, {
        headers: { token }
      })
      
      if (response.data.success) {
        setAdmins(response.data.admins)
      } else {
        toast.error(response.data.message || 'Failed to fetch admins')
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch admins')
    } finally {
      setLoading(false)
    }
  }

  // Add new admin
  const addAdmin = async () => {
    try {
      if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
        toast.error('All fields are required')
        return
      }

      const response = await axios.post(`${backendUrl}/api/adminmgmt/add`, newAdmin, {
        headers: { token }
      })

      if (response.data.success) {
        toast.success('Admin added successfully')
        setIsAddDialogOpen(false)
        setNewAdmin({
          name: '',
          email: '',
          password: '',
          permissions: {
            dashboard: true,
            products: {
              view: true,
              add: false,
              edit: false,
              delete: false
            },
            orders: {
              view: true,
              edit: false
            },
            preorders: {
              view: true,
              edit: false
            },
            categories: {
              view: true,
              manage: false
            },
            settings: {
              view: false,
              edit: false
            },
            messages: {
              view: true
            },
            subscribers: {
              view: true,
              manage: false
            },
            newsletter: {
              send: false
            },
            adminManagement: {
              view: false,
              manage: false
            }
          }
        })
        fetchAdmins()
      } else {
        toast.error(response.data.message || 'Failed to add admin')
      }
    } catch (error) {
      console.error('Error adding admin:', error)
      toast.error(error.response?.data?.message || 'Failed to add admin')
    }
  }

  // Update admin permissions
  const updateAdminPermissions = async (adminId, permissions, isActive) => {
    try {
      const response = await axios.put(`${backendUrl}/api/adminmgmt/permissions`, {
        adminId,
        permissions,
        isActive
      }, {
        headers: { token }
      })

      if (response.data.success) {
        toast.success('Admin updated successfully')
        fetchAdmins()
      } else {
        toast.error(response.data.message || 'Failed to update admin')
      }
    } catch (error) {
      console.error('Error updating admin:', error)
      toast.error(error.response?.data?.message || 'Failed to update admin')
    }
  }

  // Delete admin
  const deleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return

    try {
      const response = await axios.delete(`${backendUrl}/api/adminmgmt/delete`, {
        headers: { token },
        data: { adminId }
      })

      if (response.data.success) {
        toast.success('Admin deleted successfully')
        fetchAdmins()
      } else {
        toast.error(response.data.message || 'Failed to delete admin')
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error(error.response?.data?.message || 'Failed to delete admin')
    }
  }

  // Toggle admin active status
  const toggleAdminStatus = async (admin) => {
    await updateAdminPermissions(admin._id, admin.permissions, !admin.isActive)
  }

  // Update permission
  const updatePermission = (adminId, section, permission, value) => {
    const admin = admins.find(a => a._id === adminId)
    if (!admin) return

    const newPermissions = { ...admin.permissions }
    if (typeof newPermissions[section] === 'object') {
      newPermissions[section] = { ...newPermissions[section], [permission]: value }
    } else {
      newPermissions[section] = value
    }

    updateAdminPermissions(adminId, newPermissions, admin.isActive)
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const PermissionSwitch = ({ adminId, section, permission, checked, label, disabled = false }) => (
    <div className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-white/50 transition-colors duration-200">
      <Label 
        htmlFor={`${adminId}-${section}-${permission}`} 
        className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
      >
        {label}
      </Label>
      <Switch
        id={`${adminId}-${section}-${permission}`}
        checked={checked}
        onCheckedChange={(value) => updatePermission(adminId, section, permission, value)}
        disabled={disabled}
        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-emerald-500"
      />
    </div>
  )

  const AdminCard = ({ admin }) => (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`relative p-4 rounded-2xl ${
              admin.role === 'superadmin' 
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg' 
                : admin.isActive 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 shadow-lg'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg'
            }`}>
              {admin.role === 'superadmin' ? (
                <Crown className="h-8 w-8 text-white" />
              ) : admin.isActive ? (
                <UserCheck className="h-8 w-8 text-white" />
              ) : (
                <UserX className="h-8 w-8 text-white" />
              )}
              {admin.role === 'superadmin' && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                  <Shield className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors duration-300">
                {admin.name}
              </CardTitle>
              <CardDescription className="text-gray-600 text-base mb-2">{admin.email}</CardDescription>
              <div className="flex items-center space-x-2">
                <Badge 
                  variant={admin.isActive ? 'default' : 'secondary'} 
                  className={`px-3 py-1 font-semibold ${
                    admin.isActive 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {admin.isActive ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Active
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      Inactive
                    </>
                  )}
                </Badge>
                {admin.role === 'superadmin' && (
                  <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200 px-3 py-1 font-semibold">
                    <Crown className="h-3 w-3 mr-1" />
                    Super Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {admin.role !== 'superadmin' && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleAdminStatus(admin)}
                className={`px-4 py-2 border-2 transition-all duration-300 ${
                  admin.isActive 
                    ? 'border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400' 
                    : 'border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400'
                }`}
              >
                {admin.isActive ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Activate
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteAdmin(admin._id)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white border-2 border-red-500 hover:border-red-600 transition-all duration-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      {admin.role !== 'superadmin' && (
        <CardContent className="pt-6">
          <Tabs defaultValue="core" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger value="core" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
                Core Access
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
                Products
              </TabsTrigger>
              <TabsTrigger value="orders" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
                Orders
              </TabsTrigger>
              <TabsTrigger value="admin" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg font-medium">
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="core" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-blue-500 p-2 rounded-lg mr-3">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    Dashboard Access
                  </h4>
                  <PermissionSwitch
                    adminId={admin._id}
                    section="dashboard"
                    permission=""
                    checked={admin.permissions.dashboard}
                    label="View Dashboard"
                  />
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-purple-500 p-2 rounded-lg mr-3">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    Categories
                  </h4>
                  <PermissionSwitch
                    adminId={admin._id}
                    section="categories"
                    permission="view"
                    checked={admin.permissions.categories?.view}
                    label="View Categories"
                  />
                  <PermissionSwitch
                    adminId={admin._id}
                    section="categories"
                    permission="manage"
                    checked={admin.permissions.categories?.manage}
                    label="Manage Categories"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <div className="bg-green-500 p-2 rounded-lg mr-3">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  Product Management
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <PermissionSwitch
                    adminId={admin._id}
                    section="products"
                    permission="view"
                    checked={admin.permissions.products?.view}
                    label="View Products"
                  />
                  <PermissionSwitch
                    adminId={admin._id}
                    section="products"
                    permission="add"
                    checked={admin.permissions.products?.add}
                    label="Add Products"
                  />
                  <PermissionSwitch
                    adminId={admin._id}
                    section="products"
                    permission="edit"
                    checked={admin.permissions.products?.edit}
                    label="Edit Products"
                  />
                  <PermissionSwitch
                    adminId={admin._id}
                    section="products"
                    permission="delete"
                    checked={admin.permissions.products?.delete}
                    label="Delete Products"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-orange-500 p-2 rounded-lg mr-3">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    Orders
                  </h4>
                  <PermissionSwitch
                    adminId={admin._id}
                    section="orders"
                    permission="view"
                    checked={admin.permissions.orders?.view}
                    label="View Orders"
                  />
                  <PermissionSwitch
                    adminId={admin._id}
                    section="orders"
                    permission="edit"
                    checked={admin.permissions.orders?.edit}
                    label="Edit Orders"
                  />
                </div>

                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-cyan-500 p-2 rounded-lg mr-3">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    Pre-orders
                  </h4>
                  <PermissionSwitch
                    adminId={admin._id}
                    section="preorders"
                    permission="view"
                    checked={admin.permissions.preorders?.view}
                    label="View Pre-orders"
                  />
                  <PermissionSwitch
                    adminId={admin._id}
                    section="preorders"
                    permission="edit"
                    checked={admin.permissions.preorders?.edit}
                    label="Edit Pre-orders"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-gray-500 p-2 rounded-lg mr-3">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    System Settings
                  </h4>
                  <PermissionSwitch
                    adminId={admin._id}
                    section="settings"
                    permission="view"
                    checked={admin.permissions.settings?.view}
                    label="View Settings"
                  />
                  <PermissionSwitch
                    adminId={admin._id}
                    section="settings"
                    permission="edit"
                    checked={admin.permissions.settings?.edit}
                    label="Edit Settings"
                  />
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                    <div className="bg-indigo-500 p-2 rounded-lg mr-3">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    Communication
                  </h4>
                  <PermissionSwitch
                    adminId={admin._id}
                    section="messages"
                    permission="view"
                    checked={admin.permissions.messages?.view}
                    label="View Messages"
                  />
                  <PermissionSwitch
                    adminId={admin._id}
                    section="subscribers"
                    permission="view"
                    checked={admin.permissions.subscribers?.view}
                    label="View Subscribers"
                  />
                  <PermissionSwitch
                    adminId={admin._id}
                    section="subscribers"
                    permission="manage"
                    checked={admin.permissions.subscribers?.manage}
                    label="Manage Subscribers"
                  />
                  <PermissionSwitch
                    adminId={admin._id}
                    section="newsletter"
                    permission="send"
                    checked={admin.permissions.newsletter?.send}
                    label="Send Newsletter"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <div className="text-xl font-semibold text-gray-700">Loading admin dashboard...</div>
            <div className="text-sm text-gray-500 mt-2">Please wait while we fetch the data</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Admin Management
                </h1>
                <p className="text-gray-600 mt-1">Manage admin users and configure their permissions</p>
              </div>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Add New Admin
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Create a new admin user with basic permissions. You can modify permissions after creation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                    <Input
                      id="name"
                      value={newAdmin.name}
                      onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                      placeholder="Enter admin full name"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      placeholder="admin@example.com"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={addAdmin}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Create Admin
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Admins</p>
                  <p className="text-3xl font-bold text-gray-900">{admins.length}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Admins</p>
                  <p className="text-3xl font-bold text-green-600">{admins.filter(admin => admin.isActive).length}</p>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Super Admins</p>
                  <p className="text-3xl font-bold text-yellow-600">{admins.filter(admin => admin.role === 'superadmin').length}</p>
                </div>
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full">
                  <Crown className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin List */}
        <div className="space-y-6">
          {admins.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="text-center py-16">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-600 mb-2">No admins found</p>
                <p className="text-gray-500">Start by adding your first admin user</p>
              </CardContent>
            </Card>
          ) : (
            admins.map((admin) => (
              <AdminCard key={admin._id} admin={admin} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminManagement
