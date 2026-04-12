import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

// --- Helper: Get Image Name ---
const getImageName = (design, size, fixation, color) => {
  if (!design) return null;
  const d = design === 'sahara' ? 'sahra' : design;
  const s = size || 'single';
  const f = fixation || 'column';
  const c = color || 'beige';
  if (d === 'sahra') return `${d}_${s}_${c}.png`;
  return `${d}_${s}_${f}_${c}.png`;
};

const slideVariants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
};

const MapCenterer = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.invalidateSize().setView(position, 15, { animate: true });
  }, [position, map]);
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
  `}</style>
);

const Wizard = () => {
  const { currentStep, setStep } = useStore();
  const wizardTopRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  if (currentStep === 8) return <Confirmation />;
  if (currentStep === 9) return <CancelStep />;

  return (
    <div ref={wizardTopRef} className="min-h-screen bg-surface font-body text-on-surface flex flex-col pt-20">
      <WizardStyles />

      {/* Sidebar Navigation */}
      <aside className="fixed right-0 top-24 h-[calc(100vh-6rem)] w-24 rounded-l-3xl bg-white/80 backdrop-blur-xl z-40 shadow-2xl shadow-[#735c00]/5 flex flex-col items-center py-8 gap-4 hidden md:flex font-manrope">
        <div className="mb-4 text-center">
          <p className="uppercase tracking-[0.2em] text-[10px] text-zinc-400">Step</p>
          <p className="font-bold text-[#735c00]">{`0${currentStep} / 06`}</p>
        </div>

        <StepIcon icon="person" label="Info" active={currentStep === 1} onClick={() => setStep(1)} />
        <StepIcon icon="charging_station" label="Design" active={currentStep === 2} onClick={() => setStep(2)} />
        <StepIcon icon="architecture" label="Frame" active={currentStep === 3 || currentStep === 4} onClick={() => setStep(3)} />
        <StepIcon icon="texture" label="Textile" active={currentStep === 5} onClick={() => setStep(5)} />
        <StepIcon icon="settings_input_component" label="Review" active={currentStep === 6} onClick={() => setStep(6)} />
        <StepIcon icon="pin_drop" label="Location" active={currentStep === 7} onClick={() => setStep(7)} />

        <div className="mt-auto">
          <button className="bg-surface-container-highest text-primary p-3 rounded-full">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow pr-0 md:pr-24 px-6 py-12 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} variants={slideVariants} initial="enter" animate="center" exit="exit">
              {currentStep === 1 && <Step1 />}
              {currentStep === 2 && <Step2 />}
              {currentStep === 3 && <Step3 />}
              {currentStep === 4 && <Step4 />}
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

const StepIcon = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex flex-col items-center justify-center rounded-xl mx-2 py-4 w-16 cursor-pointer transition-all ${active ? 'gold-gradient text-white shadow-lg' : 'text-zinc-400 hover:bg-zinc-100'}`}
  >
    <span className="material-symbols-outlined mb-1">{icon}</span>
    <span className="uppercase tracking-widest text-[8px] font-bold">{label}</span>
  </div>
);

