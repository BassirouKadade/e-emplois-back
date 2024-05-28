const express=require('express')
const formateurRoute=express.Router()
const {ajouter,allFormateurs,formateurSupprimerGroupeormateur,getGroupesNonInclusFormateur,supprimer,getGroupeFormateur,addGroupeFormateur,update,searchNext,liste} = require('../controllers/formateurController/formateur')

formateurRoute.post('/ajouter-formateur',ajouter)
formateurRoute.get('/liste-formateur',liste)
formateurRoute.delete('/supprimer-formateur/:ids',supprimer)
formateurRoute.put('/update-formateur/',update)
formateurRoute.get('/search-next-page/',searchNext)
formateurRoute.get('/all-formateurs/',allFormateurs)
formateurRoute.post('/add-groupe-formateur/',addGroupeFormateur)
formateurRoute.get('/groupe-formateur/',getGroupeFormateur)
formateurRoute.get('/getGroupesNonInclusFormateur',getGroupesNonInclusFormateur)
formateurRoute.post('/supprimer-groupe-formateur',formateurSupprimerGroupeormateur)

// formateurRoute.get('/search-formateur/',search)
module.exports=formateurRoute