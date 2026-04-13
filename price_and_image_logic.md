# price_and_image_logic.md
# مظلات الأطلسي — منطق حساب السعر + اسم الصورة النهائية

---

## 1. ربط اختيارات العميل بالموديل الصحيح

```
design  + size   + fixation  →  رمز الموديل
──────────────────────────────────────────────────────
sahra   + single + (없음)    →  ATL-1S
sahra   + double + (없음)    →  ATL-1B

malaki  + single + wall      →  ATL-2S-H
malaki  + double + wall      →  ATL-2B-H
malaki  + single + column    →  ATL-2S-C
malaki  + double + column    →  ATL-2B-C

neom    + single + wall      →  ATL-3S-H
neom    + double + wall      →  ATL-3B-H
neom    + single + column    →  ATL-3S-C
neom    + double + column    →  ATL-3B-C
```

> ⚠️ sahra لا تمر بخطوة التثبيت — fixation = none دائماً

---

## 2. تأثير اللون على جودة الضمان والسعر

```
beige (ذهبي) = الأعلى جودة — ضمان 38 شهر → السعر الأقصى
noir  (أسود) = الأقل جودة  — ضمان سنة     → السعر الأدنى
```

---

## 3. جدول الأسعار الكامل — حسب كل اختيار

### صيغة حساب السعر المعروض للعميل

```javascript
// السعر المعروض = نطاق بين الأدنى والأقصى
// beige → السعر الأقصى من النطاق
// noir  → السعر الأدنى من النطاق

function getDisplayPrice(design, size, fixation, color) {
  const model = getModel(design, size, fixation);
  const range = PRICES[model];
  if (color === 'beige') {
    return `${range.min} إلى ${range.max} ريال (ذهبي — ضمان 38 شهر)`;
  } else {
    return `${range.min} إلى ${range.max} ريال (أسود — ضمان سنة)`;
  }
}
```

---

### 🏜️ صحراء (sahra) — ATL-1

| الاختيار | رمز الموديل | تكلفة المواد | beige (ضمان 38 شهر) | noir (ضمان سنة) | سعر البيع المعروض |
|---|---|---|---|---|---|
| sahra + single | ATL-1S | 1,680 ر | 1,680 ر | 1,008 ر | **من 1,290 إلى 1,790 ريال** |
| sahra + double | ATL-1B | 2,236 ر | 2,236 ر | 1,565 ر | **من 1,999 إلى 2,599 ريال** |

> ⚠️ ATL-1S استثناء: معامل الجودة الأدنى = 60% (وليس 70% كالباقي)

---

### 👑 ملكي (malaki) — ATL-2

| الاختيار | رمز الموديل | تكلفة المواد | beige (38 شهر) | noir (سنة) | سعر البيع المعروض |
|---|---|---|---|---|---|
| malaki + single + wall | ATL-2S-H | 976 ر | 976 ر | 683 ر | **من 1,499 إلى 1,899 ريال** |
| malaki + double + wall | ATL-2B-H | 1,715 ر | 1,715 ر | 1,200 ر | **من 1,999 إلى 2,599 ريال** |
| malaki + single + column | ATL-2S-C | 1,354 ر | 1,354 ر | 948 ر | **من 1,999 إلى 2,399 ريال** |
| malaki + double + column | ATL-2B-C | 2,160 ر | 2,160 ر | 1,512 ر | **من 2,399 إلى 2,999 ريال** |

---

### ✨ نيوم (neom) — ATL-3

| الاختيار | رمز الموديل | تكلفة المواد | beige (38 شهر) | noir (سنة) | سعر البيع المعروض |
|---|---|---|---|---|---|
| neom + single + wall | ATL-3S-H | 670 ر | 670 ر | 469 ر | **999 ريال (سعر ثابت)** |
| neom + double + wall | ATL-3B-H | 1,090 ر | 1,090 ر | 763 ر | **من 1,299 إلى 1,699 ريال** |
| neom + single + column | ATL-3S-C | 1,140 ر | 1,140 ر | 798 ر | **من 1,299 إلى 1,699 ريال** |
| neom + double + column | ATL-3B-C | 2,080 ر | 2,080 ر | 1,456 ر | **من 1,899 إلى 2,599 ريال** |

> ⚠️ neom + single + wall = سعر ثابت 999 ريال بغض النظر عن اللون

---

## 4. كود JavaScript الكامل — PRICES object

