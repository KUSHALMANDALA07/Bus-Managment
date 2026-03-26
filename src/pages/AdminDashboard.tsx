import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, BarChart, Users, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart as RechartsBarChart, Bar } from 'recharts';
import { toast } from 'sonner';

interface AdminData {
  fleet: number;
  routes: number;
  passengers: number;
  revenue: number;
  trends: { name: string; passengers: number; fuel: number; }[];
  buses?: { [key: string]: { busNumber: string; seats: (string | null)[] }[] };
  reports: { id: number; type: string; desc: string; status: string; by: string; }[];
  students: { 
    id: string; 
    name: string; 
    feePaid: boolean; 
    status: string; 
    route: string; 
    bus: string; 
  }[];
  seatRequests: { id: number; studentName: string; reason: string; status: string; }[];
  notifications: string[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'fleet' | 'routes' | 'bookings' | 'students' | 'reports' | 'requests'>('overview');
  const [adminSelectedRoute, setAdminSelectedRoute] = useState<string>('Downtown Express');
  const [adminSelectedBusIndex] = useState<number>(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/data');
      setData(await res.json());
    } catch (e) {
      console.error('Fetch error');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resolveReport = async (id: number) => {
    try {
      const res = await fetch('/api/admin/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if(res.ok) {
        toast.success('Report resolved');
        fetchData();
      }
    } catch {
      toast.error('Failed to resolve');
    }
  };

  const handleStudentAction = async (endpoint: string, name: string) => {
    try {
      const res = await fetch(`/api/admin/student/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchData();
      } else {
        toast.error(json.message || 'Operation failed');
      }
    } catch (err) {
      toast.error('Operation failed');
    }
  };

  const handleSeatRequest = async (requestId: number, approve: boolean) => {
    try {
      const res = await fetch('/api/admin/approve-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, approve })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(approve ? 'Seat change approved and cleared!' : 'Request rejected');
        fetchData();
      } else {
        toast.error(json.message || 'API error');
      }
    } catch (err) {
      toast.error('API error');
    }
  };

  if(!data) return <div style={{ padding: '40px', color:'white' }}>Loading from Server API...</div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', color: '#f0f0f5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity color="#9333ea" /> Admin Portal
        </h1>
        <button onClick={() => { localStorage.removeItem('role'); navigate('/login', { replace: true }); }} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Sign Out</button>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
        {['overview', 'fleet', 'routes', 'bookings', 'students', 'reports', 'requests'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === tab ? '#9333ea' : '#a7a9be',
              fontSize: '18px',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <>
              {/* KPI Cards API */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                {[
                  { label: 'Total Fleet', value: data.fleet, icon: <Activity color="#4f46e5" /> },
                  { label: 'Active Routes', value: data.routes, icon: <TrendingUp color="#10b981" /> },
                  { label: 'Total Passengers', value: data.passengers, icon: <Users color="#f97316" /> },
                  { label: 'Revenue', value: `$${data.revenue}`, icon: <BarChart color="#9333ea" /> },
                ].map((kpi, i) => (
                  <div key={i} className="glass" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ color: '#a7a9be', marginBottom: '5px' }}>{kpi.label}</p>
                      <h2 style={{ fontSize: '28px' }}>{kpi.value}</h2>
                    </div>
                    <div>{kpi.icon}</div>
                  </div>
                ))}
              </div>

              {/* Charts API */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '20px' }}>
                
                {/* Charts API Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="glass" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Live Passenger Trends</h2>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.trends}>
                          <XAxis dataKey="name" stroke="#a7a9be" />
                          <YAxis stroke="#a7a9be" />
                          <Tooltip contentStyle={{ background: '#141625', border: 'none', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="passengers" stroke="#4f46e5" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>Fuel Consumption Context</h2>
                    <div style={{ height: '300px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart data={data.trends}>
                          <XAxis dataKey="name" stroke="#a7a9be" />
                          <YAxis stroke="#a7a9be" />
                          <Tooltip contentStyle={{ background: '#141625', border: 'none', borderRadius: '8px' }} />
                          <Bar dataKey="fuel" fill="#9333ea" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Notifications Panel */}
                <div className="glass" style={{ padding: '24px', height: 'fit-content', maxHeight: '740px', overflowY: 'auto' }}>
                  <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={20} color="#ef4444" /> System Alerts
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.notifications?.map((notif, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        style={{ 
                          padding: '12px', 
                          background: notif.includes('Alert') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                          borderRadius: '8px', 
                          borderLeft: `4px solid ${notif.includes('Alert') ? '#ef4444' : '#4f46e5'}` 
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '14px', color: '#fff' }}>{notif}</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#a7a9be' }}>Just now</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

              </div>
            </>
          )}

          {activeTab === 'fleet' && data.buses && (
            <div className="glass" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px' }}>Active Fleet Overview</h2>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
                      <th style={{ padding: '12px' }}>Bus Number</th>
                      <th style={{ padding: '12px' }}>Route Name</th>
                      <th style={{ padding: '12px' }}>Total Seats</th>
                      <th style={{ padding: '12px' }}>Reserved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.buses).flatMap(([routeName, routeBuses]) => {
                      return routeBuses.map((busData) => {
                        const totalSeats = busData.seats.length;
                        const reservedCount = busData.seats.filter(s => s !== null).length;
                        return (
                          <tr key={`${routeName}-${busData.busNumber}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a7a9be' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>#{busData.busNumber}</td>
                            <td style={{ padding: '12px' }}>{routeName}</td>
                            <td style={{ padding: '12px' }}>{totalSeats}</td>
                            <td style={{ padding: '12px', color: '#ef4444' }}>{reservedCount}</td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && data.buses && (
            <div className="glass" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px' }}>Live Seat Allocations</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select 
                    value={adminSelectedRoute} 
                    onChange={(e) => setAdminSelectedRoute(e.target.value)}
                    style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid #4f46e5', outline: 'none' }}
                  >
                    {Object.keys(data.buses).map(r => <option key={r} value={r} style={{color: '#000'}}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px' }}>
                {data.buses[adminSelectedRoute]?.[adminSelectedBusIndex]?.seats?.map((seatOwner, i) => (
                  <div key={i} style={{ height: '60px', borderRadius: '8px', background: seatOwner ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', border: `1px solid ${seatOwner ? '#ef4444' : '#10b981'}`, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                    <span style={{ fontWeight: 'bold' }}>{i + 1}</span>
                    <span style={{ fontSize: '10px' }}>{seatOwner || 'Free'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="glass" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Student Database</h2>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Route</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students?.map((s) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#a7a9be' }}>
                      <td style={{ padding: '12px', color: '#fff' }}>{s.name}</td>
                      <td style={{ padding: '12px' }}>{s.route}</td>
                      <td style={{ padding: '12px' }}>{s.status}</td>
                      <td style={{ padding: '12px', display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleStudentAction('pay', s.name)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #10b981', color: '#10b981', background: 'transparent', cursor: 'pointer' }}>Fee</button>
                        <button onClick={() => handleStudentAction('pause', s.name)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #f97316', color: '#f97316', background: 'transparent', cursor: 'pointer' }}>Pause</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="glass" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Active Reports</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {data.reports?.map((r) => (
                  <div key={r.id} style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{r.type}</h3>
                      <p style={{ margin: '5px 0 0 0', color: '#a7a9be' }}>{r.desc}</p>
                    </div>
                    {r.status === 'Active' && (
                      <button onClick={() => resolveReport(r.id)} style={{ padding: '10px 20px', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>Resolve</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="glass" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Seat Change Requests</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {data.seatRequests?.length === 0 ? <p>No pending requests.</p> : data.seatRequests?.map((req) => (
                  <div key={req.id} style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                      <h4 style={{ color: '#fff', margin: 0 }}>{req.studentName}</h4>
                      <p style={{ color: '#a7a9be', margin: '5px 0' }}>{req.reason}</p>
                      <span style={{ color: req.status === 'Approved' ? '#10b981' : req.status === 'Rejected' ? '#ef4444' : '#f97316' }}>{req.status}</span>
                    </div>
                    {req.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleSeatRequest(req.id, true)} style={{ padding: '8px 16px', borderRadius: '6px', background: '#10b981', color: '#fff', border: 'none', cursor: 'pointer' }}>Approve</button>
                        <button onClick={() => handleSeatRequest(req.id, false)} style={{ padding: '8px 16px', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer' }}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
