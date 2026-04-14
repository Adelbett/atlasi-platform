# REPORT_AUDIT — مظلات الأطلسي Platform
**Date :** 2026-04-14  
**Version auditée :** v34 (branche `main`)  
**Auditeur :** Claude Code (Sonnet 4.6)

---

## 1. Audit de l'existant

### 1.1 Architecture générale

| Couche | Technologie | État |
|--------|-------------|------|
| Frontend | React 19 + Vite + Zustand + Tailwind | ✅ Fonctionnel |
| Backend | Spring Boot 3.5 + JPA + H2 | ⚠️ Données non persistantes (H2 in-memory) |
| Base de données | H2 (dev) | ❌ Pas de MySQL/PostgreSQL en production |
| Authentification | Login basique (plain text) | ❌ Non sécurisé |
| Déploiement | Non configuré | ⚠️ URL hardcodée `localhost:8080` |

### 1.2 Parcours client — Frontend (Wizard)

| Étape | Fonctionnalité | État avant audit |
|-------|---------------|-----------------|
| Step 1 | Saisie nom + téléphone | ✅ OK — validation format 05XXXXXXXX |
| Step 2 | Choix du design (Malaki/Neom/Sahara) | ✅ OK |
| Step 3 | Taille (Single/Double) + Fixation | ✅ OK — Sahara saute la fixation |
| Step 4 | Couleur (Beige/Noir) | ✅ OK |
| Step 5 | Couleur — confirmation | ✅ OK |
| Step 6 | **Revue de commande** | ❌ Prix hardcodé ("1,899–2,599 ر.س") — non calculé |
| Step 6 | **Couleur fabric** | ❌ Hardcodé "بيج" — ne reflétait pas la sélection |
| Step 7 | Localisation Leaflet + soumission | ✅ OK — estimatedPrice absent |
| Step 8 | Confirmation | ✅ OK |

### 1.3 Dashboard Admin — État avant audit

| Module | Fonctionnalité | État avant audit |
|--------|---------------|-----------------|
| Vue d'ensemble | KPIs + graphiques | ✅ OK |
| Requests | Table + filtres + panel détail | ✅ OK |
| Pipeline | Kanban 5 colonnes | ✅ OK |
| Calendar | Agenda journalier + ajout visite | ✅ OK |
| Clients | Profil complet + 7 onglets | ✅ OK |
| Loyalty | **Paliers incorrects** | ❌ 5% → 10% → 15% (faux) |
| Loyalty | **Base de calcul** | ❌ Comptait uniquement les `installed` |
| Catalogue | **Absent** | ❌ Aucune vue stock/tarifs |
| Reports | Stats basiques | ⚠️ Pas d'export réel |
| Settings | Gestion admins (local only) | ⚠️ Non persistant |

### 1.4 Lacunes Backend identifiées

| Composant | Problème |
|-----------|---------|
| `AtlasiRequest` | Champ `estimatedPrice` absent |
| `AtlasiRequest` | Champ `adminNotes` absent |
| `AdminController` | Pas de recherche par téléphone |
| Loyalty | **Aucun endpoint** pour le programme de fidélité |
| Sécurité | Mots de passe en plain text (NON HASHÉ) |
| Persistence | H2 in-memory — données perdues au redémarrage |

---

## 2. Ajouts Backend/Admin effectués

### 2.1 Modèle `AtlasiRequest.java`

Champs ajoutés :
```java
private Double estimatedPrice; // Prix estimé (après remise fidélité)
private String adminNotes;     // Notes internes Admin
```

### 2.2 `AtlasiRequestRepository.java`

Méthode ajoutée :
```java
List<AtlasiRequest> findByClientPhone(String clientPhone);
```

### 2.3 `LoyaltyController.java` — **Nouveau contrôleur**

