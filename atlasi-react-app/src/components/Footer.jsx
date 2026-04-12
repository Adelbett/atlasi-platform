import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto px-12 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 text-right">

        {/* Brand */}
        <div className="space-y-5">
          {/* Logo + Name */}
          <div className="flex items-center gap-3 justify-end">
            <div>
              <p className="text-xl font-headline font-bold text-primary leading-tight">مظلات الأطلسي</p>
              <p className="text-[10px] text-secondary tracking-widest uppercase">Al Atlashi Shades</p>
            </div>
            <img
              src="/image/logo/72673ecd-fec0-44e8-ab40-c520e10e98a7-removebg-preview.png"
              alt="شعار الأطلسي"
              className="w-14 h-14 object-contain flex-shrink-0"
            />
          </div>
          <p className="text-xs leading-relaxed text-secondary font-medium">
            الرواد في تصميم وتنفيذ المظلات الفاخرة للسيارات والحدائق في المملكة العربية السعودية. جودة تدوم طويلاً وتصاميم تواكب العصر.
          </p>
          <div className="flex gap-3 justify-end">
            <a className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" href="#">
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
            <a className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" href="#">
              <span className="material-symbols-outlined text-sm">alternate_email</span>
            </a>
            <a className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all" href="#">
              <span className="material-symbols-outlined text-sm">share</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-5">
          <h5 className="font-headline font-bold text-[10px] tracking-widest uppercase text-on-surface">روابط سريعة</h5>
          <ul className="space-y-3 text-[11px] font-medium text-secondary list-none p-0">
            <li><a className="hover:text-primary transition-colors" href="#">سياسة الخصوصية</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">شروط الخدمة</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">مواقع المعارض</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">الدعم والمساعدة</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-5">
          <h5 className="font-headline font-bold text-[10px] tracking-widest uppercase text-on-surface">تواصل معنا</h5>
          <ul className="space-y-4 text-[11px] font-medium text-secondary list-none p-0">
            <li className="flex items-start gap-3 justify-end">
              <span>الرياض، المملكة العربية السعودية</span>
              <span className="material-symbols-outlined text-primary text-base flex-shrink-0">location_on</span>
            </li>
            <li className="flex items-center gap-3 justify-end">
              <span dir="ltr">+966 50 123 4567</span>
              <span className="material-symbols-outlined text-primary text-base flex-shrink-0">call</span>
            </li>
            <li className="flex items-center gap-3 justify-end">
              <span>contact@atlasi.sa</span>
              <span className="material-symbols-outlined text-primary text-base flex-shrink-0">mail</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-12 py-6 border-t border-outline-variant/10 text-center text-[9px] font-bold tracking-widest text-secondary/60 uppercase">
        © {new Date().getFullYear()} مظلات الأطلسي — Al Atlashi Architectural Shades. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
};

export default Footer;
