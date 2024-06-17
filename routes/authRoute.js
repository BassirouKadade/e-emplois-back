const express=require('express')
const authRoute=express.Router()
const {login}=require('../controllers/authController/auth')

authRoute.post('/login',login)

module.exports=authRoute