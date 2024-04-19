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
        code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        id_salle: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { // Corrected 'refrences' to 'references'
                model: "salles",
                key: "id",
                onDelete: "CASCADE"
            }
        },
        id_formateur: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { // Corrected 'refrences' to 'references'
                model: "formateurs",
                key: "id",
                onDelete: "CASCADE"
            }
        }
        , id_modules: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { // Corrected 'refrences' to 'references'
                model: "modules",
                key: "id",
                onDelete: "CASCADE"
            }
        },
        id_groupe: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { // Corrected 'refrences' to 'references'
                model: "groupes",
                key: "id",
                onDelete: "CASCADE"
            }
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
        modelName: "Reservation",
        tableName: "reservations"
    });

    return Reservation;
}

module.exports = { initialModelReservation };
