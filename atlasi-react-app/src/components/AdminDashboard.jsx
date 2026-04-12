import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'http://localhost:8080/api';

// ── Status config ────────────────────────────────────────────────
const STATUSES = {
  new:        { label: 'جديد',           color: '#2563eb', bg: '#eff6ff' },
  pending:    { label: 'في الانتظار',    color: '#d97706', bg: '#fffbeb' },
  confirmed:  { label: 'مؤكد',           color: '#16a34a', bg: '#f0fdf4' },
  scheduled:  { label: 'زيارة مجدولة',   color: '#7c3aed', bg: '#f5f3ff' },
  measured:   { label: 'قياسات منتهية',  color: '#0891b2', bg: '#ecfeff' },
  production: { label: 'في الورشة',      color: '#ea580c', bg: '#fff7ed' },
  ready:      { label: 'جاهز للتركيب',   color: '#059669', bg: '#ecfdf5' },
  installed:  { label: 'تركيب مكتمل',    color: '#15803d', bg: '#dcfce7' },
  cancelled:  { label: 'ملغي',           color: '#dc2626', bg: '#fef2f2' },
};

const normalizeStatus = (raw) => {
  if (!raw) return 'new';
  const s = String(raw).toLowerCase();
  if (s.includes('confirm') || s.includes('مؤكد')) return 'confirmed';
  if (s.includes('annul') || s.includes('cancel') || s.includes('رفض') || s.includes('ملغي')) return 'cancelled';
  if (s.includes('visite') || s.includes('schedul') || s.includes('زيار') || s.includes('planif')) return 'scheduled';
  if (s.includes('mesur') || s.includes('قياس')) return 'measured';
  if (s.includes('atelier') || s.includes('product') || s.includes('ورشة') || s.includes('fabricat')) return 'production';
  if (s.includes('ready') || s.includes('جاهز')) return 'ready';
  if (s.includes('install') || s.includes('termin') || s.includes('مكتمل') || s.includes('livr')) return 'installed';
  if (s.includes('attent') || s.includes('انتظار')) return 'pending';
  return 'new';
};

const StatusBadge = ({ status }) => {
  const k = normalizeStatus(status);
  const c = STATUSES[k] || STATUSES.new;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap"
      style={{ color: c.color, backgroundColor: c.bg }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
      {c.label}
    </span>
  );
};

// ── Mock data ─────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];

const MOCK_REQUESTS = [
  { id: 1, clientName: 'محمد العمراني',   phone: '0501234567', confirmationNumber: 'ATL-2026-0042', designType: 'ملكي',   size: 'كبير', fixation: 'أعمدة',  fabricColor: 'بيج',   status: 'pending',    estimatedPrice: 1899, requestDate: new Date().toISOString() },
  { id: 2, clientName: 'سارة المنصور',    phone: '0559876543', confirmationNumber: 'ATL-2026-0043', designType: 'نيوم',   size: 'صغير', fixation: 'معلقة',  fabricColor: 'أسود',  status: 'confirmed',  estimatedPrice: 999,  requestDate: new Date().toISOString() },
  { id: 3, clientName: 'عبدالله الفايز',  phone: '0571112233', confirmationNumber: 'ATL-2026-0044', designType: 'صحراء',  size: 'كبير', fixation: 'أعمدة',  fabricColor: 'بيج',   status: 'scheduled',  estimatedPrice: 2599, requestDate: new Date().toISOString() },
  { id: 4, clientName: 'نورة الشمري',     phone: '0534445566', confirmationNumber: 'ATL-2026-0045', designType: 'ملكي',   size: 'كبير', fixation: 'معلقة',  fabricColor: 'رمادي', status: 'production', estimatedPrice: 2399, requestDate: new Date().toISOString() },
  { id: 5, clientName: 'خالد الدوسري',    phone: '0507778899', confirmationNumber: 'ATL-2026-0046', designType: 'نيوم',   size: 'صغير', fixation: 'أعمدة',  fabricColor: 'أبيض',  status: 'installed',  estimatedPrice: 1699, requestDate: new Date().toISOString() },
  { id: 6, clientName: 'أحمد السلمي',     phone: '0512223344', confirmationNumber: 'ATL-2026-0047', designType: 'ملكي',   size: 'صغير', fixation: 'معلقة',  fabricColor: 'بيج',   status: 'new',        estimatedPrice: 1499, requestDate: new Date().toISOString() },
  { id: 7, clientName: 'ليلى القحطاني',   phone: '0521114455', confirmationNumber: 'ATL-2026-0048', designType: 'صحراء',  size: 'صغير', fixation: 'أعمدة',  fabricColor: 'أسود',  status: 'installed',  estimatedPrice: 1290, requestDate: new Date(Date.now()-86400000*5).toISOString() },
  { id: 8, clientName: 'فيصل العتيبي',    phone: '0531115566', confirmationNumber: 'ATL-2026-0049', designType: 'نيوم',   size: 'كبير', fixation: 'معلقة',  fabricColor: 'بيج',   status: 'cancelled',  estimatedPrice: 1699, requestDate: new Date(Date.now()-86400000*2).toISOString() },
];

const MOCK_APPOINTMENTS = [
  { id: 1, agentName: 'فهد العتيبي',    appointmentType: 'زيارة ميدانية', appointmentDate: TODAY, startTime: '07:00', duration: 90,  status: 'قادمة',    request: { clientName: 'أحمد السلمي',   confirmationNumber: 'ATL-2026-0047' }, location: 'حي النرجس، الرياض',   note: 'الوصول من الباب الجانبي' },
  { id: 2, agentName: 'سلطان الغامدي',  appointmentType: 'تركيب',          appointmentDate: TODAY, startTime: '08:00', duration: 120, status: 'قادمة',    request: { clientName: 'خالد الدوسري',  confirmationNumber: 'ATL-2026-0046' }, location: 'حي الملقا، الرياض',   note: '' },
  { id: 3, agentName: 'فهد العتيبي',    appointmentType: 'زيارة ميدانية', appointmentDate: TODAY, startTime: '10:30', duration: 60,  status: 'مكتملة',   request: { clientName: 'محمد العمراني', confirmationNumber: 'ATL-2026-0042' }, location: 'حي العقيق، الرياض',   note: '' },
  { id: 4, agentName: 'سلطان الغامدي',  appointmentType: 'متابعة ضمان',   appointmentDate: TODAY, startTime: '14:00', duration: 60,  status: 'قادمة',    request: { clientName: 'نورة الشمري',   confirmationNumber: 'ATL-2026-0045' }, location: 'حي الروضة، الرياض',   note: '' },
  { id: 5, agentName: 'فهد العتيبي',    appointmentType: 'تركيب',          appointmentDate: TODAY, startTime: '15:30', duration: 90,  status: 'قادمة',    request: { clientName: 'سارة المنصور',  confirmationNumber: 'ATL-2026-0043' }, location: 'حي الصحافة، الرياض',  note: '' },
  { id: 6, agentName: 'سلطان الغامدي',  appointmentType: 'زيارة مرجأة',   appointmentDate: TODAY, startTime: '11:00', duration: 60,  status: 'مرجأة',    request: { clientName: 'فيصل العتيبي',  confirmationNumber: 'ATL-2026-0049' }, location: 'حي الياسمين',         note: 'مؤجل بطلب العميل' },
];

