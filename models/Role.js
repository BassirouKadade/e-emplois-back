const { DataTypes, Model } = require('sequelize');

function initialModelRole(sequelize) {
    class Role extends Model {}

    Role.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: "Role",
        tableName: "roles"
    });

    Role.associate = ({User}) => {
        Role.belongsToMany(User, { 
            through: 'user_role',
            onDelete: 'CASCADE' ,
            as: 'users'
        });
    };

    return Role;
}

module.exports = { initialModelRole };
