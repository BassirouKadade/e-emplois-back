const { Reservation, Salle, Groupe, Formateur, Module, GroupeModule } = require('../../config/sequelize');
const { Op } = require('sequelize');

const emploisController = {
  verificationEmplois: async (request, response) => {
    try {
      const { day,idGroupe, start, end } = request.body;

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
      const moduleGroupesFInd=await groupe.getModules();
      const idModuleGroupe=moduleGroupesFInd.map(module=>module.id)
      const formateursGroupe = await groupe?.getFormateurs();
    // formateur de groupe
      const formateursIds= formateursGroupe?  formateursGroupe.map(formateur => formateur.id):[];

      // recuper les formateur de resrvations

      const reservedFormateurMat = reservations 
      ? reservations.map(reservation => reservation.idFormateur).filter(formateur => formateur !== null)
      : [];     
      
      const modulesId = await GroupeModule.findAll({
        where: {
          etat_avancement: {
            [Op.lt]: 100
          },
          GroupeId:{
               [Op.eq]: groupe.id 
          }
        }
      });
      const modulesIdFind = modulesId.map(module => module.ModuleId);

      
      // console.log(reservedFormateurMat)
      const formateursAvecModules = await Formateur.findAll({
        where: {
          [Op.and]: [
            { id: { [Op.notIn]: reservedFormateurMat.length === 0 ? [] : reservedFormateurMat } },
            { id: { [Op.in]: formateursIds } }
          ]
        },
        include: [{
          model: Module,
          as: "modules",
          where: {
            [Op.and]: [
              { id: { [Op.in]: idModuleGroupe } },
              { id: { [Op.in]: modulesIdFind } }
            ]
          },
        }]
      });
            

    
      const formateurs = await Promise.all(formateursAvecModules.map(async formateur => {
        const formateurAvecModules = {
          id: formateur.id,
          nom: formateur.nom,
          prenom: formateur.prenom,
          modules: await Promise.all(formateur.modules.map(async module => {
            const groupeModule = await GroupeModule.findOne({
              where: {
                ModuleId: module.id
              }
            });
            const dr = groupeModule ? groupeModule.dr : null;
            // obtenir l'état d'avancement pour ce module et ce formateur
            return {
              id: module.id,
              description: module.description,
              dureeRest:dr // Ajouter l'état d'avancement au module
            };
          }))
        };
        return formateurAvecModules;
      }));
      
      // console.log(formateursAvecModules);
      
    // console.log("form",formateurs)
      // const reservedSalleIds = reservations.map(reservation => reservation.idSalle);
      
      const reservedSalleIds = reservations 
      ? reservations.map(reservation => reservation.idSalle).filter(salle => salle !== null)
      : [];  
      const salles = await Salle.findAll({
          where: {
              [Op.and]: [
                  { id: { [Op.notIn]: reservedSalleIds } },
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
      if (
        startIndex === undefined || startIndex < 0 ||
        width === undefined || width <= 0 ||
        startEnd === undefined || startEnd < 0 ||
        !idGroupe ||
        !typeSeance ||
        !day ||
        top === undefined
      ) {
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
  
      if (!groupe || !formateur || !module) {
        return response.status(404).json({ error: 'Groupe, formateur ou module non trouvé' });
      }
  
      // Création de la réservation
      await Reservation.create({
        startIndex: startIndex,
        startEnd: startEnd,
        typeReservation: typeSeance,
        idSalle: salle ? salle.id : null,
        idGroupe: groupe.id,
        day: day,
        width: width,
        startTop: top,
        idFormateur: formateur.id,
        idModule: module.id,
        nombeHeureSeance: resultNombre
      });
  
      // Mise à jour de l'état d'avancement du groupe module
      const masseHoraireTotalModule = module.masseHoraire;
      const masseHoraireReserMod = await Reservation.findAll({
        where: { idModule: module.id }
      });
  
      const masseHoraireTotale = masseHoraireReserMod.reduce((total, reservation) => {
        return total + reservation.nombeHeureSeance;
      }, 0);
  
      const avancementPourcent = (masseHoraireTotale / masseHoraireTotalModule) * 100;
  
      let groupeModule = await GroupeModule.findOne({
        where: { GroupeId: groupe.id, ModuleId: module.id }
      });
  
      if (groupeModule) {
        groupeModule.etat_avancement = avancementPourcent;
        groupeModule.dr -=resultNombre;
        await groupeModule.save();
        console.log('d',groupeModule)
        console.log('État d\'avancement mis à jour avec succès.');
      } else {
        console.log('L\'association entre le groupe et le module n\'existe pas.');
      }
  
      // Calcul de l'état d'avancement total du groupe
      const reservationsGroupe = await Reservation.findAll({
        where: { idGroupe: idGroupe }
      });
      const modulesAvecReservations = [...new Set(reservationsGroupe.map(reservation => reservation.idModule))];
  
      const etatsAvancementModules = await Promise.all(modulesAvecReservations.map(async (moduleId) => {
        const groupeModule = await GroupeModule.findOne({ where: { GroupeId:groupe.id, ModuleId: moduleId } });
        if (groupeModule) {
          return { moduleId, etatAvancement: groupeModule.etat_avancement };
        } else {
          return { moduleId, etatAvancement: null };
        }
      }));
  
      const etatFinale = etatsAvancementModules.map(module => module.etatAvancement);
      const etatTotale = etatFinale.reduce((total, etat) => parseInt(total) + parseInt(etat), 0);
      const modules = await groupe.getModules();
      const lengthListe = modules.length*100;  
      const etatTotaleAvancementPourCent = (etatTotale / lengthListe) * 100;
      groupe.etat_avancement = Math.round(etatTotaleAvancementPourCent);
      await groupe.save();
  
      // Récupération de toutes les réservations du groupe avec leurs détails
      const reservations = await Reservation.findAll({
        where: { idGroupe: groupe.id },
        include: [
          { model: Salle, as: "salle", attributes: ['nom'] },
          { model: Formateur, as: "formateur", attributes: ['matricule', 'nom', 'prenom'] },
          { model: Module, as: "module", attributes: ['codeModule', 'description'] },
          { model: Groupe, as: "groupe", attributes: ['code'] }
        ]
      });
  
      response.status(200).json(reservations);
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la création de l\'emploi du temps');
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
          idGroupe: { [Op.eq]: groupe.id } // Assuming 'groupe' refers to 'idGroupe'

        },
          include: [
              { model: Salle, as:"salle", attributes: ['nom'] },
              { model: Formateur,as:"formateur", attributes: ['matricule', 'nom', 'prenom'] },
              { model: Module,as:"module", attributes: ['codeModule','description'] },
              { model: Groupe, as:"groupe",attributes: ['code'] }
          ]
      });
      response.status(200).json(reservations);
    } catch (error) {
      console.error('Erreur lors de la vérification des emplois getEmploi:', error);
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
          idGroupe: { [Op.eq]: groupe.id } // Assuming 'groupe' refers to 'code' field in the Reservation model
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
          idSalle: { [Op.eq]: salle?.id } // Assuming 'groupe' refers to 'idGroupe'
        },
        include: [
          { model: Formateur,as:"formateur", attributes: ['matricule', 'nom', 'prenom'] },
          { model: Module,as:"module", attributes: ['codeModule','description'] },
          { model: Groupe, as:"groupe",attributes: ['code'] }
      ]
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
          idFormateur: { [Op.eq]: FormateurFind?.id } // Assuming 'groupe' refers to 'idGroupe'
        },
        include: [
          { model: Formateur,as:"formateur", attributes: ['matricule', 'nom', 'prenom'] },
          { model: Module,as:"module", attributes: ['codeModule','description'] },
          { model: Groupe, as:"groupe",attributes: ['code'] },
          { model: Salle, as:"salle", attributes: ['nom'] },
      ]
      });
  
      response.status(200).json(reservations);
    } catch (error) {
      console.error('Erreur lors de la vérification des emplois:', error);
      response.status(500).send('Erreur lors de la vérification des emplois');
    }
  }, 
  deleteReservationSeance: async (request, response) => {
    try {
      const { idReservation } = request.query;
  
      // Check if the idReservation parameter is provided
      if (!idReservation) {
        return response.status(400).json({ error: 'idReservation is required' });
      }
  
      // Find the reservation by primary key
      const reservationFind = await Reservation.findByPk(idReservation);
  
      // Check if the reservation exists
      if (!reservationFind) {
        return response.status(404).json({ error: 'Reservation not found' });
      }
  
      // Delete the reservation
      const reservationDeleted = await reservationFind.destroy();
      const salleNom = reservationDeleted?.idSalle;
      const salleNbrHeures = reservationDeleted?.nombeHeureSeance;
  
      // If the reservation has an associated room (salle)
      if (salleNom) {
        // Find the room by name
        const salleFind = await Salle.findOne({
          where: {
            id: {
              [Op.eq]: salleNom
            }
          }
        });
  
        // If the room is found, update its remaining hours
        if (salleFind) {
          salleFind.MREST += salleNbrHeures;
          await salleFind.save();
        }
      }


      
      const groupe = await Groupe.findByPk(reservationDeleted.idGroupe);
      const module = await Module.findByPk(reservationDeleted.idModule);
      
      const masseHoraireTotalModule = module.masseHoraire;
      const masseHoraireReserMod = await Reservation.findAll({
        where: {
          idModule: module.id
        }
      });
  
      const masseHoraireTotale = masseHoraireReserMod.reduce((total, reservation) => {
        return total + reservation.nombeHeureSeance;
      }, 0);
  
      const avancementPourcent = (masseHoraireTotale / masseHoraireTotalModule) * 100;
  
      const groupeModule = await GroupeModule.findOne({
        where: {
          GroupeId: groupe.id,
          ModuleId: module.id,
        },
      });
  
      if (groupeModule) {
        // Mettre à jour l'état d'avancement
        groupeModule.etat_avancement = avancementPourcent;
        groupeModule.dr += reservationDeleted.nombeHeureSeance;
        await groupeModule.save();
      } 
       // Calcul de l'état d'avancement total du groupe
       const reservationsGroupe = await Reservation.findAll({
        where: { idGroupe: reservationDeleted.idGroupe }
      });
      const modulesAvecReservations = [...new Set(reservationsGroupe.map(reservation => reservation.idModule))];
  
      const etatsAvancementModules = await Promise.all(modulesAvecReservations.map(async (moduleId) => {
        const groupeModule = await GroupeModule.findOne({ where: {GroupeId: reservationDeleted.idGroupe, ModuleId: moduleId } });
        if (groupeModule) {
          return { moduleId, etatAvancement: groupeModule.etat_avancement };
        } else {
          return { moduleId, etatAvancement: null };
        }
      }));
  
      const etatFinale = etatsAvancementModules.map(module => module.etatAvancement);
      const etatTotale = etatFinale.reduce((total, etat) => parseInt(total) + parseInt(etat), 0);
      const modules = await groupe.getModules();
      const lengthListe = modules.length*100;  
      const etatTotaleAvancementPourCent = (etatTotale / lengthListe) * 100;
      groupe.etat_avancement = Math.round(etatTotaleAvancementPourCent);
      await groupe.save();
      // Respond with a success message
      response.status(200).json({ message: 'Reservation deleted successfully' });
    } catch (error) {
      // Log the error and respond with a server error status
      console.error('Error deleting reservation:', error);
      response.status(500).json({ error: 'An error occurred while deleting the reservation' });
    }
},
getTotalGroupeSalleFormateur:async (request, response) => {
  try {
   
    const FormateurFindAll= await Formateur.findAll();
    const GrpupeFindAll= await Groupe.findAll();
    const SalleFindAll= await Salle.findAll();

    response.status(200).json({
          formateurs:FormateurFindAll.length?FormateurFindAll.length:0,
          salles:SalleFindAll.length?SalleFindAll.length:0,
          groupes:GrpupeFindAll.length?GrpupeFindAll.length:0
    });
  } catch (error) {
    console.error('Erreur lors de la vérification des emplois:', error);
    response.status(500).send('Erreur lors de la vérification des emplois');
  }
},
getEmploisDay:async (request, response) => {
  try {
    const { day } = request.query;
    if (!day) {
      return response.status(400).json({ error: 'Le paramètre day est requis' });
    }

    const emploisDayFind = await Reservation.findAll({
      where: {
        day: {
          [Op.eq]: day
        }
      },
      include: [
        { model: Formateur,as:"formateur", attributes: ['matricule', 'nom', 'prenom'] },
        { model: Module,as:"module", attributes: ['codeModule','description'] },
        { model: Groupe, as:"groupe",attributes: ['code'] },
        { model: Salle, as:"salle", attributes: ['nom'] },
    ]
    });

    response.status(200).json(emploisDayFind);
  } catch (error) {
    console.error('Erreur lors de la vérification des emplois:', error);
    response.status(500).send('Erreur lors de la vérification des emplois');
  }
}
}
module.exports = emploisController;


