const { DataTypes, Model } = require('sequelize');

function initialModelGroupeModule(sequelize) {
    class GroupeModule extends Model {}

    GroupeModule.init({
        etat_avancement: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        dr: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: "GroupeModule",
        tableName: "groupe_modules"
    });

    return GroupeModule;
}

module.exports = { initialModelGroupeModule };
