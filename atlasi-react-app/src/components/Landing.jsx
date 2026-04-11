import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { FiChevronLeft, FiStar, FiShield, FiTool } from 'react-icons/fi';

const Landing = () => {
  const setStep = useStore(state => state.setStep);

  return (
    <>
      <main style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '5rem' }}>
        
        {/* HERO - Light & Clean */}
        <section style={{ padding: '3rem 1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'radial-gradient(ellipse at top, #FEFBF6 0%, #FAFAFA 100%)' }}>
          
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} style={{ background: '#F8EACF', color: '#A98436', padding: '0.2rem 1rem', borderRadius: '50px', fontSize: '0.8rem', marginBottom: '1.5rem', fontWeight: 700 }}>
             نخبة المظلات في المملكة العربية السعودية
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ fontSize: '2.5rem', color: 'var(--text-white)', lineHeight: 1.2, marginBottom: '1rem' }}
          >
            نصمم الفخامة <br /> <span style={{ color: 'var(--gold)' }}>ونحمي سيارتك</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ fontSize: '1rem', color: 'var(--text-gray)', maxWidth: '600px', marginBottom: '2.5rem' }}>
            نوفر لك تصاميم عصرية مُنفذة يدويًا بدقة عالية، تجمع بين الجمال والمتانة وتلبي احتياجاتك.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ display: 'flex', width: '100%', maxWidth: '350px' }}>
            <button className="btn btn-primary btn-full" style={{ fontSize: '1.1rem' }} onClick={() => setStep(1)}>ابدأ تصميم مظلتي <FiChevronLeft /></button>
          </motion.div>

          {/* Feature Strip Base */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '3rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-gray)', fontWeight: 'bold', fontSize: '0.9rem' }}> <FiShield className="text-gold" /> ضمان 5 سنوات</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-gray)', fontWeight: 'bold', fontSize: '0.9rem' }}> <FiTool className="text-gold" /> تركيب سريع</div>
          </motion.div>

        </section>

        {/* STATIC IMAGE SHOWCASE */}
        <section style={{ padding: '2rem 1.5rem', background: '#FAFAFA' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
               <h2 style={{ fontSize: '2rem', color: 'var(--text-white)' }}>تصفح التصاميم المتاحة </h2>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                background: 'linear-gradient(145deg, #FFFFFF 0%, #FFF8EC 100%)',
                border: '1px solid rgba(201,169,110,0.28)',
                borderRadius: '24px',
                padding: '1.2rem',
                boxShadow: '0 14px 34px rgba(169,132,54,0.12)',
                maxWidth: '1040px',
                margin: '0 auto'
              }}
            >
            <div style={{
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '1.5rem', 
                maxWidth: '1000px',
                margin: '0 auto'
            }}>
               <motion.div whileHover={{ y: -8 }} className="card-base" style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', borderRadius: '18px' }}>
                   <img src="/image/malaki.jpg" alt="ملكي" style={{ width: '100%', height: '240px', objectFit: 'cover', background: '#FFF', display: 'block', margin: 0 }} />
                   <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid #FAFAFA' }}>
                      <h4 style={{ fontSize: '1.5rem', color: 'var(--beige-main)', fontWeight: 800 }}>ملكي</h4>
                   </div>
               </motion.div>
               <motion.div whileHover={{ y: -8 }} className="card-base" style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', borderRadius: '18px' }}>
                   <img src="/image/sahara.jpeg" alt="صحراء" style={{ width: '100%', height: '240px', objectFit: 'cover', background: '#FFF', display: 'block', margin: 0 }} />
                   <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid #FAFAFA' }}>
                      <h4 style={{ fontSize: '1.5rem', color: 'var(--beige-main)', fontWeight: 800 }}>صحراء</h4>
                   </div>
               </motion.div>
               <motion.div whileHover={{ y: -8 }} className="card-base" style={{ position: 'relative', background: '#FFFFFF', overflow: 'hidden', borderRadius: '18px' }}>
                   <img src="/image/neom.jpg" alt="نيوم" style={{ width: '100%', height: '240px', objectFit: 'cover', background: '#FFF', display: 'block', margin: 0 }} />
                   <div style={{ padding: '1rem', textAlign: 'center', borderTop: '1px solid #FAFAFA' }}>
                      <h4 style={{ fontSize: '1.5rem', color: 'var(--beige-main)', fontWeight: 800 }}>نيوم</h4>
                   </div>
               </motion.div>
            </div>
            </motion.div>
        </section>

        {/* GOLDEN CARD SECTION - SIMPLE & ATTRACTIVE */}
        <section style={{
          marginTop: '3rem',
          background: 'linear-gradient(180deg, #FFFDF8 0%, #FFF8EC 55%, #FFFDF8 100%)',
          padding: '5rem 1.5rem',
          borderTop: '1px solid rgba(201,169,110,0.2)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <motion.div
            aria-hidden
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', top: '-120px', right: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,169,110,0.16) 0%, rgba(201,169,110,0) 70%)' }}
          />
          <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
              <motion.div
                animate={{ boxShadow: ['0 0 0 rgba(201,169,110,0.0)', '0 0 24px rgba(201,169,110,0.45)', '0 0 0 rgba(201,169,110,0.0)'] }}
                transition={{ duration: 2.6, repeat: Infinity }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FFF6E3', color: '#C49A2E', marginBottom: '1rem', border: '1px solid rgba(201,169,110,0.3)' }}
              >
                <FiStar style={{ fontSize: '1.8rem' }} />
              </motion.div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6D5628', marginBottom: '0.5rem' }}>
                بطاقة الأطلسي <span style={{ color: '#C49A2E' }}>الذهبية</span>
              </h2>
            </div>

            {/* Accroche */}
            <div style={{ padding: '0 1rem', marginBottom: '4rem' }}>
              <p style={{ 
                color: '#8E6C2E',
                fontSize: '1.5rem', 
                fontWeight: 800,
                lineHeight: '1.8'
              }}>
                تجربة تتطور معك… ومزايا ترتقي بك 🌟<br/>
                كل طلب يمنحك مستوى جديد من الامتيازات،<br/>
                لأنك تستحق الأفضل دائمًا مع الأطلسي.
              </p>
            </div>

            {/* 5 Cards Progressive Level */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center',
              alignItems: 'stretch',
              gap: '1rem', 
              marginBottom: '5rem',
            }}>
              {/* Card 1 */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} viewport={{ once: true }} whileHover={{ y: -8, boxShadow: '0 12px 28px rgba(201,169,110,0.2)' }} style={{ flex: '1 1 140px', padding: '1.5rem 1rem', background: '#FAFAFA', borderRadius: '15px', border: '1px solid #EBEBEB', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛒</div>
                <div style={{ fontSize: '0.9rem', color: '#756D60', marginBottom: '0.5rem' }}>الطلب الأول</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1A1A1A' }}>إصدار البطاقة</div>
              </motion.div>
              
              {/* Card 2 */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }} whileHover={{ y: -8, boxShadow: '0 12px 28px rgba(201,169,110,0.2)' }} style={{ flex: '1 1 140px', padding: '1.5rem 1rem', background: '#FAFAFA', borderRadius: '15px', border: '1px solid #EBEBEB', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥇</div>
                <div style={{ fontSize: '0.9rem', color: '#756D60', marginBottom: '0.5rem' }}>الطلب الثاني</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#C49A2E' }}>5% خصم</div>
              </motion.div>
              
              {/* Card 3 */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }} whileHover={{ y: -8, boxShadow: '0 12px 28px rgba(201,169,110,0.2)' }} style={{ flex: '1 1 140px', padding: '1.5rem 1rem', background: '#FAFAFA', borderRadius: '15px', border: '1px solid #EBEBEB', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥈</div>
                <div style={{ fontSize: '0.9rem', color: '#756D60', marginBottom: '0.5rem' }}>الطلب الثالث</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#C49A2E' }}>5% خصم</div>
              </motion.div>

              {/* Card 4 */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} viewport={{ once: true }} whileHover={{ y: -8, boxShadow: '0 12px 28px rgba(201,169,110,0.2)' }} style={{ flex: '1 1 140px', padding: '1.5rem 1rem', background: '#FAFAFA', borderRadius: '15px', border: '1px solid #EBEBEB', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🥉</div>
                <div style={{ fontSize: '0.9rem', color: '#756D60', marginBottom: '0.5rem' }}>الطلب الرابع</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#C49A2E' }}>10% خصم</div>
              </motion.div>

              {/* Card 5 - The WOW visual */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                whileInView={{ opacity: 1, scale: 1.05 }} 
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6, delay: 0.5, type: 'spring' }} 
                viewport={{ once: true }}
                style={{ 
                flex: '1 1 160px', 
                padding: '2rem 1rem', 
                background: 'linear-gradient(145deg, #FFF9EB, #FDF0D5)', 
                borderRadius: '15px', 
                border: '1px solid #E8C55A',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(232, 197, 90, 0.25)',
                transform: 'scale(1.05)'
              }}>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'inline-block' }}>🏆</motion.div>
                <div style={{ fontSize: '1rem', color: '#A98436', marginBottom: '0.5rem', fontWeight: 'bold' }}>الطلب الخامس</div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#C49A2E' }}>50%<br/><span style={{fontSize: '1rem', fontWeight: '600'}}>نصف السعر</span></div>
              </motion.div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
};

export default Landing;
