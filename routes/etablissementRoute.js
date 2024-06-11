const express = require('express');
const etablissementRoute = express.Router();

const {ajouter,searchNext,liste, supprimer,getListEtablissementAll, update } = require('../controllers/etablissementController/etablissement')

etablissementRoute.post('/ajouter-etablissement', ajouter);
etablissementRoute.get('/liste-etablissement', liste);
etablissementRoute.delete('/supprimer-etablissement/:ids', supprimer);
etablissementRoute.put('/update-etablissement', update);
etablissementRoute.get('/search-next-page', searchNext);
etablissementRoute.get('/get-list-etablissement-all', getListEtablissementAll);

module.exports = etablissementRoute;