const VISIT_COLORS = {
  'زيارة ميدانية': { color: '#2563eb', bg: '#eff6ff' },
  'تركيب':          { color: '#16a34a', bg: '#f0fdf4' },
  'زيارة مرجأة':   { color: '#d97706', bg: '#fffbeb' },
  'زيارة ملغاة':   { color: '#dc2626', bg: '#fef2f2' },
  'متابعة ضمان':   { color: '#7c3aed', bg: '#f5f3ff' },
  'مكتملة':         { color: '#6b7280', bg: '#f9fafb' },
};

const apiFetch = (path, opts) =>
  fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json());

// ── Sidebar nav ───────────────────────────────────────────────────
const NAV = [
  { path: '/admin',           icon: 'dashboard',         label: 'لوحة التحكم' },
  { path: '/admin/requests',  icon: 'inbox',              label: 'الطلبات' },
  { path: '/admin/pipeline',  icon: 'account_tree',       label: 'سير العمل' },
  { path: '/admin/calendar',  icon: 'calendar_today',     label: 'الأجندة' },
  { path: '/admin/clients',   icon: 'groups',             label: 'العملاء' },
  { path: '/admin/loyalty',   icon: 'workspace_premium',  label: 'برنامج الولاء' },
  { path: '/admin/reports',   icon: 'bar_chart',          label: 'التقارير' },
  { path: '/admin/settings',  icon: 'settings',           label: 'الإعدادات' },
];

