const { Filiere ,Module } = require('../../config/sequelize');
const { Op } = require('sequelize');

const filiereController = {
  ajouter: async (request, response) => {
    try {
      const { code, niveau, description } = request.body;
      
      const errorServer = {};

      if (!code || !niveau || !description) {
        errorServer.error = 'Tous les champs sont obligatoires';
        return response.status(400).json(errorServer);
      }

      const filiereExist = await Filiere.findOne({ where: { code } });

      const filiereExistDescrip = await Filiere.findOne({ where: { description } });

      if (filiereExist) {
        errorServer.existCode = "ce code existe déjà";
        return response.status(400).json(errorServer);
      }
      if (filiereExistDescrip) {
        errorServer.existeDescription = "cette description  existe déjà";
        return response.status(400).json(errorServer);
      }

      const filiere = { code, niveau, description };
      await Filiere.create(filiere);
      response.status(201).json({ success: "Filiere ajoutée avec succès" });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de l\'ajout de la filiere');
    }
  },

  liste: async (request, response) => {
    try {
      const page = parseInt(request.query.page) || 1;
      const limit = 6; // Nombre d'éléments par page
      const offset = (page - 1) * limit; // Calcul de l'offset
      const { count, rows } = await Filiere.findAndCountAll({
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
      const { id, code, niveau, description } = request.body;
      
      const errorServer = {};

      if (!code || !niveau || !description) {
        errorServer.error = 'Tous les champs sont obligatoires';
        return response.status(400).json(errorServer);
      }

      const filiereExistCode = await Filiere.findOne({ where: { code } });
      if (filiereExistCode && filiereExistCode.id !== id) {
        errorServer.existCode = "Ce code existe déjà";
        return response.status(400).json(errorServer);
      }
      const filiereExistDescription = await Filiere.findOne({ where: { description } });
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

      const { count, rows } = await Filiere.findAndCountAll({
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
  getInfosFiliere:async (request, response) => {
    try {
      const {id}=request.query
      const filiere=await Filiere.findByPk(id);
      const  errorServer={};
      if (!filiere) {
        errorServer.errorNotExiste = 'Violation,la filiere n"existe pas';
        return response.status(404).json(errorServer);
      }
      response.status(200).json(filiere);
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la suppression des modules');
    }
  },
  allModule: async (request, response) => {
    try {
        const { filiere } = request.query;
        const filiereExist = await Filiere.findByPk(filiere);
        
        if (!filiereExist) {
            return response.status(404).json({ error: "Filière non trouvée" });
        }
        
        const modulesFiliere = await filiereExist.getModules();
        const listeIdModuleFiliere = modulesFiliere.map((module) => module.id);
  
        const modules = await Module.findAll({
            where: {
                id: {
                    [Op.notIn]: listeIdModuleFiliere
                }
            }
        });
  
        response.status(200).json(modules);
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur lors de la récupération des modules');
    }
},
modulesFiliere: async (request, response) => {
  try {
    const { id } = request.query;
    const filiere = await Filiere.findByPk(id);
    
    if (!filiere) {
      return response.status(404).json({ error: "Filière non trouvée" });
    }
    
    const modules = await filiere.getModules();
    response.status(200).json(modules);
  } catch (error) {
    console.error(error);
    response.status(500).send('Erreur lors de la récupération des modules');
  }
},
ajouterModuleFiliere: async (request, response) => {
  try {
      let { idModule, idFiliere } = request.body;

      const errorServer = {};

      if (!idModule || !idFiliere) {
          errorServer.error = 'Tous les champs sont obligatoires';
          return response.status(400).json(errorServer);
      }

      const filiereExiste = await Filiere.findByPk(idFiliere);

      if (!filiereExiste) {
          errorServer.notExisteFiliere = "La filière n'existe pas";
          return response.status(400).json(errorServer);
      }
      const moduleExiste = await Module.findByPk(idModule);

      if (!moduleExiste) {
          errorServer.notExisteModule = "Le module n'existe pas";
          return response.status(400).json(errorServer);
      }

      // Suppose que vous avez une association entre Filiere et Module
      await filiereExiste.addModule(moduleExiste);

      response.status(201).json({ success: "Module de filière ajouté avec succès" });
  } catch (error) {
      console.error(error);
      response.status(500).send("Erreur lors de l'ajout du module");
  }
},
supprimerModuleFiliere: async (request, response) => {
  try {
      let { idModule, idFiliere } = request.body;
      console.log("datas",request.body)
      const errorServer = {};

      if (!idModule || !idFiliere) {
          errorServer.error = 'Tous les champs sont obligatoires';
          return response.status(400).json(errorServer);
      }

      const filiereExiste = await Filiere.findByPk(idFiliere);

      if (!filiereExiste) {
          errorServer.notExisteFiliere = "La filière n'existe pas";
          return response.status(400).json(errorServer);
      }
      const moduleExiste = await Module.findByPk(idModule);

      if (!moduleExiste) {
          errorServer.notExisteModule = "Le module n'existe pas";
          return response.status(400).json(errorServer);
      }

      // Suppose que vous avez une association entre Filiere et Module
      await filiereExiste.removeModule(moduleExiste);

      response.status(201).json({ success: "Module de filière supprimé avec succès" });
  } catch (error) {
      console.error(error);
      response.status(500).send("Erreur lors de la suppression du module");
  }
},
listeFiliereAll:async (request, response) => {
  try {
    const filieres= await Filiere.findAll()
    response.status(200).json(filieres);
  } catch (error) {
    console.error(error);
    response.status(500).send('Erreur lors de la récupération des filieres');
  }
},

}

module.exports = filiereController;
