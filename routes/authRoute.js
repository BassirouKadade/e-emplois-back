const express=require('express')
const multerUpload = require('../services/storage')
const authRoute=express.Router()

const {updateProfile,
    verifyUserOtp,
    resendMemail,
    resetPassword,forgotPassword,login}=require('../controllers/authController/auth')

authRoute.post('/login',login)
authRoute.post('/update-profile', multerUpload.single('image'), updateProfile)
authRoute.post('/forgot-password',forgotPassword)
authRoute.post('/reset-password',resetPassword)
authRoute.post('/verifiy_user-otp',verifyUserOtp)
authRoute.post('/resendMemail',resendMemail)


module.exports=authRoute