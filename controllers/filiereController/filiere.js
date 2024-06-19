const { Filiere ,Module } = require('../../config/sequelize');
const { Op } = require('sequelize');

const filiereController = {
  ajouter: async (request, response) => {
    try {
      const { code, niveau, description } = request.body;
      [idEtablissement]=request.user.idEtablissement

      const errorServer = {};

      if (!code || !niveau || !description) {
        errorServer.error = 'Tous les champs sont obligatoires';
        return response.status(400).json(errorServer);
      }

      const filiereExist = await Filiere.findOne({ where: { code,id_etablissement:idEtablissement } });

      const filiereExistDescrip = await Filiere.findOne({ where: { description,id_etablissement:idEtablissement  } });

      if (filiereExist) {
        errorServer.existCode = "ce code existe déjà";
        return response.status(400).json(errorServer);
      }
      if (filiereExistDescrip) {
        errorServer.existeDescription = "cette description  existe déjà";
        return response.status(400).json(errorServer);
      }

      const filiere = {id_etablissement:idEtablissement,  code, niveau, description };
      await Filiere.create(filiere);
      response.status(201).json({ success: "Filiere ajoutée avec succès" });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de l\'ajout de la filiere');
    }
  },

  liste: async (request, response) => {
    try {
      [idEtablissement]=request.user.idEtablissement

      const page = parseInt(request.query.page) || 1;
      const limit = 6; // Nombre d'éléments par page
      const offset = (page - 1) * limit; // Calcul de l'offset
      const { count, rows } = await Filiere.findAndCountAll(
        {
          where:{
             id_etablissement:idEtablissement
          }
        }
        ,{
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
      response.status(500).send('Erreur lors de la récupération des filieres');
    }
  },

  supprimer: async (request, response) => {
    try {
      const filiereIds = request.params.ids.split('-');
      await Filiere.destroy({
        where: {
          id: filiereIds
        }
      });

      response.status(200).json({ message: 'Filieres supprimées avec succès' });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la suppression des filieres');
    }
  },

  update: async (request, response) => {
    try {
      [idEtablissement]=request.user.idEtablissement

      const { id, code, niveau, description } = request.body;
      
      const errorServer = {};

      if (!code || !niveau || !description) {
        errorServer.error = 'Tous les champs sont obligatoires';
        return response.status(400).json(errorServer);
      }

      const filiereExistCode = await Filiere.findOne({ where: { code ,id_etablissement:idEtablissement} });
      if (filiereExistCode && filiereExistCode.id !== id) {
        errorServer.existCode = "Ce code existe déjà";
        return response.status(400).json(errorServer);
      }
      const filiereExistDescription = await Filiere.findOne({ where: { description ,id_etablissement:idEtablissement} });
      if (filiereExistDescription && filiereExistDescription.id !== id) {
        errorServer.existDescription = "Cette description existe déjà";
        return response.status(400).json(errorServer);
      }

      const filiere = await Filiere.findOne({ where: { id } });
      if (!filiere) {
        return response.status(404).json({ error: "Filiere non trouvée" });
      }

      await filiere.update({ code, niveau, description });
      response.status(200).json({ success: "Filiere mise à jour avec succès" });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la mise à jour de la filiere');
    }
  },

  searchNext: async (request, response) => {
    try {
      [idEtablissement]=request.user.idEtablissement

      const { search, page } = request.query;
      let pageNumber = 1; // Par défaut, définir la page sur 1

      if (page && !isNaN(parseInt(page))) {
        pageNumber = parseInt(page);
      }
      
      if (!search) {
        return response.status(400).json({ message: 'Search term is required' });
      }

      const searchOptions = {
        [Op.or]: [
          { code: { [Op.like]: `%${search}%` } },
          { niveau: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };

      const limit = 6; // Nombre d'éléments par page
      const offset = (pageNumber - 1) * limit; // Calcul de l'offset en fonction de la page

      const { count, rows } = await Filiere.findAndCountAll(
        {
          where:{
             id_etablissement:idEtablissement
          }
        },{
        limit,
        offset,
        where: searchOptions,
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

  
listeFiliereAll:async (request, response) => {
  try {
    [idEtablissement]=request.user.idEtablissement

    const filieres= await Filiere.findAll({
      where:{
         id_etablissement:idEtablissement
      }
    })
    response.status(200).json(filieres);
  } catch (error) {
    console.error(error);
    response.status(500).send('Erreur lors de la récupération des filieres');
  }
},

}

module.exports = filiereController;
