const express=require('express')
const emploisRoute=express.Router()
const {getEmplois, creerEmplois,verificationEmplois} = require('../controllers/emploisController/emploisController');

emploisRoute.post('/verification-disponibilite-emplois', verificationEmplois);
emploisRoute.post('/creer-emplois', creerEmplois);
emploisRoute.get('/get-emplois', getEmplois);
module.exports=emploisRoute