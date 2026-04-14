import React from 'react';

const Footer = () => {
  return (
    <footer className="pt-16 pb-32 md:pb-16 px-8 text-right">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 justify-between">

        <div className="md:max-w-xs space-y-6">
          <div className="flex flex-col gap-2">
            <h4 className="font-bold footer-title text-2xl">مظلات الأطلسي</h4>
            <p className="text-[10px] text-[#D4A017] tracking-[0.2em] opacity-90">رواد حلول التظليل في المملكة</p>
          </div>
          <p className="opacity-60 text-sm leading-relaxed">
            الرائدون في حلول التظليل والأنظمة الهندسية الحديثة في المملكة العربية السعودية. جودة تدوم طويلاً وتصاميم تواكب العصر المعماري.
          </p>

        </div>

        <div className="grid grid-cols-2 gap-12 md:gap-24">

          <div className="flex flex-col gap-5">
            <h5 className="font-bold footer-title text-lg">تواصل معنا</h5>
            <ul className="flex flex-col gap-3 list-none footer-links">
              <li className="text-sm opacity-60">الدمام، المملكة العربية السعودية</li>
              <li className="text-sm opacity-60" dir="ltr">+966 54 810 5757</li>
              <li className="text-sm opacity-60">info@atlasi.sa</li>
            </ul>
          </div>
        </div>

      </div>





      <div className="max-w-7xl mx-auto mt-10 footer-bottom flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} جميع الحقوق محفوظة للأطلسي للمظلات</p>
        
      </div>
    </footer>
  );
};

export default Footer;
