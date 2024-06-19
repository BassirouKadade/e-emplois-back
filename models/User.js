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
        nom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        prenom: {
            type: DataTypes.STRING,
            allowNull: false
        },
        photo:{
            type: DataTypes.STRING,
            allowNull: true
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
            type: DataTypes.STRING,
            allowNull: true
        },
        resetPasswordToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        otpSecret: {
            type: DataTypes.STRING,
            allowNull: true
        },
        authenticationToken: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: "User",
        tableName: "users"
    });

    User.associate = ({ Role }) => {
        User.belongsToMany(Role, { 
            through: 'user_role',
            onDelete: 'CASCADE' ,
            as: 'roles'
        });
    };

    return User;
}

module.exports = { initialModelUser };
