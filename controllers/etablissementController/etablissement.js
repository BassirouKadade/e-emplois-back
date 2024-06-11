const { Etablissement, User, Module } = require('../../config/sequelize');
const { Op } = require('sequelize');

const etablissementController = {
  ajouter: async (request, response) => {
    try {
        let { nom, adresse, id_user } = request.body;
        nom = nom.trim();
        adresse = adresse.trim();
        const errorServer = {};

        if (!nom || !adresse || !id_user) {
            errorServer.error = 'Le nom, l\'adresse et l\'ID de l\'utilisateur sont obligatoires';
            return response.status(400).json(errorServer);
        }

        const etablissementExist = await Etablissement.findOne({ where: { nom } });

        if (etablissementExist) {
            errorServer.existeNom = "Cet établissement existe déjà";
            return response.status(400).json(errorServer);
        }

        const etablissement = { nom, adresse, id_user };
        await Etablissement.create(etablissement);
        response.status(201).json({ success: "Établissement ajouté avec succès" });
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur lors de l\'ajout de l\'établissement');
    }
},
liste: async (request, response) => {
  try {
      const page = parseInt(request.query.page, 10) || 1;
      const limit = 6; // Nombre d'éléments par page
      const offset = (page - 1) * limit; // Calcul de l'offset

      const { count, rows } = await Etablissement.findAndCountAll({
          limit,
          offset,
          include: [
              {
                  model: User,
                  as: 'user'
              },
          ]
      });

      const totalPages = Math.ceil(count / limit); // Nombre total de pages

      response.status(200).json({
          totalPages,
          currentPage: page,
          formateurs: rows, // Renvoie les établissements avec leurs utilisateurs associés
      });
  } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la récupération des établissements');
  }
},

  supprimer: async (request, response) => {
    try {
      const etablissementIds = request.params.ids.split('-');
      await Etablissement.destroy({
        where: {
          id: etablissementIds
        }
      });

      response.status(200).json({ message: 'Établissements supprimés avec succès' });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la suppression des établissements');
    }
  },
  update: async (request, response) => {
    try {
      const { id, nom, adresse, id_user } = request.body;
  
      const errorServer = {};
  
      if (!nom || !id_user) {
        errorServer.error = "Le nom et l'id de l'utilisateur sont obligatoires";
        return response.status(400).json(errorServer);
      }
  
      const etablissement = await Etablissement.findByPk(id);
      if (!etablissement) {
        return response.status(404).json({ error: "Établissement non trouvé" });
      }
  
      const etablissementExist = await Etablissement.findOne({ where: { nom } });
      if (etablissementExist && etablissementExist.id !== id) {
        errorServer.existeNom = "Ce nom d'établissement existe déjà";
        return response.status(400).json(errorServer);
      }
  
      await etablissement.update({ nom, adresse, id_user });
      response.status(200).json({ success: "Établissement mis à jour avec succès" });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la mise à jour de l\'établissement');
    }
  },
    searchNext: async (request, response) => {
    try {
        const { search, page } = request.query;
        let pageNumber = 1; // Par défaut, définir la page sur 1

        if (page && !isNaN(parseInt(page))) {
            // Vérifier si page est défini et qu'il peut être converti en un nombre
            pageNumber = parseInt(page);
        }
                
        if (!search) {
            return response.status(400).json({ message: 'Le terme de recherche est requis' });
        }

        const searchOptions = {
            [Op.or]: [
                { nom: { [Op.like]: `%${search}%` } },
                { adresse: { [Op.like]: `%${search}%` } },
            ],
        };

        const limit = 6; // Nombre d'éléments par page
    
        const offset = (pageNumber - 1) * limit; // Calcul de l'offset en fonction de la page

        const { count, rows } = await Etablissement.findAndCountAll({
            limit,
            offset,
            include: [
                {
                    model: User,
                    as: 'user'
                },
            ],
            where: searchOptions, // Déplacez cet objet dans les options globales de findAndCountAll
        });
        
        const totalPages = Math.ceil(count / limit); // Nombre total de pages
        response.status(200).json({
            totalPages,
            currentPage: pageNumber,
            formateurs: rows,
        });
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Erreur lors de la recherche' });
    }
},
getListEtablissementAll: async (request, response) => {
  try {
    const etablissements = await Etablissement.findAll()
    
    if (!etablissements) {
      return response.status(404).json({ error: "etablissment non trouvé" });
    }
          response.status(200).json(etablissements);
  } catch (error) {
    console.error(error);
   
    response.status(500).send('Erreur lors de la récupération des groupes');
  }
},
};

module.exports = etablissementController;
