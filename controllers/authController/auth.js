const { User, Etablissement } = require('../../config/sequelize');
const jwt = require('jsonwebtoken');
const path=require('path')
const fs = require('fs');
const {option}=require('../../mail/options')
const typemessage=require('../../mail/typemessages')
const transporter=require('../../mail/confignodemailer')
const speakeasy=require('speakeasy')
const {generateSecret}=require('../../auth-otp/secretOTP')
const {generateOTP}=require('../../auth-otp/generateOTP')

const bcrypt = require('bcrypt');
// ***************************** Le code pour la verification de OTP
const verifyOTP = async (user, otp) => {
    return speakeasy.totp.verify({
        secret: user.otpSecret, // Le secret OTP de l'utilisateur (stocké en base de données)
        encoding: 'base32',
        token: otp, // Le code OTP fourni par l'utilisateur
        window: 2 // Fenêtre de vérification (en cas de décalage temporel, le code OTP reste valide dans cette fenêtre)
    });
};


const auth = {
    login: async (request, response) => {
        try {
            const { email, password } = request.body;
            const errors = {};

            // Check if user exists
            const existUser = await User.findOne({
                where: { email }
            });

            if (!existUser) {
                errors.errorEmail = "Vous n'êtes pas autorisé à utiliser le système.";
                return response.status(401).json(errors);
            }

            // Check if password is correct
            const isPasswordCorrect = await bcrypt.compare(password, existUser.password);
            if (!isPasswordCorrect) {
                errors.errorPassword = "Email et/ou Mot de passe incorrect";
                return response.status(401).json(errors);
            }

            // Get user roles
            const roles = await existUser.getRoles();
            const role = roles.map(el => el.name); // Using el.name directly

            // Get user's establishments
            const etablissements = await Etablissement.findAll({
                where: { id_user: existUser.id }
            });
            const etablissementsId = etablissements.map(etabli => etabli.id);

            // Create JWT token with user information
            const token = jwt.sign(
                { id: existUser.id, idEtablissement: etablissementsId, roles: role },
                process.env.JWT_SECRET,
                { expiresIn: "1h" } // Example: token expires in 1 hour
            );

            const secret=generateSecret()
            // Générer un OTP à partir du secret

            const otpValue = generateOTP(secret.base32);
            existUser.existUser=secret.base32 
            await existUser.save()
            
            await transporter.sendMail(option(email, typemessage.optMail(otpValue)));

            return response.status(200).json(token );
        } catch (error) {
            console.error('Une erreur est survenue lors de la connexion de l\'utilisateur :', error);
            return response.status(500).json({ message: "Une erreur est survenue lors de la connexion de l'utilisateur." });
        }
    },
    updateProfile: async (request, response) => {
        try {
            const { id, email, image, nom, prenom, motDePasse } = request.body;
            const errors = {};
            
            // Récupérer le nom du fichier téléchargé
            const uploadedFileName = request?.file?.filename;
            
            // Vérifiez si l'utilisateur existe
            const existUser = await User.findOne({
                where: { id }
            });
            
            if (!existUser) {
                errors.errorId = "L'utilisateur n'existe pas.";
                return response.status(401).json(errors);
            }
            
            // Vérifiez si l'email est déjà utilisé par un autre utilisateur
            const emailUser = await User.findOne({
                where: { email }
            });
            
            if (emailUser && parseInt(emailUser.id) !== parseInt(id)) {
                errors.existeEmail = "Cet email est déjà utilisé";
                return response.status(400).json(errors);
            }
            
            const saltRounds = 10; // Nombre de rounds de sel pour bcrypt
            
            // Hasher le mot de passe si fourni
            let hashedPassword = existUser.motDePasse; // Conserver le hash existant si le mot de passe n'est pas changé
            if (motDePasse) {
                hashedPassword = await bcrypt.hash(motDePasse, saltRounds);
            }
            
            // Supprimer l'ancienne image si une nouvelle image est téléchargée
            if (uploadedFileName) {
                const oldImage = existUser.photo;
                if (oldImage) {
                    // il faut toujours specifier le chemi de dossier manuellement ....
                    const chemin = path.join(__dirname, '../../','uploads', oldImage); // Correction : '__dirname' au lieu de juste 'uploads'
                    if (fs.existsSync(chemin)) {
                         console.log('c',chemin,)
                        await fs.promises.unlink(chemin); // Supprimer l'ancienne image
                    } else {
                        console.log(`File ${chemin} does not exist.`);
                    }
                }
            }
            
            
            // Mettre à jour le profil de l'utilisateur
            existUser.nom = nom;
            existUser.prenom = prenom;
            existUser.email = email;
            existUser.motDePasse = hashedPassword;
            if (uploadedFileName) {
                existUser.photo = uploadedFileName; // Ajouter le nom du fichier téléchargé
            }
            
            // Enregistrer le profil utilisateur mis à jour
            await existUser.save();
            
            response.status(200).json({ message: "Profil mis à jour avec succès" });
        } catch (error) {
            console.error('Une erreur est survenue lors de la mise à jour du profil de l\'utilisateur :', error);
            return response.status(500).json({ message: "Une erreur est survenue lors de la mise à jour du profil de l'utilisateur." });
        }
    },
    forgotPassword: async (request, response) => {
        try {
            const { email } = request.body;
            const errors = {};
    
            const existUser = await User.findOne({
                where: { email: email }
            });
    
            if (!existUser) {
                errors.errorEmail = "Vous n'avez aucun compte ";
                return response.status(401).json(errors);
            }
    
            const token = jwt.sign({ id: existUser.id },  process.env.JWT_SECRET, { expiresIn: "10m" });
    
            // Mettre à jour le token de réinitialisation du mot de passe pour l'utilisateur existant
            await existUser.update({ reset_password_token : token });
    
            // Envoyer l'e-mail avec le token de réinitialisation
            try {
                await transporter.sendMail(option(email, typemessage.motdepasseoublier(token)));
                console.log('Email envoyé avec succès pour la réinitialisation du mot de passe');
              } catch (error) {
                console.error('Erreur lors de l\'envoi de l\'email de réinitialisation du mot de passe :', error);
                throw error; // Propagez l'erreur pour une gestion ultérieure
              }
                
            return response.status(200).json(token);
    
        } catch (error) {
            console.error('Une erreur est survenue lors de la connexion de l\'utilisateur :', error);
            return response.status(500).json({ message: "Une erreur est survenue lors de la connexion de l'utilisateur." });
        }
    },
    
    resetPassword: async (request, response) => {
        try {
            const { nouveauMotDePasse, token } = request.body;
    
            // Vérifiez si le token est présent dans la requête
            if (!token) {
                return response.status(400).json({ message: "La demande de réinitialisation de mot de passe est incomplète. Veuillez réessayer." });
            }
    
            // Recherchez l'utilisateur par le token
            const user = await User.findOne({ reset_password_token: token });
    
            if (!user) {
                return response.status(401).json({ message: "Votre demande de réinitialisation de mot de passe n'est plus valide. Veuillez vérifier le lien que vous avez utilisé." });
            }
    
            // Vérifiez le jeton JWT
            jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
                if (error) {
                    console.error("Erreur lors de la vérification du jeton JWT :", error);
                    return response.status(403).json({ message: "Votre demande de réinitialisation de mot de passe a expiré. Veuillez faire une nouvelle demande." });
                }
    
                try {
                    // Générez le nouveau mot de passe haché
                    const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);
    
                    // Mettez à jour le mot de passe de l'utilisateur
                     user.password=hashedPassword 
                     await user.save()
    
                    return response.status(200).json({ message: "Votre mot de passe a été réinitialisé avec succès." });
                } catch (error) {
                    console.error("Erreur lors de la mise à jour du mot de passe :", error);
                    return response.status(500).json({ message: "Une erreur est survenue lors de la mise à jour du mot de passe. Veuillez réessayer." });
                }
            });
    
        } catch (error) {
            console.error("Une erreur est survenue lors de la réinitialisation du mot de passe :", error);
            return response.status(500).json({ message: "Une erreur est survenue lors de la réinitialisation du mot de passe. Veuillez réessayer." });
        }
    }
    
};

module.exports = auth;
