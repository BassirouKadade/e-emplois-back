const express = require('express');
const groupeRoute = express.Router();

const {getInfosGroupe,ajouterModuleGroupe, supprimerModuleGroupe,ajouter,allModulesGroupe,modulesGroupeDisponible, getFormateurGroupe,searchNext,getGroupeTotale ,liste, supprimer, update } = require('../controllers/groupeController/groupe');

groupeRoute.post('/ajouter-groupe', ajouter);
groupeRoute.get('/liste-groupe', liste);
groupeRoute.delete('/supprimer-groupe/:ids', supprimer);
groupeRoute.put('/update-groupe', update);
groupeRoute.get('/search-next-page', searchNext);
groupeRoute.get('/get-groupe-totale', getGroupeTotale);
groupeRoute.get('/get-formateur-groupe', getFormateurGroupe);
groupeRoute.get('/all-modules-groupe', allModulesGroupe);
groupeRoute.get('/modules-groupe-disponible', modulesGroupeDisponible);
groupeRoute.get('/getinfos-groupe', getInfosGroupe);
groupeRoute.post('/ajouter-module-groupe', ajouterModuleGroupe);
groupeRoute.post('/supprimer-module-groupe', supprimerModuleGroupe);

module.exports = groupeRoute;
