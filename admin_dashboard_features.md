# Spécifications Fonctionnelles : Tableau de Bord Administrateur Atlasi (2026)

Ce document détaille l'ensemble des fonctionnalités implémentées dans l'interface d'administration de la plateforme Atlasi.

## 1. Sécurité et Accès
- **Authentification** : Système de connexion sécurisé avec redirection.
- **Gestion de Session** : Déconnexion sécurisée et protection des routes.

## 2. Vue d'Ensemble (Dashboard Overview)
Véritable tour de contrôle de l'activité en temps réel :
- **Indicateurs Clés (KPIs)** :
    - Total des commandes.
    - Commandes du jour.
    - Commandes en attente (avec alertes visuelles si > 5).
    - Total des clients.
    - Revenus mensuels et annuels estimés.
- **Tableau de Bord des Activités** : Affichage des 20 dernières commandes avec statut et raccourcis d'action.
- **Entonnoir de Conversion (Funnel)** : Visualisation du flux (de la demande au montage fini).
- **Performance des Équipes** : Suivi des visites et installations par technicien.
- **État du Système** : Monitoring en direct des APIs (WhatsApp, Google Maps, Base de données).

## 3. Gestion des Commandes (Requests)
- **Liste Complète** : Visualisation de toutes les demandes avec système de recherche multicritères (nom, téléphone, numéro de commande).
- **Filtrage Avancé** : Tri par statut (Nouveau, En attente, Confirmé, Programmé, En production, Installé).
- **Console d'Actions** : 
    - Validation ou Refus direct.
    - Vue détaillée complète.
    - Ajout de notes administratives internes.

## 4. Suivi du Flux de Travail (Pipeline)
- **Tableau Kanban** : Visualisation en colonnes du cycle de vie d'une commande.
- **Gestion des Étapes** : Déplacement logique des demandes à travers les phases critiques (Nouveau -> Confirmé -> Planifié -> Atelier -> Installé).

## 5. Agenda et Programmation (Calendar)
- **Vues Multiples** : Affichage par Jour, Semaine ou Mois.
- **Planification Intelligente** :
    - Attribution des visites à des techniciens spécifiques (Fahd, Sultan, etc.).
    - Gestion de la durée et des créneaux horaires.
    - Localisation des visites.
- **Statuts Visuels** : Codes couleurs pour différencier les types d'interventions (Visite terrain, Installation, Suivi garantie, Reporté).
- **Ligne de Temps (Real-time)** : Indicateur de l'heure actuelle sur l'agenda journalier.

## 6. Gestion des Clients (CRM)
- **Fiches Clients 360°** :
    - Informations personnelles et historique complet.
    - Liste de toutes les commandes passées.
    - **Cartographie** : Intégration Google Maps pour visualiser l'emplacement exact des chantiers.
    - **Gestion Administrative** : Mise sur liste noire ou marquage VIP.
- **Journal de Notes** : Historique des notes internes pour chaque client.

## 7. Programme de Fidélité (Loyalty)
- **Niveaux de Fidélité** :
    - **Nouveau** (0 commande)
    - **Bronze** (1 commande)
    - **Silver** (2 commandes - 5% remise)
    - **Gold** (3 commandes - 10% remise)
    - **Platinum** (4+ commandes - 15% remise)
- **Suivi de Progression** : Calcul automatique du nombre de commandes manquantes pour passer au niveau supérieur.
- **Récompenses** : Application automatique des remises sur les nouveaux devis.

## 8. Rapports et Statistiques
- **Analyses de Données** : Rapport sur la répartition des statuts (graphique à barres horizontal).
- **Bilan Financier** : Consolidation des revenus par période.
- **Exportation** : Possibilité d'exporter les données au format CSV/Report pour analyse externe.

## 9. Paramètres du Système
- **Informations Entreprise** : Modification du nom, WhatsApp officiel et adresse.
- **Délais Opérationnels** : Configuration des temps estimés de fabrication et d'installation.
- **Sécurité** : Mise à jour des identifiants administratifs.

---
*Document généré le 13 Avril 2026 pour la plateforme Atlasi Platform.*
