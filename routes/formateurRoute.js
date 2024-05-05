const express=require('express')
const formateurRoute=express.Router()
const {ajouter,liste} = require('../controllers/formateurController/formateur')

formateurRoute.post('/ajouter-formateur',ajouter)
formateurRoute.get('/liste-formateur',liste)
module.exports=formateurRoute