// --- Step 1: User Info (Aurum Luxury Design) ---
const Step1 = () => {
  const { customerName, customerPhone, updateField, nextStep } = useStore();
  const valid = customerName.trim().length > 2 && customerPhone.startsWith('05') && customerPhone.length === 10;

  return (
    <div className="min-h-screen py-12 flex flex-col items-center justify-center relative">
      {/* Background Decorative Elements */}
      <div className="fixed top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-1/4 -left-20 w-80 h-80 bg-primary-container/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      {/* Main Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl glass-panel p-12 md:p-16 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] bg-white/70 backdrop-blur-3xl border border-white/40"
      >
        <div className="text-center space-y-6 mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[0.625rem] font-bold uppercase tracking-widest">Step 01</span>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-neutral-900 leading-tight">المعلومات الأساسية</h2>
          <p className="text-neutral-500 text-lg leading-relaxed max-w-md mx-auto">
            ابدأ بتخصيص تجربتك، يرجى تزويدنا بتفاصيل التواصل الخاصة بك لنتمكن من حفظ إعدادات التصميم الخاص بك.
          </p>
        </div>

        <form className="space-y-8 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); if (valid) nextStep(); }}>
          {/* Full Name Field */}
          <div className="space-y-2">
            <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-neutral-400 pr-1 text-right">الاسم الكامل</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-neutral-300 group-focus-within:text-primary transition-colors text-xl">person</span>
              </div>
              <input
                className="block w-full pr-12 pl-4 py-4 bg-white/50 border border-neutral-100 rounded-xl text-lg transition-all focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary placeholder:text-neutral-300 placeholder:font-light text-right outline-none"
                placeholder="أدخل اسمك بالكامل هنا"
                type="text"
                value={customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <label className="block text-[0.6875rem] font-bold uppercase tracking-widest text-neutral-400 pr-1 text-right">رقم الجوال</label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-neutral-300 group-focus-within:text-primary transition-colors text-xl">call</span>
              </div>
              <input
                className="block w-full pr-12 pl-4 py-4 bg-white/50 border border-neutral-100 rounded-xl text-lg text-right transition-all focus:bg-white focus:ring-2 focus:ring-primary/10 focus:border-primary placeholder:text-neutral-300 placeholder:font-light outline-none"
                dir="ltr"
                placeholder="+966 5X XXX XXXX"
                type="tel"
                value={customerPhone}
                onChange={(e) => updateField('customerPhone', e.target.value)}
              />
            </div>
            <p className="text-[0.625rem] text-neutral-400 pr-1 flex items-center gap-1.5 justify-end">
              <span className="text-right">سنستخدم هذا الرقم لإرسال رابط تفاصيل التصميم الخاص بك.</span>
              <span className="material-symbols-outlined text-[10px]">info</span>
            </p>
          </div>

          {/* CTA */}
          <div className="pt-6">
            <button
              disabled={!valid}
              onClick={nextStep}
              className="primary-gradient w-full py-5 rounded-xl text-white font-headline text-lg font-bold shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 group disabled:opacity-30 disabled:hover:translate-y-0"
            >
              <span>الاستمرار لتصميم الموديل</span>
              <span className="material-symbols-outlined group-hover:translate-x-[-4px] transition-transform">arrow_back</span>
            </button>

            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                <span className="material-symbols-outlined text-green-600 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span className="text-[0.625rem] text-green-700 font-manrope uppercase tracking-tight font-bold">Secure Configurator</span>
              </div>

              {/* Mini Badges */}
              <div className="flex gap-8 border-t border-neutral-100 pt-6 w-full justify-center">
                <div className="text-center">
                  <p className="text-[0.625rem] font-bold text-neutral-400 uppercase tracking-widest mb-1">Time Estimate</p>
                  <p className="text-xs font-semibold text-neutral-700">4 Minutes</p>
                </div>
                <div className="text-center">
                  <p className="text-[0.625rem] font-bold text-neutral-400 uppercase tracking-widest mb-1">Guided By</p>
                  <p className="text-xs font-semibold text-neutral-700">Aurum AI</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// --- Step 2: Design Choice (Compact Version) ---
const Step2 = () => {
  const { design, updateField, nextStep, prevStep } = useStore();
  const designs = [
    { id: 'malaki', title: 'ملكي', desc: 'خطوط منحنية بلمسة راقية', img: '/image/malaki_single_column_beige.png', tag: 'Royal Choice' },
    { id: 'neom', title: 'نيوم', desc: 'تصميم عصري بواجهة حديثة', img: '/image/neom_single_column_beige.png', tag: 'Minimalist Elite', featured: true },
    { id: 'sahara', title: 'صحراء', desc: 'تصميم متوازن بطابع أصيل', img: '/image/sahra_single_beige.png', tag: 'Aerodynamic Form' }
  ];

  return (
    <div className="text-right">
      <section className="mb-12">
        <span className="font-manrope text-[11px] tracking-[0.3em] text-primary font-bold uppercase block mb-2">Step 01 of 06</span>
        <h1 className="text-[2.75rem] font-extrabold leading-tight tracking-tight text-on-surface">اختر التصميم المفضل</h1>
        <p className="text-secondary max-w-2xl text-base leading-relaxed mt-1">ابدأ رحلتك لتخصيص مظلة سيارتك الفاخرة. تصاميمنا تجمع بين المتانة الهندسية والجمالية العصرية.</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {designs.map(d => (
          <div
            key={d.id}
            onClick={() => updateField('design', d.id)}
            className={`group relative flex flex-col bg-surface-container-lowest/80 backdrop-blur-md rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border ${design === d.id ? 'ring-2 ring-primary border-primary shadow-2xl' : 'border-surface-container hover:border-[#d0c5af]/30'} active:scale-[0.98]`}
          >
            {d.featured && (
              <div className="absolute top-4 right-4 z-10">
                <div className="bg-primary text-white px-3 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase">Most Selected</div>
              </div>
            )}
            <div className="h-[280px] overflow-hidden">
              <img alt={d.title} src={d.img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="p-6 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-on-surface">{d.title}</h3>
                <span className={`material-symbols-outlined text-xl ${design === d.id ? 'text-primary' : 'text-zinc-300'}`} style={{ fontVariationSettings: design === d.id ? "'FILL' 1" : "" }}>
                  {design === d.id ? 'check_circle' : 'star'}
                </span>
              </div>
              <p className="text-on-surface-variant leading-relaxed text-xs">{d.desc}</p>
              <div className="mt-2 pt-4 border-t border-surface-container flex items-center justify-between">
                <span className={`font-manrope text-[10px] tracking-widest uppercase font-semibold ${design === d.id ? 'text-primary' : 'text-secondary'}`}>{d.tag}</span>
                <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-xs">arrow_back</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-16 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <span className="font-manrope text-[10px] text-zinc-400 tracking-widest uppercase">Estimated Base Price</span>
            <span className="text-2xl font-bold text-on-surface tracking-tight">12,500 SAR</span>
          </div>
        </div>
        <button
          onClick={nextStep}
          disabled={!design}
          className="group flex items-center gap-4 gold-gradient px-10 py-4 rounded-full text-white font-bold tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-30"
        >
          <span className="font-manrope text-sm">CONTINUE TO SIZE</span>
          <span className="material-symbols-outlined group-hover:-translate-x-2 transition-transform text-lg">arrow_back</span>
        </button>
      </div>
    </div>
  );
};

// --- Step 3: Size Selection ---
const Step3 = () => {
  const { size, design, color, fixation, updateField, nextStep, prevStep } = useStore();
  const options = [
    { id: 'single', label: 'مظلة سيارة واحدة', desc: 'مثالية للمساحات المحدودة والفلل السكنية.', icon: 'directions_car' },
    { id: 'double', label: 'مظلة سيارتين فأكثر', desc: 'الحل الأمثل للعائلات والمجمعات الواسعة.', icon: 'airport_shuttle' },
  ];
  const previewImg = getImageName(design, size, fixation || 'column', color || 'beige');

  return (
    <div className="text-right flex flex-col md:flex-row gap-12">
      {/* Image preview — same as Step 4 */}
      <div className="flex-1 h-[500px] relative rounded-xl overflow-hidden shadow-2xl">
        <img
          key={previewImg}
          alt="Size Preview"
          className="step-preview w-full h-full object-cover transition-all duration-700"
          src={`/image/${previewImg || 'malaki_single_column_beige.png'}`}
          onError={(e) => { e.target.src = '/image/malaki_single_column_beige.png'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/30">
          <span className="text-[10px] text-secondary uppercase tracking-widest block mb-1">Size Preview</span>
          <span className="text-sm font-bold text-on-surface">
            {size === 'single' ? 'مظلة سيارة واحدة' : size === 'double' ? 'مظلة سيارتين فأكثر' : 'اختر الحجم'}
          </span>
        </div>
      </div>

      {/* Options — same card style as Step 4 */}
      <div className="w-full md:w-[480px]">
        <section className="mb-10">
          <span className="font-manrope text-[11px] tracking-[0.3em] text-primary font-bold uppercase block mb-2">Step 03 OF 06</span>
          <h1 className="text-4xl font-bold text-on-surface tracking-tight leading-tight">حدد الحجم المطلوب</h1>
          <p className="text-secondary text-sm leading-relaxed mt-2">اختر الحجم المناسب لمساحة ركن سياراتك.</p>
        </section>

        <div className="space-y-4">
          {options.map(o => (
            <div
              key={o.id}
              onClick={() => updateField('size', o.id)}
              className={`p-6 bg-surface-container-lowest rounded-xl border transition-all duration-500 cursor-pointer flex items-center gap-6 ${size === o.id ? 'border-primary ring-2 ring-primary shadow-xl' : 'border-surface-container shadow-sm hover:border-[#d0c5af]/30'}`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${size === o.id ? 'bg-primary text-white' : 'bg-surface-container-low text-zinc-400'}`}>
                <span className="material-symbols-outlined text-3xl">{o.icon}</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold mb-1">{o.label}</h3>
                <p className="text-secondary text-xs leading-relaxed">{o.desc}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${size === o.id ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
                {size === o.id && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-4">
          <button onClick={nextStep} disabled={!size} className="flex-1 py-5 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 text-center">
            الاستمرار لطريقة التثبيت
          </button>
          <button onClick={prevStep} className="w-20 py-5 rounded-xl border-2 border-outline-variant/30 text-secondary hover:bg-white transition-all flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Step 4: Fixation ---
const Step4 = () => {
  const { design, size, fixation, color, updateField, nextStep, prevStep } = useStore();
  const types = [
    { id: 'wall', label: 'معلقة على الجدار', desc: 'تثبيت مباشر على الجدار بدون أعمدة أرضية، لمظهر عصري وأنيق', icon: 'architecture' },
    { id: 'column', label: 'على أعمدة', desc: 'تثبيت على أعمدة مثبتة في الأرض لضمان الثبات العالي', icon: '' },
  ];
  const previewImg = getImageName(design, size, fixation, color || 'beige');

  return (
    <div className="text-right flex flex-col md:flex-row gap-12">
      {/* Split layout: Image Left */}
      <div className="flex-1 h-[500px] relative rounded-xl overflow-hidden shadow-2xl">
        <img
          key={previewImg}
          alt="Fixation Preview"
          className="w-full h-full object-cover transition-all duration-700 step-preview"
          src={`/image/${previewImg || 'malaki_single_column_beige.png'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="absolute bottom-6 right-6 glass-panel p-4 rounded-xl border border-white/20">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest block mb-1">Architecture Preview</span>
          <span className="text-sm font-bold text-on-surface">{fixation === 'wall' ? 'هيكل معلق متطور' : 'هيكل قائم بأعمدة صلبة'}</span>
        </div>
      </div>

      {/* Split layout: Options Right */}
      <div className="w-full md:w-[480px]">
        <section className="mb-10">
          <span className="font-manrope text-[11px] tracking-[0.3em] text-primary font-bold uppercase block mb-2">Step 04 OF 06</span>
          <h1 className="text-4xl font-bold text-on-surface tracking-tight leading-tight">طريقة التثبيت</h1>
          <p className="text-secondary max-w-xl text-sm leading-relaxed mt-2">اختر نظام التثبيت الذي يتناسب مع المساحة الإنشائية لمنزلك.</p>
        </section>

        <div className="space-y-4">
          {types.map(t => (
            <div
              key={t.id}
              onClick={() => updateField('fixation', t.id)}
              className={`p-6 bg-surface-container-lowest rounded-xl border transition-all duration-500 cursor-pointer flex items-center gap-6 ${fixation === t.id ? 'border-primary ring-2 ring-primary shadow-xl' : 'border-surface-container shadow-sm hover:border-[#d0c5af]/30'}`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${fixation === t.id ? 'gold-gradient text-white' : 'bg-surface-container-low text-zinc-400'}`}>
                <span className="material-symbols-outlined text-3xl">{t.icon}</span>
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-bold mb-1">{t.label}</h3>
                <p className="text-on-surface-variant text-xs leading-relaxed">{t.desc}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${fixation === t.id ? 'border-primary bg-primary' : 'border-outline-variant'}`}>
                {fixation === t.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-4">
          <button onClick={nextStep} disabled={!fixation} className="flex-1 py-5 gold-gradient text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center">
            الاستمرار للون القماش
          </button>
          <button onClick={prevStep} className="w-20 py-5 rounded-xl border-2 border-outline-variant/30 text-secondary hover:bg-white transition-all flex items-center justify-center">
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Step 5: Color Selection ---
const Step5 = () => {
  const { design, size, fixation, color, updateField, nextStep, prevStep } = useStore();
  const colors = [
    { id: 'beige', label: 'بيج', hex: '#F5F5DC' },
    { id: 'noir', label: 'أسود ملكي', hex: '#1A1A1A' }
  ];
  const previewImg = getImageName(design, size, fixation, color);

  return (
    <div className="text-right flex flex-col md:flex-row gap-12">
      <div className="flex-1 h-[600px] relative rounded-xl overflow-hidden shadow-2xl">
        <img alt="Preview" className="w-full h-full object-cover" src={`/image/${previewImg || 'malaki_single_column_beige.png'}`} />

      </div>

      <div className="w-full md:w-[420px] static md:sticky md:top-36">
        <div className="mb-10">
          <h1 className="text-4xl font-black text-on-surface leading-tight mb-4">اختر لون القماش</h1>
          <p className="text-secondary leading-relaxed text-sm">اختر من بين مجموعتنا الحصرية من الأقمشة المقاومة للعوامل الجوية.</p>
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4">
            {colors.map(c => (
              <div
                key={c.id}
                onClick={() => updateField('color', c.id)}
                className={`p-6 rounded-xl border-2 flex items-center justify-between transition-all group cursor-pointer ${color === c.id ? 'bg-surface-container-lowest border-primary shadow-lg' : 'bg-surface-container-low border-transparent hover:border-[#d0c5af]/30'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full shadow-inner" style={{ backgroundColor: c.hex }}></div>
                    {color === c.id && <div className="absolute -inset-1.5 border border-[#7f7663] rounded-full"></div>}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{c.label}</div>
                    <div className="text-[11px] text-zinc-400 tracking-wider uppercase">{c.tag}</div>
                  </div>
                </div>
                {color === c.id && <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
              </div>
            ))}
          </div>

          <div className="pt-6 flex flex-col gap-4">
            <button onClick={nextStep} className="w-full py-5 gold-gradient text-on-primary font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center">
              الاستمرار للخطوة التالية
            </button>
            <button onClick={prevStep} className="w-full py-4 text-secondary font-bold text-sm hover:text-on-surface transition-colors flex items-center justify-center gap-2">
              <span>العودة للخطوة السابقة</span>
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Step 6: Review ---
const Step6 = () => {
  const { design, size, fixation, color, customerName, nextStep, prevStep } = useStore();
  const previewImg = getImageName(design, size, fixation, color) || 'malaki_single_column_beige.png';

  return (
    <div className="text-right">
      <header className="flex justify-between items-end mb-16">
        <div>
          <span className="text-primary font-manrope tracking-[0.3em] text-[10px] uppercase block mb-2">Step 06 — Summary</span>
          <h1 className="text-4xl font-bold text-on-surface mb-2">مراجعة التفاصيل</h1>
          <p className="text-secondary max-w-lg leading-relaxed">يرجى مراجعة المواصفات المختارة لمظلة سيارتك الفاخرة قبل التأكيد النهائي.</p>
        </div>
        <div className="text-left font-manrope">
          <span className="text-xs text-zinc-400 block uppercase tracking-widest">Total Investment</span>
          <span className="text-4xl font-extrabold text-[#735c00]">24,500 <span className="text-sm font-normal text-secondary">SAR</span></span>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-7 h-[500px] rounded-xl overflow-hidden shadow-sm relative">
          <img alt="Preview" className="w-full h-full object-cover" src={`/image/${previewImg}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="absolute bottom-8 right-8 text-white">
            <p className="font-manrope tracking-widest text-[10px] uppercase opacity-80 mb-1">Active Design</p>
            <h2 className="text-2xl font-bold">{design === 'malaki' ? 'ملكي' : design === 'neom' ? 'نيوم' : 'صحراء'}</h2>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          <div className="glass-panel p-8 rounded-xl border border-white/20 shadow-xl shadow-[#735c00]/5 flex flex-col gap-6">
            <div className="flex justify-between items-start border-b border-outline-variant/10 pb-4">
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest block mb-1">Dimensions</span>
                <p className="text-lg font-semibold">{size === 'double' ? 'مزدوجة (سيارتين)' : 'مفردة (سيارة واحدة)'}</p>
              </div>
              <span className="material-symbols-outlined text-zinc-400">aspect_ratio</span>
            </div>
            <div className="flex justify-between items-start border-b border-outline-variant/10 pb-4">
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest block mb-1">Fabric & Texture</span>
                <p className="text-lg font-semibold">{color === 'noir' ? 'أسود ملكي فاخر' : 'بيج كلاسيك ناعم'}</p>
              </div>
              <div className={`w-8 h-8 rounded-full border-2 border-white shadow-sm ${color === 'noir' ? 'bg-[#1A1A1A]' : 'bg-[#F5F5DC]'}`}></div>
            </div>
            <div className="flex justify-between items-start border-b border-outline-variant/10 pb-4">
              <div>
                <span className="text-[10px] text-primary uppercase font-bold tracking-widest block mb-1">Framework</span>
                <p className="text-lg font-semibold">{fixation === 'wall' ? 'تثبيت معلق على الجدار' : 'تثبيت على أعمدة قائمة'}</p>
              </div>
              <span className="material-symbols-outlined text-zinc-400">architecture</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={nextStep} className="flex-1 py-5 px-8 rounded-xl gold-gradient text-white font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3">
              <span>تأكيد ومعاينة الموقع</span>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button onClick={prevStep} className="w-20 py-5 rounded-xl border-2 border-outline-variant/30 text-secondary hover:bg-white transition-all flex items-center justify-center">
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>

          <div className="flex items-center gap-4 px-4">
            <span className="material-symbols-outlined text-[#735c00]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            <p className="text-[11px] text-zinc-500 leading-tight">ضمان لمدة 10 سنوات على الهيكل و 5 سنوات على الأنسجة.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Step 7: Location ---
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

  const submitOrder = () => {
    setIsSubmitting(true);
    const randId = Math.random().toString(36).substring(7).toUpperCase();
    const finalId = `ATL5-${customerName}-${randId}`;
    updateField('finalId', finalId);
    setTimeout(() => setStep(8), 2000);
  };

  return (
    <div className="relative h-[calc(100vh-200px)] flex flex-row-reverse overflow-hidden rounded-3xl border border-outline-variant/10 shadow-2xl">
      <section className="flex-1 relative h-full bg-surface-container">
        <div className="w-full h-full relative">
          <MapContainer center={position} zoom={13} style={{ width: '100%', height: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            <Marker position={position} icon={new L.Icon({
              iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41]
            })} />
            <MapCenterer position={position} />
          </MapContainer>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-[500] pointer-events-none">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-[#735c00] to-[#d4af37] rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#735c00] rotate-45 border-r-4 border-b-4 border-white -z-10"></div>
            </div>
            <div className="mt-4 px-4 py-2 glass-panel rounded-xl shadow-lg border border-outline-variant/20">
              <span className="text-on-surface font-semibold text-sm">موقع التركيب المختار</span>
            </div>
          </div>

          <div className="absolute bottom-12 right-12 flex flex-col gap-2 z-[500]">
            <button onClick={handleAutoLocate} className="w-12 h-12 glass-panel rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-all shadow-lg border border-outline-variant/15">
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>
        </div>
      </section>

      <section className="w-full md:w-[480px] h-full bg-white z-10 flex flex-col p-12 overflow-y-auto text-right">
        <div className="mb-10">
          <span className="text-primary font-manrope font-bold tracking-[0.2em] text-[11px] mb-2 block uppercase">STEP 07 OF 06</span>
          <h1 className="text-4xl font-headline font-bold text-on-surface leading-tight">تحديد موقع التركيب</h1>
          <p className="text-secondary mt-4 leading-relaxed text-sm">يرجى تحديد الموقع الدقيق الذي سيتم فيه تركيب مظلة ATLASHI لضمان معايرة هندسية دقيقة للموقع.</p>
        </div>

        <div className="space-y-8 flex-grow">
          <div className="space-y-4">
            <label className="block text-[11px] font-manrope font-bold tracking-widest text-outline uppercase">Address Details</label>
            <div className="relative">
              <input
                className="w-full bg-surface-container-low border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/50 text-right font-medium placeholder:text-zinc-400 outline-none"
                placeholder="ابحث عن عنوان..."
                value={address}
                onChange={(e) => updateField('address', e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-4 top-4 text-zinc-400">search</span>
            </div>
          </div>


        </div>

        <div className="mt-auto pt-10 flex flex-col gap-4">
          <button
            onClick={submitOrder}
            disabled={isSubmitting}
            className="w-full py-5 rounded-xl bg-gradient-to-br from-[#735c00] to-[#d4af37] text-white font-bold tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-30"
          >
            <span>{isSubmitting ? 'جاري الإرسال...' : 'إتمام الطلب النهائي'}</span>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        </div>
      </section>
    </div>
  );
};

// --- Confirmation ---
const Confirmation = () => {
  const { finalId, setStep } = useStore();
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <WizardStyles />
      <main className="flex-grow flex items-center justify-center relative py-12 px-6">
        <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
          <img className="w-full h-full object-cover grayscale" src="/image/malaki_double_column_noir.png" />
        </div>
        <div className="relative z-10 w-full max-w-5xl mx-auto">
          <div className="glass-panel border border-white/20 rounded-2xl p-12 text-center shadow-2xl shadow-primary/5">
            <div className="mb-8 relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-[#735c00] to-[#d4af37] rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20 mx-auto">
                <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              </div>
              <div className="absolute -top-2 -right-2 text-primary-container">
                <span className="material-symbols-outlined text-xl">diamond</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-on-surface mb-2 font-headline">طلبكم قيد التنفيذ</h1>
            <p className="text-secondary text-sm tracking-widest font-manrope uppercase mb-8">Order ID: <span className="text-primary font-bold">{finalId}</span></p>

            <div className="max-w-md mx-auto bg-white/80 rounded-xl p-8 mb-10 border border-outline-variant/15 text-right">
              <p className="text-lg leading-relaxed text-on-surface-variant font-light mb-6">
                نشكركم على اختياركم أطلسي. تم استلام تفاصيل تهيئة مظلتكم بنجاح. سيقوم فريقنا بالتواصل معكم قريباً.
              </p>
              <div className="flex flex-col gap-3 text-right">
                <div className="flex items-center gap-3 text-sm text-secondary flex-row-reverse">
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <button className="min-w-[240px] px-8 py-4 gold-gradient text-white rounded-xl font-bold tracking-widest uppercase text-xs hover:shadow-xl transition-all active:scale-95 duration-300">
                تحميل ملف المواصفات PDF
              </button>
              <button onClick={() => setStep(0)} className="min-w-[240px] px-8 py-4 border border-outline-variant/30 text-on-surface rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-white/50 transition-all active:scale-95 duration-300">
                العودة إلى المعرض الرئيسي
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const CancelStep = () => {
  const { setStep } = useStore();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center mb-10 mx-auto">
        <span className="material-symbols-outlined text-5xl text-secondary">sentiment_dissatisfied</span>
      </div>
      <h2 className="text-4xl font-headline font-bold text-on-surface mb-4">تم إلغاء الطلب</h2>
      <button className="bg-secondary text-white px-12 py-4 rounded-lg font-bold shadow-lg" onClick={() => setStep(0)}>العودة للرئيسية</button>
    </div>
  );
};

export default Wizard;
