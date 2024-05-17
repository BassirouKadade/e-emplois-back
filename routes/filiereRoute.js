const express = require('express');
const filiereRoute = express.Router();
const { ajouter,listeFiliereAll,supprimerModuleFiliere,modulesFiliere,ajouterModuleFiliere,allModule,getInfosFiliere, supprimer, update, searchNext, liste } = require('../controllers/filiereController/filiere');

filiereRoute.post('/ajouter-filiere', ajouter);
filiereRoute.get('/liste-filiere', liste);
filiereRoute.delete('/supprimer-filiere/:ids', supprimer);
filiereRoute.put('/update-filiere/', update);
filiereRoute.get('/search-next-page/', searchNext);
filiereRoute.get('/getinfos-filiere', getInfosFiliere);
filiereRoute.get('/all-modules', allModule);
filiereRoute.get('/modules-filiere', modulesFiliere);
filiereRoute.post('/ajouter-module-filiere', ajouterModuleFiliere);
filiereRoute.post('/supprimer-module-filiere', supprimerModuleFiliere);
filiereRoute.get('/liste-filiere-all', listeFiliereAll);

// filiereRoute.get('/search-filiere/', search)
module.exports = filiereRoute;
