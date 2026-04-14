import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const API = 'http://localhost:8080/api';
const APP_LOCALE = 'ar-SA-u-nu-latn';

const WESTERN_DIGITS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
const toWesternDigits = (value) => String(value ?? '').replace(/[٠-٩]/g, d => WESTERN_DIGITS[d] || d);
const formatNumber = (value) => toWesternDigits(new Intl.NumberFormat(APP_LOCALE).format(Number(value) || 0));
const formatCurrency = (value) => `${formatNumber(value)} ر.س`;
const formatDate = (value, opts) => (value ? toWesternDigits(new Date(value).toLocaleDateString(APP_LOCALE, opts)) : '—');
const formatDateTime = (value) => (value ? toWesternDigits(new Date(value).toLocaleString(APP_LOCALE)) : '—');

const useDebouncedValue = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
};

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

const normalizeDesignType = (raw) => {
  const s = String(raw || '').toLowerCase();
  if (s.includes('malaki') || s.includes('ملكي') || s.includes('royal')) return 'Malaki (Royal)';
  if (s.includes('neom') || s.includes('نيوم')) return 'Neom';
  if (s.includes('sahara') || s.includes('sahra') || s.includes('صحراء')) return 'Sahara';
  return raw || 'غير محدد';
};

const normalizeSizeInfo = (raw) => {
  const s = String(raw || '').toLowerCase();
  if (s.includes('single') || s.includes('small') || s.includes('صغير') || s.includes('واحدة')) return 'Single';
  if (s.includes('double') || s.includes('big') || s.includes('كبير') || s.includes('سيارتين')) return 'Double';
  return raw || 'غير محدد';
};

const normalizeFixationType = (raw) => {
  const s = String(raw || '').toLowerCase();
  if (s.includes('wall') || s.includes('mural') || s.includes('معلق')) return 'Wall';
  if (s.includes('column') || s.includes('colonne') || s.includes('أعمدة')) return 'Column';
  return raw || 'غير محدد';
};

