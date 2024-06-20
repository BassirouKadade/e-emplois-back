const typemessage = {
    motdepasseoublier: (token) => {
      return `
      <div class="container">
          <h2>Réinitialisation du Mot de Passe</h2>
          <p>Cher Utilisateur,</p>
          <p>Vous avez récemment demandé une réinitialisation de votre mot de passe pour votre compte sur notre plateforme. Pour procéder à cette réinitialisation, veuillez cliquer sur le bouton ci-dessous :</p>
          <p style="text-align: center;"><a style="color: #ffffff; background-color: #007bff; padding: 10px 20px; border-radius: 5px; text-decoration: none;" href="${process.env.BASE_URL_FRONT_END}/update-password/${token}">Réinitialiser le Mot de Passe</a></p>
          <p>Si vous n'avez pas demandé cette réinitialisation ou si vous ne souhaitez pas modifier votre mot de passe, vous pouvez ignorer cet e-mail en toute sécurité.</p>
          <p>Cordialement,<br>L'équipe de E-Emplois</p>
      </div>
      `;
    },
    optMail: (otp) => {
      return `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <h3 style="color: #333;">Bonjour,</h3>
          <p>Voici votre code secret pour vous connecter à votre compte :</p>
          <p style="font-size: 24px; padding: 10px; background-color: #f5f5f5; text-align: center;">${otp}</p>
          <p style="color: #666;">Veuillez utiliser ce code pour accéder à votre compte en toute sécurité. Ce code est unique et expirera après un certain temps.</p>
          <p style="color: #333;">Cordialement,<br>L'équipe de E-Emploi</p>
      </div>
      `;
    }
  };
  
  module.exports = typemessage;
  