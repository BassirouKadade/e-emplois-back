const express=require('express')
const multerUpload = require('../services/storage')
const authRoute=express.Router()

const {updateProfile,resetPassword,forgotPassword,login}=require('../controllers/authController/auth')

authRoute.post('/login',login)
authRoute.post('/update-profile', multerUpload.single('image'), updateProfile)
authRoute.post('/forgot-password',forgotPassword)
authRoute.post('/reset-password',resetPassword)


module.exports=authRoute