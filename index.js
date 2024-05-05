require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {  sequelize } = require('./config/sequelize');
const formateurRoute=require('./routes/formateurRoute')
const cors=require('cors')
const authRoute=require('./routes/authRoute')
const app = express();

const port = process.env.PORT || 3001;

// Configuration de CORS
app.use(cors({
  origin: process.env.BASE_URL_FRONT_END,
  credentials: true // Permet l'envoi de cookies et d'autres credentials dans les requêtes
}));

// Utilisation de body-parser pour analyser les corps de requête JSON et URL encodés
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/formateur',formateurRoute)
app.use('/',authRoute)

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Une erreur est survenue sur le serveur');
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('La connexion à la base de données a réussi');
    await sequelize.sync({ force:false });
    console.log('Les tables ont été synchronisées');
  } catch (e) {
    console.log('Une erreur est survenue lors d\'une opération');
    console.error(e);
  }
})()
app.listen(port, function () {
  console.log(`Le serveur est prêt à écouter les requêtes sur le port ${port}`);
});
