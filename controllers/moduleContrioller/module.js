const { format } = require('mysql2');
const { Module, Formateur } = require('../../config/sequelize');
const { Op } = require('sequelize');

const moduleController = {
  ajouter: async (request, response) => {
    try {
      let { codeModule, description, masseHoraire, MHP, MHD } = request.body;
      codeModule = codeModule.trim();
      description = description.trim();
      const errorServer = {};

      if (!codeModule || !description || !masseHoraire || !MHP || !MHD) {
        errorServer.error = 'Tous les champs sont obligatoires';
        return response.status(400).json(errorServer);
      }

      const moduleExist = await Module.findOne({ where: { description } });

      if (moduleExist) {
        errorServer.existeDescription = "cette description existe déjà";
        return response.status(400).json(errorServer);
      }

      const moduleFind = await Module.findOne({ where: { codeModule } });
      if (moduleFind) {
        errorServer.existeCode = "Ce code existe déjà";
        return response.status(400).json(errorServer);
      }
  

      const module = { codeModule, description, masseHoraire, MHP, MHD };
      await Module.create(module);
      response.status(201).json({ success: "Module ajouté avec succès" });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de l\'ajout du module');
    }
  },

  liste: async (request, response) => {
    try {
      const page = parseInt(request.query.page) || 1;
      const limit = 6; // Nombre d'éléments par page
      const offset = (page - 1) * limit; // Calcul de l'offset
      const { count, rows } = await Module.findAndCountAll({
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
      await Module.destroy({
        where: {
          id: moduleIds
        }
      });

      response.status(200).json({ message: 'Modules supprimés avec succès' });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la suppression des modules');
    }
  },
  
  update: async (request, response) => {
    try {
      const {id, codeModule, description, masseHoraire, MHP, MHD } = request.body;
      
      const errorServer = {};

      // Vérifier si tous les champs requis sont fournis
      if (!codeModule || !description || !masseHoraire || !MHP || !MHD) {
        errorServer.error = 'Tous les champs sont obligatoires';
        return response.status(400).json(errorServer);
      }

     
      // Mettre à jour les informations du module
      const module = await Module.findOne({ where: { id } });
      if (!module) {
        return response.status(404).json({ error: "Module non trouvé" });
      }

      const moduleFind = await Module.findOne({ where: { codeModule } });
      if (moduleFind && moduleFind.id !== id) {
        errorServer.existeCode = "Ce code existe déjà";
        return response.status(400).json(errorServer);
      }
  

      const moduleFindDescription = await Module.findOne({ where: { description } });
      if (moduleFindDescription && moduleFindDescription.id !== id) {
        errorServer.existeDescription = "Cette description existe déjà";
        return response.status(400).json(errorServer);
      }
  


      await module.update({codeModule, description, masseHoraire, MHP, MHD });
      errorServer.success = "Module mis à jour avec succès";
      response.status(200).json(errorServer);
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la mise à jour du module');
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
      
      console.log("search pages", pageNumber);
      
      if (!search) {
        return response.status(400).json({ message: 'Search term is required' });
      }

      const searchOptions = {
        [Op.or]: [
          { codeModule: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };

      const limit = 6; // Nombre d'éléments par page
    
      const offset = (pageNumber - 1) * limit; // Calcul de l'offset en fonction de la page

      const { count, rows } = await Module.findAndCountAll({
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
  
allModules: async (request, response) => {
  try {
      const { formateur } = request.query;
      const formateurExist = await Formateur.findByPk(formateur);
      
      if (!formateurExist) {
          return response.status(404).json({ error: "Formateur non trouvé" });
      }
      
      const modulesFormateur = await formateurExist.getModules();
      const listeIdModuleFormateur = modulesFormateur.map((module) => module.id);

      const modules = await Module.findAll({
          where: {
              id: {
                  [Op.notIn]: listeIdModuleFormateur
              }
          }
      });

      response.status(200).json(modules);
  } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la récupération des modules');
  }
},
  modulesFormateur:async (request, response) => {
    try {
      const {id}=request.query
      const formateur=await Formateur.findByPk(id);
      if (!formateur) {
        return response.status(404).json({ error: "Formateur non trouvé" });
      }
      const modules=await formateur.getModules();
      response.status(200).json(modules);
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la suppression des modules');
    }
  },
  ajouterModuleFormateur: async (request, response) => {
    try {
        let { idModule, idFormateur } = request.body;

        const errorServer = {};

        if (!idModule || !idFormateur) {
            errorServer.error = 'Tous les champs sont obligatoires';
            return response.status(400).json(errorServer);
        }

        const formateurExiste = await Formateur.findByPk(idFormateur);

        if (!formateurExiste) {
            errorServer.notExisteFormateur = "Le formateur n'existe pas";
            return response.status(400).json(errorServer);
        }
        const ModuleExiste = await Module.findByPk(idModule);

        if (!ModuleExiste) {
          errorServer.notExisteFormateur = "Le module n'existe pas";
          return response.status(400).json(errorServer);
      }

        // Suppose que vous avez une association entre Formateur et Module
        await formateurExiste.addModule(ModuleExiste);

        response.status(201).json({ success: "Module de formateur ajouté avec succès" });
    } catch (error) {
        console.error(error);
        response.status(500).send("Erreur lors de l'ajout du module");
    }
},
supprimerModuleFormateur:async (request, response) => {
  try {
      let { idModule, idFormateur } = request.body;

      const errorServer = {};

      if (!idModule || !idFormateur) {
          errorServer.error = 'Tous les champs sont obligatoires';
          return response.status(400).json(errorServer);
      }

      const formateurExiste = await Formateur.findByPk(idFormateur);

      if (!formateurExiste) {
          errorServer.notExisteFormateur = "Le formateur n'existe pas";
          return response.status(400).json(errorServer);
      }
      const ModuleExiste = await Module.findByPk(idModule);

      if (!ModuleExiste) {
        errorServer.notExisteFormateur = "Le module n'existe pas";
        return response.status(400).json(errorServer);
    }

      // Suppose que vous avez une association entre Formateur et Module
      await formateurExiste.removeModule(ModuleExiste);

      response.status(201).json({ success: "Module de formateur supprimé avec succès" });
  } catch (error) {
      console.error(error);
      response.status(500).send("Erreur lors de l'ajout du module");
  }
},
getInfosFormateur:async (request, response) => {
  try {
    const {id}=request.query
    const formateur=await Formateur.findByPk(id);
    const  errorServer={};
    if (!formateur) {
      errorServer.errorNotExiste = 'Violation,le formateur n"existe pas';
      return response.status(404).json(errorServer);
    }
    response.status(200).json(formateur);
  } catch (error) {
    console.error(error);
    response.status(500).send('Erreur lors de la suppression des modules');
  }
},
};

module.exports = moduleController;
