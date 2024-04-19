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
            unique: true // Ensure matricule is unique
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 50] // Ensure nom length is between 2 and 50 characters
            }
        },
        prenom: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [2, 50] // Ensure prenom length is between 2 and 50 characters
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Ensure email is unique
            validate: {
                isEmail: true // Ensure email follows email format
            }
        },
        metier: {
            type: DataTypes.STRING,
            allowNull: false
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
        modelName: "Formateur",
        tableName: "formateurs"
    });

    Formateur.associate = ({ Module }) => {
        Formateur.belongsToMany(Module, { through: 'module_formateur' });
    };

    return Formateur;
}

module.exports = { initialModelFormateur };
