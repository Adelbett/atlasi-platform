import React, { useState } from 'react';
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

const Wizard = () => {
  const { currentStep } = useStore();
  const stepLabels = ['بياناتك', 'التصميم', 'الحجم', 'التثبيت', 'الألوان', 'تأكيد', 'موقعك'];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
      
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
  const { design, updateField, nextStep, prevStep } = useStore();
  const opts = [
    { id: 'التصميم الهرمي', label: 'التصميم الهرمي', img: '/image/03b8235e-ceff-4d36-8575-16d5404c1882.jpg', desc: 'سقف مثلثي كلاسيكي' },
    { id: 'التصميم المقوس', label: 'التصميم المقوس', img: '/image/0adab1e7-4276-4004-88da-f0793b03375f.jpg', desc: 'خطوط منحنية ناعمة' },
    { id: 'كابولي بدون أعمدة', label: 'كابولي بدون أعمدة', img: '/image/10fe24c8-76b7-4c7d-aad1-69a05bf9d0c5.jpg', desc: 'تثبيت جداري أنيق' }
  ];

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>فضالً، اختر التصميم الرئيسي الذي يناسب واجهة بيتك ✨</h2>
      <div className="grid-responsive" style={{ marginBottom: '2rem' }}>
        {opts.map(opt => (
          <div key={opt.id} className={`card-base ${design===opt.id ? 'card-selected' : ''}`} onClick={() => updateField('design', opt.id)} style={{ cursor: 'pointer', textAlign: 'center', background: '#FFFFFF' }}>
            <img src={opt.img} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            <div style={{ padding: '1rem' }}>
              <h3 style={{ marginBottom: '0.2rem', fontSize: '1.2rem' }}>{opt.label}</h3>
              <p className="text-gray" style={{ fontSize: '0.9rem' }}>{opt.desc}</p>
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
    const { size, updateField, nextStep, prevStep } = useStore();
    return (
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', lineHeight: '1.5' }}>
           ممتاز، اختيار موفق! 👏<br/> بناءً على التصميم الذي اخترته، ما هو المقاس المناسب لسيارتك؟
        </h2>
        <div className="grid-responsive" style={{ marginBottom: '2.5rem' }}>
          <div className={`card-base ${size==='حجم عائلي (SUV)'?'card-selected':''}`} onClick={()=>updateField('size','حجم عائلي (SUV)')} style={{ padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer', background: '#FFF' }}>
             <h3 style={{ fontSize: '1.5rem', color: 'var(--gold)', marginBottom: '1rem' }}>حجم عائلي (SUV) 🚙</h3>
             <p className="text-gray" style={{ fontSize: '0.95rem'}}>لاندكروز، باترول، تاهو<br/>5.5م × 3.5م</p>
          </div>
          <div className={`card-base ${size==='حجم عادي (سيدان)'?'card-selected':''}`} onClick={()=>updateField('size','حجم عادي (سيدان)')} style={{ padding: '2.5rem 1.5rem', textAlign: 'center', cursor: 'pointer', background: '#FFF' }}>
             <h3 style={{ fontSize: '1.5rem', color: 'var(--beige-main)', marginBottom: '1rem' }}>حجم عادي (سيدان) 🚗</h3>
             <p className="text-gray" style={{ fontSize: '0.95rem'}}>كامري، التيما، أكورد<br/>5م × 3م</p>
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
    const { mounting, updateField, nextStep, prevStep } = useStore();
    return (
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>كيف تفضل طريقة تثبيت المظلة في الموقع؟ 🛠️</h2>
        <div className="grid-responsive" style={{ marginBottom: '2.5rem' }}>
          <div className={`card-base ${mounting==='تثبيت جداري'?'card-selected':''}`} onClick={()=>updateField('mounting','تثبيت جداري')} style={{ cursor: 'pointer', textAlign: 'center', background: '#FFF' }}>
            <img src="/image/16fce15f-22bf-4a2a-abc9-fe0b6717a51d.jpg" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
            <div style={{ padding: '1rem' }}><h3 style={{fontSize:'1.2rem', marginBottom:'0.5rem'}}>تثبيت جداري 🧱</h3><p className="text-gray" style={{fontSize:'0.9rem'}}>بدون أعمدة أرضية مزعجة</p></div>
          </div>
          <div className={`card-base ${mounting==='تثبيت على أعمدة'?'card-selected':''}`} onClick={()=>updateField('mounting','تثبيت على أعمدة')} style={{ cursor: 'pointer', textAlign: 'center', background: '#FFF' }}>
            <img src="/image/218d1b4f-6360-4f30-b2a5-13b2860b1c53.jpg" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
            <div style={{ padding: '1rem' }}><h3 style={{fontSize:'1.2rem', marginBottom:'0.5rem'}}>تثبيت على أعمدة 🏛️</h3><p className="text-gray" style={{fontSize:'0.9rem'}}>قواعد أرضية متينة جداً</p></div>
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
    const { fabricColor, frameColor, updateField, nextStep, prevStep } = useStore();
    const liveImg = Math.random() > 0.5 ? '/image/5bfe30d6-3629-419e-92f0-5663abadf921.jpg' : '/image/77556bcc-093f-4cce-9bbf-cdfad275b19d.jpg';
    
    return (
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>خصص ألوان المظلة 🎨</h2>
        <div className="color-studio" style={{ marginBottom: '2rem' }}>
           
           <motion.div key={`${fabricColor}-${frameColor}`} initial={{ filter: 'blur(10px)'}} animate={{ filter: 'blur(0px)'}} style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
              <img src={liveImg} className="live-preview-img" style={{ width: '100%', height: '100%', minHeight: '300px', objectFit: 'cover' }} />
           </motion.div>

           <div className="card-base" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ marginBottom: '2rem' }}>
                 <h3 style={{ marginBottom: '1rem', color: 'var(--text-white)' }}>اختر لون القماش</h3>
                 <div style={{ display: 'flex', gap: '1rem' }}>
                    {[{id:'بيج', c:'#C9A96E'}, {id:'رمادي', c:'#C0B9A8'}, {id:'أبيض', c:'#FFFFFF'}].map(c => (
                        <div key={c.id} onClick={()=>updateField('fabricColor', c.id)} style={{ width: '45px', height: '45px', borderRadius: '50%', background: c.c, border: `2px solid ${fabricColor===c.id?'var(--gold)':'var(--border-glass)'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', transform: fabricColor===c.id?'scale(1.1)':'none', transition: 'all 0.3s' }}></div>
                    ))}
                 </div>
              </div>

              <div>
                 <h3 style={{ marginBottom: '1rem', color: 'var(--text-white)' }}>الحديد</h3>
                 <div style={{ display: 'flex', gap: '1rem' }}>
                    {[{id:'ذهبي فاتح', c:'#D4C4A0'}, {id:'أسود', c:'#333333'}].map(c => (
                        <div key={c.id} onClick={()=>updateField('frameColor', c.id)} style={{ width: '45px', height: '45px', borderRadius: '50%', background: c.c, border: `2px solid ${frameColor===c.id?'var(--gold)':'var(--border-glass)'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', transform: frameColor===c.id?'scale(1.1)':'none', transition: 'all 0.3s' }}></div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
        <div className="btn-row" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
          <button className="btn btn-secondary" onClick={prevStep}>رجوع →</button>
          <button className="btn btn-primary" disabled={!fabricColor || !frameColor} onClick={nextStep}>متابعة ←</button>
        </div>
      </div>
    );
};

const Step6 = () => {
    const { design, size, mounting, fabricColor, frameColor, customerName, nextStep, setStep } = useStore();
    return (
      <div>
        <div className="card-base padding-responsive" style={{ background: '#FFFFFF', marginBottom: '2rem' }}>
           <h2 style={{ color: 'var(--gold)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem', lineHeight: '1.4' }}>
              شكراً لك أستاذي {customerName}! <br/> تم تجهيز ملخص طلبك المبدئي بنجاح
           </h2>
           <ul style={{ listStyle: 'none', fontSize: '1.1rem', padding: 0, marginTop: '2rem' }}>
              <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                 🔹 <strong>التصميم:</strong> <span className="text-gray">{design}</span>
              </li>
              <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                 🔹 <strong>الحجم:</strong> <span className="text-gray">{size}</span>
              </li>
              <li style={{ padding: '0.8rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                 🔹 <strong>التثبيت:</strong> <span className="text-gray">{mounting}</span>
              </li>
              <li style={{ padding: '0.8rem 0', borderBottom: 'none' }}>
                 🔹 <strong>اللون:</strong> <span className="text-gray">قماش {fabricColor} / حديد {frameColor}</span>
              </li>
           </ul>
           
           <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-void)', borderRadius: '15px', border: '1px solid var(--gold)' }}>
              <p className="text-gray" style={{ marginBottom: '0.5rem', fontSize:'0.95rem' }}>الدفعة الأولى المطلوبة للبدء:</p>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--gold)' }}>999 ريال فقط</h2>
              <p className="text-gray" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>(متاحة للتقسيط عبر تابي/تمارا)</p>
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
    const { address, customerName, customerPhone, design, size, mounting, fabricColor, frameColor, updateField, nextStep, prevStep } = useStore();
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
           fixationType: mounting,
           fabricColor: `${fabricColor} / الحديد: ${frameColor}`
       };

       fetch('http://localhost:8080/api/admin/requests', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload)
       })
       .then(res => res.json())
       .then(data => {
           updateField('finalId', data.id); // Save backend returned ID
           nextStep();
       })
       .catch(err => {
           console.error("Erreur serveur:", err);
           alert("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
       })
       .finally(() => setIsSubmitting(false));
    };

    return (
      <div>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', lineHeight: '1.4' }}>
           🎉 تم تأكيد طلبك المبدئي بنجاح!<br/>
           <span style={{ fontSize: '1.1rem', color: 'var(--text-gray)' }}>خطوة واحدة فقط تفصلنا عنك.. فضالً، شاركنا موقعك عبر الخريطة (Location) 📍</span>
        </h2>
        
        {/* Real Interactive Map using OpenStreetMap / Leaflet */}
        <div style={{ height: '300px', borderRadius: '20px', overflow: 'hidden', marginBottom: '1.5rem', border: '2px solid var(--border-glass)', zIndex: 0 }}>
           <MapContainer center={defaultCenter} zoom={11} style={{ width: '100%', height: '100%', zIndex: 0 }}>
             <TileLayer
               url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
               attribution='&copy; OpenStreetMap contributors'
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
    const { setStep, finalId } = useStore();
    return (
      <div className="card-base" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#FFFFFF', maxWidth: '600px', margin: '0 auto', border: '1px solid var(--gold)' }}>
         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }} style={{ fontSize: '4rem', marginBottom: '1rem' }}>📍</motion.div>
         <h2 style={{ color: 'var(--text-white)', marginBottom: '1.5rem' }}>تم استلام الموقع بنجاح!</h2>
         
         <p style={{ color: 'var(--text-gray)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            سيقوم مندوبنا المختص برفع المقاسات بزيارتك خلال الـ 12 ساعة القادمة.<br/>
            وسيتم التواصل معك قريباً ☀️!
         </p>

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
