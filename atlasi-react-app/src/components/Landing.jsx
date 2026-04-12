import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store';

const heroImages = [
  "/image/lux.jpg",
  "/image/lux1.webp",
];

const projectCards = [
  { image: "/image/malaki_double_column_beige.png", title: "تصميم ملكي فاخر", category: "الملكي الفاخر", badgeColor: "bg-gold-accent/90" },
  { image: "/image/malaki_double_column_noir.png", title: "ملكي - نسخة الذهب الأسود", category: "الملكي الفاخر", badgeColor: "bg-[#1c1b1b]/90" },
  { image: "/image/malaki_double_wall_beige.png", title: "ملكي معلق - بيج", category: "الملكي الفاخر", badgeColor: "bg-gold-accent/90" },
  { image: "/image/malaki_double_wall_noir.png", title: "ملكي معلق - أسود", category: "الملكي الفاخر", badgeColor: "bg-[#1c1b1b]/90" },
  { image: "/image/malaki_single_column_beige.png", title: "ملكي مفرد", category: "الملكي الفاخر", badgeColor: "bg-gold-accent/90" },
  { image: "/image/malaki_single_column_noir.png", title: "ملكي مفرد - أسود", category: "الملكي الفاخر", badgeColor: "bg-[#1c1b1b]/90" },
  { image: "/image/malaki_single_wall_beige.png", title: "ملكي معلق مفرد", category: "الملكي الفاخر", badgeColor: "bg-gold-accent/90" },
  { image: "/image/malaki_single_wall_noir.png", title: "ملكي معلق مفرد - أسود", category: "الملكي الفاخر", badgeColor: "bg-[#1c1b1b]/90" },
  { image: "/image/neom_double_column_beige.png", title: "نيوم المزدوجة", category: "العصري الفاخر", badgeColor: "bg-gold-accent/90" },
  { image: "/image/neom_double_column_noir.png", title: "نيوم سوداء فاخرة", category: "العصري الفاخر", badgeColor: "bg-[#1c1b1b]/90" },
  { image: "/image/neom_double_wall_beige.png", title: "نيوم معلقة مزدوجة", category: "العصري الفاخر", badgeColor: "bg-gold-accent/90" },
  { image: "/image/neom_double_wall_noir.png", title: "نيوم معلقة سوداء", category: "العصري الفاخر", badgeColor: "bg-[#1c1b1b]/90" },
  { image: "/image/neom_single_column_beige.png", title: "نيوم مفردة هادئة", category: "العصري الفاخر", badgeColor: "bg-gold-accent/90" },
  { image: "/image/neom_single_column_noir.png", title: "نيوم مفردة سوداء", category: "العصري الفاخر", badgeColor: "bg-[#1c1b1b]/90" },
  { image: "/image/neom_single_wall_beige.png", title: "نيوم معلقة مفردة", category: "العصري الفاخر", badgeColor: "bg-gold-accent/90" },
  { image: "/image/neom_single_wall_noir.png", title: "نيوم معلقة مفردة سوداء", category: "العصري الفاخر", badgeColor: "bg-[#1c1b1b]/90" },
  { image: "/image/sahra_double_beige.png", title: "صحراء مزدوجة", category: "الصحراء الكلاسيكي", badgeColor: "bg-gold-accent/90" },
  { image: "/image/sahra_double_noir.png", title: "صحراء مزدوجة سوداء", category: "الصحراء الكلاسيكي", badgeColor: "bg-[#1c1b1b]/90" },
  { image: "/image/sahra_single_beige.png", title: "صحراء مفردة واثقة", category: "الصحراء الكلاسيكي", badgeColor: "bg-gold-accent/90" },
  { image: "/image/sahra_single_noir.png", title: "صحراء مفردة سوداء", category: "الصحراء الكلاسيكي", badgeColor: "bg-[#1c1b1b]/90" }
];

const loyaltySteps = [
  { num: '1', title: 'المستوى الأساسي', sub: 'إصدار فوري والخصم الأول' },
  { num: '2', title: 'المستوى الفضي', sub: 'خصم 5% على الصيانة الدورية' },
  { num: '3', title: 'المستوى الذهبي', sub: 'خصم 10% على ثاني مظلة' },
  { num: '4', title: 'مستوى النخبة', sub: 'خصم 15% وصيانة سنوية مجانية' },
  { num: '★', title: 'كبار العملاء', sub: 'تغطية شاملة ومزايا حصرية (50%)', highlight: true },
];

const TOTAL = projectCards.length;

