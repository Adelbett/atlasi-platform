import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store';
import { FiCheck, FiMapPin } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

const slideVariants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { x: -40, opacity: 0, transition: { duration: 0.4 } }
};

const getDesignCandidates = (design, color = 'beige') => [
  color === 'noir' ? `/image/design_${design}_noir.jpg` : `/image/design_${design}_beige.jpg`,
  color === 'noir' ? `/image/${design}_noir.jpg` : `/image/${design}.jpg`,
  design === 'sahra' ? '/image/sahara.jpeg' : `/image/${design}.jpg`
];

const getSizeCandidates = (design, size, color = 'beige') => [
  `/image/${design}_${size}_${color}.jpg`,
  `/image/${design}_${size}.jpg`,
  `/image/${design}.jpg`,
  '/image/sahara.jpeg'
];

const getFixationCandidates = (design, size, mounting, color = 'beige') => [
  `/image/${design}_${size}_${mounting}_${color}.jpg`,
  `/image/${design}_${size}_${color}.jpg`,
  `/image/${design}_${size}.jpg`,
  `/image/${design}.jpg`,
  '/image/sahara.jpeg'
];

const getFinalCandidates = (design, size, mounting, color = 'beige') => {
  if (!design || !size) return ['/image/sahara.jpeg'];
  if (design === 'sahra' || design === 'neom' || !mounting) return getSizeCandidates(design, size, color);
  return getFixationCandidates(design, size, mounting, color);
};

