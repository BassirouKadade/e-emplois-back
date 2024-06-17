const { User, Etablissement } = require('../../config/sequelize');
const jwt = require('jsonwebtoken');
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
                { expiresIn: "5s" } // Example: token expires in 1 hour
            );

            return response.status(200).json(token );
        } catch (error) {
            console.error('Une erreur est survenue lors de la connexion de l\'utilisateur :', error);
            return response.status(500).json({ message: "Une erreur est survenue lors de la connexion de l'utilisateur." });
        }
    }
};

module.exports = auth;
