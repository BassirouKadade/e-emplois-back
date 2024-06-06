const { Groupe ,Filiere, Module} = require('../../config/sequelize');
const { Op } = require('sequelize');

const groupeController = {
  ajouter: async (request, response) => {
    try {
      let { code, description, id_filiere } = request.body;
      code = code.trim();
      description = description.trim();
      const errorServer = {};

      if (!code || !id_filiere) {
        errorServer.error = 'Le code et l\'id de la filière sont obligatoires';
        return response.status(400).json(errorServer);
      }

      const groupeExist = await Groupe.findOne({ where: { code } });

      if (groupeExist) {
        errorServer.existeCode = "Ce code de groupe existe déjà";
        return response.status(400).json(errorServer);
      }

      const groupe = { code, description, id_filiere };
      await Groupe.create(groupe);
      response.status(201).json({ success: "Groupe ajouté avec succès" });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de l\'ajout du groupe');
    }
  },

  liste: async (request, response) => {
    try {
        const page = parseInt(request.query.page, 10) || 1;
        const limit = 6; // Nombre d'éléments par page
        const offset = (page - 1) * limit; // Calcul de l'offset

        const { count, rows } = await Groupe.findAndCountAll({
            limit,
            offset,
            include: [
                {
                    model: Filiere,
                    as: 'filiere'
                },

            ]
        });

        const totalPages = Math.ceil(count / limit); // Nombre total de pages

        response.status(200).json({
            totalPages,
            currentPage: page,
            formateurs: rows, // Renvoie les groupes avec leurs filières et modules associés avec état d'avancement
        });
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur lors de la récupération des groupes');
    }
},
  supprimer: async (request, response) => {
    try {
      console.log(request.params.ids);
      const groupeIds = request.params.ids.split('-');
      console.log(groupeIds);
      await Groupe.destroy({
        where: {
          id: groupeIds
        }
      });

      response.status(200).json({ message: 'Groupes supprimés avec succès' });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la suppression des groupes');
    }
  },
  
  update: async (request, response) => {
    try {
      const { id, code, description, id_filiere } = request.body;
      
      const errorServer = {};

      if (!code || !id_filiere) {
        errorServer.error = 'Le code et l\'id de la filière sont obligatoires';
        return response.status(400).json(errorServer);
      }

      const groupe = await Groupe.findByPk(id);
      if (!groupe) {
        return response.status(404).json({ error: "Groupe non trouvé" });
      }

      const groupeExist = await Groupe.findOne({ where: { code } });
      if (groupeExist && groupeExist.id !== id) {
        errorServer.existeCode = "Ce code de groupe existe déjà";
        return response.status(400).json(errorServer);
      }

      await groupe.update({ code, description, id_filiere });
      errorServer.success = "Groupe mis à jour avec succès";
      response.status(200).json(errorServer);
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la mise à jour du groupe');
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
          { code: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
        ],
      };

      const limit = 6; // Nombre d'éléments par page
    
      const offset = (pageNumber - 1) * limit; // Calcul de l'offset en fonction de la page

      const { count, rows } = await Groupe.findAndCountAll({
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
  getGroupeTotale:async (request, response) => {
    try {
      const groupes=await Groupe.findAll()
      response.status(200).json(groupes);
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la suppression des groupes');
    }
  },
  getFormateurGroupe:async (request, response) => {
    try {
        const { idGroupe } = request.query;
        if (!idGroupe) {
            return response.status(400).send('ID du groupe manquant');
        }

        const groupe = await Groupe.findByPk(idGroupe);
        if (!groupe) {
            return response.status(404).send('Groupe non trouvé');
        }

        const formateurs = await groupe.getFormateurs();
        response.status(200).json(formateurs);
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur lors de la récupération des formateurs');
    }
  },
  allModulesGroupe: async (request, response) => {
    try {
        const { groupe } = request.query;
        const groupeExist = await Groupe.findByPk(groupe);
        
        if (!groupeExist) {
            return response.status(404).json({ error: "Groupe non trouvée" });
        }
        
        const modulesGroupe = await groupeExist.getModules();
        const listeIdModuleGroupe = modulesGroupe.map((module) => module.id);
  
        const modules = await Module.findAll({
            where: {
                id: {
                    [Op.notIn]: listeIdModuleGroupe
                }
            }
        });
  
        response.status(200).json(modules);
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur lors de la récupération des modules');
    }
},
modulesGroupeDisponible: async (request, response) => {
  try {
    const { id } = request.query;
    const groupe = await Groupe.findByPk(id);
    
    if (!groupe) {
      return response.status(404).json({ error: "groupe non trouvée" });
    }
    
    const modules = await groupe.getModules();
    response.status(200).json(modules);
  } catch (error) {
    console.error(error);
    response.status(500).send('Erreur lors de la récupération des modules');
  }
},
getInfosGroupe:async (request, response) => {
  try {
    const {id}=request.query
    const groupe=await Groupe.findByPk(id);
    const  errorServer={};
    if (!groupe) {
      errorServer.errorNotExiste = 'Violation,la groupe n"existe pas';
      return response.status(404).json(errorServer);
    }
    response.status(200).json(groupe);
  } catch (error) {
    console.error(error);
    response.status(500).send('Erreur lors de la suppression des modules');
  }
},
ajouterModuleGroupe: async (request, response) => {
  try {
      let { idModule, idGroupe } = request.body;

      const errorServer = {};

      if (!idModule || !idGroupe) {
          errorServer.error = 'Tous les champs sont obligatoires';
          return response.status(400).json(errorServer);
      }

      const groupeExiste = await Groupe.findByPk(idGroupe);

      if (!groupeExiste) {
          errorServer.notExisteFiliere = "Le groupe n'existe pas";
          return response.status(400).json(errorServer);
      }
      const moduleExiste = await Module.findByPk(idModule);

      if (!moduleExiste) {
          errorServer.notExisteModule = "Le module n'existe pas";
          return response.status(400).json(errorServer);
      }

      // Suppose que vous avez une association entre Filiere et Module
      await groupeExiste.addModule(moduleExiste, { through: { etat_avancement: 0 } });

      response.status(201).json({ success: "Module de filière ajouté avec succès" });
  } catch (error) {
      console.error(error);
      response.status(500).send("Erreur lors de l'ajout du module");
  }
},
supprimerModuleGroupe: async (request, response) => {
  try {
      let { idModule, idGroupe } = request.body;
      const errorServer = {};

      if (!idModule || !idGroupe) {
          errorServer.error = 'Tous les champs sont obligatoires';
          return response.status(400).json(errorServer);
      }

      const groupeExiste = await Groupe.findByPk(idGroupe);

      if (!groupeExiste) {
          errorServer.notExisteFiliere = "La groupe n'existe pas";
          return response.status(400).json(errorServer);
      }
      const moduleExiste = await Module.findByPk(idModule);

      if (!moduleExiste) {
          errorServer.notExisteModule = "Le module n'existe pas";
          return response.status(400).json(errorServer);
      }

      // Suppose que vous avez une association entre Filiere et Module
      await groupeExiste.removeModule(moduleExiste);

      response.status(201).json({ success: "Module de filière supprimé avec succès" });
  } catch (error) {
      console.error(error);
      response.status(500).send("Erreur lors de la suppression du module");
  }
},
};

module.exports = groupeController;
