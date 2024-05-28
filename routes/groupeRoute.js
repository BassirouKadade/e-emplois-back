const express = require('express');
const groupeRoute = express.Router();

const { ajouter, getFormateurGroupe,searchNext,getGroupeTotale ,liste, supprimer, update } = require('../controllers/groupeController/groupe');

groupeRoute.post('/ajouter-groupe', ajouter);
groupeRoute.get('/liste-groupe', liste);
groupeRoute.delete('/supprimer-groupe/:ids', supprimer);
groupeRoute.put('/update-groupe', update);
groupeRoute.get('/search-next-page', searchNext);
groupeRoute.get('/get-groupe-totale', getGroupeTotale);
groupeRoute.get('/get-formateur-groupe', getFormateurGroupe);

module.exports = groupeRoute;
