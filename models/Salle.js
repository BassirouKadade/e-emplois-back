const { DataTypes, Model } = require('sequelize');

function initialModelSalle(sequelize) {
    class Salle extends Model {}

    Salle.init({
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
        emplacement: {
            type: DataTypes.STRING,
            allowNull: true
        },

        capacite: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 25
        },
        MH: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        MREST: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        id_etablissement: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { // Corrected 'refrences' to 'references'
                model: "etablissements",
                key: "id",
                onDelete: "CASCADE"
            }
        }
    }, {
        sequelize,
        modelName: "Salle",
        tableName: "salles"
    });

    return Salle;
}

module.exports = { initialModelSalle };
