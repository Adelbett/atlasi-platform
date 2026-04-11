import React from 'react';
import { useStore } from '../store';

const Header = () => {
  const setStep = useStore(state => state.setStep);
  const currentStep = useStore(state => state.currentStep);

  return (
    <header style={{ 
      padding: '1rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      background: '#FFFFFF', 
      borderBottom: '1px solid var(--border-glass)', 
      position: 'sticky', 
      top: 0, 
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
    }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}
        onClick={() => setStep(0)}
      >
        <img src="/image/logo/72673ecd-fec0-44e8-ab40-c520e10e98a7.jpg" alt="Logo Atlasi" style={{ height: '40px', borderRadius: '8px' }} />
        <span style={{ color: 'var(--text-white)', fontSize: '1.2rem', fontWeight: '900', fontFamily: 'var(--font-display)' }}>
          مظلات الأطلسي
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {currentStep === 0 && (
          <button className="btn btn-primary" style={{ minHeight: '40px', padding: '0.4rem 1.5rem', fontSize: '0.9rem' }} onClick={() => setStep(1)}>
            اطلب الآن
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
