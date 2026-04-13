# 📋 Spécification Détaillée — 3 Modules Prioritaires
## مظلات الأطلسي — Admin Dashboard
**Version :** 1.0  
**Langue interface :** Arabe RTL  
**Modules couverts :** لوحة التحكم • العملاء • الأجندة

---

## TABLE DES MATIÈRES

1. [لوحة التحكم — Vue d'ensemble & Statistiques](#module-1--لوحة-التحكم--vue-densemble--statistiques)
2. [العملاء — Gestion des Clients](#module-2--العملاء--gestion-des-clients)
3. [الأجندة — Agenda Journalier](#module-3--الأجندة--agenda-journalier)

---

---

# MODULE 1 — لوحة التحكم | Vue d'ensemble & Statistiques

---

## 1.1 Principe général

La page لوحة التحكم est la **première page** visible dès la connexion admin.
Elle présente **une lecture complète et en temps réel** de l'activité de l'entreprise :
demandes clients, revenus, performance opérationnelle, et conversion du bot.

La page est organisée en **5 blocs verticaux** décrits ci-dessous.

---

## 1.2 BLOC A — Bandeau KPIs (ligne du haut)

6 cartes métriques affichées en ligne horizontale, chacune avec :
- Chiffre principal (grand, en gras)
- Libellé en arabe
- Icône thématique
- Flèche d'évolution (↑ vert / ↓ rouge) + % par rapport à la période précédente

| # | Métrique (AR) | Description | Format |
|---|---|---|---|
| 1 | **إجمالي الطلبات** | Toutes les demandes reçues toutes périodes confondues | Nombre entier |
| 2 | **طلبات اليوم** | Demandes reçues depuis 00h00 du jour en cours | Nombre entier |
| 3 | **الطلبات المعلقة** | Demandes en statut جديد ou قيد الانتظار non traitées | Nombre entier + badge rouge si > 5 |
| 4 | **إجمالي العملاء** | Nombre de clients uniques enregistrés | Nombre entier |
| 5 | **إيرادات الشهر** | CA confirmé pour le mois en cours (commandes ≥ مؤكد) | Nombre + ر.س |
| 6 | **إيرادات السنة** | CA cumulé pour l'année civile en cours | Nombre + ر.س |

---

## 1.3 BLOC B — Graphiques financiers (revenus)

### B1 — Graphique revenus mensuels (Barres verticales)

- **Titre :** الإيرادات الشهرية
- **Type :** Barres verticales groupées
- **Axe X :** Les 12 mois de l'année en cours (يناير → ديسمبر)
- **Axe Y :** Montant en SAR (ر.س)
- **Deux séries :**
  - 🔵 Barre 1 : Revenus confirmés (commandes ≥ مؤكد)
  - 🟢 Barre 2 : Revenus encaissés (commandes = تركيب مكتمل)
- **Interactivité :** Survol → tooltip avec montant exact + nombre de commandes du mois
- **Sélecteur d'année :** dropdown pour changer l'année affichée (année en cours par défaut)

### B2 — Graphique comparaison annuelle (Ligne)

- **Titre :** مقارنة سنوية للإيرادات
- **Type :** Courbes multi-lignes
- **Axe X :** 12 mois
- **Axe Y :** Montant en SAR
- **Séries :** Année N (couleur principale) vs Année N-1 (couleur secondaire pointillée)
- **Objectif :** Visualiser la croissance d'une année sur l'autre

### B3 — Carte résumé financier (panneau à droite)

```
┌────────────────────────────────┐
│  ملخص مالي                     │
├────────────────────────────────┤
│  إيرادات هذا الشهر             │
│  12,450 ر.س                    │
│  ↑ +18% مقارنة بالشهر الماضي  │
├────────────────────────────────┤
│  إيرادات هذه السنة             │
│  134,800 ر.س                   │
│  ↑ +24% مقارنة بالسنة الماضية │
├────────────────────────────────┤
│  متوسط قيمة الطلب              │
│  1,087 ر.س                     │
├────────────────────────────────┤
│  أكثر تصميم مبيعاً             │
│  🥇 مقوس (42%)                 │
│  🥈 كابولي (33%)               │
│  🥉 هرمي (25%)                 │
└────────────────────────────────┘
```

---

## 1.4 BLOC C — Statistiques des demandes

### C1 — Tableau de bord des demandes (en temps réel)

```
┌────────────────────────────────────────────────────────┐
│  إحصائيات الطلبات                    اليوم / الأسبوع / الشهر │
├──────────┬──────────┬───────────┬──────────┬──────────┤
│  جديدة   │  مؤكدة  │  قيد التنفيذ│ مكتملة  │  ملغاة  │
│    8     │    5    │     7      │    12   │    3    │
│  🔵      │  🟢     │   🟠       │   ✅    │  🔴     │
└──────────┴──────────┴───────────┴──────────┴──────────┘
```

- **Sélecteur de période :** اليوم | هذا الأسبوع | هذا الشهر | هذا العام | نطاق مخصص
- **Chaque compteur est cliquable** → redirige vers la liste des demandes filtrée par ce statut

### C2 — Entonnoir de conversion (Funnel)

Visualisation verticale en cascade montrant le % de passage d'une étape à l'autre :

```
طلب جديد          ████████████████  100%  (245)
     ↓
مؤكد              ██████████████    78%   (191)
     ↓
زيارة ميدانية     ████████████      61%   (150)
     ↓
ورشة              ██████████        55%   (135)
     ↓
تركيب مكتمل       ████████          48%   (118)
```

- Chaque barre affiche : % de conversion + nombre absolu
- Taux de perte entre chaque étape affiché en rouge entre les barres
- Permet d'identifier visuellement où les commandes se perdent

### C3 — Répartition par design (Donut)

- Graphique circulaire avec pourcentages
- 3 segments : هرمي / مقوس / كابولي
- Légende avec nombre de commandes par design

### C4 — Répartition par taille

- Graphique barres horizontales : كبير vs صغير
- Affichage du ratio pour anticiper les stocks

---

## 1.5 BLOC D — Liste des demandes récentes (Tableau live)

Tableau des **20 dernières demandes** reçues, mis à jour en temps réel.

### Colonnes

| Colonne | Description |
|---|---|
| **رقم الطلب** | Format `ATL-AAAA-XXXX` — cliquable → ouvre fiche |
| **العميل** | Nom complet |
| **الجوال** | Numéro WhatsApp |
| **التصميم** | Icône + nom du design |
| **الحجم** | كبير / صغير |
| **التثبيت** | معلقة / على أعمدة |
| **اللون** | Badge coloré |
| **التاريخ** | Date + heure relative ("منذ 5 دقائق") |
| **الحالة** | Badge coloré avec libellé |
| **إجراء سريع** | Boutons inline : ✅ تأكيد / ❌ رفض / 👁 عرض |

### Comportement
- **Tri** : par défaut du plus récent au plus ancien
- **Clic sur la ligne** → ouvre la fiche complète de la commande en panel latéral
- **Bouton en bas du tableau** → "عرض جميع الطلبات" → redirige vers module الطلبات complet
- **Mise à jour automatique** toutes les 60 secondes (ou en temps réel via WebSocket si disponible)

---

## 1.6 BLOC E — Performance & Alertes

### E1 — Panel d'alertes actives

Zone d'alertes rouge/ambre visible si des situations nécessitent une action :

```
┌─────────────────────────────────────────────────────┐
│  ⚠️  تنبيهات تحتاج إلى تدخل                        │
├─────────────────────────────────────────────────────┤
│  🔴  3 طلبات جديدة منذ أكثر من 4 ساعات بدون رد    │
│      [عرض الطلبات]                                  │
├─────────────────────────────────────────────────────┤
│  🟡  زيارة لم تُغلق: ATL-2026-0041 — أحمد العتيبي  │
│      [فتح الملف]                                    │
├─────────────────────────────────────────────────────┤
│  🟣  ضمانان ينتهيان خلال 7 أيام                    │
│      [عرض الضمانات]                                 │
└─────────────────────────────────────────────────────┘
```

### E2 — Métriques de performance agent

Mini-tableau comparatif des agents terrain pour le mois en cours :

| العميل | زيارات مكتملة | تركيبات مكتملة | متوسط الوقت |
|---|---|---|---|
| فهد العتيبي | 18 | 14 | 2.3 يوم |
| سلطان الغامدي | 12 | 11 | 1.9 يوم |

### E3 — Statut du système (barre compacte en bas)

Ligne d'indicateurs techniques discrets :
`🟢 API Bot` | `🟢 قاعدة البيانات` | `🟢 Google Maps (42/200 req)` | `🟢 الخادم 99.8%`

---

---

# MODULE 2 — العملاء | Gestion des Clients

---

## 2.1 Principe général

Le module العملاء affiche **tous les clients** ayant interagi avec le bot ou ayant une commande enregistrée.
Un client = un enregistrement unique identifié par son **numéro de téléphone WhatsApp**.

Lorsque l'admin **clique sur un client**, une fiche complète s'ouvre avec **toutes les données** collectées :
choix faits dans le bot, localisation GPS, historique des commandes, notes des réunions terrain,
niveau de fidélité, et éventuelles remarques administratives.

---

## 2.2 Liste principale des clients

### Filtres et recherche

```
[🔍 بحث بالاسم أو الجوال أو رقم الطلب          ]
[الكل] [جديد] [برونزي] [فضي] [ذهبي] [بلاتيني]
[فرز: الأحدث ▼] [تصدير CSV]
```

- **Recherche** : par nom, numéro de téléphone, ou numéro de commande `ATL-XXXX`
- **Filtre par niveau de fidélité** : جديد / برونزي / فضي / ذهبي / بلاتيني
- **Filtre par statut** : عميل نشط (commande en cours) / عميل مكتمل / بدون طلب (bot incomplet)
- **Tri** : par date d'inscription, nombre de commandes, montant total dépensé

### Colonnes du tableau

| Colonne | Description |
|---|---|
| **العميل** | Photo/avatar initiales + Nom complet |
| **رقم الجوال** | Numéro WhatsApp (format international) |
| **عدد الطلبات** | Total des commandes passées |
| **آخر طلب** | Date et statut de la dernière commande |
| **إجمالي الإنفاق** | Montant cumulé de toutes ses commandes (ر.س) |
| **مستوى الولاء** | Badge coloré (جديد / برونزي / فضي / ذهبي / بلاتيني) |
| **تاريخ الانضمام** | Date du premier contact |
| **إجراء** | Bouton "عرض الملف الكامل" |

---

## 2.3 Fiche Client Complète (après clic)

La fiche s'ouvre en **page complète** (ou panel latéral large).
Elle est organisée en **onglets thématiques** :

```
[معلومات شخصية]  [الطلبات]  [الموقع]  [الولاء]  [المواعيد]  [الملاحظات]
```

---

### ONGLET 1 — معلومات شخصية (Informations personnelles)

```
┌─────────────────────────────────────────────────────────────┐
│  [Avatar initiales grand]                                   │
│  محمد عبدالله العمراني                                      │
│  🏅 عميل ذهبي  •  عضو منذ: 14 مارس 2025                   │
├───────────────────────────┬─────────────────────────────────┤
│  📱 رقم الجوال            │  +966 5X XXX XXXX               │
│  📧 البريد الإلكتروني     │  (اختياري — si renseigné)       │
│  📍 المدينة               │  الرياض                         │
│  🏘️ الحي                  │  حي النرجس                      │
│  📅 أول تواصل             │  14 مارس 2025 — 10:32 ص        │
│  💬 مصدر التواصل          │  واتساب بوت                     │
├───────────────────────────┴─────────────────────────────────┤
│  إجمالي الطلبات : 3   •   إجمالي الإنفاق : 3,200 ر.س      │
└─────────────────────────────────────────────────────────────┘
```

**Actions disponibles depuis cet onglet :**
- ✏️ Modifier le nom (si mal orthographié)
- 📞 Appeler (lien tel:)
- 💬 Ouvrir WhatsApp (lien wa.me/)
- 🚫 Marquer comme "قائمة سوداء" (avec champ motif obligatoire)
- ⭐ Marquer comme "VIP" (priorité de traitement)

---

### ONGLET 2 — الطلبات (Historique des commandes)

Liste de **toutes les commandes** du client, de la plus récente à la plus ancienne.

Chaque commande affiche une **carte expansible** :

```
┌─────────────────────────────────────────────────────────────┐
│  ATL-2026-0089  •  🟠 قيد التنفيذ  •  12 أبريل 2026       │
│  ──────────────────────────────────────────────────────     │
│  📐 التصميم : كابولي (مقوس + جدار)                         │
│  📏 الحجم : كبير (SUV)                                      │
│  🔧 التثبيت : معلقة على الجدار                              │
│  🎨 اللون : بيج رملي                                        │
│  💰 المبلغ : 1,300 ر.س  (دفعة أولى: 999 ر.س — مدفوعة)     │
│  👷 الفني المكلف : فهد العتيبي                              │
│  [عرض التفاصيل الكاملة] [فتح في لوحة الطلبات]              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ATL-2026-0031  •  ✅ مكتمل  •  8 فبراير 2026             │
│  ──────────────────────────────────────────────────────     │
│  📐 التصميم : هرمي                                          │
│  📏 الحجم : صغير (سيدان)                                    │
│  🔧 التثبيت : على أعمدة                                     │
│  🎨 اللون : رمادي فاتح                                      │
│  💰 المبلغ : 900 ر.س  (مدفوع بالكامل)                      │
│  🛡️ الضمان : نشط حتى 8 فبراير 2027                        │
│  ⭐ التقييم : 5/5                                           │
└─────────────────────────────────────────────────────────────┘
```

**Données affichées pour chaque commande :**
- Numéro `ATL-XXXX` + statut + date
- **Tous les choix du bot** : design, taille, fixation, couleur
- Montant total + statut de paiement (دفعة أولى / مدفوع بالكامل)
- Agent terrain assigné
- Dates clés : confirmation, visite, livraison atelier, installation
- Statut garantie (si commande terminée) + date d'expiration
- Note d'évaluation client (si reçue)

---

### ONGLET 3 — الموقع (Localisation GPS)

```
┌─────────────────────────────────────────────────────────────┐
│  [Carte Google Maps intégrée — iframe]                      │
│  • Marqueur rouge = position du client                      │
│  • Zoom niveau 15 par défaut                                │
│                                                             │
│  📍 العنوان المستخرج :                                      │
│  "الرياض، حي النرجس، شارع الأمير سلطان، رقم 42"           │
│  (généré via Google Reverse Geocoding API)                  │
│                                                             │
│  🌐 إحداثيات GPS :                                         │
│  Lat: 24.7894  •  Lng: 46.6521                             │
│                                                             │
│  [📍 فتح في Google Maps]  [🧭 اتجاهات للفني]              │
└─────────────────────────────────────────────────────────────┘
```

**Si plusieurs commandes avec localisations différentes :**
- Sélecteur de commande pour afficher la localisation correspondante
- Chaque localisation est stockée individuellement par commande

---

### ONGLET 4 — الولاء (Programme de fidélité)

```
┌─────────────────────────────────────────────────────────────┐
│  🏅 بطاقة الأطلسي الذهبية                                  │
│  ───────────────────────────────────────────────────────    │
│  مستوى الولاء الحالي : ذهبي ⭐⭐⭐⭐                        │
│                                                             │
│  ●●●●○  (4 طلبات من 5)                                     │
│  طلب واحد فقط للوصول إلى المستوى البلاتيني               │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│  الخصم على الطلب القادم : 10%                              │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│  تاريخ الخصومات المستخدمة :                                │
│  الطلب 2 — خصم 5% — تم التطبيق — 8 فبراير 2026           │
│  الطلب 3 — خصم 5% — تم التطبيق — 15 مارس 2026            │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│  الإحالات : 2 عميل تمت إحالتهم بواسطة هذا العميل         │
│  [عرض العملاء المحالين]                                    │
└─────────────────────────────────────────────────────────────┘
```

**Actions admin dans cet onglet :**
- Ajuster manuellement le niveau de fidélité (avec motif)
- Offrir un bonus de réduction exceptionnel (champ % libre)
- Voir la liste des clients parrainés par ce client

---

### ONGLET 5 — المواعيد (Rendez-vous & Visites)

Liste chronologique de **tous les rendez-vous** liés à ce client :

```
┌─────────────────────────────────────────────────────────────┐
│  سجل المواعيد والزيارات                                     │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  📅 15 أبريل 2026 — 10:00 ص                               │
│  🔵 زيارة ميدانية مجدولة                                   │
│  👷 الفني : فهد العتيبي                                     │
│  📋 الطلب : ATL-2026-0089                                   │
│  📝 ملاحظة : الوصول من الباب الجانبي                       │
│  [الحالة : قادمة] [تعديل] [إلغاء]                         │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  📅 5 فبراير 2026 — 09:30 ص                               │
│  ✅ زيارة ميدانية مكتملة                                   │
│  👷 الفني : سلطان الغامدي                                  │
│  📋 الطلب : ATL-2026-0031                                   │
│  📝 ملاحظة الفني : "تم أخذ القياسات. العمود الأيسر على     │
│      بعد 30 سم من السور. العميل حاضر طوال الوقت."          │
│  📏 القياسات المسجلة : 5.2م × 3.1م                        │
│  [عرض تقرير الزيارة الكامل]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Données affichées pour chaque visite :**
- Date + heure de la visite
- Type : زيارة ميدانية / تركيب / متابعة ضمان
- Nom du technicien assigné
- Numéro de commande lié
- **Remarques saisies lors de la visite** (par le technicien terrain)
- **Mesures prises** (dimensions relevées sur site)
- Statut : قادمة / مكتملة / ملغاة / مرجأة

> **Important :** Toute remarque saisie par l'agent depuis le panel terrain apparaît automatiquement ici dans le profil client.

---

### ONGLET 6 — الملاحظات (Notes administratives)

Zone de notes internes **visibles uniquement par les admins**.

```
┌─────────────────────────────────────────────────────────────┐
│  ملاحظات إدارية سرية (غير مرئية للعميل)                   │
│  ───────────────────────────────────────────────────────    │
│                                                             │
│  [12 أبريل 2026 — Admin]                                   │
│  "العميل يفضل الاتصال بعد الساعة 5 مساءً فقط.            │
│   لا يرد على الاتصالات الصباحية."                          │
│                                                             │
│  [8 فبراير 2026 — Admin]                                   │
│  "عميل ممتاز، منظم ومحترم. طلب تسريع موعد التركيب        │
│   بسبب ظروف عائلية — تم التنسيق مع فهد."                  │
│                                                             │
│  ───────────────────────────────────────────────────────    │
│  ✏️ إضافة ملاحظة جديدة...                                 │
│  [حقل نص متعدد الأسطر]              [💾 حفظ الملاحظة]     │
└─────────────────────────────────────────────────────────────┘
```

- Chaque note est horodatée (date + heure) et attribuée à l'admin qui l'a saisie
- Les notes sont cumulatives (aucune ne peut être effacée, seulement désactivée)
- Recherche dans les notes possible

---

## 2.4 Synchronisation des données client

Toutes les données du profil client sont **alimentées automatiquement** depuis :

| Source | Données transmises |
|---|---|
| **Bot WhatsApp (étapes 1→5)** | Design, taille, fixation, couleur choisis |
| **Bot WhatsApp (étape 7)** | Coordonnées GPS + adresse reverse geocodée |
| **Confirmation admin (étape مؤكد)** | Statut de confirmation + horodatage |
| **Panel Agent Terrain** | Remarques de visite, mesures, photos |
| **Module Agenda** | Rendez-vous créés et leur statut |
| **Bot post-installation** | Note d'évaluation (1→5 étoiles) |
| **Module Fidélité** | Niveau de carte, réductions appliquées |

> Aucune saisie manuelle n'est nécessaire pour alimenter un profil client.
> Tout est automatiquement lié par le **numéro de téléphone** comme identifiant unique.

---

---

# MODULE 3 — الأجندة | Agenda Journalier

---

## 3.1 Principe général

Le module الأجندة est un **calendrier opérationnel** dédié à la planification et au suivi des visites terrain.

**Contraintes horaires :**
- Plage de travail : **06h00 → 17h00** (11 heures)
- Toute la vue journalière est affichée dans cette plage uniquement
- Les créneaux hors de cette plage sont masqués ou grisés
- Granularité des créneaux : **30 minutes**

---

## 3.2 Vues disponibles

Navigation par onglets en haut du calendrier :

| Vue | Libellé | Description |
|---|---|---|
| **يوم** | Jour | Vue heure par heure pour une journée (vue principale) |
| **أسبوع** | Semaine | Vue sur 7 jours avec colonnes par agent |
| **شهر** | Mois | Vue globale avec compteur de visites par jour |

**Vue par défaut à l'ouverture :** يوم (Jour) — jour en cours

---

## 3.3 VUE JOURNALIÈRE — Structure détaillée

### Layout général

```
┌────────────────────────────────────────────────────────────────────┐
│  ◀ الأمس   الأحد 12 أبريل 2026   غداً ▶       [أسبوع] [شهر]     │
│  [+ إضافة زيارة]              [تصفية: كل الفنيين ▼]              │
├──────────┬─────────────────┬─────────────────┬────────────────────┤
│  الوقت   │  فهد العتيبي   │  سلطان الغامدي  │  (+ إضافer فني)   │
├──────────┼─────────────────┼─────────────────┼────────────────────┤
│  06:00   │                 │                 │                    │
│  06:30   │                 │                 │                    │
│  07:00   │  ██████████     │                 │                    │
│          │  ATL-2026-0042  │                 │                    │
│          │  أحمد السلمي   │                 │                    │
│          │  زيارة ميدانية │                 │                    │
│  07:30   │  (07:00-08:30) │                 │                    │
│  08:00   │                 │  ██████████     │                    │
│  08:30   │                 │  ATL-2026-0051  │                    │
│          │                 │  خالد العتيبي  │                    │
│          │                 │  تركيب          │                    │
│  09:00   │                 │  (08:00-10:00) │                    │
│  09:30   │  ██████████     │                 │                    │
│  10:00   │  ATL-2026-0038  │                 │                    │
│  ...     │  ...            │  ...            │                    │
│  16:00   │                 │                 │                    │
│  16:30   │                 │  ██████████     │                    │
│  17:00   │                 │  ATL-2026-0067  │                    │
└──────────┴─────────────────┴─────────────────┴────────────────────┘
```

### Colonne "الوقت"
- Affiche les heures de **06:00 à 17:00**
- Chaque heure affichée avec une ligne horizontale de séparation
- Les demi-heures (X:30) affichées en trait pointillé plus discret
- **Ligne "maintenant"** : ligne rouge horizontale indiquant l'heure actuelle (si vue du jour en cours)

### Colonnes agents
- Une colonne par **agent terrain actif**
- Possibilité de masquer/afficher certains agents via le filtre
- Si > 3 agents : scroll horizontal

---

## 3.4 Carte de rendez-vous (Bloc événement)

Chaque visite planifiée est représentée par un **bloc coloré** dans la grille.

### Contenu du bloc

```
┌───────────────────────────────────┐
│  🔵 زيارة ميدانية                 │
│  ATL-2026-0042                    │
│  أحمد السلمي                      │
│  07:00 — 08:30                    │
│  📍 حي النرجس، الرياض             │
└───────────────────────────────────┘
```

- Hauteur proportionnelle à la durée (1 heure = X pixels)
- Couleur selon le type de visite (voir section 3.5)
- Si le bloc est trop petit : afficher seulement le numéro `ATL-XXXX` + nom client

### Comportement au clic sur un bloc
Ouverture d'un **popup détaillé** :

```
┌─────────────────────────────────────────────────────────────┐
│  زيارة ميدانية — ATL-2026-0042                             │
│  ───────────────────────────────────────────────────────    │
│  👤 العميل : أحمد السلمي                                   │
│  📱 الجوال : +966 5X XXX XXXX  [📞] [💬]                  │
│  📅 الموعد : الأحد 12 أبريل — 07:00 → 08:30               │
│  ⏱️ المدة : ساعة ونصف                                      │
│  📍 الموقع : حي النرجس، شارع الأمير سلطان                  │
│  [🗺️ فتح الخريطة]  [🧭 اتجاهات]                          │
│  ───────────────────────────────────────────────────────    │
│  📐 التصميم : مقوس — كبير — معلقة — بيج رملي              │
│  👷 الفني : فهد العتيبي                                     │
│  📝 ملاحظات : "الوصول من الباب الخلفي"                    │
│  ───────────────────────────────────────────────────────    │
│  الحالة : قادمة 🔵                                         │
│  [✅ تأكيد الإنجاز]  [🕐 تأجيل]  [❌ إلغاء]  [✏️ تعديل] │
└─────────────────────────────────────────────────────────────┘
```

---

## 3.5 Codes couleur des visites

| Couleur | Type | Libellé AR |
|---|---|---|
| 🔵 Bleu | Visite de mesure terrain | زيارة ميدانية |
| 🟢 Vert | Installation planifiée | تركيب مجدول |
| 🟡 Ambre | Visite reportée | زيارة مرجأة |
| 🔴 Rouge | Visite annulée | زيارة ملغاة |
| 🟣 Violet | Suivi SAV / Garantie | متابعة ضمان |
| ⚫ Gris | Visite terminée (passée) | زيارة مكتملة |

---

## 3.6 Formulaire de création d'une visite

Accessible via le bouton **[+ إضافة زيارة]** en haut du calendrier,
ou via le **clic sur un créneau vide** dans la grille.

```
┌─────────────────────────────────────────────────────────────┐
│  إضافة زيارة جديدة                                          │
│  ───────────────────────────────────────────────────────    │
│  نوع الزيارة *        [زيارة ميدانية ▼]                    │
│  الطلب المرتبط *      [بحث ATL-XXXX أو اسم العميل...]     │
│  التاريخ *            [📅 اختر التاريخ]                    │
│  وقت البداية *        [07:00 ▼]  (من 06:00 إلى 17:00)     │
│  المدة المتوقعة *     [ساعة ▼] [30 دقيقة ▼]               │
│  الفني المكلف *       [فهد العتيبي ▼]                      │
│  ملاحظات للفني        [حقل نص حر...]                       │
│  ───────────────────────────────────────────────────────    │
│  إشعار للفني :        [✅ إرسال إشعار واتساب فوري]         │
│  ───────────────────────────────────────────────────────    │
│                    [إلغاء]        [💾 حفظ الموعد]          │
└─────────────────────────────────────────────────────────────┘
```

**Validations :**
- Le créneau choisi doit être dans la plage 06:00–17:00
- Alerte si le technicien a déjà un rendez-vous sur ce créneau (conflit)
- Le champ "الطلب المرتبط" est obligatoire — recherche par `ATL-XXXX` ou nom client

---

## 3.7 Panneau latéral "ملخص اليوم" (Résumé du jour)

Panneau fixe à droite de la vue journalière :

```
┌────────────────────────────────────┐
│  ملخص اليوم — 12 أبريل 2026       │
├────────────────────────────────────┤
│  إجمالي الزيارات : 8              │
│  ✅ مكتملة : 3                    │
│  🔵 قادمة : 4                     │
│  🔴 ملغاة : 1                     │
├────────────────────────────────────┤
│  الزيارات القادمة :               │
│                                    │
│  🕙 10:00 — فهد                   │
│  ATL-2026-0055 — سامي الحربي     │
│  زيارة ميدانية                    │
│  [📍] [فتح]                       │
│                                    │
│  🕛 12:00 — سلطان                 │
│  ATL-2026-0061 — نواف العنزي     │
│  تركيب                            │
│  [📍] [فتح]                       │
│                                    │
│  🕓 15:30 — فهد                   │
│  ATL-2026-0043 — ماجد السبيعي    │
│  متابعة ضمان                      │
│  [📍] [فتح]                       │
├────────────────────────────────────┤
│  [📅 عرض الأسبوع الكامل]          │
└────────────────────────────────────┘
```

---

## 3.8 VUE HEBDOMADAIRE — Structure

- 7 colonnes (Dim → Sam) — أحد إلى سبت
- Chaque colonne affiche les événements du jour en blocs compacts
- Clic sur un jour → bascule automatiquement sur la vue journalière de ce jour
- Compteur en haut de chaque colonne : nombre de visites du jour

```
      أحد   إثنين  ثلاثاء  أربعاء  خميس   جمعة   سبت
       12     13     14      15      16     17     18
       (4)    (6)    (3)     (7)     (5)    (2)    (1)
       [blocs visites...]
```

---

## 3.9 VUE MENSUELLE — Structure

- Grille 7 colonnes × 4-5 lignes
- Chaque case affiche :
  - Le numéro du jour
  - Un compteur "X زيارة" avec code couleur (vert si normal, ambre si chargé, rouge si surchargé)
  - Les 2-3 premiers événements en miniature
  - Un lien "+N autres" si > 3 événements

```
┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐
│  أحد │ إثنين│ثلاثاء│أربعاء│ خميس │ جمعة │ سبت  │
├──────┼──────┼──────┼──────┼──────┼──────┼──────┤
│  6   │  7   │  8   │  9   │  10  │  11  │  12  │
│ 2 زيارة│4 زيارة│1 زيارة│6 زيارة│3 زيارة│ فارغ│4 زيارة│
└──────┴──────┴──────┴──────┴──────┴──────┴──────┘
```

---

## 3.10 Règles métier de l'agenda

| Règle | Détail |
|---|---|
| **Plage horaire** | Aucune visite ne peut être planifiée avant 06:00 ou après 17:00 |
| **Durée minimale** | 30 minutes par visite |
| **Durée maximale** | 4 heures par visite |
| **Conflit d'agenda** | Alerte si un agent a déjà une visite sur le même créneau |
| **Délai minimum** | Une visite doit être planifiée au minimum 1 heure à l'avance |
| **Notification agent** | Envoi automatique WhatsApp lors de la création ou modification d'une visite |
| **Clôture automatique** | Si une visite n'est pas marquée "مكتملة" 2h après l'heure de fin → alerte admin |

---

## 3.11 Intégration avec les autres modules

| Action dans الأجندة | Impact sur autres modules |
|---|---|
| Création d'une visite | → Notification agent terrain (panel mobile) |
| Visite marquée "مكتملة" | → Mise à jour statut commande dans الطلبات |
| Annulation d'une visite | → Notification admin + historique client dans العملاء |
| Mesures saisies par l'agent | → Apparaît dans onglet المواعيد de la fiche client |
| Fin d'installation confirmée | → Déclenchement automatique du bot post-installation |

---

*Document — مظلات الأطلسي — Admin Dashboard Spec v1.0*
