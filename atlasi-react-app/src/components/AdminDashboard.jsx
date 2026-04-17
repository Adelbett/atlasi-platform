import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
  ReferenceLine,
} from 'recharts';

const API = '/api';
const APP_LOCALE = 'ar-SA-u-nu-latn';
const ADMIN_AUTH_KEY    = 'atlasi_admin_auth';
const ADMIN_AUTH_TS_KEY = 'atlasi_admin_auth_ts';
const ADMIN_ID_KEY      = 'atlasi_admin_id';
const ADMIN_ROLE_KEY    = 'atlasi_admin_role';
const ADMIN_NAME_KEY    = 'atlasi_admin_name';
const ADMIN_TITLE_KEY   = 'atlasi_admin_title';
const ADMIN_EMAIL_KEY   = 'atlasi_admin_email';
const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

const hasValidAdminSession = () => {
  if (localStorage.getItem(ADMIN_AUTH_KEY) !== '1') return false;
  const rawTs = localStorage.getItem(ADMIN_AUTH_TS_KEY);
  const ts = Number(rawTs || 0);
  if (!ts) return false;
  return Date.now() - ts <= ADMIN_SESSION_TTL_MS;
};

const getStoredUser = () => ({
  id:       localStorage.getItem(ADMIN_ID_KEY)    || '',
  role:     localStorage.getItem(ADMIN_ROLE_KEY)  || 'EDITOR',
  fullName: localStorage.getItem(ADMIN_NAME_KEY)  || '',
  title:    localStorage.getItem(ADMIN_TITLE_KEY) || '',
  email:    localStorage.getItem(ADMIN_EMAIL_KEY) || '',
});

const clearSession = () => {
  [ADMIN_AUTH_KEY, ADMIN_AUTH_TS_KEY, ADMIN_ID_KEY,
   ADMIN_ROLE_KEY, ADMIN_NAME_KEY, ADMIN_TITLE_KEY, ADMIN_EMAIL_KEY]
    .forEach(k => localStorage.removeItem(k));
};

// Context shared across all dashboard components
const UserContext = React.createContext(null);

const WESTERN_DIGITS = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
const toWesternDigits = (value) => String(value ?? '').replace(/[٠-٩]/g, d => WESTERN_DIGITS[d] || d);
const formatNumber = (value) => toWesternDigits(new Intl.NumberFormat(APP_LOCALE).format(Number(value) || 0));
const formatCurrency = (value) => `${formatNumber(value)} ر.س`;
const formatDate = (value, opts) => (value ? toWesternDigits(new Date(value).toLocaleDateString(APP_LOCALE, opts)) : '—');
const formatDateTime = (value) => (value ? toWesternDigits(new Date(value).toLocaleString(APP_LOCALE)) : '—');
const toLocalDateStr = (d) => {
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
};
const fromLocalDateStr = (value) => {
  const [y, m, d] = String(value || '').split('-').map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d, 12, 0, 0);
};
const dateOnly = (value) => String(value || '').split('T')[0];
const timeOnly = (value) => {
  if (!value) return '';
  const asText = String(value);
  if (/^\d{2}:\d{2}$/.test(asText)) return asText;
  const tPart = asText.split('T')[1];
  return tPart ? tPart.slice(0, 5) : '';
};
const normalizeAppointment = (a) => ({
  ...a,
  appointmentDate: dateOnly(a?.appointmentDate),
  startTime: a?.startTime || timeOnly(a?.appointmentDate) || '09:00',
  duration: Number(a?.duration) || 60,
  agentName: a?.agentName || 'سلطان الغامدي',
  status: a?.status || 'قادمة',
  note: a?.note ?? a?.notes ?? '',
});

const getRequestAddress = (order) => {
  const textAddress = order?.address || order?.location || '';
  if (textAddress && String(textAddress).trim()) return String(textAddress).trim();

  const mapUrl = order?.mapUrl || order?.mapURL || order?.mapsUrl || '';
  if (mapUrl && String(mapUrl).trim()) return String(mapUrl).trim();

  const lat = order?.latitude;
  const lng = order?.longitude;
  if (lat != null && lng != null && `${lat}` !== '' && `${lng}` !== '') {
    return `${lat}, ${lng}`;
  }

  return '—';
};

