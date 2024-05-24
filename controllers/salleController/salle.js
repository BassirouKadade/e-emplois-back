const { Salle } = require('../../config/sequelize');
const { Op } = require('sequelize');

const salleController = {
  ajouter: async (request, response) => {
    try {
      let { MREST,MH,nom, capacite, emplacement } = request.body;
      nom = nom.trim();
      emplacement = emplacement.trim();
      const errorServer = {};

      if (!nom || !MREST || !MH ||!capacite) {
        errorServer.error = 'Le nom et la capacité sont obligatoires';
        return response.status(400).json(errorServer);
      }

      const salleExist = await Salle.findOne({ where: { nom } });

      if (salleExist) {
        errorServer.existeNom = "Ce nom de salle existe déjà";
        return response.status(400).json(errorServer);
      }

      const salle = { nom, MREST,MH,capacite, emplacement };
      await Salle.create(salle);
      response.status(201).json({ success: "Salle ajoutée avec succès" });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de l\'ajout de la salle');
    }
  },

  liste: async (request, response) => {
    try {
      const page = parseInt(request.query.page) || 1;
      const limit = 6; // Nombre d'éléments par page
      const offset = (page - 1) * limit; // Calcul de l'offset
      const { count, rows } = await Salle.findAndCountAll({
        limit,
        offset,
      });

      const totalPages = Math.ceil(count / limit); // Nombre total de pages

      response.status(200).json({
        totalPages,
        currentPage: page,
        formateurs: rows,
      });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la récupération des modules');
    }
  },
  
  supprimer: async (request, response) => {
    try {
      console.log(request.params.ids);
      const moduleIds = request.params.ids.split('-');
      console.log(moduleIds);
      await Salle.destroy({
        where: {
          id: moduleIds
        }
      });

      response.status(200).json({ message: 'salle supprimés avec succès' });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la suppression des modules');
    }
  },
  
  update: async (request, response) => {
    try {
      const { id,MREST,MH, nom, capacite, emplacement } = request.body;
      
      const errorServer = {};

      if (!nom || !MREST || !MH ||!capacite) {
        errorServer.error = 'Le nom et la capacité sont obligatoires';
        return response.status(400).json(errorServer);
      }

      const salle = await Salle.findByPk(id);
      if (!salle) {
        return response.status(404).json({ error: "Salle non trouvée" });
      }

      const salleExist = await Salle.findOne({ where: { nom } });
      if (salleExist && salleExist.id !== id) {
        errorServer.existeNom = "Ce nom de salle existe déjà";
        return response.status(400).json(errorServer);
      }

      await salle.update({MREST,MH, nom, capacite, emplacement });
      errorServer.success = "Salle mise à jour avec succès";
      response.status(200).json(errorServer);
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la mise à jour de la salle');
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
        return response.status(400).json({ message: 'Search term is required' });
      }

      const searchOptions = {
        [Op.or]: [
          { nom: { [Op.like]: `%${search}%` } },
          { emplacement: { [Op.like]: `%${search}%` } },
        ],
      };

      const limit = 6; // Nombre d'éléments par page
    
      const offset = (pageNumber - 1) * limit; // Calcul de l'offset en fonction de la page

      const { count, rows } = await Salle.findAndCountAll({
        limit,
        offset,
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
      response.status(500).json({ message: 'Error during search' });
    }
  },
  getAllSalleDatabase:async (request, response) => {
    try {
     
     const salles= await Salle.findAll()
      response.status(200).json(salles);
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la suppression des modules');
    }
  },
};

module.exports = salleController;
