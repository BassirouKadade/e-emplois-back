const { DataTypes, Model } = require('sequelize');

function initialModelGroupe(sequelize) {
    class Groupe extends Model {}

    Groupe.init({
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
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_filiere: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { // Corrected 'refrences' to 'references'
                model: "filieres",
                key: "id",
                onDelete: "CASCADE"
            }
        },
        id_etablissement: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { // Corrected 'refrences' to 'references'
                model: "etablissements",
                key: "id",
                onDelete: "CASCADE"
            }
        }
    }, {
        sequelize,
        modelName: "Groupe",
        tableName: "groupes"
    });

    return Groupe;
}

module.exports = { initialModelGroupe };
