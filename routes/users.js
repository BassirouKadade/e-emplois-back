const { User, Role } = require('../config/sequelize'); // Adjust the path as per your project structure
const bcrypt = require('bcrypt');

// Array of user data to be seeded
const users = [
  {
    nom: 'user',
    prenom: 'user',
    email: 'user@gmail.com',
    password: '1234' // Plain text password
  },
  {
    nom: 'admin',
    prenom: 'admin',
    email: 'admin@gmail.com',
    password: '1234' // Plain text password
  }
  // Add more users as needed
];

// Seeding function
const seedUsers = async () => {
  try {
    // Check if any users exist in the database
    const existingUsers = await User.findAll();

    if (existingUsers.length === 0) {
      // If no users exist, create each user in the users array
      for (const userData of users) {
        // Hash the password using bcrypt
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create the user record in the database
        const user= await User.create({
          nom: userData.nom,
          prenom: userData.prenom,
          email: userData.email,
          password: hashedPassword // Store hashed password in the database
        });

        const role = await Role.findByPk(1)
        await user.addRole(role);
        
        console.log(`User ${userData.nom} ${userData.prenom} has been created.`);
      }
    } else {
      // If users already exist, log a message
      console.log('Users already exist, seeding not required.');
    }
  } catch (error) {
    console.error('Error seeding users:', error);
  }
};

// Export the seeding function
module.exports = seedUsers;

