import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  FiHome, FiInbox, FiCalendar, FiUsers, FiLayers, FiBarChart2, FiSettings, 
  FiBell, FiPlus, FiSearch, FiCheck, FiX, FiMapPin, FiMoreVertical 
} from 'react-icons/fi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';

// Dummy Data
const MOCK_REQUESTS = [
  { id: 'ATL-2024-0142', name: 'Ahmed Bensalem', design: 'Pyramidal', size: 'Grand SUV', fixation: 'Sur poteaux', color: 'Beige', date: '2024-04-08T10:30', status: 'En attente' },
  { id: 'ATL-2024-0143', name: 'Karim Z.', design: 'Console', size: 'Petit Sedan', fixation: 'Murale', color: 'Gris', date: '2024-04-07T14:15', status: 'Confirmée' },
  { id: 'ATL-2024-0144', name: 'Nadia R.', design: 'Arqué', size: 'Grand SUV', fixation: 'Sur poteaux', color: 'Noir', date: '2024-04-06T09:20', status: 'Visite planifiée' },
];

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

// Layout Component
function AdminLayout({ children }) {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin', icon: <FiHome />, label: 'Vue générale' },
    { path: '/admin/requests', icon: <FiInbox />, label: 'Demandes', badge: 3 },
    { path: '/admin/pipeline', icon: <FiLayers />, label: 'Pipeline Kanban' },
    { path: '/admin/calendar', icon: <FiCalendar />, label: 'Calendrier', badge: 2 },
    { path: '/admin/clients', icon: <FiUsers />, label: 'Clients' },
    { path: '/admin/projects', icon: <FiLayers />, label: 'Projets' },
    { path: '/admin/reports', icon: <FiBarChart2 />, label: 'Rapports' },
    { path: '/admin/settings', icon: <FiSettings />, label: 'Paramètres' },
  ];

  return (
    <div dir="ltr" style={{ display: 'flex', height: '100vh', backgroundColor: '#F8F9FB', fontFamily: "var(--font-body)", color: '#1A1A1A' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', backgroundColor: '#FFFFFF', borderRight: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
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
                  borderRight: isActive ? '4px solid var(--gold)' : '4px solid transparent',
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
              <p style={{ fontSize: '0.75rem', color: '#756D60', margin: 0 }}>🟢 En ligne</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{ height: '70px', backgroundColor: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            {navItems.find(item => location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path)))?.label || 'Dashboard'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button className="btn btn-primary" style={{ minHeight: '40px', padding: '0.5rem 1.5rem', gap: '8px' }}>
              <FiPlus /> Nouvelle demande
            </button>
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
  const dataWeekly = [
    { name: 'Lun', curr: 400, prev: 240 },
    { name: 'Mar', curr: 300, prev: 139 },
    { name: 'Mer', curr: 200, prev: 380 },
    { name: 'Jeu', curr: 278, prev: 390 },
    { name: 'Ven', curr: 189, prev: 480 },
    { name: 'Sam', curr: 239, prev: 380 },
    { name: 'Dim', curr: 349, prev: 430 },
  ];

  const dataPie = [
    { name: 'Acceptées', value: 65 },
    { name: 'En attente', value: 25 },
    { name: 'Annulées', value: 10 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        {[
          { title: 'Total des demandes', value: '1,284', desc: '+12% ce mois', color: '#3b82f6' },
          { title: 'Demandes acceptées', value: '898', desc: 'Taux: 70%', color: '#00C49F' },
          { title: 'Demandes annulées', value: '142', desc: 'Taux: 11%', color: '#FF8042' },
          { title: 'En attente', value: '244', desc: 'Action requise', color: '#FFBB28' },
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '24px' }}>Demandes hebdomadaires</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataWeekly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#756D60'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#756D60'}} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                <Bar dataKey="curr" name="Cette semaine" fill="var(--gold)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prev" name="Semaine dernière" fill="var(--beige-light)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '24px' }}>Répartition</h3>
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
    </div>
  );
}

// 2. Gestion des demandes clients
function RequestsList() {
  const [filter, setFilter] = useState('Tous');
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
    'En attente': { bg: '#FFF3CD', text: '#856404' },
    'Confirmée': { bg: '#D4EDDA', text: '#155724' },
    'Annulée': { bg: '#F8D7DA', text: '#721C24' },
    'Visite planifiée': { bg: '#CCE5FF', text: '#004085' },
  };

  const filteredRequests = filter === 'Tous' ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="card-base" style={{ display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Tous', 'En attente', 'Confirmées', 'Annulées', 'Visite planifiée'].map(f => (
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
          <input type="text" placeholder="Rechercher..." style={{ paddingLeft: '36px', paddingRight: '16px', paddingBottom: '8px', paddingTop: '8px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px', width: '250px' }} />
        </div>
      </div>
      
      <div style={{ flex: 1, overflowX: 'auto', padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8F9FB', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase' }}>Numéro / ID</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase' }}>Client</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase' }}>Design & Taille</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase' }}>Statut</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', color: '#756D60', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="6" style={{padding: '20px', textAlign: 'center'}}>Chargement...</td></tr> : 
            filteredRequests.map((req) => (
              <tr key={req.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>{req.confirmationNumber || `#${req.id}`}</td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 'bold' }}>{req.clientName || req.name}</div>
                  {req.clientPhone && <div style={{ fontSize: '0.75rem', color: '#756D60', marginTop: '4px' }}>📞 {req.clientPhone}</div>}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ marginBottom: '4px' }}>{req.designType || req.design} • {req.sizeInfo || req.size}</div>
                  <div style={{ fontSize: '0.75rem', color: '#756D60' }}>{req.fixationType || req.fixation} - {req.fabricColor || req.color}</div>
                </td>
                <td style={{ padding: '16px 24px', color: '#756D60', fontSize: '0.875rem' }}>{new Date(req.requestDate || req.date).toLocaleString('fr-FR')}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ 
                    padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold',
                    backgroundColor: statusColors[req.status]?.bg || '#EEE', color: statusColors[req.status]?.text || '#333'
                  }}>
                    {req.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleStatusChange(req.id, 'accept')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#756D60' }} title="Accepter"><FiCheck size={18} /></button>
                    <button onClick={() => handleStatusChange(req.id, 'reject')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#756D60' }} title="Refuser"><FiX size={18} /></button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#756D60' }} title="Voir détails"><FiMoreVertical size={18} /></button>
                  </div>
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

      <div className="card-base" style={{ flex: 2, padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>{monthNames[month]} {year}</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="btn btn-secondary" style={{ padding: '8px 16px', minHeight: 'auto', cursor: 'pointer' }}>&lt;</button>
            <button onClick={() => setCurrentDate(new Date())} className="btn btn-secondary" style={{ padding: '8px 16px', minHeight: 'auto', cursor: 'pointer' }}>Aujourd'hui</button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="btn btn-secondary" style={{ padding: '8px 16px', minHeight: 'auto', cursor: 'pointer' }}>&gt;</button>
          </div>
        </div>
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
              <div key={i} style={{ backgroundColor: '#FFF', minHeight: '100px', padding: '8px', position: 'relative', cursor: 'pointer', overflow: 'hidden', borderLeft: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0' }}>
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
      </div>
      
      <div className="card-base" style={{ flex: 1, padding: '24px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px' }}>Toutes les visites</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
          <button onClick={() => setIsModalOpen(true)} style={{ width: '100%', padding: '16px', border: '2px dashed rgba(201,169,110,0.5)', borderRadius: '12px', background: 'rgba(201,169,110,0.05)', color: 'var(--gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <FiPlus /> Ajouter un rendez-vous
          </button>
          
          {appointments.length === 0 ? (
             <div style={{ textAlign: 'center', color: '#756D60', padding: '20px' }}>Aucun rendez-vous prévu.</div>
          ) : appointments.map((appt) => (
            <div key={appt.id} style={{ padding: '16px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--gold)' }}>
                  {new Date(appt.appointmentDate).toLocaleString('fr-FR', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: appt.appointmentType.includes('mesure') ? '#e0f2fe' : '#dcfce7', color: appt.appointmentType.includes('mesure') ? '#0369a1' : '#166534', padding: '4px 8px', borderRadius: '4px' }}>
                  {appt.appointmentType}
                </span>
              </div>
              <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>{appt.request?.clientName || 'Client inconnu'}</p>
              <p style={{ fontSize: '0.875rem', color: '#756D60', display: 'flex', alignItems: 'center', gap: '4px', margin: '0 0 8px 0' }}>
                <FiMapPin /> {appt.request?.confirmationNumber || 'En attente de repères'}
              </p>
              <p style={{ fontSize: '0.875rem', color: '#756D60', margin: 0 }}>Agent: <span style={{ fontWeight: 'bold', color: '#333' }}>{appt.agentName}</span></p>
            </div>
          ))}
        </div>
      </div>
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
        setRequests(data.filter(r => r.status !== 'Annulée' && r.status !== 'En attente')); // Kanban for confirmed requests
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
    { title: '📞 Appel programmé', status: 'Confirmée' },
    { title: '🏠 Visite planifiée', status: 'Visite planifiée' },
    { title: '🔨 En atelier', status: 'En atelier' },
    { title: '🚛 Livraison', status: 'Livraison' },
    { title: '✅ Terminé & Garanti', status: 'Terminé' }
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
              {requests.filter(r => (r.status === col.status) || (col.status === 'Confirmée' && r.status === 'Confirmée')).length}
            </span>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {requests.filter(r => r.status === col.status || (col.status === 'Confirmée' && r.status === 'Confirmée')).map(req => (
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
  return (
    <div className="card-base" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '16px' }}>Base Clients (CRM)</h2>
      <p style={{ color: '#756D60', marginBottom: '24px' }}>Retrouvez ici la liste de tous vos clients, leur historique de commande et leurs statistiques de fidélité.</p>
      <div style={{ flex: 1, backgroundColor: '#FAFAFA', borderRadius: '12px', border: '1px dashed rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        Module CRM en cours de déploiement (Voir Specs 1.5)
      </div>
    </div>
  );
}

// 6. Rapports (Placeholder)
function ReportsView() {
  return (
    <div className="card-base" style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '16px' }}>Rapports et Analyses</h2>
      <p style={{ color: '#756D60', marginBottom: '24px' }}>Générez des rapports sur les revenus, les notes de satisfaction, et les designs préférés.</p>
      <div style={{ flex: 1, backgroundColor: '#FAFAFA', borderRadius: '12px', border: '1px dashed rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        Module Analytics en cours de génération (Voir Specs 1.7)
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
        <Route path="/reports" element={<ReportsView />} />
        <Route path="*" element={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#756D60' }}>
            En cours de construction...
          </div>
        } />
      </Routes>
    </AdminLayout>
  );
}
