# 🎨 Guide de Design — مظلات الأطلسي
### Description visuelle complète pour le développeur

---

## 🧠 L'âme du design — avant tout

> Imagine que tu entres dans un **showroom de voitures de luxe la nuit**.
> Lumières tamisées, sol en marbre noir, spots dorés qui éclairent les voitures.
> C'est exactement cette sensation que le site doit donner.
>
> **Noir profond. Or et beige qui brillent dans le noir. Aucun élément inutile.**

Le visiteur doit ressentir : **confiance, luxe, simplicité**.
Il ne doit jamais se sentir perdu. Chaque écran doit lui donner envie d'aller à l'écran suivant.

---

## 🎨 Les couleurs — utilisation exacte

```
Fond principal     →  #0A0A0A  (noir très profond, jamais blanc)
Fond des cartes    →  #141414  (légèrement plus clair que le fond)
Fond hover/actif   →  #1C1C1C  (encore plus clair au survol)

Beige principal    →  #C9A96E  (pour les boutons CTA, titres, accents)
Beige clair        →  #E8D5B0  (pour les textes secondaires)
Or brillant        →  #D4A843  (pour les étoiles, détails décoratifs)

Texte blanc doux   →  #F5F0E8  (jamais blanc pur #FFFFFF)
Texte gris chaud   →  #6B6355  (pour les textes discrets)
Bordures           →  rgba(201, 169, 110, 0.20)  (beige transparent, très subtil)
```

**Règle d'or :** le beige/or ne doit jamais couvrir une grande surface.
Il sert à **attirer l'œil vers ce qui est important** — les boutons, les titres, les détails.

---

## ✍️ Les polices — l'identité typographique

```
Titres principaux  →  Cairo Bold 900     (arabe, puissant et élégant)
Textes courants    →  Tajawal Regular     (arabe, lisible et moderne)
Chiffres / Prix    →  Almarai Bold        (arabe, chiffres propres et forts)
```

**Comment utiliser les titres :**
- Le titre Hero sur la page d'accueil doit être **très grand** (64px mobile, 96px desktop)
- Les titres de sections sont plus petits mais **toujours en Cairo Bold**
- Ne jamais utiliser une police fine ou légère pour les titres

---

---

# 🏠 Page d'Accueil — Description section par section

---

## Section 1 — Hero (la première chose que voit le visiteur)

**Ce qu'on voit en arrivant sur le site :**

La totalité de l'écran est occupée par cette section.
Le fond est noir absolu avec de **très fines particules dorées** qui flottent lentement vers le haut — comme de la poussière d'or dans l'air. Elles sont petites (2-3px), peu nombreuses, et ne distraient pas.

Au centre de l'écran, une **grande photo d'une مظلة** — la plus belle de votre catalogue, fond noir, prise en légère plongée. Cette image ne prend pas toute la largeur, elle est positionnée légèrement à droite de l'écran pour laisser le texte respirer à gauche.

À gauche, le texte dans cet ordre exact :

```
[petit badge en haut]
✦  مظالت الأطلسي

[titre principal — très grand]
احمِ سيارتك
بأسلوب لا يُنسى

[sous-titre discret]
مظالت فاخرة مُصنَّعة بأعلى المواصفات
التركيب خلال أسبوع أو مجاناً

[deux boutons]
→  اطلب مظلتك الآن      (bouton plein, fond beige, texte noir)
→  شاهد أعمالنا ↓        (bouton vide, juste une bordure beige)
```

**L'animation quand la page se charge :**
Le texte n'apparaît pas d'un coup. Chaque ligne glisse doucement du bas vers sa position avec un léger fondu. La première ligne apparaît en premier, puis 200ms après la deuxième, etc. L'image de la مظلة apparaît en dernier avec un effet de zoom très léger (de 1.05 à 1.0).

**En bas du Hero :**
Un bandeau qui défile en boucle de gauche à droite :
```
✦ تصميم هرمي  ✦ تصميم مقوس  ✦ تصميم كابولي  ✦ ضمان 5 سنوات  ✦ تابي / تمارا  ✦
```
Texte beige clair, fond noir légèrement plus clair, séparateurs dorés (✦).

