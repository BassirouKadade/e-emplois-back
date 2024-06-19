const { User, Etablissement } = require('../../config/sequelize');
const jwt = require('jsonwebtoken');
const path=require('path')
const fs = require('fs');

const bcrypt = require('bcrypt');

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
                { expiresIn: "10m" } // Example: token expires in 1 hour
            );

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
    }
    
};

module.exports = auth;
