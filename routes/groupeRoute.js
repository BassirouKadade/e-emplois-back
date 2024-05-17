const express = require('express');
const groupeRoute = express.Router();

const { ajouter, searchNext, liste, supprimer, update } = require('../controllers/groupeController/groupe');

groupeRoute.post('/ajouter-groupe', ajouter);
groupeRoute.get('/liste-groupe', liste);
groupeRoute.delete('/supprimer-groupe/:ids', supprimer);
groupeRoute.put('/update-groupe', update);
groupeRoute.get('/search-next-page', searchNext);

module.exports = groupeRoute;
