const express=require('express')
const formateurRoute=express.Router()
const {ajouter,supprimer,update,searchNext,search,liste} = require('../controllers/formateurController/formateur')

formateurRoute.post('/ajouter-formateur',ajouter)
formateurRoute.get('/liste-formateur',liste)
formateurRoute.delete('/supprimer-formateur/:ids',supprimer)
formateurRoute.put('/update-formateur/',update)
formateurRoute.get('/search-next-page/',searchNext)
formateurRoute.get('/search-formateur/',search)
module.exports=formateurRoute