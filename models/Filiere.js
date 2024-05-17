const { DataTypes, Model } = require('sequelize');

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
            references: { // Corrected 'refrences' to 'references'
                model: "etablissements",
                key: "id",
                onDelete: "CASCADE"
            }
        }
    }, {
        sequelize,
        modelName: "Filiere",
        tableName: "filieres"
    });

    Filiere.associate = ({ Module }) => {
        Filiere.belongsToMany(Module, { through: 'module_filiere' });
    };

    return Filiere;
}

module.exports = { initialModelFiliere };
