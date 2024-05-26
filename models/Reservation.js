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
            allowNull: true
        },
        width:{
            type: DataTypes.INTEGER,
            allowNull: false
        },
        startEnd: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        startTop: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        nombeHeureSeance: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        typeReservation: {
            type: DataTypes.STRING,
            allowNull: false
        },
        salle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        formateur: {
            type: DataTypes.STRING,
            allowNull: true,
        }
        , module: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        groupe: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        day:{
            type: DataTypes.STRING,
            allowNull: false,
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
        modelName: "Reservation",
        tableName: "reservations"
    });

    return Reservation;
}

module.exports = { initialModelReservation };
