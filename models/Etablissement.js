const { DataTypes, Model } = require('sequelize');
const { User } = require('../config/sequelize');

function initialModelEtablissement(sequelize) {
    class Etablissement extends Model {}

    Etablissement.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        adresse: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE"
        }
    }, {
        sequelize,
        modelName: "Etablissement",
        tableName: "etablissements"
    });

  
    return Etablissement;
}

module.exports = { initialModelEtablissement };