const normalizeColorName = (raw) => {
  const s = String(raw || '').toLowerCase();
  if (s.includes('noir') || s.includes('black') || s.includes('أسود')) return 'Black';
  if (s.includes('beige') || s.includes('بيج')) return 'Beige';
  return raw || 'غير محدد';
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
  { id: 9, clientName: 'El Bettaieb',      phone: '0553342211', confirmationNumber: 'ATL-2026-0050', designType: 'Malaki (Royal)', size: 'كبير', fixation: 'أعمدة', fabricColor: 'Black', status: 'confirmed', estimatedPrice: 2799, requestDate: new Date('2026-04-10T09:00:00').toISOString() },
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
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadAnalytics = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiFetch('/admin/requests').catch(() => MOCK_REQUESTS),
      apiFetch('/admin/appointments').catch(() => MOCK_APPOINTMENTS),
    ]).then(([reqData, apptData]) => {
      setRequests(Array.isArray(reqData) ? reqData : MOCK_REQUESTS);
      setAppointments(Array.isArray(apptData) ? apptData : MOCK_APPOINTMENTS);
      setLastUpdated(new Date());
      setLoading(false);
    }).catch(() => {
      setRequests(MOCK_REQUESTS);
      setAppointments(MOCK_APPOINTMENTS);
      setLastUpdated(new Date());
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const todayStr = formatDate(new Date());
  const todayRequests  = requests.filter(r => formatDate(r.requestDate) === todayStr);
  const pendingCount   = requests.filter(r => ['new', 'pending'].includes(normalizeStatus(r.status))).length;
  const clientSet      = new Set(requests.map(r => r.phone || r.clientName));
  const monthRevenue   = requests.filter(r => normalizeStatus(r.status) === 'installed')
    .reduce((s, r) => s + (Number(r.estimatedPrice) || 0), 0);
  const bookedAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'مكتملة').length;

  const kpis = [
    { label: 'إجمالي الطلبات', value: formatNumber(requests.length), icon: 'shopping_bag', alert: false },
    { label: 'طلبات اليوم', value: formatNumber(todayRequests.length), icon: 'today', alert: false },
    { label: 'الطلبات المعلقة', value: formatNumber(pendingCount), icon: 'pending_actions', alert: pendingCount > 5 },
    { label: 'إجمالي العملاء', value: formatNumber(clientSet.size), icon: 'groups', alert: false },
    { label: 'إيرادات المبيعات', value: formatCurrency(monthRevenue), icon: 'payments', alert: false },
    { label: 'المواعيد المحجوزة', value: formatNumber(bookedAppointments), icon: 'event_available', alert: false },
    { label: 'الزيارات المكتملة', value: formatNumber(completedAppointments), icon: 'task_alt', alert: false },
  ];

  const statusData = useMemo(() => Object.entries(
    requests.reduce((acc, r) => {
      const k = normalizeStatus(r.status);
      const label = STATUSES[k]?.label || k;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })), [requests]);

  const appointmentTypeData = useMemo(() => Object.entries(
    appointments.reduce((acc, a) => {
      const key = a.appointmentType || 'غير محدد';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, count]) => ({ name, count })), [appointments]);

  const colorStats = useMemo(() => Object.entries(
    requests.reduce((acc, r) => {
      const key = normalizeColorName(r.fabricColor);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([color, count]) => ({ color, count })), [requests]);

  const designStats = useMemo(() => Object.entries(
    requests.reduce((acc, r) => {
      const key = normalizeDesignType(r.designType);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, count]) => ({ label, count })), [requests]);

  const sizeStats = useMemo(() => Object.entries(
    requests.reduce((acc, r) => {
      const key = normalizeSizeInfo(r.sizeInfo || r.size);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, count]) => ({ label, count })), [requests]);

  const fixationStats = useMemo(() => Object.entries(
    requests.reduce((acc, r) => {
      const key = normalizeFixationType(r.fixationType || r.fixation);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, count]) => ({ label, count })), [requests]);

  const salesLineData = useMemo(() => {
    const days = 7;
    const result = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const sales = requests
        .filter(r => (r.requestDate || '').startsWith(key) && normalizeStatus(r.status) === 'installed')
        .reduce((sum, r) => sum + (Number(r.estimatedPrice) || 0), 0);
      const appts = appointments.filter(a => (a.appointmentDate || '').startsWith(key)).length;
      result.push({ day: formatDate(d), sales, appointments: appts });
    }
    return result;
  }, [requests, appointments]);

  const PIE_COLORS = ['#111827', '#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#6b7280'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">لوحة التحليلات</h2>
          <p className="text-sm text-gray-500 mt-0.5">آخر تحديث: {formatDateTime(lastUpdated)}</p>
        </div>
        <button onClick={loadAnalytics} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors">
          <span className="material-symbols-outlined text-sm">refresh</span>
          تحديث الإحصائيات
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-3">
        {kpis.map((k, i) => (
          <div key={i} className={`bg-white border rounded-xl p-4 shadow-sm relative ${k.alert ? 'border-red-200' : 'border-gray-100'}`}>
            {k.alert && (
              <span className="absolute top-2 left-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold">!</span>
            )}
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 mb-3">
              <span className="material-symbols-outlined text-gray-500 text-[16px]">{k.icon}</span>
            </div>
            <p className="text-xl font-bold text-gray-900 leading-none">{loading ? '—' : k.value}</p>
            <p className="text-[10px] text-gray-400 mt-1 leading-tight">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Histogram - حجم المواعيد حسب النوع</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentTypeData} margin={{ top: 12, right: 16, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" tick={{ fill: '#374151', fontSize: 10 }} />
                <YAxis tick={{ fill: '#374151', fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(val) => [formatNumber(val), 'عدد المواعيد']} />
                <Bar dataKey="count" fill="#111827" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pie - توزيع الطلبات حسب الحالة</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={110} paddingAngle={2}>
                  {statusData.map((entry, idx) => (
                    <Cell key={entry.name} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [formatNumber(val), 'عدد الطلبات']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Line - اتجاه المبيعات والمواعيد (آخر 7 أيام)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesLineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fill: '#374151', fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fill: '#374151', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#374151', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  formatter={(val, key) => key === 'sales' ? [formatCurrency(val), 'Sales'] : [formatNumber(val), 'Appointments']}
                  labelFormatter={() => ''}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#111827" strokeWidth={3} dot={{ r: 3 }} name="Sales (المبيعات)" />
                <Line yAxisId="right" type="monotone" dataKey="appointments" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} name="Appointments (المواعيد)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-8 justify-center mt-2 text-xs">
            <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-gray-900"></div><span>Ventes</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-blue-500"></div><span>Rendez-vous</span></div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">إحصائيات الألوان (Colors Breakdown)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-[11px] font-semibold text-gray-600">
                  <th className="px-4 py-2">اللون</th>
                  <th className="px-4 py-2">عدد الطلبات</th>
                  <th className="px-4 py-2">النسبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {colorStats.map((row, idx) => {
                  const pct = requests.length ? Math.round((row.count / requests.length) * 100) : 0;
                  return (
                    <tr key={row.color} className={idx % 2 ? 'bg-gray-50/60' : ''}>
                      <td className="px-4 py-2 text-sm font-medium text-gray-800">{row.color}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{formatNumber(row.count)}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{formatNumber(pct)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!colorStats.length && <p className="text-sm text-gray-300 text-center py-6">لا توجد بيانات ألوان</p>}
          </div>
        </div>

        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">إحصائيات بيانات العميل من الـ Wizard</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Design Type</p>
              <div className="space-y-2">
                {designStats.map((row) => {
                  const pct = requests.length ? Math.round((row.count / requests.length) * 100) : 0;
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-gray-700">{row.label}</span>
                        <span className="text-gray-500">{formatNumber(row.count)} · {formatNumber(pct)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-900" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Size</p>
              <div className="space-y-2">
                {sizeStats.map((row) => {
                  const pct = requests.length ? Math.round((row.count / requests.length) * 100) : 0;
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-gray-700">{row.label}</span>
                        <span className="text-gray-500">{formatNumber(row.count)} · {formatNumber(pct)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Fixation</p>
              <div className="space-y-2">
                {fixationStats.map((row) => {
                  const pct = requests.length ? Math.round((row.count / requests.length) * 100) : 0;
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-gray-700">{row.label}</span>
                        <span className="text-gray-500">{formatNumber(row.count)} · {formatNumber(pct)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-600" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">ملخص العمليات</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg bg-gray-900 text-white p-4">
              <p className="text-xs text-gray-300">الطلبات المؤكدة</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(requests.filter(r => normalizeStatus(r.status) === 'confirmed').length)}</p>
            </div>
            <div className="rounded-lg bg-blue-600 text-white p-4">
              <p className="text-xs text-blue-100">زيارات اليوم</p>
              <p className="text-2xl font-bold mt-1">{formatNumber(appointments.filter(a => a.appointmentDate === new Date().toISOString().split('T')[0]).length)}</p>
            </div>
            <div className="rounded-lg bg-emerald-600 text-white p-4">
              <p className="text-xs text-emerald-100">معدل الإنجاز</p>
              <p className="text-2xl font-bold mt-1">
                {formatNumber(bookedAppointments ? Math.round((completedAppointments / bookedAppointments) * 100) : 0)}%
              </p>
            </div>
          </div>
          {pendingCount > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              يوجد {formatNumber(pendingCount)} طلبات قيد الانتظار وتحتاج متابعة.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page: Requests ────────────────────────────────────────────────
const Requests = () => {
  const navigate = useNavigate();
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

  const openVisitForm = (request) => {
    const draft = {
      clientName: request.clientName || request.customerName || '',
      clientPhone: request.phone || request.clientPhone || request.customerPhone || '',
      confirmationNumber: request.confirmationNumber || '',
      requestId: request.id || null,
    };
    localStorage.setItem('atlasi_pending_visit', JSON.stringify(draft));
    navigate('/admin/calendar');
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
                <td className="px-5 py-3 text-xs text-gray-400">{r.phone || r.clientPhone || r.customerPhone || '—'}</td>
                <td className="px-5 py-3">
                  <span className="text-xs text-gray-600">{r.designType}</span>
                  <span className="text-xs text-gray-300 mx-1">·</span>
                  <span className="text-xs text-gray-400">{r.fabricColor}</span>
                </td>
                <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3 text-xs text-gray-400">
                  {formatDate(r.requestDate)}
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
                    <button
                      onClick={() => openVisitForm(r)}
                      title="إضافة زيارة"
                      className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">event_available</span>
                    </button>
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
                  ['السعر', selected.estimatedPrice ? formatCurrency(selected.estimatedPrice) : '—'],
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
  const [requests, setRequests]         = useState([]);
  const [view, setView]                 = useState('يوم');
  const [showForm, setShowForm]         = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [form, setForm]                 = useState({ clientName: '', clientPhone: '', agentName: 'سلطان الغامدي', appointmentType: 'زيارة ميدانية', date: TODAY, startTime: '09:00', duration: 60, note: '' });
  const [clientSearch, setClientSearch] = useState('');
  const [saving, setSaving]             = useState(false);
  const [currentDate, setCurrentDate]   = useState(new Date());
  const debouncedClientSearch           = useDebouncedValue(clientSearch, 350);

  const DAYS_AR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const AGENTS  = ['سلطان الغامدي'];
  const GRID_START = 360; // 06:00 in minutes
  const PX_PER_MIN = 1.2; // pixels per minute

  useEffect(() => {
    Promise.all([
      apiFetch('/admin/appointments').catch(() => MOCK_APPOINTMENTS),
      apiFetch('/admin/requests').catch(() => MOCK_REQUESTS),
    ]).then(([apptData, reqData]) => {
      setAppointments(Array.isArray(apptData) ? apptData : MOCK_APPOINTMENTS);
      setRequests(Array.isArray(reqData) ? reqData : MOCK_REQUESTS);
    });
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('atlasi_pending_visit');
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      setShowForm(true);
      setClientSearch(`${draft.clientName || ''}${draft.clientPhone ? ` - ${draft.clientPhone}` : ''}`.trim());
      setForm((p) => ({
        ...p,
        clientName: draft.clientName || '',
        clientPhone: draft.clientPhone || '',
        note: draft.confirmationNumber ? `طلب: ${draft.confirmationNumber}` : p.note,
      }));
    } catch (_) {
      // ignore malformed draft
    } finally {
      localStorage.removeItem('atlasi_pending_visit');
    }
  }, []);

  const clientDirectory = useMemo(() => {
    const map = new Map();
    requests.forEach((r) => {
      const name = r.clientName || r.customerName || '';
      const phone = r.phone || r.clientPhone || r.customerPhone || '';
      const key = phone || name;
      if (!map.has(key)) {
        map.set(key, {
          name,
          phone,
          confirmationNumber: r.confirmationNumber || '',
          latestType: r.designType || r.design || '',
        });
      }
    });
    return Array.from(map.values());
  }, [requests]);

  const matchingClients = useMemo(() => {
    const q = debouncedClientSearch.trim().toLowerCase();
    if (!q) return clientDirectory.slice(0, 12);
    return clientDirectory
      .filter(c => c.name?.toLowerCase().includes(q) || c.phone?.includes(q))
      .slice(0, 30);
  }, [clientDirectory, debouncedClientSearch]);

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
      status: 'قادمة', request: { clientName: form.clientName, phone: form.clientPhone }, location: '', note: form.note
    };
    apiFetch('/admin/appointments', { method: 'POST', body: JSON.stringify(newAppt) })
      .then(d => {
        setAppointments(p => [...p, d]);
        setShowForm(false);
        setClientSearch('');
        setForm({ clientName: '', clientPhone: '', agentName: 'سلطان الغامدي', appointmentType: 'زيارة ميدانية', date: TODAY, startTime: '09:00', duration: 60, note: '' });
        setSaving(false);
      })
      .catch(() => {
        setAppointments(p => [...p, newAppt]);
        setShowForm(false);
        setClientSearch('');
        setForm({ clientName: '', clientPhone: '', agentName: 'سلطان الغامدي', appointmentType: 'زيارة ميدانية', date: TODAY, startTime: '09:00', duration: 60, note: '' });
        setSaving(false);
      });
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
                <p className={`text-sm font-bold ${isTdy ? 'text-blue-600' : 'text-gray-800'}`}>{formatNumber(d.getDate())}</p>
                {count > 0 && (
                  <span className="mt-1 inline-block text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">{formatNumber(count)}</span>
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
                {dayA.length > 4 && <p className="text-[9px] text-gray-400 text-center">+{formatNumber(dayA.length - 4)} أخرى</p>}
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
                  <span className={`text-[11px] font-medium ${isTdy ? 'w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center' : 'text-gray-400'}`}>{formatNumber(day)}</span>
                  {load > 0 && <span className={`text-[9px] px-1 rounded-full ${loadColor}`}>{formatNumber(load)}</span>}
                </div>
                {dayA.slice(0, 2).map(a => {
                  const cfg = VISIT_COLORS[a.appointmentType] || VISIT_COLORS['زيارة ميدانية'];
                  return (
                    <div key={a.id} className="text-[8px] rounded px-1 py-0.5 mb-0.5 truncate"
                      style={{ backgroundColor: cfg.bg, color: cfg.color }}>{a.request?.clientName}</div>
                  );
                })}
                {dayA.length > 2 && <p className="text-[8px] text-gray-300">+{formatNumber(dayA.length - 2)}</p>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const dateLabel = formatDate(currentDate, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

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
                <label className="text-xs text-gray-500 mb-1 block">البحث عن العميل (الاسم أو الجوال) *</label>
                <input type="text" placeholder="ابحث باسم العميل أو رقم الهاتف" value={clientSearch}
                  onChange={e => {
                    const value = e.target.value;
                    setClientSearch(value);
                    setForm(p => ({ ...p, clientName: value, clientPhone: '' }));
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
                <div className="mt-2 max-h-36 overflow-y-auto border border-gray-100 rounded-lg">
                  {matchingClients.length === 0 ? (
                    <p className="text-[11px] text-gray-300 px-3 py-2">لا توجد نتائج مطابقة</p>
                  ) : matchingClients.map((c, idx) => (
                    <button
                      key={`${c.phone || c.name}-${idx}`}
                      type="button"
                      onClick={() => {
                        setClientSearch(`${c.name} - ${c.phone}`);
                        setForm(p => ({ ...p, clientName: c.name, clientPhone: c.phone }));
                      }}
                      className="w-full text-right px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                    >
                      <p className="text-xs font-medium text-gray-800">{c.name}</p>
                      <p className="text-[10px] text-gray-400">{c.phone} {c.confirmationNumber ? `• ${c.confirmationNumber}` : ''}</p>
                    </button>
                  ))}
                </div>
                {form.clientPhone && <p className="text-[10px] text-blue-600 mt-1">تم اختيار العميل: {form.clientPhone}</p>}
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

      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-gray-900 text-white shadow-xl hover:bg-black transition-colors flex items-center justify-center"
        title="إضافة موعد"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
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
  const [showVisitMenu, setShowVisitMenu] = useState(false);

  useEffect(() => {
    apiFetch('/admin/requests').then(setRequests).catch(() => setRequests(MOCK_REQUESTS));
  }, []);

  const clientMap = requests.reduce((acc, r) => {
    const name = r.clientName || r.customerName || '—';
    const phone = r.phone || r.clientPhone || r.customerPhone || '';
    const k = phone || name;
    if (!acc[k]) acc[k] = { name, phone, orders: [], joinDate: r.requestDate };
    if (!acc[k].phone && phone) acc[k].phone = phone;
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
  const selLastOrder = sel ? [...sel.orders].sort((a, b) => new Date(b.requestDate || 0) - new Date(a.requestDate || 0))[0] : null;
  const selWizardData = selLastOrder ? {
    design: normalizeDesignType(selLastOrder.designType || selLastOrder.design),
    size: normalizeSizeInfo(selLastOrder.sizeInfo || selLastOrder.size),
    fixation: normalizeFixationType(selLastOrder.fixationType || selLastOrder.fixation),
    color: normalizeColorName(selLastOrder.fabricColor || selLastOrder.color),
    address: selLastOrder.address || '—',
    requestNo: selLastOrder.confirmationNumber || `#${selLastOrder.id}`,
  } : null;

  const TABS = ['معلومات شخصية', 'الطلبات', 'بيانات الطلب', 'الموقع', 'الولاء', 'المواعيد', 'الملاحظات'];

  const saveNote = () => {
    if (!noteText.trim()) return;
    setNotes(prev => [{ text: noteText, date: formatDateTime(new Date()), admin: 'Admin' }, ...prev]);
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
              const lastOrder = c.orders[c.orders.length - 1];
              return (
                <div key={i} onClick={() => { setSelectedKey(key); setActiveTab('معلومات شخصية'); }}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-gray-50 border-r-2 border-gray-900' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {c.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-400">{c.orders.length} طلب · {c.phone}</p>
                    {lastOrder?.confirmationNumber && <p className="text-[9px] text-blue-600 font-mono">{lastOrder.confirmationNumber}</p>}
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
                  <div className="relative">
                    <button onClick={() => setShowVisitMenu(!showVisitMenu)} className="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center justify-center transition-colors" title="إضافة زيارة">
                      <span className="material-symbols-outlined text-[16px]">event_available</span>
                    </button>
                    {showVisitMenu && (
                      <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-max">
                        <button onClick={() => { setActiveTab('المواعيد'); setShowVisitMenu(false); }} className="w-full text-right px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-xs font-medium text-gray-800 border-b border-gray-100 last:border-0">
                          <span className="material-symbols-outlined text-[14px]">add_event</span>
                          إضافة زيارة
                        </button>
                      </div>
                    )}
                  </div>
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
                        ['رقم الجوال', sel.phone || '—'],
                        ['إجمالي الطلبات', formatNumber(sel.orders.length)],
                        ['الطلبات المنجزة', formatNumber(selCompleted)],
                        ['إجمالي الإنفاق', formatCurrency(selRevenue)],
                        ['تاريخ الانضمام', formatDate(sel.joinDate)],
                        ['مستوى الولاء', selLoyalty?.label],
                        ['مصدر التواصل', 'واتساب بوت'],
                      ].map(([k, v]) => (
                        <div key={k} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-[10px] text-gray-400 mb-1">{k}</p>
                          <p className="text-sm font-semibold text-gray-800">{v || '—'}</p>
                        </div>
                      ))}
                    </div>
                    {selWizardData && (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-blue-800">آخر بيانات مسترجعة من الـ Wizard</p>
                          <span className="text-[10px] font-mono text-blue-600">{selWizardData.requestNo}</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {[
                            ['التصميم', selWizardData.design],
                            ['الحجم', selWizardData.size],
                            ['التثبيت', selWizardData.fixation],
                            ['اللون', selWizardData.color],
                            ['العنوان', selWizardData.address],
                          ].map(([k, v]) => (
                            <div key={k} className="bg-white border border-blue-100 rounded-lg p-2.5">
                              <p className="text-[10px] text-gray-400 mb-1">{k}</p>
                              <p className="text-xs font-semibold text-gray-800 truncate">{v || '—'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

                {/* Tab: بيانات الطلب */}
                {activeTab === 'بيانات الطلب' && (
                  <div className="space-y-4">
                    {sel.orders.length > 0 ? (
                      sel.orders.map(o => (
                        <div key={o.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5">
                          <div className="mb-4 pb-4 border-b border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-semibold text-gray-900">رقم الطلب: <span className="font-mono text-blue-600">{o.confirmationNumber || `#${o.id}`}</span></p>
                              <p className="text-xs text-gray-500">{formatDate(o.requestDate)}</p>
                            </div>
                            <StatusBadge status={o.status} />
                          </div>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-[10px] text-gray-500 mb-1">التصميم</p>
                                <p className="text-sm font-semibold text-gray-800">{normalizeDesignType(o.designType || o.design)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-[10px] text-gray-500 mb-1">الحجم</p>
                                <p className="text-sm font-semibold text-gray-800">{normalizeSizeInfo(o.sizeInfo || o.size)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-[10px] text-gray-500 mb-1">اللون</p>
                                <p className="text-sm font-semibold text-gray-800">{normalizeColorName(o.fabricColor || o.color)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-[10px] text-gray-500 mb-1">التثبيت</p>
                                <p className="text-sm font-semibold text-gray-800">{normalizeFixationType(o.fixationType || o.fixation)}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-[10px] text-gray-500 mb-1">السعر المتوقع</p>
                                <p className="text-sm font-semibold text-gray-800">{o.estimatedPrice ? formatCurrency(o.estimatedPrice) : '—'}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-[10px] text-gray-500 mb-1">العنوان</p>
                                <p className="text-xs font-medium text-gray-700 truncate">{o.address || '—'}</p>
                              </div>
                            </div>
                            {o.description && (
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-[10px] text-gray-500 mb-1">ملاحظات العميل</p>
                                <p className="text-sm text-gray-700">{o.description}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-8">لا توجد بيانات طلب</p>
                    )}
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
                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(o.requestDate)}</p>
                          </div>
                          <StatusBadge status={o.status} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div><span className="text-gray-400 block">التصميم</span><span className="font-medium">{o.designType}</span></div>
                          <div><span className="text-gray-400 block">الحجم</span><span className="font-medium">{o.size}</span></div>
                          <div><span className="text-gray-400 block">اللون</span><span className="font-medium">{o.fabricColor}</span></div>
                          <div><span className="text-gray-400 block">التثبيت</span><span className="font-medium">{o.fixation}</span></div>
                          <div><span className="text-gray-400 block">السعر</span><span className="font-medium">{o.estimatedPrice ? formatCurrency(o.estimatedPrice) : '—'}</span></div>
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
  const [selectedLevel, setSelectedLevel] = useState('الكل');
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
  const clientsRows = Object.values(clientMap).map((c) => {
    const done = c.orders.filter(o => normalizeStatus(o.status) === 'installed').length;
    const level = getLevel(done);
    const next = LOYALTY_LEVELS.find(l => l.min > done);
    return { ...c, done, level, next };
  });
  const filteredClients = selectedLevel === 'الكل'
    ? clientsRows
    : clientsRows.filter(c => c.level.label === selectedLevel);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">برنامج الولاء</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {LOYALTY_LEVELS.map((l, i) => {
          const count = clientsRows.filter(c => c.level.label === l.label).length;
          const isActive = selectedLevel === l.label;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedLevel(prev => prev === l.label ? 'الكل' : l.label)}
              className={`bg-white border rounded-xl p-4 shadow-sm text-center transition-all ${isActive ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-100 hover:border-gray-300'}`}
            >
              <div className="text-2xl mb-2">{l.icon}</div>
              <p className="text-sm font-semibold text-gray-800">{l.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">خصم {l.discount}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{formatNumber(count)}</p>
            </button>
          );
        })}
      </div>
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-gray-800">
              {selectedLevel === 'الكل' ? 'قائمة البطاقات' : `عملاء مستوى ${selectedLevel}`}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedLevel('الكل')}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              عرض الكل
            </button>
          </div>
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
            {filteredClients.map((c, i) => {
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{c.phone}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{formatNumber(c.done)}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: c.level.color, background: `${c.level.color}15` }}>{c.level.label}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {c.next ? `${formatNumber(c.next.min - c.done)} طلب لـ ${c.next.discount}` : 'أقصى مستوى ✓'}
                  </td>
                </tr>
              );
            })}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-sm text-gray-400 text-center">لا يوجد عملاء في هذا المستوى</td>
              </tr>
            )}
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
          { label: 'إجمالي الإيرادات', value: formatCurrency(totalRevenue) },
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
  const [admins, setAdmins] = useState([
    { id: 1, email: 'admin@atlasi.com', role: 'مشرف رئيسي', createdAt: new Date().toISOString() },
    { id: 2, email: 'manager@atlasi.com', role: 'مدير', createdAt: new Date().toISOString() }
  ]);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });
  const [saved, setSaved] = useState(false);

  const addAdmin = () => {
    if (!newAdmin.email || !newAdmin.password) return;
    setAdmins([...admins, { id: Date.now(), email: newAdmin.email, role: 'محرر', createdAt: new Date().toISOString() }]);
    setNewAdmin({ email: '', password: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const removeAdmin = (id) => {
    setAdmins(admins.filter(a => a.id !== id));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-gray-900">إدارة المشرفين</h2>

      {/* قائمة المشرفين */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              المشرفون الحاليون
            </h3>
            <div className="space-y-3">
              {admins.map(admin => (
                <div key={admin.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{admin.email}</p>
                    <p className="text-xs text-gray-500 mt-1">الدور: <span className="font-semibold text-gray-700">{admin.role}</span></p>
                    <p className="text-[10px] text-gray-400 mt-1">منذ: {formatDate(admin.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onClick={() => removeAdmin(admin.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
              {admins.length === 0 && <p className="text-sm text-gray-400 text-center py-6">لا يوجد مشرفون</p>}
            </div>
          </div>

      {/* إضافة مشرف جديد */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              إضافة مشرف جديد
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">عنوان البريد الإلكتروني *</label>
                <input type="email" placeholder="admin@example.com" value={newAdmin.email}
                  onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">كلمة المرور *</label>
                <input type="password" placeholder="••••••••" value={newAdmin.password}
                  onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
              </div>
              <button onClick={addAdmin}
                className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">add</span>
                إضافة المشرف
              </button>
            </div>
          </div>

      {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                تم حفظ التغييرات بنجاح
              </p>
            </div>
      )}
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
