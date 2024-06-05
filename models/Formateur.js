const { DataTypes, Model } = require('sequelize');

function initialModelFormateur(sequelize) {
    class Formateur extends Model {}

    Formateur.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        matricule: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true // Assurer que le matricule est unique
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        prenom: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Assurer que l'email est unique
            validate: {
                isEmail: true // Assurer que l'email suit le format d'email
            }
        },
        metier: {
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
        modelName: "Formateur",
        tableName: "formateurs"
    })

    Formateur.associate = ({Module}) => {
        Formateur.belongsToMany(Module, { through: 'module_formateur',onDelete: 'CASCADE', as: "modules" });    }
    return Formateur;
}

module.exports = { initialModelFormateur };
