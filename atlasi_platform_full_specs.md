# مواصفات المنصة الكاملة — مظلات الأطلسي
## Platform Full Specifications — Admin + Client

---

# PARTIE 1 — PANEL ADMINISTRATEUR

---

## 1.1 Suivi de la chaîne d'exécution (Pipeline)

Chaque commande confirmée passe par un pipeline de 5 étapes visibles dans le dashboard :

```
Appel employée → Visite + 999 SAR → Atelier (48h) → Installation (24h) → Garantie activée
```

### Vue Pipeline (Kanban)
Colonnes glissantes avec les commandes classées par étape :

| Colonne | Description |
|---|---|
| 📞 Appel programmé | Employée doit contacter le client |
| 🏠 Visite planifiée | RDV confirmé, paiement 999 SAR à collecter |
| 🔨 En atelier | Commande transmise à l'atelier (chrono 48h) |
| 🚛 Livraison / Installation | En cours d'installation (chrono 24h) |
| ✅ Terminé & Garanti | Installation validée, garantie activée |

**Fonctionnalités par carte :**
- Chronomètre de délai restant (rouge si dépassé)
- Bouton "Passer à l'étape suivante"
- Agent assigné
- Note interne
- Lien Maps vers le client

---

## 1.2 Gestion des Avis & Évaluations post-installation

### Déclenchement automatique
Dès que l'admin passe une commande à l'étape **"Terminé & Garanti"**, le système envoie automatiquement le message WhatsApp de satisfaction au client.

### Tableau des évaluations reçues
Colonnes :
- Numéro de commande
- Nom du client
- Note (1 à 5 étoiles)
- Date de réponse
- Commentaire (si renseigné)

### Métriques d'avis dans le dashboard
- Note moyenne globale (ex: ⭐ 4.7 / 5)
- Répartition des notes (barres horizontales)
- Nombre de clients ayant évalué vs total installés

---

## 1.3 Programme de Fidélité — Carte Dorée Atlasi

### Vue d'ensemble admin
Tableau des clients fidèles avec :
- Numéro de téléphone (identifiant unique)
- Nombre de commandes réalisées
- Niveau de remise actuel
- Remise disponible pour la prochaine commande
- Bouton "Appliquer la remise" lors de la saisie d'une nouvelle commande

### Règles de remise configurables
| Commande | Remise appliquée |
|---|---|
| 2ème commande | 5% |
| 3ème commande | 5% |
| 4ème commande | 10% |
| 5ème commande | 50% (demi-tarif) |

> Ces pourcentages sont **modifiables** par l'admin depuis les Paramètres.

### Partage de remise (parrainage)
- Un client peut partager sa remise avec un ami via son numéro de téléphone
- L'admin voit dans la fiche client : "Parrainé par : 05XXXXXXXX"
- Statistiques de parrainage : nombre de filleuls par client

---

## 1.4 Gestion de la Garantie

Pour chaque commande terminée :
- Date d'activation de la garantie
- Durée de garantie (configurable, ex: 1 an)
- Date d'expiration
- Alerte automatique 30 jours avant expiration → message WhatsApp au client

**Vue garanties expirant bientôt** (filtre rapide dans le dashboard)

---

## 1.5 Fiche Client Complète (CRM)

Accessible depuis le menu "Clients", chaque fiche contient :

**Informations générales**
- Nom, numéro de téléphone
- Localisation (carte Maps intégrée)
- Date du premier contact

**Historique des commandes**
- Liste de toutes ses commandes avec statut et numéro de confirmation
- Total dépensé

**Programme de fidélité**
- Rang actuel (Normal / Argent / Or / VIP)
- Remise disponible
- Liste des filleuls parrainés

**Évaluations données**
- Notes et commentaires laissés

**Notes internes**
- Champ libre pour les remarques de l'équipe (non visible par le client)

---

## 1.6 Notifications & Alertes Internes

L'admin reçoit des alertes dans le panel pour :
- 🔴 Nouvelle demande en attente depuis +2h
- 🟡 Visite prévue dans les 2 prochaines heures
- 🔴 Chrono atelier dépassé 48h
- 🟡 Garantie expirant dans 30 jours
- 🟢 Nouveau avis reçu (note 5 étoiles)
- 🔴 Nouveau avis négatif (note 1-2 étoiles) → nécessite une action

---

## 1.7 Rapports & Exports

- Export CSV des commandes (avec filtres de dates)
- Rapport mensuel : revenus, commandes, taux de conversion, note moyenne
- Top 10 clients les plus fidèles
- Classement des designs les plus commandés
- Rapport des agents terrain (nombre de visites, installations)

---

---

# PARTIE 2 — PAGE CLIENT (Espace Client)

---

## 2.1 Accès à l'espace client

Le client accède à sa page via :
- Lien envoyé automatiquement avec son numéro de confirmation
- URL : `atlasi.sa/suivi/ATL-2024-0142`
- Authentification simple : numéro de téléphone + code OTP WhatsApp

---

## 2.2 Suivi de commande en temps réel

Affichage visuel du pipeline de la commande :

```
✅ Demande reçue → ✅ Confirmée → 🔄 En atelier → ⏳ Installation → 🏆 Terminé
```

Détails affichés :
- Numéro de confirmation
- Récapitulatif du design, taille, couleur, fixation
- Date estimée d'installation
- Nom de l'agent assigné

---

## 2.3 Carte de Fidélité Dorée

Section visible sur la page client :
- Design visuel de la carte dorée avec son nom
- Nombre de commandes effectuées
- **Remise disponible** pour la prochaine commande (mise en avant)
- Progression vers la prochaine remise (barre de progression)
- **Bouton "Partager ma remise"** → génère un message WhatsApp à envoyer à un ami

---

## 2.4 Historique des commandes

Liste de toutes ses commandes avec :
- Numéro de confirmation
- Date
- Design et options choisies
- Statut final
- Note donnée (si évaluation faite)

---

## 2.5 Évaluation post-installation

Si l'évaluation n'a pas été faite via WhatsApp, le client peut la faire directement depuis sa page :
- Sélection de 1 à 5 étoiles
- Champ commentaire optionnel
- Bouton "Envoyer mon avis"

---

## 2.6 Informations de garantie

- Date d'activation
- Date d'expiration
- Description des conditions couvertes
- **Bouton "Signaler un problème"** → envoie une alerte à l'admin et ouvre une conversation WhatsApp

---

## 2.7 Nouvelle commande rapide

Bouton **"Commander à nouveau"** qui :
- Pré-remplit le formulaire avec les préférences de la dernière commande
- Applique automatiquement la remise fidélité disponible
- Redirige vers le bot WhatsApp pour confirmer

---

## 2.8 Parrainage

- Lien de parrainage unique basé sur le numéro de téléphone
- Compteur : "Vous avez parrainé X ami(s)"
- Explication des avantages partagés
- Bouton "Inviter un ami" → partage via WhatsApp

---

---

# RÉSUMÉ — Fonctionnalités Prioritaires à Développer

| Priorité | Fonctionnalité | Impact |
|---|---|---|
| 🔴 Haute | Pipeline Kanban des commandes | Opérationnel |
| 🔴 Haute | Numéro de confirmation automatique | Client + Admin |
| 🔴 Haute | Envoi automatique du message post-installation | Fidélisation |
| 🟡 Moyenne | Programme fidélité Carte Dorée | Rétention |
| 🟡 Moyenne | Page client de suivi | Expérience client |
| 🟡 Moyenne | Gestion des garanties | SAV |
| 🟢 Basse | Système de parrainage | Acquisition |
| 🟢 Basse | Rapports & exports | Analyse |
