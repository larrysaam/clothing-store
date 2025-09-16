import jwt from 'jsonwebtoken'
import adminModel from '../models/adminModel.js'

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers
        
        if (!token) {
            return res.json({
                success: false,
                message: "Not authorized. Please login again"
            })
        }

        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            return res.json({
                success: false,
                message: "Invalid token. Please login again"
            })
        }

        // Check if it's the old env-based superadmin token (backward compatibility)
        if (typeof decoded === 'string' && decoded === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
            req.admin = {
                id: 'env-superadmin',
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
            return next()
        }

        // Check if it's a new database-based admin token
        if (decoded && decoded.id && decoded.role) {
            const admin = await adminModel.findById(decoded.id).select('-password')
            
            if (!admin || !admin.isActive) {
                return res.json({
                    success: false,
                    message: "Admin not found or inactive. Please login again"
                })
            }

            req.admin = {
                id: admin._id.toString(),
                role: admin.role,
                permissions: admin.permissions,
                name: admin.name,
                email: admin.email
            }
            
            return next()
        }

        return res.json({
            success: false,
            message: "Not authorized. Please login again"
        })
        
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

// Middleware to check specific permissions
const checkPermission = (section, action = 'view') => {
    return (req, res, next) => {
        const admin = req.admin
        
        if (!admin) {
            return res.json({
                success: false,
                message: "Not authorized"
            })
        }

        // Superadmin has all permissions
        if (admin.role === 'superadmin') {
            return next()
        }

        // Check specific permission
        const hasPermission = admin.permissions?.[section]?.[action] || admin.permissions?.[section]
        
        if (!hasPermission) {
            return res.json({
                success: false,
                message: `Access denied. You don't have permission to ${action} ${section}`
            })
        }
        
        next()
    }
}

// Middleware to check if user is superadmin
const superAdminOnly = (req, res, next) => {
    const admin = req.admin
    
    if (!admin || admin.role !== 'superadmin') {
        return res.json({
            success: false,
            message: "Access denied. Superadmin only"
        })
    }
    
    next()
}

export default adminAuth
export { checkPermission, superAdminOnly }
