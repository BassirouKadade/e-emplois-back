const { Reservation, Salle, Groupe, Formateur, Module } = require('../../config/sequelize');
const { Op } = require('sequelize');

const emploisController = {
  verificationEmplois: async (request, response) => {
    try {
      const { day,idGroupe, start, end } = request.body;
      console.log(request.body)
      if (start<0 || !day || end<0) {
        return response.status(400).json({ error: 'Start, end dates, and day are required' });
      }
      const reservations = await Reservation.findAll({
        where: {
          day: { [Op.eq]: day },
          [Op.or]: [
            {
              startIndex: { [Op.lte]: start },
              startEnd: { [Op.gt]: start }
            },
            {
              startIndex: { [Op.lt]: end },
              startEnd: { [Op.gte]: end }
            },
            {
              startIndex: { [Op.gte]: start },
              startEnd: { [Op.lte]: end }
            }
          ]
        }
      });
      const groupe = await Groupe.findByPk(idGroupe);
      const formateursGroupe = await groupe?.getFormateurs();
      const formateursIds= formateursGroupe?  formateursGroupe.map(formateur => formateur.id):[];
      const reservedFormateurMat = reservations 
      ? reservations.map(reservation => reservation.formateur).filter(formateur => formateur !== null)
      : [];     
      
      // console.log('rF',reservedFormateurMat)
      const formateurs = await Formateur.findAll({
        where: {
            [Op.and]: [
                { matricule: { [Op.notIn]: reservedFormateurMat.length === 0 ? [] : reservedFormateurMat } },
                { id: { [Op.in]: formateursIds } }
            ]
        },
        include: [{
            model: Module,
            as:"modules"  
        }]
    });
    // console.log("form",formateurs)
      const reservedSalleIds = reservations.map(reservation => reservation.salle);

      const salles = await Salle.findAll({
          where: {
              [Op.and]: [
                  { nom: { [Op.notIn]: reservedSalleIds } },
                  { MREST: { [Op.gt]: 0 } }
              ]
          }
      });
      
      response.status(200).json({salles,formateurs});
    } catch (error) {
      console.error('Erreur lors de la vérification des emplois:', error);
      response.status(500).send('Erreur lors de la vérification des emplois');
    }
  },
  creerEmplois: async (request, response) => {
    try {
      const {
        startIndex,
        startEnd,
        idSalle,
        idGroupe,
        typeSeance,
        day,
        top,
        width,
        idFormateur,
        idModule
      } = request.body;
  
      // Vérification des paramètres requis
      if (startIndex < 0 || !width || startEnd < 0 || !idGroupe || !typeSeance) {
        return response.status(400).json({ error: 'Paramètres requis manquants' });
      }
  
      const nombreSeance = width / 45;
      const resultNombre = nombreSeance * 0.5;
  
      let salle = null;
  
      if (idSalle > 0) {
        salle = await Salle.findByPk(idSalle);
  
        if (salle) {
          salle.MREST -= resultNombre;
          await salle.save();
        }
      }
  
      const groupe = await Groupe.findByPk(idGroupe);
      const formateur = await Formateur.findByPk(idFormateur);
      const module = await Module.findByPk(idModule);
  
      await Reservation.create({
        startIndex: startIndex,
        startEnd: startEnd,
        typeReservation: typeSeance,
        groupe: groupe?.code, // Utiliser le code du groupe
        salle: salle?.nom ?? '0', // Utiliser '0' si salle.nom est undefined
        day: day,
        width: width,
        startTop: top,
        formateur: formateur?.matricule,
        module: module?.description,
        nombeHeureSeance: resultNombre,
        formateurInfo: `${formateur?.nom} ${formateur?.prenom}`
      });
  
      const reservations = await Reservation.findAll({
        where: {
          groupe: groupe?.code
        }
      });
  
      response.status(200).json(reservations);
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la vérification de la planification des emplois');
    }
  },
  getEmplois: async (request, response) => {
    try {
      const { idGroupe } = request.query;
      if (!idGroupe) {
        return response.status(400).json({ error: 'idGroupe is required' });
      }
  
      const groupe = await Groupe.findByPk(idGroupe);
      if (!groupe) {
        return response.status(404).json({ error: 'Groupe not found' });
      }
      const reservations = await Reservation.findAll({
        where: {
          groupe: { [Op.eq]: groupe.code } // Assuming 'groupe' refers to 'idGroupe'
        }
      });
  
      response.status(200).json(reservations);
    } catch (error) {
      console.error('Erreur lors de la vérification des emplois:', error);
      response.status(500).send('Erreur lors de la vérification des emplois');
    }
  },  
  getTotaleMasseHoraire: async (request, response) => {
    try {
      const { idGroupe } = request.query;
      if (!idGroupe) {
        return response.status(400).json({ error: 'idGroupe is required' });
      }
  
      const groupe = await Groupe.findByPk(idGroupe);
      if (!groupe) {
        return response.status(404).json({ error: 'Groupe not found' });
      }
  
      const reservations = await Reservation.findAll({
        where: {
          groupe: { [Op.eq]: groupe.code } // Assuming 'groupe' refers to 'code' field in the Reservation model
        },
        attributes: ['nombeHeureSeance'] // Only select the 'nombeHeureSeance' field
      });
  
      // Sum the 'nombeHeureSeance' field from all reservations
      const totalHeures = reservations.reduce((total, reservation) => {
        return total + reservation.nombeHeureSeance;
      }, 0);
  
      response.status(200).json({ totalHeures });
    } catch (error) {
      console.error('Erreur lors de la vérification des emplois:', error);
      response.status(500).send('Erreur lors de la vérification des emplois');
    }
  },
  getEmploisSalle:async (request, response) => {
    try {
      const { idSalle } = request.query;
      if (!idSalle) {
        return response.status(400).json({ error: 'idSalle is required' });
      }
  
      const salle = await Salle.findByPk(idSalle);
      if (!salle) {
        return response.status(404).json({ error: 'salle not found' });
      }
      const reservations = await Reservation.findAll({
        where: {
          salle: { [Op.eq]: salle.nom } // Assuming 'groupe' refers to 'idGroupe'
        }
      });
  
      response.status(200).json(reservations);
    } catch (error) {
      console.error('Erreur lors de la vérification des emplois:', error);
      response.status(500).send('Erreur lors de la vérification des emplois');
    }
  }, 
  getEmploisFormateurCentre:async (request, response) => {
    try {
      const { idFormateur } = request.query;
      if (!idFormateur) {
        return response.status(400).json({ error: 'idFormateur is required' });
      }
  
      const FormateurFind = await Formateur.findByPk(idFormateur);
      if (!FormateurFind) {
        return response.status(404).json({ error: 'Formateur not found' });
      }
      const reservations = await Reservation.findAll({
        where: {
          formateur: { [Op.eq]: FormateurFind?.matricule } // Assuming 'groupe' refers to 'idGroupe'
        }
      });
      console.log(reservations)
  
      response.status(200).json(reservations);
    } catch (error) {
      console.error('Erreur lors de la vérification des emplois:', error);
      response.status(500).send('Erreur lors de la vérification des emplois');
    }
  }, 
};

module.exports = emploisController;