---

## Section 2 — Bandeau de confiance (juste sous le Hero)

4 chiffres/informations en ligne horizontale, séparés par de fines lignes verticales beige.

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│              │              │              │              │
│    247+      │  5 سنوات     │   999 ريال   │  تقسيط       │
│  مشروع منجز  │    ضمان      │   ابتداءً    │  بلا فوائد   │
│              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

Les chiffres sont en **Almarai Bold, grande taille, couleur beige**.
Les labels sont petits, gris clair.
Quand le visiteur fait défiler jusqu'ici, les chiffres comptent depuis zéro jusqu'à leur valeur finale (animation 1.5 secondes).

Fond de ce bandeau : #141414 avec une bordure supérieure et inférieure beige très subtile (opacity 0.15).

---

## Section 3 — Nos Designs (la section la plus importante)

**Titre de section — style uniforme pour toutes les sections :**
```
                    ✦  اختر تصميمك  ✦
            ──────────────────────────────
         تصاميمنا مُصنَّعة يدوياً بأعلى جودة
```
Le ✦ est en or (#D4A843). La ligne horizontale est en dégradé : transparent → beige → transparent.
Le sous-titre est petit, gris, centré.

**Les 3 cartes de design — layout horizontal, défilable sur mobile :**

Chaque carte occupe environ 30% de la largeur (sur desktop). Sur mobile, chaque carte fait 85% de la largeur et on swipe horizontalement.

**Anatomie d'une carte :**

```
┌─────────────────────────────────┐
│                                 │
│   [Photo de la مظلة             │
│    fond noir, cadrée proprement,│
│    hauteur fixe : 280px]        │
│                                 │
│  ┌───────────────────────────┐  │
│  │  01                       │  │
│  │  ──────────────           │  │
│  │  التصميم الهرمي           │  │
│  │                           │  │
│  │  سقف مثلثي حديث ومميز    │  │
│  │  مثالي للمساحات الواسعة   │  │
│  │                           │  │
│  │  ● ● ●  ← couleurs dispo  │  │
│  │                           │  │
│  │  [  اطلب هذا التصميم  →  ]│  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

Fond de la carte : #141414
Bordure : 1px beige opacity 20%
Corner radius : 20px

**Ce qui se passe au survol (hover) :**
- La carte se soulève légèrement (translateY -8px)
- La bordure devient plus lumineuse (opacity passe à 60%)
- Un halo beige très subtil apparaît en dessous (box-shadow)
- La photo se zoom légèrement (scale 1.03)
Tout ça en 300ms, transition douce.

**Les petits cercles de couleurs** sous la description :
3 petits cercles (16px) côte à côte — beige sable, gris clair, blanc cassé.
Au clic, la **photo de la carte change** avec un fondu (l'image se flou légèrement puis redevient nette avec la nouvelle couleur). Ce n'est pas une rechargement de page, c'est instantané.

**La carte active (choisie) :**
Bordure beige complètement opaque + une petite coche ✓ dorée en haut à droite.

---

## Section 4 — Comment ça marche (processus en 4 étapes)

**Concept :** Une ligne horizontale qui relie 4 étapes. Sur mobile, ça devient vertical.

```

   ●──────────────●──────────────●──────────────●
   
  اختر تصميمك   حدد موقعك    مندوبنا يزورك   التركيب
  
  في 3 دقائق    GPS تلقائي    خلال 12 ساعة   7 أيام أو مجاناً

```

Chaque point (●) est un cercle avec un numéro dedans. Les points complétés sont en beige plein. Le point courant pulse doucement (animation répétée, échelle 1.0 → 1.2 → 1.0).

La ligne qui relie les points est en dégradé : elle commence transparente et devient progressivement beige, comme si elle se "remplissait" de gauche à droite quand la section arrive à l'écran.

---

## Section 5 — Galerie de réalisations

**Concept :** Une grille irrégulière (Masonry) de vraies photos de vos projets.

Les photos sont de tailles différentes — certaines larges, certaines hautes, certaines carrées. Elles sont disposées de façon à remplir l'espace sans espaces vides.

```
┌──────────────────┬──────────┬────────────────┐
│                  │          │                │
│  [grande photo]  │ [petite] │  [moyenne]     │
│                  │          │                │
├──────┬───────────┤ [petite] ├────────────────┤
│[pet.]│ [moyenne] │          │  [grande]      │
└──────┴───────────┴──────────┴────────────────┘
```

**Au survol d'une photo :**
Un voile noir semi-transparent apparaît sur l'image avec le texte :
```
التصميم الهرمي
الرياض، حي النرجس
```
Et une petite icône loupe au centre. Un clic ouvre la photo en plein écran (lightbox).

**Filtre au-dessus de la galerie :**
```
[الكل]  [هرمي]  [مقوس]  [كابولي]  [معلق]  [أعمدة]
```
Des boutons pill (arrondis). Le bouton actif a un fond beige et texte noir. Les autres ont fond transparent et texte gris. Quand on change de filtre, les photos disparaissent et les nouvelles apparaissent avec une animation de fondu.

---

## Section 6 — Prix et offres

**Deux cartes côte à côte :**

**Carte gauche** (Taille Petite) — style normal :
```
┌────────────────────────┐
│                        │
│  الحجم الصغير          │
│  للسيدان               │
│  كامري ● التيما ● أكورد│
│                        │
│  ─────────────────     │
│        999 ريال        │
│    الدفعة الأولى       │
│  ─────────────────     │
│                        │
│  ✓ تركيب مجاني         │
│  ✓ ضمان 5 سنوات        │
│  ✓ تقسيط بلا فوائد     │
│                        │
│  [  اطلب الآن  →  ]    │
└────────────────────────┘
```

**Carte droite** (Taille Grande) — style premium, plus grande visuellement :
```
┌────────────────────────┐
│  ⭐ الأكثر طلباً        │  ← badge en haut
│                        │
│  الحجم الكبير          │
│  للـ SUV               │
│  باترول ● لاندكروز     │
│                        │
│  ─────────────────     │
│      1,299 ريال        │
│    الدفعة الأولى       │
│  ─────────────────     │
│                        │
│  ✓ تركيب مجاني         │
│  ✓ ضمان 5 سنوات        │
│  ✓ زيارة قياس مجانية   │
│                        │
│  [  اطلب الآن  →  ]    │
└────────────────────────┘
```

La carte premium a une **bordure animée** : un reflet lumineux beige qui tourne en continu autour de la carte (rotation 360° en 4 secondes). C'est subtil, pas agressif. Ça attire l'œil vers cette carte.

**Sous les deux cartes :**
```
[logo tabby]  [logo tamara]
قسّط على 4 دفعات بلا فوائد
```

---

## Section 7 — Avis clients

3 témoignages qui défilent automatiquement (toutes les 5 secondes).

```
        ❝

   المظلة فاقت توقعاتي، التركيب كان نظيف
   ومحترف والمندوب كان محترم جداً.
   أنصح الكل بمظالت الأطلسي!

        ❞

        ─────────────────────
        محمد العتيبي  ★★★★★
        الرياض
        ─────────────────────

           ○ ○ ● ○ ○
```

Les guillemets ❝ ❞ sont grands, en beige opacity 30%, ils servent de décoration.
Les étoiles sont en or (#D4A843).
Les points en bas indiquent quel témoignage est affiché.
La transition entre témoignages : fondu croisé (0.6 secondes).

---

## Section 8 — CTA Final (avant le footer)

Une section avec une **grande image de fond** (une de vos plus belles مظلة) avec un voile noir 70% par dessus.

Au centre :
```
          احجز مظلتك اليوم

   التركيب خلال أسبوع أو مجاناً

   ┌──────────────────────────────┐
   │  أدخل رقم جوالك للبدء        │
   │  [ 05 _ _ _ _ _ _ _ _ ]     │
   │  [    ابدأ الآن  →    ]      │
   └──────────────────────────────┘

   أو تواصل عبر  [واتساب]  [اتصال]
```

Le champ de saisie est centré, fond #1C1C1C, bordure beige, texte blanc.
Le bouton "ابدأ الآن" est en fond beige plein, texte noir, bien large et haut (56px).

---

---

# 📋 Les Étapes de Commande — Wizard Design

## Principes généraux du Wizard

**Fond de toutes les étapes :** #0A0A0A (identique au site)
**La barre de progression en haut — elle est toujours visible :**

```
  [1]──────[2]──────[3]──────[4]──────[5]──────[6]──────[7]
   ●        ○        ○        ○        ○        ○        ○

  بياناتك  التصميم  الحجم  التثبيت  الألوان  تأكيد   موقعك
```

- Les cercles complétés : fond beige, coche ✓ blanche
- Le cercle actuel : fond beige, chiffre blanc, légèrement plus grand
- Les cercles futurs : fond transparent, bordure grise, chiffre gris
- La ligne entre les cercles se remplit en beige au fur et à mesure

**Transition entre les étapes :**
Quand on clique "التالي", l'écran actuel part vers la gauche (slide out) et le nouvel écran arrive depuis la droite (slide in). En RTL c'est l'inverse. Durée : 350ms, courbe douce.

---

## Étape 1 — Données du client

Fond noir avec un léger motif géométrique très discret (lignes diagonales opacity 3%). Au centre de l'écran :

```
         ✦  أهلاً بك في مظالت الأطلسي  ✦

      سنساعدك في تصميم مظلتك المثالية
           في أقل من 3 دقائق


   ┌───────────────────────────────────────┐
   │  👤  اسمك الكريم                      │
   │  ─────────────────────────────────── │
   │                                       │
   └───────────────────────────────────────┘

   ┌───────────────────────────────────────┐
   │  📱  رقم جوالك                        │
   │  ─────────────────────────────────── │
   │                                       │
   └───────────────────────────────────────┘


         [  ابدأ رحلة التصميم  →  ]


    🔒  بياناتك محمية ولن تُشارَك مع أي جهة
```

**Les champs de saisie :**
- Fond #141414, pas de fond blanc
- Bordure inférieure seulement (pas de bordure tout autour) — style underline
- Quand le champ est actif (focus) : la bordure inférieure devient beige lumineuse avec une animation
- Le texte saisi est blanc doux (#F5F0E8)
- Le placeholder est gris (#6B6355)

**Le bouton "ابدأ" :**
- Il est gris et désactivé au début
- Quand les deux champs sont remplis, il "s'allume" avec une animation : fond gris → fond beige, avec une légère vibration (scale 1.0 → 1.04 → 1.0)

---

## Étape 2 — Choix du design

En haut : le titre centré
```
         اختر التصميم الذي يناسب ذوقك
         ─────────────────────────────
```

Dessous, les 3 cartes côte à côte (desktop) ou en scroll horizontal (mobile).

**Anatomie exacte d'une carte design :**

La carte fait environ 300px × 420px sur desktop.
Fond #141414. Coins arrondis 20px.

En haut de la carte : **la photo du produit** (hauteur 220px, object-fit cover).
La photo est cadrée sur la مظلة, fond le plus neutre possible.
Pas de bord blanc autour de la photo.

En bas de la carte : zone de texte avec padding 20px.
```
  01
  ──────────────
  التصميم الهرمي

  سقف مثلثي حديث، مثالي
  للمساحات الواسعة

  [bouton "معاينة ↗" très petit, discret]

  [  اطلب هذا التصميم  →  ]
```

Le numéro "01" est en très grand (48px), beige opacity 30%, il sert de décoration.
Le nom "التصميم الهرمي" est en Cairo Bold, blanc, 20px.
La description est en Tajawal, gris clair, 14px.

**Au survol :** la carte monte légèrement, bordure beige s'illumine.
**Après sélection :** une coche dorée ✓ apparaît en haut à droite de la carte avec un petit "pop" (scale 0 → 1.2 → 1.0).

**Bouton "معاينة" :**
Ouvre un panneau latéral (drawer) depuis le bas sur mobile, depuis la droite sur desktop.
Dedans : galerie de 4-5 photos du design, description longue, caractéristiques techniques.
Fond #0D0D0D, le reste identique au style du site.

---

## Étape 3 — Taille

Deux grandes cartes côte à côte, design plus illustratif.

Chaque carte contient en haut une **illustration SVG** : une silhouette de مظلة avec en dessous une silhouette de voiture à la bonne échelle. La carte "كبير" montre un SUV, la carte "صغير" montre une berline.

```
┌────────────────────────┐  ┌────────────────────────┐
│                        │  │                        │
│  [SVG: مظلة + SUV]     │  │  [SVG: مظلة + سيدان]  │
│                        │  │                        │
│  حجم كبير              │  │  حجم صغير              │
│  ─────────             │  │  ─────────             │
│                        │  │                        │
│  SUV ● لاندكروز        │  │  سيدان ● كامري          │
│  باترول ● تاهو         │  │  التيما ● كورولا        │
│  جيموس ● برادو         │  │  سونيك ● أكورد          │
│                        │  │                        │
│  5.5م × 3.5م           │  │  5م × 3م               │
│                        │  │                        │
└────────────────────────┘  └────────────────────────┘
```

Tout en bas, une note rassurante :
```
💡  غير متأكد من الحجم؟ مندوبنا سيقيس الموقع مجاناً
```
Texte petit, gris, centré, avec une icône ampoule beige.

---

## Étape 4 — Type de fixation

Identique à l'étape 3 mais avec de vraies photos au lieu d'illustrations SVG.

Carte gauche : une photo de مظلة معلقة (fixée au mur, sans poteaux).
Carte droite : une photo de مظلة sur أعمدة (poteaux dans le sol).

Les photos doivent être prises de façon à bien montrer la différence de fixation.

```
  معلقة                      على أعمدة
  مثبتة على الجدار           أعمدة مثبتة في الأرض
  بدون أعمدة أمامية          مناسبة للمساحات المفتوحة

  مثالية إذا كان جراجك       مثالية للمواقف المفتوحة
  ملاصقاً للجدار              والمساحات الخارجية
```

---

## Étape 5 — Les couleurs (Color Studio)

C'est l'étape la plus visuelle — elle doit être spectaculaire.

**Layout — deux zones :**

Zone gauche (60% de l'écran) : **la grande prévisualisation**
Une image de la مظلة choisie, en grand, fond noir.
Quand on change une couleur, l'image se floute légèrement (blur 4px) pendant 400ms puis redevient nette avec la nouvelle image. L'effet donne l'impression que la مظلة "se transforme".

Zone droite (40%) : **les contrôles de couleur**

```
  لون القماش
  ────────────────────────

  ○  بيج رملي
     [rectangle de couleur 60×24px]

  ○  رمادي فاتح
     [rectangle de couleur 60×24px]

  ○  أبيض نقي
     [rectangle de couleur 60×24px]


  لون الهيكل
  ────────────────────────

  ○  بيج / شامبين
     [rectangle de couleur 60×24px]

  ○  أسود فاخر
     [rectangle de couleur 60×24px]
```

Les boutons radio sont des cercles custom (pas les navigateurs standards).
Le cercle sélectionné : bordure beige + point intérieur beige.
Le label : texte blanc Cairo Medium.
Le rectangle de couleur : coin arrondi 4px, c'est juste un échantillon visuel.

**Sous les contrôles :**
```
  ✨  اختيارك الحالي:
  قماش بيج رملي + هيكل أسود فاخر
```
Ce texte se met à jour en temps réel à chaque changement.

---

## Étape 6 — Récapitulatif

**Concept :** une carte qui ressemble à un reçu de luxe — comme un bon de commande dans un hôtel 5 étoiles.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│      ✦  ملخص طلبك المبدئي  ✦                        │
│                                                     │
├────────────────────────────┬────────────────────────┤
│                            │                        │
│  [miniature de la          │  التصميم:  الهرمي      │
│   مظلة avec les            │  الحجم:    كبير        │
│   couleurs choisies]       │  التثبيت:  معلقة       │
│                            │  القماش:   بيج رملي ██ │
│                            │  الهيكل:   أسود فاخر ██│
│                            │                        │
├────────────────────────────┴────────────────────────┤
│                                                     │
│   الدفعة الأولى لحجز موعد المندوب                   │
│                                                     │
│              999 ريال                               │
│         ← الباقي يُدفع بعد التركيب                 │
│                                                     │
│         [tabby]  [tamara]                           │
│      قسّط على 4 × 250 ريال                          │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│          [  ✓  تأكيد الطلب والمتابعة  ]             │
│                                                     │
│  [✏️ تعديل]                        [✗ إلغاء]        │
└─────────────────────────────────────────────────────┘
```

La carte entière a un **reflet lumineux** qui glisse lentement de gauche à droite en boucle — comme une lumière qui passe sur une surface brillante. C'est très subtil, ça donne un aspect premium.

---

## Étape 7 — Localisation (Google Maps)

**La carte est en dark mode** — fond noir, routes en gris très foncé, noms de rues en beige/doré. Elle prend environ 60% de la hauteur de l'écran.

Le marker de position : une épingle custom, fond beige, icône maison blanche dedans. Quand il est placé, une animation de "drop" (tombe du ciel et rebondit légèrement).

Au-dessus de la carte :
```
  أين سنركّب مظلتك؟
  ─────────────────────────────────
  [ 📍  حدد موقعي تلقائياً ]
```
Le bouton de géolocalisation est centré, style "pill" (très arrondi), fond #1C1C1C, texte beige, icône pin.

Sous la carte :
```
  العنوان المحدد:
  ┌───────────────────────────────────────┐
  │  حي النرجس، الرياض، السعودية          │
  │  ← يُحدَّث تلقائياً                  │
  └───────────────────────────────────────┘

  ملاحظة للمندوب (اختياري):
  ┌───────────────────────────────────────┐
  │  قرب محطة البنزين، الباب الجانبي...   │
  └───────────────────────────────────────┘

         [  إرسال الطلب  ✓  ]
```

---

## Page de confirmation — La célébration

Fond noir avec des **confettis** qui tombent en beige, or et blanc.
Au centre, une animation de check vert qui se dessine (cercle qui se ferme + coche).

```
         🎉

    تم استلام طلبك بنجاح!

    رقم طلبك:
    ┌──────────────────────┐
    │   #ATL-2024-0247     │
    └──────────────────────┘

    احفظ هذا الرقم لمتابعة طلبك


    ✓  سيتصل بك فريقنا خلال ساعتين
    ✓  مندوبنا يزورك خلال 12 ساعة
    ✓  التركيب خلال 7 أيام
    ✓  الدفع الباقي عند التركيب فقط


    [  📲  شارك على واتساب  ]

    [  تتبع طلبك  ]    [  العودة للرئيسية  ]
```

Le numéro de commande est dans une "boîte" avec fond #1C1C1C, bordure beige, et peut être copié d'un tap.

---

---

# 📱 Règles strictes pour le mobile

```
1. Taille minimale des boutons      → hauteur 56px (tactile facile)
2. Taille minimale du texte         → 16px (évite le zoom automatique iOS)
3. Espacement entre éléments        → 16px minimum
4. Pas d'éléments côte à côte       → tout en colonne sur mobile (sauf exceptions)
5. Le Wizard a une barre fixe en bas:
   [← السابق]   ●●●●○○○   [التالي →]
   Elle est toujours visible, fond #111111
6. Les cartes de design défilent horizontalement (swipe)
7. La galerie passe en 2 colonnes (pas Masonry)
8. Les champs de formulaire : grand, clair, agréable au clavier
```

---

# 🔑 Ce qui rend ce design INOUBLIABLE

```
1. Fond noir profond — personne dans le marché des مظالت
   n'a un site avec ce niveau de sophistication

2. La preview couleur en temps réel — le client VOIT
   sa مظلة avec ses couleurs avant de commander

3. La barre de progression dans le Wizard — le client
   sait toujours où il en est, il ne se perd jamais

4. Les photos réelles du catalogue — pas d'images
   génériques, les vraies مظالت de votre portfolio

5. La carte récapitulatif façon "receipt de luxe" —
   ça donne confiance avant de payer

6. Le dark mode cohérent — chaque pixel respire
   la qualité et le luxe
```

---

*Guide de design — مظالت الأطلسي*
*Pour toute question sur ce document : adelbettaieb97@gmail.com*
