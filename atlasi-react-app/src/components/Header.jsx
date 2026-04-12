import React from 'react';
import { useStore } from '../store';

const Header = () => {
  const setStep = useStore(state => state.setStep);
  const currentStep = useStore(state => state.currentStep);

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#fcf9f8]/80 backdrop-blur-xl border-b border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-3 flex justify-between items-center">

        {/* Brand — Logo + Name */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setStep(0)}
        >
          <img
            src="/image/logo/72673ecd-fec0-44e8-ab40-c520e10e98a7-removebg-preview.png"
            alt="شعار الأطلسي"
            className="w-10 h-10 object-contain"
          />
          <div>
            <p className="text-base font-headline font-bold text-primary leading-tight">مظلات الأطلسي</p>
            <p className="text-[9px] text-secondary tracking-widest uppercase leading-none">Al Atlashi Shades</p>
          </div>
        </div>

        {/* Navigation Links (Desktop) */}


        {/* CTA */}
        <button
          onClick={() => setStep(1)}
          className="bg-primary text-on-primary px-8 py-2 rounded-lg font-label text-xs font-semibold tracking-wide hover:opacity-90 transition-opacity active:scale-95"
        >
          {currentStep > 0 ? `الخطوة ${currentStep}` : 'اطلب الآن'}
        </button>

      </div>
    </nav>
  );
};

export default Header;
