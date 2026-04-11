# apply_modifications.md
# مظلات الأطلسي — تفاصيل التعديلات الكاملة (النسخة النهائية)

---

## 1. قسم بطاقة الأطلسي الذهبية

### 1.1 حذف النصوص القديمة
- حذف: `"ألنك أصبحت من عائلة الأطلسي، خصوماتك القادمة محفوظة برقم جوالك"`
- حذف: `"برنامج الولاء الحصري لعملائنا المميزين"`

### 1.2 إضافة النص الجديد مكانها
```
تجربة تتطور معك… ومزايا ترتقي بك 🌟
كل طلب يمنحك مستوى جديد من الامتيازات،
لأنك تستحق الأفضل دائمًا مع الأطلسي.
```
- الخط: كبير، ثقيل، اتجاه RTL، لون ذهبي/كريمي على الخلفية الداكنة

---

## 2. الـ Footer

### 2.1 حذف كامل قسم "روابط سريعة"
- حذف: الرئيسية / أعمالنا / اتصل بنا

### 2.2 إضافة 3 مميزات الولاء في Footer
إضافة 3 بطاقات صغيرة في Footer بدلاً من روابط سريعة:

| الأيقونة | العنوان | الوصف |
|---|---|---|
| 📲 | إصدار تلقائي | تُرسل للعميل عبر واتساب بعد التركيب مباشرة |
| 📱 | مرتبطة برقم الجوال | الخصومات محفوظة في النظام ولا تنتهي |
| 🎁 | قابلة للإهداء | شارك رمز خصمك مع العائلة والأصدقاء |

**التصميم:** أيقونة + عنوان عريض + وصف صغير — محاذاة RTL — خلفية Footer الداكنة

---

## 3. الخطوة 2 — اختيار التصميم

### 3.1 تغيير النص
```
قبل: فضالً، اختر التصميم الرئيسي الذي يناسب واجهة بيتك ✨
بعد: فضلًا، اختر التصميم الرئيسي الذي يناسبك ✨
```

### 3.2 تغيير أسماء التصاميم
| قبل | بعد | ID في الكود |
|---|---|---|
| التصميم الهرمي | صحراء | `sahra` |
| التصميم المقوس | ملكي | `malaki` |
| كابولي بدون أعمدة | نيوم | `neom` |

### 3.3 عرض التصاميم الثلاثة بنفس الوقت (أفقي)
- عرض 3 بطاقات جانباً جنب `grid: repeat(3, 1fr)`
- كل بطاقة: صورة التصميم + اسمه + زر اختيار
- على الموبايل: بطاقتين في صف + واحدة

### 3.4 صور الخطوة 2 — تشمل اللون (beige افتراضي عند الدخول)

> اللون الافتراضي = `beige`. عند تغيير اللون في الخطوة 5 تتحدث هذه الصور تلقائياً.

**أسماء الصور (6 صور):**
```
design_sahra_beige.jpg
design_sahra_noir.jpg
design_malaki_beige.jpg
design_malaki_noir.jpg
design_neom_beige.jpg
design_neom_noir.jpg
```

```javascript
let selectedColor = 'beige'; // افتراضي

function updateDesignCards() {
  document.querySelectorAll('.design-card img').forEach(img => {
    const design = img.dataset.design; // sahra / malaki / neom
    img.src = `images/designs/design_${design}_${selectedColor}.jpg`;
  });
}
```

---

## 4. الخطوة 3 — اختيار الحجم

### 4.1 تغيير أسماء الخيارات
| قبل | بعد |
|---|---|
| حجم عائلي (SUV) 🚙 | حجم ثنائي 🚙🚙 |
| حجم عادي (سيدان) 🚗 | سيارة واحدة 🚗 |

### 4.2 حذف أمثلة السيارات
- حذف نص: `لاندكروز، باترول، تاهو`
- حذف نص: `كامري، التيما، أكورد`

### 4.3 صور الخطوة 3 — ديناميكية حسب التصميم + اللون

**أسماء الصور (12 صورة):**
```
sahra_single_beige.jpg       sahra_single_noir.jpg
sahra_double_beige.jpg       sahra_double_noir.jpg
malaki_single_beige.jpg      malaki_single_noir.jpg
malaki_double_beige.jpg      malaki_double_noir.jpg
neom_single_beige.jpg        neom_single_noir.jpg
neom_double_beige.jpg        neom_double_noir.jpg
```

```javascript
function updateSizePreview() {
  const img = `${selectedDesign}_${selectedSize}_${selectedColor}.jpg`;
  document.getElementById('size-preview').src = `images/sizes/${img}`;
}
```

---

## 5. الخطوة 4 — طريقة التثبيت

