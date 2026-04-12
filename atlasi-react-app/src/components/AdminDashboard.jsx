import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiInbox, FiCalendar, FiUsers, FiLayers, FiSettings,
  FiBell, FiSearch, FiCheck, FiX, FiMapPin, FiMoreVertical, FiEdit2, FiTrash2, FiUserPlus, FiSave, FiLock, FiDownload, FiTrendingUp, FiShoppingBag, FiUserCheck, FiDollarSign
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// --- Shared Components & Assets ---

const STATUS_MAP = {
  pending: { label: 'في الانتظار', color: '#f59e0b', bg: '#fef3c7' },
  confirmed: { label: 'مؤكد', color: '#10b981', bg: '#dcfce7' },
  cancelled: { label: 'ملغي', color: '#ef4444', bg: '#fee2e2' },
  scheduled: { label: 'زيارة مجدولة', color: '#3b82f6', bg: '#dbeafe' },
  measured: { label: 'قيد التنفيذ', color: '#6366f1', bg: '#e0e7ff' },
  production: { label: 'في التصنيع', color: '#8b5cf6', bg: '#f3e8ff' },
  installed: { label: 'مكتمل', color: '#166534', bg: '#dcfce7' }
};

const normalizeStatus = (raw) => {
  if (!raw) return 'pending';
  const lower = String(raw).toLowerCase();
  if (lower.includes('confirm')) return 'confirmed';
  if (lower.includes('annul') || lower.includes('cancel') || lower.includes('رفض')) return 'cancelled';
  if (lower.includes('visite') || lower.includes('schedul')) return 'scheduled';
  if (lower.includes('mesur')) return 'measured';
  if (lower.includes('atelier') || lower.includes('product')) return 'production';
  if (lower.includes('livrai') || lower.includes('termin') || lower.includes('install')) return 'installed';
  return 'pending';
};

const getLoyaltyLevel = (completedOrders) => {
  if (completedOrders === 0) return { level: 0, label: 'جديد', discount: 0 };
  if (completedOrders === 1) return { level: 1, label: '🛒 إصدار البطاقة', discount: 0 };
  if (completedOrders === 2) return { level: 2, label: '🥇 خصم ٥٪', discount: 0.05 };
  if (completedOrders >= 4) return { level: 4, label: '🥉 خصم ١٠٪', discount: 0.10 };
  return { level: 3, label: '🥈 خصم ٥٪', discount: 0.05 };
};