```javascript
const PRICES = {

  // ── صحراء (sahra) ──────────────────────────────────────────
  'ATL-1S': {
    model:    'ATL-1S',
    cost:     1680,
    beige:    { quality: 'ضمان 38 شهر', cost: 1680 },
    noir:     { quality: 'ضمان سنة',    cost: 1008 },  // ×60% (استثناء)
    sellMin:  1290,
    sellMax:  1790,
    fixed:    false
  },

  'ATL-1B': {
    model:    'ATL-1B',
    cost:     2236,
    beige:    { quality: 'ضمان 38 شهر', cost: 2236 },
    noir:     { quality: 'ضمان سنة',    cost: 1565 },  // ×70%
    sellMin:  1999,
    sellMax:  2599,
    fixed:    false
  },

  // ── ملكي (malaki) ───────────────────────────────────────────
  'ATL-2S-H': {
    model:    'ATL-2S-H',
    cost:     976,
    beige:    { quality: 'ضمان 38 شهر', cost: 976  },
    noir:     { quality: 'ضمان سنة',    cost: 683  },
    sellMin:  1499,
    sellMax:  1899,
    fixed:    false
  },

  'ATL-2B-H': {
    model:    'ATL-2B-H',
    cost:     1715,
    beige:    { quality: 'ضمان 38 شهر', cost: 1715 },
    noir:     { quality: 'ضمان سنة',    cost: 1200 },
    sellMin:  1999,
    sellMax:  2599,
    fixed:    false
  },

  'ATL-2S-C': {
    model:    'ATL-2S-C',
    cost:     1354,
    beige:    { quality: 'ضمان 38 شهر', cost: 1354 },
    noir:     { quality: 'ضمان سنة',    cost: 948  },
    sellMin:  1999,
    sellMax:  2399,
    fixed:    false
  },

  'ATL-2B-C': {
    model:    'ATL-2B-C',
    cost:     2160,
    beige:    { quality: 'ضمان 38 شهر', cost: 2160 },
    noir:     { quality: 'ضمان سنة',    cost: 1512 },
    sellMin:  2399,
    sellMax:  2999,
    fixed:    false
  },

  // ── نيوم (neom) ─────────────────────────────────────────────
  'ATL-3S-H': {
    model:    'ATL-3S-H',
    cost:     670,
    beige:    { quality: 'ضمان 38 شهر', cost: 670  },
    noir:     { quality: 'ضمان سنة',    cost: 469  },
    sellMin:  999,
    sellMax:  999,
    fixed:    true   // ← سعر ثابت 999 ريال
  },

  'ATL-3B-H': {
    model:    'ATL-3B-H',
    cost:     1090,
    beige:    { quality: 'ضمان 38 شهر', cost: 1090 },
    noir:     { quality: 'ضمان سنة',    cost: 763  },
    sellMin:  1299,
    sellMax:  1699,
    fixed:    false
  },

  'ATL-3S-C': {
    model:    'ATL-3S-C',
    cost:     1140,
    beige:    { quality: 'ضمان 38 شهر', cost: 1140 },
    noir:     { quality: 'ضمان سنة',    cost: 798  },
    sellMin:  1299,
    sellMax:  1699,
    fixed:    false
  },

  'ATL-3B-C': {
    model:    'ATL-3B-C',
    cost:     2080,
    beige:    { quality: 'ضمان 38 شهر', cost: 2080 },
    noir:     { quality: 'ضمان سنة',    cost: 1456 },
    sellMin:  1899,
    sellMax:  2599,
    fixed:    false
  }
};
```

---

## 5. دوال الحساب الكاملة

```javascript
// ── الخطوة 1: تحديد رمز الموديل من اختيارات العميل ──────────

function getModelCode(design, size, fixation) {
  const map = {
    'sahra-single':          'ATL-1S',
    'sahra-double':          'ATL-1B',
    'malaki-single-wall':    'ATL-2S-H',
    'malaki-double-wall':    'ATL-2B-H',
    'malaki-single-column':  'ATL-2S-C',
    'malaki-double-column':  'ATL-2B-C',
    'neom-single-wall':      'ATL-3S-H',
    'neom-double-wall':      'ATL-3B-H',
    'neom-single-column':    'ATL-3S-C',
    'neom-double-column':    'ATL-3B-C'
  };

  const key = design === 'sahra'
    ? `${design}-${size}`
    : `${design}-${size}-${fixation}`;

  return map[key] || null;
}


// ── الخطوة 2: حساب السعر المعروض ────────────────────────────

function calculatePrice(design, size, fixation, color) {
  const modelCode = getModelCode(design, size, fixation);
  if (!modelCode) return null;

  const model = PRICES[modelCode];

  // سعر ثابت (ATL-3S-H = neom + single + wall)
  if (model.fixed) {
    return {
      modelCode,
      displayText: '999 ريال',
      min: 999,
      max: 999,
      qualityNote: model[color].quality,
      fixed: true
    };
  }

  return {
    modelCode,
    displayText: `من ${model.sellMin} إلى ${model.sellMax} ريال`,
    min: model.sellMin,
    max: model.sellMax,
    qualityNote: model[color].quality,
    fixed: false
  };
}


// ── الخطوة 3: اسم الصورة النهائية ───────────────────────────

function getImageName(design, size, fixation, color) {
  if (design === 'sahra') {
    return `sahra_${size}_${color}.jpg`;
  }
  return `${design}_${size}_${fixation}_${color}.jpg`;
}


// ── الخطوة 4: عرض كل شيء في الواجهة ─────────────────────────

function displaySummary() {
  const { design, size, fixation, color } = state;

  const price     = calculatePrice(design, size, fixation, color);
  const imageName = getImageName(design, size, fixation, color);

  // --- عرض الصورة
  document.getElementById('final-image').src = `images/${imageName}`;
  document.getElementById('image-name-debug').innerText = imageName; // للتطوير فقط

  // --- عرض السعر
  if (price.fixed) {
    document.getElementById('price-display').innerHTML =
      `<strong>999 ريال</strong>`;
  } else {
    document.getElementById('price-display').innerHTML =
      `سيكون السعر في حدود <strong>${price.min}</strong> إلى <strong>${price.max}</strong> ريال`;
  }

  // --- عرض ملاحظة الجودة
  document.getElementById('quality-note').innerText =
    `الخامة المعتمدة: ${color === 'beige' ? 'ذهبي' : 'أسود'} — ${price.qualityNote}`;

  // --- عرض رمز الموديل (للأدمين)
  document.getElementById('model-code').innerText = price.modelCode;
}
```