### 5.1 إخفاء الخطوة كاملاً إذا اختار صحراء
```javascript
if (selectedDesign === 'sahra') {
  document.getElementById('step-fixation').style.display = 'none';
  selectedFixation = 'none';
}
```

### 5.2 صور الخطوة 4 — ديناميكية حسب التصميم + الحجم + اللون

**أسماء الصور (16 صورة):**
```
malaki_single_wall_beige.jpg      malaki_single_wall_noir.jpg
malaki_single_column_beige.jpg    malaki_single_column_noir.jpg
malaki_double_wall_beige.jpg      malaki_double_wall_noir.jpg
malaki_double_column_beige.jpg    malaki_double_column_noir.jpg

neom_single_wall_beige.jpg        neom_single_wall_noir.jpg
neom_single_column_beige.jpg      neom_single_column_noir.jpg
neom_double_wall_beige.jpg        neom_double_wall_noir.jpg
neom_double_column_beige.jpg      neom_double_column_noir.jpg
```

```javascript
function updateFixationPreview() {
  if (selectedDesign === 'sahra') return;
  const img = `${selectedDesign}_${selectedSize}_${selectedFixation}_${selectedColor}.jpg`;
  document.getElementById('fixation-preview').src = `images/fixation/${img}`;
}
```

---

## 6. الخطوة 5 — اختيار اللون

### 6.1 ألوان القماش
| الاسم | الكود في الملفات | اللون الفعلي | Hex |
|---|---|---|---|
| ذهبي — قياسي | `beige` | بيج ذهبي | `#C9A96E` = `rgb(201,169,110)` |
| أسود | `noir` | أسود | `#1E1E1E` = `rgb(30,30,30)` |

### 6.2 كل خيار = صورة حقيقية للمظلة (وليس دائرة ملونة فقط)

### 6.3 عند النقر على لون → تحديث كل الصور في كل الخطوات فوراً

```javascript
function onColorChange(color) {
  selectedColor = color; // 'beige' أو 'noir'

  updateDesignCards();      // الخطوة 2
  updateSizePreview();      // الخطوة 3
  updateFixationPreview();  // الخطوة 4
  updateFinalPreview();     // الخطوة 5
  displayPrice();           // تحديث نطاق السعر
}

function updateFinalPreview() {
  let img;
  if (selectedDesign === 'sahra') {
    img = `sahra_${selectedSize}_${selectedColor}.jpg`;
  } else {
    img = `${selectedDesign}_${selectedSize}_${selectedFixation}_${selectedColor}.jpg`;
  }
  document.getElementById('final-preview').src = `images/final/${img}`;
}
```

---

## 7. حساب السعر

### 7.1 تغيير النص
```
قبل:
"الدفعة الأولى المطلوبة للبدء: 999 ريال فقط (متاحة للتقسيط عبر تابي/تمارا)"

بعد:
"حسب التفاصيل التي اخترتها، سيكون السعر في حدود X إلى Y ريال،
وذلك وفقًا للخامة المعتمدة (ذهبي أو أسود).
وبعد زيارة المندوب ورفع القياسات اللازمة، سيتم تزويدك بالمبلغ النهائي بشكل دقيق."
```

### 7.2 جدول الأسعار الكامل

```javascript
const PRICES = {
  sahra: {
    single: { min: 670,  max: 999  },
    double: { min: 1090, max: 1699 }
  },
  malaki: {
    single: {
      wall:   { min: 976,  max: 1899 },
      column: { min: 1354, max: 2399 }
    },
    double: {
      wall:   { min: 1715, max: 2599 },
      column: { min: 2160, max: 2999 }
    }
  },
  neom: {
    single: {
      wall:   { min: 976,  max: 1699 },
      column: { min: 1140, max: 1699 }
    },
    double: {
      wall:   { min: 1090, max: 1699 },
      column: { min: 2080, max: 2599 }
    }
  }
}

function calculatePrice(design, size, fixation) {
  if (design === 'sahra') return PRICES[design][size];
  return PRICES[design][size][fixation];
}

function displayPrice() {
  const { min, max } = calculatePrice(selectedDesign, selectedSize, selectedFixation);

  // beige = جودة عالية (ضمان 38 شهر) → السعر الأقصى
  // noir  = جودة قياسية (ضمان سنة)   → السعر الأدنى
  const qualityNote = selectedColor === 'beige'
    ? 'خامة ذهبية — ضمان 38 شهر'
    : 'خامة أسود — ضمان سنة';

  document.getElementById('price-range').innerHTML =
    `سيكون السعر في حدود <strong>${min}</strong> إلى <strong>${max}</strong> ريال`;
  document.getElementById('quality-note').innerText = qualityNote;
}
```

---

## 8. الخريطة — تغيير إلى Satellite

