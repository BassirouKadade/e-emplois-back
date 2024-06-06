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
       
    }, {
        sequelize,
        modelName: "Module",
        tableName: "modules"
    });

    Module.associate = ({Groupe,Formateur,GroupeModule }) => {
        Module.belongsToMany(Groupe, { 
            through: GroupeModule , 
            onDelete: 'CASCADE',
            as: 'groupes'
        });
        Module.belongsToMany(Formateur, { 
            through: 'module_formateur', 
            onDelete: 'CASCADE',
            as: 'formateurs'
        });
      
    };

    return Module;
}

module.exports = { initialModelModule };
