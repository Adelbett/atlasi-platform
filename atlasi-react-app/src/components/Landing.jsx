import React, { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useStore } from '../store';
import { FiChevronLeft, FiStar, FiShield, FiTool } from 'react-icons/fi';

const Landing = () => {
  const setStep = useStore(state => state.setStep);

  // Images for infinite carousel
  const carouselImages = [
    { title: 'كابولي عصري', src: '/image/10fe24c8-76b7-4c7d-aad1-69a05bf9d0c5.jpg' },
    { title: 'مقوس فاخر', src: '/image/0adab1e7-4276-4004-88da-f0793b03375f.jpg' },
    { title: 'تصميم هرمي', src: '/image/03b8235e-ceff-4d36-8575-16d5404c1882.jpg' },
    { title: 'ظل متكامل', src: '/image/77556bcc-093f-4cce-9bbf-cdfad275b19d.jpg' },
    { title: 'حماية للسيارات', src: '/image/a1e68206-28f8-435a-85e4-ffed531da6fa.jpg' },
    { title: 'أناقة الجدار', src: '/image/16fce15f-22bf-4a2a-abc9-fe0b6717a51d.jpg' },
  ];
  
  // Duplicate array for seamless infinite scroll
  const loopedImages = [...carouselImages, ...carouselImages, ...carouselImages];

  return (
    <>
      <main style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '5rem' }}>
        
        {/* HERO - Light & Clean */}
        <section style={{ padding: '3rem 1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'radial-gradient(ellipse at top, #FEFBF6 0%, #FAFAFA 100%)' }}>
          
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ background: '#F8EACF', color: '#A98436', padding: '0.2rem 1rem', borderRadius: '50px', fontSize: '0.8rem', marginBottom: '1.5rem', fontWeight: 700 }}>
             نخبة المظلات في المملكة 🇸🇦
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ fontSize: '2.5rem', color: 'var(--text-white)', lineHeight: 1.2, marginBottom: '1rem' }}
          >
            نصمم الفخامة <br /> <span style={{ color: 'var(--gold)' }}>ونحمي سيارتك</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontSize: '1rem', color: 'var(--text-gray)', maxWidth: '600px', marginBottom: '2.5rem' }}>
            نوفر لك تصاميم عصرية مُنفذة يدويًا بدقة عالية لضمان استدامة وجمال ينسجم مع منزلك.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display: 'flex', width: '100%', maxWidth: '350px' }}>
            <button className="btn btn-primary btn-full" style={{ fontSize: '1.1rem' }} onClick={() => setStep(1)}>ابدأ تصميم مظلتي <FiChevronLeft /></button>
          </motion.div>

          {/* Feature Strip Base */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '3rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-gray)', fontWeight: 'bold', fontSize: '0.9rem' }}> <FiStar className="text-gold" /> تصميم مبتكر</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-gray)', fontWeight: 'bold', fontSize: '0.9rem' }}> <FiShield className="text-gold" /> ضمان 5 سنوات</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-gray)', fontWeight: 'bold', fontSize: '0.9rem' }}> <FiTool className="text-gold" /> تركيب سريع</div>
          </motion.div>

        </section>

        {/* ECOMMERCE AUTO SCROLLING CAROUSEL */}
        <section style={{ overflow: 'hidden', padding: '1rem 0' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
               <h2 style={{ fontSize: '1.8rem' }}>اختر التصميم الذي يعبر عنك</h2>
               <p className="text-gray mt-3" style={{ fontSize: '0.9rem' }}>تشكيلة واسعة من التصاميم العصرية الحديثة</p>
            </div>
            
            {/* The infinite marquee container */}
            <div style={{ position: 'relative', display: 'flex', overflow: 'hidden', width: '100%', padding: '1rem 0' }}>
                <motion.div
                  animate={{ x: [0, -1500] }}
                  transition={{ ease: 'linear', duration: 30, repeat: Infinity }}
                  style={{ display: 'flex', gap: '1rem', x: 0 }}
                >
                   {loopedImages.map((img, i) => (
                      <div key={i} className="card-base" style={{ width: '220px', flex: '0 0 auto', position: 'relative' }}>
                          <img src={img.src} alt={img.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                          <div style={{ padding: '1rem', textAlign: 'center' }}>
                             <h4 style={{ fontSize: '1rem', color: 'var(--text-white)', fontWeight: 800 }}>{img.title}</h4>
                          </div>
                      </div>
                   ))}
                </motion.div>
                
                {/* Fade edges to melt into white background */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '100%', background: 'linear-gradient(to right, #FAFAFA, transparent)', zIndex: 10 }}></div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '100%', background: 'linear-gradient(to left, #FAFAFA, transparent)', zIndex: 10 }}></div>
            </div>
        </section>

        {/* BRAND BANNERS / HIGHLIGHTS */}
        <section style={{ padding: '0 1.5rem' }}>
           <div className="banner-grid" style={{ maxWidth: '1000px', margin: '0 auto' }}>
              
              <div className="card-base" style={{ position: 'relative', overflow: 'hidden', border: 'none' }}>
                 <img src="/image/b4211f0e-6fdb-4c3d-90ab-489333c6c5d7.jpg" alt="Premium" style={{ width: '100%', height: '100%', minHeight: '200px', objectFit: 'cover' }} />
                 <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '2rem 1.5rem 1.5rem', color: '#FFF' }}>
                    <h3 style={{ fontSize: '1.4rem', color: '#FFF' }}>جودة لا تضاهى</h3>
                    <p style={{ color: '#EEE', fontSize: '0.9rem' }}>خامات تتحمل جميع الظروف.</p>
                 </div>
              </div>

              <div className="card-base" style={{ background: 'var(--gold)', color: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '2.5rem 2rem', border: 'none' }}>
                 <h3 style={{ fontSize: '2rem', color: '#FFF', marginBottom: '0.5rem' }}>خصم 15%</h3>
                 <p style={{ fontSize: '1rem', marginBottom: '1.5rem', color: '#FFF' }}>على الطلب المبكر عبر الموقع الإلكتروني.</p>
                 <button className="btn btn-full" style={{ background: '#FFF', color: 'var(--gold)' }} onClick={() => setStep(1)}>اطلب الاَن واحصل على العرض</button>
              </div>

           </div>
        </section>

      </main>
    </>
  );
};

export default Landing;
