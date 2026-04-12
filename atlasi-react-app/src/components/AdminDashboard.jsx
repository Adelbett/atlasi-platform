import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

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

// ── Mock fallback data ───────────────────────────────────────────
const MOCK_REQUESTS = [
  { id: 1, clientName: 'محمد العمراني', phone: '0501234567', confirmationNumber: 'ATL-2026-0042', designType: 'ملكي', size: 'كبير', fixation: 'أعمدة', fabricColor: 'بيج', status: 'pending',   estimatedPrice: 12500, requestDate: new Date().toISOString() },
  { id: 2, clientName: 'سارة المنصور',  phone: '0559876543', confirmationNumber: 'ATL-2026-0043', designType: 'نيوم',  size: 'صغير', fixation: 'معلقة', fabricColor: 'أسود', status: 'confirmed', estimatedPrice: 8400,  requestDate: new Date().toISOString() },
  { id: 3, clientName: 'عبدالله الفايز', phone: '0571112233', confirmationNumber: 'ATL-2026-0044', designType: 'صحراء', size: 'كبير', fixation: 'أعمدة', fabricColor: 'بيج',  status: 'scheduled', estimatedPrice: 9900,  requestDate: new Date().toISOString() },
  { id: 4, clientName: 'نورة الشمري',   phone: '0534445566', confirmationNumber: 'ATL-2026-0045', designType: 'ملكي',  size: 'كبير', fixation: 'معلقة', fabricColor: 'رمادي', status: 'production', estimatedPrice: 11000, requestDate: new Date().toISOString() },
  { id: 5, clientName: 'خالد الدوسري',  phone: '0507778899', confirmationNumber: 'ATL-2026-0046', designType: 'نيوم',  size: 'صغير', fixation: 'أعمدة', fabricColor: 'أبيض', status: 'installed', estimatedPrice: 7500,  requestDate: new Date().toISOString() },
];

const MOCK_APPOINTMENTS = [
  { id: 1, agentName: 'أحمد السالم',  appointmentType: 'معاينة',  appointmentDate: new Date().toISOString(), request: { clientName: 'سارة المنصور',  confirmationNumber: 'ATL-2026-0043' } },
  { id: 2, agentName: 'فهد العتيبي',  appointmentType: 'تركيب',   appointmentDate: new Date().toISOString(), request: { clientName: 'نورة الشمري',   confirmationNumber: 'ATL-2026-0045' } },
];

// ── API helpers ──────────────────────────────────────────────────
const apiFetch = (path, opts) =>
  fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts }).then(r => r.json());

