import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiInbox, FiCalendar, FiUsers, FiLayers, FiSettings,
  FiBell, FiSearch, FiCheck, FiX, FiMapPin, FiMoreVertical, FiEdit2, FiTrash2, FiUserPlus, FiSave, FiLock
} from 'react-icons/fi';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Dummy Data
const MOCK_REQUESTS = [
  { id: 'ATL-2024-0142', name: 'Ahmed Bensalem', design: 'Pyramidal', size: 'Grand SUV', fixation: 'Sur poteaux', color: 'Beige', date: '2024-04-08T10:30', status: 'En attente' },
  { id: 'ATL-2024-0143', name: 'Karim Z.', design: 'Console', size: 'Petit Sedan', fixation: 'Murale', color: 'Gris', date: '2024-04-07T14:15', status: 'Confirmée' },
  { id: 'ATL-2024-0144', name: 'Nadia R.', design: 'Arqué', size: 'Grand SUV', fixation: 'Sur poteaux', color: 'Noir', date: '2024-04-06T09:20', status: 'Visite planifiée' },
];

const COLORS = ['#16a34a', '#ef4444', '#f59e0b', '#3b82f6'];

const STATUS_AR = {
  pending: 'في الانتظار',
  confirmed: 'مؤكدة',
  cancelled: 'ملغاة',
  scheduled: 'زيارة مجدولة',
  measured: 'قياسات مأخوذة',
  production: 'في التصنيع',
  installed: 'تم التركيب'
};

const normalizeStatus = (raw) => {
  if (!raw) return STATUS_AR.pending;
  if (Object.values(STATUS_AR).includes(raw)) return raw;
  const lower = String(raw).toLowerCase();
  if (lower.includes('confirm')) return STATUS_AR.confirmed;
  if (lower.includes('annul') || lower.includes('cancel') || lower.includes('رفض')) return STATUS_AR.cancelled;
  if (lower.includes('visite') || lower.includes('schedul')) return STATUS_AR.scheduled;
  if (lower.includes('mesur')) return STATUS_AR.measured;
  if (lower.includes('atelier') || lower.includes('product')) return STATUS_AR.production;
  if (lower.includes('livrai') || lower.includes('termin') || lower.includes('install')) return STATUS_AR.installed;
  if (lower.includes('attente') || lower.includes('pending')) return STATUS_AR.pending;
  return raw;
};

const getLoyaltyLevel = (completedOrders) => {
  if (completedOrders === 0) return { level: 0, label: 'جديد', discount: 0 };
  if (completedOrders === 1) return { level: 1, label: '🛒 إصدار البطاقة', discount: 0 };
  if (completedOrders === 2) return { level: 2, label: '🥇 خصم 5%', discount: 0.05 };
  if (completedOrders === 3) return { level: 3, label: '🥈 خصم 5%', discount: 0.05 };
  if (completedOrders === 4) return { level: 4, label: '🥉 خصم 10%', discount: 0.10 };
  return { level: 5, label: '🏆 خصم 50%', discount: 0.50 };
};

// Layout Component
function AdminLayout({ children }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin', icon: <FiHome />, label: 'نظرة عامة' },
    { path: '/admin/requests', icon: <FiInbox />, label: 'الطلبات', badge: 3 },
    { path: '/admin/pipeline', icon: <FiLayers />, label: 'خط سير الطلبات' },
    { path: '/admin/calendar', icon: <FiCalendar />, label: 'التقويم', badge: 2 },
    { path: '/admin/clients', icon: <FiUsers />, label: 'العملاء' },
    { path: '/admin/settings', icon: <FiSettings />, label: 'الإعدادات' },
  ];

  return (
    <div dir="rtl" style={{ display: 'flex', height: '100vh', backgroundColor: '#F8F9FB', fontFamily: "var(--font-body)", color: '#1A1A1A' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#FFFFFF', borderLeft: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '70px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--gold)' }}>Atlasi Admin</span>
        </div>
        <div style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', textDecoration: 'none',
                  backgroundColor: isActive ? 'rgba(201,169,110,0.1)' : 'transparent',
                  color: isActive ? 'var(--gold)' : '#756D60',
                  borderLeft: isActive ? '4px solid var(--gold)' : '4px solid transparent',
                  fontWeight: isActive ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{ backgroundColor: '#FFEEBA', color: '#B28E3A', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px' }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--beige-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#FFF', fontWeight: 'bold' }}>
              A
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 'bold', margin: 0 }}>Admin User</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            {navItems.find(item => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path)))?.label || 'لوحة التحكم'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', cursor: 'pointer', color: '#756D60' }}>
              <FiBell size={24} />
              <span style={{ position: 'absolute', top: 0, right: 0, width: '10px', height: '10px', backgroundColor: '#FF4D4D', borderRadius: '50%', border: '2px solid #FFF' }}></span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// 1. Vue d'ensemble (KPIs) & 4. Analytiques