const SmartPreviewImage = ({ candidates, label, height = '230px', fit = 'contain', bg = '#F8F8F8' }) => {
  const [idx, setIdx] = useState(0);
  const src = candidates[Math.min(idx, candidates.length - 1)];

  return (
    <div style={{ width: '100%', height, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img
        src={src}
        alt={label}
        onError={() => setIdx((i) => (i < candidates.length - 1 ? i + 1 : i))}
        style={{ width: '100%', height: '100%', objectFit: fit, padding: fit === 'contain' ? '0.4rem' : 0 }}
      />
    </div>
  );
};

const Wizard = () => {
  const { currentStep } = useStore();
  const wizardTopRef = useRef(null);
  const stepLabels = ['بياناتك', 'التصميم', 'الحجم', 'التثبيت', 'الألوان', 'تأكيد', 'موقعك'];

  useEffect(() => {
    if (wizardTopRef.current) {
      wizardTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  return (
    <div ref={wizardTopRef} style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      
      {currentStep > 0 && currentStep < 8 && (
        <div style={{ marginBottom: '2rem', padding: '0 1.5rem' }}>
          <div className="grid-steps">
            <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, height: '3px', background: 'var(--border-glass)', borderRadius: '3px', zIndex: -1 }}></div>
            <div style={{ position: 'absolute', top: '16px', right: 0, height: '3px', background: 'var(--gold)', borderRadius: '3px', zIndex: -1, width: `${((currentStep-1)/6)*100}%`, transition: 'width 0.4s ease' }}></div>
            
            {stepLabels.map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === currentStep;
              const isDone = stepNum < currentStep;
              return (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <motion.div 
                    animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                    style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? 'var(--gold)' : (isDone ? 'var(--gold)' : 'var(--bg-card)'),
                    border: `2px solid ${isActive || isDone ? 'var(--gold)' : 'var(--border-glass)'}`,
                    color: isDone || isActive ? '#FFF' : 'var(--text-gray)',
                    boxShadow: isActive ? '0 4px 10px rgba(201,169,110,0.4)': 'none',
                    fontWeight: 'bold', fontSize: '0.9rem', transition: 'all 0.3s'
                  }}>
                    {isDone ? <FiCheck /> : stepNum}
                  </motion.div>
                  <span className="step-label" style={{ color: isActive || isDone ? 'var(--text-white)' : 'var(--text-gray)', fontWeight: isActive ? 'bold' : 'normal' }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ minHeight: '60vh', padding: '0 1rem' }}>
        <AnimatePresence mode="wait">
          <motion.div key={currentStep} variants={slideVariants} initial="enter" animate="center" exit="exit" style={{ width: '100%' }}>
            {currentStep === 1 && <Step1 />}
            {currentStep === 2 && <Step2 />}
            {currentStep === 3 && <Step3 />}
            {currentStep === 4 && <Step4 />}
            {currentStep === 5 && <Step5 />}
            {currentStep === 6 && <Step6 />}
            {currentStep === 7 && <Step7 />}
            {currentStep === 8 && <Confirmation />}
            {currentStep === 9 && <CancelStep />}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
};

const Step1 = () => {
  const { customerName, customerPhone, updateField, nextStep } = useStore();
  const valid = customerName.trim() && customerPhone.startsWith('05') && customerPhone.length >= 10;
  
  return (
    <div className="card-base padding-responsive" style={{ maxWidth: '450px', margin: '0 auto', textAlign: 'center', background: '#FFFFFF' }}>
      <h2 style={{ color: 'var(--text-white)', marginBottom: '1rem' }}>التسجيل 👤</h2>
      <p className="text-gray" style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>
         فضلاً، قم بإدخال بياناتك ليتسنى لنا التواصل معك وتقديم أفضل خدمة تلبي توقعاتك.
      </p>
      
      <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
        <label style={{ display: 'block', color: 'var(--text-white)', marginBottom: '0.5rem', fontWeight: 'bold' }}>اسمك الكريم</label>
        <input type="text" placeholder="مثال: أحمد محمد" value={customerName} onChange={(e) => updateField('customerName', e.target.value)} />
      </div>

      <div style={{ marginBottom: '2.5rem', textAlign: 'right' }}>
         <label style={{ display: 'block', color: 'var(--text-white)', marginBottom: '0.5rem', fontWeight: 'bold' }}>رقم الجوال</label>
         <input type="tel" placeholder="05XXXXXXXX" value={customerPhone} onChange={(e) => updateField('customerPhone', e.target.value)} />
      </div>

      <button className="btn btn-primary btn-full" disabled={!valid} onClick={nextStep}>متابعة ←</button>
      <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-gray)' }}>🔒 بياناتك محمية بشكل كامل</p>
    </div>
  );
};

const Step2 = () => {
  const { design, color, updateField, nextStep, prevStep } = useStore();
  const opts = [
    { id: 'sahra', label: 'صحراء', desc: 'تصميم متوازن بطابع أصيل' },
    { id: 'malaki', label: 'ملكي', desc: 'خطوط منحنية بلمسة راقية' },
    { id: 'neom', label: 'نيوم', desc: 'تصميم عصري بواجهة حديثة' }
  ];

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>فضلًا، اختر التصميم الرئيسي الذي يناسبك ✨</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {opts.map(opt => (
          <div key={opt.id} className={`card-base ${design===opt.id ? 'card-selected' : ''}`} onClick={() => updateField('design', opt.id)} style={{ cursor: 'pointer', textAlign: 'center', background: '#FFFFFF' }}>
            <SmartPreviewImage candidates={getDesignCandidates(opt.id, color || 'beige')} label={opt.label} height="230px" fit="contain" />
            <div style={{ padding: '1rem' }}>
              <h3 style={{ marginBottom: '0.2rem', fontSize: '1.2rem' }}>{opt.label}</h3>
              <p className="text-gray" style={{ fontSize: '0.9rem' }}>{opt.desc}</p>
              <button className="btn btn-secondary btn-full" style={{ marginTop: '0.8rem' }}>اختيار التصميم</button>
            </div>
          </div>
        ))}
      </div>
      <div className="btn-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
        <button className="btn btn-secondary" onClick={prevStep}>رجوع →</button>
        <button className="btn btn-primary" disabled={!design} onClick={nextStep}>متابعة ←</button>
      </div>
    </div>
  );
};


const Step3 = () => {
    const { size, design, color, updateField, nextStep, prevStep } = useStore();
    return (
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', lineHeight: '1.5' }}>
           ممتاز، اختيار موفق! 👏<br/> بناءً على التصميم الذي اخترته، ما هو المقاس المناسب لسيارتك؟
        </h2>
        {size && design && (
          <div style={{ marginBottom: '2rem', borderRadius: '15px', overflow: 'hidden' }}>
             <SmartPreviewImage candidates={getSizeCandidates(design, size, color || 'beige')} label="معاينة الحجم" height="250px" fit="contain" />
          </div>
        )}
        <div className="grid-responsive" style={{ marginBottom: '2.5rem' }}>
          <div className={`card-base ${size==='double'?'card-selected':''}`} onClick={()=>updateField('size','double')} style={{ padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer', background: '#FFF' }}>
             <h3 style={{ fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1rem' }}>حجم ثنائي 🚙🚙</h3>
          </div>
          <div className={`card-base ${size==='single'?'card-selected':''}`} onClick={()=>updateField('size','single')} style={{ padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer', background: '#FFF' }}>
             <h3 style={{ fontSize: '1.5rem', color: 'var(--beige-main)', marginBottom: '1rem' }}>سيارة واحدة 🚗</h3>
          </div>
        </div>
        <div className="btn-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={prevStep}>رجوع →</button>
          <button className="btn btn-primary" disabled={!size} onClick={nextStep}>متابعة ←</button>
        </div>
      </div>
    );
};

const Step4 = () => {
    const { mounting, design, size, color, updateField, nextStep, prevStep } = useStore();
    return (
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>كيف تفضل طريقة تثبيت المظلة في الموقع؟ 🛠️</h2>
        {mounting && design && size && design !== 'sahra' && (
          <div style={{ marginBottom: '2rem', borderRadius: '15px', overflow: 'hidden' }}>
             <SmartPreviewImage candidates={getFixationCandidates(design, size, mounting, color || 'beige')} label="معاينة التثبيت" height="250px" fit="contain" />
          </div>
        )}
        <div className="grid-responsive" style={{ marginBottom: '2.5rem' }}>
          <div className={`card-base ${mounting==='wall'?'card-selected':''}`} onClick={()=>updateField('mounting','wall')} style={{ cursor: 'pointer', textAlign: 'center', background: '#FFF' }}>
            <div style={{ padding: '2rem 1rem' }}><h3 style={{fontSize:'1.2rem', marginBottom:'0.5rem'}}>تثبيت جداري 🧱</h3><p className="text-gray" style={{fontSize:'0.9rem'}}>بدون أعمدة أرضية مزعجة</p></div>
          </div>
          <div className={`card-base ${mounting==='column'?'card-selected':''}`} onClick={()=>updateField('mounting','column')} style={{ cursor: 'pointer', textAlign: 'center', background: '#FFF' }}>
            <div style={{ padding: '2rem 1rem' }}><h3 style={{fontSize:'1.2rem', marginBottom:'0.5rem'}}>تثبيت على أعمدة 🏛️</h3><p className="text-gray" style={{fontSize:'0.9rem'}}>قواعد أرضية متينة جداً</p></div>
          </div>
        </div>
        <div className="btn-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={prevStep}>رجوع →</button>
          <button className="btn btn-primary" disabled={!mounting} onClick={nextStep}>متابعة ←</button>
        </div>
      </div>
    );
};

const Step5 = () => {
    const { design, size, mounting, color, updateField, nextStep, prevStep } = useStore();
    
    const finalCandidates = getFinalCandidates(design, size, mounting, color || 'beige');
    
    return (
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>اختر لون الخامة ✨</h2>
        <div className="color-studio" style={{ marginBottom: '2rem' }}>
           
           <motion.div key={color} initial={{ filter: 'blur(10px)'}} animate={{ filter: 'blur(0px)'}} style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
              <SmartPreviewImage candidates={finalCandidates} label="المعاينة النهائية" height="320px" fit="contain" bg="#FFFFFF" />
           </motion.div>

           <div className="card-base" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ marginBottom: '2rem' }}>
                 <h3 style={{ marginBottom: '1rem', color: 'var(--text-white)' }}>اختر اللون / الخامة</h3>
                 <div style={{ display: 'grid', gap: '1rem' }}>
                    <div onClick={()=>updateField('color', 'beige')} style={{ padding: '1rem', borderRadius: '15px', border: `2px solid ${color==='beige'?'var(--gold)':'var(--border-glass)'}`, cursor: 'pointer', background: color==='beige'?'var(--bg-hover)':'transparent', transition: 'all 0.3s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#C9A96E' }}></div>
                         <div>
                            <div style={{ fontWeight: 'bold' }}>ذهبي — قياسي</div>
                         </div>
                      </div>
                    </div>
                    <div onClick={()=>updateField('color', 'noir')} style={{ padding: '1rem', borderRadius: '15px', border: `2px solid ${color==='noir'?'var(--gold)':'var(--border-glass)'}`, cursor: 'pointer', background: color==='noir'?'var(--bg-hover)':'transparent', transition: 'all 0.3s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                         <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1E1E1E' }}></div>
                         <div>
                            <div style={{ fontWeight: 'bold' }}>أسود</div>
                         </div>
                      </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        <div className="btn-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={prevStep}>رجوع →</button>
          <button className="btn btn-primary" disabled={!color} onClick={nextStep}>متابعة ←</button>
        </div>
      </div>
    );
};

const Step6 = () => {
    const { design, size, mounting, color, customerName, nextStep, setStep } = useStore();
    
    const PRICES = {
      sahra: {
        single: { min: 670,  max: 999  },
        double: { min: 1090, max: 1699 }
      },
      malaki: {
        single: { wall: { min: 976,  max: 1899 }, column: { min: 1354, max: 2399 } },
        double: { wall: { min: 1715, max: 2599 }, column: { min: 2160, max: 2999 } }
      },
      neom: {
        single: { wall: { min: 976,  max: 1699 }, column: { min: 1140, max: 1699 } },
        double: { wall: { min: 1090, max: 1699 }, column: { min: 2080, max: 2599 } }
      }
    };

    const getPrice = () => {
      if(!design || !size) return {min: 0, max: 0};
      if(design === 'sahra') return PRICES[design][size] || {min: 0, max: 0};
      if(design === 'neom' && !mounting) {
        const wall = PRICES.neom?.[size]?.wall;
        const column = PRICES.neom?.[size]?.column;
        if (wall && column) return { min: Math.min(wall.min, column.min), max: Math.max(wall.max, column.max) };
      }
      if(mounting) return PRICES[design]?.[size]?.[mounting] || {min: 0, max: 0};
      return {min: 0, max: 0};
    };

    const { min, max } = getPrice();

    const renderDesignName = (d) => {
      if (d === 'sahra') return 'صحراء';
      if (d === 'malaki') return 'ملكي';
      if (d === 'neom') return 'نيوم';
      return d;
    };
    
    const renderSizeName = (s) => s === 'double' ? 'حجم ثنائي' : 'سيارة واحدة';
    const renderMounting = (m) => m === 'wall' ? 'جداري' : (m === 'column' ? 'أعمدة' : '—');
    const renderColor = (c) => c === 'beige' ? 'ذهبي' : 'أسود';

    return (
      <div>
        <div className="card-base padding-responsive" style={{ background: '#FFFFFF', marginBottom: '2rem' }}>
           <h2 style={{ color: 'var(--gold)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', lineHeight: '1.4' }}>
              شكراً لك أستاذي {customerName}! <br/> تم تجهيز ملخص طلبك المبدئي بنجاح
           </h2>
           <ul style={{ listStyle: 'none', fontSize: '1.1rem', padding: 0, marginTop: '2rem' }}>
              <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                 🔹 <strong>التصميم:</strong> <span className="text-gray">{renderDesignName(design)}</span>
              </li>
              <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                 🔹 <strong>الحجم:</strong> <span className="text-gray">{renderSizeName(size)}</span>
              </li>
              <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                 🔹 <strong>التثبيت:</strong> <span className="text-gray">{design === 'sahra' ? '—' : renderMounting(mounting)}</span>
              </li>
              <li style={{ padding: '0.8rem 0', borderBottom: 'none' }}>
                 🔹 <strong>اللون:</strong> <span className="text-gray">{renderColor(color)}</span>
              </li>
           </ul>
           
           <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-void)', borderRadius: '15px', border: '1px solid var(--gold)' }}>
              <p className="text-gray" style={{ marginBottom: '0.5rem', fontSize:'0.95rem', lineHeight: '1.6' }}>
                حسب التفاصيل التي اخترتها، سيكون السعر في حدود <br/>
              </p>
              <h2 style={{ fontSize: '2rem', color: 'var(--gold)', margin: '0.5rem 0' }}>{min} إلى {max} ريال</h2>
              <p className="text-gray" style={{ fontSize: '0.9rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
                وذلك وفقًا للخامة المعتمدة ({renderColor(color)}).<br/>
                وبعد زيارة المندوب ورفع القياسات اللازمة، سيتم تزويدك بالمبلغ النهائي بشكل دقيق.
              </p>
           </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-gray)' }}>
           الرجاء اختيار الإجراء المناسب لتأكيد حجزك:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}>
           <button className="btn btn-primary btn-full" onClick={nextStep} style={{ padding: '1rem' }}>✅ تأكيد الطلب</button>
           <button className="btn btn-secondary btn-full" onClick={()=>setStep(1)}>🔄 تعديل الطلب (يعيدك للخطوة 1)</button>
           <button className="btn btn-secondary btn-full" onClick={()=>setStep(9)} style={{ color: '#E53935', borderColor: '#FFEBEE', background: '#FFEBEE' }}>❌ إلغاء الطلب</button>
        </div>
      </div>
    );
};

const customMarkerIcon = new L.divIcon({
  html: `<div style="font-size: 3rem; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); transform: translate(-50%, -100%); line-height: 1;">📍</div>`,
  className: 'custom-leaflet-marker',
  iconSize: [0, 0],
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position === null ? null : (
    <Marker position={position} icon={customMarkerIcon}></Marker>
  );
};

    const Step7 = () => {
    const { address, customerName, customerPhone, design, size, mounting, color, updateField, nextStep, prevStep } = useStore();
    const defaultCenter = [24.7136, 46.6753]; // Riyadh Center
    const [position, setPosition] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleMapClick = (latlng) => {
       setPosition(latlng);
       updateField('address', `تحديد الخريطة (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`);
    };

    const handleAutoLocate = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function(loc) {
                const latlng = { lat: loc.coords.latitude, lng: loc.coords.longitude };
                setPosition(latlng);
                updateField('address', `موقعي الحالي عبر GPS`);
            });
        }
    };

    const submitOrder = () => {
       setIsSubmitting(true);
       const payload = {
           clientName: customerName,
           clientPhone: customerPhone,
           designType: design,
           sizeInfo: size,
           fixationType: mounting || '—',
           fabricColor: color === 'beige' ? 'اللون الذهبي' : 'الأسود',
           address: address
       };

       fetch('http://localhost:8080/api/admin/requests', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload)
       })
       .then(res => res.json())
       .then(data => {
           updateField('finalId', data.id);
           nextStep();
       })
       .catch(err => {
           console.warn("Backend not available, proceeding locally:", err);
           // Generate a local order ID when backend is offline
           const localId = 'L-' + Date.now().toString().slice(-6);
           updateField('finalId', localId);
           nextStep();
       })
       .finally(() => setIsSubmitting(false));
    };

    return (
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', lineHeight: '1.4' }}>
           🎉 تم تأكيد طلبك المبدئي بنجاح!<br/>
           <span style={{ fontSize: '1.1rem', color: 'var(--text-gray)' }}>خطوة واحدة فقط تفصلنا عنك.. فضلًا، شاركنا موقعك عبر الخريطة (Location) 📍</span>
        </h2>
        
        {/* Real Interactive Map using OpenStreetMap / Leaflet */}
        <div style={{ height: '300px', borderRadius: '20px', overflow: 'hidden', marginBottom: '1.5rem', border: '2px solid var(--border-glass)', zIndex: 0 }}>
           <MapContainer center={defaultCenter} zoom={11} style={{ width: '100%', height: '100%', zIndex: 0 }}>
             <TileLayer
               url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
               attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
             />
             <LocationMarker position={position} setPosition={handleMapClick} />
           </MapContainer>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
           <button className="btn btn-secondary btn-full" style={{ display: 'flex', gap: '0.5rem' }} onClick={handleAutoLocate}>
              <FiMapPin /> تحديد باستخدام الـ GPS تلقائياً
           </button>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--text-white)', marginBottom: '0.5rem', fontWeight: 'bold' }}>أو اكتب العنوان التفصيلي</label>
            <input type="text" value={address} onChange={(e) => updateField('address', e.target.value)} placeholder="مثال: شارع العليا، خلف البرج..." />
        </div>

        <div className="btn-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={prevStep} disabled={isSubmitting}>رجوع →</button>
          <button className="btn btn-primary" onClick={submitOrder} disabled={!address || isSubmitting}>
             {isSubmitting ? 'جاري الإرسال...' : 'إرسال الموقع النهائي 🚀'}
          </button>
        </div>
      </div>
    );
};

const Confirmation = () => {
    const { setStep, customerName, finalId, design, size, mounting, color } = useStore();
    const PRICES = {
      sahra: {
        single: { min: 670, max: 999 },
        double: { min: 1090, max: 1699 }
      },
      malaki: {
        single: { wall: { min: 976, max: 1899 }, column: { min: 1354, max: 2399 } },
        double: { wall: { min: 1715, max: 2599 }, column: { min: 2160, max: 2999 } }
      },
      neom: {
        single: { wall: { min: 976, max: 1699 }, column: { min: 1140, max: 1699 } },
        double: { wall: { min: 1090, max: 1699 }, column: { min: 2080, max: 2599 } }
      }
    };

    let currentPrice = design === 'sahra'
      ? PRICES[design]?.[size]
      : PRICES[design]?.[size]?.[mounting];
    if (design === 'neom' && !mounting) {
      const wall = PRICES.neom?.[size]?.wall;
      const column = PRICES.neom?.[size]?.column;
      if (wall && column) currentPrice = { min: Math.min(wall.min, column.min), max: Math.max(wall.max, column.max) };
    }

    const designLabel = design === 'sahra' ? 'صحراء' : design === 'malaki' ? 'ملكي' : 'نيوم';
    const sizeLabel = size === 'double' ? 'حجم ثنائي' : 'سيارة واحدة';
    const mountingLabel = design === 'sahra' ? '—' : (mounting === 'wall' ? 'معلقة' : 'أعمدة');
    const colorLabel = color === 'beige' ? 'ذهبي' : 'أسود';
    return (
      <div className="card-base" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#FFFFFF', maxWidth: '600px', margin: '0 auto', border: '1px solid var(--gold)' }}>
         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ fontSize: '4rem', marginBottom: '1rem' }}>📍</motion.div>
         <h2 style={{ color: 'var(--gold)', marginBottom: '1.5rem' }}>تم استلام الموقع بنجاح ✅</h2>
         
         <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            الأستاذ <strong>{customerName}</strong>، سيتواصل معك فريق خدمة الحرفاء لتحديد موعد الزيارة الميدانية.
         </p>

         <div style={{ textAlign: 'right', background: 'var(--bg-void)', border: '1px solid var(--border-glass)', borderRadius: '14px', padding: '1rem', marginBottom: '1.5rem' }}>
           <p style={{ marginBottom: '0.35rem', color: 'var(--text-gray)' }}><strong>التصميم:</strong> {designLabel}</p>
           <p style={{ marginBottom: '0.35rem', color: 'var(--text-gray)' }}><strong>الحجم:</strong> {sizeLabel}</p>
           <p style={{ marginBottom: '0.35rem', color: 'var(--text-gray)' }}><strong>التثبيت:</strong> {mountingLabel}</p>
           <p style={{ marginBottom: '0.35rem', color: 'var(--text-gray)' }}><strong>اللون:</strong> {colorLabel}</p>
           <p style={{ marginBottom: 0, color: 'var(--text-gray)' }}>
             <strong>السعر:</strong> من {currentPrice?.min ?? 0} إلى {currentPrice?.max ?? 0} ريال
           </p>
         </div>

         <div style={{ background: 'var(--bg-void)', padding: '1rem', borderRadius: '15px', display: 'inline-block', marginBottom: '2rem', border: '1px dashed var(--gold)' }}>
            <p className="text-gray" style={{ marginBottom: '0.3rem', fontSize: '0.9rem' }}>رقم الطلب الخاص بك</p>
            <h3 style={{ fontFamily: 'var(--font-numbers)', letterSpacing: 2, color: 'var(--gold)' }}>#REQ-{finalId || 'PENDING'}</h3>
         </div>
         
         <div>
            <button className="btn btn-primary btn-full" onClick={()=>setStep(0)}>العودة للرئيسية</button>
         </div>
      </div>
    );
};

const CancelStep = () => {
    const { setStep } = useStore();
    return (
      <div className="card-base" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#FFFFFF', maxWidth: '600px', margin: '0 auto', border: '1px solid #FFEBEE' }}>
         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌷</motion.div>
         <h2 style={{ color: 'var(--text-white)', marginBottom: '1.5rem' }}>تم إلغاء الطلب</h2>
         
         <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem', marginBottom: '3rem', lineHeight: '1.6' }}>
            نعتذر على إضاعة وقتك يا أستاذي، ونتفهم قرارك بالكامل. <br/>
            نتمنى أن نحظى بفرصة خدمتك في المرات القادمة إن شاء الله. 🌷
         </p>
         
         <div>
            <button className="btn btn-primary btn-full" onClick={()=>setStep(0)}>العودة للرئيسية</button>
         </div>
      </div>
    );
};

export default Wizard;
