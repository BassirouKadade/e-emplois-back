const express = require('express');
const salleRoute = express.Router();

const { ajouter,searchNext, liste, supprimer, update } = require('../controllers/salleController/salle');

salleRoute.post('/ajouter-salle', ajouter);
salleRoute.get('/liste-salle', liste);
salleRoute.delete('/supprimer-salle/:ids', supprimer);
salleRoute.put('/update-salle', update);
salleRoute.get('/search-next-page', searchNext);

module.exports = salleRoute;
