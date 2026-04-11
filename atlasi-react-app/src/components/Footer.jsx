import React from 'react';
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiTwitter, FiFacebook } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer id="contact" style={{ background: 'var(--bg-void)', borderTop: '1px solid var(--border-glass)', padding: '4rem 2rem 2rem', marginTop: 'auto' }}>
      <div className="grid-responsive" style={{ gap: '3rem', maxWidth: '1200px', margin: '0 auto', borderBottom: '1px solid var(--border-glass)', paddingBottom: '3rem' }}>
         
         {/* Brand Section */}
         <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <img src="/image/logo/72673ecd-fec0-44e8-ab40-c520e10e98a7.jpg" alt="Logo" style={{ height: '50px', borderRadius: '8px' }} />
              <span style={{ fontSize: '1.5rem', fontWeight: '900', fontFamily: 'var(--font-display)', color: 'var(--text-white)' }}>مظلات الأطلسي</span>
            </div>
            <p className="text-gray" style={{ marginBottom: '1.5rem', maxWidth: '300px' }}>
              الرواد في تصميم وتنفيذ المظلات الفاخرة للسيارات والحدائق في المملكة العربية السعودية. جودة تدوم طويلاً وتصاميم تواكب العصر.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <a href="#" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', border: '1px solid var(--border-glass)' }}><FiInstagram size={20} /></a>
               <a href="#" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', border: '1px solid var(--border-glass)' }}><FiTwitter size={20} /></a>
               <a href="#" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', border: '1px solid var(--border-glass)' }}><FiFacebook size={20} /></a>
            </div>
         </div>

         {/* Loyalty Features */}
         <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-white)' }}>مزايا الولاء</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-gray)' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span className="text-gold" style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>📲</span>
                <span>
                  <strong style={{ color: 'var(--text-white)' }}>إصدار تلقائي</strong><br />
                  تُرسل للعميل عبر واتساب بعد التركيب مباشرة
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span className="text-gold" style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>📱</span>
                <span>
                  <strong style={{ color: 'var(--text-white)' }}>مرتبطة برقم الجوال</strong><br />
                  الخصومات محفوظة في النظام ولا تنتهي
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <span className="text-gold" style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>🎁</span>
                <span>
                  <strong style={{ color: 'var(--text-white)' }}>قابلة للإهداء</strong><br />
                  شارك رمز خصمك مع العائلة والأصدقاء
                </span>
              </li>
            </ul>
         </div>

         {/* Contact Info */}
         <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-white)' }}>تواصل معنا</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-gray)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiMapPin className="text-gold" /> الرياض، المملكة العربية السعودية</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiPhone className="text-gold" /> <span style={{ fontFamily: 'var(--font-numbers)' }}>+966 50 123 4567</span></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiMail className="text-gold" /> <span style={{ fontFamily: 'var(--font-numbers)' }}>contact@atlasi.sa</span></li>
            </ul>
         </div>

      </div>
      
      <div style={{ textAlign: 'center', paddingTop: '2rem', color: 'var(--text-gray)', fontSize: '0.9rem' }}>
         <p>© {new Date().getFullYear()} مظلات الأطلسي. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
};

export default Footer;
