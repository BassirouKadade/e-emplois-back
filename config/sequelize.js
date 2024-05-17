const { Sequelize } = require('sequelize');
const { initialModelUser } = require('../models/User'); // Importation du modèle User
const { initialModelRole } = require('../models/Role'); // Importation du modèle Role
const { initialModelFiliere } = require('../models/Filiere'); // Importation du modèle Filiere
const { initialModelGroupe } = require('../models/Groupe'); // Importation du modèle Groupe
const { initialModelModule } = require('../models/Module'); // Importation du modèle Module
const { initialModelFormateur } = require('../models/Formateur'); // Importation du modèle Formateur
const { initialModelSalle } = require('../models/Salle'); // Importation du modèle Salle
const { initialModelReservation } = require('../models/Reservation'); // Importation du modèle Reservation
const { initialModelEtablissement } = require('../models/Etablissement'); // Importation du modèle Etablissement


// Création de l'instance Sequelize avec les informations de connexion à la base de données
const sequelize = new Sequelize(process.env.DB_NAME, process.env.USERNAME_APP, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  define: {
    timestamps: true // Activation des timestamps (createdAt et updatedAt)
  }
});

// Initialisation des modèles avec Sequelize et association des modèles si nécessaire
const User = initialModelUser(sequelize); // Initialisation du modèle User
const Role = initialModelRole(sequelize); // Initialisation du modèle Role
const Filiere = initialModelFiliere(sequelize); // Initialisation du modèle Filiere
const Groupe = initialModelGroupe(sequelize); // Initialisation du modèle Groupe
const Module = initialModelModule(sequelize); // Initialisation du modèle Module
const Formateur = initialModelFormateur(sequelize); // Initialisation du modèle Formateur
const Salle = initialModelSalle(sequelize); // Initialisation du modèle Salle
const Reservation = initialModelReservation(sequelize); // Initialisation du modèle Reservation
const Etablissement = initialModelEtablissement(sequelize); // Initialisation du modèle Etablissement


// Associations entre les modèles si nécessaire
Filiere.associate({ Module }); // Association entre Filiere et Module
Module.associate({ Filiere, Formateur }); // Association entre Module et Filiere, et entre Module et Formateur
Formateur.associate({ Module }); // Association entre Formateur et Module
User.associate({ Role }); // Association entre User et Role
Role.associate({ User }); // Association entre Role et User
Filiere.hasMany(Groupe, { foreignKey: 'id_filiere', as: 'groupes' });
Groupe.belongsTo(Filiere, { foreignKey: 'id_filiere', as: 'filiere' });

module.exports = {
  sequelize,
  User,
  Role,
  Filiere,
  Groupe,
  Module,
  Formateur,
  Salle,
  Reservation,
  Etablissement
};
