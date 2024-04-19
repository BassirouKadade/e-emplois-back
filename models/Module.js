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
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        MH: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        MHP: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        MHA: {
            type: DataTypes.INTEGER,
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
