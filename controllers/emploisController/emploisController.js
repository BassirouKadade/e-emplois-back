const { Reservation,User, Etablissement,Salle, Groupe, Formateur, Module, GroupeModule, Filiere } = require('../../config/sequelize');
const { Op } = require('sequelize');

const emploisController = {
  verificationEmplois: async (request, response) => {
    try {
      [idEtablissement]=request.user.idEtablissement

      const { day,idGroupe, start, end } = request.body;

      if (start<0 || !day || end<0) {
        return response.status(400).json({ error: 'Start, end dates, and day are required' });
      }
      const reservations = await Reservation.findAll({
        where: {
          id_etablissement:idEtablissement,
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
            {
              id_etablissement:idEtablissement
            },
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
                ModuleId: module.id,
                GroupeId: groupe.id

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
                {
                  id_etablissement:idEtablissement
                },
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
    console.log('ffff',request.user)
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
      [idEtablissement]=request.user.idEtablissement

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
      const masseHoraireTotalModule = module.masseHoraire;

      if (!groupe || !formateur || !module) {
        return response.status(404).json({ error: 'Groupe, formateur ou module non trouvé' });
      }

      // ************************************
      const masseHoraireReserModPre = await Reservation.findAll({
        where: { id_etablissement:idEtablissement, idModule: module.id,idGroupe: groupe.id }
      });
  
      const masseHoraireTotalePre = masseHoraireReserModPre.reduce((total, reservation) => {
        return total + reservation.nombeHeureSeance;
      }, 0);
      const avancementPourcentPRE = (masseHoraireTotalePre / masseHoraireTotalModule) * 100;

      
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
        nombeHeureSeance: resultNombre,
        id_etablissement:idEtablissement
      });
  
      // Mise à jour de l'état d'avancement du groupe module
      const masseHoraireReserMod = await Reservation.findAll({
        where: {id_etablissement:idEtablissement, idModule: module.id,idGroupe: groupe.id }
      });
  
      const masseHoraireTotale = masseHoraireReserMod.reduce((total, reservation) => {
        return total + reservation.nombeHeureSeance;
      }, 0);
  
      const avancementPourcent = (masseHoraireTotale / masseHoraireTotalModule) * 100;
  
      let groupeModule = await GroupeModule.findOne({
        where: { GroupeId: groupe.id, ModuleId: module.id }
      });
  
      let pourcentagePrecedante=0;
     if(groupeModule.etat_avancement-avancementPourcentPRE <=0){
      pourcentagePrecedante=0
     }else{
      pourcentagePrecedante=groupeModule.etat_avancement-avancementPourcentPRE
     };

      if (groupeModule) {
        groupeModule.etat_avancement = avancementPourcent+pourcentagePrecedante;
        groupeModule.dr -=resultNombre;
        await groupeModule.save();
        console.log('État d\'avancement mis à jour avec succès.');
      } else {
        console.log('L\'association entre le groupe et le module n\'existe pas.');
      }
  
      // Calcul de l'état d'avancement total du groupe

      const modulesFind=await groupe.getModules();
      const modulesAvecReservations=modulesFind.map(module=>module.id)

      // const reservationsGroupe = await Reservation.findAll({
      //   where: { idGroupe: idGroupe }
      // });
      // const modulesAvecReservations = [...new Set(reservationsGroupe.map(reservation => reservation.idModule))];
  
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
      const lengthListe = modulesFind.length*100;  
      const etatTotaleAvancementPourCent = (etatTotale / lengthListe) * 100;
      groupe.etat_avancement = Math.round(etatTotaleAvancementPourCent);
      await groupe.save();
  
      // Récupération de toutes les réservations du groupe avec leurs détails
      const reservations = await Reservation.findAll({
        where: { 
         id_etablissement:idEtablissement, idGroupe: groupe.id },
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
      [idEtablissement]=request.user.idEtablissement

  
      const groupe = await Groupe.findByPk(idGroupe);
      if (!groupe) {
        return response.status(404).json({ error: 'Groupe not found' });
      }
      const reservations = await Reservation.findAll({
        where: {
          id_etablissement:idEtablissement
           ,
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
      [idEtablissement]=request.user.idEtablissement

      const groupe = await Groupe.findByPk(idGroupe);
      if (!groupe) {
        return response.status(404).json({ error: 'Groupe not found' });
      }
  
      const reservations = await Reservation.findAll({
        where: {
          id_etablissement:idEtablissement,
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
      [idEtablissement]=request.user.idEtablissement

      const salle = await Salle.findByPk(idSalle);
      if (!salle) {
        return response.status(404).json({ error: 'salle not found' });
      }
      const reservations = await Reservation.findAll({
        where: {
          id_etablissement:idEtablissement,
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
      [idEtablissement]=request.user.idEtablissement

  
      const FormateurFind = await Formateur.findByPk(idFormateur);
      if (!FormateurFind) {
        return response.status(404).json({ error: 'Formateur not found' });
      }
      const reservations = await Reservation.findAll({
        where: {
          id_etablissement:idEtablissement,
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
      [idEtablissement]=request.user.idEtablissement

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
          id_etablissement:idEtablissement,
          idModule: module.id,
          idGroupe: groupe.id
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

        groupeModule.etat_avancement = avancementPourcent;
        groupeModule.dr += reservationDeleted.nombeHeureSeance;
        await groupeModule.save();

        const dureeRest=module.masseHoraire-groupeModule.dr;
        const taux=(dureeRest/module.masseHoraire)*100;
        groupeModule.etat_avancement = taux;
        await groupeModule.save();
      } 





       // Calcul de l'état d'avancement total du groupe
      //  const reservationsGroupe = await Reservation.findAll({
      //   where: { idGroupe: reservationDeleted.idGroupe }
      // });

     const modulesFind=await groupe.getModules();
     const modulesAvecReservations=modulesFind.map(module=>module.id)
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
      const lengthListe = modulesFind.length*100;  
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
getTotalGroupeSalleFormateur: async (request, response) => {
  try {
    const [idEtablissement] = request.user.idEtablissement;

    // Récupération du nombre total de formateurs, groupes et salles pour l'établissement spécifié
    const totalFormateurs = await Formateur.count({
      where: {
        id_etablissement: idEtablissement
      }
    });

    const totalGroupes = await Groupe.count({
      where: {
        id_etablissement: idEtablissement
      }
    });

    const totalSalles = await Salle.count({
      where: {
        id_etablissement: idEtablissement
      }
    });

    // Calcul de l'état global des groupes (moyenne des états des groupes)
    // Supposons que chaque groupe a une propriété `etat_avancement`
    const groupesAvecEtat = await Groupe.findAll({
      where: {
        id_etablissement: idEtablissement
      }
    });
   
    const user=await User.findByPk(request.user.id)
    const etablissement=await Etablissement.findOne({
        where:{
            id_user:user.id
        }
    })

    const etatTotalGroupes = groupesAvecEtat.reduce((total, groupe) => total + parseFloat(groupe.etat_avancement), 0);
    const etatGlobal = Math.round(totalGroupes > 0 ? etatTotalGroupes / totalGroupes : 0);

    // Retourner les résultats sous forme de JSON
    response.status(200).json({
      formateurs: totalFormateurs,
      salles: totalSalles,
      groupes: totalGroupes,
      etat: etatGlobal,
      user:user,
      etablissement:etablissement
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    response.status(500).send('Erreur lors de la récupération des données');
  }
},

getEmploisDay:async (request, response) => {
  try {
    const { day } = request.query;
    if (!day) {
      return response.status(400).json({ error: 'Le paramètre day est requis' });
    }

    const [idEtablissement] = request.user.idEtablissement;

    const emploisDayFind = await Reservation.findAll({
      where: {
        id_etablissement:idEtablissement,
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
},
deleteReservationSeanceupdate: async (request, response) => {
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

       
    // const groupe = await Groupe.findByPk(reservationDeleted.idGroupe);
    // const module = await Module.findByPk(reservationDeleted.idModule);
    
    // const masseHoraireTotalModule = module.masseHoraire;

    // const avancementPourcentPRE = (salleNbrHeures / masseHoraireTotalModule) * 100;

    // console.log('data',avancementPourcentPRE)
    // const masseHoraireReserMod = await Reservation.findAll({
    //   where: {
    //     idModule: module.id,
    //     idGroupe: groupe.id
    //   }
    // });

    // const masseHoraireTotale = masseHoraireReserMod.reduce((total, reservation) => {
    //   return total + reservation.nombeHeureSeance;
    // }, 0);

    // const avancementPourcent = ((masseHoraireTotale)/ masseHoraireTotalModule) * 100;

    // const groupeModule = await GroupeModule.findOne({
    //   where: {
    //     GroupeId: groupe.id,
    //     ModuleId: module.id,
    //   },
    // });

    // console.log('data2',groupeModule.etat_avancement)


    // if (groupeModule) {
    //   // Mettre à jour l'état d'avancement
    //   groupeModule.etat_avancement = avancementPourcentPRE;
    //   await groupeModule.save();
    // } 

    response.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    // Log the error and respond with a server error status
    console.error('Error deleting reservation:', error);
    response.status(500).json({ error: 'An error occurred while deleting the reservation' });
  }
},
deleteReservationSeanceupdateAndDelete :async (request, response) => {
  try {
    const { idReservation } = request.query;


    const [idEtablissement] = request.user.idEtablissement;


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

    
    // verification de la disponiblite de masse horaire de module
    // ************************
    // ******************

   const masseHoraireReservatioTorevok=reservationFind.nombeHeureSeance

   let groupeModuleToUpdate = await GroupeModule.findOne({
    where: { 
      GroupeId: reservationFind.idGroupe, 
      ModuleId: reservationFind.idModule 
    }
  });
  
  // Vérification
  if (groupeModuleToUpdate.dr - masseHoraireReservatioTorevok   < 0) {
    return response.status(400).json({ message: "La durée de module est insuffisante" });
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

    // Calculate previous module progress
    const masseHoraireReserModPre = await Reservation.findAll({
      where: {id_etablissement:idEtablissement, idModule: module.id, idGroupe: groupe.id }
    });

    const masseHoraireTotalePre = masseHoraireReserModPre.reduce((total, reservation) => {
      return total + reservation.nombeHeureSeance;
    }, 0);
    const avancementPourcentPRE = (masseHoraireTotalePre / masseHoraireTotalModule) * 100;

    // Recreate the reservation
    const rev=  await Reservation.create({
      startIndex: reservationDeleted.startIndex,
      startEnd: reservationDeleted.startEnd,
      typeReservation: reservationDeleted.typeReservation,
      idSalle: reservationDeleted.idSalle,
      idGroupe: reservationDeleted.idGroupe,
      day: reservationDeleted.day,
      width: reservationDeleted.width,
      startTop: reservationDeleted.startTop,
      idFormateur: reservationDeleted.idFormateur,
      idModule: reservationDeleted.idModule,
      nombeHeureSeance: reservationDeleted.nombeHeureSeance,
      id_etablissement:idEtablissement,
    });


    if (rev.idSalle) {
      // Find the room by name
      const salleFind = await Salle.findOne({
        where: {
          id: {
            [Op.eq]: rev.idSalle
          }
        }
      });

      // If the room is found, update its remaining hours
      if (salleFind) {
        salleFind.MREST -= rev.nombeHeureSeance;
        await salleFind.save();
      }
    }
    // Update module progress
    const masseHoraireReserMod = await Reservation.findAll({
      where: { id_etablissement:idEtablissement,idModule: module.id, idGroupe: groupe.id }
    });

    const masseHoraireTotale = masseHoraireReserMod.reduce((total, reservation) => {
      return total + reservation.nombeHeureSeance;
    }, 0);

    const avancementPourcent = (masseHoraireTotale / masseHoraireTotalModule) * 100;

    let groupeModule = await GroupeModule.findOne({
      where: { GroupeId: groupe.id, ModuleId: module.id }
    });

    let pourcentagePrecedante = groupeModule.etat_avancement - avancementPourcentPRE <= 0 ? 0 : groupeModule.etat_avancement - avancementPourcentPRE;

    if (groupeModule) {
      groupeModule.etat_avancement = avancementPourcent + pourcentagePrecedante;
      groupeModule.dr -=reservationDeleted.nombeHeureSeance;
      await groupeModule.save();
      console.log('État d\'avancement mis à jour avec succès.');
    } else {
      console.log('L\'association entre le groupe et le module n\'existe pas.');
    }
 
    // Calculate total group progress
    const modulesFind = await groupe.getModules();
    const modulesAvecReservations = modulesFind.map(module => module.id);

    const etatsAvancementModules = await Promise.all(modulesAvecReservations.map(async (moduleId) => {
      const groupeModule = await GroupeModule.findOne({ where: { GroupeId: groupe.id, ModuleId: moduleId } });
      if (groupeModule) {
        return { moduleId, etatAvancement: groupeModule.etat_avancement };
      } else {
        return { moduleId, etatAvancement: null };
      }
    }));

    const etatFinale = etatsAvancementModules.map(module => module.etatAvancement);
    const etatTotale = etatFinale.reduce((total, etat) => total + parseInt(etat), 0);
    const lengthListe = modulesFind.length * 100;
    const etatTotaleAvancementPourCent = (etatTotale / lengthListe) * 100;
    groupe.etat_avancement = Math.round(etatTotaleAvancementPourCent);
    await groupe.save();

    // Fetch all reservations for the group with their details
   
    response.status(200).json({message:"la resrvation est recree"});
  } catch (error) {
    // Log the error and respond with a server error status
    console.error('Error deleting reservation:', error);
    response.status(500).json({ error: 'An error occurred while deleting the reservation' });
  }
},

// ***********************************
// Mise a jour de formateur pour un ereservation

// ***************************************************
reservationFormateurUpdateSeance:async (request, response) => {
  try {
    const [idEtablissement] = request.user.idEtablissement;

    const {idReservation} =request.query
    if (!idReservation) {
      return response.status(400).json({ error: 'reservation required' });
    }

    const {day,idGroupe, startIndex,startEnd}=await Reservation.findByPk(idReservation)

    const reservations = await Reservation.findAll({
      where: {
        id_etablissement:idEtablissement,
        day: { [Op.eq]: day },
        [Op.or]: [
          {
            startIndex: { [Op.lte]: startIndex },
            startEnd: { [Op.gt]: startIndex }
          },
          {
            startIndex: { [Op.lt]: startEnd },
            startEnd: { [Op.gte]: startEnd }
          },
          {
            startIndex: { [Op.gte]: startIndex },
            startEnd: { [Op.lte]: startEnd }
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
          {
            id_etablissement:idEtablissement
          },
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
              ModuleId: module.id,
              GroupeId: groupe.id

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
    
    
    response.status(200).json({formateurs});
  } catch (error) {
    console.error('Erreur lors de la vérification des emplois:', error);
    response.status(500).send('Erreur lors de la vérification des emplois');
  }
},
reservationFormateurUpdateSeanceValid: async (request, response) => {
  try {
    const { idFormateur, idModule, idReservation } = request.body;
    const [idEtablissement] = request.user.idEtablissement;

    // Vérification des paramètres requis
    if (!idFormateur || !idModule || !idReservation) {
      return response.status(400).json({ error: 'Paramètres requis manquants' });
    }

    // Trouver la réservation par ID
    const reservationFound = await Reservation.findByPk(idReservation);
    if (!reservationFound) {
      return response.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Mise à jour de la réservation
    reservationFound.idFormateur = idFormateur;
    reservationFound.idModule = idModule;
    await reservationFound.save();
    
    // Récupération de toutes les réservations du groupe avec leurs détails
    const reservations = await Reservation.findAll({
      where: {id_etablissement:idEtablissement , idGroupe: reservationFound.idGroupe },
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
    response.status(500).send('Erreur lors de la mise à jour de la réservation');
  }
},
reservationSalleUpdateSeance:async (request, response) => {
  try {
    const [idEtablissement] = request.user.idEtablissement;

    const {idReservation} =request.query
    if (!idReservation) {
      return response.status(400).json({ error: 'reservation required' });
    }

    const {day,nombeHeureSeance,  startIndex,startEnd}=await Reservation.findByPk(idReservation)

    const reservations = await Reservation.findAll({
      where: {
        id_etablissement:idEtablissement,
        day: { [Op.eq]: day },
        [Op.or]: [
          {
            startIndex: { [Op.lte]: startIndex },
            startEnd: { [Op.gt]: startIndex }
          },
          {
            startIndex: { [Op.lt]: startEnd },
            startEnd: { [Op.gte]: startEnd }
          },
          {
            startIndex: { [Op.gte]: startIndex },
            startEnd: { [Op.lte]: startEnd }
          }
        ]
      }
    });

   
    const reservedSalleIds = reservations 
    ? reservations.map(reservation => reservation.idSalle).filter(salle => salle !== null)
    : [];  
    const salles = await Salle.findAll({
        where: {
            [Op.and]: [
              { id_etablissement:idEtablissement},
                { id: { [Op.notIn]: reservedSalleIds } },
                { MREST: { [Op.gt]: 0 } }
            ]
        }
    });
    

    response.status(200).json({salles,nombeHeureSeance});
  } catch (error) {
    console.error('Erreur lors de la vérification des emplois:', error);
    response.status(500).send('Erreur lors de la vérification des emplois');
  }
},
reservationSalleUpdateSeanceValid: async (request, response) => {
  try {
    const { typeFormation, idSalle, idReservation } = request.body;
    const [idEtablissement] = request.user.idEtablissement;

    // Vérification des paramètres requis
    if (!idSalle && !typeFormation) {
      return response.status(400).json({ error: 'Paramètres requis manquants' });
    }

    // Trouver la réservation par ID
    const reservationFound = await Reservation.findByPk(idReservation);
    if (!reservationFound) {
      return response.status(404).json({ error: 'Réservation non trouvée' });
    }

    if(typeFormation === "FAD"){
      const salleReservation=await Salle.findByPk(reservationFound.idSalle)
      if(salleReservation){
        salleReservation.MREST+=reservationFound.nombeHeureSeance;
        await  salleReservation.save() 
      }

      // Mise à jour de la réservation
      reservationFound.idSalle = null;
      reservationFound.typeReservation = "FAD";
      
      await reservationFound.save();
      
    }
    else{
      const salleReservation=await Salle.findByPk(reservationFound.idSalle)
      if(salleReservation){
        salleReservation.MREST+=reservationFound.nombeHeureSeance;
        await  salleReservation.save() 
      }
  
      const salleTopUpdate=await Salle.findByPk(idSalle)
      salleTopUpdate.MREST-=reservationFound.nombeHeureSeance;
      await  salleTopUpdate.save()
  
      // Mise à jour de la réservation
      reservationFound.idSalle = idSalle;
      reservationFound.typeReservation = "FP";
      
      await reservationFound.save();
      
    }
   
    // Récupération de toutes les réservations du groupe avec leurs détails
    const reservations = await Reservation.findAll({
      where: { id_etablissement:idEtablissement,idGroupe: reservationFound.idGroupe },
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
    response.status(500).send('Erreur lors de la mise à jour de la réservation');
  }
},

// ******************************************************
//    Gestion des emplois prime pour le PDF

getEmploisPrime: async (request, response) => {
  try {
    const { idGroupe } = request.query;
    if (!idGroupe) {
      return response.status(400).json({ error: 'idGroupe is required' });
    }
    const [idEtablissement] = request.user.idEtablissement;

    const groupe = await Groupe.findByPk(idGroupe, {
      include: [{
        model: Filiere,
        as: 'filiere'
      }]
    });
    if (!groupe) {
      return response.status(404).json({ error: 'Groupe not found' });
    }

    const reservations = await Reservation.findAll({
      where: {
        id_etablissement:idEtablissement,
        idGroupe: { [Op.eq]: groupe.id } // Assuming 'groupe' refers to 'idGroupe'

      },
        include: [
            { model: Salle, as:"salle", attributes: ['nom'] },
            { model: Formateur,as:"formateur", attributes: ['matricule', 'nom', 'prenom'] },
            { model: Module,as:"module", attributes: ['codeModule','description'] },
            { model: Groupe, as:"groupe",attributes: ['code'] }
        ]
    });

    const reservationMasse=reservations.map(reservation=> reservation.nombeHeureSeance)
    const totalHeures = reservationMasse.reduce((total, reservation) => {
      return total + reservation;
    }, 0);

    const dataHeader = {
      filiere: groupe?.filiere.code,
      niveau: groupe?.filiere.niveau,
      groupe: groupe?.code,
      masseHoraire: totalHeures
    };

    // Vous pouvez également inclure d'autres informations dans la réponse si nécessaire
    response.status(200).json({ dataHeader, reservations });
  } catch (error) {
    console.error('Erreur lors de la vérification des emplois getEmploi:', error);
    response.status(500).send('Erreur lors de la vérification des emplois');
  }
},
getEmploisSallePrime:async (request, response) => {
  try {
    const [idEtablissement] = request.user.idEtablissement;

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
        id_etablissement:idEtablissement,
        idSalle: { [Op.eq]: salle?.id } // Assuming 'groupe' refers to 'idGroupe'
      },
      include: [
        { model: Formateur,as:"formateur", attributes: ['matricule', 'nom', 'prenom'] },
        { model: Module,as:"module", attributes: ['codeModule','description'] },
        { model: Groupe, as:"groupe",attributes: ['code'] },
        { model: Salle, as:"salle", attributes: ['nom'] },
    ]
    });
    const reservationMasse=reservations.map(reservation=> reservation.nombeHeureSeance)
    const totalHeures = reservationMasse.reduce((total, reservation) => {
      return total + reservation;
    }, 0);

    const dataHeader = {
      salle: salle?.nom,
      capacite: salle?.capacite,
      masseHoraireSalle:salle?.MH,
      masseHoraireOcuppe: totalHeures,
    }

    response.status(200).json({ dataHeader, reservations });
  } catch (error) {
    console.error('Erreur lors de la vérification des emplois:', error);
    response.status(500).send('Erreur lors de la vérification des emplois');
  }
}, 
getEmploisFormateurCentrePrime:async (request, response) => {
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

    const dataHeader = {
      matricule: FormateurFind?.matricule,
      nom: FormateurFind?.nom,
      prenom: FormateurFind?.prenom,
    }

    response.status(200).json({ dataHeader, reservations });
  } catch (error) {
    console.error('Erreur lors de la vérification des emplois:', error);
    response.status(500).send('Erreur lors de la vérification des emplois');
  }
},
getEmploisAllOFDatabase: async (request, response) => {
  try {
     [idEtablissement] = request.user.idEtablissement;

    // Recherche de toutes les réservations avec toutes les associations et tous les attributs
    const reservations = await Reservation.findAll({
      where: {
        id_etablissement: idEtablissement
      },
      include: [
        {
          model: Formateur,
          as: "formateur"
        },
        {
          model: Module,
          as: "module"
        },
        {
          model: Groupe,
          as: "groupe",
          include: [
            {
              model: Filiere,
              as: "filiere"
            }
          ]
        },
        {
          model: Salle,
          as: "salle"
        }
      ]
    });
   console.log('ddd',reservations)
    // Réponse en cas de succès
    response.status(200).json(reservations);
  } catch (error) {
    // Log de l'erreur pour le débogage
    console.error('Erreur lors de la récupération des emplois:', error);
    // Réponse en cas d'erreur
    response.status(500).send('Erreur lors de la récupération des emplois');
  }
},
getInfoEtablissement: async (request, response) => {
  try {
    [idEtablissement] = request.user.idEtablissement;
     
      const etablissementFind=await Etablissement.findByPk(idEtablissement)
          response.status(200).json(etablissementFind);
  } catch (error) {
    console.error(error);
   
    response.status(500).send('Erreur lors de la récupération des groupes');
  }
},
reinitialisationEspaceEmploisFormateur : async (request, response) => {
  try {
    const idUser = request.user.id;

    // Fetching the establishment associated with the user
    const etablissement = await Etablissement.findOne({
      where: {
        id_user: idUser
      }
    });

    if (!etablissement) {
      return response.status(404).send('Etablissement non trouvé pour cet utilisateur.');
    }

    // Fetching all rooms (salles) associated with the establishment
    const salles = await Salle.findAll({
      where: {
        id_etablissement: etablissement.id
      }
    });

    // Update MREST of each salle to match MH
    await Promise.all(salles.map(async (salle) => {
      salle.MREST = salle.MH;
      await salle.save(); // Save each salle after updating MREST
    }));

    // Fetching all reservations (reservations) associated with the establishment
    const reservations = await Reservation.findAll({
      where: {
        id_etablissement: etablissement.id
      }
    });

    // Delete all reservations
    await Promise.all(reservations.map(async (reservation) => {
      await reservation.destroy(); // Delete each reservation
    }));

    // Fetching all groups (groupes) associated with the establishment
    const groupes = await Groupe.findAll({
      where: {
        id_etablissement: etablissement.id
      }
    });

    // Update etat_avancement of each groupe to 0 and perform additional operations with modules
    await Promise.all(groupes.map(async (groupe) => {
      // Update etat_avancement of groupe to 0
      groupe.etat_avancement = 0;
      await groupe.save(); // Save each groupe after updating etat_avancement

      // Fetch all modules associated with the establishment
      const modules = await Module.findAll({
        where: {
          id_etablissement: etablissement.id
        }
      });

      // Update GroupeModule associations for each module
      await Promise.all(modules.map(async (module) => {
        // Find or create GroupeModule association
        let groupeModule = await GroupeModule.findOne({
          where: {
            GroupeId: groupe.id,
            ModuleId: module.id
          }
        });

          // Update existing GroupeModule
          groupeModule.etat_avancement = 0;
          groupeModule.dr = module.masseHoraire; // Update dr if needed
          await groupeModule.save();
  
      }));
    }));

    // Respond with success message
    response.status(200).json({ message: 'Opérations effectuées avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la vérification des emplois :', error);
    response.status(500).send('Erreur lors de la vérification des emplois');
  }
}

}
module.exports = emploisController;


