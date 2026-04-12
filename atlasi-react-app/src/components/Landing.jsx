import React, { useState, useEffect } from 'react';
import { useStore } from '../store';

const projectCards = [
  { image: "/image/malaki_double_column_beige.png", title: "تصميم ملكي فاخر", category: "Royal Shade", badgeColor: "bg-gold-accent/90" },
  { image: "/image/malaki_double_column_noir.png", title: "ملكي - نسخة الذهب الأسود", category: "Royal Shade", badgeColor: "bg-primary/90" },
  { image: "/image/malaki_double_wall_beige.png", title: "ملكي معلق - بيج", category: "Royal Shade", badgeColor: "bg-gold-accent/90" },
  { image: "/image/malaki_double_wall_noir.png", title: "ملكي معلق - أسود", category: "Royal Shade", badgeColor: "bg-primary/90" },
  { image: "/image/malaki_single_column_beige.png", title: "ملكي مفرد", category: "Royal Shade", badgeColor: "bg-gold-accent/90" },
  { image: "/image/malaki_single_column_noir.png", title: "ملكي مفرد - أسود", category: "Royal Shade", badgeColor: "bg-primary/90" },
  { image: "/image/malaki_single_wall_beige.png", title: "ملكي معلق مفرد", category: "Royal Shade", badgeColor: "bg-gold-accent/90" },
  { image: "/image/malaki_single_wall_noir.png", title: "ملكي معلق مفرد - أسود", category: "Royal Shade", badgeColor: "bg-primary/90" },
  { image: "/image/neom_double_column_beige.png", title: "نيوم المزدوجة", category: "Modern Luxe", badgeColor: "bg-gold-accent/90" },
  { image: "/image/neom_double_column_noir.png", title: "نيوم سوداء فاخرة", category: "Modern Luxe", badgeColor: "bg-primary/90" },
  { image: "/image/neom_double_wall_beige.png", title: "نيوم معلقة مزدوجة", category: "Modern Luxe", badgeColor: "bg-gold-accent/90" },
  { image: "/image/neom_double_wall_noir.png", title: "نيوم معلقة سوداء", category: "Modern Luxe", badgeColor: "bg-primary/90" },
  { image: "/image/neom_single_column_beige.png", title: "نيوم مفردة هادئة", category: "Modern Luxe", badgeColor: "bg-gold-accent/90" },
  { image: "/image/neom_single_column_noir.png", title: "نيوم مفردة سوداء", category: "Modern Luxe", badgeColor: "bg-primary/90" },
  { image: "/image/neom_single_wall_beige.png", title: "نيوم معلقة مفردة", category: "Modern Luxe", badgeColor: "bg-gold-accent/90" },
  { image: "/image/neom_single_wall_noir.png", title: "نيوم معلقة مفردة سوداء", category: "Modern Luxe", badgeColor: "bg-primary/90" },
  { image: "/image/sahra_double_beige.png", title: "صحراء مزدوجة", category: "Sahara Classic", badgeColor: "bg-gold-accent/90" },
  { image: "/image/sahra_double_noir.png", title: "صحراء مزدوجة سوداء", category: "Sahara Classic", badgeColor: "bg-primary/90" },
  { image: "/image/sahra_single_beige.png", title: "صحراء مفردة واثقة", category: "Sahara Classic", badgeColor: "bg-gold-accent/90" },
  { image: "/image/sahra_single_noir.png", title: "صحراء مفردة سوداء", category: "Sahara Classic", badgeColor: "bg-primary/90" }
];