const getRequestEstimatedPrice = (order) => {
  const raw = order?.estimatedPrice ?? order?.estimated_price ?? order?.expectedPrice ?? order?.price;
  if (raw == null || String(raw).trim() === '') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeRequest = (request) => {
  const normalized = request || {};
  const clientName = normalized.clientName || normalized.customerName || '';
  const clientPhone = normalized.clientPhone || normalized.phone || normalized.customerPhone || '';
  const designType = normalized.designType || normalized.design || '';
  const sizeInfo = normalized.sizeInfo || normalized.size || '';
  const fixationType = normalized.fixationType || normalized.fixation || '';
  const fabricColor = normalized.fabricColor || normalized.color || '';
  const mapUrl = normalized.mapUrl || normalized.mapURL || normalized.mapsUrl || '';
  const latitude = normalized.latitude ?? normalized.lat ?? null;
  const longitude = normalized.longitude ?? normalized.lng ?? null;

  return {
    ...normalized,
    clientName,
    clientPhone,
    phone: clientPhone,
    designType,
    sizeInfo,
    size: normalized.size || sizeInfo,
    fixationType,
    fixation: normalized.fixation || fixationType,
    fabricColor,
    color: normalized.color || fabricColor,
    mapUrl,
    latitude,
    longitude,
    address: getRequestAddress({ ...normalized, mapUrl, latitude, longitude }),
    estimatedPrice: getRequestEstimatedPrice(normalized),
  };
};

const normalizeRequestList = (list) =>
  (Array.isArray(list) ? list : []).map(normalizeRequest);
const appointmentColorCfg = (appt) =>
  VISIT_COLORS[appt?.status] || VISIT_COLORS[appt?.appointmentType] || VISIT_COLORS['زيارة ميدانية'];

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

// ── Arabic display helpers ─────────────────────────────────────────
const toArabicDesign = (v) => {
  const s = String(v || '').toLowerCase();
  if (s.includes('malaki') || s.includes('ملكي') || s.includes('royal')) return 'ملكي';
  if (s.includes('neom') || s.includes('نيوم')) return 'نيوم';
  if (s.includes('sahara') || s.includes('sahra') || s.includes('صحراء')) return 'صحراء';
  return v || '—';
};
const toArabicSize = (v) => {
  const s = String(v || '').toLowerCase();
  if (s.includes('double') || s.includes('big') || s.includes('كبير') || s.includes('سيارتين')) return 'سيارتين (كبير)';
  if (s.includes('single') || s.includes('small') || s.includes('صغير') || s.includes('واحدة')) return 'سيارة واحدة (صغير)';
  return v || '—';
};
const toArabicFixation = (v) => {
  const s = String(v || '').toLowerCase();
  if (s.includes('wall') || s.includes('mural') || s.includes('معلق')) return 'معلق (جداري)';
  if (s.includes('column') || s.includes('colonne') || s.includes('أعمدة')) return 'أعمدة';
  return v || '—';
};
const toArabicColor = (v) => {
  const s = String(v || '').toLowerCase();
  if (s.includes('noir') || s.includes('black') || s.includes('أسود')) return 'أسود';
  if (s.includes('beige') || s.includes('بيج') || s.includes('or') || s.includes('ذهبي')) return 'ذهبي';
  return v || '—';
};

// ── Product catalog for analytics ─────────────────────────────────
const PRODUCT_CATALOG = {
  'ATL-1S':   { design: 'صحراء', size: 'Single', fixation: '—',      costBeige: 1680, costNoir: 1008, sellMin: 1290, sellMax: 1790 },
  'ATL-1B':   { design: 'صحراء', size: 'Double', fixation: '—',      costBeige: 2236, costNoir: 1565, sellMin: 1999, sellMax: 2599 },
  'ATL-2S-H': { design: 'ملكي',  size: 'Single', fixation: 'Wall',   costBeige:  976, costNoir:  683, sellMin: 1499, sellMax: 1899 },
  'ATL-2B-H': { design: 'ملكي',  size: 'Double', fixation: 'Wall',   costBeige: 1715, costNoir: 1200, sellMin: 1999, sellMax: 2599 },
  'ATL-2S-C': { design: 'ملكي',  size: 'Single', fixation: 'Column', costBeige: 1354, costNoir:  948, sellMin: 1999, sellMax: 2399 },
  'ATL-2B-C': { design: 'ملكي',  size: 'Double', fixation: 'Column', costBeige: 2160, costNoir: 1512, sellMin: 2399, sellMax: 2999 },
  'ATL-3S-H': { design: 'نيوم',  size: 'Single', fixation: 'Wall',   costBeige:  670, costNoir:  469, sellMin:  999, sellMax:  999 },
  'ATL-3B-H': { design: 'نيوم',  size: 'Double', fixation: 'Wall',   costBeige: 1090, costNoir:  763, sellMin: 1299, sellMax: 1699 },
  'ATL-3S-C': { design: 'نيوم',  size: 'Single', fixation: 'Column', costBeige: 1140, costNoir:  798, sellMin: 1299, sellMax: 1699 },
  'ATL-3B-C': { design: 'نيوم',  size: 'Double', fixation: 'Column', costBeige: 2080, costNoir: 1456, sellMin: 1899, sellMax: 2599 },
};

const getModelCodeFromRequest = (r) => {
  const rawD = String(r.designType || r.design || '').toLowerCase();
  const rawS = String(r.sizeInfo || r.size || '').toLowerCase();
  const rawF = String(r.fixationType || r.fixation || '').toLowerCase();
  const dk = (rawD.includes('malaki') || rawD.includes('ملكي') || rawD.includes('royal')) ? 'malaki'
    : (rawD.includes('neom') || rawD.includes('نيوم')) ? 'neom' : 'sahra';
  const sk = (rawS.includes('double') || rawS.includes('big') || rawS.includes('كبير') || rawS.includes('سيارتين')) ? 'double' : 'single';
  const fk = (rawF.includes('wall') || rawF.includes('معلق') || rawF.includes('mural')) ? 'wall' : 'column';
  const map = {
    'sahra-single': 'ATL-1S', 'sahra-double': 'ATL-1B',
    'malaki-single-wall': 'ATL-2S-H', 'malaki-double-wall': 'ATL-2B-H',
    'malaki-single-column': 'ATL-2S-C', 'malaki-double-column': 'ATL-2B-C',
    'neom-single-wall': 'ATL-3S-H', 'neom-double-wall': 'ATL-3B-H',
    'neom-single-column': 'ATL-3S-C', 'neom-double-column': 'ATL-3B-C',
  };
  const key = dk === 'sahra' ? `${dk}-${sk}` : `${dk}-${sk}-${fk}`;
  return map[key] || null;
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
const TODAY = toLocalDateStr(new Date());

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

const apiFetch = async (path, opts = {}) => {
  const { headers: customHeaders = {}, ...rest } = opts;
  const r = await fetch(`${API}${path}`, {
    ...rest,
    headers: { 'Content-Type': 'application/json', ...customHeaders },
  });
  const raw = await r.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch (_) {
    data = raw;
  }
  if (!r.ok) {
    const msg = typeof data === 'string' && data ? data : data?.message || `HTTP ${r.status}`;
    throw new Error(msg);
  }
  return data;
};

// ── Sidebar nav ───────────────────────────────────────────────────
const NAV = [
  { path: '/admin',           icon: 'dashboard',         label: 'لوحة التحكم' },
  { path: '/admin/requests',  icon: 'inbox',              label: 'الطلبات' },
  { path: '/admin/pipeline',  icon: 'account_tree',       label: 'سير العمل' },
  { path: '/admin/calendar',  icon: 'calendar_today',     label: 'الأجندة' },
  { path: '/admin/clients',   icon: 'groups',             label: 'العملاء' },
  { path: '/admin/loyalty',    icon: 'workspace_premium',  label: 'برنامج الولاء' },
  { path: '/admin/catalogue',  icon: 'category',           label: 'الكتالوج' },
  { path: '/admin/reports',    icon: 'bar_chart',          label: 'التقارير' },
  { path: '/admin/settings',   icon: 'settings',           label: 'الإعدادات' },
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
  const currentUser  = React.useContext(UserContext);
  const navItem = NAV.find(n => pathname === n.path || (n.path !== '/admin' && pathname.startsWith(n.path)));
  const [dropOpen, setDropOpen] = React.useState(false);
  const dropRef = React.useRef(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (currentUser?.fullName || 'A')
    .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const isMainAdmin = currentUser?.role === 'MAIN_ADMIN';

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

            {/* User avatar + dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen(o => !o)}
                className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-gray-700 transition-colors select-none"
                title={currentUser?.fullName || ''}
              >
                {initials}
              </button>

              {dropOpen && (
                <div className="absolute left-0 top-10 w-56 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {currentUser?.fullName || '—'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {currentUser?.title || (isMainAdmin ? 'مشرف رئيسي' : 'مشرف')}
                    </p>
                    <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isMainAdmin ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                      {isMainAdmin ? 'مشرف رئيسي' : 'مشرف'}
                    </span>
                  </div>
                  <div className="px-4 py-2 text-xs text-gray-400 truncate">{currentUser?.email}</div>
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => { setDropOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

// ── MODULE 1: لوحة التحليلات ────────────────────────────────────────
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
      setRequests(normalizeRequestList(Array.isArray(reqData) ? reqData : MOCK_REQUESTS));
      setAppointments(Array.isArray(apptData) ? apptData.map(normalizeAppointment) : MOCK_APPOINTMENTS.map(normalizeAppointment));
      setLastUpdated(new Date());
      setLoading(false);
    }).catch(() => {
      setRequests(normalizeRequestList(MOCK_REQUESTS));
      setAppointments(MOCK_APPOINTMENTS.map(normalizeAppointment));
      setLastUpdated(new Date());
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, [loadAnalytics]);

  // ── Data Prep: exclude cancelled ─────────────────────────────────
  const activeRequests = useMemo(() =>
    requests.filter(r => normalizeStatus(r.status) !== 'cancelled'), [requests]);

  // ── KPI 1: Revenus Estimés ───────────────────────────────────────
  const estimatedRevenue = useMemo(() =>
    activeRequests.reduce((s, r) => s + (getRequestEstimatedPrice(r) || 0), 0), [activeRequests]);

  // Enrich each request once: resolve model code, product, color flag.
  // Downstream KPIs read from this instead of re-running getModelCodeFromRequest per computation.
  const enrichedRequests = useMemo(() =>
    activeRequests.map(r => {
      const modelCode = getModelCodeFromRequest(r);
      const product = PRODUCT_CATALOG[modelCode] || null;
      const isNoir = normalizeColorName(r.fabricColor || r.color || '') === 'Black';
      return { ...r, modelCode, product, isNoir };
    }), [activeRequests]);

  const estimatedProfit = useMemo(() =>
    enrichedRequests.reduce((s, r) => {
      const price = getRequestEstimatedPrice(r);
      if (!r.product || price == null) return s;
      const cost = r.isNoir ? r.product.costNoir : r.product.costBeige;
      return s + (price - cost);
    }, 0), [enrichedRequests]);

  // clientOrderCounts: shared between loyaltyForce and loyaltyFunnelData.
  const clientOrderCounts = useMemo(() => {
    const map = {};
    activeRequests.forEach(r => {
      const k = r.phone || r.clientName || `id-${r.id}`;
      map[k] = (map[k] || 0) + 1;
    });
    return Object.values(map);
  }, [activeRequests]);

  const loyaltyForce = useMemo(() => {
    if (!clientOrderCounts.length) return 0;
    return Math.round((clientOrderCounts.filter(n => n >= 2).length / clientOrderCounts.length) * 100);
  }, [clientOrderCounts]);

  const lowMarginModels = useMemo(() =>
    Object.entries(PRODUCT_CATALOG).filter(([, p]) =>
      ((p.sellMin - p.costNoir) / p.sellMin) * 100 < 10
    ), []);

  const modelMarginData = useMemo(() =>
    Object.entries(PRODUCT_CATALOG).map(([code, p]) => {
      const m = Math.round(((p.sellMin - p.costNoir) / p.sellMin) * 100);
      return { code, margin: m, fill: m < 10 ? '#dc2626' : m < 25 ? '#d97706' : '#059669' };
    }).sort((a, b) => b.margin - a.margin), []);

  const profitByDesign = useMemo(() => {
    const acc = {};
    enrichedRequests.forEach(r => {
      const price = getRequestEstimatedPrice(r);
      if (!r.product || price == null) return;
      const profit = price - (r.isNoir ? r.product.costNoir : r.product.costBeige);
      acc[r.product.design] = (acc[r.product.design] || 0) + profit;
    });
    return Object.entries(acc).filter(([, v]) => v !== 0).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [enrichedRequests]);

  // Single pass over activeRequests for all four preference breakdowns.
  const { colorStats, designStats, fixationStats, sizeStats } = useMemo(() => {
    const colors = {}, designs = {}, fixations = {}, sizes = {};
    activeRequests.forEach(r => {
      const ck = toArabicColor(r.fabricColor || r.color || '');       colors[ck]    = (colors[ck]    || 0) + 1;
      const dk = toArabicDesign(r.designType || r.design || '');      designs[dk]   = (designs[dk]   || 0) + 1;
      const fk = toArabicFixation(r.fixationType || r.fixation || ''); fixations[fk] = (fixations[fk] || 0) + 1;
      const sk = toArabicSize(r.sizeInfo || r.size || '');            sizes[sk]     = (sizes[sk]     || 0) + 1;
    });
    const toArr = obj => Object.entries(obj).map(([name, value]) => ({ name, value }));
    return { colorStats: toArr(colors), designStats: toArr(designs), fixationStats: toArr(fixations), sizeStats: toArr(sizes) };
  }, [activeRequests]);

  const loyaltyFunnelData = useMemo(() => [
    { name: '🆕 جديد — 1 طلب',        count: clientOrderCounts.filter(n => n === 1).length,            color: '#6b7280' },
    { name: '🥈 فضي — 2 إلى 4 طلبات', count: clientOrderCounts.filter(n => n >= 2 && n <= 4).length,   color: '#64748b' },
    { name: '💎 بلاتيني — 5+ طلبات',  count: clientOrderCounts.filter(n => n >= 5).length,              color: '#B89B5E' },
  ], [clientOrderCounts]);

  const topClientsByAmount = useMemo(() => {
    const totals = {};
    activeRequests.forEach((r) => {
      const key = (r.phone || r.clientPhone || r.customerPhone || r.clientName || r.customerName || `id-${r.id}`).trim();
      const clientName = r.clientName || r.customerName || key;
      if (!totals[key]) totals[key] = { key, name: clientName, amount: 0, orders: 0 };
      totals[key].orders += 1;
      totals[key].amount += getRequestEstimatedPrice(r) || 0;
    });
    return Object.values(totals)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [activeRequests]);

  const maxTopClientAmount = useMemo(() =>
    Math.max(...topClientsByAmount.map(c => c.amount), 0), [topClientsByAmount]);

  // statusData intentionally includes cancelled orders to show full status distribution.
  const statusData = useMemo(() => Object.entries(
    requests.reduce((acc, r) => {
      const k = normalizeStatus(r.status);
      const label = STATUSES[k]?.label || k;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })), [requests]);

  const topModelsData = useMemo(() => {
    const ordersByCode = {};
    enrichedRequests.forEach(r => {
      if (r.modelCode) ordersByCode[r.modelCode] = (ordersByCode[r.modelCode] || 0) + 1;
    });
    return Object.entries(PRODUCT_CATALOG).map(([code, p]) => {
      const marginPct = Math.round(((p.sellMin - p.costNoir) / p.sellMin) * 100);
      const orders = ordersByCode[code] || 0;
      const status = marginPct < 0 ? 'خسارة' : marginPct < 10 ? 'هامش منخفض' : 'جيد';
      return { code, design: p.design, size: p.size, fixation: p.fixation, orders, marginPct, status, lowMargin: marginPct < 10 };
    }).sort((a, b) => b.orders - a.orders);
  }, [enrichedRequests]);

  const PIE_COLORS = ['#111827', '#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0891b2', '#B89B5E'];
  const PREF_COLORS = ['#111827', '#2563eb', '#059669', '#d97706'];

  const kpis = [
    { label: 'الإيرادات التقديرية', value: formatCurrency(estimatedRevenue), icon: 'payments', alert: false, iconBg: '#ecfdf5', iconColor: '#059669', sub: `${formatNumber(activeRequests.length)} طلب نشط` },
    { label: 'الأرباح التقديرية', value: formatCurrency(estimatedProfit), icon: 'trending_up', alert: estimatedProfit < 0, iconBg: estimatedProfit >= 0 ? '#eff6ff' : '#fef2f2', iconColor: estimatedProfit >= 0 ? '#2563eb' : '#dc2626', sub: estimatedProfit < 0 ? '⚠️ خسارة إجمالية' : 'بعد خصم التكاليف' },
    { label: 'قوة الولاء', value: `${loyaltyForce}%`, icon: 'workspace_premium', alert: false, iconBg: '#fefce8', iconColor: '#B89B5E', sub: 'عملاء فضي + بلاتيني' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className={`bg-white border rounded-xl p-5 shadow-sm ${k.alert ? 'border-red-300 bg-red-50/30' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: k.iconBg }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: k.iconColor, fontVariationSettings: "'FILL' 1" }}>{k.icon}</span>
              </div>
              {k.alert && <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">!</span>}
            </div>
            <p className="text-2xl font-bold text-gray-900 leading-none">{loading ? '—' : k.value}</p>
            <p className="text-xs text-gray-600 mt-1.5 font-semibold leading-tight">{k.label}</p>
            {k.sub && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* Top clients by estimated amount */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">قيمة متوقعة لكل عميل</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">مرتبة حسب مجموع السعر المتوقع للطلبات النشطة</p>
          </div>
          <span className="text-[10px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-full">
            أعلى {formatNumber(topClientsByAmount.length)} عملاء
          </span>
        </div>
        {topClientsByAmount.length > 0 ? (
          <div className="space-y-3">
            {topClientsByAmount.map((c) => {
              const pct = maxTopClientAmount > 0 ? Math.max(4, Math.round((c.amount / maxTopClientAmount) * 100)) : 0;
              return (
                <div key={c.key} className="rounded-lg border border-gray-100 p-3 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs font-bold text-emerald-700 whitespace-nowrap">{formatCurrency(c.amount)}</p>
                  </div>
                  <div className="h-2.5 bg-white border border-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{formatNumber(c.orders)} طلب نشط</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-400 py-4 text-center">لا توجد بيانات أسعار متوقعة حالياً</div>
        )}
      </div>

      {/* Row 1: Model Margins + Profit by Design */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bar Chart – Model Margins */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">أداء الموديلات — هامش الربح %</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">أحمر: هامش أقل من 10% · برتقالي: أقل من 25%</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelMarginData} margin={{ top: 8, right: 16, left: -20, bottom: 44 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="code" interval={0} angle={-40} textAnchor="end" tick={{ fill: '#374151', fontSize: 9 }} />
                <YAxis tick={{ fill: '#374151', fontSize: 10 }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(val) => [`${val}%`, 'هامش الربح']} />
                <ReferenceLine y={10} stroke="#d97706" strokeDasharray="5 3" label={{ value: '10%', position: 'insideTopRight', fill: '#d97706', fontSize: 9 }} />
                <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="3 3" />
                <Bar dataKey="margin" radius={[4, 4, 0, 0]}>
                  {modelMarginData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart – Profit by Design */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">توزيع الأرباح حسب التصميم</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">أي تصميم يولّد أكبر ربح للشركة</p>
          </div>
          {profitByDesign.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={profitByDesign} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
                    {profitByDesign.map((_, idx) => (
                      <Cell key={idx} fill={PREF_COLORS[idx % PREF_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => [formatCurrency(val), 'الربح التقديري']} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-300">
              <span className="material-symbols-outlined text-4xl mb-2">pie_chart</span>
              <p className="text-sm">لا توجد بيانات كافية لحساب الأرباح</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Customer Preferences — 4 Pies */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-900">تحليل خيارات العملاء</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">بيانات مستخرجة من معالج الطلب (Wizard)</p>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { title: 'اللون', data: colorStats, colors: ['#1c1c1c','#B89B5E','#d4af37','#6b7280'] },
            { title: 'التصميم', data: designStats, colors: PREF_COLORS },
            { title: 'التثبيت', data: fixationStats, colors: ['#7c3aed','#0891b2'] },
            { title: 'الحجم', data: sizeStats, colors: ['#ea580c','#16a34a'] },
          ].map(({ title, data, colors }) => (
            <div key={title}>
              <h4 className="text-xs font-bold text-gray-600 text-center mb-2">{title}</h4>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" outerRadius={58} innerRadius={28}
                      label={({ percent }) => `${Math.round(percent * 100)}%`} labelLine={false}
                      fontSize={9}>
                      {data.map((_, idx) => <Cell key={idx} fill={colors[idx % colors.length]} />)}
                    </Pie>
                    <Tooltip formatter={(val) => [formatNumber(val), 'طلبات']} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Loyalty Funnel + Status Distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Loyalty Funnel */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">قمع تحويل الولاء</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">توزيع العملاء على مستويات برنامج الولاء</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loyaltyFunnelData} layout="vertical" margin={{ right: 32, left: 12, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(val) => [formatNumber(val), 'عميل']} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 11, fontWeight: 700 }}>
                  {loyaltyFunnelData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900">توزيع الطلبات حسب الحالة</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">جميع الطلبات بما فيها الملغاة</p>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {statusData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(val) => [formatNumber(val), 'طلبات']} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Models Table */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-sm font-bold text-gray-900">جدول أداء المنتجات</h3>
          <p className="text-[11px] text-gray-400">مرتب حسب عدد الطلبات · الصفوف الحمراء = هامش أقل من 10%</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                <th className="px-4 py-3">الكود</th>
                <th className="px-4 py-3">التصميم</th>
                <th className="px-4 py-3">الحجم</th>
                <th className="px-4 py-3">التثبيت</th>
                <th className="px-4 py-3">عدد الطلبات</th>
                <th className="px-4 py-3">هامش الربح %</th>
                <th className="px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topModelsData.map((row, i) => (
                <tr key={i} className={`transition-colors ${row.lowMargin ? 'bg-red-50/60 hover:bg-red-50' : 'hover:bg-gray-50'}`}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600">{row.code}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{row.design}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{row.size === 'Single' ? 'سيارة واحدة' : 'سيارتين'}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {row.fixation === 'Wall' ? 'معلق' : row.fixation === 'Column' ? 'أعمدة' : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {row.orders > 0
                      ? <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{formatNumber(row.orders)}</span>
                      : <span className="text-xs text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      row.marginPct < 0 ? 'bg-red-100 text-red-700'
                      : row.marginPct < 10 ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                    }`}>
                      {row.marginPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      row.status === 'خسارة' ? 'bg-red-100 text-red-700'
                      : row.status === 'هامش منخفض' ? 'bg-amber-100 text-amber-700'
                      : 'bg-green-100 text-green-700'
                    }`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── خريطة التوزيع الجغرافي للطلبات (الخريطة فقط) ── */}
      <GeoMapSection requests={requests} />
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
      .then(d => { setRequests(normalizeRequestList(d)); setLoading(false); })
      .catch(() => { setRequests(normalizeRequestList(MOCK_REQUESTS)); setLoading(false); });
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

  const visibleRequests = requests.filter(r => normalizeStatus(r.status) !== 'confirmed');

  const filtered = visibleRequests.filter(r => {
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
          {['الكل', ...Object.values(STATUSES).slice(0, 5).filter(s => s.label !== 'مؤكد').map(s => s.label)].map(f => (
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
                  ['السعر', getRequestEstimatedPrice(selected) != null ? formatCurrency(getRequestEstimatedPrice(selected)) : '—'],
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
    apiFetch('/admin/requests').then(d => setRequests(normalizeRequestList(d))).catch(() => setRequests(normalizeRequestList(MOCK_REQUESTS)));
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
  const currentUser = React.useContext(UserContext);
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests]         = useState([]);
  const [staff, setStaff]               = useState([]);
  const [view, setView]                 = useState('يوم');
  const [showForm, setShowForm]         = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [form, setForm]                 = useState({ clientName: '', clientPhone: '', agentName: 'سلطان الغامدي', appointmentType: 'زيارة ميدانية', date: TODAY, startTime: '09:00', duration: 60, note: '' });
  const [clientSearch, setClientSearch] = useState('');
  const [saving, setSaving]             = useState(false);
  const [statusActionBusy, setStatusActionBusy] = useState(false);
  const [currentDate, setCurrentDate]   = useState(new Date());
  const debouncedClientSearch           = useDebouncedValue(clientSearch, 350);

  const DAYS_AR = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const VISIT_TYPES = ['زيارة ميدانية', 'تركيب'];

  // Dynamic agents: derive from loaded appointments + known defaults
  const AGENTS = useMemo(() => {
    const staffNames = staff
      .map((s) => s.fullName || '')
      .map((name) => name.trim())
      .filter(Boolean);
    if (staffNames.length > 0) return Array.from(new Set(staffNames));

    const names = new Set(['سلطان الغامدي', 'فهد العتيبي']);
    appointments.forEach(a => { if (a.agentName) names.add(a.agentName); });
    return Array.from(names);
  }, [staff, appointments]);
  const GRID_START = 360; // 06:00 in minutes
  const PX_PER_MIN = 1.2; // pixels per minute
  const localToday = toLocalDateStr(new Date());

  useEffect(() => {
    Promise.all([
      apiFetch('/admin/appointments').catch(() => MOCK_APPOINTMENTS),
      apiFetch('/admin/requests').catch(() => MOCK_REQUESTS),
      apiFetch('/auth/staff', { headers: { 'X-Admin-Id': String(currentUser?.id || '') } }).catch(() => []),
    ]).then(([apptData, reqData, staffData]) => {
      setAppointments(Array.isArray(apptData) ? apptData.map(normalizeAppointment) : MOCK_APPOINTMENTS.map(normalizeAppointment));
      setRequests(normalizeRequestList(Array.isArray(reqData) ? reqData : MOCK_REQUESTS));
      setStaff(Array.isArray(staffData) ? staffData : []);
    });
  }, [currentUser?.id]);

  useEffect(() => {
    if (!AGENTS.length) return;
    if (!form.agentName || !AGENTS.includes(form.agentName)) {
      setForm((p) => ({ ...p, agentName: AGENTS[0] }));
    }
  }, [AGENTS, form.agentName]);

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
      const existing = map.get(key);
      const incomingDate = new Date(r.requestDate || 0).getTime();
      const existingDate = existing ? new Date(existing.requestDate || 0).getTime() : -1;
      if (!existing || incomingDate >= existingDate) {
        map.set(key, {
          name,
          phone,
          requestId: r.id || null,
          requestDate: r.requestDate || null,
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

  const dateStr = toLocalDateStr(currentDate);
  const dayAppts = appointments.filter(a => dateOnly(a.appointmentDate) === dateStr || !a.appointmentDate);

  const timeSlots = useMemo(() => {
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const isTodaySelected = form.date === localToday;

    return HOURS
      .filter(({ totalMins }) => !isTodaySelected || totalMins > nowMins)
      .map(({ label }) => {
        const reserved = appointments.find((a) =>
          dateOnly(a.appointmentDate) === form.date &&
          (a.startTime || timeOnly(a.appointmentDate)) === label &&
          a.status !== 'ملغاة'
        );

        return {
          label,
          reservedBy: reserved?.request?.clientName || reserved?.clientName || null,
        };
      });
  }, [appointments, form.date, localToday]);

  const selectedSlotConflict = useMemo(() => {
    const hit = timeSlots.find((s) => s.label === form.startTime);
    return hit?.reservedBy || null;
  }, [timeSlots, form.startTime]);

  useEffect(() => {
    if (!timeSlots.length) return;
    const exists = timeSlots.some((s) => s.label === form.startTime);
    if (!exists) {
      setForm((p) => ({ ...p, startTime: timeSlots[0].label }));
    }
  }, [timeSlots, form.startTime]);

  const prevDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); };
  const nextDay = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); };

  const save = () => {
    if (!form.clientName || !form.date) return;
    const payload = { ...form };
    if (payload.date < localToday) {
      window.alert('التاريخ المختار منتهي. اختر تاريخا متاحا.');
      return;
    }
    if (selectedSlotConflict) {
      window.alert(`هذا الموعد محجوز بالفعل للعميل: ${selectedSlotConflict}`);
      return;
    }
    setSaving(true);
    const appointmentDateIso = `${payload.date}T${payload.startTime}:00`;
    const selectedReq = requests
      .filter(r => {
        const rPhone = r.phone || r.clientPhone || r.customerPhone || '';
        const rName = r.clientName || r.customerName || '';
        if (payload.clientPhone) return rPhone === payload.clientPhone;
        return rName === payload.clientName;
      })
      .sort((a, b) => new Date(b.requestDate || 0) - new Date(a.requestDate || 0))[0];

    const newAppt = {
      agentName: payload.agentName, appointmentType: payload.appointmentType,
      appointmentDate: appointmentDateIso, startTime: payload.startTime, duration: Number(payload.duration),
      status: 'قادمة', request: selectedReq?.id ? { id: selectedReq.id } : null, location: '', note: payload.note
    };
    const resetForm = () => {
      setCurrentDate(fromLocalDateStr(payload.date));
      setView('يوم');
      setShowForm(false);
      setClientSearch('');
      setForm({ clientName: '', clientPhone: '', agentName: AGENTS[0] || 'سلطان الغامدي', appointmentType: 'زيارة ميدانية', date: TODAY, startTime: '09:00', duration: 60, note: '' });
      setSaving(false);
    };

    const buildAppt = (serverData) => normalizeAppointment({
      ...(serverData || newAppt),
      request: serverData?.request?.clientName ? serverData.request : {
        clientName: payload.clientName,
        clientPhone: payload.clientPhone,
        confirmationNumber: selectedReq?.confirmationNumber || '',
      },
    });

    apiFetch('/admin/appointments', { method: 'POST', body: JSON.stringify(newAppt) })
      .then(d => {
        if (!d?.id) {
          throw new Error('فشل حفظ الزيارة في قاعدة البيانات');
        }
        setAppointments(p => [...p, buildAppt(d)]);
        resetForm();
      })
      .catch((e) => {
        setSaving(false);
        window.alert(e?.message || 'تعذر حفظ الزيارة في قاعدة البيانات');
      });
  };

  const updateAppointmentStatus = async (appt, action, nextStatus) => {
    if (!appt) return;
    if (statusActionBusy) return;
    setStatusActionBusy(true);

    const applyLocal = (payload) => {
      const normalized = normalizeAppointment(payload || { ...appt, status: nextStatus });
      setAppointments((prev) => prev.map((a) => (a.id === appt.id ? { ...a, ...normalized } : a)));
      setSelectedAppt((prev) => (prev?.id === appt.id ? { ...prev, ...normalized } : prev));
    };

    if (!appt.id || Number(appt.id) > 99999999999) {
      applyLocal();
      setStatusActionBusy(false);
      return;
    }

    try {
      const updated = await apiFetch(`/admin/appointments/${appt.id}/${action}`, { method: 'PUT' });
      applyLocal(updated);

      const refreshed = await apiFetch('/admin/appointments');
      const normalizedList = (Array.isArray(refreshed) ? refreshed : []).map(normalizeAppointment);
      setAppointments(normalizedList);
      setSelectedAppt((prev) => {
        if (!prev) return prev;
        const latest = normalizedList.find((a) => a.id === prev.id);
        return latest || prev;
      });
    } catch (e) {
      applyLocal();
      window.alert(e?.message || 'تعذر تحديث حالة الزيارة');
    } finally {
      setStatusActionBusy(false);
    }
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
                const agentAppts = AGENTS.length === 1
                  ? dayAppts
                  : dayAppts.filter(a => a.agentName === agent);
                return (
                  <div key={agent} className="flex-1 relative border-r border-gray-50 last:border-0">
                    {agentAppts.map(appt => {
                      const startMins = timeToMins(appt.startTime || '08:00');
                      const top = (startMins - GRID_START) * PX_PER_MIN;
                      const height = Math.max((appt.duration || 60) * PX_PER_MIN, 28);
                      const cfg = appointmentColorCfg(appt);
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
              const cfg = appointmentColorCfg(appt);
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
            const ds = toLocalDateStr(d);
            const count = appointments.filter(a => dateOnly(a.appointmentDate) === ds).length;
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
            const ds = toLocalDateStr(d);
            const dayA = appointments.filter(a => dateOnly(a.appointmentDate) === ds);
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
            const ds = toLocalDateStr(d);
            const dayA = appointments.filter(a => dateOnly(a.appointmentDate) === ds);
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
        {VISIT_TYPES.map((type) => {
          const cfg = VISIT_COLORS[type];
          return (
          <div key={type} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
            <span className="text-[10px] text-gray-500">{type}</span>
          </div>
          );
        })}
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
                const cfg = appointmentColorCfg(selectedAppt);
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
                        ['الحالة', selectedAppt.status || 'قادمة'],
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
                      <button
                        onClick={() => updateAppointmentStatus(selectedAppt, 'complete', 'مكتملة')}
                        disabled={statusActionBusy}
                        className="flex-1 py-2 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-600 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        تأكيد الإنجاز
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(selectedAppt, 'postpone', 'مرجأة')}
                        disabled={statusActionBusy}
                        className="flex-1 py-2 bg-amber-50 text-amber-700 text-xs font-medium rounded-lg hover:bg-amber-500 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        تأجيل
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(selectedAppt, 'cancel', 'ملغاة')}
                        disabled={statusActionBusy}
                        className="flex-1 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        إلغاء
                      </button>
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
                  {VISIT_TYPES.map(t => <option key={t}>{t}</option>)}
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
                        setForm(p => ({ ...p, clientName: c.name, clientPhone: c.phone, requestId: c.requestId || null }));
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
                    min={localToday}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">وقت البداية *</label>
                  <select value={form.startTime}
                    onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors">
                    {timeSlots.length === 0 ? (
                      <option value="">لا توجد أوقات متاحة</option>
                    ) : timeSlots.map((slot) => (
                      <option key={slot.label} value={slot.label} disabled={Boolean(slot.reservedBy)}>
                        {slot.label}{slot.reservedBy ? ` — محجوز (${slot.reservedBy})` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedSlotConflict && (
                    <p className="text-[10px] text-red-600 mt-1">هذا الوقت محجوز للعميل: {selectedSlotConflict}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
              
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
// ── برنامج الولاء — يتطابق تماماً مع الواجهة الأمامية (Landing.jsx) ──
// الطلب 1  : لا خصم
// الطلبات 2–4 : خصم تلقائي 5%
// الطلب 5+   : خصم استثنائي 50% (نصف السعر)
const LOYALTY_LEVELS = [
  { min: 0, max: 1,  label: 'جديد',    color: '#6b7280', discount: '—',   icon: '🆕', nextDiscount: '5%'  },
  { min: 2, max: 3,  label: 'فضي',     color: '#64748b', discount: '5%',  icon: '🥈', nextDiscount: '10%' },
  { min: 4, max: 4,  label: 'ذهبي',    color: '#b8860b', discount: '10%', icon: '🥉', nextDiscount: '50%' },
  { min: 5, max: 99, label: 'بلاتيني', color: '#B89B5E', discount: '50%', icon: '🏆', nextDiscount: '50%' },
];
const loyaltyOf = (n) => LOYALTY_LEVELS.find(l => n >= l.min && n <= l.max) || LOYALTY_LEVELS[0];

// خصم الطلب التالي بناءً على عدد الطلبات الحالية
const getNextOrderDiscount = (validOrderCount) => {
  const next = validOrderCount + 1;
  if (next >= 5) return '50%';
  if (next === 4) return '10%';
  if (next >= 2) return '5%';
  return '—';
};

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
    apiFetch('/admin/requests').then(d => setRequests(normalizeRequestList(d))).catch(() => setRequests(normalizeRequestList(MOCK_REQUESTS)));
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
    const completedOrders = c.orders.filter(o => normalizeStatus(o.status) !== 'cancelled').length;
    const loy = loyaltyOf(completedOrders);
    const matchSearch = !search || c.name?.includes(search) || c.phone?.includes(search);
    const matchLoyalty = loyaltyFilter === 'الكل' || loy.label === loyaltyFilter;
    return matchSearch && matchLoyalty;
  });

  const sel = selectedKey ? clientMap[selectedKey] : null;
  const selCompleted = sel ? sel.orders.filter(o => normalizeStatus(o.status) !== 'cancelled').length : 0;
  const selLoyalty = sel ? loyaltyOf(selCompleted) : null;
  const selRevenue = sel ? sel.orders.reduce((s, o) => s + (getRequestEstimatedPrice(o) || 0), 0) : 0;
  const selAppts = sel ? MOCK_APPOINTMENTS.filter(a => a.request?.clientName === sel.name) : [];
  const selLastOrder = sel ? [...sel.orders].sort((a, b) => new Date(b.requestDate || 0) - new Date(a.requestDate || 0))[0] : null;
  const selWizardData = selLastOrder ? {
    design: toArabicDesign(selLastOrder.designType || selLastOrder.design),
    size: toArabicSize(selLastOrder.sizeInfo || selLastOrder.size),
    fixation: toArabicFixation(selLastOrder.fixationType || selLastOrder.fixation),
    color: toArabicColor(selLastOrder.fabricColor || selLastOrder.color),
    address: getRequestAddress(selLastOrder),
    requestNo: selLastOrder.confirmationNumber || `#${selLastOrder.id}`,
  } : null;

  const TABS = ['معلومات شخصية', 'الطلبات', 'بيانات الطلب', 'الولاء', 'المواعيد', 'الملاحظات'];

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
              const completed = c.orders.filter(o => normalizeStatus(o.status) !== 'cancelled').length;
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
                                <p className="text-sm font-semibold text-gray-800">{getRequestEstimatedPrice(o) != null ? formatCurrency(getRequestEstimatedPrice(o)) : '—'}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-[10px] text-gray-500 mb-1">العنوان</p>
                                <p className="text-xs font-medium text-gray-700 truncate">{getRequestAddress(o)}</p>
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
                          <div><span className="text-gray-400 block">التصميم</span><span className="font-medium">{toArabicDesign(o.designType || o.design)}</span></div>
                          <div><span className="text-gray-400 block">الحجم</span><span className="font-medium">{toArabicSize(o.sizeInfo || o.size)}</span></div>
                          <div><span className="text-gray-400 block">اللون</span><span className="font-medium">{toArabicColor(o.fabricColor || o.color)}</span></div>
                          <div><span className="text-gray-400 block">التثبيت</span><span className="font-medium">{toArabicFixation(o.fixationType || o.fixation)}</span></div>
                          <div><span className="text-gray-400 block">السعر المتوقع</span><span className="font-medium text-emerald-700">{getRequestEstimatedPrice(o) != null ? formatCurrency(getRequestEstimatedPrice(o)) : '—'}</span></div>
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
                    {/* بطاقة الولاء الحالية */}
                    <div className="rounded-xl p-5 border" style={{ background: `${selLoyalty?.color}08`, borderColor: `${selLoyalty?.color}30` }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{selLoyalty?.icon}</span>
                          <div>
                            <h4 className="font-bold text-gray-900">بطاقة الأطلسي — {selLoyalty?.label}</h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">{selCompleted} طلب فعّال · خصم حالي {selLoyalty?.discount}</p>
                          </div>
                        </div>
                        {selLoyalty?.discount !== '—' && (
                          <span className="text-sm font-black px-3 py-1.5 rounded-full" style={{ color: selLoyalty?.color, background: `${selLoyalty?.color}15` }}>
                            {selLoyalty?.discount} خصم
                          </span>
                        )}
                      </div>
                      {/* شريط التقدم (5 طلبات) */}
                      <div className="flex gap-1.5 mb-2">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="flex-1 h-2 rounded-full transition-all" style={{
                            backgroundColor: i <= selCompleted ? selLoyalty?.color : '#e5e7eb'
                          }} />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] text-gray-500">{selCompleted} / 5 طلبات</p>
                        {selCompleted < 5 && (
                          <p className="text-[11px] font-semibold" style={{ color: selLoyalty?.color }}>
                            خصم الطلب التالي: {getNextOrderDiscount(selCompleted)}
                          </p>
                        )}
                        {selCompleted >= 5 && (
                          <p className="text-[11px] font-bold text-amber-600">🎉 مستحق لخصم 50%</p>
                        )}
                      </div>
                    </div>

                    {/* شرح مسار برنامج الولاء */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">مسار برنامج الولاء</h4>
                      <div className="space-y-2">
                        {[
                          { orders: '1',   label: 'الطلب الأول',       discount: '—',   note: 'لا خصم',       color: '#6b7280' },
                          { orders: '2–3', label: 'الطلبات 2 و 3',     discount: '5%',  note: 'خصم تلقائي',   color: '#64748b' },
                          { orders: '4',   label: 'الطلب الرابع',       discount: '10%', note: 'خصم ذهبي',     color: '#b8860b' },
                          { orders: '5+', label: 'الطلب الخامس', discount: '50%', note: 'نصف السعر 🎉', color: '#B89B5E' },
                        ].map((tier, i) => {
                          const isActive = (tier.orders === '1' && selCompleted <= 1) ||
                                           (tier.orders === '2–4' && selCompleted >= 2 && selCompleted <= 4) ||
                                           (tier.orders === '5+' && selCompleted >= 5);
                          return (
                            <div key={i} className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isActive ? 'border-gray-300 bg-gray-50 shadow-sm' : 'border-gray-100'}`}>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">الطلب {tier.orders}</span>
                                <span className="text-sm font-medium text-gray-700">{tier.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{tier.note}</span>
                                {tier.discount !== '—' && (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                                    {tier.discount}
                                  </span>
                                )}
                                {isActive && <span className="w-2 h-2 rounded-full bg-gray-700 flex-shrink-0" />}
                              </div>
                            </div>
                          );
                        })}
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
                              <p className="text-xs text-gray-400 mt-1">{formatDate(a.appointmentDate)} — {a.startTime}</p>
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
    apiFetch('/admin/requests').then(d => setRequests(normalizeRequestList(d))).catch(() => setRequests(normalizeRequestList(MOCK_REQUESTS)));
  }, []);
  const clientMap = requests.reduce((acc, r) => {
    const k = r.phone || r.clientName;
    if (!acc[k]) acc[k] = { name: r.clientName, phone: r.phone, orders: [] };
    acc[k].orders.push(r);
    return acc;
  }, {});
  const getLevel = (n) => LOYALTY_LEVELS.findLast(l => n >= l.min) || LOYALTY_LEVELS[0];
  const clientsRows = Object.values(clientMap).map((c) => {
    const done = c.orders.filter(o => normalizeStatus(o.status) !== 'cancelled').length;
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
              <th className="px-5 py-3">الطلبات الفعّالة</th>
              <th className="px-5 py-3">المستوى الحالي</th>
              <th className="px-5 py-3">خصم الطلب التالي</th>
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
                  <td className="px-5 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      getNextOrderDiscount(c.done) === '50%' ? 'bg-amber-100 text-amber-700' :
                      getNextOrderDiscount(c.done) === '10%' ? 'bg-yellow-100 text-yellow-700' :
                      getNextOrderDiscount(c.done) === '5%'  ? 'bg-blue-50 text-blue-600'   :
                      'text-gray-300'
                    }`}>
                      {getNextOrderDiscount(c.done) === '—' ? '—' : `خصم ${getNextOrderDiscount(c.done)}`}
                    </span>
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
    apiFetch('/admin/requests').then(d => setRequests(normalizeRequestList(d))).catch(() => setRequests(normalizeRequestList(MOCK_REQUESTS)));
  }, []);
  const byStatus = Object.entries(requests.reduce((a, r) => { const k = normalizeStatus(r.status); a[k] = (a[k] || 0) + 1; return a; }, {}));
  const totalRevenue = requests.filter(r => normalizeStatus(r.status) === 'installed').reduce((s, r) => s + (getRequestEstimatedPrice(r) || 0), 0);
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
// ── Settings: role-aware ─────────────────────────────────────────
const ROLE_LABELS = { MAIN_ADMIN: 'مشرف رئيسي', EDITOR: 'مشرف' };

const Settings = () => {
  const currentUser = React.useContext(UserContext);
  const isMainAdmin = currentUser?.role === 'MAIN_ADMIN';

  // ─ State shared
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState('');
  const flash = (isErr, msg) => {
    if (isErr) setError(msg);
    else { setSaved(true); setError(''); setTimeout(() => setSaved(false), 2500); }
  };

  // ─ MAIN_ADMIN state
  const [admins,   setAdmins]   = useState([]);
  const [newAdmin, setNewAdmin] = useState({ fullName: '', title: '', email: '', password: '', role: 'EDITOR' });
  const [editRow,  setEditRow]  = useState(null); // { id, fullName, title, email, password, role }

  const adminHeaders = { 'X-Admin-Id': String(currentUser?.id || '') };

  const loadAdmins = useCallback(() => {
    setError('');
    apiFetch('/auth/admins', { headers: adminHeaders })
      .then(list => setAdmins(Array.isArray(list) ? list : []))
      .catch(e => setError(e?.message || 'تعذر تحميل قائمة المشرفين'));
  }, [currentUser?.id]);

  useEffect(() => { if (isMainAdmin) loadAdmins(); }, [isMainAdmin, loadAdmins]);

  const addAdmin = () => {
    if (!newAdmin.email || !newAdmin.password) { flash(true, 'يرجى إدخال البريد الإلكتروني وكلمة المرور'); return; }
    apiFetch('/auth/admins', { method: 'POST', headers: adminHeaders, body: JSON.stringify(newAdmin) })
      .then(() => { setNewAdmin({ fullName: '', title: '', email: '', password: '', role: 'EDITOR' }); flash(false); loadAdmins(); })
      .catch(e => flash(true, e?.message || 'تعذر إضافة المشرف'));
  };

  const saveEdit = () => {
    if (!editRow) return;
    apiFetch(`/auth/admins/${editRow.id}`, { method: 'PUT', headers: adminHeaders, body: JSON.stringify(editRow) })
      .then(() => { setEditRow(null); flash(false); loadAdmins(); })
      .catch(e => flash(true, e?.message || 'تعذر تعديل المشرف'));
  };

  const removeAdmin = (id) => {
    apiFetch(`/auth/admins/${id}`, { method: 'DELETE', headers: adminHeaders })
      .then(() => { flash(false); loadAdmins(); })
      .catch(e => flash(true, e?.message || 'تعذر حذف المشرف'));
  };

  // ─ EDITOR (self profile) state
  const [profile, setProfile] = useState({
    fullName: currentUser?.fullName || '',
    title:    currentUser?.title    || '',
    email:    currentUser?.email    || '',
    password: '',
  });

  const saveProfile = () => {
    const body = { fullName: profile.fullName, title: profile.title, email: profile.email };
    if (profile.password) body.password = profile.password;
    apiFetch('/auth/profile', {
      method: 'PUT',
      headers: { 'X-Admin-Id': String(currentUser?.id || '') },
      body: JSON.stringify(body),
    })
      .then(updated => {
        // Update localStorage so header reflects new name
        localStorage.setItem(ADMIN_NAME_KEY,  updated.fullName || '');
        localStorage.setItem(ADMIN_TITLE_KEY, updated.title    || '');
        localStorage.setItem(ADMIN_EMAIL_KEY, updated.email    || '');
        setProfile(p => ({ ...p, password: '' }));
        flash(false);
      })
      .catch(e => flash(true, e?.message || 'تعذر حفظ البيانات'));
  };

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-gray-900">
        {isMainAdmin ? 'إدارة المشرفين' : 'الملف الشخصي'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── EDITOR: profile form only ──────────────────────────── */}
      {!isMainAdmin && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
            تعديل بياناتك الشخصية
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">الاسم الكامل</label>
              <input value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">اللقب / المسمى الوظيفي</label>
              <input value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">البريد الإلكتروني</label>
              <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">كلمة المرور الجديدة <span className="text-gray-400">(اتركها فارغة للإبقاء)</span></label>
              <input type="password" placeholder="••••••••" value={profile.password}
                onChange={e => setProfile(p => ({ ...p, password: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
            </div>
          </div>
          <button onClick={saveProfile}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">save</span>
            حفظ التغييرات
          </button>
        </div>
      )}

      {/* ── MAIN_ADMIN: admin list ──────────────────────────────── */}
      {isMainAdmin && (
        <>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              المشرفون الحاليون
            </h3>
            <div className="space-y-3">
              {admins.map(admin => (
                <div key={admin.id}>
                  {editRow?.id === admin.id ? (
                    // ── Inline edit form ──────────────────────────
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-gray-500 mb-1 block">الاسم الكامل</label>
                          <input value={editRow.fullName} onChange={e => setEditRow(r => ({ ...r, fullName: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 mb-1 block">اللقب</label>
                          <input value={editRow.title} onChange={e => setEditRow(r => ({ ...r, title: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 mb-1 block">البريد الإلكتروني</label>
                          <input type="email" value={editRow.email} onChange={e => setEditRow(r => ({ ...r, email: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 mb-1 block">كلمة مرور جديدة</label>
                          <input type="password" placeholder="اتركها فارغة" value={editRow.password || ''}
                            onChange={e => setEditRow(r => ({ ...r, password: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400" />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 mb-1 block">الدور</label>
                          <select value={editRow.role} onChange={e => setEditRow(r => ({ ...r, role: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-400 bg-white">
                            <option value="EDITOR">مشرف</option>
                            <option value="MAIN_ADMIN">مشرف رئيسي</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit}
                          className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">check</span> حفظ
                        </button>
                        <button onClick={() => setEditRow(null)}
                          className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200 transition-colors">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    // ── Read row ──────────────────────────────────
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900">{admin.fullName || admin.email}</p>
                          {admin.title && <span className="text-[10px] text-gray-500">— {admin.title}</span>}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${admin.role === 'MAIN_ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                            {ROLE_LABELS[admin.role] || 'مشرف'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{admin.email}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => setEditRow({ ...admin, password: '' })}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <button onClick={() => removeAdmin(admin.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">الاسم الكامل</label>
                <input placeholder="مثال: محمد الشمري" value={newAdmin.fullName}
                  onChange={e => setNewAdmin(a => ({ ...a, fullName: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">اللقب / المسمى الوظيفي</label>
                <input placeholder="مثال: مشرف المبيعات" value={newAdmin.title}
                  onChange={e => setNewAdmin(a => ({ ...a, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">البريد الإلكتروني *</label>
                <input type="email" placeholder="admin@example.com" value={newAdmin.email}
                  onChange={e => setNewAdmin(a => ({ ...a, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">كلمة المرور *</label>
                <input type="password" placeholder="••••••••" value={newAdmin.password}
                  onChange={e => setNewAdmin(a => ({ ...a, password: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">الدور</label>
                <select value={newAdmin.role} onChange={e => setNewAdmin(a => ({ ...a, role: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors bg-white">
                  <option value="EDITOR">مشرف</option>
                  <option value="MAIN_ADMIN">مشرف رئيسي</option>
                </select>
              </div>
            </div>
            <button onClick={addAdmin}
              className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add</span>
              إضافة المشرف
            </button>
          </div>
        </>
      )}

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

// ── Page: Catalogue / Stock ───────────────────────────────────────
const CATALOGUE_PRODUCTS = [
  { code: 'ATL-1S',   design: 'صحراء', size: 'Single', fixation: '—',      costBeige: 1680, costNoir: 1008, sellMin: 1290, sellMax: 1790 },
  { code: 'ATL-1B',   design: 'صحراء', size: 'Double', fixation: '—',      costBeige: 2236, costNoir: 1565, sellMin: 1999, sellMax: 2599 },
  { code: 'ATL-2S-H', design: 'ملكي',  size: 'Single', fixation: 'معلّق',  costBeige: 976,  costNoir: 683,  sellMin: 1499, sellMax: 1899 },
  { code: 'ATL-2B-H', design: 'ملكي',  size: 'Double', fixation: 'معلّق',  costBeige: 1715, costNoir: 1200, sellMin: 1999, sellMax: 2599 },
  { code: 'ATL-2S-C', design: 'ملكي',  size: 'Single', fixation: 'أعمدة',  costBeige: 1354, costNoir: 948,  sellMin: 1999, sellMax: 2399 },
  { code: 'ATL-2B-C', design: 'ملكي',  size: 'Double', fixation: 'أعمدة',  costBeige: 2160, costNoir: 1512, sellMin: 2399, sellMax: 2999 },
  { code: 'ATL-3S-H', design: 'نيوم',  size: 'Single', fixation: 'معلّق',  costBeige: 670,  costNoir: 469,  sellMin: 999,  sellMax: 999  },
  { code: 'ATL-3B-H', design: 'نيوم',  size: 'Double', fixation: 'معلّق',  costBeige: 1090, costNoir: 763,  sellMin: 1299, sellMax: 1699 },
  { code: 'ATL-3S-C', design: 'نيوم',  size: 'Single', fixation: 'أعمدة',  costBeige: 1140, costNoir: 798,  sellMin: 1299, sellMax: 1699 },
  { code: 'ATL-3B-C', design: 'نيوم',  size: 'Double', fixation: 'أعمدة',  costBeige: 2080, costNoir: 1456, sellMin: 1899, sellMax: 2599 },
];

const Catalogue = () => {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    apiFetch('/admin/requests').then(d => setRequests(normalizeRequestList(d))).catch(() => setRequests(normalizeRequestList(MOCK_REQUESTS)));
  }, []);

  // عدد الطلبات لكل موديل
  const ordersByCode = requests.reduce((acc, r) => {
    const design = String(r.designType || '').toLowerCase();
    const size   = String(r.sizeInfo  || '').toLowerCase();
    const fix    = String(r.fixationType || '').toLowerCase();
    let code = null;
    if (design.includes('sahra') || design.includes('صحراء')) {
      code = size.includes('double') || size.includes('كبير') ? 'ATL-1B' : 'ATL-1S';
    } else if (design.includes('malaki') || design.includes('ملكي')) {
      const isDouble = size.includes('double') || size.includes('كبير');
      const isWall   = fix.includes('wall') || fix.includes('mural') || fix.includes('معلق');
      code = isDouble ? (isWall ? 'ATL-2B-H' : 'ATL-2B-C') : (isWall ? 'ATL-2S-H' : 'ATL-2S-C');
    } else if (design.includes('neom') || design.includes('نيوم')) {
      const isDouble = size.includes('double') || size.includes('كبير');
      const isWall   = fix.includes('wall') || fix.includes('mural') || fix.includes('معلق');
      code = isDouble ? (isWall ? 'ATL-3B-H' : 'ATL-3B-C') : (isWall ? 'ATL-3S-H' : 'ATL-3S-C');
    }
    if (code) acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">الكتالوج والتسعير</h2>
        <span className="text-xs text-gray-400">{CATALOGUE_PRODUCTS.length} موديلات</span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-600 flex-shrink-0">info</span>
        <div>
          <p className="text-xs font-semibold text-amber-800">مرجع التسعير الرسمي</p>
          <p className="text-[11px] text-amber-700 mt-0.5">الأسعار المعروضة هي نطاق الأسعار الافتراضي. السعر النهائي يُحدد بعد زيارة الموقع ورفع القياسات.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-3">الكود</th>
              <th className="px-4 py-3">التصميم</th>
              <th className="px-4 py-3">الحجم</th>
              <th className="px-4 py-3">التثبيت</th>
              <th className="px-4 py-3">الأعلى جودة الضمان 38 شهر</th>
              <th className="px-4 py-3">الأقل جودة الضمان سنة</th>
              <th className="px-4 py-3">أدنى سعر بيع</th>
              <th className="px-4 py-3">أعلى سعر بيع</th>
              <th className="px-4 py-3">هامش - Version noire</th>
              <th className="px-4 py-3">طلبات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {CATALOGUE_PRODUCTS.map((p, i) => {
              const marginPct = Math.round(((p.sellMin - p.costNoir) / p.sellMin) * 100);
              const orderCount = ordersByCode[p.code] || 0;
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 font-bold">{p.code}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{p.design}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{p.size}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{p.fixation}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatCurrency(p.costBeige)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{formatCurrency(p.costNoir)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-700">{formatCurrency(p.sellMin)}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-emerald-700">{formatCurrency(p.sellMax)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${marginPct >= 40 ? 'bg-green-100 text-green-700' : marginPct >= 20 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                      {marginPct}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {orderCount > 0
                      ? <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{formatNumber(orderCount)}</span>
                      : <span className="text-xs text-gray-300">—</span>
                    }
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

// ── GeoAnalytics ──────────────────────────────────────────────────
const GEO_GOLD   = '#D4AF37';
const GEO_GOLD2  = '#f0d060';
const GEO_DARK   = '#0d0d0f';
const GEO_PANEL  = 'rgba(18,16,14,0.82)';
const GEO_BORDER = 'rgba(212,175,55,0.25)';

// Haversine distance in km between two lat/lng points
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Cluster geo-tagged requests into zones (~2km grid cells)
const GRID = 0.018;
const clusterRequests = (reqs) => {
  const cells = {};
  reqs.forEach(r => {
    if (!r.latitude || !r.longitude) return;
    const key = `${Math.round(r.latitude / GRID) * GRID},${Math.round(r.longitude / GRID) * GRID}`;
    if (!cells[key]) cells[key] = { count: 0, revenue: 0, lat: 0, lng: 0, reqs: [] };
    cells[key].count++;
    cells[key].revenue += r.estimatedPrice || 0;
    cells[key].lat += r.latitude;
    cells[key].lng += r.longitude;
    cells[key].reqs.push(r);
  });
  return Object.values(cells).map(c => {
    const lat = c.lat / c.count;
    const lng = c.lng / c.count;
    // Zone name: first segment of the address, or client name, or coordinates
    const raw = c.reqs[0]?.address || '';
    const name = raw.split(/[،,]/)[0].trim() || c.reqs[0]?.clientName || `${lat.toFixed(2)}°N`;
    return { lat, lng, orders: c.count, revenue: c.revenue, name, reqs: c.reqs };
  }).sort((a, b) => b.orders - a.orders);
};

// Embeddable section (receives requests as prop, used inside Overview)
const GeoMapSection = ({ requests = [], loading = false }) => {
  const [activeZone, setActiveZone] = useState(null);
  const mapRef  = React.useRef(null);
  const heatRef = React.useRef(null);

  // ── Dynamic derived data ──────────────────────────────────────────
  const geoReqs   = useMemo(() => requests.filter(r => r.latitude && r.longitude), [requests]);
  const zones     = useMemo(() => clusterRequests(geoReqs), [geoReqs]);
  const top3      = zones.slice(0, 3);
  const maxOrders = zones.length ? zones[0].orders : 1;
  const totalOrders = requests.length;
  const geoTotal    = geoReqs.length;

  // Centroid of all geoTagged points
  const centroid = useMemo(() => {
    if (!geoReqs.length) return { lat: 24.774, lng: 46.650 };
    return { lat: geoReqs.reduce((s,r) => s + r.latitude, 0) / geoReqs.length,
             lng: geoReqs.reduce((s,r) => s + r.longitude, 0) / geoReqs.length };
  }, [geoReqs]);

  // Average delivery radius (km from centroid)
  const avgRadius = useMemo(() => {
    if (!geoReqs.length) return 0;
    const dists = geoReqs.map(r => haversine(centroid.lat, centroid.lng, r.latitude, r.longitude));
    return Math.round(dists.reduce((s,d) => s+d, 0) / dists.length);
  }, [geoReqs, centroid]);

  // Estimated travel time (30 km/h avg urban speed)
  const avgTravelMin = avgRadius ? Math.round((avgRadius / 30) * 60) : 0;

  // AI insight generated from real data
  const aiInsight = useMemo(() => {
    if (!zones.length) return 'لا توجد بيانات جغرافية كافية لتوليد تحليل. أضف إحداثيات للطلبات لتفعيل هذه الميزة.';
    const top = zones[0];
    const topPct = Math.round((top.orders / totalOrders) * 100);
    const suggestion = avgRadius > 20
      ? `فرصة مقترحة: نقطة تخزين محلية قرب ${top.name} لخفض متوسط مسافة التوصيل (${avgRadius} كم) بنسبة تقديرية 15–20٪.`
      : `التوزيع الجغرافي ممتاز — متوسط نطاق التوصيل (${avgRadius} كم) ضمن النطاق الأمثل.`;
    return `تركّز عالٍ في منطقة ${top.name} يمثّل ${topPct}٪ من إجمالي الطلبات المُعرَّفة جغرافياً (${geoTotal} طلب). ${suggestion}`;
  }, [zones, totalOrders, geoTotal, avgRadius]);

  // Heatmap layer via Leaflet.heat
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null; }
    if (!geoReqs.length || !window.L?.heatLayer) return;
    const pts = geoReqs.map(r => [r.latitude, r.longitude, 0.7]);
    heatRef.current = window.L.heatLayer(pts, {
      radius: 50, blur: 40, maxZoom: 13,
      gradient: { 0: 'transparent', 0.4: '#7a5c00', 0.7: '#c49b00', 1: '#D4AF37' },
    }).addTo(map);
  }, [geoReqs]);

  const styleTag = `
    @keyframes geo-pulse { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.5);opacity:0} }
    .geo-card { backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px); }
    .leaflet-container { background:#0d0d0f !important; }
  `;

  const mapCenter = [centroid.lat, centroid.lng];

  return (
    <div className="mt-8" dir="rtl" style={{ fontFamily:"'Cairo',sans-serif" }}>
      <style>{styleTag}</style>

      {/* Section header */}
      <div className="flex items-center justify-between mb-5" style={{ borderBottom:'1px solid rgba(212,175,55,0.15)', paddingBottom:16 }}>
        <div className="flex items-center gap-3">
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1a1500,#2a2000)', border:'1px solid rgba(212,175,55,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize:18, color:GEO_GOLD }}>travel_explore</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900" style={{ margin:0 }}>خريطة التوزيع الجغرافي للطلبات</h2>
            <p className="text-xs text-gray-400" style={{ margin:0 }}>
              {loading ? 'جارٍ تحميل البيانات…' : geoTotal ? `${geoTotal} طلب بإحداثيات — ${zones.length} منطقة نشطة` : 'لا توجد بيانات جغرافية بعد'}
            </p>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[
            { icon:'my_location', label:avgRadius ? `${avgRadius} كم` : '—', sub:'نطاق التوصيل' },
            { icon:'schedule',    label:avgTravelMin ? `${avgTravelMin} د` : '—', sub:'وقت التنقل' },
            { icon:'location_city', label:zones.length || '—', sub:'مناطق نشطة' },
          ].map((k,i) => (
            <div key={i} style={{ background:'rgba(212,175,55,0.06)', border:'1px solid rgba(212,175,55,0.18)', borderRadius:12, padding:'8px 14px', textAlign:'center', minWidth:90 }}>
              <span className="material-symbols-outlined" style={{ color:GEO_GOLD, fontSize:14, display:'block' }}>{k.icon}</span>
              <p style={{ fontSize:14, fontWeight:800, color:'#1a1a1a', margin:'1px 0 0' }}>{k.label}</p>
              <p style={{ fontSize:9, color:'#999', margin:0 }}>{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {!loading && !geoReqs.length && (
        <div style={{ background:'rgba(212,175,55,0.04)', border:'1px dashed rgba(212,175,55,0.2)', borderRadius:16, padding:32, textAlign:'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize:40, color:GEO_GOLD, opacity:.3, display:'block', marginBottom:10 }}>location_off</span>
          <p style={{ color:'#aaa', fontSize:13, margin:0 }}>لا توجد طلبات بإحداثيات جغرافية بعد.</p>
          <p style={{ color:'#ccc', fontSize:11, marginTop:4 }}>ستظهر البيانات تلقائياً عند تحديد الموقع في نموذج الطلب.</p>
        </div>
      )}

      {/* Main grid */}
      {(geoReqs.length > 0 || loading) && (
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, alignItems:'start' }}>

        {/* Map */}
        <div style={{ border:'1px solid rgba(212,175,55,0.2)', borderRadius:16, overflow:'hidden', height:420, position:'relative', boxShadow:'0 4px 24px rgba(0,0,0,0.08)' }}>
          <MapContainer
            key={`${mapCenter[0]},${mapCenter[1]}`}
            center={mapCenter} zoom={geoReqs.length ? 12 : 11}
            style={{ width:'100%', height:'100%' }}
            zoomControl={false}
            whenReady={(e) => { mapRef.current = e.target; }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; CARTO'
              maxZoom={19}
            />

            {/* Cluster zone markers */}
            {zones.map((z, i) => {
              const sz = 10 + Math.round((z.orders / maxOrders) * 30);
              return (
                <Marker
                  key={`zone-${i}`}
                  position={[z.lat, z.lng]}
                  icon={window.L ? window.L.divIcon({
                    html: `<div style="
                      width:${sz}px;height:${sz}px;border-radius:50%;
                      background:radial-gradient(circle at 35% 35%,#f0d060,#D4AF37);
                      border:2px solid rgba(255,255,255,0.5);
                      box-shadow:0 0 ${sz}px #D4AF3799,0 0 ${sz*2}px #D4AF3744;
                      ${z.orders >= 3 ? 'animation:geo-pulse 2.5s ease-out infinite;' : ''}
                      display:flex;align-items:center;justify-content:center;
                      font-size:${sz > 22 ? 10 : 8}px;font-weight:800;color:#3a2800;
                    ">${z.orders > 1 ? z.orders : ''}</div>`,
                    className:'', iconSize:[sz,sz], iconAnchor:[sz/2,sz/2],
                  }) : undefined}
                  eventHandlers={{ click:() => setActiveZone(z), mouseover:() => setActiveZone(z) }}
                >
                  <Popup>
                    <div style={{ fontFamily:"'Cairo',sans-serif", direction:'rtl', minWidth:150 }}>
                      <p style={{ fontWeight:800, marginBottom:4, color:'#1a1400', fontSize:13 }}>{z.name}</p>
                      <p style={{ fontSize:11, margin:'2px 0', color:'#555' }}>الطلبات: <b style={{ color:'#D4AF37' }}>{z.orders}</b></p>
                      <p style={{ fontSize:11, margin:0, color:'#555' }}>الإيرادات: <b>{formatCurrency(z.revenue)}</b></p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Individual client dots */}
            {geoReqs.map((r, i) => (
              <Marker
                key={`req-${i}`}
                position={[r.latitude, r.longitude]}
                icon={window.L ? window.L.divIcon({
                  html:`<div style="width:7px;height:7px;border-radius:50%;background:#fff;border:1.5px solid #D4AF37;box-shadow:0 0 5px #D4AF3766;"></div>`,
                  className:'', iconSize:[7,7], iconAnchor:[3.5,3.5],
                }) : undefined}
              >
                <Popup>
                  <div style={{ fontFamily:"'Cairo',sans-serif", direction:'rtl', fontSize:12 }}>
                    <b style={{ color:'#1a1400' }}>{r.clientName || '—'}</b>
                    <p style={{ margin:'2px 0 0', color:'#888', fontSize:10 }}>{r.confirmationNumber}</p>
                    {r.address && <p style={{ margin:'2px 0 0', color:'#aaa', fontSize:10 }}>{r.address}</p>}
                    {r.estimatedPrice && <p style={{ margin:'4px 0 0', color:'#D4AF37', fontWeight:700, fontSize:11 }}>{formatCurrency(r.estimatedPrice)}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Legend */}
          <div style={{ position:'absolute', bottom:16, left:16, zIndex:800, background:'rgba(13,13,15,0.88)', backdropFilter:'blur(12px)', border:`1px solid ${GEO_BORDER}`, borderRadius:12, padding:'10px 14px' }}>
            <p style={{ fontSize:9, color:GEO_GOLD, fontWeight:700, letterSpacing:1, marginBottom:8 }}>المفتاح</p>
            {[
              { color:GEO_GOLD, size:20, label:'منطقة — حجم كبير' },
              { color:GEO_GOLD, size:12, label:'منطقة — حجم متوسط' },
              { color:'#fff',   size:7,  label:'طلب فردي' },
            ].map((l,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:i<2?5:0 }}>
                <div style={{ width:l.size, height:l.size, borderRadius:'50%', background:l.color, border:'1.5px solid rgba(255,255,255,0.35)', boxShadow:`0 0 ${l.size}px ${l.color}88`, flexShrink:0 }} />
                <span style={{ fontSize:10, color:'rgba(255,255,255,0.5)' }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

          {/* Top Zones */}
          <div style={{ background:'#fff', border:'1px solid #f0e8cc', borderRadius:14, padding:'16px 18px', boxShadow:'0 1px 8px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize:11, color:GEO_GOLD, fontWeight:700, letterSpacing:.8, marginBottom:12 }}>
              <span className="material-symbols-outlined" style={{ fontSize:13, verticalAlign:'middle', marginLeft:5 }}>emoji_events</span>
              المناطق الأكثر نشاطاً
            </p>
            {top3.length === 0 && <p style={{ fontSize:11, color:'#ccc', textAlign:'center', margin:'10px 0' }}>لا بيانات بعد</p>}
            {top3.map((z, i) => {
              const pct = Math.round((z.orders / top3[0].orders) * 100);
              return (
                <div key={z.name} style={{ marginBottom: i < top3.length-1 ? 12 : 0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontSize:12, color:'#444', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {['🥇','🥈','🥉'][i]} {z.name}
                    </span>
                    <div>
                      <span style={{ fontSize:13, fontWeight:800, color:GEO_GOLD }}>{z.orders}</span>
                      <span style={{ fontSize:9, color:'#bbb', marginRight:3 }}>طلب</span>
                    </div>
                  </div>
                  <div style={{ height:3, borderRadius:99, background:'#f3f3f3' }}>
                    <div style={{ height:'100%', borderRadius:99, width:`${pct}%`, background:`linear-gradient(90deg,${GEO_GOLD},${GEO_GOLD2})`, transition:'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Zone detail on click */}
          {activeZone && (
            <div style={{ background:'linear-gradient(135deg,#fdf8ec,#fffdf5)', border:`1px solid ${GEO_GOLD}44`, borderRadius:14, padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <p style={{ fontSize:13, fontWeight:800, color:'#1a1400', margin:0 }}>{activeZone.name}</p>
                <button onClick={() => setActiveZone(null)} style={{ background:'none', border:'none', color:'#ccc', cursor:'pointer', padding:0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize:15 }}>close</span>
                </button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10 }}>
                {[
                  { label:'الطلبات',       value: activeZone.orders },
                  { label:'الإيرادات',     value: formatCurrency(activeZone.revenue) },
                  { label:'الحصة السوقية', value: `${totalOrders ? Math.round((activeZone.orders/totalOrders)*100) : 0}٪` },
                  { label:'التصنيف',       value: `#${zones.findIndex(z=>z.lat===activeZone.lat&&z.lng===activeZone.lng)+1}` },
                ].map((kpi,i) => (
                  <div key={i} style={{ background:'rgba(212,175,55,0.07)', borderRadius:8, padding:'7px 10px' }}>
                    <p style={{ fontSize:9, color:'#999', margin:'0 0 2px' }}>{kpi.label}</p>
                    <p style={{ fontSize:13, fontWeight:800, color:GEO_GOLD, margin:0 }}>{kpi.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insight */}
          <div style={{ background:'linear-gradient(135deg,#fdf9ed,#fffef8)', border:`1px solid ${GEO_GOLD}33`, borderRadius:14, padding:'16px 18px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${GEO_GOLD}22,${GEO_GOLD}08)`, border:`1px solid ${GEO_GOLD}33`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span className="material-symbols-outlined" style={{ fontSize:14, color:GEO_GOLD }}>auto_awesome</span>
              </div>
              <div>
                <p style={{ fontSize:10, color:GEO_GOLD, fontWeight:700, margin:0 }}>تحليل تلقائي</p>
                <p style={{ fontSize:9, color:'#bbb', margin:0 }}>{geoTotal} طلب بإحداثيات</p>
              </div>
            </div>
            <p style={{ fontSize:11, lineHeight:1.85, color:'#555', margin:0 }}>{aiInsight}</p>
            {avgRadius > 20 && (
              <div style={{ marginTop:12, padding:'7px 10px', borderRadius:8, background:`${GEO_GOLD}0d`, border:`1px solid ${GEO_GOLD}1a`, display:'flex', alignItems:'center', gap:6 }}>
                <span className="material-symbols-outlined" style={{ fontSize:13, color:GEO_GOLD }}>trending_down</span>
                <p style={{ fontSize:10, color:GEO_GOLD, margin:0, fontWeight:600 }}>توفير لوجستي متوقع: ~15–20٪</p>
              </div>
            )}
          </div>
        </div>
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
      .then(d => {
        if (d.success) {
          localStorage.setItem(ADMIN_AUTH_KEY,    '1');
          localStorage.setItem(ADMIN_AUTH_TS_KEY, String(Date.now()));
          localStorage.setItem(ADMIN_ID_KEY,      String(d.id    || ''));
          localStorage.setItem(ADMIN_ROLE_KEY,    d.role          || 'EDITOR');
          localStorage.setItem(ADMIN_NAME_KEY,    d.fullName      || '');
          localStorage.setItem(ADMIN_TITLE_KEY,   d.title         || '');
          localStorage.setItem(ADMIN_EMAIL_KEY,   d.email         || '');
          onSuccess();
        } else {
          setError(d.message || 'بيانات غير صحيحة');
        }
      })
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
  const [auth,        setAuth]        = useState(() => hasValidAdminSession());
  const [currentUser, setCurrentUser] = useState(() => hasValidAdminSession() ? getStoredUser() : null);

  useEffect(() => {
    if (!auth) return;
    if (!hasValidAdminSession()) {
      clearSession();
      setAuth(false);
      setCurrentUser(null);
    }
  }, [auth]);

  const handleLogout = () => {
    clearSession();
    setAuth(false);
    setCurrentUser(null);
  };

  const handleLoginSuccess = () => {
    setCurrentUser(getStoredUser());
    setAuth(true);
  };

  if (!auth) return <Login onSuccess={handleLoginSuccess} />;

  return (
    <UserContext.Provider value={currentUser}>
      <AdminLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/"          element={<Overview />} />
          <Route path="/requests"  element={<Requests />} />
          <Route path="/pipeline"  element={<Pipeline />} />
          <Route path="/calendar"  element={<Calendar />} />
          <Route path="/clients"   element={<Clients />} />
          <Route path="/loyalty"    element={<Loyalty />} />
          <Route path="/catalogue"  element={<Catalogue />} />
          <Route path="/reports"    element={<Reports />} />
          <Route path="/settings"   element={<Settings />} />
          <Route path="*"          element={<div className="text-gray-300 text-center py-20 text-sm">الصفحة غير موجودة</div>} />
        </Routes>
      </AdminLayout>
    </UserContext.Provider>
  );
}
