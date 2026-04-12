import React from 'react';
import { useStore } from '../store';

const MobileNav = () => {
  const currentStep = useStore(state => state.currentStep);
  const setStep = useStore(state => state.setStep);

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex flex-row-reverse justify-around items-center px-4 pb-6 pt-2 bg-white/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.05)] rounded-t-xl md:hidden border-t border-outline-variant/10">
      <button 
        onClick={() => setStep(0)}
        className={`flex flex-col items-center justify-center transition-transform active:translate-y-[-2px] ${currentStep === 0 ? 'text-primary font-bold' : 'text-secondary font-medium'}`}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: currentStep === 0 ? "'FILL' 1" : "'FILL' 0" }}>home</span>
        <span className="font-label text-[10px] mt-1">الرئيسية</span>
      </button>

      <button 
        onClick={() => {
            setStep(0);
            setTimeout(() => {
                const gallery = document.getElementById('gallery');
                if (gallery) gallery.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }}
        className="flex flex-col items-center justify-center text-secondary font-medium active:translate-y-[-2px] transition-transform"
      >
        <span className="material-symbols-outlined">architecture</span>
        <span className="font-label text-[10px] mt-1">المشاريع</span>
      </button>

      <button 
        onClick={() => {
            setStep(0);
            setTimeout(() => {
                const loyalty = document.getElementById('loyalty');
                if (loyalty) loyalty.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }}
        className="flex flex-col items-center justify-center text-secondary font-medium active:translate-y-[-2px] transition-transform"
      >
        <span className="material-symbols-outlined">workspace_premium</span>
        <span className="font-label text-[10px] mt-1">الولاء</span>
      </button>

    </nav>
  );
};

export default MobileNav;
