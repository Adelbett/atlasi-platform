import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const PRICES = {
  'ATL-1S': { model: 'ATL-1S', cost: 1680, beige: { quality: 'ضمان 38 شهر', cost: 1680 }, noir: { quality: 'ضمان سنة', cost: 1008 }, sellMin: 1290, sellMax: 1790, fixed: false },
  'ATL-1B': { model: 'ATL-1B', cost: 2236, beige: { quality: 'ضمان 38 شهر', cost: 2236 }, noir: { quality: 'ضمان سنة', cost: 1565 }, sellMin: 1999, sellMax: 2599, fixed: false },
  'ATL-2S-H': { model: 'ATL-2S-H', cost: 976, beige: { quality: 'ضمان 38 شهر', cost: 976 }, noir: { quality: 'ضمان سنة', cost: 683 }, sellMin: 1499, sellMax: 1899, fixed: false },
  'ATL-2B-H': { model: 'ATL-2B-H', cost: 1715, beige: { quality: 'ضمان 38 شهر', cost: 1715 }, noir: { quality: 'ضمان سنة', cost: 1200 }, sellMin: 1999, sellMax: 2599, fixed: false },
  'ATL-2S-C': { model: 'ATL-2S-C', cost: 1354, beige: { quality: 'ضمان 38 شهر', cost: 1354 }, noir: { quality: 'ضمان سنة', cost: 948 }, sellMin: 1999, sellMax: 2399, fixed: false },
  'ATL-2B-C': { model: 'ATL-2B-C', cost: 2160, beige: { quality: 'ضمان 38 شهر', cost: 2160 }, noir: { quality: 'ضمان سنة', cost: 1512 }, sellMin: 2399, sellMax: 2999, fixed: false },
  'ATL-3S-H': { model: 'ATL-3S-H', cost: 670, beige: { quality: 'ضمان 38 شهر', cost: 670 }, noir: { quality: 'ضمان سنة', cost: 469 }, sellMin: 999, sellMax: 999, fixed: true },
  'ATL-3B-H': { model: 'ATL-3B-H', cost: 1090, beige: { quality: 'ضمان 38 شهر', cost: 1090 }, noir: { quality: 'ضمان سنة', cost: 763 }, sellMin: 1299, sellMax: 1699, fixed: false },
  'ATL-3S-C': { model: 'ATL-3S-C', cost: 1140, beige: { quality: 'ضمان 38 شهر', cost: 1140 }, noir: { quality: 'ضمان سنة', cost: 798 }, sellMin: 1299, sellMax: 1699, fixed: false },
  'ATL-3B-C': { model: 'ATL-3B-C', cost: 2080, beige: { quality: 'ضمان 38 شهر', cost: 2080 }, noir: { quality: 'ضمان سنة', cost: 1456 }, sellMin: 1899, sellMax: 2599, fixed: false }
};

// Dimensions from the official size table (Longueur × Largeur)
const DIMS = {
  sahra:  { single: '5.8 × 3.5 م', double: '5.8 × 6.0 م' },
  malaki: { single: '5.0 × 3.0 م', double: '10.0 × 3.0 م' },
  neom:   { single: '5.0 × 3.0 م', double: '10.0 × 3.0 م' },
};

const getSizeLabel = (design, size) => {
  const d = design === 'sahara' ? 'sahra' : (design || 'sahra');
  const key = size === 'double' ? 'double' : 'single';
  return DIMS[d]?.[key] || '—';
};

// Format order ID: e.g. ATL-1-B-AHMED-20260414
const buildOrderId = (modelCode, customerName) => {
  // Remove all dashes from product code: ATL-2B-H → ATL2BH, ATL-1S → ATL1S
  const code = (modelCode || 'ATL').replace(/-/g, '');
  const firstName = (customerName || 'CLIENT').split(' ')[0].toUpperCase();
  const d = new Date();
  const year = String(d.getFullYear()).slice(2); // "26" from "2026"
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const date = `${year}${month}${day}${hour}`;
  return `${code}-${firstName}-${date}`;
};

const getModelCode = (design, size, fixation) => {
  const d = design === 'sahara' ? 'sahra' : design;
  const s = size || 'single';
  const f = fixation || 'column';

  const map = {
    'sahra-single': 'ATL-1S',
    'sahra-double': 'ATL-1B',
    'malaki-single-wall': 'ATL-2S-H',
    'malaki-double-wall': 'ATL-2B-H',
    'malaki-single-column': 'ATL-2S-C',
    'malaki-double-column': 'ATL-2B-C',
    'neom-single-wall': 'ATL-3S-H',
    'neom-double-wall': 'ATL-3B-H',
    'neom-single-column': 'ATL-3S-C',
    'neom-double-column': 'ATL-3B-C'
  };

  const key = d === 'sahra' ? `${d}-${s}` : `${d}-${s}-${f}`;
  return map[key] || null;
};

const calculatePrice = (design, size, fixation, color) => {
  const modelCode = getModelCode(design, size, fixation);
  if (!modelCode) return null;
  const model = PRICES[modelCode];
  const c = color || 'beige';
  return {
    ...model,
    qualityNote: model[c]?.quality || '',
    colorLabel: c === 'beige' ? 'ذهبي' : 'أسود'
  };
};

const getImageName = (design, size, fixation, color) => {
  if (!design) return null;
  const d = design === 'sahara' ? 'sahra' : design;
  const s = size || 'single';
  const f = fixation || 'column';
  const c = color || 'beige';
  if (d === 'sahra') return `${d}_${s}_${c}.png`;
  return `${d}_${s}_${f}_${c}.png`;
};

const normalizeSaudiPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('9665')) {
    return `0${digits.slice(3, 12)}`;
  }
  if (digits.startsWith('05')) {
    return digits.slice(0, 10);
  }
  if (digits.startsWith('5')) {
    return `0${digits.slice(0, 9)}`;
  }

  return digits.slice(0, 10);
};

const isValidSaudiPhone = (value) => /^05\d{8}$/.test(normalizeSaudiPhone(value));

const slideVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
};

