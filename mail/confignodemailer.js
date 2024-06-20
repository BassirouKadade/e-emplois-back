const nodemailer = require('nodemailer');

// Ne stockez jamais les identifiants d'authentification dans le code
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Utilisation d'une connexion SSL/TLS sécurisée
  auth: {
    // Utilisez des variables d'environnement pour stocker les identifiants
    user: process.env.EMAIL_EMETTEUR,
    pass: process.env.PASSWORD_EMAIL
  },
  tls: {
    rejectUnauthorized: true // Rejetez les certificats non autorisés
  }
});

module.exports = transporter;
