const express=require('express')
const multerUpload = require('../services/storage')
const authRoute=express.Router()

const {updateProfile,login}=require('../controllers/authController/auth')

authRoute.post('/login',login)
authRoute.post('/update-profile', multerUpload.single('image'), updateProfile)


module.exports=authRoute