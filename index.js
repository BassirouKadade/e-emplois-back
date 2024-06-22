require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const {  sequelize } = require('./config/sequelize');
const formateurRoute=require('./routes/formateurRoute')
const verifyToken=require('./middleware/verifyToken')
const cors=require('cors')
const authRoute=require('./routes/authRoute')
const moduleRoute=require('./routes/moduleRoute')
const salleRoute=require('./routes/salleRoute')
const filiereRoute=require('./routes/filiereRoute')
const groupeRoute=require('./routes/groupeRoute')
const userRoute=require('./routes/userRoute')
const emploisRoute=require('./routes/emploisRoute')
const etablissementRoute=require('./routes/etablissementRoute')
const path=require('path')
const seedRoles=require('./routes/roles')
const compression = require('compression');

const seedUsers=require('./routes/users')

const app = express();
app.use(compression());

const port = process.env.PORT || 3001;

// Configuration de CORS
app.use(cors({
  origin: process.env.BASE_URL_FRONT_END,
  credentials: true // Permet l'envoi de cookies et d'autres credentials dans les requêtes
}));

// Utilisation de body-parser pour analyser les corps de requête JSON et URL encodés
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'uploads')));

app.use('/formateur',verifyToken,formateurRoute)
app.use('/module',verifyToken, moduleRoute)
app.use('/salle',verifyToken,salleRoute)
app.use('/filiere',verifyToken,filiereRoute)
app.use('/groupe',verifyToken,groupeRoute)
app.use('/user',verifyToken,userRoute)
app.use('/emplois',verifyToken, emploisRoute)
app.use('/etablissement',verifyToken,etablissementRoute)
app.use('/auth',authRoute)

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
    await seedRoles()
    await seedUsers()
    console.log('Les tables ont été synchronisées');
  } catch (e) {
    console.log('Une erreur est survenue lors d\'une opération');
    console.error(e);
  }
})()
app.listen(port, function () {
  console.log(`Le serveur est prêt à écouter les requêtes sur le port ${port}`);
});
