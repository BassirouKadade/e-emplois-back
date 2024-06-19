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
        etat_avancement: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 0
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
        modelName: "Groupe",
        tableName: "groupes"
    });

    Groupe.associate = ({Module,GroupeModule,Formateur }) => {
        Groupe.belongsToMany(Module, { through: GroupeModule ,onDelete: 'CASCADE', as: "modules"  });
        Groupe.belongsToMany(Formateur, { through: 'groupe_formateur',onDelete: 'CASCADE', as: "formateurs" });    

    };

    return Groupe;
}

module.exports = { initialModelGroupe };
