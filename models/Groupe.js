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
            allowNull: true
        },
        id_filiere: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "filieres",
                key: "id",
            },
            onDelete: "CASCADE"
        },
    }, {
        sequelize,
        modelName: "Groupe",
        tableName: "groupes"
    });

    Groupe.associate = ({Module}) => {
        Groupe.belongsToMany(Module, { through: 'module_groupe',onDelete: 'CASCADE', as: "modules"  });
    };

    return Groupe;
}

module.exports = { initialModelGroupe };
