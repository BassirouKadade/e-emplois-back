const multer = require('multer');
const path = require('path');

// Configuration de l'espace de stockage pour multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/'); // Répertoire où les fichiers seront stockés
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Récupérer l'extension du fichier d'origine
        const fileExt = path.extname(file.originalname);
        cb(null, uniqueSuffix + fileExt);
    }
});

// Création de l'objet de téléchargement avec la configuration de stockage
const upload = multer({ storage: storage });

// Exportation de l'objet de téléchargement configuré
module.exports = upload;
