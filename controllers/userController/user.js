const { User, Etablissement, Role } = require('../../config/sequelize');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const {option}=require('../../mail/options')
const typemessage=require('../../mail/typemessages')
const transporter=require('../../mail/confignodemailer')
const userController = {

  ajouter: async (request, response) => {
    try {
      const { nom, image, prenom, password, email } = request.body;
  

      
      const errorServer = {};
  
      if (!nom || !prenom || !email || !password) {
        errorServer.error = 'Tous les champs sont obligatoires';
        return response.status(400).json(errorServer);
      }
  
      const userExistEmail = await User.findOne({ where: { email } });
  
      if (userExistEmail) {
        errorServer.existEmail = "directeur avec cet email existe déjà";
        return response.status(400).json(errorServer);
      }
  
      // Générer un sel
      const salt = await bcrypt.genSalt(10);
  
      // Hacher le mot de passe avec le sel généré
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Créer l'utilisateur avec le mot de passe haché
      const user = { nom, prenom, password: hashedPassword, email };
      await User.create(user);
      await transporter.sendMail(option(email,"Confirmation de création de compte sur E-Emplois", typemessage.creerCompte(password,email)));

      response.status(201).json({ success: "Utilisateur ajouté avec succès" });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de l\'ajout de l\'utilisateur');
    }
  },
  // Liste des utilisateurs paginée
  liste: async (request, response) => {
    try {
      const page = parseInt(request.query.page) || 1;
      const limit = 6; // Nombre d'éléments par page
      const offset = (page - 1) * limit; // Calcul de l'offset
      const { count, rows } = await User.findAndCountAll({
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
      response.status(500).send('Erreur lors de la récupération des utilisateurs');
    }
  },

  // Supprimer un utilisateur
  supprimer: async (request, response) => {
    try {
      const userIds = request.params.ids.split('-');
      await User.destroy({
          where: {
              id: userIds
          }
      });
      response.status(200).json({ message: 'Utilisateurs supprimés avec succès' });
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la suppression des utilisateurs');
    }
  },
update: async (request, response) => {
    try {
        const { id, nom, prenom, password, email } = request.body;

        const errorServer = {};
        const saltRounds = 10;

        if (!nom || !prenom || !email || !password) {
            errorServer.error = 'Tous les champs sont obligatoires';
            return response.status(400).json(errorServer);
        }

        const userExistEmail = await User.findOne({ where: { email } });
        if (userExistEmail && userExistEmail.id !== id) {
            errorServer.existEmail = "Un utilisateur avec cet email existe déjà";
            return response.status(400).json(errorServer);
        }

        const user = await User.findOne({ where: { id } });
        if (!user) {
            return response.status(404).json({ error: "Utilisateur non trouvé" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await user.update({ nom, prenom, password: hashedPassword, email });
        response.status(200).json({ success: "Utilisateur mis à jour avec succès" });
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur lors de la mise à jour de l\'utilisateur');
    }
},

  // Recherche des utilisateurs par nom, prénom, matricule, ou métier
  searchNext: async (request, response) => {
    try {
      const { search, page } = request.query;
      let pageNumber = 1; // Par défaut, définir la page sur 1

      if (page && !isNaN(parseInt(page))) {
        pageNumber = parseInt(page);
      }

      if (!search) {
        return response.status(400).json({ message: 'Le terme de recherche est requis' });
      }

      const searchOptions = {
        [Op.or]: [
          { nom: { [Op.like]: `%${search}%` } },
          { prenom: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ],
      };

      const limit = 6;
      const offset = (pageNumber - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        limit,
        offset,
        where: searchOptions,
      });

      const totalPages = Math.ceil(count / limit);
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

  // Récupérer tous les utilisateurs
  allUsers: async (request, response) => {
    try {
       const userList = await User.findAll()
      response.status(200).json(userList);
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
  },

  // Ajouter un groupe à un utilisateur
  addGroupUser: async (request, response) => {
    try {
        let { idGroup, idUser } = request.body;

        const errorServer = {};

        if (!idGroup || !idUser) {
            errorServer.error = 'Tous les champs sont obligatoires';
            return response.status(400).json(errorServer);
        }

        const userExists = await User.findByPk(idUser);

        if (!userExists) {
            errorServer.notExistUser = "L'utilisateur n'existe pas";
            return response.status(400).json(errorServer);
        }
        const groupExists = await Group.findByPk(idGroup);

        if (!groupExists) {
            errorServer.notExistGroup = "Le groupe n'existe pas";
            return response.status(400).json(errorServer);
        }

        await userExists.addGroup(groupExists);

        response.status(201).json({ success: "Groupe d'utilisateur ajouté avec succès" });
    } catch (error) {
        console.error(error);
        response.status(500).send("Erreur lors de l'ajout du groupe");
    }
  },

  // Récupérer les groupes associés à un utilisateur
  getUserGroups: async (request, response) => {
    try {
      const { id } = request.query;
      const user = await User.findByPk(id);
      
      if (!user) {
        return response.status(404).json({ error: "Utilisateur non trouvé" });
      }
      
      const groups = await user.getGroups();
      response.status(200).json(groups);
    } catch (error) {
      console.error(error);
     
      response.status(500).send('Erreur lors de la récupération des groupes');
    }
  },
  
  // Récupérer les groupes non inclus pour un utilisateur
  getGroupsNotIncludedUser: async (request, response) => {
    try {
        const { idUser } = request.query;
        const userExist = await User.findByPk(idUser);
        
        if (!userExist) {
            return response.status(404).json({ error: "Utilisateur non trouvé" });
        }
        
        const userGroups = await userExist.getGroups();
        const groupIdList = userGroups.map((group) => group.id);
  
        const groups = await Group.findAll({
            where: {
                id: {
                    [Op.notIn]: groupIdList
                }
            }
        });
  
        response.status(200).json(groups);
    } catch (error) {
        console.error(error);
        response.status(500).send('Erreur lors de la récupération des groupes');
    }
  },
  
  // Supprimer un groupe associé à un utilisateur
  removeGroupFromUser: async (request, response) => {
    try {
        let { idGroup, idUser } = request.body;
  
        const errorServer = {};
  
        if (!idGroup || !idUser) {
            errorServer.error = 'Tous les champs sont obligatoires';
            return response.status(400).json(errorServer);
        }
  
        const userExists = await User.findByPk(idUser);
  
        if (!userExists) {
            errorServer.notExistUser = "L'utilisateur n'existe pas";
            return response.status(400).json(errorServer);
        }
        const groupExists = await Group.findByPk(idGroup);
  
        if (!groupExists) {
          errorServer.notExistGroup = "Le groupe n'existe pas";
          return response.status(400).json(errorServer);
      }
  
        await userExists.removeGroup(groupExists);
  
        response.status(201).json({ success: "Groupe d'utilisateur supprimé avec succès" });
    } catch (error) {
        console.error(error);
        response.status(500).send("Erreur lors de la suppression du groupe");
    }
  },
  getInfoUser: async (request, response) => {
    try {
      const { idUser } = request.query;
      const user = await User.findByPk(idUser);
      
      if (!user) {
        return response.status(404).json({ error: "Utilisateur non trouvé" });
      }
            response.status(200).json(user);
    } catch (error) {
      console.error(error);
     
      response.status(500).send('Erreur lors de la récupération des groupes');
    }
  },

  getEtablissementUser:async (request, response) => {
    try {
      const {idUser}=request.query
      const user=await User.findByPk(idUser);
      if (!user) {
        return response.status(404).json({ error: "Formateur non trouvé" });
      }
      const  etablissements=await Etablissement.findAll({
          where:{
             id_user:{
                [Op.eq]:user.id
             }
          }
      });
      response.status(200).json(etablissements);
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la suppression des modules');
    }
  },
  getRolesUser:async (request, response) => {
    try {
      const { idUser } = request.query;
      const user = await User.findByPk(idUser);
      
      if (!user) {
        return response.status(404).json({ error: "Formateur non trouvée" });
      }
      
      const roles = await user.getRoles();
      response.status(200).json(roles);
    } catch (error) {
      console.error(error);
      response.status(500).send('Erreur lors de la récupération des modules');
    }
  },
  getRolesNotAddedUser:  async (requete, réponse) => {
    try {
        const { idUser } = requete.query;

        if (!idUser) {
            return réponse.status(400).json({ erreur: "L'identifiant de l'utilisateur est requis" });
        }

        const utilisateur = await User.findByPk(idUser);

        if (!utilisateur) {
            return réponse.status(404).json({ erreur: "Utilisateur non trouvé" });
        }

        const rolesUtilisateur = await utilisateur.getRoles();
        const listeIdRolesUtilisateur = rolesUtilisateur.map(role => role.id);

        const rolesNonAjoutes = await Role.findAll({
            where: {
                id: {
                    [Op.notIn]: listeIdRolesUtilisateur
                }
            }
        });

        réponse.status(200).json(rolesNonAjoutes);
    } catch (erreur) {
        console.error(erreur);
        réponse.status(500).send('Erreur lors de la récupération des rôles');
    }
},
   ajouterRoleUser : async (request, response) => {
    try {
      const { idUser, idRole } = request.body;
      
      // Vérification que idUser et idRole sont fournis et sont des nombres
      if (!idUser || isNaN(idUser) || !idRole || isNaN(idRole)) {
          return response.status(400).json({ error: "L'identifiant de l'utilisateur et du rôle doivent être des nombres valides" });
      }
  
      const user = await User.findByPk(idUser);
      
      if (!user) {
          return response.status(404).json({ error: "Utilisateur non trouvé" });
      }
      
      const role = await Role.findByPk(idRole);
  
      if (!role) {
          return response.status(404).json({ error: "Rôle non trouvé" });
      }
      
      // Ajout du rôle à l'utilisateur
      await user.addRole(role);
  
      return response.status(200).json({ message: "Rôle ajouté avec succès à l'utilisateur" });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du rôle à l\'utilisateur:', error);
      return response.status(500).json({ error: 'Erreur interne du serveur' });
    }
  },
  deleteRoleUser: async (request, response) => {
    try {
      const { idUser, idRole } = request.body;

      // Vérification que idUser et idRole sont fournis
      if (!idUser || !idRole) {
        return response.status(400).json({ error: "L'identifiant de l'utilisateur et du rôle sont requis" });
      }

      const user = await User.findByPk(idUser);

      if (!user) {
        return response.status(404).json({ error: "Utilisateur non trouvé" });
      }

      const role = await Role.findByPk(idRole);

      if (!role) {
        return response.status(404).json({ error: "Rôle non trouvé" });
      }

      // Suppression du rôle de l'utilisateur
      await user.removeRole(role);

      response.status(200).json({ message: "Rôle supprimé avec succès de l'utilisateur" });
    } catch (error) {
      console.error(error);
      response.status(500).send("Erreur lors de la suppression du rôle de l'utilisateur");
    }
  },
  deleteEtablissementUser: async (request, response) => {
    try {
      const { idEtablissement } = request.query;

      // Vérification que idEtablissement est fourni
      if (!idEtablissement) {
        return response.status(400).json({ error: "L'identifiant de l'établissement est requis" });
      }

      // Suppression de l'établissement
      await Etablissement.destroy({
        where: {
          id: idEtablissement
        }
      });

      response.status(200).json({ message: 'Établissement supprimé avec succès' });
    } catch (error) {
      console.error(error);
      response.status(500).send("Erreur lors de la suppression de l'établissement");
    }
  },
  getInfoUserConnect:async (request, response) => {
    try {
       id=request.user.id
       const user=await User.findByPk(id)

      response.status(200).json(user);
    } catch (error) {
      console.error(error);
      response.status(500).send("Erreur lors de la suppression de l'établissement");
    }
  },
  allUsersNotEtablissement: async (request, response) => {
    try {
      const userEtablissements = await Etablissement.findAll();
      const userEtablissementIds = userEtablissements.map(etablissement => etablissement.id_user);
  
      const userList = await User.findAll({
        where: {
          id: {
            [Op.notIn]: userEtablissementIds
          }
        }
      });
  
      response.status(200).json(userList);
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
  },
  
  }
  
  module.exports = userController;
  