const { DataTypes, Model } = require('sequelize');

function initialModelUser(sequelize) {
    class User extends Model {}

    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        refreshToken: {
            type: DataTypes.STRING
        },
        resetPasswordToken: {
            type: DataTypes.STRING
        },
        otpSecret: {
            type: DataTypes.STRING
        },
        authenticationToken: {
            type: DataTypes.STRING
        },
        id_etablissement: { // Renamed from id_etablissement to match the naming convention
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { // Corrected 'refrences' to 'references'
                model: "etablissements", // Corrected 'etablissement' to 'Etablissement'
                key: "id",
                onDelete: "CASCADE"
            }
        }
    }, {
        sequelize,
        modelName: "User",
        tableName: "users"
    });

    User.associate = ({ Role }) => {
        User.belongsToMany(Role, { through: 'user_role' });
    };

    return User;
}

module.exports = { initialModelUser };
