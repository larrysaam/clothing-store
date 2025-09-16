import adminModel from '../models/adminModel.js'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const createToken = (id, role = 'admin') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET)
}

// Create superadmin on first run (if not exists)
const createSuperAdmin = async () => {
    try {
        const superAdminExists = await adminModel.findOne({ role: 'superadmin' })
        
        if (!superAdminExists) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash('123qwe123', salt)
            
            const superAdmin = new adminModel({
                name: 'Super Admin',
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'superadmin',
                permissions: {
                    dashboard: true,
                    products: {
                        view: true,
                        add: true,
                        edit: true,
                        delete: true
                    },
                    orders: {
                        view: true,
                        edit: true
                    },
                    preorders: {
                        view: true,
                        edit: true
                    },
                    categories: {
                        view: true,
                        manage: true
                    },
                    settings: {
                        view: true,
                        edit: true
                    },
                    messages: {
                        view: true
                    },
                    subscribers: {
                        view: true,
                        manage: true
                    },
                    newsletter: {
                        send: true
                    },
                    adminManagement: {
                        view: true,
                        manage: true
                    }
                },
                isActive: true
            })
            
            await superAdmin.save()
            console.log('Super admin created successfully')
        }
    } catch (error) {
        console.error('Error creating super admin:', error)
    }
}

// Call this function when server starts
createSuperAdmin()

// Admin login (enhanced to support both superadmin and regular admins)
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        // First check if it's the env-based superadmin (backward compatibility)
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            return res.json({
                success: true,
                token,
                admin: {
                    email: email,
                    role: 'superadmin',
                    permissions: {
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
                    }
                }
            })
        }

        // Check database admins
        const admin = await adminModel.findOne({ email, isActive: true })

        if (!admin) {
            return res.json({
                success: false,
                message: "Admin doesn't exist or is inactive"
            })
        }

        const isMatch = await bcrypt.compare(password, admin.password)

        if (isMatch) {
            const token = createToken(admin._id, admin.role)
            return res.json({
                success: true,
                token,
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions
                }
            })
        } else {
            return res.json({
                success: false,
                message: "Invalid credentials"
            })
        }

    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Get all admins (superadmin only)
const getAllAdmins = async (req, res) => {
    try {
        const admins = await adminModel.find({})
            .select('-password')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })

        res.json({
            success: true,
            admins
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Add new admin (superadmin only)
const addAdmin = async (req, res) => {
    try {        const { name, email, password, permissions } = req.body
        const createdById = req.admin?.id === 'env-superadmin' ? null : req.admin?.id // From auth middleware

        // Validation
        if (!name || !email || !password) {
            return res.json({
                success: false,
                message: "All fields are required"
            })
        }

        if (!validator.isEmail(email)) {
            return res.json({
                success: false,
                message: "Invalid email format"
            })
        }

        if (password.length < 6) {
            return res.json({
                success: false,
                message: "Password must be at least 6 characters long"
            })
        }

        // Check if admin already exists
        const existingAdmin = await adminModel.findOne({ email })
        if (existingAdmin) {
            return res.json({
                success: false,
                message: "Admin with this email already exists"
            })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new admin
        const newAdmin = new adminModel({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'admin',
            permissions: permissions || {
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
                },                adminManagement: {
                    view: false,
                    manage: false
                }
            }
        })

        // Only set createdBy if it's a valid ObjectId
        if (createdById && createdById !== 'env-superadmin') {
            newAdmin.createdBy = createdById
        }

        await newAdmin.save()

        res.json({
            success: true,
            message: "Admin added successfully",
            admin: {
                id: newAdmin._id,
                name: newAdmin.name,
                email: newAdmin.email,
                role: newAdmin.role,
                permissions: newAdmin.permissions,
                isActive: newAdmin.isActive
            }
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Update admin permissions (superadmin only)
const updateAdminPermissions = async (req, res) => {
    try {
        const { adminId, permissions, isActive } = req.body

        if (!adminId) {
            return res.json({
                success: false,
                message: "Admin ID is required"
            })
        }

        const admin = await adminModel.findById(adminId)
        if (!admin) {
            return res.json({
                success: false,
                message: "Admin not found"
            })
        }

        if (admin.role === 'superadmin') {
            return res.json({
                success: false,
                message: "Cannot modify superadmin permissions"
            })
        }

        // Update permissions and/or active status
        if (permissions) {
            admin.permissions = permissions
        }
        if (typeof isActive === 'boolean') {
            admin.isActive = isActive
        }

        await admin.save()

        res.json({
            success: true,
            message: "Admin updated successfully",
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                isActive: admin.isActive
            }
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Delete admin (superadmin only)
const deleteAdmin = async (req, res) => {
    try {
        const { adminId } = req.body

        if (!adminId) {
            return res.json({
                success: false,
                message: "Admin ID is required"
            })
        }

        const admin = await adminModel.findById(adminId)
        if (!admin) {
            return res.json({
                success: false,
                message: "Admin not found"
            })
        }

        if (admin.role === 'superadmin') {
            return res.json({
                success: false,
                message: "Cannot delete superadmin"
            })
        }

        await adminModel.findByIdAndDelete(adminId)

        res.json({
            success: true,
            message: "Admin deleted successfully"
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

// Get current admin profile
const getAdminProfile = async (req, res) => {
    try {
        const adminId = req.admin?.id

        if (!adminId) {
            return res.json({
                success: false,
                message: "Admin ID is required"
            })
        }

        // Handle env-based superadmin (backward compatibility)
        if (adminId === 'env-superadmin') {
            return res.json({
                success: true,
                admin: {
                    id: 'env-superadmin',
                    name: 'Super Admin',
                    email: process.env.ADMIN_EMAIL || 'admin@test.com',
                    role: 'superadmin',
                    permissions: req.admin.permissions,
                    isActive: true
                }
            })
        }

        const admin = await adminModel.findById(adminId).select('-password')

        if (!admin) {
            return res.json({
                success: false,
                message: "Admin not found"
            })
        }

        res.json({
            success: true,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                permissions: admin.permissions,
                isActive: admin.isActive
            }
        })
    } catch (error) {
        console.log(error)
        res.json({
            success: false,
            message: error.message
        })
    }
}

export { 
    adminLogin, 
    getAllAdmins, 
    addAdmin, 
    updateAdminPermissions, 
    deleteAdmin, 
    getAdminProfile 
}
