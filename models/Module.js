const { DataTypes, Model } = require('sequelize');

function initialModelModule(sequelize) {
    class Module extends Model {}

    Module.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        codeModule: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        masseHoraire: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        MHP: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        MHD: {
            type: DataTypes.INTEGER,
            allowNull: true
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
        modelName: "Module",
        tableName: "modules"
    });

    Module.associate = ({ Filiere ,Formateur}) => {
        Module.belongsToMany(Filiere, { through: 'module_filiere' });
        Module.belongsToMany(Formateur, { through: 'module_formateur' });
    };

    return Module;
}

module.exports = { initialModelModule };
