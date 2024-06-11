const {Role}=require('../config/sequelize')
const seedRoles = async () => {
    const roles = ['Administrateur', 'Directeur'];

  // Vérifiez si les rôles existent déjà
  const existingRoles = await Role.findAll();
  if (existingRoles.length === 0) {
    for (const roleName of roles) {
      await Role.create({ name: roleName });
      console.log(`Role ${roleName} has been created.`);
    }
  } else {
    console.log('Roles already exist, seeding not required.');
  }
};

module.exports = seedRoles;
