const express=require('express')
const userRoute=express.Router()
const {ajouter,getInfoUser,liste,supprimer,
    ajouterRoleUser,getInfoUserConnect,
    getRolesUser,getRolesNotAddedUser,deleteRoleUser,deleteEtablissementUser, getEtablissementUser,update,searchNext,allUsers} =require('../controllers/userController/user')
userRoute.post('/ajouter-user',ajouter)
userRoute.get('/liste-user',liste)
userRoute.delete('/supprimer-user/:ids',supprimer)
userRoute.put('/update-user/',update)
userRoute.get('/search-next-page/',searchNext)
userRoute.get('/all-users/',allUsers)
userRoute.get('/get-info-user',getInfoUser)
userRoute.get('/get-etablissement-user',getEtablissementUser)
userRoute.get('/get-role-user',getRolesUser)
userRoute.get('/get-role-user-not-added',getRolesNotAddedUser)
userRoute.post('/ajouter-role',ajouterRoleUser)
userRoute.post('/delete-role-role',deleteRoleUser)
userRoute.delete('/delete-etablissement-user',deleteEtablissementUser)
userRoute.get('/get-info-user-connect',getInfoUserConnect)


// userRoute.post('/add-groupe-formateur/',addGroupeFormateur)
// userRoute.get('/groupe-formateur/',getGroupeFormateur)
// userRoute.get('/getGroupesNonInclusFormateur',getGroupesNonInclusFormateur)
// userRoute.post('/supprimer-groupe-formateur',formateurSupprimerGroupeormateur)

// formateurRoute.get('/search-formateur/',search)
module.exports=userRoute



