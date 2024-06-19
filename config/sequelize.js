const { Sequelize } = require('sequelize');
const { initialModelUser } = require('../models/User'); // Importation du modèle User
const { initialModelRole } = require('../models/Role'); // Importation du modèle Role
const { initialModelFiliere } = require('../models/Filiere'); // Importation du modèle Filiere
const { initialModelGroupe } = require('../models/Groupe'); // Importation du modèle Groupe
const { initialModelModule } = require('../models/Module'); // Importation du modèle Module
const { initialModelSalle } = require('../models/Salle'); // Importation du modèle Salle
const { initialModelReservation } = require('../models/Reservation'); // Importation du modèle Reservation
const { initialModelEtablissement } = require('../models/Etablissement'); // Importation du modèle Etablissement
const { initialModelFormateur } = require('../models/Formateur'); // Importation du modèle Formateur
const {initialModelGroupeModule}=require('../models/GroupeModule')
// Création de l'instance Sequelize avec les informations de connexion à la base de données
const sequelize = new Sequelize(process.env.DB_NAME, process.env.USERNAME_APP, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  define: {
    timestamps: true // Activation des timestamps (createdAt et updatedAt)
  }
});

// // Initialisation des modèles avec Sequelize et association des modèles si nécessaire
 const User = initialModelUser(sequelize); // Initialisation du modèle User
const Role = initialModelRole(sequelize); // Initialisation du modèle Role
const Filiere = initialModelFiliere(sequelize); // Initialisation du modèle Filiere
const Groupe = initialModelGroupe(sequelize); // Initialisation du modèle Groupe
const Module = initialModelModule(sequelize); // Initialisation du modèle Module
const Salle = initialModelSalle(sequelize); // Initialisation du modèle Salle
const Reservation = initialModelReservation(sequelize); // Initialisation du modèle Reservation
 const Etablissement = initialModelEtablissement(sequelize); // Initialisation du modèle Etablissement
 const Formateur = initialModelFormateur(sequelize); // Initialisation du modèle Formateur
 const GroupeModule = initialModelGroupeModule(sequelize); // Initialisation du modèle Formateur

 


/*
***************************************
//  Relation Filiere et groupe
*/
Groupe.belongsTo(Filiere, {
  foreignKey: 'id_filiere',
  as: 'filiere',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});
Filiere.hasMany(Groupe, {
  foreignKey: 'id_filiere',
  as: 'groupes',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});

/*
***************************************
//  Relation entre Reservation et les autres tables  
*/
Reservation.belongsTo(Salle, { as: 'salle', foreignKey: 'idSalle', onDelete: 'CASCADE' });
Reservation.belongsTo(Formateur, { as: 'formateur', foreignKey: 'idFormateur', onDelete: 'CASCADE' });
Reservation.belongsTo(Groupe, { as: 'groupe', foreignKey: 'idGroupe', onDelete: 'CASCADE' });
Reservation.belongsTo(Module, { as: 'module', foreignKey: 'idModule', onDelete: 'CASCADE' });

// Reservation.belongsTo(Etablissement, { as: 'etablissement', foreignKey: 'id_etablissement', onDelete: 'CASCADE' })


//les relation hasMany avec d'autres table d
Salle.hasMany(Reservation, {
  foreignKey: 'idSalle',
  as: 'reservations',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});
Formateur.hasMany(Reservation, {
  foreignKey: 'idFormateur',
  as: 'reservations',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});
Module.hasMany(Reservation, {
  foreignKey: 'idModule',
  as: 'reservations',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});
Groupe.hasMany(Reservation, {
  foreignKey: 'idGroupe',
  as: 'reservations',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});


/*
***************************************
//  Relation Etablissement et users
*/
Etablissement.belongsTo(User, {
  foreignKey: 'id_user',
  as: 'user',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});
User.hasMany(Etablissement, {
  foreignKey: 'id_user',
  as: 'etablissements',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});

/*
***************************************
//  Relation Etablissement et users
*/
Etablissement.hasMany(Filiere, {
  foreignKey: 'id_etablissement',
  as: 'filieres',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});
Filiere.belongsTo(Etablissement, {
  foreignKey: 'id_etablissement',
  as: 'etablissement',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});


/*
***************************************
//  Relation Etablissement et users
*/
Etablissement.hasMany(Formateur, {
  foreignKey: 'id_etablissement',
  as: 'formateurs',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});
Formateur.belongsTo(Etablissement, {
  foreignKey: 'id_etablissement',
  as: 'etablissement',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});


/*
***************************************
//  Relation Etablissement et users
*/
Etablissement.hasMany(Salle, {
  foreignKey: 'id_etablissement',
  as: 'salles',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});
Salle.belongsTo(Etablissement, {
  foreignKey: 'id_etablissement',
  as: 'etablissement',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});



/*
***************************************
//  Relation Etablissement et users
*/
Etablissement.hasMany(Groupe, {
  foreignKey: 'id_etablissement',
  as: 'groupes',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});
Groupe.belongsTo(Etablissement, {
  foreignKey: 'id_etablissement',
  as: 'etablissement',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});


/*
***************************************
//  Relation Etablissement et users
*/
Etablissement.hasMany(Module, {
  foreignKey: 'id_etablissement',
  as: 'modules',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});
Module.belongsTo(Etablissement, {
  foreignKey: 'id_etablissement',
  as: 'etablissement',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});



/*
***************************************
//  Relation Etablissement et users
*/
Etablissement.hasMany(Reservation, {
  foreignKey: 'id_etablissement',
  as: 'reservations',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});
Reservation.belongsTo(Etablissement, {
  foreignKey: 'id_etablissement',
  as: 'etablissement',
  onDelete: 'CASCADE' // Supprimer tous les groupes associés lorsqu'une filière est supprimée
});

/*
***************************************
//  Relation Filiere et Module Many To Many
*/

Groupe.associate({ Module ,GroupeModule,Formateur}); // Association entre Groupe et Module
User.associate({ Role }); // Association entre User et Role
Role.associate({ User }); // Association entre Role et User
Formateur.associate({ Module ,Groupe}); // Association entre Formateur et Module
Module.associate({ Groupe, Formateur,GroupeModule }); // Associations entre Module et Groupe, et entre Module et Formateur




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
  Etablissement,
  GroupeModule
};
