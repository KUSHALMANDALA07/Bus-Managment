import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Bus, MapPin, CheckCircle, XCircle, Users, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { IssueReporter } from '../components/IssueReporter.tsx';
import { LiveMap } from '../components/LiveMap.tsx';

interface ParentData {
  childStatus: { progress: number; eta: number; status: string; location: { lat: number; lng: number } };
  attendance: boolean | null;
  feePaid: boolean;
  busInfo: { busNumber: string; route: string; driverPhone: string; };
  trips: { date: string; route: string; status: string; }[];
  parentProfile: { name: string; relation: string; phone: string; email: string; };
  childProfile: { name: string; id: string; course: string; year: string; };
  notifications: string[];
}

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ParentData | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/parent/data');
        setData(await res.json());
      } catch (e) {
        console.error('Fetch error');
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAlert = async () => {
    try {
      const res = await fetch('/api/parent/alert', { method: 'POST' });
      const json = await res.json();
      if(json.success) {
        toast.error('Emergency Contact Alert Sent via API!');
      }
    } catch (e) {
      toast.error('Failed to send alert.');
    }
  };

  const processPayment = () => {
    if (!data) return;
    setProcessing(true);
    setTimeout(async () => {
      try {
        const res = await fetch('/api/parent/pay', { method: 'POST' });
        const json = await res.json();
        if (json.success) {
          toast.success(json.message);
          setData({ ...data, feePaid: true } as ParentData);
          setShowPayment(false);
        }
      } catch (e) {
        toast.error('Payment failed');
      } finally {
        setProcessing(false);
      }
    }, 1500);
  };

  if (!data) return <div style={{ padding: '40px', color: 'white' }}>Loading backend data...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', color: '#f0f0f5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck color="#10b981" /> Parent Dashboard
        </h1>
        <button onClick={() => { localStorage.removeItem('role'); navigate('/login', { replace: true }); }} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Sign Out</button>
      </header>

      {/* Profiles Dual View */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="glass" style={{ padding: '24px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%' }}>
            <Users size={32} color="#10b981" />
          </div>
          <div>
            <p style={{ color: '#a7a9be', fontSize: '14px', marginBottom: '2px' }}>Parent Profile ({data.parentProfile.relation})</p>
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '4px' }}>{data.parentProfile.name}</h2>
            <p style={{ fontSize: '14px' }}>{data.parentProfile.phone} • {data.parentProfile.email}</p>
          </div>
        </div>

        <div className="glass" style={{ padding: '24px', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ padding: '15px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '50%' }}>
            <Bus size={32} color="#3b82f6" />
          </div>
          <div>
            <p style={{ color: '#a7a9be', fontSize: '14px', marginBottom: '2px' }}>Child Information (Passenger)</p>
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '4px' }}>{data.childProfile.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontSize: '14px', color: '#a7a9be' }}>ID: {data.childProfile.id} • {data.childProfile.course}</p>
              <span style={{ fontSize: '10px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                ✓ LINKED LIVE
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Boarding Status & Bus Info */}
        <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h2 style={{ fontSize: '20px' }}>Alex's Boarding Status</h2>
          <div style={{ padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {data.attendance === true ? <CheckCircle color="#10b981" size={28} /> : 
             data.attendance === false ? <XCircle color="#ef4444" size={28} /> : 
             <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: '15px', height: '15px', background: '#f97316', borderRadius: '50%', margin: '0 6px' }} />}
            <div>
              <p style={{ fontWeight: 'bold', fontSize: '18px', color: data.attendance === true ? '#10b981' : data.attendance === false ? '#ef4444' : '#f97316' }}>
                {data.attendance === true ? 'Boarded the Bus' : data.attendance === false ? 'Absent Today' : 'Awaiting Boarding'}
              </p>
              <p style={{ color: '#a7a9be', fontSize: '14px' }}>Bus #{data?.busInfo?.busNumber || '42'} • {data?.busInfo?.route || 'Loading Route...'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <span style={{ color: '#a7a9be' }}>Driver Phone:</span>
            <span style={{ fontWeight: 'bold' }}>{data?.busInfo?.driverPhone || 'N/A'}</span>
          </div>
        </div>

        <div className="glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin color="#10b981"/> Live Location (Real-time)</h2>
          
          <LiveMap lat={data.childStatus.location.lat} lng={data.childStatus.location.lng} label="Alex's Bus" height="200px" />
          
          <p style={{ marginTop: '15px', color: '#a7a9be', fontWeight: 'bold' }}>Live Link Active | ETA: {data?.childStatus?.eta || '--'} mins</p>
        </div>

        {/* Notifications Real */}
        <div className="glass" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}><Bell color="#f97316"/> System Updates</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.notifications?.map((notif, i) => (
              <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: `4px solid ${notif.includes('Alert') ? '#ef4444' : '#3b82f6'}`, fontSize: '14px' }}>
                {notif}
              </div>
            ))}
          </div>
        </div>

        {/* Fee Payment Section */}
        <div className="glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Fee Details</h2>
          <div style={{ padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: `4px solid ${data.feePaid ? '#10b981' : '#ef4444'}` }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Alex Johnson (Bus Pass)</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: data.feePaid ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                {data.feePaid ? 'Paid in Full' : 'Payment Due: $50'}
              </span>
              {!data.feePaid && (
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPayment(true)}
                  style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Pay Now
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <PhoneCall size={32} color="#ef4444" style={{ marginBottom: '10px' }} />
          <h2 style={{ fontSize: '20px', marginBottom: '10px', color: '#ef4444' }}>Emergency Action</h2>
          <button 
            onClick={handleAlert}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Alert Admin / Driver
          </button>
        </div>
      </div>

      {/* Attendance History */}
      <div className="glass" style={{ marginTop: '20px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Alex's Attendance History</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.trips?.map((trip, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: `4px solid ${trip.status === 'Completed' ? '#10b981' : trip.status === 'Boarded' ? '#3b82f6' : trip.status === 'Pending' ? '#f97316' : '#ef4444'}` }}>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{trip.date}</p>
                <p style={{ color: '#a7a9be', fontSize: '14px' }}>{trip.route}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: trip.status === 'Completed' ? '#10b981' : trip.status === 'Boarded' ? '#3b82f6' : trip.status === 'Pending' ? '#f97316' : '#ef4444' }}>
                 <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{trip.status}</span>
                 {trip.status === 'Completed' || trip.status === 'Boarded' ? <CheckCircle size={20} /> : <XCircle size={20} />}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Issue Reporter */}
      <div style={{ marginTop: '20px' }}>
        <IssueReporter username="Parent (Alex's Guardian)" />
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
              <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Parent Payment Portal</h2>
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
                  {processing ? 'Processing...' : 'Pay $50'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default ParentDashboard;
