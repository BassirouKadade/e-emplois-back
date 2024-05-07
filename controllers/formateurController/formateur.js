const { Formateur } = require('../../config/sequelize');
const { Op } = require('sequelize');

const formateurController = {
  ajouter: async (request, response) => {
    try {
      const { nom, prenom, metier, email, matricule } = request.body;
      
      const errorServer = {};

      if (!nom || !prenom || !metier || !email || !matricule) {
        errorServer.error = 'Tous les champs sont obligatoires';
        return response.status(400).json(errorServer);
      }

      const formateurExist = await Formateur.findOne({ where: { matricule } });

      if (formateurExist) {
        errorServer.existMat = "Formateur avec ce matricule existe déjà";
        return response.status(400).json(errorServer);
      }

      const formateurExistEmail = await Formateur.findOne({ where: { email } });

      if (formateurExistEmail) {
        errorServer.existEmail = "Formateur avec cet email existe déjà";
        return response.status(400).json(errorServer);
      }

      const formateur = { nom, prenom, metier, email, matricule };
      await Formateur.create(formateur);
      response.status(201).json({ success: "Formateur ajouté avec succès" });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de l\'ajout du formateur');
    }
  },

  liste: async (request, response) => {
    try {
      const page = parseInt(request.query.page) || 1;
      const limit = 6; // Nombre d'éléments par page
      const offset = (page - 1) * limit; // Calcul de l'offset
      const { count, rows } = await Formateur.findAndCountAll({
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
    console.log( request.params.ids)
    const formateurIds = request.params.ids.split('-');
    console.log(formateurIds)
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
    const { nom, prenom, metier, email, matricule } = request.body;
    
    const errorServer = {};

    // Vérifier si tous les champs requis sont fournis
    if (!nom || !prenom || !metier || !email || !matricule) {
      errorServer.error = 'Tous les champs sont obligatoires';
      return response.status(400).json(errorServer);
    }

    // Vérifier si un formateur avec le même email existe déjà
    const formateurExist = await Formateur.findOne({ where: { email } });
    if (formateurExist && formateurExist.matricule !== matricule) {
      errorServer.existeEMail = "Un formateur avec cet email existe déjà";
      return response.status(400).json({m:"poiuy"});
    }

    // Mettre à jour les informations du formateur
    const formateur = await Formateur.findOne({ where: { matricule } });
    if (!formateur) {
      return response.status(404).json({ error: "Formateur non trouvé" });
    }

    await formateur.update({ nom, prenom, metier, email });

    response.status(200).json({ success: "Formateur mis à jour avec succès" });
  } catch (error) {
    console.error(error);
    response.status(500).send('Erreur lors de la mise à jour du formateur');
  }
}



};

module.exports = formateurController;