---

## 6. النص الكامل المعروض للعميل في الملخص

### النص الثابت
```
حسب التفاصيل التي اخترتها، سيكون السعر في حدود X إلى Y ريال،
وذلك وفقًا للخامة المعتمدة ({ذهبي أو أسود} — {ضمان 38 شهر أو سنة}).
وبعد زيارة المندوب ورفع القياسات اللازمة، سيتم تزويدك بالمبلغ النهائي بشكل دقيق.
```

### مثال لكل اختيار
```
sahra + single + beige:
"سيكون السعر في حدود 1,290 إلى 1,790 ريال — خامة ذهبي — ضمان 38 شهر"
الصورة: sahra_single_beige.jpg

malaki + double + column + noir:
"سيكون السعر في حدود 2,399 إلى 2,999 ريال — خامة أسود — ضمان سنة"
الصورة: malaki_double_column_noir.jpg

neom + single + wall + beige:
"السعر: 999 ريال — خامة ذهبي — ضمان 38 شهر"
الصورة: neom_single_wall_beige.jpg
```

---

## 7. جدول شامل — كل اختيار + صورته + سعره

| design | size | fixation | color | اسم الصورة | سعر البيع |
|---|---|---|---|---|---|
| sahra | single | — | beige | `sahra_single_beige.jpg` | 1,290 – 1,790 ر |
| sahra | single | — | noir | `sahra_single_noir.jpg` | 1,290 – 1,790 ر |
| sahra | double | — | beige | `sahra_double_beige.jpg` | 1,999 – 2,599 ر |
| sahra | double | — | noir | `sahra_double_noir.jpg` | 1,999 – 2,599 ر |
| malaki | single | wall | beige | `malaki_single_wall_beige.jpg` | 1,499 – 1,899 ر |
| malaki | single | wall | noir | `malaki_single_wall_noir.jpg` | 1,499 – 1,899 ر |
| malaki | single | column | beige | `malaki_single_column_beige.jpg` | 1,999 – 2,399 ر |
| malaki | single | column | noir | `malaki_single_column_noir.jpg` | 1,999 – 2,399 ر |
| malaki | double | wall | beige | `malaki_double_wall_beige.jpg` | 1,999 – 2,599 ر |
| malaki | double | wall | noir | `malaki_double_wall_noir.jpg` | 1,999 – 2,599 ر |
| malaki | double | column | beige | `malaki_double_column_beige.jpg` | 2,399 – 2,999 ر |
| malaki | double | column | noir | `malaki_double_column_noir.jpg` | 2,399 – 2,999 ر |
| neom | single | wall | beige | `neom_single_wall_beige.jpg` | **999 ر (ثابت)** |
| neom | single | wall | noir | `neom_single_wall_noir.jpg` | **999 ر (ثابت)** |
| neom | single | column | beige | `neom_single_column_beige.jpg` | 1,299 – 1,699 ر |
| neom | single | column | noir | `neom_single_column_noir.jpg` | 1,299 – 1,699 ر |
| neom | double | wall | beige | `neom_double_wall_beige.jpg` | 1,299 – 1,699 ر |
| neom | double | wall | noir | `neom_double_wall_noir.jpg` | 1,299 – 1,699 ر |
| neom | double | column | beige | `neom_double_column_beige.jpg` | 1,899 – 2,599 ر |
| neom | double | column | noir | `neom_double_column_noir.jpg` | 1,899 – 2,599 ر |

---

## 8. ملاحظات مهمة للمطور

```
1. neom + single + wall → سعر ثابت 999 ريال (لا يتغير بتغيير اللون)
2. sahra + single + noir → معامل الجودة 60% (استثناء — الباقي كلهم 70%)
3. sahra لا تمر بخطوة التثبيت (fixation = none تلقائياً)
4. اللون الافتراضي عند تحميل الصفحة = beige
5. سعر البيع = نطاق ثابت من الجدول (لا يتغير بتغيير اللون — فقط ملاحظة الجودة تتغير)
6. الصورة = المتغير الوحيد الذي يتغير مع اللون في كل الخطوات
```
