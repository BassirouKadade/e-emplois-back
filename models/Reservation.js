const { DataTypes, Model } = require('sequelize');

function initialModelReservation(sequelize) {
    class Reservation extends Model {}

    Reservation.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        startIndex: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        width: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        startEnd: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        startTop: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        nombeHeureSeance: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        typeReservation: {
            type: DataTypes.STRING,
            allowNull: true
        },
        idSalle: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "salles",
                key: "id",
            },
            onDelete: "CASCADE"
        },
        idFormateur: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "formateurs",
                key: "id",
              
            },
            onDelete: "CASCADE"
        },
        idModule: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "modules",
                key: "id",
               
            },
            onDelete: "CASCADE"
        },
        idGroupe: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "groupes",
                key: "id",
               
            },
            onDelete: "CASCADE"
        },
        day: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_etablissement: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "etablissements",
                key: "id",
                onDelete: "CASCADE"
            }
        }
    }, {
        sequelize,
        modelName: "Reservation",
        tableName: "reservations"
    });

    return Reservation;
}

module.exports = { initialModelReservation };