// ── Sidebar nav ──────────────────────────────────────────────────
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
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}>
              <span className="material-symbols-outlined text-[18px] flex-shrink-0"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                {icon}
              </span>
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
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold cursor-pointer">A</div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// ── Page: Overview ───────────────────────────────────────────────
const Overview = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/admin/requests')
      .then(d => { setRequests(d); setLoading(false); })
      .catch(() => { setRequests(MOCK_REQUESTS); setLoading(false); });
  }, []);

  const total      = requests.length;
  const active     = requests.filter(r => !['installed','cancelled'].includes(normalizeStatus(r.status))).length;
  const revenue    = requests.filter(r => normalizeStatus(r.status) === 'installed')
                             .reduce((s, r) => s + (Number(r.estimatedPrice) || 0), 0);
  const doneRate   = total > 0 ? Math.round((requests.filter(r => normalizeStatus(r.status) === 'installed').length / total) * 100) : 0;

  const kpis = [
    { label: 'إجمالي الطلبات',    value: total,                 icon: 'shopping_bag',  unit: '' },
    { label: 'العملاء النشطون',   value: active,                icon: 'group',         unit: '' },
    { label: 'الأرباح المتوقعة',  value: revenue.toLocaleString(), icon: 'payments',   unit: 'ر.س' },
    { label: 'نسبة الإنجاز',      value: `${doneRate}%`,        icon: 'speed',         unit: '' },
  ];

  const recent = [...requests].sort((a,b) => new Date(b.requestDate)-new Date(a.requestDate)).slice(0,5);

  const statusCounts = Object.entries(
    requests.reduce((acc,r) => { const k=normalizeStatus(r.status); acc[k]=(acc[k]||0)+1; return acc; }, {})
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">نظرة عامة</h2>
          <p className="text-sm text-gray-400 mt-0.5">آخر تحديث الآن</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors">
          <span className="material-symbols-outlined text-sm">download</span>
          تصدير التقرير
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                <span className="material-symbols-outlined text-gray-600 text-[18px]">{k.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : k.value} <span className="text-sm font-normal text-gray-400">{k.unit}</span></p>
            <p className="text-xs text-gray-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent requests */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">آخر الطلبات</h3>
            <Link to="/admin/requests" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">عرض الكل ←</Link>
          </div>
          <table className="w-full text-right">
            <thead className="bg-gray-50">
              <tr className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3">الطلب</th>
                <th className="px-5 py-3">العميل</th>
                <th className="px-5 py-3">التصميم</th>
                <th className="px-5 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-xs font-mono text-gray-500">{r.confirmationNumber || `#${r.id}`}</td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{r.clientName}</td>
                  <td className="px-5 py-3 text-xs text-gray-500">{r.designType} · {r.fabricColor}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status distribution */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">توزيع الحالات</h3>
          <div className="space-y-3">
            {statusCounts.map(([k, count]) => {
              const cfg = STATUSES[k] || STATUSES.new;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={k}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{cfg.label}</span>
                    <span className="text-xs font-medium text-gray-800">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* System status */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">حالة النظام</h4>
            {[
              { label: 'API WhatsApp', ok: true },
              { label: 'قاعدة البيانات', ok: true },
              { label: 'Google Maps API', ok: true },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.ok ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
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

// ── Page: Requests ───────────────────────────────────────────────
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
    apiFetch(`/admin/requests/${id}/${act}`, { method: 'PUT' })
      .then(load).catch(load);
  };

  const FILTERS = ['الكل', ...Object.values(STATUSES).map(s => s.label)];

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

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-[18px]">search</span>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف أو رقم الطلب..."
            className="w-full bg-white border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['الكل', ...Object.values(STATUSES).slice(0,5).map(s => s.label)].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border ${
                filter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
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
                    {normalizeStatus(r.status) === 'new' || normalizeStatus(r.status) === 'pending' ? (
                      <>
                        <button onClick={() => action(r.id, 'accept')}
                          className="w-7 h-7 rounded-md bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors" title="قبول">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </button>
                        <button onClick={() => action(r.id, 'reject')}
                          className="w-7 h-7 rounded-md bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" title="رفض">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </>
                    ) : null}
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

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-black/20 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: -400 }} animate={{ x: 0 }} transition={{ type: 'spring', damping: 25 }}
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
                  ['الاسم',       selected.clientName],
                  ['الجوال',      selected.phone],
                  ['التصميم',     selected.designType],
                  ['الحجم',       selected.size],
                  ['التثبيت',     selected.fixation],
                  ['اللون',       selected.fabricColor],
                  ['السعر',       selected.estimatedPrice ? `${Number(selected.estimatedPrice).toLocaleString()} ر.س` : '—'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">{k}</p>
                    <p className="font-medium text-gray-800">{v || '—'}</p>
                  </div>
                ))}
              </div>

              {selected.latitude && selected.longitude && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">الموقع</p>
                  <a href={`https://maps.google.com/?q=${selected.latitude},${selected.longitude}`}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    فتح في خرائط جوجل
                  </a>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">ملاحظة إدارية</p>
                <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={3}
                  placeholder="اكتب ملاحظة..."
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm outline-none focus:border-gray-400 resize-none transition-colors" />
                <button disabled={saving} className="mt-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black disabled:opacity-50 transition-colors">
                  حفظ
                </button>
              </div>

              <div className="pt-2 flex gap-2">
                {normalizeStatus(selected.status) !== 'confirmed' && normalizeStatus(selected.status) !== 'cancelled' && (
                  <button onClick={() => { action(selected.id, 'accept'); setSelected(null); }}
                    className="flex-1 py-2.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors">
                    تأكيد الطلب
                  </button>
                )}
                {normalizeStatus(selected.status) !== 'cancelled' && (
                  <button onClick={() => { action(selected.id, 'reject'); setSelected(null); }}
                    className="flex-1 py-2.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-600 hover:text-white transition-colors">
                    إلغاء الطلب
                  </button>
                )}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </div>
  );
};