```javascript
const map = new google.maps.Map(document.getElementById('map'), {
  center: { lat: 24.7136, lng: 46.6753 },
  zoom: 17,
  mapTypeId: 'satellite',   // ← التغيير الوحيد
  mapTypeControl: false,
  streetViewControl: false
});
```

---

## 9. رسالة التأكيد النهائية

### 9.1 النص الجديد
```
تم استلام الموقع بنجاح ✅
الأستاذ [X] سيتواصل معك فريق خدمة الحرفاء لتحديد موعد الزيارة الميدانية.
```
> `[X]` = اسم العميل المُدخل في بداية الطلب

### 9.2 ملخص الطلب أسفل التأكيد
```
التصميم:  [صحراء / ملكي / نيوم]
الحجم:    [سيارة واحدة / حجم ثنائي]
التثبيت:  [معلقة / أعمدة / —]
اللون:    [ذهبي / أسود]
السعر:    من X إلى Y ريال
```

---

## 10. قائمة الصور الكاملة والنهائية

### القاعدة العامة للتسمية
```
{design}_{size}_{fixation}_{color}.jpg

القيم الممكنة:
  design   → sahra | malaki | neom
  size     → single | double
  fixation → wall | column | (بدون — فقط لصحراء)
  color    → beige | noir
```

---

### مجلد 1 — `/images/designs/` — 6 صور
```
design_sahra_beige.jpg        design_sahra_noir.jpg
design_malaki_beige.jpg       design_malaki_noir.jpg
design_neom_beige.jpg         design_neom_noir.jpg
```

### مجلد 2 — `/images/sizes/` — 12 صورة
```
sahra_single_beige.jpg        sahra_single_noir.jpg
sahra_double_beige.jpg        sahra_double_noir.jpg
malaki_single_beige.jpg       malaki_single_noir.jpg
malaki_double_beige.jpg       malaki_double_noir.jpg
neom_single_beige.jpg         neom_single_noir.jpg
neom_double_beige.jpg         neom_double_noir.jpg
```

### مجلد 3 — `/images/fixation/` — 16 صورة
```
malaki_single_wall_beige.jpg      malaki_single_wall_noir.jpg
malaki_single_column_beige.jpg    malaki_single_column_noir.jpg
malaki_double_wall_beige.jpg      malaki_double_wall_noir.jpg
malaki_double_column_beige.jpg    malaki_double_column_noir.jpg
neom_single_wall_beige.jpg        neom_single_wall_noir.jpg
neom_single_column_beige.jpg      neom_single_column_noir.jpg
neom_double_wall_beige.jpg        neom_double_wall_noir.jpg
neom_double_column_beige.jpg      neom_double_column_noir.jpg
```

### مجلد 4 — `/images/final/` — 20 صورة
```
sahra_single_beige.jpg            sahra_single_noir.jpg
sahra_double_beige.jpg            sahra_double_noir.jpg
malaki_single_wall_beige.jpg      malaki_single_wall_noir.jpg
malaki_single_column_beige.jpg    malaki_single_column_noir.jpg
malaki_double_wall_beige.jpg      malaki_double_wall_noir.jpg
malaki_double_column_beige.jpg    malaki_double_column_noir.jpg
neom_single_wall_beige.jpg        neom_single_wall_noir.jpg
neom_single_column_beige.jpg      neom_single_column_noir.jpg
neom_double_wall_beige.jpg        neom_double_wall_noir.jpg
neom_double_column_beige.jpg      neom_double_column_noir.jpg
```

### الإجمالي

| المجلد | الاستخدام | العدد |
|---|---|---|
| `/images/designs/` | بطاقات التصميم — الخطوة 2 | 6 |
| `/images/sizes/` | بطاقات الحجم — الخطوة 3 | 12 |
| `/images/fixation/` | بطاقات التثبيت — الخطوة 4 | 16 |
| `/images/final/` | الصورة النهائية — الخطوة 5 | 20 |
| **المجموع** | | **54 صورة** |

---

## 11. ترتيب الخطوات النهائي

```
الخطوة 1 → ترحيب
الخطوة 2 → اختيار التصميم (صحراء / ملكي / نيوم) — 3 بطاقات أفقية — beige افتراضي
الخطوة 3 → اختيار الحجم (سيارة واحدة / حجم ثنائي) — صورة: design+size+color
الخطوة 4 → طريقة التثبيت (معلق / أعمدة) — تُخطى إذا صحراء — صورة: design+size+fixation+color
الخطوة 5 → اختيار اللون (beige / noir) — تحديث كل صور الخطوات السابقة فوراً
الخطوة 6 → ملخص + نطاق السعر المحسوب تلقائياً
الخطوة 7 → تأكيد / تعديل / إلغاء
الخطوة 8 → إرسال الموقع (GPS — Satellite Mode)
الخطوة 9 → "تم استلام الموقع بنجاح ✅ — الأستاذ [X] سيتواصل معك..."
```
