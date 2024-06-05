const { DataTypes, Model } = require('sequelize');
const { Groupe } = require('../config/sequelize');

function initialModelFiliere(sequelize) {
    class Filiere extends Model {}

    Filiere.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        niveau: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_etablissement: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "etablissements",
                key: "id",
            },
            onDelete: "CASCADE"
        }
    }, {
        sequelize,
        modelName: "Filiere",
        tableName: "filieres"
    });

   
    return Filiere;
}

module.exports = { initialModelFiliere };