function DashboardOverview() {
  const dataLine = [
    { name: 'الأسبوع 1', confirmed: 12, cancelled: 3 },
    { name: 'الأسبوع 2', confirmed: 17, cancelled: 4 },
    { name: 'الأسبوع 3', confirmed: 21, cancelled: 5 },
    { name: 'الأسبوع 4', confirmed: 26, cancelled: 6 }
  ];

  const dataPie = [
    { name: 'مؤكدة', value: 54 },
    { name: 'ملغاة', value: 12 },
    { name: 'في الانتظار', value: 24 },
    { name: 'زيارة مجدولة', value: 10 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        {[
          { title: 'إجمالي الطلبات', value: '1,284', desc: 'إجمالي النظام', color: 'var(--gold)' },
          { title: 'طلبات مؤكدة ✅', value: '898', desc: 'العملاء الذين أكدوا الطلب', color: '#16a34a' },
          { title: 'طلبات ملغاة ❌', value: '142', desc: 'الإلغاء من العميل أو الأدمين', color: '#ef4444' },
          { title: 'في الانتظار ⏳', value: '244', desc: 'تحتاج قرارًا', color: '#f59e0b' },
          { title: 'زيارات مجدولة 📅', value: '62', desc: 'زيارات ميدانية', color: '#3b82f6' },
          { title: 'مركبة اليوم 🔧', value: '8', desc: 'تركيبات اليوم', color: '#8b5cf6' }
        ].map((kpi, idx) => (
          <div key={idx} style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <h3 style={{ color: '#756D60', fontSize: '0.875rem', fontWeight: '500', margin: '0 0 8px 0' }}>{kpi.title}</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 12px 0' }}>{kpi.value}</p>
            <p style={{ fontSize: '0.875rem', color: kpi.color, margin: 0, fontWeight: 'bold' }}>{kpi.desc}</p>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '24px' }}>الطلبات بمرور الوقت</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataLine}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#756D60'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#756D60'}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                <Line type="monotone" dataKey="confirmed" name="طلبات مؤكدة" stroke="#16a34a" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="cancelled" name="طلبات ملغاة" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '24px' }}>توزيع الطلبات</h3>
          <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={dataPie} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {dataPie.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold' }}>100%</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#756D60' }}>Total</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>أفضل التصاميم مبيعًا</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[['صحراء', 382, '41%'], ['ملكي', 341, '36%'], ['نيوم', 207, '23%']].map((r) => (
                <tr key={r[0]} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 0' }}>{r[0]}</td>
                  <td style={{ padding: '10px 0', textAlign: 'center' }}>{r[1]}</td>
                  <td style={{ padding: '10px 0', textAlign: 'right', color: 'var(--gold)', fontWeight: 'bold' }}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>توزيع الألوان</h3>
          <p style={{ margin: '8px 0' }}>بيج (ذهبي): <strong>68%</strong></p>
          <p style={{ margin: '8px 0' }}>أسود: <strong>32%</strong></p>
        </div>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>معدل التحويل (Funnel)</h3>
          {['زيارات الموقع', 'بدأ الاستبيان', 'أكمل الاستبيان', 'أكد الطلب', 'ركّب'].map((s, i) => (
            <div key={s} style={{ marginBottom: '8px', fontSize: '0.9rem', color: i < 2 ? '#555' : 'var(--gold)' }}>{i + 1}. {s}</div>
          ))}
        </div>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>آخر 5 طلبات</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {MOCK_REQUESTS.slice(0, 3).map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 0', fontWeight: 'bold' }}>{r.id}</td>
                <td style={{ padding: '10px 0' }}>{r.name}</td>
                <td style={{ padding: '10px 0', color: '#666' }}>{normalizeStatus(r.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 2. Gestion des demandes clients
function RequestsList() {
  const [filter, setFilter] = useState('الكل');
  const [query, setQuery] = useState('');
  const [designFilter, setDesignFilter] = useState('الكل');
  const [sizeFilter, setSizeFilter] = useState('الكل');
  const [colorFilter, setColorFilter] = useState('الكل');
  const [sortByDate, setSortByDate] = useState('desc');
  const [scheduleModal, setScheduleModal] = useState({ open: false, req: null });
  const [scheduleForm, setScheduleForm] = useState({ date: '', time: '', notes: '' });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch('http://localhost:8080/api/admin/requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur de chargement:", err);
        setLoading(false);
        // Fallback to mock data if backend not running
        setRequests(MOCK_REQUESTS);
      });
  }, []);

  const handleStatusChange = (id, action) => {
    fetch(`http://localhost:8080/api/admin/requests/${id}/${action}`, { method: 'PUT' })
      .then(res => res.json())
      .then(updated => {
        setRequests(requests.map(r => r.id === id ? updated : r));
      });
  };

  const statusColors = {
    'في الانتظار': { bg: '#FFF3CD', text: '#856404' },
    'مؤكدة': { bg: '#D4EDDA', text: '#155724' },
    'ملغاة': { bg: '#F8D7DA', text: '#721C24' },
    'زيارة مجدولة': { bg: '#CCE5FF', text: '#004085' },
    'قياسات مأخوذة': { bg: '#E7F0FF', text: '#1e40af' },
    'في التصنيع': { bg: '#EEF2FF', text: '#5b21b6' },
    'تم التركيب': { bg: '#E9FCEB', text: '#166534' }
  };

  const withStatus = requests.map((r) => ({ ...r, _statusAr: normalizeStatus(r.status) }));
  const baseFiltered = filter === 'الكل' ? withStatus : withStatus.filter(r => r._statusAr === filter);
  const filteredRequests = baseFiltered.filter((r) => {
    const q = query.trim().toLowerCase();
    const designVal = (r.designType || r.design || '').toLowerCase();
    const sizeVal = (r.sizeInfo || r.size || '').toLowerCase();
    const colorVal = (r.fabricColor || r.color || '').toLowerCase();
    const name = (r.clientName || r.name || '').toLowerCase();
    const phone = (r.clientPhone || '').toLowerCase();
    const queryOk = !q || name.includes(q) || phone.includes(q);
    const designOk = designFilter === 'الكل' || designVal.includes(designFilter);
    const sizeOk = sizeFilter === 'الكل' || sizeVal.includes(sizeFilter);
    const colorOk = colorFilter === 'الكل' || colorVal.includes(colorFilter);
    return queryOk && designOk && sizeOk && colorOk;
  }).sort((a, b) => {
    const ta = new Date(a.requestDate || a.date).getTime();
    const tb = new Date(b.requestDate || b.date).getTime();
    return sortByDate === 'desc' ? tb - ta : ta - tb;
  });

  const openSchedule = (req) => {
    setScheduleModal({ open: true, req });
    setScheduleForm({ date: '', time: '', notes: '' });
  };

  return (
    <div className="card-base" style={{ display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
      {scheduleModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#FFF', borderRadius: '16px', width: '100%', maxWidth: '540px', padding: '24px' }}>
            <h3 style={{ marginBottom: '12px', color: 'var(--gold)' }}>📅 جدولة زيارة</h3>
            <p style={{ marginBottom: '6px' }}>العميل: <strong>{scheduleModal.req?.clientName || scheduleModal.req?.name}</strong></p>
            <p style={{ marginBottom: '16px', color: '#666' }}>التصميم: {scheduleModal.req?.designType || scheduleModal.req?.design} — {scheduleModal.req?.sizeInfo || scheduleModal.req?.size}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
              <input type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
            </div>
            <textarea rows="3" placeholder="ملاحظات..." value={scheduleForm.notes} onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button className="btn btn-secondary" style={{ minHeight: '40px' }} onClick={() => setScheduleModal({ open: false, req: null })}>إلغاء</button>
              <button className="btn btn-primary" style={{ minHeight: '40px' }} onClick={() => {
                setRequests(requests.map((r) => r.id === scheduleModal.req.id ? { ...r, status: STATUS_AR.scheduled } : r));
                setScheduleModal({ open: false, req: null });
              }}>تأكيد الموعد</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['الكل', 'في الانتظار', 'مؤكدة', 'ملغاة', 'زيارة مجدولة'].map(f => (
            <button 
              key={f} onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: filter === f ? 'bold' : 'normal',
                backgroundColor: filter === f ? 'var(--gold)' : '#F8F9FB', color: filter === f ? '#FFF' : '#756D60'
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#756D60' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" placeholder="بحث بالاسم أو الهاتف..." style={{ paddingLeft: '36px', paddingRight: '16px', paddingBottom: '8px', paddingTop: '8px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', width: '250px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select value={designFilter} onChange={(e) => setDesignFilter(e.target.value)} style={{ padding: '8px', borderRadius: '8px' }}>
            <option value="الكل">التصميم: الكل</option>
            <option value="sahra">صحراء</option>
            <option value="malaki">ملكي</option>
            <option value="neom">نيوم</option>
          </select>
          <select value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} style={{ padding: '8px', borderRadius: '8px' }}>
            <option value="الكل">الحجم: الكل</option>
            <option value="single">single</option>
            <option value="double">double</option>
          </select>
          <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)} style={{ padding: '8px', borderRadius: '8px' }}>
            <option value="الكل">اللون: الكل</option>
            <option value="beige">beige</option>
            <option value="noir">noir</option>
          </select>
          <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)} style={{ padding: '8px', borderRadius: '8px' }}>
            <option value="desc">الأحدث أولاً</option>
            <option value="asc">الأقدم أولاً</option>
          </select>
        </div>
      </div>
      
      <div style={{ flex: 1, overflowX: 'auto', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8F9FB', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase' }}>رقم الطلب / ID</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase' }}>العميل</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase' }}>التصميم + الحجم + التثبيت + اللون</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase' }}>السعر المقدر</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase' }}>التاريخ</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase' }}>الحالة</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase', textAlign: 'left' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="7" style={{padding: '20px', textAlign: 'center'}}>Chargement...</td></tr> : 
            filteredRequests.map((req) => (
              <tr key={req.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', backgroundColor: req._statusAr === 'ملغاة' ? '#f3f4f6' : '#fff', opacity: req._statusAr === 'ملغاة' ? 0.85 : 1 }}>
                <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{req.confirmationNumber || `#${req.id}`}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 'bold' }}>{req.clientName || req.name}</div>
                  {req.clientPhone && <div style={{ fontSize: '0.75rem', color: '#756D60', marginTop: '4px' }}>📞 {req.clientPhone}</div>}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ marginBottom: '4px' }}>{req.designType || req.design} • {req.sizeInfo || req.size}</div>
                  <div style={{ fontSize: '0.75rem', color: '#756D60' }}>{req.fixationType || req.fixation} - {req.fabricColor || req.color}</div>
                </td>
                <td style={{ padding: '16px 24px', color: '#756D60', fontSize: '0.875rem' }}>{req.estimatedPrice || '—'}</td>
                <td style={{ padding: '16px 24px', color: '#756D60', fontSize: '0.875rem' }}>{new Date(req.requestDate || req.date).toLocaleString('fr-FR')}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold',
                    backgroundColor: statusColors[req._statusAr]?.bg || '#EEE', color: statusColors[req._statusAr]?.text || '#333'
                  }}>
                    {req._statusAr}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'left' }}>
                  {req._statusAr === 'ملغاة' ? <span style={{ color: '#9ca3af' }}>—</span> :
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start' }}>
                      {req._statusAr === 'في الانتظار' && (
                        <button onClick={() => handleStatusChange(req.id, 'accept')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a' }} title="قبول"><FiCheck size={18} /></button>
                      )}
                      {req._statusAr === 'في الانتظار' && (
                        <button onClick={() => handleStatusChange(req.id, 'reject')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }} title="رفض"><FiX size={18} /></button>
                      )}
                      {(req._statusAr === 'في الانتظار' || req._statusAr === 'مؤكدة') && (
                        <button onClick={() => openSchedule(req)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }} title="جدولة زيارة"><FiCalendar size={18} /></button>
                      )}
                      {req._statusAr === 'زيارة مجدولة' && (
                        <button onClick={() => openSchedule(req)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb' }} title="تعديل الموعد"><FiEdit2 size={18} /></button>
                      )}
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#756D60' }} title="تفاصيل"><FiMoreVertical size={18} /></button>
                    </div>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 3. Calendrier des visites
function CalendarView() {
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('jour');
  const [selectedDayVisits, setSelectedDayVisits] = useState(null);
  
  const [formData, setFormData] = useState({
    requestId: '',
    appointmentDate: '',
    agentName: '',
    appointmentType: 'Prise de mesures',
    notes: ''
  });

  const fetchData = () => {
    fetch('http://localhost:8080/api/admin/appointments')
      .then(res => res.json())
      .then(data => setAppointments(data))
      .catch(err => console.error(err));

    fetch('http://localhost:8080/api/admin/requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data.filter(r => r.status !== 'Annulée'));
      })
      .catch(err => console.error(err));
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = { ...formData, request: { id: formData.requestId } };

    fetch('http://localhost:8080/api/admin/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
      setIsModalOpen(false);
      setFormData({ requestId: '', appointmentDate: '', agentName: '', appointmentType: 'Prise de mesures', notes: '' });
      fetchData(); // Refresh list
    })
    .finally(() => setIsLoading(false));
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust so Monday=0
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const offset = getFirstDayOfMonth(year, month);

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const getDayAppointments = (dayNum) => {
    return appointments.filter(a => {
      if (!a.appointmentDate) return false;
      const d = new Date(a.appointmentDate);
      return d.getDate() === dayNum && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const hours = Array.from({ length: 15 }, (_, i) => i + 6); // 06:00..20:00

  return (
    <div style={{ display: 'flex', gap: '24px', height: '100%', position: 'relative' }}>
      {/* Modal d'ajout de RDV */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#FFF', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '24px', color: 'var(--gold)' }}>Ajouter un Rendez-vous</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '8px' }}>Client & Demande (Recherche par nom ou Tél)</label>
                <input 
                  list="clients-list"
                  placeholder="Tapez le nom ou le numéro..."
                  onChange={(e) => {
                    const val = e.target.value;
                    const match = requests.find(r => `${r.clientName} - ${r.clientPhone || ''} - ${r.confirmationNumber || `Req#${r.id}`}` === val);
                    setFormData({...formData, requestId: match ? match.id : '', _searchVal: val});
                  }}
                  value={formData._searchVal || ''}
                  required 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} 
                />
                <datalist id="clients-list">
                  {requests.map(req => (
                    <option key={req.id} value={`${req.clientName} - ${req.clientPhone || ''} - ${req.confirmationNumber || `Req#${req.id}`}`} />
                  ))}
                </datalist>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '8px' }}>Date et Heure</label>
                <input type="datetime-local" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '8px' }}>Agent assigné</label>
                  <input type="text" placeholder="Ex: Oussama" value={formData.agentName} onChange={e => setFormData({...formData, agentName: e.target.value})} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '8px' }}>Type de visite</label>
                  <select value={formData.appointmentType} onChange={e => setFormData({...formData, appointmentType: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }}>
                    <option>Prise de mesures</option>
                    <option>Livraison & Installation</option>
                    <option>Maintenance</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '8px' }}>Notes internes</label>
                <textarea rows="3" placeholder="Informations complémentaires..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', fontFamily: 'inherit' }}></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" disabled={isLoading} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--gold)', color: '#FFF', fontWeight: 'bold', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                  {isLoading ? 'Enregistrement...' : 'Confirmer le RDV'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card-base" style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{monthNames[month]} {year}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="btn btn-secondary" style={{ padding: '8px 16px', minHeight: 'auto', cursor: 'pointer' }}>&lt;</button>
            <button onClick={() => setCurrentDate(new Date())} className="btn btn-secondary" style={{ padding: '8px 16px', minHeight: 'auto', cursor: 'pointer' }}>Aujourd'hui</button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="btn btn-secondary" style={{ padding: '8px 16px', minHeight: 'auto', cursor: 'pointer' }}>&gt;</button>
            <button onClick={() => setViewMode('jour')} className="btn btn-secondary" style={{ padding: '8px 12px', minHeight: 'auto' }}>Jour</button>
            <button onClick={() => setViewMode('semaine')} className="btn btn-secondary" style={{ padding: '8px 12px', minHeight: 'auto' }}>Semaine</button>
            <button onClick={() => setViewMode('mois')} className="btn btn-secondary" style={{ padding: '8px 12px', minHeight: 'auto' }}>Mois</button>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ padding: '8px 16px', minHeight: 'auto', cursor: 'pointer' }}>+ إضافة زيارة</button>
          </div>
        </div>
        {viewMode === 'jour' && (
          <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden' }}>
            {hours.map((h) => (
              <div key={h} style={{ display: 'grid', gridTemplateColumns: '90px 1fr', minHeight: '54px', borderTop: '1px solid #f1f1f1' }}>
                <div style={{ padding: '8px', background: '#fafafa', fontSize: '0.85rem' }}>{String(h).padStart(2, '0')}:00</div>
                <div style={{ padding: '6px 10px' }}>
                  {appointments.filter((a) => new Date(a.appointmentDate).getHours() === h).map((a) => (
                    <div key={a.id} style={{ background: '#FEF3C7', borderLeft: '4px solid #f59e0b', borderRadius: '8px', padding: '6px 8px', marginBottom: '4px', fontSize: '0.82rem' }}>
                      {(a.request?.clientName || 'عميل')} - {(a.request?.designType || '')}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {viewMode === 'semaine' && (
          <div style={{ border: '1px solid #eee', borderRadius: '12px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={{ padding: '8px' }}>الوقت</th>{['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map((d) => <th key={d} style={{ padding: '8px' }}>{d}</th>)}</tr></thead>
              <tbody>
                {hours.map((h) => (
                  <tr key={h} style={{ borderTop: '1px solid #f1f1f1' }}>
                    <td style={{ padding: '8px', background: '#fafafa' }}>{String(h).padStart(2, '0')}:00</td>
                    {Array.from({ length: 7 }).map((_, i) => <td key={i} style={{ padding: '8px', fontSize: '0.8rem', color: '#666' }}>—</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {viewMode === 'mois' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} style={{ backgroundColor: '#F8F9FB', padding: '12px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 'bold', color: '#756D60' }}>{day}</div>
          ))}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} style={{ backgroundColor: '#FAFAFA', minHeight: '100px' }}></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
             const dayNum = i + 1;
             const isToday = new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year;
             return (
              <div key={i} onClick={() => setSelectedDayVisits(getDayAppointments(dayNum))} style={{ backgroundColor: '#FFF', minHeight: '100px', padding: '8px', position: 'relative', cursor: 'pointer', overflow: 'hidden', borderLeft: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0' }}>
                <span style={{ display: 'inline-block', width: '24px', height: '24px', textAlign: 'center', lineHeight: '24px', borderRadius: '50%', backgroundColor: isToday ? 'var(--gold)' : 'transparent', color: isToday ? '#FFF' : '#333', fontSize: '0.875rem' }}>{dayNum}</span>
                {getDayAppointments(dayNum).map((appt, idx) => (
                  <div key={idx} style={{ marginTop: '4px', fontSize: '0.7rem', backgroundColor: appt.appointmentType.includes('mesures') ? '#CCE5FF' : '#D4EDDA', color: appt.appointmentType.includes('mesures') ? '#004085' : '#155724', padding: '4px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {new Date(appt.appointmentDate).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})} - {appt.agentName}
                  </div>
                ))}
              </div>
             )
          })}
        </div>
        )}
      </div>
      {selectedDayVisits && (
        <div onClick={() => setSelectedDayVisits(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '520px', background: '#FFF', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ marginBottom: '12px' }}>زيارات اليوم</h3>
            {selectedDayVisits.length === 0 ? <p>لا توجد زيارات.</p> : selectedDayVisits.map((a) => (
              <div key={a.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '10px', marginBottom: '8px' }}>
                <strong>{a.request?.clientName || 'عميل'}</strong> - {new Date(a.appointmentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
}

// 4. Pipeline Kanban
function KanbanPipeline() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetch('http://localhost:8080/api/admin/requests')
      .then(res => res.json())
      .then(data => {
        setRequests(data.filter(r => normalizeStatus(r.status) !== STATUS_AR.cancelled));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('reqId', id);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('reqId');
    if (!id) return;
    
    // Optimistic UI update
    setRequests(requests.map(r => r.id.toString() === id ? { ...r, status: newStatus } : r));
    
    // Optional: send to backend
    // fetch(`http://localhost:8080/api/admin/requests/${id}/status?val=${newStatus}`, { method: 'PUT' });
  };

  const allowDrop = (e) => e.preventDefault();

  const columns = [
    { title: '[1] طلب جديد', status: 'طلب جديد' },
    { title: '[2] مؤكد', status: STATUS_AR.confirmed },
    { title: '[3] زيارة مجدولة', status: STATUS_AR.scheduled },
    { title: '[4] قياسات مأخوذة', status: STATUS_AR.measured },
    { title: '[5] في التصنيع', status: STATUS_AR.production },
    { title: '[6] تم التركيب', status: STATUS_AR.installed }
  ];

  return (
    <div style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 150px)', overflowX: 'auto', paddingBottom: '16px' }}>
      {columns.map(col => (
        <div 
          key={col.status} 
          onDrop={(e) => handleDrop(e, col.status)}
          onDragOver={allowDrop}
          style={{ flex: '0 0 320px', backgroundColor: '#F0F2F5', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 'bold', margin: 0, color: '#333' }}>{col.title}</h3>
            <span style={{ backgroundColor: '#E4E6EB', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
              {requests.filter(r => {
                const s = normalizeStatus(r.status);
                if (col.status === 'طلب جديد') return s === STATUS_AR.pending;
                return s === col.status;
              }).length}
            </span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {requests.filter(r => {
              const s = normalizeStatus(r.status);
              if (col.status === 'طلب جديد') return s === STATUS_AR.pending;
              return s === col.status;
            }).map(req => (
              <div 
                key={req.id} 
                draggable 
                onDragStart={(e) => handleDragStart(e, req.id)}
                style={{ backgroundColor: '#FFF', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'grab' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--gold)' }}>{req.confirmationNumber || `#${req.id}`}</span>
                  <FiMoreVertical style={{ color: '#756D60' }} />
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem' }}>{req.clientName}</h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#756D60' }}>📞 {req.clientPhone}</p>
                <div style={{ fontSize: '0.75rem', backgroundColor: '#F8F9FB', padding: '8px', borderRadius: '6px' }}>
                  {req.designType} • {req.sizeInfo}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// 5. Clients & CRM (Placeholder)
function ClientsList() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [filter, setFilter] = useState('الكل');
  const clients = [
    { id: 1, name: 'adel bettaieb', phone: '0511111111', design: 'ملكي', color: 'beige', orders: 1, status: '✅مؤكد', completed: 1, lat: 24.7136, lng: 46.6753 },
    { id: 2, name: 'حمد العتيبي', phone: '0522222222', design: 'نيوم', color: 'beige', orders: 3, status: '📅زيارة', completed: 3, lat: 24.7236, lng: 46.6653 },
    { id: 3, name: 'خالد الغامدي', phone: '0533333333', design: 'نيوم', color: 'noir', orders: 5, status: '✅مكتمل', completed: 5, lat: 24.7036, lng: 46.6853 }
  ];
  const filtered = clients.filter((c) => {
    if (filter === 'الكل') return true;
    if (filter === 'جديد 🆕') return c.orders === 1;
    if (filter === 'مكتمل ✅') return c.status.includes('مكتمل');
    if (filter === 'قيد التنفيذ 🔄') return !c.status.includes('مكتمل');
    return true;
  });
  const detail = selectedClient || filtered[0];
  const loyalty = getLoyaltyLevel(detail?.completed || 0);

  return (
    <div className="card-base" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '10px' }}>Clients</h2>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {['الكل', 'قيد التنفيذ 🔄', 'مكتمل ✅', 'جديد 🆕'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="btn btn-secondary" style={{ minHeight: '36px', padding: '6px 12px' }}>{f}</button>
        ))}
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead><tr style={{ background: '#fafafa' }}><th style={{ padding: '8px' }}>اسم العميل</th><th>الهاتف</th><th>آخر تصميم</th><th>الطلبات</th><th>بطاقة الولاء</th><th>الحالة</th></tr></thead>
        <tbody>
          {filtered.map((c) => (
          <tr key={c.id} onClick={() => setSelectedClient(c)} style={{ cursor: 'pointer', borderTop: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px' }}>{c.name}</td><td>{c.phone}</td><td>{c.design} • {c.color}</td><td>{c.orders}</td><td>{getLoyaltyLevel(c.completed).label}</td><td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {detail && (
        <div style={{ border: '1px solid #eee', borderRadius: '14px', padding: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <h3>👤 {detail.name}</h3>
              <p>📞 {detail.phone}</p>
              <p>🧭 {detail.lat}, {detail.lng}</p>
              <p>🏆 {loyalty.label}</p>
              <div style={{ marginTop: '8px', padding: '10px', borderRadius: '10px', background: '#f9fafb' }}>
                <div><strong>رقم الطلب:</strong> الطلب {detail.orders}</div>
                <div><strong>نوع التصميم:</strong> {detail.design}</div>
                <div><strong>اللون:</strong> {detail.color}</div>
              </div>
            </div>
            <div>
              <h3>موقع العميل</h3>
              <iframe title="map" width="100%" height="180" style={{ border: 0, borderRadius: '10px' }} src={`https://maps.google.com/maps?q=${detail.lat},${detail.lng}&z=16&output=embed&t=k`}></iframe>
              <a href={`https://www.google.com/maps?q=${detail.lat},${detail.lng}`} target="_blank" rel="noreferrer">فتح في Google Maps</a>
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <h4>ملاحظات</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '8px' }}>
              <textarea rows="4" placeholder="اكتب ملاحظات واضحة وقابلة للتنفيذ..." />
              <div style={{ display: 'grid', gap: '8px' }}>
                <select><option>أولوية: متوسطة</option><option>أولوية: عالية</option><option>أولوية: منخفضة</option></select>
                <input type="date" />
                <button className="btn btn-primary" style={{ minHeight: '38px' }}><FiSave /> حفظ الملاحظات</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsView() {
  const [users, setUsers] = useState([
    { id: 1, name: 'adel bettaieb', email: 'admin@atlasi.sa', role: 'أدمين' }
  ]);
  return (
    <div style={{ display: 'grid', gap: '18px' }}>
      <div className="card-base" style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>معلومات الحساب</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input defaultValue="adel bettaieb" />
          <input defaultValue="admin@atlasi.sa" />
          <button className="btn btn-primary" style={{ minHeight: '38px', width: 'fit-content' }}><FiSave /> حفظ التغييرات</button>
        </div>
      </div>
      <div className="card-base" style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>تغيير كلمة المرور</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          <input type="password" placeholder="الحالية" />
          <input type="password" placeholder="الجديدة" />
          <input type="password" placeholder="تأكيد الجديدة" />
          <button className="btn btn-secondary" style={{ minHeight: '38px', width: 'fit-content' }}><FiLock /> تغيير كلمة المرور</button>
        </div>
      </div>
      <div className="card-base" style={{ padding: '20px' }}>
        <h3 style={{ marginBottom: '10px' }}>المستخدمون</h3>
        {users.map((u) => (
          <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid #f1f1f1' }}>
            <span>{u.name} | {u.email} | {u.role}</span>
            <span><FiEdit2 style={{ marginRight: '8px' }} /><FiTrash2 /></span>
          </div>
        ))}
        <button className="btn btn-primary" style={{ marginTop: '10px', minHeight: '38px' }} onClick={() => setUsers([...users, { id: Date.now(), name: 'new user', email: 'new@atlasi.sa', role: 'أدمين' }])}><FiUserPlus /> إضافة مستخدم جديد</button>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#F8F9FB', fontFamily: "var(--font-body)" }}>
        <div style={{ backgroundColor: '#FFF', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)', margin: '0 0 8px 0' }}>Atlasi Admin</h2>
            <p style={{ color: '#756D60', margin: 0 }}>Veuillez vous connecter</p>
          </div>
          
          {error && <div style={{ backgroundColor: '#F8D7DA', color: '#721C24', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.875rem' }}>{error}</div>}
          
          <form onSubmit={(e) => {
            e.preventDefault();
            setIsLoading(true);
            setError('');
            fetch('http://localhost:8080/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setIsAuthenticated(true);
              } else {
                setError(data.message || 'Email ou mot de passe incorrect.');
              }
            })
            .catch(err => {
              console.error(err);
              setError('Impossible de joindre le serveur. Assurez-vous que Spring Boot tourne sur le port 8080.');
            })
            .finally(() => setIsLoading(false));
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.875rem' }}>Email Administratif</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@atlasi.com" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '0.875rem' }}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
            </div>
            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--gold)', color: '#FFF', fontWeight: 'bold', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/requests" element={<RequestsList />} />
        <Route path="/pipeline" element={<KanbanPipeline />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/clients" element={<ClientsList />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="*" element={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#756D60' }}>
            En cours de construction...
          </div>
        } />
      </Routes>
    </AdminLayout>
  );
}
