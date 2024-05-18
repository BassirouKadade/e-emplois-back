const express = require('express');
const moduleRoute = express.Router();
const { getModuleFiliereGroupe,ajouter,ajouterModuleFormateur,getInfosFormateur,supprimerModuleFormateur, allModules,modulesFormateur, supprimer, update, searchNext, liste } = require('../controllers/moduleContrioller/module');

moduleRoute.post('/ajouter-module', ajouter);
moduleRoute.get('/liste-module', liste);
moduleRoute.delete('/supprimer-module/:ids', supprimer);
moduleRoute.put('/update-module/', update);
moduleRoute.get('/search-next-page/', searchNext);
moduleRoute.get('/all-modules/', allModules);
moduleRoute.get('/modules-formateur', modulesFormateur);
moduleRoute.post('/ajouter-module-formateur', ajouterModuleFormateur);
moduleRoute.post('/supprimer-module-formateur', supprimerModuleFormateur);
moduleRoute.get('/getinfos-formateur', getInfosFormateur);
moduleRoute.get('/get-module-filiere-groupe', getModuleFiliereGroupe);
module.exports = moduleRoute;
