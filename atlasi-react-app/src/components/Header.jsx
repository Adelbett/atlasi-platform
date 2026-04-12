import React from 'react';
import { useStore } from '../store';

const Header = () => {
  const setStep = useStore(state => state.setStep);
  const currentStep = useStore(state => state.currentStep);

  return (
    <header className="fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex justify-between items-center">

        {/* Brand — Logo + Name */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setStep(0)}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center border border-[#D4AF37]/40 overflow-hidden">
            <img
              src="/image/logo/72673ecd-fec0-44e8-ab40-c520e10e98a7-removebg-preview.png"
              alt="شعار الأطلسي"
              className="w-9 h-9 object-contain"
            />
          </div>
          <div>
            <p className="text-base font-bold leading-tight logo">مظلات الأطلسي</p>
            <p className="text-[9px] opacity-60 tracking-widest leading-none">للمظلات الفاخرة</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => setStep(1)}
          className="btn-cta transition-all active:scale-95"
        >
          {currentStep > 0 ? `الخطوة ${currentStep}` : 'اطلب الآن'}
        </button>

      </div>
    </header>
  );
};

export default Header;