// --- Layout Components ---

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navItems = [
    { path: '/admin', icon: 'dashboard', label: 'نظرة عامة' },
    { path: '/admin/requests', icon: 'shopping_cart', label: 'الطلبات' },
    { path: '/admin/pipeline', icon: 'account_tree', label: 'سير العمل' },
    { path: '/admin/calendar', icon: 'calendar_today', label: 'التقويم' },
    { path: '/admin/clients', icon: 'groups', label: 'العملاء' },
    { path: '/admin/settings', icon: 'settings', label: 'الإعدادات' },
  ];

  const handleLogout = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-[#f7f9fb] text-[#191c1e] font-headline" dir="rtl">
      {/* SideNavBar */}
      <aside className="fixed right-0 top-0 h-full w-64 border-l border-slate-200 bg-slate-50 flex flex-col p-6 z-50">
        <div className="text-xl font-bold text-slate-900 mb-8 tracking-tight">
          لوحة التحكم
          <div className="text-[10px] font-normal text-slate-500 mt-1 uppercase tracking-widest">Atlantis Enterprise v2.4</div>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 ${isActive ? 'bg-white text-primary shadow-sm font-bold scale-100' : 'text-slate-500 hover:bg-slate-100 hover:scale-95'}`}
              >
                <span className={`material-symbols-outlined ${isActive ? 'filled' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }}>{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3 p-2 bg-white/50 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:bg-white transition-colors" onClick={handleLogout}>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">A</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">أدمن أطلسي</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">تسجيل الخروج</p>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-sm">logout</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 mr-64 flex flex-col overflow-hidden">
        {/* TopNavBar */}
        <header className="h-16 flex justify-between items-center px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 sticky top-0">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-black tracking-tighter text-slate-900 uppercase">Atlantis Admin</h1>
            <div className="relative">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input 
                className="bg-[#f2f4f6] border-none rounded-full pr-10 pl-4 py-1.5 w-64 text-xs focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-400" 
                placeholder="بحث سريع في النظام..." 
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative p-2 text-slate-500 hover:text-primary transition-all cursor-pointer">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </div>
            <button className="material-symbols-outlined p-2 text-slate-500 hover:text-primary transition-all opacity-80 hover:opacity-100">help_outline</button>
          </div>
        </header>

        {/* Page Canvas */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- View Components ---

const DashboardOverview = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-primary">نظرة عامة</h2>
                    <p className="text-slate-500 mt-1">مرحباً بك مجدداً، إليك ملخص حي عما يحدث في النظام الآن.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <span className="material-symbols-outlined text-sm">download</span>
                        تصدير التقرير الكامل
                    </button>
                    <button className="bg-primary text-white border-none px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-xl shadow-primary/20">
                        طلب معاينة جديدة
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'إجمالي الطلبات', value: '١,٢٨٤', icon: 'shopping_bag', trend: '+١٢.٥٪', color: 'blue' },
                    { label: 'عملاء نشطون', value: '٤٨', icon: 'group', trend: '+٥.٢٪', color: 'purple' },
                    { label: 'الإيرادات المتوقعة', value: '١٤٢,٥٠٠', icon: 'payments', trend: '+٨.١٪', color: 'green', unit: 'ر.س' },
                    { label: 'معدل الإنجاز', value: '٩٨٪', icon: 'speed', trend: '+٠.٥٪', color: 'amber' }
                ].map((m, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between h-44 transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-[#f2f4f6] rounded-2xl">
                                <span className="material-symbols-outlined text-slate-700">{m.icon}</span>
                            </div>
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{m.trend}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{m.label}</p>
                            <p className="text-3xl font-black text-slate-900">{m.value} {m.unit && <span className="text-xs font-normal text-slate-300">{m.unit}</span>}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Performance Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col h-[450px]">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-bold">النمو ودرجة الطلب</h3>
                            <p className="text-xs text-slate-400 font-medium">البيانات تعتمد على الأشهر الستة الماضية</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary"></span><span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">2024</span></div>
                            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-200"></span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">2023</span></div>
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <svg className="w-full h-full opacity-60" viewBox="0 0 800 200" preserveAspectRatio="none">
                           <path d="M0,180 Q100,160 200,170 T400,100 T600,60 T800,80" fill="none" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="8 4" />
                           <path d="M0,195 Q100,185 200,140 T400,90 T600,50 T800,70" fill="none" stroke="currentColor" strokeWidth="6" className="text-primary" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-between text-[10px] font-bold text-slate-400 px-4 mt-auto h-6 pointer-events-none">
                            <span>يناير</span><span>مارس</span><span>مايو</span><span>يوليو</span><span>سيبتمبر</span><span>نوفمبر</span>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/30">System Status</span>
                            <h3 className="text-2xl font-bold mt-6 leading-tight">جميع الأنظمة <br/>تعمل بكفاءة ١٠٠٪</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold">
                                    <span className="text-slate-400 uppercase tracking-widest">Cloud Sync</span>
                                    <span className="text-green-400 font-black">ACTIVE</span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-400 h-full w-full"></div>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">فتح سجل التقارير</button>
                        </div>
                    </div>
                    {/* Decorative Blobs */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
                </div>
            </div>
        </div>
    );
};

const RequestsList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('الكل');
    const [search, setSearch] = useState('');

    const fetchRequests = () => {
        setLoading(true);
        fetch('http://localhost:8080/api/admin/requests')
            .then(res => res.json())
            .then(data => { setRequests(data); setLoading(false); })
            .catch(() => {
                setRequests([
                    { id: 1, clientName: 'أحمد الحسيني', requestDate: new Date(), status: 'pending', estimatedPrice: '١٢,٥٠٠', confirmationNumber: 'ORD-8821', designType: 'ملكي', fabricColor: 'بيج' },
                    { id: 2, clientName: 'سارة المنصور', requestDate: new Date(), status: 'confirmed', estimatedPrice: '٨,٤٠٠', confirmationNumber: 'ORD-8825', designType: 'نيوم', fabricColor: 'أسود' },
                    { id: 3, clientName: 'عبدالاله الفايز', requestDate: new Date(), status: 'cancelled', estimatedPrice: '٩,٩٠٠', confirmationNumber: 'ORD-8750', designType: 'صحراء', fabricColor: 'بيج' }
                ]);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = (id, action) => {
        // Backend interaction
        fetch(`http://localhost:8080/api/admin/requests/${id}/${action}`, { method: 'PUT' })
            .then(() => fetchRequests());
    };

    const filtered = requests.filter(r => {
        const statusAr = STATUS_MAP[normalizeStatus(r.status)].label;
        const matchesFilter = filter === 'الكل' || statusAr === filter;
        const matchesSearch = !search || r.clientName.includes(search) || r.confirmationNumber.includes(search);
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500 px-2">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">قائمة الطلبات</h2>
                    <p className="text-slate-500 font-medium mt-1">إدارة ومراجعة تمامی طلبات التخصيص الواردة</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-full md:w-auto overflow-x-auto overflow-y-hidden scrollbar-hide">
                    {['الكل', 'في الانتظار', 'مؤكد', 'زيارة مجدولة', 'مكتمل', 'ملغي'].map(f => (
                        <button 
                            key={f} onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === f ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-primary hover:bg-slate-50'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                 <div className="md:col-span-3 relative group">
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors">search</span>
                    <input 
                        type="text" placeholder="البحث عن طريق الاسم، رقم الهاتف، أو رقم الطلب التجريبي..." 
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-[1.5rem] pr-12 pl-6 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                    />
                 </div>
                 <button className="bg-white border border-slate-100 rounded-[1.5rem] py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base">filter_list</span>
                    تصفية متقدمة
                 </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-[#fcfcfc] border-b border-slate-100">
                        <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <th className="px-8 py-5">رقم الطلب</th>
                            <th className="px-8 py-5">العميل التفاصيل</th>
                            <th className="px-8 py-5">التصميم المختار</th>
                            <th className="px-8 py-5">المبلغ التقديري</th>
                            <th className="px-8 py-5">الحالة الراهنة</th>
                            <th className="px-8 py-5 text-left">العمليات السيادية</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                             <tr><td colSpan="6" className="py-20 text-center"><div className="flex flex-col items-center animate-pulse"><div className="w-10 h-10 rounded-full border-4 border-slate-100 border-t-primary animate-spin mb-4"></div><p className="text-xs font-black text-slate-400 tracking-widest uppercase">جاري استرجاع البيانات...</p></div></td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="6" className="py-20 text-center text-slate-300 font-bold uppercase text-xs">لا توجد طلبات تطابق هذا التصنيف</td></tr>
                        ) : filtered.map((r) => {
                             const st = STATUS_MAP[normalizeStatus(r.status)];
                             return (
                                <tr key={r.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="bg-slate-100 px-3 py-1.5 rounded-lg w-fit text-[10px] font-black text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-all uppercase tracking-tighter">
                                            {r.confirmationNumber || `#${r.id}`}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="text-sm font-bold text-slate-900 mb-1">{r.clientName}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">الرياض، المملكة العربية السعودية</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.fabricColor === 'أسود' ? '#1a1a1a' : '#dbc39f' }}></div>
                                            <span className="text-xs font-bold text-slate-700">{r.designType} • {r.fabricColor}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm font-black text-slate-900">{r.estimatedPrice}</span>
                                        <span className="text-[9px] font-bold text-slate-300 mr-1.5">SAR</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full w-fit group-hover:scale-105 transition-transform" style={{ backgroundColor: st.bg, color: st.color }}>
                                            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: st.color }}></span>
                                            <span className="text-[9px] font-black uppercase tracking-widest">{st.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 justify-end">
                                            {normalizeStatus(r.status) === 'pending' && (
                                                <>
                                                    <button onClick={() => handleAction(r.id, 'accept')} className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm" title="قبول الطلب">
                                                        <span className="material-symbols-outlined text-lg">check</span>
                                                    </button>
                                                    <button onClick={() => handleAction(r.id, 'reject')} className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm" title="رفض الطلب">
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </button>
                                                </>
                                            )}
                                            <button className="w-10 h-10 rounded-xl border border-slate-100 text-slate-300 flex items-center justify-center hover:border-primary hover:text-primary transition-all">
                                                <span className="material-symbols-outlined text-lg">more_vert</span>
                                            </button>
                                        </div>
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

const KanbanPipeline = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const cols = [
        { id: 'pending', title: 'طلبات جديدة', icon: 'inbox', color: '#f59e0b' },
        { id: 'confirmed', title: 'تم التأكيد', icon: 'verified', color: '#10b981' },
        { id: 'scheduled', title: 'زيارة مجدولة', icon: 'event', color: '#3b82f6' },
        { id: 'measured', title: 'قياسات منتهية', icon: 'straighten', color: '#6366f1' },
        { id: 'installed', title: 'تمت المهمة', icon: 'task_alt', color: '#16a34a' }
    ];

    useEffect(() => {
        fetch('http://localhost:8080/api/admin/requests')
            .then(res => res.json())
            .then(data => { setRequests(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const getColData = (cid) => {
        return requests.filter(r => {
            const sn = normalizeStatus(r.status);
            if(cid === 'pending') return sn === 'pending';
            return sn === cid;
        });
    };

    return (
        <div className="space-y-8 h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-700">
             <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">مسار الإنتاج والتركيب</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Full Delivery Pipeline</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">عرض كـ:</span>
                    <div className="flex bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
                        <button className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-primary text-white shadow-md">البطاقات</button>
                        <button className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400">القائمة</button>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {cols.map(c => (
                    <div key={c.id} className="w-80 shrink-0 flex flex-col bg-[#f2f4f6]/40 rounded-[2.5rem] p-3 border border-transparent hover:border-slate-200 transition-all">
                        <div className="p-4 flex items-center justify-between mb-2">
                             <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: c.color }}></div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-600">{c.title}</h3>
                             </div>
                             <span className="px-2 py-0.5 bg-white rounded text-[10px] font-bold text-slate-400 shadow-sm">{getColData(c.id).length}</span>
                        </div>
                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar px-1">
                             {getColData(c.id).map(r => (
                                <motion.div 
                                    key={r.id} drag dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                    className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[9px] font-black bg-[#f2f4f6] px-2 py-0.5 rounded text-slate-400 uppercase">{r.confirmationNumber}</span>
                                        <div className="relative">
                                            <span className="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors text-sm">more_horiz</span>
                                        </div>
                                    </div>
                                    <h4 className="text-xs font-black text-slate-900 leading-snug group-hover:text-primary transition-colors">{r.clientName}</h4>
                                    <p className="text-[10px] font-medium text-slate-400 mt-1">تنسيق: {r.designType} {r.fabricColor}</p>
                                    <div className="mt-5 flex items-center justify-between border-t border-slate-50 pt-4">
                                        <div className="flex items-center gap-1.5 text-slate-300">
                                            <span className="material-symbols-outlined text-[10px]">schedule</span>
                                            <span className="text-[9px] font-bold italic">٢س</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                             <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[7px] font-bold text-slate-500 uppercase">{r.clientName?.charAt(0)}</div>
                                        </div>
                                    </div>
                                </motion.div>
                             ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CalendarView = () => {
    const [view, setView] = useState('month');
    const [appointments, setAppointments] = useState([]);
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        fetch('http://localhost:8080/api/admin/appointments')
            .then(res => res.json())
            .then(data => setAppointments(data))
            .catch(() => {
                setAppointments([
                    { id: 1, agentName: 'أحمد', appointmentType: 'معاينة', appointmentDate: new Date(), request: { clientName: 'سارة الشمري' } }
                ]);
            });
    }, []);

    return (
        <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500 overflow-hidden px-2">
             <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">أجندة الزيارات</h2>
                    <p className="text-slate-500 font-medium mt-1">إدارة الجدول الزمني لفرق المعاينة والتركيب الميداني</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
                        {['يوم', 'أسبوع', 'شهر'].map(v => (
                            <button key={v} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === (v==='يوم'?'day':v==='أسبوع'?'week':'month') ? 'bg-primary text-white' : 'text-slate-400'}`}>
                                {v}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowAdd(true)} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-slate-900/10 hover:shadow-primary/20 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">event_available</span>
                        موعد جديد
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
                <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col p-8">
                     <div className="grid grid-cols-7 border-b border-slate-100 pb-6 mb-1">
                        {['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</div>
                        ))}
                     </div>
                     <div className="flex-1 grid grid-cols-7 grid-rows-5 bg-slate-50 gap-[1px]">
                         {Array.from({ length: 35 }).map((_, i) => (
                             <div key={i} className={`bg-white p-4 transition-all hover:bg-slate-50 cursor-pointer relative group ${i < 3 || i > 33 ? 'opacity-20 pointer-events-none' : ''}`}>
                                 <span className="text-[11px] font-black text-slate-400 group-hover:text-primary transition-colors">{i < 3 ? 30+i : i-2}</span>
                                 {i === 15 && (
                                     <div className="mt-3 space-y-1">
                                         <div className="px-2 py-1 bg-blue-50 text-[8px] font-black text-blue-600 rounded border-r-2 border-blue-600 truncate uppercase">معاينة • الملك فهد</div>
                                         <div className="px-2 py-1 bg-green-50 text-[8px] font-black text-green-600 rounded border-r-2 border-green-600 truncate uppercase">تركيب • العليا</div>
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                </div>

                <aside className="w-full lg:w-96 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col overflow-hidden">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-8 border-b border-slate-100 pb-4">مواعيد اليوم</h3>
                    <div className="flex-1 space-y-8 overflow-y-auto custom-scrollbar">
                         {appointments.length > 0 ? appointments.map((a, i) => (
                            <div key={i} className="relative pr-6 group">
                                <div className="absolute right-0 top-1 bottom-0 w-[2px] bg-slate-100"></div>
                                <div className="absolute right-[-3px] top-1.5 w-2 h-2 rounded-full border-2 border-white bg-primary shadow-sm group-hover:scale-125 transition-transform"></div>
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[9px] font-black text-slate-400 italic">١٠:٣٠ صباحاً</span>
                                    <h4 className="text-xs font-black text-slate-900 leading-snug">{a.request?.clientName}</h4>
                                    <p className="text-[10px] font-medium text-slate-400 italic">فني التركيب: {a.agentName}</p>
                                </div>
                            </div>
                         )) : <div className="text-slate-300 text-xs font-bold italic py-20 text-center">لا توجد مواعيد اليوم</div>}
                    </div>
                </aside>
            </div>
        </div>
    );
};

const ClientsList = () => {
    const [selected, setSelected] = useState(null);
    const clients = [
        { id: 1, name: 'أحمد الحسيني', phone: '0501234567', email: 'ahmed.h@gmail.sa', completed: 5, pending: 1, lat: 24.7136, lng: 46.6753, status: 'Active VIP' },
        { id: 2, name: 'لمى العتيبي', phone: '0509876543', email: 'lama.a@gmail.sa', completed: 1, pending: 0, lat: 24.7236, lng: 46.6653, status: 'Standard' }
    ];
    const item = selected || clients[0];
    const loyalty = getLoyaltyLevel(item.completed);

    return (
        <div className="space-y-12 animate-in fade-in duration-500 px-2 lg:px-4">
             <header className="flex flex-col md:flex-row items-end justify-between gap-8">
                <div className="flex items-center gap-10">
                    <div className="w-28 h-28 rounded-[2.5rem] bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl relative group">
                        <img alt="Client" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" src="https://lh3.googleusercontent.com/a/ACg8ocL-X-X-X-X-X-X-X=s96-c" />
                    </div>
                    <div className="space-y-2">
                         <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900">{item.name}</h1>
                            <span className="px-4 py-1.5 bg-slate-900 text-white text-[9px] font-black rounded-full uppercase tracking-widest">{loyalty.label}</span>
                         </div>
                         <div className="flex gap-6 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">mail</span> {item.email}</span>
                            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">call</span> {item.phone}</span>
                         </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-slate-100 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:bg-slate-50 transition-all">تعديل الملف</button>
                    <button className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all">حظر العميل</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                 <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden h-[400px]">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-black">موقع التركيب (GPS)</h3>
                            <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 group">
                                فتح في خرائط جوجل <span className="material-symbols-outlined text-sm group-hover:translate-x-[-4px] transition-transform">arrow_left</span>
                            </button>
                        </div>
                        <div className="absolute inset-x-8 bottom-10 h-[240px] bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex items-center justify-center">
                            <iframe title="map" width="100%" height="100%" className="rounded-[2rem] opacity-80" src={`https://maps.google.com/maps?q=${item.lat},${item.lng}&z=14&output=embed`}></iframe>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                        <h3 className="text-xl font-black mb-10">سجل الطلبات السابقة</h3>
                        <div className="space-y-4">
                            {[1, 2].map(id => (
                                <div key={id} className="flex items-center justify-between p-6 bg-[#fcfcfc] rounded-2xl border border-slate-50 hover:border-primary/20 transition-all group">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-xs text-slate-300 group-hover:text-primary transition-colors">#ORD</div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 uppercase">مظلة ملكي • SUV • بيج</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1">تم التركيب في ١٥ مايو ٢٠٢٤</p>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-black text-slate-900">١٢,٥٠٠ <span className="text-[10px] font-medium text-slate-300 uppercase">SAR</span></p>
                                        <span className="text-[8px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-widest">Completed</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                 </div>

                 <aside className="space-y-8">
                    <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-blue-300">Loyalty Status</h4>
                            <div className="space-y-2 mb-8">
                                <p className="text-3xl font-black text-white">{loyalty.label}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-right">Progress to Titanium</p>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-400 h-full w-2/3"></div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">ملاحظات إدارية</h4>
                        <textarea className="w-full bg-[#fcfcfc] border-none rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none h-40 resize-none" placeholder="اكتب ملاحطة خاصة بهذا العميل..."></textarea>
                        <button className="w-full py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-primary/20 transition-all">حفظ التغييرات</button>
                    </div>
                 </aside>
            </div>
        </div>
    );
};

// --- Authentication Wrapper ---

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Authentication logic remains the same
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] font-headline p-6" dir="rtl">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-[0_40px_100px_-16px_rgba(0,0,0,0.1)] border border-slate-50"
        >
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-primary text-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/20">
                <span className="material-symbols-outlined text-4xl">secure</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">أطلسي أدمين</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">Access Encrypted Channel</p>
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-5 rounded-2xl mb-8 text-[10px] font-black uppercase tracking-widest border border-red-100 text-center">{error}</div>}
          
          <form className="space-y-8" onSubmit={(e) => {
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
                setError(data.message || 'Access Denied: Invalid Credentials');
              }
            })
            .catch(err => {
              console.error(err);
              setError('Connection Refused: Server Offline');
            })
            .finally(() => setIsLoading(false));
          }}>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-4">User Identity</label>
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)} required 
                placeholder="admin@atlasi.sa" 
                className="w-full bg-[#f2f4f6] border-none rounded-2xl px-6 py-5 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-4">Security Key</label>
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)} required 
                placeholder="••••••••" 
                className="w-full bg-[#f2f4f6] border-none rounded-2xl px-6 py-5 text-sm focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-slate-300" 
              />
            </div>
            <button 
                type="submit" disabled={isLoading} 
                className="w-full py-6 bg-primary text-white rounded-[2rem] font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-[10px]"
            >
              {isLoading ? 'Decrypting Access...' : 'Establish Connection'}
            </button>
          </form>
        </motion.div>
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
        <Route path="/settings" element={<div className="text-slate-300 font-bold italic py-20 text-center uppercase tracking-widest text-xs">Security Settings Terminal (Under Construction)</div>} />
        <Route path="*" element={<div className="text-slate-300 font-bold italic py-20 text-center uppercase tracking-widest text-xs">End of Path: 404 Node Not Found</div>} />
      </Routes>
    </AdminLayout>
  );
}