const Landing = () => {
  const setStep = useStore(state => state.setStep);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setActiveIndex(current => (current + 1) % projectCards.length);
    }, 4000); // Slightly faster auto-play for more images
    return () => clearInterval(interval);
  }, [paused]);

  const getCardClass = (index) => {
    const total = projectCards.length;
    if (index === activeIndex) return 'active';
    if (index === (activeIndex - 1 + total) % total) return 'prev';
    if (index === (activeIndex + 1) % total) return 'next';
    if (index === (activeIndex - 2 + total) % total) return 'far-prev';
    if (index === (activeIndex + 2) % total) return 'far-next';
    return 'hidden';
  };

  return (
    <main className="bg-background text-on-surface">
      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden bg-surface">
        <div className="absolute inset-0 z-0 text-right">
          <img
            alt="Luxury architectural shade"
            className="w-full h-full object-cover opacity-80"
            src="/image/malaki_double_column_noir.png"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-background/90 via-background/20 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 md:px-12 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 text-right order-last md:order-first">
            <div className="space-y-4">
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-[10px] tracking-widest uppercase rounded">نخبة المظلات في المملكة العربية السعودية
              </span>
              <h1 className="text-5xl md:text-7xl font-headline font-bold text-on-surface leading-tight">
                نصمم الفخامة <br />
                <span className="text-primary italic">ونحمي سيارتك</span>
              </h1>
              <p className="text-lg text-secondary max-w-lg leading-relaxed">
                حلول هندسية مبتكرة تجمع بين الأناقة المعمارية وحماية سيارتك من أقسى الظروف المناخية.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 justify-start">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">verified</span>
                <div className="text-right">
                  <p className="font-bold text-sm text-on-surface">ضمان ذهبي 5 سنوات</p>
                  <p className="text-[10px] text-secondary uppercase tracking-wider">Maximum Protection</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">bolt</span>
                <div className="text-right">
                  <p className="font-bold text-sm text-on-surface">تركيب سريع</p>
                  <p className="text-[10px] text-secondary uppercase tracking-wider">Quality & Speed</p>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={() => setStep(1)}
                className="bg-primary text-on-primary px-12 py-4 rounded-lg font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
              >
                اطلب تصميمك الآن
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Product Gallery */}
      <section className="py-32 bg-surface-container-low overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6 text-right">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-surface">نماذج من أعمالنا الفاخرة</h2>
              <p className="text-secondary text-lg">نجمع بين المتانة والتصميم العصري في كل تفصيل ({projectCards.length} نموذج)</p>
            </div>
            <div className="flex items-center gap-4">

            </div>
          </div>

          <div className="perspective-container">
            <div
              className="carousel-3d-track"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {projectCards.map((card, index) => (
                <div
                  key={index}
                  className={`carousel-3d-card carousel-card ${getCardClass(index)}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <img alt={card.title} src={card.image} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent flex flex-col justify-end p-5 text-right">
                    <span className={`inline-block w-fit px-3 py-1 ${card.badgeColor} rounded text-[9px] font-bold text-white uppercase tracking-widest mb-2`}>
                      {card.category}
                    </span>
                    <h3 className="text-white text-xl font-bold font-headline">{card.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-4 gap-2 flex-wrap max-w-xl mx-auto">
            {projectCards.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`pagination-dot h-1 w-3 rounded-full bg-outline-variant/30 transition-all duration-300 ${index === activeIndex ? 'active !bg-primary !w-6' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Golden Card Section - Unchanged */}
      <section className="py-32 relative bg-surface-container-lowest overflow-hidden" id="loyalty">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 order-2 md:order-1 text-right">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-headline font-bold text-on-surface">بطاقة الأطلسي الذهبية</h2>
              <p className="text-lg text-secondary leading-relaxed">
                انضم إلى النخبة واستمتع بمزايا حصرية صُممت خصيصاً لعملائنا المميزين.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 rounded-xl bg-surface border border-outline-variant/20 shadow-sm flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-gold-accent text-4xl mb-3">chat_bubble</span>
                <h4 className="font-bold text-sm mb-1 text-on-surface">إصدار تلقائي</h4>
                <p className="text-[10px] text-secondary">عبر الواتساب مباشرة</p>
              </div>
              <div className="p-6 rounded-xl bg-surface border border-outline-variant/20 shadow-sm flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-gold-accent text-4xl mb-3">smartphone</span>
                <h4 className="font-bold text-sm mb-1 text-on-surface">مرتبطة بالجوال</h4>
                <p className="text-[10px] text-secondary">سهولة الوصول الرقمي</p>
              </div>
              <div className="p-6 rounded-xl bg-surface border border-outline-variant/20 shadow-sm flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-gold-accent text-4xl mb-3">card_giftcard</span>
                <h4 className="font-bold text-sm mb-1 text-on-surface">قابلة للإهداء</h4>
                <p className="text-[10px] text-secondary">شارك الفخامة مع أحبائك</p>
              </div>
            </div>
          </div>
          <div className="relative order-1 md:order-2 flex justify-center">
            <div className="relative z-10 w-full max-w-md aspect-[1.58/1] bg-gradient-to-br from-[#735b25] to-[#B89B5E] rounded-2xl p-8 text-white shadow-2xl flex flex-col justify-between overflow-hidden group transition-transform hover:scale-105 duration-500">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <div className="flex justify-between items-start">
                <div className="font-headline font-bold text-xl italic tracking-wide">Al Atlashi</div>
                <span className="material-symbols-outlined text-3xl text-white/40">contactless</span>
              </div>
              <div>
                <div className="text-lg tracking-[0.25em] mb-4 font-body">•••• •••• •••• 5542</div>
                <div className="flex justify-between items-end text-right">
                  <div>
                    <p className="text-[8px] uppercase opacity-60 font-bold tracking-widest">Status</p>
                    <p className="font-bold text-sm">GOLDEN MEMBER</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loyalty Journey Section */}
      <section style={{ textAlign: 'center', padding: '100px 20px', background: '#faf7f2' }}>
        <h2 style={{ fontSize: '40px', marginBottom: '60px', fontFamily: 'Noto Serif, serif', fontWeight: 700, color: '#1c1b1b' }}>
          رحلة الولاء الذهبية
        </h2>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          {/* Connector line */}
          <div style={{ position: 'absolute', top: '40px', left: '5%', right: '5%', height: '2px', background: 'linear-gradient(to right, transparent, gold, transparent)' }} />

          {[
            { num: '1', title: 'إصدار البطاقة', sub: 'بداية الرحلة', highlight: false },
            { num: '2', title: 'خصم 5%', sub: 'الطلب الثاني', highlight: false },
            { num: '3', title: 'خصم 5%', sub: 'الطلب الثالث', highlight: false },
            { num: '4', title: 'خصم 10%', sub: 'مستوى النخبة', highlight: false },
            { num: '★', title: 'خصم 50%', sub: 'الجائزة الكبرى', highlight: true },
          ].map((s, i) => (
            <div key={i} style={{ width: '18%', textAlign: 'center', position: 'relative', zIndex: 1 }}
              className="loyalty-step"
            >
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: s.highlight ? '28px' : '20px',
                transition: '0.3s',
                ...(s.highlight
                  ? { background: 'linear-gradient(135deg, #735b25, #b89b5e)', color: 'white', boxShadow: '0 0 24px rgba(184,155,94,0.55)', border: '3px solid white' }
                  : { background: 'white', border: '2px solid #ddd', color: '#735b25' })
              }}>
                {s.num}
              </div>
              <h4 style={{ fontFamily: 'Noto Serif, serif', fontWeight: 700, fontSize: s.highlight ? '18px' : '15px', color: s.highlight ? '#735b25' : '#1c1b1b', marginBottom: '4px' }}>
                {s.title}
              </h4>
              <p style={{ fontSize: '12px', color: '#5f5e5e' }}>{s.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Landing;
