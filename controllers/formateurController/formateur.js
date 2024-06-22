const { Formateur, Groupe } = require('../../config/sequelize');
const { Op } = require('sequelize');

const formateurController = {
  ajouter: async (request, response) => {

    try {
      [idEtablissement]=request.user.idEtablissement

      const { nom, prenom, metier, email, matricule } = request.body;
      
      const errorServer = {};

      if (!nom || !idEtablissement || !prenom || !metier || !email || !matricule) {
        errorServer.error = 'Tous les champs sont obligatoires';
        return response.status(400).json(errorServer);
      }

      const formateurExist = await Formateur.findOne({ where: { matricule,id_etablissement:idEtablissement } });

      if (formateurExist) {
        errorServer.existMat = "Formateur avec ce matricule existe déjà";
        return response.status(400).json(errorServer);
      }

      const formateurExistEmail = await Formateur.findOne({ where: { email } });

      if (formateurExistEmail) {
        errorServer.existEmail = "Formateur avec cet email existe déjà";
        return response.status(400).json(errorServer);
      }

      const formateur = { nom, prenom, metier, email, matricule,id_etablissement:idEtablissement };
      await Formateur.create(formateur);
      response.status(201).json({ success: "Formateur ajouté avec succès" });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de l\'ajout du formateur');
    }
  },

  liste: async (request, response) => {
    try {
      [idEtablissement]=request.user.idEtablissement

      const page = parseInt(request.query.page) || 1;
      const limit = 6; // Nombre d'éléments par page
      const offset = (page - 1) * limit; // Calcul de l'offset
      const { count, rows } = await Formateur.findAndCountAll({
           where:{
              id_etablissement:idEtablissement
           }
      },{
        limit,
        offset,
      });

      const totalPages = Math.ceil(count / limit); // Nombre total de pages

      response.status(200).json({
        // totalFormateurs: count,
        totalPages,
        currentPage: page,
        formateurs: rows,
      });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la récupération des formateurs');
    }
  },
 supprimer: async  (request, response)=>  {
  try {
    const formateurIds = request.params.ids.split('-');
    
    await Formateur.destroy({
        where: {
            id: formateurIds
        }
    });

    response.status(200).json({ message: 'Formateurs supprimés avec succès' });
} catch (error) {
    console.error(error);
    response.status(500).send('Erreur lors de la suppression des formateurs');
}
}
,
update: async (request, response) => {
  try {
    const {id, nom, prenom, metier, email, matricule } = request.body;
    
    const errorServer = {};

    // Vérifier si tous les champs requis sont fournis
    if (!nom || !prenom || !metier || !email || !matricule) {
      errorServer.error = 'Tous les champs sont obligatoires';
      return response.status(400).json(errorServer);
    }

    const formateurExistMat = await Formateur.findOne({ where: { matricule ,id_etablissement:idEtablissement } });
    if (formateurExistMat && formateurExistMat.id!== id) {
      errorServer.existeEMat = "Ce matricule existe déjà";
      return response.status(400).json(errorServer);
    }
    // Vérifier si un formateur avec le même email existe déjà
    const formateurExist = await Formateur.findOne({ where: { email } });
    if (formateurExist && formateurExist.id!== id) {
      errorServer.existeEMail = "Un formateur avec cet email existe déjà";
      return response.status(400).json(errorServer);
    }

    // Mettre à jour les informations du formateur
    const formateur = await Formateur.findOne({ where: { id } });
    if (!formateur) {
      return response.status(404).json({ error: "Formateur non trouvé" });
    }

    await formateur.update({matricule , nom, prenom, metier, email });
    errorServer.success="Formateur mis à jour avec succès"
    response.status(200).json(errorServer);
  } catch (error) {
    console.error(error);
    response.status(500).send('Erreur lors de la mise à jour du formateur');
  }
},
searchNext: async (request, response) => {
  try {
    const { search, page } = request.query;
    const [idEtablissement] = request.user.idEtablissement; // Assurez-vous que idEtablissement est correctement assigné
    
    let pageNumber = 1; // Par défaut, définir la page sur 1

    if (page && !isNaN(parseInt(page))) {
      // Vérifier si page est défini et qu'il peut être converti en un nombre
      pageNumber = parseInt(page);
    }
        
    if (!search) {
      return response.status(400).json({ message: 'Search term is required' });
    }

    const searchOptions = {
      where: {
        id_etablissement: idEtablissement,
        [Op.or]: [
          { nom: { [Op.like]: `%${search}%` } },
          { prenom: { [Op.like]: `%${search}%` } },
          { matricule: { [Op.like]: `%${search}%` } },
          { metier: { [Op.like]: `%${search}%` } },
        ],
      },
      limit: 6, // Nombre d'éléments par page
      offset: (pageNumber - 1) * 6, // Calcul de l'offset en fonction de la page
    };

    const { count, rows } = await Formateur.findAndCountAll(searchOptions);

    const totalPages = Math.ceil(count / searchOptions.limit); // Nombre total de pages
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

allFormateurs:async (request, response) => {
  try {
    [idEtablissement]=request.user.idEtablissement

     const liste= await Formateur.findAll({
        where:{
           id_etablissement:idEtablissement
        }
     })
    response.status(200).json(liste);
  } catch (error) {
    console.error(error);
    response.status(500).json({ message: 'Error during fetchind data' });
  }
},
addGroupeFormateur: async (request, response) => {
  try {
      let { idGroupe, idFormateur } = request.body;

      const errorServer = {};

      if (!idGroupe || !idFormateur) {
          errorServer.error = 'Tous les champs sont obligatoires';
          return response.status(400).json(errorServer);
      }

      const formateurExiste = await Formateur.findByPk(idFormateur);

      if (!formateurExiste) {
          errorServer.notExisteFiliere = "Le formateur n'existe pas";
          return response.status(400).json(errorServer);
      }
      const groupeExiste = await Groupe.findByPk(idGroupe);

      if (!groupeExiste) {
          errorServer.notExisteModule = "Le groupe n'existe pas";
          return response.status(400).json(errorServer);
      }

      // Suppose que vous avez une association entre Filiere et Module
      await formateurExiste.addGroupe(groupeExiste);

      response.status(201).json({ success: "Module de filière ajouté avec succès" });
  } catch (error) {
      console.error(error);
      response.status(500).send("Erreur lors de l'ajout du module");
  }
},getGroupeFormateur: async (request, response) => {
  try {
    const { id } = request.query;
    const formateur = await Formateur.findByPk(id);
    
    if (!formateur) {
      return response.status(404).json({ error: "Formateur non trouvée" });
    }
    
    const groupes = await formateur.getGroupes();
    response.status(200).json(groupes);
  } catch (error) {
    console.error(error);
    response.status(500).send('Erreur lors de la récupération des modules');
  }
},
getGroupesNonInclusFormateur: async (request, response) => {
  try {
      const { idFormateur } = request.query;
      const formateurExist = await Formateur.findByPk(idFormateur);
      [idEtablissement]=request.user.idEtablissement

      if (!formateurExist) {
          return response.status(404).json({ error: "Formateur non trouvée" });
      }
      
      const groupesFormateur = await formateurExist.getGroupes();
      const listeIdGroupeFormateur = groupesFormateur.map((groupe) => groupe.id);

      const groupes = await Groupe.findAll({
          where: {
              id: {
                  [Op.notIn]: listeIdGroupeFormateur
              },
              id_etablissement: {
                [Op.eq]: idEtablissement
            }
          }
      });

      response.status(200).json(groupes);
  } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la récupération des modules');
  }
},
formateurSupprimerGroupeormateur:async (request, response) => {
  try {
      let { idGroupe, idFormateur } = request.body;

      const errorServer = {};

      if (!idGroupe || !idFormateur) {
          errorServer.error = 'Tous les champs sont obligatoires';
          return response.status(400).json(errorServer);
      }

      const formateurExiste = await Formateur.findByPk(idFormateur);

      if (!formateurExiste) {
          errorServer.notExisteFormateur = "Le formateur n'existe pas";
          return response.status(400).json(errorServer);
      }
      const GroupeExiste = await Groupe.findByPk(idGroupe);

      if (!GroupeExiste) {
        errorServer.notExisteFormateur = "Le module n'existe pas";
        return response.status(400).json(errorServer);
    }
      // Suppose que vous avez une association entre Formateur et Module
      await formateurExiste.removeGroupe(GroupeExiste);

      response.status(201).json({ success: "Module de formateur supprimé avec succès" });
  } catch (error) {
      console.error(error);
      response.status(500).send("Erreur lors de l'ajout du module");
  }
},
}

module.exports = formateurController;