const MapCenterer = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    const center = map.getCenter();
    const latDiff = Math.abs(center.lat - position[0]);
    const lngDiff = Math.abs(center.lng - position[1]);
    if (latDiff > 0.00001 || lngDiff > 0.00001) {
      map.invalidateSize().setView(position, 15, { animate: true });
    }
  }, [position, map]);
  return null;
};

const MapPositionTracker = ({ onMove }) => {
  useMapEvents({
    moveend(e) {
      const center = e.target.getCenter();
      onMove([center.lat, center.lng]);
    }
  });
  return null;
};

const WizardStyles = () => (
  <style>{`
    .glass-panel {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    .gold-gradient {
      background: linear-gradient(135deg, #735c00 0%, #d4af37 100%);
    }
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
    }
    /* Leaflet map fill container */
    .leaflet-container {
      width: 100% !important;
      height: 100% !important;
      min-height: 350px;
      z-index: 1;
    }
    .map-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 350px;
    }
  `}</style>
);

// ─── Step Progress Bar ──────────────────────────────────────────────────────

const STEP_ITEMS = [
  { num: 1, arabicNum: '1', label: 'المعلومات الشخصية', wizardStep: 1 },
  { num: 2, arabicNum: '2', label: 'اختيار التصميم', wizardStep: 2 },
  { num: 3, arabicNum: '3', label: 'الهيكل والتركيب', wizardStep: 3 },
  { num: 4, arabicNum: '4', label: 'هيكل', wizardStep: 5 },
  { num: 5, arabicNum: '5', label: 'مراجعة الطلب', wizardStep: 6 },
  { num: 6, arabicNum: '6', label: 'الموقع', wizardStep: 7 },
];

const arabicNums = ['', '1', '2', '3', '4', '5', '6'];

const getActiveIndicator = (cs) => {
  if (cs <= 1) return 1;
  if (cs === 2) return 2;
  if (cs === 3 || cs === 4) return 3;
  if (cs === 5) return 4;
  if (cs === 6) return 5;
  if (cs === 7) return 6;
  return 1;
};

