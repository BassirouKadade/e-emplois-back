function option(userConnect, typemessage) {
  return {
      from: process.env.EMAIL_EMETTEUR,
      replyTo: `"E-Emploi" <${userConnect}>`, // Utilisation de userConnect comme alias dynamique
      to: userConnect,
      subject: 'E-Emplois',
      html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>G-Emploi</title>
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
              }
      
              p {
                  margin-bottom: 20px;
              }
      
              .btn {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #007bff;
                  color: #fff;
                  text-decoration: none;
                  border-radius: 5px;
              }
      
              .btn:hover {
                  background-color: #0056b3;
              }
          
              /* Style pour les titres */
              h1 {
                color: #0066cc;
                letter-spacing: 2px;
                margin-top: 20px;
              }
          
              /* Style pour les paragraphes */
              p {
                color: #333333;
                line-height: 1.5;
              }
          
              /* Style pour les liens */
              a {
                color: #0066cc;
                text-decoration: none;
              }
          
              a:hover {
                text-decoration: underline;
              }
          
              /* Style pour les images */
              img {
                display: block;
                margin: 0 auto;
                width: 100px;
                height: 100px;
                margin-bottom: 20px;
              }
          
              /* Style pour le conteneur */
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 10px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
          
              /* Style pour le pied de page */
              .footer {
                margin-top: 20px;
                text-align: center;
                color: #777;
              }
              </style>
          </head>
          <body>
              ${typemessage}
          </body>
          </html>
      `
  };
}

module.exports = { option };