const Sidebar = ({ onLogout }) => {
  const { pathname } = useLocation();
  return (
    <aside className="fixed right-0 top-0 h-full w-56 bg-white border-l border-gray-100 flex flex-col z-50 shadow-sm">
      <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2.5">
        <img src="/image/logo/72673ecd-fec0-44e8-ab40-c520e10e98a7-removebg-preview.png" alt="" className="w-8 h-8 object-contain" />
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">مظلات الأطلسي</p>
          <p className="text-[10px] text-gray-400">لوحة الإدارة</p>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ path, icon, label }) => {
          const active = pathname === path || (path !== '/admin' && pathname.startsWith(path));
          return (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
              <span className="material-symbols-outlined text-[18px] flex-shrink-0"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
};

const AdminLayout = ({ children, onLogout }) => {
  const { pathname } = useLocation();
  const navItem = NAV.find(n => pathname === n.path || (n.path !== '/admin' && pathname.startsWith(n.path)));
  return (
    <div className="flex h-screen bg-gray-50" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 mr-56 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            {navItem && <span className="material-symbols-outlined text-[18px] text-gray-400">{navItem.icon}</span>}
            <h1 className="text-sm font-semibold text-gray-800">{navItem?.label || 'لوحة التحكم'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <input type="text" placeholder="بحث سريع..."
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs w-48 outline-none focus:border-gray-400 transition-colors" />
            <button className="relative p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold cursor-pointer">A</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

// ── MODULE 1: لوحة التحكم ────────────────────────────────────────
const Overview = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('اليوم');

  useEffect(() => {
    apiFetch('/admin/requests')
      .then(d => { setRequests(d); setLoading(false); })
      .catch(() => { setRequests(MOCK_REQUESTS); setLoading(false); });
  }, []);

  const todayStr = new Date().toLocaleDateString('ar-SA');
  const todayRequests  = requests.filter(r => new Date(r.requestDate).toLocaleDateString('ar-SA') === todayStr);
  const pendingCount   = requests.filter(r => ['new','pending'].includes(normalizeStatus(r.status))).length;
  const clientSet      = new Set(requests.map(r => r.phone || r.clientName));
  const monthRevenue   = requests.filter(r => normalizeStatus(r.status) === 'installed')
    .reduce((s, r) => s + (Number(r.estimatedPrice) || 0), 0);
  const yearRevenue    = monthRevenue * 1.4; // mock estimate

  const kpis = [
    { label: 'إجمالي الطلبات',   value: requests.length,              icon: 'shopping_bag',     unit: '',      alert: false },
    { label: 'طلبات اليوم',      value: todayRequests.length,         icon: 'today',            unit: '',      alert: false },
    { label: 'الطلبات المعلقة',  value: pendingCount,                  icon: 'pending_actions',  unit: '',      alert: pendingCount > 5 },
    { label: 'إجمالي العملاء',   value: clientSet.size,               icon: 'group',            unit: '',      alert: false },
    { label: 'إيرادات الشهر',    value: monthRevenue.toLocaleString(), icon: 'payments',         unit: 'ر.س',   alert: false },
    { label: 'إيرادات السنة',    value: Math.round(yearRevenue).toLocaleString(), icon: 'bar_chart', unit: 'ر.س', alert: false },
  ];

  const statusCounts = Object.entries(
    requests.reduce((acc, r) => { const k = normalizeStatus(r.status); acc[k] = (acc[k] || 0) + 1; return acc; }, {})
  );

  const FUNNEL = [
    { label: 'طلب جديد',       key: ['new','pending'] },
    { label: 'مؤكد',           key: ['confirmed'] },
    { label: 'زيارة ميدانية',  key: ['scheduled'] },
    { label: 'في الورشة',      key: ['production','measured','ready'] },
    { label: 'تركيب مكتمل',    key: ['installed'] },
  ].map(f => ({ ...f, count: requests.filter(r => f.key.includes(normalizeStatus(r.status))).length }));
  const funnelMax = FUNNEL[0]?.count || 1;

  const recent20 = [...requests].sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)).slice(0, 20);
  const relTime = (d) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} ساعة`;
    return `منذ ${Math.floor(hrs / 24)} يوم`;
  };

  const AGENTS = [
    { name: 'فهد العتيبي',   visits: 18, installed: 14, avgDays: 2.3 },
    { name: 'سلطان الغامدي', visits: 12, installed: 11, avgDays: 1.9 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">نظرة عامة</h2>
          <p className="text-sm text-gray-400 mt-0.5">آخر تحديث: الآن</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors">
          <span className="material-symbols-outlined text-sm">download</span>
          تصدير التقرير
        </button>
      </div>

      {/* BLOC A — 6 KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className={`bg-white border rounded-xl p-4 shadow-sm relative ${k.alert ? 'border-red-200' : 'border-gray-100'}`}>
            {k.alert && (
              <span className="absolute top-2 left-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">!</span>
            )}
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mb-3">
              <span className="material-symbols-outlined text-gray-500 text-[16px]">{k.icon}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 leading-none">
              {loading ? '—' : k.value}
              {k.unit && <span className="text-xs font-normal text-gray-400 mr-1">{k.unit}</span>}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 leading-tight">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent requests table */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">آخر الطلبات</h3>
            <div className="flex gap-1">
              {['اليوم', 'الأسبوع', 'الشهر'].map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${period === p ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50">
                <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-2.5">رقم الطلب</th>
                  <th className="px-4 py-2.5">العميل</th>
                  <th className="px-4 py-2.5">التصميم</th>
                  <th className="px-4 py-2.5">اللون</th>
                  <th className="px-4 py-2.5">الحالة</th>
                  <th className="px-4 py-2.5">التاريخ</th>
                  <th className="px-4 py-2.5 text-left">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="py-10 text-center text-gray-300">جاري التحميل...</td></tr>
                ) : recent20.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-mono text-gray-400">{r.confirmationNumber || `#${r.id}`}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{r.clientName}</td>
                    <td className="px-4 py-2.5 text-gray-500">{r.designType} · {r.size}</td>
                    <td className="px-4 py-2.5 text-gray-400">{r.fabricColor}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-2.5 text-gray-300">{relTime(r.requestDate)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1 justify-end">
                        {['new','pending'].includes(normalizeStatus(r.status)) && (
                          <button className="w-6 h-6 rounded bg-green-50 text-green-600 hover:bg-green-600 hover:text-white transition-colors flex items-center justify-center">
                            <span className="material-symbols-outlined text-[12px]">check</span>
                          </button>
                        )}
                        <button className="w-6 h-6 rounded border border-gray-200 text-gray-400 hover:border-gray-400 transition-colors flex items-center justify-center">
                          <span className="material-symbols-outlined text-[12px]">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-50 text-center">
            <Link to="/admin/requests" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">عرض جميع الطلبات ←</Link>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Alerts */}
          {pendingCount > 0 && (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[16px]">warning</span>
                <h3 className="text-sm font-semibold text-gray-800">تنبيهات</h3>
              </div>
              <div className="p-3 space-y-2">
                {pendingCount > 0 && (
                  <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <p className="text-xs text-red-700">{pendingCount} طلبات معلقة بدون رد</p>
                  </div>
                )}
                <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">ضمانان ينتهيان خلال 7 أيام</p>
                </div>
              </div>
            </div>
          )}

          {/* Funnel */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">مسار التحويل</h3>
            <div className="space-y-2">
              {FUNNEL.map((f, i) => {
                const pct = funnelMax > 0 ? Math.round((f.count / funnelMax) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-gray-500">{f.label}</span>
                      <span className="text-[10px] font-medium text-gray-700">{f.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-800 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent performance */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">أداء الفنيين</h3>
            <div className="space-y-3">
              {AGENTS.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {a.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{a.name}</p>
                    <p className="text-[10px] text-gray-400">{a.visits} زيارة · {a.installed} تركيب</p>
                  </div>
                  <span className="text-[10px] text-gray-400">{a.avgDays} يوم</span>
                </div>
              ))}
            </div>
          </div>

          {/* System status */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">حالة النظام</h3>
            {[
              { label: 'API WhatsApp', ok: true },
              { label: 'قاعدة البيانات', ok: true },
              { label: 'Google Maps API', ok: true },
              { label: 'الخادم', ok: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${s.ok ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-green-500' : 'bg-red-500'}`} />
                  {s.ok ? 'متصل' : 'غير متصل'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Page: Requests ────────────────────────────────────────────────
const Requests = () => {
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('الكل');
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [newNote, setNewNote]     = useState('');
  const [saving, setSaving]       = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch('/admin/requests')
      .then(d => { setRequests(d); setLoading(false); })
      .catch(() => { setRequests(MOCK_REQUESTS); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const action = (id, act) => {
    apiFetch(`/admin/requests/${id}/${act}`, { method: 'PUT' }).then(load).catch(load);
  };

  const filtered = requests.filter(r => {
    const label = STATUSES[normalizeStatus(r.status)]?.label || '';
    const ok1 = filter === 'الكل' || label === filter;
    const ok2 = !search || r.clientName?.includes(search) || r.phone?.includes(search) || r.confirmationNumber?.includes(search);
    return ok1 && ok2;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">الطلبات</h2>
        <span className="text-xs text-gray-400">{filtered.length} طلب</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-[18px]">search</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف أو رقم الطلب..."
            className="w-full bg-white border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['الكل', ...Object.values(STATUSES).slice(0, 5).map(s => s.label)].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border ${filter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              <th className="px-5 py-3">رقم الطلب</th>
              <th className="px-5 py-3">العميل</th>
              <th className="px-5 py-3">الجوال</th>
              <th className="px-5 py-3">التصميم</th>
              <th className="px-5 py-3">الحالة</th>
              <th className="px-5 py-3">التاريخ</th>
              <th className="px-5 py-3 text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="py-16 text-center text-sm text-gray-400">جاري التحميل...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-16 text-center text-sm text-gray-300">لا توجد نتائج</td></tr>
            ) : filtered.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(r)}>
                <td className="px-5 py-3 text-xs font-mono text-gray-500">{r.confirmationNumber || `#${r.id}`}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-800">{r.clientName}</td>
                <td className="px-5 py-3 text-xs text-gray-400">{r.phone}</td>
                <td className="px-5 py-3">
                  <span className="text-xs text-gray-600">{r.designType}</span>
                  <span className="text-xs text-gray-300 mx-1">·</span>
                  <span className="text-xs text-gray-400">{r.fabricColor}</span>
                </td>
                <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3 text-xs text-gray-400">
                  {r.requestDate ? new Date(r.requestDate).toLocaleDateString('ar-SA') : '—'}
                </td>
                <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-1 justify-end">
                    {['new','pending'].includes(normalizeStatus(r.status)) && (
                      <>
                        <button onClick={() => action(r.id, 'accept')}
                          className="w-7 h-7 rounded-md bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </button>
                        <button onClick={() => action(r.id, 'reject')}
                          className="w-7 h-7 rounded-md bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </>
                    )}
                    <button onClick={() => setSelected(r)}
                      className="w-7 h-7 rounded-md border border-gray-200 text-gray-400 flex items-center justify-center hover:border-gray-400 hover:text-gray-700 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-black/20 backdrop-blur-sm" />
          <motion.aside initial={{ x: -400 }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25 }}
            className="w-full max-w-md bg-white shadow-2xl overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 font-mono">{selected.confirmationNumber}</p>
                <h3 className="font-bold text-gray-900">{selected.clientName}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 text-gray-400 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <StatusBadge status={selected.status} />
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['الاسم', selected.clientName], ['الجوال', selected.phone],
                  ['التصميم', selected.designType], ['الحجم', selected.size],
                  ['التثبيت', selected.fixation], ['اللون', selected.fabricColor],
                  ['السعر', selected.estimatedPrice ? `${Number(selected.estimatedPrice).toLocaleString()} ر.س` : '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{k}</p>
                    <p className="font-medium text-gray-800">{v || '—'}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">ملاحظة إدارية</p>
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={3}
                  placeholder="اكتب ملاحظة..."
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-gray-400 resize-none transition-colors" />
                <button disabled={saving} className="mt-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black disabled:opacity-50 transition-colors">حفظ</button>
              </div>
              <div className="pt-2 flex gap-2">
                {normalizeStatus(selected.status) !== 'confirmed' && normalizeStatus(selected.status) !== 'cancelled' && (
                  <button onClick={() => { action(selected.id, 'accept'); setSelected(null); }}
                    className="flex-1 py-2.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">تأكيد الطلب</button>
                )}
                {normalizeStatus(selected.status) !== 'cancelled' && (
                  <button onClick={() => { action(selected.id, 'reject'); setSelected(null); }}
                    className="flex-1 py-2.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-600 hover:text-white transition-colors">إلغاء الطلب</button>
                )}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </div>
  );
};

// ── Page: Pipeline ────────────────────────────────────────────────
const PIPELINE_COLS = [
  { id: 'new',        label: 'جديد',          color: '#2563eb' },
  { id: 'confirmed',  label: 'مؤكد',          color: '#16a34a' },
  { id: 'scheduled',  label: 'زيارة مجدولة',  color: '#7c3aed' },
  { id: 'production', label: 'في الورشة',     color: '#ea580c' },
  { id: 'installed',  label: 'تركيب مكتمل',   color: '#15803d' },
];

const Pipeline = () => {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    apiFetch('/admin/requests').then(setRequests).catch(() => setRequests(MOCK_REQUESTS));
  }, []);
  const colItems = (id) => requests.filter(r =>
    normalizeStatus(r.status) === id || (id === 'new' && ['new','pending'].includes(normalizeStatus(r.status)))
  );
  return (
    <div className="space-y-5 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-900">سير العمل</h2>
      <div className="flex-1 flex gap-4 overflow-x-auto pb-2">
        {PIPELINE_COLS.map(col => {
          const items = colItems(col.id);
          return (
            <div key={col.id} className="w-64 flex-shrink-0 flex flex-col bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: col.color }} />
                  <span className="text-xs font-semibold text-gray-700">{col.label}</span>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">{items.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {items.map(r => (
                  <div key={r.id} className="bg-white border border-gray-100 rounded-lg p-3 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
                    <p className="text-[10px] font-mono text-gray-400 mb-1">{r.confirmationNumber || `#${r.id}`}</p>
                    <p className="text-sm font-medium text-gray-800 leading-tight">{r.clientName}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{r.designType} · {r.fabricColor}</p>
                  </div>
                ))}
                {items.length === 0 && <div className="py-8 text-center text-xs text-gray-300">لا توجد طلبات</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── MODULE 3: الأجندة ─────────────────────────────────────────────
const HOURS = Array.from({ length: 23 }, (_, i) => {
  const totalMins = 360 + i * 30; // 06:00 start, 30min slots
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return { label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, totalMins };
}); // 06:00 → 17:00 inclusive

const timeToMins = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const Calendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [view, setView]                 = useState('يوم');
  const [showForm, setShowForm]         = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [form, setForm]                 = useState({ clientName: '', agentName: 'فهد العتيبي', appointmentType: 'زيارة ميدانية', date: TODAY, startTime: '09:00', duration: 60, note: '' });
  const [saving, setSaving]             = useState(false);
  const [currentDate, setCurrentDate]   = useState(new Date());

  const DAYS_AR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const AGENTS  = ['فهد العتيبي', 'سلطان الغامدي'];
  const GRID_START = 360; // 06:00 in minutes
  const PX_PER_MIN = 1.2; // pixels per minute

  useEffect(() => {
    apiFetch('/admin/appointments').then(setAppointments).catch(() => setAppointments(MOCK_APPOINTMENTS));
  }, []);

  const dateStr = currentDate.toISOString().split('T')[0];
  const dayAppts = appointments.filter(a => a.appointmentDate === dateStr || !a.appointmentDate);

  const prevDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); };
  const nextDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); };

  const save = () => {
    if (!form.clientName || !form.date) return;
    setSaving(true);
    const newAppt = {
      id: Date.now(), agentName: form.agentName, appointmentType: form.appointmentType,
      appointmentDate: form.date, startTime: form.startTime, duration: Number(form.duration),
      status: 'قادمة', request: { clientName: form.clientName }, location: '', note: form.note
    };
    apiFetch('/admin/appointments', { method: 'POST', body: JSON.stringify(newAppt) })
      .then(d => { setAppointments(p => [...p, d]); setShowForm(false); setSaving(false); })
      .catch(() => { setAppointments(p => [...p, newAppt]); setShowForm(false); setSaving(false); });
  };

  const now = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const isToday = currentDate.toDateString() === now.toDateString();
  const nowTop = isToday ? Math.max(0, (nowMins - GRID_START) * PX_PER_MIN) : null;

  // ── Day view ────────────────────────────────────────────────────
  const DayView = () => (
    <div className="flex gap-4 flex-1 min-h-0">
      {/* Time grid */}
      <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm overflow-auto">
        <div className="flex border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="w-14 flex-shrink-0" />
          {AGENTS.map(agent => (
            <div key={agent} className="flex-1 px-3 py-2.5 text-center border-r border-gray-50 last:border-0">
              <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold mx-auto mb-1">{agent.charAt(0)}</div>
              <p className="text-[11px] font-semibold text-gray-700 truncate">{agent}</p>
            </div>
          ))}
        </div>
        <div className="flex" style={{ minHeight: `${(17 - 6) * 60 * PX_PER_MIN}px` }}>
          {/* Time labels */}
          <div className="w-14 flex-shrink-0 relative border-l border-gray-50">
            {HOURS.map((h, i) => (
              <div key={i} className="absolute w-full px-2 text-right"
                style={{ top: `${(h.totalMins - GRID_START) * PX_PER_MIN}px` }}>
                {h.label.endsWith(':00') ? (
                  <span className="text-[9px] font-medium text-gray-400">{h.label}</span>
                ) : (
                  <span className="text-[8px] text-gray-200">·</span>
                )}
              </div>
            ))}
          </div>
          {/* Horizontal hour lines */}
          <div className="flex-1 relative">
            {HOURS.filter(h => h.label.endsWith(':00')).map((h, i) => (
              <div key={i} className="absolute w-full border-t border-gray-100 pointer-events-none"
                style={{ top: `${(h.totalMins - GRID_START) * PX_PER_MIN}px` }} />
            ))}
            {HOURS.filter(h => h.label.endsWith(':30')).map((h, i) => (
              <div key={i} className="absolute w-full border-t border-dashed border-gray-50 pointer-events-none"
                style={{ top: `${(h.totalMins - GRID_START) * PX_PER_MIN}px` }} />
            ))}
            {/* Now line */}
            {nowTop !== null && (
              <div className="absolute w-full z-20 pointer-events-none flex items-center" style={{ top: `${nowTop}px` }}>
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                <div className="flex-1 border-t-2 border-red-400" />
              </div>
            )}
            {/* Agent columns with events */}
            <div className="flex h-full">
              {AGENTS.map(agent => {
                const agentAppts = dayAppts.filter(a => a.agentName === agent);
                return (
                  <div key={agent} className="flex-1 relative border-r border-gray-50 last:border-0">
                    {agentAppts.map(appt => {
                      const startMins = timeToMins(appt.startTime || '08:00');
                      const top = (startMins - GRID_START) * PX_PER_MIN;
                      const height = Math.max((appt.duration || 60) * PX_PER_MIN, 28);
                      const cfg = VISIT_COLORS[appt.status === 'مكتملة' ? 'مكتملة' : appt.appointmentType] || VISIT_COLORS['زيارة ميدانية'];
                      return (
                        <div key={appt.id} onClick={() => setSelectedAppt(appt)}
                          className="absolute left-1 right-1 rounded-md p-1.5 cursor-pointer hover:shadow-md transition-shadow overflow-hidden border"
                          style={{ top: `${top}px`, height: `${height}px`, backgroundColor: cfg.bg, borderColor: cfg.color + '40' }}>
                          <p className="text-[10px] font-bold leading-tight truncate" style={{ color: cfg.color }}>{appt.appointmentType}</p>
                          {height > 40 && <p className="text-[9px] text-gray-600 truncate">{appt.request?.clientName}</p>}
                          {height > 55 && <p className="text-[9px] text-gray-400">{appt.startTime}</p>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ملخص اليوم sidebar */}
      <aside className="w-60 flex-shrink-0 flex flex-col gap-3">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">ملخص اليوم</h3>
          <div className="space-y-2">
            {[
              { label: 'إجمالي الزيارات', val: dayAppts.length, color: 'text-gray-800' },
              { label: 'مكتملة', val: dayAppts.filter(a => a.status === 'مكتملة').length, color: 'text-gray-500' },
              { label: 'قادمة', val: dayAppts.filter(a => a.status === 'قادمة').length, color: 'text-blue-600' },
              { label: 'ملغاة', val: dayAppts.filter(a => a.status === 'ملغاة').length, color: 'text-red-500' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className={`text-sm font-bold ${s.color}`}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">الزيارات القادمة</h3>
          <div className="space-y-3">
            {dayAppts.filter(a => a.status === 'قادمة').sort((a, b) => a.startTime?.localeCompare(b.startTime)).map(appt => {
              const cfg = VISIT_COLORS[appt.appointmentType] || VISIT_COLORS['زيارة ميدانية'];
              return (
                <div key={appt.id} onClick={() => setSelectedAppt(appt)} className="cursor-pointer hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] font-bold mt-0.5" style={{ color: cfg.color }}>{appt.startTime}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{appt.request?.clientName}</p>
                      <p className="text-[10px] text-gray-400">{appt.appointmentType} · {appt.agentName?.split(' ')[0]}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {dayAppts.filter(a => a.status === 'قادمة').length === 0 && (
              <p className="text-xs text-gray-300 text-center py-4">لا توجد زيارات قادمة</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );

  // ── Week view ───────────────────────────────────────────────────
  const WeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart); d.setDate(d.getDate() + i); return d;
    });
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex-1">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {days.map((d, i) => {
            const ds = d.toISOString().split('T')[0];
            const count = appointments.filter(a => a.appointmentDate === ds).length;
            const isTdy = d.toDateString() === now.toDateString();
            return (
              <div key={i} onClick={() => { setCurrentDate(d); setView('يوم'); }}
                className={`p-3 text-center border-r border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors ${isTdy ? 'bg-blue-50' : ''}`}>
                <p className="text-[10px] text-gray-400 mb-1">{DAYS_AR[d.getDay()]}</p>
                <p className={`text-sm font-bold ${isTdy ? 'text-blue-600' : 'text-gray-800'}`}>{d.getDate()}</p>
                {count > 0 && (
                  <span className="mt-1 inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">{count}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-7 divide-x divide-gray-50" style={{ minHeight: '400px' }}>
          {days.map((d, i) => {
            const ds = d.toISOString().split('T')[0];
            const dayA = appointments.filter(a => a.appointmentDate === ds);
            return (
              <div key={i} className="p-2 space-y-1 overflow-hidden">
                {dayA.slice(0, 4).map(a => {
                  const cfg = VISIT_COLORS[a.appointmentType] || VISIT_COLORS['زيارة ميدانية'];
                  return (
                    <div key={a.id} onClick={() => setSelectedAppt(a)}
                      className="rounded px-1.5 py-1 cursor-pointer text-[9px] font-medium truncate border"
                      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.color + '30' }}>
                      {a.startTime} {a.request?.clientName}
                    </div>
                  );
                })}
                {dayA.length > 4 && <p className="text-[9px] text-gray-400 text-center">+{dayA.length - 4} أخرى</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Month view ──────────────────────────────────────────────────
  const MonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex-1">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS_AR.map(d => <div key={d} className="py-2 text-center text-[10px] font-semibold text-gray-400">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="border-b border-l border-gray-50 min-h-[80px]" />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const d = new Date(year, month, day);
            const ds = d.toISOString().split('T')[0];
            const dayA = appointments.filter(a => a.appointmentDate === ds);
            const isTdy = d.toDateString() === now.toDateString();
            const load = dayA.length;
            const loadColor = load >= 5 ? 'bg-red-100 text-red-600' : load >= 3 ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600';
            return (
              <div key={day} onClick={() => { setCurrentDate(d); setView('يوم'); }}
                className={`border-b border-l border-gray-50 min-h-[80px] p-2 cursor-pointer hover:bg-gray-50 transition-colors ${isTdy ? 'bg-blue-50' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[11px] font-medium ${isTdy ? 'w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center' : 'text-gray-400'}`}>{day}</span>
                  {load > 0 && <span className={`text-[9px] px-1 rounded-full ${loadColor}`}>{load}</span>}
                </div>
                {dayA.slice(0, 2).map(a => {
                  const cfg = VISIT_COLORS[a.appointmentType] || VISIT_COLORS['زيارة ميدانية'];
                  return (
                    <div key={a.id} className="text-[8px] rounded px-1 py-0.5 mb-0.5 truncate"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}>{a.request?.clientName}</div>
                  );
                })}
                {dayA.length > 2 && <p className="text-[8px] text-gray-300">+{dayA.length - 2}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const dateLabel = currentDate.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={prevDay} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
          <h2 className="text-sm font-semibold text-gray-800">{dateLabel}</h2>
          <button onClick={nextDay} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {['يوم', 'أسبوع', 'شهر'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors">
            <span className="material-symbols-outlined text-sm">add</span>
            إضافة زيارة
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        {Object.entries(VISIT_COLORS).slice(0, 5).map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
            <span className="text-[10px] text-gray-500">{type}</span>
          </div>
        ))}
      </div>

      {/* View content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {view === 'يوم'   && <DayView />}
        {view === 'أسبوع' && <WeekView />}
        {view === 'شهر'   && <MonthView />}
      </div>

      {/* Appointment detail popup */}
      <AnimatePresence>
        {selectedAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setSelectedAppt(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              {(() => {
                const cfg = VISIT_COLORS[selectedAppt.appointmentType] || VISIT_COLORS['زيارة ميدانية'];
                return (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{selectedAppt.appointmentType}</span>
                        <p className="text-xs font-mono text-gray-400 mt-1">{selectedAppt.request?.confirmationNumber}</p>
                      </div>
                      <button onClick={() => setSelectedAppt(null)} className="text-gray-400 hover:text-gray-700">
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {[
                        ['العميل', selectedAppt.request?.clientName],
                        ['الموعد', `${selectedAppt.appointmentDate} — ${selectedAppt.startTime}`],
                        ['المدة', `${selectedAppt.duration} دقيقة`],
                        ['الفني', selectedAppt.agentName],
                        ['الموقع', selectedAppt.location],
                        ['ملاحظات', selectedAppt.note],
                      ].filter(([, v]) => v).map(([k, v]) => (
                        <div key={k} className="flex items-start gap-2">
                          <span className="text-[10px] text-gray-400 w-16 flex-shrink-0 pt-0.5">{k}</span>
                          <span className="text-xs text-gray-700 flex-1">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-5">
                      <button className="flex-1 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-600 hover:text-white transition-colors">تأكيد الإنجاز</button>
                      <button className="flex-1 py-2 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-500 hover:text-white transition-colors">تأجيل</button>
                      <button className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-500 hover:text-white transition-colors">إلغاء</button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add appointment form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-4">إضافة زيارة جديدة</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">نوع الزيارة *</label>
                <select value={form.appointmentType} onChange={e => setForm(p => ({ ...p, appointmentType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors">
                  {Object.keys(VISIT_COLORS).slice(0, 5).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">اسم العميل / رقم الطلب *</label>
                <input type="text" placeholder="محمد العمراني أو ATL-2026-..." value={form.clientName}
                  onChange={e => setForm(p => ({ ...p, clientName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">التاريخ *</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">وقت البداية *</label>
                  <input type="time" value={form.startTime} min="06:00" max="17:00"
                    onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">المدة (دقيقة) *</label>
                  <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors">
                    {[30, 60, 90, 120, 150, 180, 240].map(d => <option key={d} value={d}>{d} د</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">الفني *</label>
                  <select value={form.agentName} onChange={e => setForm(p => ({ ...p, agentName: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors">
                    {AGENTS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">ملاحظات للفني</label>
                <input type="text" placeholder="ملاحظة اختيارية..." value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={save} disabled={saving || !form.clientName}
                className="flex-1 py-2.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black disabled:opacity-50 transition-colors">
                {saving ? 'حفظ...' : 'حفظ الموعد'}
              </button>
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── MODULE 2: العملاء ─────────────────────────────────────────────
const LOYALTY_LEVELS = [
  { min: 0, max: 0, label: 'جديد',     color: '#6b7280', discount: '—',   icon: '🆕' },
  { min: 1, max: 1, label: 'برونزي',   color: '#92400e', discount: '—',   icon: '🥉' },
  { min: 2, max: 2, label: 'فضي',      color: '#475569', discount: '5%',  icon: '🥈' },
  { min: 3, max: 3, label: 'ذهبي',     color: '#b45309', discount: '10%', icon: '🥇' },
  { min: 4, max: 99, label: 'بلاتيني', color: '#1c1b1b', discount: '15%', icon: '💎' },
];
const loyaltyOf = (n) => LOYALTY_LEVELS.find(l => n >= l.min && n <= l.max) || LOYALTY_LEVELS[0];

const Clients = () => {
  const [requests, setRequests]       = useState([]);
  const [search, setSearch]           = useState('');
  const [loyaltyFilter, setLoyaltyFilter] = useState('الكل');
  const [selectedKey, setSelectedKey] = useState(null);
  const [activeTab, setActiveTab]     = useState('معلومات شخصية');
  const [noteText, setNoteText]       = useState('');
  const [notes, setNotes]             = useState([]);

  useEffect(() => {
    apiFetch('/admin/requests').then(setRequests).catch(() => setRequests(MOCK_REQUESTS));
  }, []);

  const clientMap = requests.reduce((acc, r) => {
    const k = r.phone || r.clientName;
    if (!acc[k]) acc[k] = { name: r.clientName, phone: r.phone, orders: [], joinDate: r.requestDate };
    acc[k].orders.push(r);
    return acc;
  }, {});

  const clients = Object.values(clientMap).filter(c => {
    const completedOrders = c.orders.filter(o => normalizeStatus(o.status) === 'installed').length;
    const loy = loyaltyOf(completedOrders);
    const matchSearch = !search || c.name?.includes(search) || c.phone?.includes(search);
    const matchLoyalty = loyaltyFilter === 'الكل' || loy.label === loyaltyFilter;
    return matchSearch && matchLoyalty;
  });

  const sel = selectedKey ? clientMap[selectedKey] : null;
  const selCompleted = sel ? sel.orders.filter(o => normalizeStatus(o.status) === 'installed').length : 0;
  const selLoyalty = sel ? loyaltyOf(selCompleted) : null;
  const selRevenue = sel ? sel.orders.reduce((s, o) => s + (Number(o.estimatedPrice) || 0), 0) : 0;
  const selAppts = sel ? MOCK_APPOINTMENTS.filter(a => a.request?.clientName === sel.name) : [];

  const TABS = ['معلومات شخصية', 'الطلبات', 'الموقع', 'الولاء', 'المواعيد', 'الملاحظات'];

  const saveNote = () => {
    if (!noteText.trim()) return;
    setNotes(prev => [{ text: noteText, date: new Date().toLocaleString('ar-SA'), admin: 'Admin' }, ...prev]);
    setNoteText('');
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">العملاء</h2>
        <span className="text-xs text-gray-400">{clients.length} عميل</span>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-[18px]">search</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الجوال..."
            className="w-full bg-white border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['الكل', ...LOYALTY_LEVELS.map(l => l.label)].map(f => (
            <button key={f} onClick={() => setLoyaltyFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${loyaltyFilter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Client list */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-xl shadow-sm overflow-y-auto">
          <div className="divide-y divide-gray-50">
            {clients.map((c, i) => {
              const completed = c.orders.filter(o => normalizeStatus(o.status) === 'installed').length;
              const loy = loyaltyOf(completed);
              const key = c.phone || c.name;
              const isSelected = selectedKey === key;
              return (
                <div key={i} onClick={() => { setSelectedKey(key); setActiveTab('معلومات شخصية'); }}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-gray-50 border-r-2 border-gray-900' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {c.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.orders.length} طلب · {c.phone}</p>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ color: loy.color, background: `${loy.color}15` }}>{loy.label}</span>
                </div>
              );
            })}
            {clients.length === 0 && <p className="text-xs text-gray-300 text-center py-10">لا يوجد عملاء</p>}
          </div>
        </div>

        {/* Client detail with tabs */}
        <div className="lg:col-span-3">
          {sel ? (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm h-full flex flex-col overflow-hidden">
              {/* Client header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                  style={{ backgroundColor: selLoyalty?.color || '#1c1b1b' }}>
                  {sel.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-gray-900">{sel.name}</h3>
                  <p className="text-sm text-gray-400">{sel.phone}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full border"
                    style={{ color: selLoyalty?.color, borderColor: `${selLoyalty?.color}40`, background: `${selLoyalty?.color}10` }}>
                    {selLoyalty?.icon} {selLoyalty?.label}
                  </span>
                  <a href={`tel:${sel.phone}`} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center transition-colors" title="اتصال">
                    <span className="material-symbols-outlined text-[16px]">call</span>
                  </a>
                  <a href={`https://wa.me/966${sel.phone?.replace(/^0/, '')}`} target="_blank" rel="noreferrer"
                    className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center transition-colors" title="واتساب">
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                  </a>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-100 overflow-x-auto">
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-6">

                {/* Tab: معلومات شخصية */}
                {activeTab === 'معلومات شخصية' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        ['الاسم الكامل', sel.name],
                        ['رقم الجوال', sel.phone],
                        ['إجمالي الطلبات', sel.orders.length],
                        ['الطلبات المنجزة', selCompleted],
                        ['إجمالي الإنفاق', `${selRevenue.toLocaleString()} ر.س`],
                        ['تاريخ الانضمام', sel.joinDate ? new Date(sel.joinDate).toLocaleDateString('ar-SA') : '—'],
                        ['مستوى الولاء', selLoyalty?.label],
                        ['مصدر التواصل', 'واتساب بوت'],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-400 mb-1">{k}</p>
                          <p className="text-sm font-semibold text-gray-800">{v || '—'}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors">
                        <span className="material-symbols-outlined text-[14px]">block</span>
                        قائمة سوداء
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-100 transition-colors">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        تمييز كـ VIP
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab: الطلبات */}
                {activeTab === 'الطلبات' && (
                  <div className="space-y-3">
                    {sel.orders.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)).map(o => (
                      <div key={o.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs font-mono text-gray-400">{o.confirmationNumber || `#${o.id}`}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{o.requestDate ? new Date(o.requestDate).toLocaleDateString('ar-SA') : '—'}</p>
                          </div>
                          <StatusBadge status={o.status} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div><span className="text-gray-400 block">التصميم</span><span className="font-medium">{o.designType}</span></div>
                          <div><span className="text-gray-400 block">الحجم</span><span className="font-medium">{o.size}</span></div>
                          <div><span className="text-gray-400 block">اللون</span><span className="font-medium">{o.fabricColor}</span></div>
                          <div><span className="text-gray-400 block">التثبيت</span><span className="font-medium">{o.fixation}</span></div>
                          <div><span className="text-gray-400 block">السعر</span><span className="font-medium">{o.estimatedPrice ? `${Number(o.estimatedPrice).toLocaleString()} ر.س` : '—'}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab: الموقع */}
                {activeTab === 'الموقع' && (
                  <div className="space-y-4">
                    {sel.orders.filter(o => o.latitude && o.longitude).length > 0 ? (
                      sel.orders.filter(o => o.latitude && o.longitude).map(o => (
                        <div key={o.id} className="border border-gray-100 rounded-xl overflow-hidden">
                          <div className="p-3 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-mono text-gray-400">{o.confirmationNumber}</p>
                          </div>
                          <div className="h-48 bg-gray-100 flex items-center justify-center">
                            <iframe title="map"
                              src={`https://maps.google.com/maps?q=${o.latitude},${o.longitude}&z=15&output=embed`}
                              className="w-full h-full border-0" loading="lazy" />
                          </div>
                          <div className="p-3 flex items-center justify-between">
                            <p className="text-xs text-gray-500">Lat: {o.latitude} · Lng: {o.longitude}</p>
                            <a href={`https://maps.google.com/?q=${o.latitude},${o.longitude}`} target="_blank" rel="noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              فتح في خرائط جوجل
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-gray-300">
                        <span className="material-symbols-outlined text-4xl block mb-2">location_off</span>
                        <p className="text-sm">لا توجد بيانات موقع مسجلة</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: الولاء */}
                {activeTab === 'الولاء' && (
                  <div className="space-y-5">
                    <div className="bg-gray-50 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900">{selLoyalty?.icon} بطاقة الأطلسي — {selLoyalty?.label}</h4>
                        <span className="text-xs text-gray-400">خصم {selLoyalty?.discount}</span>
                      </div>
                      <div className="flex gap-1.5 mb-3">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`flex-1 h-2 rounded-full ${i <= selCompleted ? 'bg-gray-800' : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {selCompleted} طلب منجز من أصل 5
                        {selCompleted < 5 && ` — ${5 - selCompleted} طلب للوصول إلى المستوى التالي`}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">مستويات البرنامج</h4>
                      <div className="space-y-2">
                        {LOYALTY_LEVELS.map((l, i) => (
                          <div key={i} className={`flex items-center justify-between p-3 rounded-lg border ${selLoyalty?.label === l.label ? 'border-gray-300 bg-gray-50' : 'border-gray-100'}`}>
                            <div className="flex items-center gap-2">
                              <span>{l.icon}</span>
                              <span className="text-sm font-medium" style={{ color: l.color }}>{l.label}</span>
                            </div>
                            <span className="text-xs text-gray-400">خصم {l.discount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: المواعيد */}
                {activeTab === 'المواعيد' && (
                  <div className="space-y-3">
                    {selAppts.length === 0 ? (
                      <p className="text-sm text-gray-300 text-center py-10">لا توجد مواعيد مسجلة لهذا العميل</p>
                    ) : selAppts.map(a => {
                      const cfg = VISIT_COLORS[a.appointmentType] || VISIT_COLORS['زيارة ميدانية'];
                      return (
                        <div key={a.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: cfg.bg }}>{a.appointmentType}</span>
                              <p className="text-xs text-gray-400 mt-1">{a.appointmentDate} — {a.startTime}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{a.status}</span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>الفني: {a.agentName}</p>
                            {a.location && <p>الموقع: {a.location}</p>}
                            {a.note && <p>ملاحظة: {a.note}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab: الملاحظات */}
                {activeTab === 'الملاحظات' && (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                      <p className="text-[10px] text-amber-700">ملاحظات إدارية سرية — غير مرئية للعميل</p>
                    </div>
                    {notes.map((n, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-700">{n.admin}</span>
                          <span className="text-[10px] text-gray-400">{n.date}</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
                      </div>
                    ))}
                    <div>
                      <textarea rows={3} value={noteText} onChange={e => setNoteText(e.target.value)}
                        placeholder="اكتب ملاحظة جديدة..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none transition-colors" />
                      <button onClick={saveNote}
                        className="mt-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors">
                        حفظ الملاحظة
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm h-full flex flex-col items-center justify-center text-center p-10">
              <span className="material-symbols-outlined text-4xl text-gray-200 mb-3">person_search</span>
              <p className="text-sm text-gray-400">اختر عميلاً من القائمة لعرض ملفه الكامل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page: Loyalty ─────────────────────────────────────────────────
const Loyalty = () => {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    apiFetch('/admin/requests').then(setRequests).catch(() => setRequests(MOCK_REQUESTS));
  }, []);
  const clientMap = requests.reduce((acc, r) => {
    const k = r.phone || r.clientName;
    if (!acc[k]) acc[k] = { name: r.clientName, phone: r.phone, orders: [] };
    acc[k].orders.push(r);
    return acc;
  }, {});
  const getLevel = (n) => LOYALTY_LEVELS.findLast(l => n >= l.min) || LOYALTY_LEVELS[0];
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">برنامج الولاء</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {LOYALTY_LEVELS.map((l, i) => {
          const count = Object.values(clientMap).filter(c => getLevel(c.orders.filter(o => normalizeStatus(o.status) === 'installed').length).label === l.label).length;
          return (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl mb-2">{l.icon}</div>
              <p className="text-sm font-semibold text-gray-800">{l.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">خصم {l.discount}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{count}</p>
            </div>
          );
        })}
      </div>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">قائمة البطاقات</h3>
        </div>
        <table className="w-full text-right">
          <thead className="bg-gray-50">
            <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              <th className="px-5 py-3">العميل</th>
              <th className="px-5 py-3">الجوال</th>
              <th className="px-5 py-3">الطلبات المنجزة</th>
              <th className="px-5 py-3">المستوى</th>
              <th className="px-5 py-3">الخصم التالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Object.values(clientMap).map((c, i) => {
              const done = c.orders.filter(o => normalizeStatus(o.status) === 'installed').length;
              const lv = getLevel(done);
              const next = LOYALTY_LEVELS.find(l => l.min > done);
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{c.phone}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{done}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: lv.color, background: `${lv.color}15` }}>{lv.label}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {next ? `${next.min - done} طلب لـ ${next.discount}` : 'أقصى مستوى ✓'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Page: Reports ─────────────────────────────────────────────────
const Reports = () => {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    apiFetch('/admin/requests').then(setRequests).catch(() => setRequests(MOCK_REQUESTS));
  }, []);
  const byStatus = Object.entries(requests.reduce((a, r) => { const k = normalizeStatus(r.status); a[k] = (a[k] || 0) + 1; return a; }, {}));
  const totalRevenue = requests.filter(r => normalizeStatus(r.status) === 'installed').reduce((s, r) => s + (Number(r.estimatedPrice) || 0), 0);
  const maxCount = Math.max(...byStatus.map(([, v]) => v), 1);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">التقارير</h2>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
          <span className="material-symbols-outlined text-sm">download</span>
          تصدير CSV
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات', value: requests.length },
          { label: 'طلبات مكتملة', value: requests.filter(r => normalizeStatus(r.status) === 'installed').length },
          { label: 'طلبات ملغاة', value: requests.filter(r => normalizeStatus(r.status) === 'cancelled').length },
          { label: 'إجمالي الإيرادات', value: `${totalRevenue.toLocaleString()} ر.س` },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-5">توزيع الطلبات حسب الحالة</h3>
        <div className="space-y-3">
          {byStatus.map(([k, count]) => {
            const cfg = STATUSES[k] || { label: k, color: '#6b7280' };
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={k} className="flex items-center gap-4">
                <span className="text-xs text-gray-600 w-28 text-left flex-shrink-0">{cfg.label}</span>
                <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden">
                  <div className="h-full rounded-full flex items-center pr-2 text-[9px] font-medium text-white transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: cfg.color, minWidth: count > 0 ? '2rem' : 0 }}>
                    {count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ── Page: Settings ────────────────────────────────────────────────
const Settings = () => {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900">الإعدادات</h2>
      {[
        { title: 'معلومات الشركة', fields: [{ label: 'الاسم التجاري', value: 'مظلات الأطلسي', type: 'text' }, { label: 'رقم واتساب', value: '966548105757', type: 'tel' }, { label: 'عنوان الورشة', value: 'الرياض، المملكة العربية السعودية', type: 'text' }] },
        { title: 'الضمان والتشغيل', fields: [{ label: 'مدة الضمان (أشهر)', value: '12', type: 'number' }, { label: 'وقت التصنيع (ساعة)', value: '48', type: 'number' }, { label: 'وقت التركيب (ساعة)', value: '24', type: 'number' }] },
        { title: 'الأمان', fields: [{ label: 'كلمة المرور الجديدة', value: '', type: 'password', ph: '••••••••' }, { label: 'تأكيد كلمة المرور', value: '', type: 'password', ph: '••••••••' }] }
      ].map((section, si) => (
        <div key={si} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">{section.title}</h3>
          <div className="space-y-4">
            {section.fields.map((f, fi) => (
              <div key={fi}>
                <label className="text-xs text-gray-500 mb-1.5 block">{f.label}</label>
                <input type={f.type} defaultValue={f.value} placeholder={f.ph || ''}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={save}
        className={`px-6 py-2.5 text-xs font-medium rounded-lg transition-colors ${saved ? 'bg-green-600 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}>
        {saved ? '✓ تم الحفظ' : 'حفظ الإعدادات'}
      </button>
    </div>
  );
};

// ── Login ──────────────────────────────────────────────────────────
const Login = ({ onSuccess }) => {
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pass }) })
      .then(r => r.json())
      .then(d => { d.success ? onSuccess() : setError(d.message || 'بيانات غير صحيحة'); })
      .catch(() => setError('تعذر الاتصال بالخادم'))
      .finally(() => setLoading(false));
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
        <div className="text-center mb-8">
          <img src="/image/logo/72673ecd-fec0-44e8-ab40-c520e10e98a7-removebg-preview.png" alt="" className="w-12 h-12 mx-auto mb-4 object-contain" />
          <h2 className="text-xl font-bold text-gray-900">تسجيل الدخول</h2>
          <p className="text-xs text-gray-400 mt-1">لوحة إدارة مظلات الأطلسي</p>
        </div>
        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg px-4 py-3 mb-5 text-center">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@atlasi.sa"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">كلمة المرور</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} required placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-50 transition-colors mt-2">
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Root ───────────────────────────────────────────────────────────
export default function AdminApp() {
  const [auth, setAuth] = useState(false);
  if (!auth) return <Login onSuccess={() => setAuth(true)} />;
  return (
    <AdminLayout onLogout={() => setAuth(false)}>
      <Routes>
        <Route path="/"          element={<Overview />} />
        <Route path="/requests"  element={<Requests />} />
        <Route path="/pipeline"  element={<Pipeline />} />
        <Route path="/calendar"  element={<Calendar />} />
        <Route path="/clients"   element={<Clients />} />
        <Route path="/loyalty"   element={<Loyalty />} />
        <Route path="/reports"   element={<Reports />} />
        <Route path="/settings"  element={<Settings />} />
        <Route path="*"          element={<div className="text-gray-300 text-center py-20 text-sm">الصفحة غير موجودة</div>} />
      </Routes>
    </AdminLayout>
  );
}
