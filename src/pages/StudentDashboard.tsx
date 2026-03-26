import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, Bell, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { IssueReporter } from '../components/IssueReporter.tsx';
import { LiveMap } from '../components/LiveMap.tsx';

import { UserCircle } from 'lucide-react';

interface StudentData {
  buses: { [key: string]: { busNumber: string; seats: (string | null)[] }[] };
  notifications: string[];
  tracking: { progress: number; eta: number; status: string; location: { lat: number; lng: number } };
  feePaid: boolean;
  request: { id: number; studentName: string; reason: string; status: string; } | null;
  availability: { isAvailable: boolean; message: string; };
  stops: { id: number; name: string; progress: number; eta: number; isNear?: boolean; }[];
  profile: { name: string; id: string; course: string; year: string; };
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentData | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('Downtown Express');
  const [selectedBusIndex, setSelectedBusIndex] = useState<number>(0);

  // Poll for data every 3 seconds to test animation automatically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/student/data');
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error('Fetch error - backend running?');
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const reserveSeat = async (i: number) => {
    if (!data) return;
    if (!data.feePaid) {
      toast.error('Please pay your bus pass fee before reserving a seat!');
      return;
    }
    
    if (window.confirm(`Confirm your reservation for Seat ${i + 1} on Bus #${data.buses[selectedRoute]?.[selectedBusIndex]?.busNumber}?`)) {
      try {
        const res = await fetch('/api/student/reserve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ route: selectedRoute, busIndex: selectedBusIndex, seatIndex: i, studentName: data.profile?.name || 'Alex Johnson' }) 
        });
        const json = await res.json();
        if (json.success) {
          toast.success(json.message);
          setData({ ...data, buses: json.buses } as StudentData);
        } else {
          toast.error(json.message);
        }
      } catch (e) {
        toast.error('Error reserving seat');
      }
    }
  };

  const processPayment = () => {
    if (!data) return;
    setProcessing(true);
    setTimeout(async () => {
      try {
        const res = await fetch('/api/student/pay', { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          toast.success(json.message);
          setData({ ...data, feePaid: true } as StudentData);
          setShowPayment(false);
        }
      } catch (e) {
        toast.error('Payment failed');
      } finally {
        setProcessing(false);
      }
    }, 1500);
  };

  const requestSeatChange = async () => {
    const reason = window.prompt('Enter reason for seat change request:');
    if (!reason) return;
    try {
      const res = await fetch('/api/student/request-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: data?.profile.name, reason })
      });
      const json = await res.json();
      if (json.success) {
        toast.info(json.message);
      }
    } catch (e) {
      toast.error('Failed to submit request');
    }
  };

  if (!data) return <div style={{ padding: '40px', color: 'white' }}>Loading backend data...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', color: '#f0f0f5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bus color="#4f46e5" /> Student Dashboard
        </h1>
        <button onClick={() => { localStorage.removeItem('role'); navigate('/login', { replace: true }); }} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Sign Out</button>
      </header>

      {!data.availability.isAvailable && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}
        >
          <div style={{ padding: '10px', background: '#ef4444', borderRadius: '50%' }}>
            <AlertTriangle color="#fff" size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#ef4444' }}>URGENT NOTICE: BUS UNAVAILABLE</h3>
            <p style={{ margin: '5px 0 0 0', color: '#a7a9be' }}>{data.availability.message || 'The bus is currently not in service. Please check notifications for details.'}</p>
          </div>
        </motion.div>
      )}

      {/* Student Profile Overview */}
      <div className="glass" style={{ padding: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ padding: '20px', background: 'rgba(79, 70, 229, 0.2)', borderRadius: '50%' }}>
          <UserCircle size={48} color="#4f46e5" />
        </div>
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div>
            <p style={{ color: '#a7a9be', fontSize: '14px', marginBottom: '4px' }}>Logged in as</p>
            <h2 style={{ fontSize: '24px', color: '#fff' }}>{data.profile?.name || 'Loading Name...'}</h2>
          </div>
          <div>
            <p style={{ color: '#a7a9be', fontSize: '14px', marginBottom: '4px' }}>Student ID</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{data.profile?.id || '---'}</p>
          </div>
          <div>
            <p style={{ color: '#a7a9be', fontSize: '14px', marginBottom: '4px' }}>Course Enrolled</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{data.profile?.course || '---'} ({data.profile?.year || '---'})</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Pass Status Array */}
        <div className="glass" style={{ padding: '24px', gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', marginBottom: '5px' }}>Bus Pass Status</h2>
            <p style={{ color: data.feePaid ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
              {data.feePaid ? 'Active (Fee Paid)' : 'Inactive (Fee Pending)'}
            </p>
          </div>
          {!data.feePaid && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPayment(true)}
              style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Pay Bus Fee ($50)
            </motion.button>
          )}
        </div>

        {/* Live Tracking Real */}
        <div className="glass" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin color="#10b981"/> Live Tracking (Satellite)</h2>
          
          <LiveMap lat={data.tracking.location.lat} lng={data.tracking.location.lng} label="GGU Bus #42" height="250px" />
          
          <p style={{ marginTop: '15px', color: '#10b981', fontWeight: 'bold' }}>Live Link Status: Connected | ETA: {data.tracking.eta} mins</p>
          
          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#a7a9be' }}>Upcoming Stops</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.stops?.map((stop) => {
                const isPassed = data.tracking.progress > stop.progress;
                return (
                  <li key={stop.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', background: isPassed ? 'rgba(0,0,0,0.2)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${isPassed ? 'transparent' : 'rgba(16, 185, 129, 0.3)'}`, opacity: isPassed ? 0.5 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isPassed ? '#4f46e5' : '#10b981' }} />
                      <span style={{ color: '#fff', textDecoration: isPassed ? 'line-through' : 'none' }}>{stop.name}</span>
                    </div>
                    {!isPassed && <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>ETA: {Math.max(1, stop.eta - (15 - data.tracking.eta))} mins</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Real Seat Reservation (40 Seats) */}
        <div className="glass" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px' }}>Seat Reservation</h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {Object.values(data.buses).flat().some(b => b.seats.includes(data.profile?.name || 'Alex Johnson')) && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', background: 'rgba(249, 115, 22, 0.2)', color: '#f97316', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      Locked: Contact Admin to change seat
                    </span>
                    {data.request ? (
                      <span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        Request: {data.request.status}
                      </span>
                    ) : (
                      <button 
                        onClick={requestSeatChange}
                        style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#4f46e5', border: '1px solid #4f46e5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Request Change
                      </button>
                    )}
                  </div>
                )}
                <select 
                  value={selectedRoute} 
                  onChange={(e) => { setSelectedRoute(e.target.value); setSelectedBusIndex(0); }}
                  style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid #4f46e5', outline: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {Object.keys(data.buses).map(route => (
                    <option key={route} value={route} style={{ color: '#000' }}>{route}</option>
                  ))}
                </select>
                <select 
                  value={selectedBusIndex} 
                  onChange={(e) => setSelectedBusIndex(Number(e.target.value))}
                  style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#10b981', border: '1px solid #10b981', outline: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {data.buses[selectedRoute]?.map((b, i) => (
                    <option key={i} value={i} style={{ color: '#000' }}>Bus #{b.busNumber}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px' }}>
            {data.buses[selectedRoute]?.[selectedBusIndex]?.seats?.map((seatOwner: string | null, i: number) => {
              const myName = data.profile?.name || 'Alex Johnson';
              const mySeat = seatOwner === myName;
              const globalHasSeat = Object.values(data.buses).flat().some(b => b.seats.includes(myName));
              const occupied = seatOwner !== null && !mySeat;
              
              const isLocked = mySeat || globalHasSeat;

              return (
                <motion.button
                  key={i}
                  whileHover={{ scale: occupied || isLocked ? 1 : 1.15 }}
                  whileTap={{ scale: occupied || isLocked ? 1 : 0.9 }}
                  onClick={() => !occupied && !isLocked && reserveSeat(i)}
                  disabled={occupied || isLocked}
                  style={{
                    height: '40px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: occupied || isLocked ? 'not-allowed' : 'pointer',
                    background: mySeat ? '#10b981' : occupied ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    color: mySeat || occupied ? '#fff' : '#a7a9be',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    opacity: globalHasSeat && !mySeat ? 0.6 : 1,
                  }}
                >
                  {i + 1}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Notifications Real */}
        <div className="glass" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Bell color="#f97316"/> Notifications</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {data.notifications.map((notif: string, i: number) => (
              <li key={i} style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a7a9be' }}>
                {notif}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Issue Reporter */}
        <IssueReporter username="Student (Alex)" />
        
      </div>
      {/* Payment Modal Drop-in */}
      <AnimatePresence>
        {showPayment && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.8, y: 50 }} 
              className="glass" 
              style={{ padding: '40px', width: '400px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(20,22,37,0.95)' }}
            >
              <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Secure Checkout</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ color: '#a7a9be' }}>Card Number</label>
                <input type="text" placeholder="4111 2222 3333 4444" style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                  <label style={{ color: '#a7a9be' }}>Expiry</label>
                  <input type="text" placeholder="MM/YY" style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
                  <label style={{ color: '#a7a9be' }}>CVV</label>
                  <input type="text" placeholder="123" style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <button onClick={() => setShowPayment(false)} style={{ background: 'transparent', color: '#a7a9be', border: '1px solid #a7a9be', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={processPayment} disabled={processing} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '120px' }}>
                  {processing ? 'Processing...' : 'Pay $50.00'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StudentDashboard;
