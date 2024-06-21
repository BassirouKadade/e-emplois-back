function option(userConnect,subjet, typemessage) {
  return {
    from: `"E-Emplois" <${process.env.EMAIL_EMETTEUR}>`, // Utilisation d'un alias avec l'email de l'émetteur
    replyTo: `"E-Emploi" <no-reply@e-emploi.com>`, // Utilisation d'une adresse générique
    to: userConnect,
    subject: subjet, // Sujet corrigé
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>E-Emploi</title>
          <style>
          body, html {
            margin: 0;
            padding: 0;
          }
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f2f2f2;
          }
  
          .container {
              max-width: 600px;
              margin: 20px auto;
              padding: 20px;
              background-color: #fff;
              border-radius: 5px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
  
          h2 {
              text-align: center;
              margin-bottom: 20px;
              color: #0066cc;
              letter-spacing: 2px;
          }
  
          p {
              margin-bottom: 20px;
              color: #333333;
              line-height: 1.5;
          }
  
          .btn {
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: #fff;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
          }
  
          .btn:hover {
              background-color: #0056b3;
          }
  
          a {
            color: #0066cc;
            text-decoration: none;
          }
  
          a:hover {
            text-decoration: underline;
          }
  
          img {
            display: block;
            margin: 0 auto 20px auto;
            width: 100px;
            height: 100px;
          }
  
          .footer {
            margin-top: 20px;
            text-align: center;
            color: #777;
          }
          </style>
      </head>
      <body>
          <div class="container">
              ${typemessage}
              <p>Cordialement,</p>
              <p>L'équipe E-Emploi</p>
              <div class="footer">
                  <p>© 2024 E-Emploi. Tous droits réservés.</p>
              </div>
          </div>
      </body>
      </html>
    `
  };
}

module.exports = { option };