Endpoints créés :

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/loyalty/status/{phone}` | Statut de fidélité pour un n° de téléphone |
| `GET` | `/api/loyalty/all` | Liste complète des clients avec leur palier |
| `PUT` | `/api/loyalty/override/{phone}` | Override admin (stub — v.future) |

**Logique métier :**
- Comptage des commandes **non annulées** par numéro de téléphone normalisé
- Paliers identiques à ce que voit le client sur la landing page
- Tri par nombre de commandes décroissant

### 2.4 `AdminDashboard.jsx` — Corrections et ajouts

#### a) `LOYALTY_LEVELS` — Correction critique

| Avant | Après |
|-------|-------|
| 5 paliers (Nouveau/Bronze/Argent/Or/Platine) | 3 paliers exacts (Nouveau/Argent/Platine) |
| Platine = 15% (faux) | Platine = **50%** (correct) |
| Or = 10% (faux) | Supprimé (non existant) |
| Base : commandes `installed` | Base : commandes **non annulées** |

#### b) Fonction `getNextOrderDiscount(n)` — Nouvelle

Calcule la remise applicable à la prochaine commande :
```javascript
if (next >= 5) return '50%';
if (next >= 2) return '5%';
return '—';
```

#### c) Page `Loyalty` — Colonne "خصم الطلب التالي"

La colonne "prochain palier" affiche désormais la remise réelle sur la prochaine commande, avec badge coloré (orange pour 50%, bleu pour 5%).

#### d) Onglet "الولاء" (Client Profile) — Refonte

- Carte de fidélité dynamique avec couleur du palier
- Barre de progression (5 commandes) colorée selon le palier
- Affichage "خصم الطلب التالي" en temps réel
- Timeline des 3 paliers avec indicateur de position actuelle

#### e) Page `Catalogue` — **Nouvelle page Admin**

Route : `/admin/catalogue`  
Icône : `category`

Fonctionnalités :
- Tableau des **10 modèles** (ATL-1S à ATL-3B-C)
- Colonnes : Code · Design · Taille · Fixation · Coût Beige · Coût Noir · Prix min · Prix max · **Marge %** · **Nb commandes**
- Calcul automatique du nombre de commandes reçues par modèle (depuis l'API)
- Badge couleur sur la marge (vert ≥40% / jaune ≥20% / rouge <20%)
- Bandeau d'alerte rappelant que le prix final est confirmé après visite terrain

### 2.5 `store.js` — Champs de fidélité

Ajoutés à l'état Zustand :
```javascript
loyaltyDiscount: 0,    // 0 | 0.05 | 0.50
loyaltyTier: '',       // 'جديد' | 'فضي' | 'بلاتيني'
loyaltyOrderNum: 1,    // numéro de la commande en cours
```
Action :
```javascript
setLoyaltyInfo: (discount, tier, orderNum) => set({...})
```
Inclus dans `resetOrder()` pour nettoyage complet.

### 2.6 `Wizard.jsx` — Intégration fidélité côté client

#### Step 1 — Badge de remise dynamique

Dès qu'un numéro de téléphone valide est saisi, une requête `GET /api/loyalty/status/{phone}` est lancée. En cas de remise applicable, un badge s'affiche :

- **5%** → fond vert, message "خصم تلقائي 5%"  
- **50%** → fond amber, message "خصم استثنائي 50%"  
- Échec API → silencieux, aucune perturbation UX  

#### Step 6 — Prix calculé dynamiquement

Avant : prix hardcodé `"من 1,899 إلى 2,599 ر.س"` (jamais mis à jour selon le modèle).  
Après : `calculatePrice(design, size, fixation, color)` est appelé et :
- Affiche le vrai prix min–max du modèle sélectionné
- Si remise fidélité active : affiche le prix **barré** + prix réduit en vert + badge "خصم ولاء X% مطبق"
- Couleur du fabric ("قماش") corrigée pour refléter la sélection réelle (Beige/Noir)

#### Step 7 — `estimatedPrice` dans la soumission

L'objet de commande envoyé au backend inclut désormais :
```javascript
estimatedPrice: Math.round(priceData.sellMin * (1 - loyaltyDiscount))
```
Ce champ est persisté en base et visible dans le panneau détail des Requests Admin.

---

## 3. Logique de Fidélité — Code mis en place

### 3.1 Principe

Le numéro de téléphone (`clientPhone`) est l'**identifiant unique** du client. Le programme de fidélité est entièrement basé sur cet identifiant — sans compte, sans inscription.

### 3.2 Paliers

| N° de commande | Remise | Palier |
|----------------|--------|--------|
| 1ère commande | 0% | 🆕 Nouveau |
| 2ème commande | **5%** | 🥈 Argent |
| 3ème commande | **5%** | 🥈 Argent |
| 4ème commande | **5%** | 🥈 Argent |
| 5ème commande | **50%** | 💎 Platine |

> La 5ème commande est une récompense exceptionnelle (demi-tarif). Ce palier est identique à ce qui est affiché sur la Landing Page du site client.

### 3.3 Flux technique (Backend)

```
Client saisit téléphone (Step 1)
    ↓
GET /api/loyalty/status/0501234567
    ↓
LoyaltyController.getLoyaltyStatus()
    ↓
requestRepository.findAll()
  → filter(phone == normalizedPhone)
  → filter(status != cancelled)
  → count() → validOrders
    ↓
nextOrderNumber = validOrders + 1
  Si >= 5 → discountRate = 0.50, tier = بلاتيني
  Si >= 2 → discountRate = 0.05, tier = فضي
  Sinon   → discountRate = 0.00, tier = جديد
    ↓
Réponse JSON → Frontend store (loyaltyDiscount, loyaltyTier)
    ↓
Step 6: prix affiché avec remise
    ↓
Step 7: estimatedPrice = sellMin × (1 - loyaltyDiscount)
  envoyé dans POST /api/admin/requests
```

### 3.4 Flux technique (Admin Dashboard)

```
Admin ouvre /admin/loyalty
    ↓
apiFetch('/admin/requests') → liste complète
    ↓
groupBy(phone || clientName)
  → filter(status != cancelled).length → validOrders
    ↓
loyaltyOf(validOrders) → palier (LOYALTY_LEVELS)
getNextOrderDiscount(validOrders) → remise prochaine commande
    ↓
Affichage : tableau Clients avec colonne "خصم الطلب التالي"
Onglet "الولاء" : barre de progression + timeline
```

---

## 4. Points restants (hors périmètre de cet audit)

| Priorité | Sujet | Recommandation |
|----------|-------|----------------|
| 🔴 Critique | Mots de passe plain text | Implémenter BCrypt + JWT tokens |
| 🔴 Critique | H2 in-memory | Migrer vers PostgreSQL/MySQL avec données persistantes |
| 🟠 Élevée | CORS ouvert (`*`) | Restreindre aux domaines autorisés |
| 🟠 Élevée | URL hardcodée `localhost:8080` | Variable d'environnement `.env` |
| 🟡 Moyenne | Pas de pagination | `Page<AtlasiRequest>` avec JPA Pageable |
| 🟡 Moyenne | Notifications (cloche Admin) | WebSocket ou polling SSE |
| 🟡 Moyenne | Export CSV (Reports) | Implémentation `StreamingResponseBody` |
| 🟢 Faible | ModularisaAdmin (2100 lignes) | Découper en sous-composants |
| 🟢 Faible | LoyaltyOverride | Créer entité `LoyaltyOverride` pour override admin persistant |

---

*Audit réalisé par Claude Code — Sonnet 4.6 — 2026-04-14*
