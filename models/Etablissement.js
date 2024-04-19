const { DataTypes, Model } = require('sequelize');

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
    }, {
        sequelize,
        modelName: "Etablissement",
        tableName: "etablissements"
    });

    return Etablissement;
}

module.exports = { initialModelEtablissement };