const StepProgressBar = ({ currentStep, setStep }) => {
  const activeIndicator = getActiveIndicator(currentStep);
  const currentStepItem = STEP_ITEMS[activeIndicator - 1];

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-outline-variant/15 px-4 md:px-8 py-4 shadow-sm sticky top-16 z-30">
      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-secondary">الخطوة {arabicNums[activeIndicator]} من 6</span>
          <span className="text-sm font-bold text-primary">{currentStepItem.label}</span>
        </div>
        <div className="w-full bg-outline-variant/20 rounded-full h-1.5">
          <div
            className="gold-gradient h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(activeIndicator / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex items-start justify-center max-w-4xl mx-auto">
        {STEP_ITEMS.map((step, i) => {
          const isActive = step.num === activeIndicator;
          const isCompleted = step.num < activeIndicator;
          return (
            <React.Fragment key={step.num}>
              <div
                className={`flex flex-col items-center gap-2 ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => isCompleted && setStep(step.wizardStep)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
                    ${isActive
                      ? 'bg-[#735c00] border-[#735c00] text-white shadow-lg shadow-primary/30 scale-110'
                      : isCompleted
                        ? 'bg-[#B89B5E] border-[#B89B5E] text-white'
                        : 'bg-white border-outline-variant/40 text-secondary/60'
                    }`}
                >
                  {isCompleted ? '✓' : step.arabicNum}
                </div>
                <span
                  className={`text-[10px] font-bold text-center whitespace-nowrap
                    ${isActive ? 'text-primary' : isCompleted ? 'text-[#B89B5E]' : 'text-secondary opacity-50'}`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEP_ITEMS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mt-5 mx-1
                    ${step.num < activeIndicator ? 'bg-[#B89B5E]' : 'bg-outline-variant/20'}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ─── Wizard Root ────────────────────────────────────────────────────────────

const Wizard = () => {
  const { currentStep, setStep } = useStore();
  const wizardTopRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  if (currentStep === 8) return <Confirmation />;
  if (currentStep === 9) return <CancelStep />;

  return (
    <div ref={wizardTopRef} className="min-h-screen bg-surface font-body text-on-surface flex flex-col pt-16">
      <WizardStyles />

      <StepProgressBar currentStep={currentStep} setStep={setStep} />

      <main className="flex-grow px-4 md:px-8 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} variants={slideVariants} initial="enter" animate="center" exit="exit">
              {currentStep === 1 && <Step1 />}
              {currentStep === 2 && <Step2 />}
              {currentStep === 3 && <Step4 />}
              {currentStep === 4 && <Step3 />}
              {currentStep === 5 && <Step5 />}
              {currentStep === 6 && <Step6 />}
              {currentStep === 7 && <Step7 />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// ─── Step 1: المعلومات الشخصية ───────────────────────────────────────────────

const Step1 = () => {
  const { customerName, customerPhone, updateField, nextStep, setLoyaltyInfo } = useStore();
  const normalizedPhone = normalizeSaudiPhone(customerPhone);
  const valid = customerName.trim().length > 2 && isValidSaudiPhone(customerPhone);

  // ── فحص برنامج الولاء عبر رقم الهاتف ────────────────────────────
  const [loyaltyStatus, setLoyaltyStatus] = useState(null);
  useEffect(() => {
    if (!isValidSaudiPhone(customerPhone)) { setLoyaltyStatus(null); return; }
    const phone = normalizeSaudiPhone(customerPhone);
    fetch(`http://localhost:8080/api/loyalty/status/${phone}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setLoyaltyStatus(data);
          setLoyaltyInfo(data.discountRate || 0, data.tier || '', data.nextOrderNumber || 1);
        }
      })
      .catch(() => null); // silent fail — the API may be offline
  }, [customerPhone, setLoyaltyInfo]);

  return (
    <div className="min-h-[60vh] py-8 flex flex-col items-center justify-center relative">
      <div className="fixed top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
      <div className="fixed bottom-1/4 -left-20 w-80 h-80 bg-primary-container/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl glass-panel p-8 md:p-12 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white/70 backdrop-blur-3xl border border-white/40"
      >
        <div className="text-right space-y-3 mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">المعلومات الأساسية</h2>
          <p className="text-neutral-500 text-base leading-relaxed">
            ابدأ بتخصيص تجربتك، يرجى تزويدنا بتفاصيل التواصل الخاصة بك.
          </p>
        </div>

        <div className="space-y-6">
          {/* الاسم الكامل */}
          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-widest text-neutral-400 pr-1 text-right">الاسم الكامل</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-neutral-300 group-focus-within:text-primary transition-colors text-xl">person</span>
              </div>
              <input
                className="block w-full pr-12 pl-4 py-4 bg-white/50 border border-neutral-100 rounded-xl text-base transition-all focus:bg-white focus:ring-2 focus:ring-black/10 focus:border-[#1c1b1b] placeholder:text-neutral-300 text-right outline-none"
                placeholder="أدخل اسمك بالكامل هنا"
                type="text"
                value={customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
              />
            </div>
          </div>

          {/* رقم الجوال */}
          <div className="space-y-2">
            <label className="block text-xs font-bold tracking-widest text-neutral-400 pr-1 text-right">رقم الجوال</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-neutral-300 group-focus-within:text-primary transition-colors text-xl">call</span>
              </div>
              <input
                className="block w-full pr-12 pl-4 py-4 bg-white/50 border border-neutral-100 rounded-xl text-base text-right transition-all focus:bg-white focus:ring-2 focus:ring-black/10 focus:border-[#1c1b1b] placeholder:text-neutral-300 outline-none"
                dir="ltr"
                placeholder="05XXXXXXXX"
                type="tel"
                value={customerPhone}
                onChange={(e) => updateField('customerPhone', normalizeSaudiPhone(e.target.value))}
              />
            </div>
            {customerPhone && !isValidSaudiPhone(customerPhone) && (
              <p className="text-[10px] text-red-500 text-right">أدخل رقم جوال صحيح (مثال: 05XXXXXXXX أو +9665XXXXXXXX)</p>
            )}
            <p className="text-[0.625rem] text-neutral-400 flex items-center gap-1.5 justify-end">
              <span>سنستخدم هذا الرقم للتواصل معك بشأن طلبك.</span>
              <span className="material-symbols-outlined text-[10px]">info</span>
            </p>
          </div>

          {/* ── شارة الولاء — تظهر تلقائياً عند اكتشاف خصم ── */}
          {loyaltyStatus && loyaltyStatus.discountRate > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl border"
              style={{
                background: loyaltyStatus.discountRate >= 0.5 ? '#fffbeb' : '#f0fdf4',
                borderColor: loyaltyStatus.discountRate >= 0.5 ? '#fde68a' : '#bbf7d0',
              }}>
              <span className="text-3xl flex-shrink-0">{loyaltyStatus.tierIcon}</span>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color: loyaltyStatus.discountRate >= 0.5 ? '#92400e' : '#14532d' }}>
                  {loyaltyStatus.message}
                </p>
                <p className="text-xs mt-0.5" style={{ color: loyaltyStatus.discountRate >= 0.5 ? '#b45309' : '#166534' }}>
                  سيُطبق الخصم تلقائياً على هذا الطلب
                </p>
              </div>
              <span className="mr-auto text-xl font-black" style={{ color: loyaltyStatus.discountRate >= 0.5 ? '#b45309' : '#15803d' }}>
                -{loyaltyStatus.discountPercent}
              </span>
            </div>
          )}

          <div className="pt-4">
            <button
              disabled={!valid}
              onClick={nextStep}
              className="gold-gradient w-full py-4 rounded-xl text-white text-lg font-bold shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group disabled:opacity-30 disabled:hover:translate-y-0 min-h-[56px]"
            >
              <span>الاستمرار لتصميم الموديل</span>
              <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
            </button>

            <div className="mt-6 flex items-center justify-end gap-2 px-4 py-2 bg-green-50 rounded-full w-fit mr-0 ml-auto">
              <span className="material-symbols-outlined text-green-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="text-xs text-green-700 font-bold">معلوماتك محمية وآمنة تماماً</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Step 2: اختيار التصميم ──────────────────────────────────────────────────

const Step2 = () => {
  const { design, updateField, nextStep, prevStep } = useStore();
  const designs = [
    { id: 'malaki', title: 'ملكي', desc: 'خطوط منحنية بلمسة راقية', img: '/image/malaki_single_column_beige.png', tag: 'الاختيار الملكي' },
    { id: 'neom', title: 'نيوم', desc: 'تصميم عصري بواجهة حديثة', img: '/image/neom_single_column_beige.png', tag: 'الفن المعاصر', featured: true },
    { id: 'sahara', title: 'صحراء', desc: 'تصميم متوازن بطابع أصيل', img: '/image/sahra_single_beige.png', tag: 'التصميم الهوائي' }
  ];

  return (
    <div className="text-right">
      <section className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-on-surface">اختر التصميم المفضل</h1>
        <p className="text-secondary max-w-2xl text-base leading-relaxed mt-2">
          ابدأ رحلتك لتخصيص مظلة سيارتك الفاخرة. تصاميمنا تجمع بين المتانة الهندسية والجمالية العصرية.
        </p>
      </section>

      <section className="flex flex-row md:grid md:grid-cols-3 gap-5 overflow-x-auto md:overflow-hidden pb-6 md:pb-0 hide-scrollbar snap-x snap-mandatory">
        {designs.map(d => (
          <div
            key={d.id}
            onClick={() => updateField('design', d.id)}
            className={`group relative flex-shrink-0 w-[300px] md:w-auto snap-center rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 active:scale-[0.97] ${design === d.id ? 'ring-[3px] ring-[#1c1b1b] shadow-2xl shadow-black/30' : 'shadow-md hover:shadow-xl hover:shadow-black/20'}`}
          >
            {/* Full-bleed image — aspect matches 2272×1886 exactly (6:5) */}
            <div className="aspect-[6/5] relative overflow-hidden bg-[#f5f0e8]">
              <img
                alt={d.title}
                src={d.img}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Bottom gradient + info overlay */}
              <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

              {/* Tag badge — top right */}
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-widest uppercase backdrop-blur-sm ${design === d.id ? 'bg-[#1c1b1b] text-[#d0c5af]' : 'bg-white/20 text-white'}`}>
                  {d.tag}
                </span>
              </div>

              {/* Selection check — top left */}
              <div className={`absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${design === d.id ? 'bg-[#1c1b1b] scale-100' : 'bg-white/10 scale-75 opacity-0'}`}>
                <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>

              {/* Title + desc overlay at bottom */}
              <div className="absolute bottom-0 inset-x-0 p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">{d.title}</h3>
                    <p className="text-white/70 text-[11px] leading-snug mt-0.5">{d.desc}</p>
                  </div>
                  <div className={`w-8 h-8 rounded-full gold-gradient flex items-center justify-center shrink-0 transition-all duration-300 ${design === d.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}>
                    <span className="material-symbols-outlined text-white text-sm">check</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] text-zinc-400 tracking-widest">يبدأ السعر من</span>
          <span className="text-2xl font-bold text-on-surface tracking-tight">999 <span className="text-sm font-normal text-secondary">ر.س</span></span>
        </div>
        <button
          onClick={nextStep}
          disabled={!design}
          className="group flex items-center gap-4 gold-gradient px-8 py-4 rounded-full text-white font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-30 w-full sm:w-auto justify-center min-h-[52px]"
        >
          <span>{design === 'sahara' ? 'المتابعة لاختيار الحجم' : 'المتابعة لطريقة التثبيت'}</span>
          <span className="material-symbols-outlined group-hover:-translate-x-2 transition-transform text-lg">arrow_back</span>
        </button>
      </div>
    </div>
  );
};

// ─── Step 3: الحجم ───────────────────────────────────────────────────────────

const Step3 = () => {
  const { size, design, color, fixation, updateField, nextStep, prevStep } = useStore();
  const d = design === 'sahara' ? 'sahra' : (design || 'sahra');
  const dims = DIMS[d] || DIMS.sahra;
  const options = [
    { id: 'single', title: 'سيارة واحدة', dim: dims.single, icon: 'directions_car' },
    { id: 'double', title: 'سيارتين', dim: dims.double, icon: 'airport_shuttle' },
  ];
  const previewImg = getImageName(design, size, fixation || 'column', color || 'beige');

  return (
    <div className="text-right flex flex-col md:flex-row gap-8 md:gap-12">
      {/* معاينة */}
      <div className="flex-1 h-64 md:h-[500px] relative rounded-xl overflow-hidden shadow-2xl">
        <img
          key={previewImg}
          alt="معاينة الحجم"
          className="step-preview w-full h-full object-cover transition-all duration-700"
          src={`/image/${previewImg || 'malaki_single_column_beige.png'}`}
          onError={(e) => { e.target.src = '/image/malaki_single_column_beige.png'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-white/80 backdrop-blur-sm p-3 md:p-4 rounded-xl border border-white/30">
          <span className="text-[10px] text-secondary block mb-1">معاينة الحجم</span>
          <span className="text-sm font-bold text-on-surface">
            {size ? getSizeLabel(design, size) : 'اختر الحجم'}
          </span>
        </div>
      </div>

      {/* خيارات */}
      <div className="w-full md:w-[480px]">
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight leading-tight">حدد الحجم المطلوب</h1>
          <p className="text-secondary text-sm leading-relaxed mt-2">اختر الحجم المناسب لمساحة ركن سياراتك.</p>
        </section>

        <div className="space-y-4">
          {options.map(o => (
            <div
              key={o.id}
              onClick={() => updateField('size', o.id)}
              className={`p-5 md:p-6 bg-surface-container-lowest rounded-xl border transition-all duration-500 cursor-pointer flex items-center gap-4 md:gap-6 min-h-[80px] ${size === o.id ? 'border-[#1c1b1b] ring-2 ring-[#1c1b1b] shadow-xl' : 'border-surface-container shadow-sm hover:border-[#d0c5af]/30'}`}
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shrink-0 ${size === o.id ? 'bg-[#1c1b1b] text-white' : 'bg-surface-container-low text-zinc-400'}`}>
                <span className="material-symbols-outlined text-2xl md:text-3xl">{o.icon}</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-base md:text-lg font-bold leading-tight">{o.title}</h3>
                <p className="text-xs text-secondary mt-0.5">{o.dim}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${size === o.id ? 'border-[#1c1b1b] bg-[#1c1b1b]' : 'border-outline-variant'}`}>
                {size === o.id && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 md:mt-12 flex items-center gap-4">
          <button onClick={nextStep} disabled={!size} className="flex-1 py-4 md:py-5 gold-gradient text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 text-center min-h-[52px]">
            الاستمرار للون الهيكل
          </button>
          <button onClick={prevStep} className="w-14 md:w-20 py-4 md:py-5 rounded-xl border-2 border-outline-variant/30 text-secondary hover:bg-white transition-all flex items-center justify-center min-h-[52px]">
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Step 4: طريقة التثبيت ───────────────────────────────────────────────────

const Step4 = () => {
  const { design, size, fixation, color, updateField, nextStep, prevStep } = useStore();
  const types = [
    { id: 'wall', label: 'معلقة على الجدار', desc: 'تثبيت مباشر على الجدار بدون أعمدة أرضية، لمظهر عصري وأنيق', },
    { id: 'column', label: 'على أعمدة', desc: 'تثبيت على أعمدة مثبتة في الأرض لضمان الثبات العالي', icon: '' },
  ];
  const previewImg = getImageName(design, size, fixation, color || 'beige');

  return (
    <div className="text-right flex flex-col md:flex-row gap-8 md:gap-12">
      {/* معاينة */}
      <div className="flex-1 h-64 md:h-[500px] relative rounded-xl overflow-hidden shadow-2xl">
        <img
          key={previewImg}
          alt="معاينة الهيكل"
          className="w-full h-full object-cover transition-all duration-700 step-preview"
          src={`/image/${previewImg || 'malaki_single_column_beige.png'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 glass-panel p-3 md:p-4 rounded-xl border border-white/20">
          <span className="text-[10px] text-zinc-400 block mb-1">معاينة الهيكل</span>
          <span className="text-sm font-bold text-on-surface">{fixation === 'wall' ? 'هيكل معلق متطور' : 'هيكل قائم بأعمدة صلبة'}</span>
        </div>
      </div>

      {/* خيارات */}
      <div className="w-full md:w-[480px]">
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface tracking-tight leading-tight">طريقة التثبيت</h1>
          <p className="text-secondary max-w-xl text-sm leading-relaxed mt-2">اختر نظام التثبيت الذي يتناسب مع المساحة الإنشائية لمنزلك.</p>
        </section>

        <div className="grid grid-cols-2 gap-4">
          {types.map(t => {
            const cardImg = getImageName(design || 'malaki', size || 'single', t.id, color || 'beige');
            const isSelected = fixation === t.id;
            return (
              <div
                key={t.id}
                onClick={() => updateField('fixation', t.id)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 active:scale-[0.97] ${isSelected ? 'ring-[3px] ring-[#1c1b1b] shadow-2xl shadow-black/30' : 'shadow-md hover:shadow-xl hover:shadow-black/20'}`}
              >
                {/* Full-bleed image — same 6:5 ratio as source images */}
                <div className="aspect-[6/5] relative overflow-hidden bg-[#f5f0e8]">
                  <img
                    alt={t.label}
                    src={`/image/${cardImg || 'malaki_single_column_beige.png'}`}
                    onError={e => { e.target.src = '/image/malaki_single_column_beige.png'; }}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Bottom gradient */}
                  <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

                  {/* Selection check — top left */}
                  <div className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-[#1c1b1b] scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                    <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>

                  {/* Label overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <h3 className="text-sm font-bold text-white leading-tight">{t.label}</h3>
                    <p className="text-white/65 text-[10px] leading-snug mt-0.5 line-clamp-2">{t.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 md:mt-12 flex items-center gap-4">
          <button onClick={nextStep} disabled={!fixation} className="flex-1 py-4 md:py-5 gold-gradient text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center min-h-[52px]">
            الاستمرار لاختيار الحجم
          </button>
          <button onClick={prevStep} className="w-14 md:w-20 py-4 md:py-5 rounded-xl border-2 border-outline-variant/30 text-secondary hover:bg-white transition-all flex items-center justify-center min-h-[52px]">
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Step 5: الهيكل واللون ───────────────────────────────────────────────────

const Step5 = () => {
  const { design, size, fixation, color, updateField, nextStep, prevStep } = useStore();
  const colors = [
    { id: 'beige', label: 'بيج', hex: '#F5F5DC' },
    { id: 'noir', label: 'أسود', hex: '#1A1A1A' }
  ];
  const previewImg = getImageName(design, size, fixation, color);

  return (
    <div className="text-right flex flex-col md:flex-row gap-8 md:gap-12">
      <div className="flex-1 h-64 md:h-[600px] relative rounded-xl overflow-hidden shadow-2xl">
        <img alt="معاينة اللون" className="w-full h-full object-cover" src={`/image/${previewImg || 'malaki_single_column_beige.png'}`} />
      </div>

      <div className="w-full md:w-[420px] static md:sticky md:top-36">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-on-surface leading-tight mb-3">اختر لون هيكل</h1>
          <p className="text-secondary leading-relaxed text-sm">اختر من بين مجموعتنا الحصرية من الهياكل المقاومة للعوامل الجوية.</p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {colors.map(c => (
              <div
                key={c.id}
                onClick={() => updateField('color', c.id)}
                className={`p-5 md:p-6 rounded-xl border-2 flex items-center justify-between transition-all group cursor-pointer min-h-[80px] ${color === c.id ? 'bg-surface-container-lowest border-[#1c1b1b] shadow-lg' : 'bg-surface-container-low border-transparent hover:border-[#d0c5af]/30'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-inner" style={{ backgroundColor: c.hex }} />
                    {color === c.id && <div className="absolute -inset-1.5 border border-[#7f7663] rounded-full" />}
                  </div>
                  <div className="font-bold text-base md:text-lg">{c.label}</div>
                </div>
                {color === c.id && (
                  <span className="material-symbols-outlined text-[#1c1b1b]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button onClick={nextStep} className="w-full py-4 md:py-5 gold-gradient text-on-primary font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center min-h-[52px]">
              مراجعة الطلب
            </button>
            <button onClick={prevStep} className="w-full py-3 text-secondary font-bold text-sm hover:text-on-surface transition-colors flex items-center justify-center gap-2 min-h-[48px]">
              <span>العودة للخطوة السابقة</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Step 6: مراجعة الطلب ────────────────────────────────────────────────────

const Step6 = () => {
  const { design, size, fixation, color, customerName, customerPhone, nextStep, prevStep, saveCancellation, loyaltyDiscount, loyaltyTier } = useStore();
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ── حساب السعر الفعلي حسب الموديل المختار ───────────────────────
  const priceData = calculatePrice(design, size, fixation, color);
  const hasDiscount = loyaltyDiscount > 0 && priceData;
  const discountedMin = hasDiscount ? Math.round(priceData.sellMin * (1 - loyaltyDiscount)) : null;
  const discountedMax = hasDiscount ? Math.round(priceData.sellMax * (1 - loyaltyDiscount)) : null;

  const confirmCancel = async () => {
    const snapshot = { customerName, customerPhone, design, size, fixation, color, status: 'ملغى' };
    try {
      await fetch('http://localhost:8080/api/admin/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot)
      });
    } catch (_) { }
    saveCancellation(snapshot);
  };

  const previewImg = getImageName(design, size, fixation, color) || 'malaki_single_column_beige.png';

  return (
    <div className="text-right">
      <header className="bg-transparent border-none">
        <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-2">مراجعة التفاصيل</h1>
        <p className="text-secondary max-w-lg leading-relaxed text-sm">يرجى مراجعة المواصفات المختارة لمظلة سيارتك الفاخرة قبل التأكيد النهائي.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-7 h-64 md:h-[500px] rounded-xl overflow-hidden shadow-sm relative">
          <img alt="معاينة التصميم" className="w-full h-full object-cover" src={`/image/${previewImg}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-6 right-6 text-white">
            <p className="tracking-widest text-[10px] opacity-80 mb-1">التصميم المختار</p>
            <h2 className="text-xl md:text-2xl font-bold">
              {design === 'malaki' ? 'ملكي' : design === 'neom' ? 'نيوم' : 'صحراء'}
            </h2>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
          <div className="glass-panel p-6 md:p-8 rounded-xl border border-white/20 shadow-xl shadow-[#735c00]/5 flex flex-col gap-4 md:gap-6">
            <div className="flex justify-between items-start border-b border-outline-variant/10 pb-4">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold tracking-widest block mb-1"> الحجم 
</span>
                <p className="text-base md:text-lg font-semibold">{getSizeLabel(design, size)}</p>
              </div>
              <span className="material-symbols-outlined text-zinc-400">aspect_ratio</span>
            </div>
            <div className="flex justify-between items-start border-b border-outline-variant/10 pb-4">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold tracking-widest block mb-1">هيكل</span>
                <p className="text-base md:text-lg font-semibold">{color === 'noir' ? 'أسود' : 'بيج'}</p>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color === 'noir' ? '#1A1A1A' : '#F5F5DC' }} />
            </div>
            <div className="flex justify-between items-start border-b border-outline-variant/10 pb-4">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold tracking-widest block mb-1">قماش</span>
                <p className="text-base md:text-lg font-semibold">بيج</p>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: '#F5F5DC' }} />
            </div>
            {design !== 'sahara' && (
              <div className="flex justify-between items-start border-b border-outline-variant/10 pb-4">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold tracking-widest block mb-1">نظام التثبيت</span>
                  <p className="text-base md:text-lg font-semibold">{fixation === 'wall' ? 'تثبيت معلق على الجدار' : 'تثبيت على أعمدة قائمة'}</p>
                </div>
                <span className="material-symbols-outlined text-zinc-400">architecture</span>
              </div>
            )}
            {/* السعر المحسوب حسب الموديل مع خصم الولاء */}
            <div className="flex justify-between items-start pt-1">
              <div className="flex-1">
                <span className="text-[10px] text-zinc-500 font-bold tracking-widest block mb-1">نطاق السعر</span>
                {priceData ? (
                  <>
                    {hasDiscount && (
                      <p className="text-sm line-through text-zinc-400 mb-0.5">
                        {priceData.sellMin.toLocaleString()} — {priceData.sellMax.toLocaleString()} ر.س
                      </p>
                    )}
                    <p className={`text-xl md:text-2xl font-extrabold ${hasDiscount ? 'text-emerald-600' : 'text-[#735c00]'}`}>
                      {hasDiscount
                        ? `${discountedMin?.toLocaleString()} — ${discountedMax?.toLocaleString()} ر.س`
                        : `${priceData.sellMin.toLocaleString()} — ${priceData.sellMax.toLocaleString()} ر.س`
                      }
                    </p>
                    {hasDiscount && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        خصم ولاء {Math.round(loyaltyDiscount * 100)}% مطبق تلقائياً
                      </span>
                    )}
                  </>
                ) : (
                  <p className="text-xl md:text-2xl font-extrabold text-[#735c00]">يُحدد بعد الزيارة</p>
                )}
              </div>
              <span className="material-symbols-outlined text-[#735c00]/40 text-3xl flex-shrink-0">payments</span>
            </div>
          </div>

          {/* وسائل الدفع */}
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-5 flex flex-col items-center gap-3 text-center">
            <p className="text-[11px] font-bold tracking-widest text-secondary">وسائل الدفع المتاحة</p>
            <p className="text-xs text-[#735c00] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_month</span>
              يمكنك الدفع على 4 مراحل
            </p>
            <img
              src="/image/tabay-tamara.jpg"
              alt="Tabby & Tamara"
              className="w-full max-w-[260px] object-contain rounded-lg"
            />
          </div>

          {/* أزرار الإجراء */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={nextStep} className="flex-1 py-4 md:py-5 px-6 rounded-xl gold-gradient text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-3 min-h-[52px]">
              <span>تأكيد ومعاينة الموقع</span>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button onClick={prevStep} className="w-full sm:w-14 py-4 md:py-5 rounded-xl border-2 border-outline-variant/30 text-secondary hover:bg-white transition-all flex items-center justify-center min-h-[52px]">
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full sm:w-14 py-4 md:py-5 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 transition-all flex items-center justify-center min-h-[52px]"
              title="إلغاء الطلب"
            >
              <span className="material-symbols-outlined">cancel</span>
            </button>
          </div>

          {/* ── Popup تأكيد الإلغاء ── */}
          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5">
                  <span className="material-symbols-outlined text-3xl text-red-400">warning</span>
                </div>
                <h3 className="text-xl font-bold text-on-surface mb-2">تأكيد إلغاء الطلب</h3>
                <p className="text-secondary text-sm mb-6 leading-relaxed">
                  هل أنت متأكد من إلغاء هذا الطلب؟ سيتم حفظ بياناتك للمتابعة لاحقاً.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={confirmCancel}
                    className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all"
                  >
                    نعم، إلغاء الطلب
                  </button>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="w-full py-3 rounded-xl border-2 border-outline-variant/30 text-secondary font-bold hover:bg-surface-container-low transition-all"
                  >
                    لا، متابعة الطلب
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ─── Step 7: الموقع ──────────────────────────────────────────────────────────

const Step7 = () => {
  const { address, updateField, setStep, customerName } = useStore();
  const [position, setPosition] = useState([24.7136, 46.6753]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAutoLocate = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((loc) => {
        const latlng = [loc.coords.latitude, loc.coords.longitude];
        setPosition(latlng);
        updateField('address', `GPS(${latlng[0].toFixed(5)}, ${latlng[1].toFixed(5)})`);
      });
    }
  };

  const submitOrder = async () => {
    setIsSubmitting(true);

    const { customerName, customerPhone, design, size, fixation, color, address, loyaltyDiscount } = useStore.getState();
    const modelCode = getModelCode(design, size, fixation);
    const safePhone = normalizeSaudiPhone(customerPhone);

    // Calcul du prix estimé (min après remise fidélité si applicable)
    const priceData = calculatePrice(design, size, fixation, color);
    const estimatedPrice = priceData
      ? Math.round(priceData.sellMin * (1 - (loyaltyDiscount || 0)))
      : null;
    const latitude = Number(position?.[0]?.toFixed(6));
    const longitude = Number(position?.[1]?.toFixed(6));
    const mapUrl = (Number.isFinite(latitude) && Number.isFinite(longitude))
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : '';

    const generatedId = buildOrderId(modelCode, customerName);
    const orderData = {
      confirmationNumber: generatedId,
      clientName: customerName,
      clientPhone: safePhone,
      designType: design,
      sizeInfo: size,
      fixationType: fixation,
      fabricColor: color,
      address: address,
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      mapUrl: mapUrl,
      estimatedPrice: estimatedPrice,
      status: 'جديد'
    };

    try {
      const response = await fetch('http://localhost:8080/api/admin/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        const finalId = result.confirmationNumber || generatedId;
        updateField('finalId', finalId);
        setStep(8);
      } else {
        console.error('Failed to submit order');
        updateField('finalId', generatedId);
        setStep(8);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      updateField('finalId', generatedId);
      setStep(8);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="relative flex flex-col md:flex-row-reverse overflow-hidden rounded-2xl md:rounded-3xl border border-outline-variant/10 shadow-2xl"
      style={{ minHeight: 'calc(100vh - 220px)' }}
    >
      {/* الخريطة */}
      <section className="flex-1 relative bg-[#e8e8e8]" style={{ height: '420px', minHeight: '420px' }}>
        <div className="map-wrapper">
          <MapContainer
            center={position}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '420px' }}
          >
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <Marker position={position} icon={new L.Icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })} />
            <MapCenterer position={position} />
            <MapPositionTracker onMove={setPosition} />
          </MapContainer>

          {/* مؤشر الموقع */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none" style={{ zIndex: 500 }}>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#735c00] to-[#d4af37] rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#735c00] rotate-45 border-r-4 border-b-4 border-white" style={{ zIndex: -1 }} />
            </div>
            <div className="mt-4 px-4 py-2 bg-white/90 rounded-xl shadow-lg border border-outline-variant/20">
              <span className="text-on-surface font-semibold text-sm">موقع التركيب المختار</span>
            </div>
          </div>

          {/* زر تحديد الموقع التلقائي */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-2" style={{ zIndex: 500 }}>
            <button
              onClick={handleAutoLocate}
              className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-all shadow-lg border border-outline-variant/15"
            >
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>
        </div>
      </section>

      {/* لوحة التفاصيل */}
      <section className="w-full md:w-[420px] bg-white z-10 flex flex-col p-6 md:p-10 overflow-y-auto text-right" style={{ minHeight: '420px' }}>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface leading-tight">تحديد موقع التركيب</h1>
          <p className="text-secondary mt-3 leading-relaxed text-sm">
            يرجى تحديد الموقع الدقيق الذي سيتم فيه تركيب المظلة لضمان معايرة هندسية دقيقة.
          </p>
        </div>

        <div className="space-y-6 flex-grow">
          <div className="space-y-3">
            <label className="block text-xs font-bold tracking-widest text-outline">تفاصيل العنوان</label>
            <div className="relative">
              <input
                className="w-full bg-surface-container-low border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/50 text-right font-medium placeholder:text-zinc-400 outline-none"
                placeholder="ابحث عن عنوان أو أدخله يدوياً..."
                value={address}
                onChange={(e) => updateField('address', e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-4 top-4 text-zinc-400">search</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-8 flex flex-col gap-4">
          {/* تنبيه إلزامي قبل التأكيد */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4 text-right">
            <span className="material-symbols-outlined text-[#735c00] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            <p className="text-xs leading-relaxed text-[#735c00] font-bold">
               سيتم تزويدك بالمبلغ النهائي بدقة بعد زيارة المندوب ورفع القياسات
            </p>
          </div>
          <button
            onClick={submitOrder}
            disabled={isSubmitting}
            className="w-full py-4 md:py-5 rounded-xl bg-gradient-to-br from-[#735c00] to-[#d4af37] text-white font-bold text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-30 min-h-[52px]"
          >
            <span>{isSubmitting ? 'جاري إرسال طلبكم...' : 'إتمام الطلب النهائي'}</span>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
      </section>
    </div>
  );
};

// ─── صفحة التأكيد ────────────────────────────────────────────────────────────

const Confirmation = () => {
  const { finalId, setStep, design, size, color, fixation } = useStore();

  const designLabel = design === 'malaki' ? 'ملكي' : design === 'neom' ? 'نيوم' : 'صحراء';
  const sizeLabel = getSizeLabel(design, size);
  const colorLabel = color === 'noir' ? 'أسود' : 'بيج';
  const fixationLabel = fixation === 'wall' ? 'معلقة على الجدار' : 'على أعمدة';

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body pt-16">
      <WizardStyles />
      <main className="flex-grow flex items-center justify-center relative py-8 md:py-16 px-4 md:px-6">
        {/* خلفية ضبابية */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-10 pointer-events-none">
          <img className="w-full h-full object-cover grayscale" src="/image/malaki_double_column_noir.png" alt="" />
        </div>

        <div className="relative z-10 w-full max-w-3xl mx-auto">
          <div className="glass-panel border border-white/20 rounded-2xl p-6 md:p-12 text-center shadow-2xl shadow-primary/5">

            {/* أيقونة النجاح */}
            <div className="mb-6 md:mb-8 inline-block">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-[#735c00] to-[#d4af37] rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20 mx-auto">
                <span className="material-symbols-outlined text-4xl md:text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-on-surface mb-3">طلبكم قيد التنفيذ</h1>
            <p className="text-secondary text-sm mb-4">رقم الطلب: <span className="text-primary font-bold">{finalId}</span></p>

            {/* رسالة ١٢ ساعة */}
            <div className="max-w-lg mx-auto bg-amber-50 border border-amber-200/60 rounded-xl p-4 mb-6 text-right">
             <p className="text-sm md:text-base leading-relaxed text-on-surface">
  سيتواصل معكم فريقنا خلال <span className="font-bold text-[#735c00]">12 ساعة</span> لتحديد موعد زيارة موقع التركيب.
</p>
            </div>

            {/* ملخص الطلب */}
            <div className="max-w-lg mx-auto bg-white/80 rounded-xl p-5 md:p-6 mb-4 border border-outline-variant/15 text-right">
              <h3 className="font-bold text-on-surface mb-4 text-sm">ملخص طلبكم</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                  <span className="font-semibold text-sm">{designLabel}</span>
                  <span className="text-xs text-secondary">التصميم</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                  <span className="font-semibold text-sm">{sizeLabel}</span>
                  <span className="text-xs text-secondary">الحجم</span>
                </div>
                {fixation && (
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                    <span className="font-semibold text-sm">{fixationLabel}</span>
                    <span className="text-xs text-secondary">التثبيت</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border border-outline-variant/30 ${color === 'noir' ? 'bg-[#1A1A1A]' : 'bg-[#F5F5DC]'}`} />
                    <span className="font-semibold text-sm">{colorLabel}</span>
                  </div>
                  <span className="text-xs text-secondary">اللون</span>
                </div>
                {/* السعر — حسب price_and_image_logic */}
                {(() => {
                  const p = calculatePrice(design, size, fixation, color);
                  if (!p) return null;
                  return (
                    <div className="flex justify-between items-center py-2">
                      <span className="font-bold text-sm text-[#735c00]">
                        {p.fixed ? `${p.sellMin.toLocaleString()} ريال` : `من ${p.sellMin.toLocaleString()} إلى ${p.sellMax.toLocaleString()} ريال`}
                      </span>
                      <span className="text-xs text-secondary">نطاق السعر</span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* نص السعر التفصيلي */}
            {(() => {
              const p = calculatePrice(design, size, fixation, color);
              if (!p) return null;
              return (
                <div className="max-w-lg mx-auto bg-[#735c00]/5 border border-[#735c00]/20 rounded-xl p-4 mb-8 text-right">
                  <p className="text-sm leading-relaxed text-on-surface">
                    {p.fixed
                      ? <>سعر هذا الموديل ثابت بـ <span className="font-bold text-[#735c00]">{p.sellMin.toLocaleString()} ريال</span></>
                      : <>حسب تفاصيلك، سيكون السعر في حدود <span className="font-bold text-[#735c00]">من {p.sellMin.toLocaleString()} إلى {p.sellMax.toLocaleString()} ريال</span></>
                    }
                  </p>
                  <p className="text-xs text-secondary mt-2">بعد زيارة المندوب ورفع القياسات اللازمة، سيتم تزويدك بالمبلغ النهائي بشكل دقيق.</p>
                </div>
              );
            })()}

            {/* أزرار الإجراء */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://wa.me/966504824968"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto min-w-[220px] px-6 md:px-8 py-4 bg-[#25D366] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#20bd5a] transition-all active:scale-95 shadow-lg min-h-[52px]"
              >
                <span className="material-symbols-outlined text-xl">chat_bubble</span>
                <span>تواصل معنا عبر واتساب</span>
              </a>
              <button
                onClick={() => setStep(0)}
                className="w-full sm:w-auto min-w-[220px] px-6 md:px-8 py-4 border border-outline-variant/30 text-on-surface rounded-xl font-bold text-sm hover:bg-white/50 transition-all active:scale-95 min-h-[52px]"
              >
                العودة إلى المعرض الرئيسي
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ─── صفحة الإلغاء ────────────────────────────────────────────────────────────

const CancelStep = () => {
  const { setStep, cancelledOrders } = useStore();
  const last = cancelledOrders[cancelledOrders.length - 1];

  const designLabel = last?.design === 'malaki' ? 'ملكي' : last?.design === 'neom' ? 'نيوم' : 'صحراء';
  const sizeLabel = last?.size === 'double' ? 'مزدوجة' : 'مفردة';
  const colorLabel = last?.color === 'noir' ? 'أسود' : 'بيج';

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body pt-16">
      <WizardStyles />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md glass-panel rounded-2xl p-8 text-center shadow-2xl border border-white/20">

          <div className="w-20 h-20 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-red-400">cancel</span>
          </div>

          <h2 className="text-3xl font-bold text-on-surface mb-2">تم إلغاء الطلب</h2>
          <p className="text-secondary text-sm mb-6">تم حفظ بياناتك. يسعدنا خدمتك في أي وقت.</p>

          {last && (
            <div className="bg-white/80 rounded-xl p-5 mb-6 border border-outline-variant/15 text-right space-y-2">
              <p className="text-[10px] font-bold tracking-widest text-secondary mb-3">ملخص الطلب الملغى</p>
              <div className="flex justify-between text-sm"><span className="text-secondary">الاسم</span><span className="font-semibold">{last.customerName}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary">الجوال</span><span className="font-semibold" dir="ltr">{last.customerPhone}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary">التصميم</span><span className="font-semibold">{designLabel}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary">الحجم</span><span className="font-semibold">{sizeLabel}</span></div>
              <div className="flex justify-between text-sm"><span className="text-secondary">اللون</span><span className="font-semibold">{colorLabel}</span></div>
              <div className="flex justify-between text-sm pt-2 border-t border-outline-variant/10">
                <span className="text-secondary">وقت الإلغاء</span>
                <span className="font-semibold text-[11px]">{new Date(last.cancelledAt).toLocaleString('ar-SA')}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setStep(1)}
              className="w-full py-4 gold-gradient text-white font-bold rounded-xl shadow-lg"
            >
              إعادة الطلب من جديد
            </button>
            <button
              onClick={() => setStep(0)}
              className="w-full py-3 text-secondary font-bold text-sm hover:text-on-surface transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Wizard;