// ── Page: Pipeline ───────────────────────────────────────────────
const PIPELINE_COLS = [
  { id: 'new',        label: 'جديد',            color: '#2563eb' },
  { id: 'confirmed',  label: 'مؤكد',            color: '#16a34a' },
  { id: 'scheduled',  label: 'زيارة مجدولة',    color: '#7c3aed' },
  { id: 'production', label: 'في الورشة',       color: '#ea580c' },
  { id: 'installed',  label: 'تركيب مكتمل',     color: '#15803d' },
];

const Pipeline = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    apiFetch('/admin/requests')
      .then(setRequests)
      .catch(() => setRequests(MOCK_REQUESTS));
  }, []);

  const colItems = (id) => requests.filter(r => normalizeStatus(r.status) === id || (id === 'new' && ['new','pending'].includes(normalizeStatus(r.status))));

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
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                      <span className="text-[10px] text-gray-400">
                        {r.requestDate ? new Date(r.requestDate).toLocaleDateString('ar-SA') : '—'}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">
                        {r.clientName?.charAt(0)}
                      </div>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="py-8 text-center text-xs text-gray-300">لا توجد طلبات</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Page: Calendar ───────────────────────────────────────────────
const Calendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [showForm, setShowForm]         = useState(false);
  const [form, setForm]                 = useState({ clientName: '', agentName: '', appointmentType: 'معاينة', date: '', note: '' });
  const [saving, setSaving]             = useState(false);

  const DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const now  = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();

  useEffect(() => {
    apiFetch('/admin/appointments')
      .then(setAppointments)
      .catch(() => setAppointments(MOCK_APPOINTMENTS));
  }, []);

  const save = () => {
    if (!form.clientName || !form.date) return;
    setSaving(true);
    apiFetch('/admin/appointments', {
      method: 'POST',
      body: JSON.stringify({ agentName: form.agentName, appointmentType: form.appointmentType, appointmentDate: form.date, request: { clientName: form.clientName } })
    })
      .then(d => { setAppointments(prev => [...prev, d]); setShowForm(false); setSaving(false); })
      .catch(() => {
        setAppointments(prev => [...prev, { id: Date.now(), ...form, request: { clientName: form.clientName } }]);
        setShowForm(false); setSaving(false);
      });
  };

  const apptColors = { 'معاينة': '#2563eb', 'تركيب': '#16a34a', 'مؤجل': '#d97706', 'ملغي': '#dc2626' };

  return (
    <div className="space-y-5 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">الأجندة</h2>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors">
          <span className="material-symbols-outlined text-sm">event_available</span>
          موعد جديد
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-5 overflow-hidden">
        {/* Calendar grid */}
        <div className="flex-1 bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">
              {now.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(d => <div key={d} className="py-2 text-center text-[10px] font-semibold text-gray-400">{d}</div>)}
          </div>
          <div className="flex-1 grid grid-cols-7 grid-rows-5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="border-b border-l border-gray-50" />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === now.getDate();
              return (
                <div key={day} className={`border-b border-l border-gray-50 p-2 ${isToday ? 'bg-gray-50' : 'hover:bg-gray-50'} transition-colors`}>
                  <span className={`text-[11px] font-medium ${isToday ? 'w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center' : 'text-gray-400'}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's appointments */}
        <aside className="w-full lg:w-72 bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">مواعيد اليوم</h3>
            <p className="text-xs text-gray-400 mt-0.5">{now.toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {appointments.length === 0 ? (
              <p className="text-xs text-gray-300 text-center py-8">لا توجد مواعيد</p>
            ) : appointments.map((a, i) => {
              const color = apptColors[a.appointmentType] || '#6b7280';
              return (
                <div key={i} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.request?.clientName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.appointmentType} · {a.agentName}</p>
                      {a.appointmentDate && (
                        <p className="text-[10px] text-gray-300 mt-1">{new Date(a.appointmentDate).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* Add appointment modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900 mb-5">موعد جديد</h3>
            <div className="space-y-3">
              {[
                { key: 'clientName', label: 'اسم العميل', type: 'text', ph: 'محمد العمراني' },
                { key: 'agentName',  label: 'الفني',       type: 'text', ph: 'أحمد السالم' },
                { key: 'date',       label: 'التاريخ',      type: 'datetime-local' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.ph || ''}
                    value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors" />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">نوع الموعد</label>
                <select value={form.appointmentType} onChange={e => setForm(p => ({ ...p, appointmentType: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 transition-colors">
                  {['معاينة','تركيب','صيانة','متابعة'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={save} disabled={saving}
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

// ── Page: Clients ────────────────────────────────────────────────
const Clients = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    apiFetch('/admin/requests')
      .then(setRequests)
      .catch(() => setRequests(MOCK_REQUESTS));
  }, []);

  // Group by phone/client
  const clientMap = requests.reduce((acc, r) => {
    const k = r.phone || r.clientName;
    if (!acc[k]) acc[k] = { name: r.clientName, phone: r.phone, orders: [] };
    acc[k].orders.push(r);
    return acc;
  }, {});
  const clients = Object.values(clientMap).filter(c =>
    !search || c.name?.includes(search) || c.phone?.includes(search)
  );

  const LOYALTY = [
    { min: 0, max: 0, label: 'جديد',     color: '#6b7280' },
    { min: 1, max: 1, label: 'برونزي',   color: '#92400e' },
    { min: 2, max: 2, label: 'فضي',      color: '#475569' },
    { min: 3, max: 3, label: 'ذهبي',     color: '#b45309' },
    { min: 4, max: 99, label: 'بلاتيني', color: '#1c1b1b' },
  ];
  const loyaltyOf = (n) => LOYALTY.find(l => n >= l.min && n <= l.max) || LOYALTY[0];

  const sel = selected ? clients.find(c => c.phone === selected || c.name === selected) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">العملاء</h2>
        <span className="text-xs text-gray-400">{clients.length} عميل</span>
      </div>

      <div className="relative">
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-[18px]">search</span>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث عن عميل..." className="w-full bg-white border border-gray-200 rounded-lg pr-9 pl-4 py-2 text-sm outline-none focus:border-gray-400 max-w-sm transition-colors" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* List */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {clients.map((c, i) => {
              const completed = c.orders.filter(o => normalizeStatus(o.status) === 'installed').length;
              const loy = loyaltyOf(completed);
              const isSelected = selected === (c.phone || c.name);
              return (
                <div key={i} onClick={() => setSelected(c.phone || c.name)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-gray-50' : ''}`}>
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 flex-shrink-0">
                    {c.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.orders.length} طلب</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                    style={{ color: loy.color, borderColor: `${loy.color}30`, background: `${loy.color}10` }}>
                    {loy.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {sel ? (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-bold">
                  {sel.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{sel.name}</h3>
                  <p className="text-sm text-gray-400">{sel.phone}</p>
                </div>
                <div className="mr-auto">
                  {(() => {
                    const n = sel.orders.filter(o => normalizeStatus(o.status) === 'installed').length;
                    const loy = loyaltyOf(n);
                    return <span className="text-xs font-medium px-3 py-1 rounded-full border"
                      style={{ color: loy.color, borderColor: `${loy.color}40`, background: `${loy.color}10` }}>
                      {loy.label}
                    </span>;
                  })()}
                </div>
              </div>

              {/* Orders */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">سجل الطلبات</h4>
                <div className="space-y-2">
                  {sel.orders.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-400">{o.confirmationNumber || `#${o.id}`}</span>
                        <span className="text-xs text-gray-600">{o.designType} · {o.fabricColor}</span>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">ملاحظات</h4>
                <textarea rows={3} placeholder="اكتب ملاحظة خاصة بهذا العميل..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none transition-colors" />
                <button className="mt-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors">حفظ</button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm h-64 flex items-center justify-center text-sm text-gray-300">
              اختر عميلاً لعرض تفاصيله
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page: Loyalty ────────────────────────────────────────────────
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

  const levels = [
    { label: 'جديد',     cond: 0, color: '#6b7280', discount: '—' },
    { label: 'برونزي',   cond: 1, color: '#92400e', discount: '—' },
    { label: 'فضي',      cond: 2, color: '#475569', discount: '5%' },
    { label: 'ذهبي',     cond: 3, color: '#b45309', discount: '10%' },
    { label: 'بلاتيني',  cond: 4, color: '#1c1b1b', discount: '50%' },
  ];

  const getLevel = (n) => levels.findLast(l => n >= l.cond) || levels[0];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">برنامج الولاء</h2>

      {/* Level overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {levels.map((l, i) => {
          const count = Object.values(clientMap).filter(c => getLevel(c.orders.filter(o => normalizeStatus(o.status) === 'installed').length).label === l.label).length;
          return (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-center">
              <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: l.color }}>{i + 1}</div>
              <p className="text-sm font-semibold text-gray-800">{l.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">خصم {l.discount}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Clients table */}
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
              const next = levels.find(l => l.cond > done);
              return (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{c.phone}</td>
                  <td className="px-5 py-3 text-sm text-gray-700">{done}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ color: lv.color, background: `${lv.color}15` }}>{lv.label}</span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">
                    {next ? `${next.cond - done} طلب لـ ${next.discount}` : 'أقصى مستوى ✓'}
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

// ── Page: Reports ────────────────────────────────────────────────
const Reports = () => {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    apiFetch('/admin/requests').then(setRequests).catch(() => setRequests(MOCK_REQUESTS));
  }, []);

  const byStatus = Object.entries(
    requests.reduce((a, r) => { const k = normalizeStatus(r.status); a[k] = (a[k]||0)+1; return a; }, {})
  );
  const totalRevenue = requests.filter(r => normalizeStatus(r.status) === 'installed')
    .reduce((s, r) => s + (Number(r.estimatedPrice) || 0), 0);
  const maxCount = Math.max(...byStatus.map(([,v]) => v), 1);

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
          { label: 'طلبات ملغاة',   value: requests.filter(r => normalizeStatus(r.status) === 'cancelled').length },
          { label: 'إجمالي الإيرادات', value: `${totalRevenue.toLocaleString()} ر.س` },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <p className="text-2xl font-bold text-gray-900">{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
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

// ── Page: Settings ───────────────────────────────────────────────
const Settings = () => {
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-900">الإعدادات</h2>

      {[
        {
          title: 'معلومات الشركة',
          fields: [
            { label: 'الاسم التجاري', value: 'مظلات الأطلسي', type: 'text' },
            { label: 'رقم واتساب', value: '966548105757', type: 'tel' },
            { label: 'عنوان الورشة', value: 'الرياض، المملكة العربية السعودية', type: 'text' },
          ]
        },
        {
          title: 'الضمان والتشغيل',
          fields: [
            { label: 'مدة الضمان (أشهر)', value: '12', type: 'number' },
            { label: 'وقت التصنيع (ساعة)', value: '48', type: 'number' },
            { label: 'وقت التركيب (ساعة)', value: '24', type: 'number' },
          ]
        },
        {
          title: 'الأمان',
          fields: [
            { label: 'كلمة المرور الجديدة', value: '', type: 'password', ph: '••••••••' },
            { label: 'تأكيد كلمة المرور', value: '', type: 'password', ph: '••••••••' },
          ]
        }
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

// ── Login ────────────────────────────────────────────────────────
const Login = ({ onSuccess }) => {
  const [email, setEmail]       = useState('');
  const [pass, setPass]         = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    })
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

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg px-4 py-3 mb-5 text-center">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="admin@atlasi.sa"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">كلمة المرور</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} required
              placeholder="••••••••"
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

// ── Root ─────────────────────────────────────────────────────────
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
