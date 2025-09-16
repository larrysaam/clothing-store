import userModel from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { adminLogin } from './adminController.js'


const createToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET)
}

//route for user login
const loginUser = async (req,res) => {

    try {
        
        const {email, password} = req.body;
        const user = await userModel.findOne({email})

        if (!user) {
            return res.json({
                success: false,
                message: "User doesn't exists"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = createToken(user._id)
            return res.json({
                success: true,
                token
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

//route for user register 
const registerUser = async (req,res) => {
    try {

        const { name, email, password } = req.body;

        //checking for existing user
        const exists = await userModel.findOne({email})
        if (exists) {
            return res.json({
                success: false, 
                message: 'User already exists'
            })
        }

        //validating email and password

        if (!validator.isEmail(email)) {
            return res.json({
                success: false, 
                message: 'Invalid email'
            })       
        }

        if (password.length < 8) {
            return res.json({
                success: false, 
                message: 'Please enter password with length more then 8 symbols'
            })       
        }

        if (!name) {
            return res.json({
                success: false, 
                message: 'Please enter your name'
            })       
        }

        //hashing password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({
            success: true,
            token
        })

    } catch (error) {
       console.log(error)
       res.json({
        success: false,
        message: error.message
       })
    }

}

// Admin login is now handled by adminController.js - keeping this for compatibility
const adminLoginCompat = async (req, res) => {
    // Redirect to the new admin login function
    return adminLogin(req, res)
}

//route to get user profile
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

//route to update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { userId, name, email, currentPassword, newPassword } = req.body;

        if (!userId) {
            return res.json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        // Validate email if it's being changed
        if (email && email !== user.email) {
            if (!validator.isEmail(email)) {
                return res.json({
                    success: false,
                    message: "Invalid email format"
                });
            }

            // Check if email is already taken by another user
            const emailExists = await userModel.findOne({ email, _id: { $ne: userId } });
            if (emailExists) {
                return res.json({
                    success: false,
                    message: "Email is already taken"
                });
            }
        }

        // Validate name
        if (name && name.trim().length === 0) {
            return res.json({
                success: false,
                message: "Name cannot be empty"
            });
        }

        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return res.json({
                    success: false,
                    message: "Current password is required to set new password"
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.json({
                    success: false,
                    message: "Current password is incorrect"
                });
            }

            // Validate new password
            if (newPassword.length < 8) {
                return res.json({
                    success: false,
                    message: "New password must be at least 8 characters long"
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedNewPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedNewPassword;
        }

        // Update user fields
        if (name) user.name = name.trim();
        if (email) user.email = email;

        await user.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
};

export { loginUser, registerUser, adminLoginCompat as adminLogin, getUserProfile, updateUserProfile }