const Landing = () => {
  const setStep = useStore(state => state.setStep);
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [scrollPct, setScrollPct] = useState(0);
  const [paused, setPaused] = useState(false);

  const scrollRef = useRef(null);
  const cardRefs = useRef([]);

  // Hero slideshow
  useEffect(() => {
    const t = setInterval(() => setHeroIndex(i => (i + 1) % heroImages.length), 10000);
    return () => clearInterval(t);
  }, []);

  const getActiveFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 0;
    const viewportCenter = el.scrollLeft + el.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(cardCenter - viewportCenter);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  }, []);

  const scrollToIndex = useCallback((i) => {
    const card = cardRefs.current[i];
    const el = scrollRef.current;
    if (!card || !el) return;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    el.scrollTo({ left: cardCenter - el.clientWidth / 2, behavior: 'smooth' });
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setActiveIdx(getActiveFromScroll());
    const pct = el.scrollLeft / (el.scrollWidth - el.clientWidth);
    setScrollPct(Math.max(0, Math.min(1, pct)));
  }, [getActiveFromScroll]);

  // Attach scroll listener
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Gallery autoplay
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => scrollToIndex((activeIdx + 1) % TOTAL), 4000);
    return () => clearInterval(t);
  }, [paused, activeIdx, scrollToIndex]);

  const cardClass = (i) => {
    const d = Math.abs(i - activeIdx);
    if (d === 0) return 'luxe-card is-active';
    if (d === 1) return 'luxe-card is-near';
    return 'luxe-card is-far';
  };

  return (
    <main className="bg-background text-on-surface">

      {/* ── Hero Section ── */}
      <section className="relative h-[80vh] md:h-[90vh] flex items-center overflow-hidden">

        {/* Slideshow images — crossfade */}
        {heroImages.map((src, i) => (
          <img
            key={src}
            src={src}
            alt="luxury shade structure"
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            style={{ opacity: i === heroIndex ? 1 : 0, zIndex: 0 }}
          />
        ))}

        {/* Light gradient overlay — white behind text (right), clear on left (photo) */}
        <div className="absolute inset-0 z-10
          bg-gradient-to-t from-white/85 via-white/40 to-transparent
          md:bg-gradient-to-l md:from-white/92 md:via-white/60 md:to-transparent" />

        {/* Text content */}
        <div className="relative z-20 w-full px-8 md:container md:mx-auto flex flex-col items-center text-center md:items-start md:text-right">
          <span className="inline-block px-3 py-1 bg-[#1c1b1b]/10 text-[#1c1b1b] font-bold text-[10px] tracking-widest rounded mb-4 md:mb-6 border border-[#1c1b1b]/20">
            نخبة المظلات في المملكة العربية السعودية
          </span>
          <h2 className="text-4xl md:text-7xl font-black text-[#1c1b1b] leading-tight mb-4">
            نصمم الفخامة <br />
            <span style={{ color: '#735c00' }}>ونحمي سيارتك</span>
          </h2>
          <p className="font-body text-[#1c1b1b]/70 text-lg mb-8 max-w-md leading-relaxed">
            حلول تظليل هندسية تجمع بين القوة والجمال بتصاميم عصرية تناسب منزلك.
          </p>
          <button
            onClick={() => setStep(1)}
            className="bg-[#1c1b1b] hover:bg-black text-white font-bold py-4 px-10 rounded-lg shadow-xl transition-all active:scale-95 flex items-center gap-2 group"
          >
            اطلب تصميمك الآن
            <span className="material-symbols-outlined transition-transform group-hover:-translate-x-1">arrow_back</span>
          </button>

          {/* Dot indicators */}
          <div className="flex gap-2 mt-6">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === heroIndex ? 'w-8 bg-[#1c1b1b]' : 'w-3 bg-[#1c1b1b]/30'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Strip ── */}
      <section className="relative z-20 mt-0 md:mt-16 bg-white border-b border-[#1c1b1b]/8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-[#1c1b1b]/8">

          {/* الضمان */}
          <div className="flex items-center gap-5 px-8 py-8 group hover:bg-gold-accent/[0.03] transition-colors">
            <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl bg-surface-container-low border border-gold-accent/20 group-hover:border-gold-accent/50 group-hover:rotate-6 transition-all duration-500 shadow-sm">
              <span className="material-symbols-outlined text-gold-accent text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#1c1b1b] text-base leading-tight">الضمان الفضي: سنتان</p>
              <p className="font-bold text-gold-accent text-base leading-tight mt-0.5">الضمان الذهبي: 5 سنوات</p>
              <p className="text-secondary text-[10px] mt-1 pr-0.5">جودة معتمدة وخدمة شاملة</p>
            </div>
          </div>

          {/* سرعة */}
          <div className="flex items-center gap-5 px-8 py-8 group hover:bg-gold-accent/[0.03] transition-colors">
            <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl bg-surface-container-low border border-gold-accent/20 group-hover:border-gold-accent/50 group-hover:-rotate-6 transition-all duration-500 shadow-sm">
              <span className="material-symbols-outlined text-gold-accent text-3xl">speed</span>
            </div>
            <div className="text-right">
              <p className="font-extrabold text-[#1c1b1b] text-lg leading-tight uppercase tracking-tight">تركيب سريع</p>
              <p className="text-secondary text-xs mt-1">احترافية في الجدول الزمني</p>
              <div className="flex gap-1 mt-1.5 justify-end">
                 {[1,2,3].map(i => <div key={i} className="h-1 w-3 bg-gold-accent/30 rounded-full" />)}
              </div>
            </div>
          </div>

          {/* حماية */}
          <div className="flex items-center gap-5 px-8 py-8 group hover:bg-gold-accent/[0.03] transition-colors">
            <div className="w-14 h-14 shrink-0 flex items-center justify-center rounded-2xl bg-surface-container-low border border-gold-accent/20 group-hover:border-gold-accent/50 group-hover:scale-110 transition-all duration-500 shadow-sm">
              <span className="material-symbols-outlined text-gold-accent text-3xl">shield</span>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#1c1b1b] text-base leading-tight">حماية قصوى</p>
              <p className="text-secondary text-[10px] mt-1">عازل حراري بنسبة 100%</p>
            </div>
          </div>

        </div>
      </section>

      {/* ── Product Gallery — Luxe Scroll Snap ── */}
      <section className="py-16 md:py-24 bg-surface-container-low overflow-hidden" id="gallery">
        <div className="mb-10 md:mb-14 flex flex-col items-center text-center px-6">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#735c00]">نماذج من أعمالنا الفاخرة</h2>
          <p className="text-secondary text-sm mt-3">اسحب يميناً أو يساراً لاستعراض التصاميم</p>
        </div>

        {/* Scroll-snap viewport — full width, no clipping */}
        <div
          ref={scrollRef}
          className="luxe-carousel-viewport"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="luxe-carousel-track">
            {projectCards.map((card, i) => (
              <div
                key={i}
                ref={el => { cardRefs.current[i] = el; }}
                className={cardClass(i)}
                onClick={() => scrollToIndex(i)}
              >
                <img
                  alt={card.title}
                  src={card.image}
                  draggable={false}
                  loading={i < 4 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent flex flex-col justify-end p-5 text-right">
                  <span className={`inline-block w-fit px-3 py-1 ${card.badgeColor} rounded text-[9px] font-bold text-white uppercase tracking-widest mb-2`}>
                    {card.category}
                  </span>
                  <h3 className="text-white text-xl font-bold">{card.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nav: arrows + thin gold progress bar */}
        <div className="flex items-center justify-center gap-5 mt-6 px-6">
          <button
            onClick={() => scrollToIndex(Math.max(0, activeIdx - 1))}
            disabled={activeIdx === 0}
            className="w-9 h-9 rounded-full border border-outline-variant/40 flex items-center justify-center text-secondary hover:bg-white hover:border-[#735c00] hover:text-[#735c00] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>

          <div className="luxe-progress-track flex-1 max-w-[200px]">
            <div className="luxe-progress-fill" style={{ width: `${scrollPct * 100}%` }} />
          </div>

          <button
            onClick={() => scrollToIndex(Math.min(TOTAL - 1, activeIdx + 1))}
            disabled={activeIdx === TOTAL - 1}
            className="w-9 h-9 rounded-full border border-outline-variant/40 flex items-center justify-center text-secondary hover:bg-white hover:border-[#735c00] hover:text-[#735c00] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
        </div>

        {/* Subtle counter */}
        <p className="text-center text-[11px] text-secondary/60 mt-2 tracking-widest">
          {activeIdx + 1} / {TOTAL}
        </p>
      </section>

      {/* ── Golden Card Section ── */}
      <section className="py-16 md:py-32 relative bg-surface-container-lowest overflow-hidden" id="loyalty">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 order-2 md:order-1 text-right">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-on-surface">بطاقة الأطلسي الذهبية</h2>
              <p className="text-lg text-secondary leading-relaxed">
                انضم إلى النخبة واستمتع بمزايا حصرية صُممت خصيصاً لعملائنا المميزين.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-xl border border-[#D4AF37]/30 shadow-sm flex flex-col items-center text-center"
                style={{ background: 'linear-gradient(145deg, #fdf9ef, #fff8e7)' }}>
                <span className="material-symbols-outlined text-[#D4AF37] text-4xl mb-3">chat_bubble</span>
                <h4 className="font-bold text-sm mb-1 text-[#1c1b1b]">إصدار تلقائي</h4>
                <p className="text-[10px] text-secondary">عبر الواتساب مباشرة</p>
              </div>
              <div className="p-6 rounded-xl border border-[#D4AF37]/30 shadow-sm flex flex-col items-center text-center"
                style={{ background: 'linear-gradient(145deg, #fdf9ef, #fff8e7)' }}>
                <span className="material-symbols-outlined text-[#D4AF37] text-4xl mb-3">smartphone</span>
                <h4 className="font-bold text-sm mb-1 text-[#1c1b1b]">مرتبطة بالجوال</h4>
                <p className="text-[10px] text-secondary">سهولة الوصول الرقمي</p>
              </div>
              <div className="p-6 rounded-xl border border-[#D4AF37]/30 shadow-sm flex flex-col items-center text-center"
                style={{ background: 'linear-gradient(145deg, #fdf9ef, #fff8e7)' }}>
                <span className="material-symbols-outlined text-[#D4AF37] text-4xl mb-3">card_giftcard</span>
                <h4 className="font-bold text-sm mb-1 text-[#1c1b1b]">قابلة للإهداء</h4>
                <p className="text-[10px] text-secondary">شارك الفخامة مع أحبائك</p>
              </div>
            </div>
          </div>
          <div className="relative order-1 md:order-2 flex justify-center">
            <div className="relative z-10 w-full max-w-md aspect-[1.58/1] bg-gradient-to-br from-[#735b25] to-[#B89B5E] rounded-2xl p-8 text-white shadow-2xl flex flex-col justify-between overflow-hidden group transition-transform hover:scale-105 duration-500">
              <div className="flex justify-between items-start">
                <div className="font-bold text-xl tracking-wide">الأطلسي</div>
                <span className="material-symbols-outlined text-3xl text-white/40">contactless</span>
              </div>
              <div>
                <div className="text-lg tracking-[0.25em] mb-4 font-body">•••• •••• •••• 5542</div>
                <div className="flex justify-between items-end text-right">
                  <div>
                    <p className="text-[8px] opacity-60 font-bold tracking-widest">الحالة</p>
                    <p className="font-bold text-sm">عضو ذهبي</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Loyalty Journey ── */}
      <section className="py-12 md:py-24 px-6 bg-surface-container-lowest" id="loyalty-journey">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-on-surface">رحلة الولاء الذهبية</h2>
          <p className="text-secondary mb-16">كل طلب يقربك من مزايا استثنائية</p>

          {/* Mobile Vertical Timeline */}
          <div className="relative flex flex-col gap-10 md:hidden text-right pr-6">
            <div className="absolute right-[23px] top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(to bottom, #D4AF37, #b8962e)' }} />

            {loyaltySteps.map((step, i) => (
              <div key={i} className="relative flex flex-row-reverse items-center gap-6 group">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center z-10 border-4 border-white shadow-md transition-all"
                  style={step.highlight
                    ? { background: 'linear-gradient(135deg, #D4AF37, #b8962e)', color: '#fff', borderColor: '#D4AF37' }
                    : { background: '#1c1b1b', color: '#D4AF37', borderColor: '#D4AF37' }
                  }
                >
                  <span className="font-bold">{step.num}</span>
                </div>
                <div
                  className="flex-1 p-4 rounded-xl"
                  style={step.highlight
                    ? { background: 'linear-gradient(135deg, #fdf9ef, #fff3cc)', border: '1px solid #D4AF37' }
                    : { background: '#fafafa', border: '1px solid rgba(212,175,55,0.2)' }
                  }
                >
                  <h5 className="font-bold" style={{ color: step.highlight ? '#735b00' : '#1c1b1b' }}>{step.title}</h5>
                  <p className="text-secondary text-xs mt-1">{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Horizontal Timeline */}
          <div className="hidden md:flex justify-between items-start relative mt-20">
            <div className="absolute top-[40px] left-[5%] right-[5%] h-0.5"
              style={{ background: 'linear-gradient(to right, transparent, #D4AF37, transparent)' }} />
            {loyaltySteps.map((s, i) => (
              <div key={i} className="w-[18%] text-center relative z-10 group cursor-default">
                <div
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center font-bold text-xl transition-all duration-500 border-4"
                  style={s.highlight
                    ? { background: 'linear-gradient(135deg, #D4AF37, #b8962e)', color: '#fff', borderColor: '#D4AF37', boxShadow: '0 0 24px rgba(212,175,55,0.4)' }
                    : { background: '#fff', borderColor: '#D4AF37', color: '#1c1b1b' }
                  }
                >
                  {s.num}
                </div>
                <h4 className="font-bold text-sm mb-2" style={{ color: s.highlight ? '#735b00' : '#1c1b1b' }}>
                  {s.title}
                </h4>
                <p className="text-[10px] text-secondary">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
};

export default Landing;
