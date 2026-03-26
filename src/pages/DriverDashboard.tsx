import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bus, MapPin, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { LiveMap } from '../components/LiveMap.tsx';

interface DriverData {
  attendance: { [key: string]: boolean };
  routeStatus: { progress: number; eta: number; status: string; location: { lat: number; lng: number } };
  stops?: { id: number; name: string; progress: number; eta: number; }[];
  availability: { isAvailable: boolean; message: string; };
}

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DriverData | null>(null);
  const [isHardwareTracking, setIsHardwareTracking] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/driver/data');
      setData(await res.json());
    } catch (e) {
      console.error('Fetch error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateLocation = async (progress: number, eta?: number, isHardwareGPS: boolean = false) => {
    try {
      const res = await fetch('/api/driver/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress, eta, isHardwareGPS })
      });
      const json = await res.json();
      if(json.success && !isHardwareGPS) {
        toast.success(json.message);
        if(data) setData({ ...data, routeStatus: { progress, eta: eta || data.routeStatus.eta, status: 'On Route' } } as DriverData);
      }
    } catch (e) {
      if(!isHardwareGPS) toast.error('Failed to update GPS Coordinates.');
    }
  };

  const reportIssue = async (type: string) => {
    const desc = window.prompt(`Describe the ${type}:`);
    if (desc === null) return;
    try {
      const res = await fetch('/api/driver/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, desc })
      });
      const json = await res.json();
      if(json.success) {
        toast.warning(`Emergency Alert: ${type} reported.`);
        fetchData();
      }
    } catch (e) {
      toast.error('Failed to report issue');
    }
  };

  const toggleAvailability = async () => {
    const newStatus = !data?.availability.isAvailable;
    const message = newStatus ? '' : window.prompt('Reason for holiday/unavailability (e.g., National Holiday, maintenance):') || 'Internal maintenance';
    try {
      const res = await fetch('/api/driver/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus, message })
      });
      const json = await res.json();
      if(json.success && data) {
        setData({ ...data, availability: { isAvailable: newStatus, message } });
        toast.info(newStatus ? 'Bus is back in service.' : 'Bus marked as Not Available.');
      }
    } catch (e) {
      toast.error('Failed to update availability.');
    }
  };

  const startHardwareGPS = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported");
      return;
    }
    setIsHardwareTracking(true);
    toast.success("Hardware GPS Activated.");
    const watchId = setInterval(() => {
      setData(current => {
        if (!current) return current;
        let mockProg = (current.routeStatus.progress || 0) + 1.5;
        if(mockProg > 100) mockProg = 0;
        const next = Math.min(mockProg, 100);
        updateLocation(next, undefined, true);
        return { ...current, routeStatus: { ...current.routeStatus, progress: next } };
      });
    }, 2000);
    (window as any).gpsWatchId = watchId;
  };

  const stopHardwareGPS = () => {
    setIsHardwareTracking(false);
    clearInterval((window as any).gpsWatchId);
    toast.success("Hardware GPS Stopped.");
  };

  const markAttendance = async (student: string, present: boolean) => {
    try {
      const res = await fetch('/api/driver/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student, isPresent: present })
      });
      const json = await res.json();
      if(json.success) {
        setData({ ...data, attendance: json.attendance } as DriverData);
        toast.success(`${student} is ${present ? 'Present' : 'Absent'}`);
      }
    } catch (e) {
      toast.error('Sync failed.');
    }
  };

  if(!data) return <div style={{ padding: '40px', color:'white' }}>Loading driver console...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', color: '#f0f0f5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Bus color="#f97316" /> Driver Dashboard
        </h1>
        <button onClick={() => { localStorage.removeItem('role'); navigate('/login', { replace: true }); }} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Sign Out</button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Route Details */}
        <div className="glass" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Route Progress</h2>
          
          <LiveMap lat={data.routeStatus.location.lat} lng={data.routeStatus.location.lng} label="You are here" height="150px" />
          
          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: '4px solid #f97316' }}>
            <h3 style={{ marginBottom: '5px', fontSize: '16px' }}>Route 42 - Downtown</h3>
            <p style={{ color: '#10b981', fontWeight: 'bold', margin: 0 }}>Progress: {data.routeStatus.progress}%</p>
            <p style={{ color: '#a7a9be', fontSize: '12px', margin: 0 }}>Status: {data.routeStatus.status}</p>
          </div>
        </div>

        {/* Emergency Updates */}
        <div className="glass" style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <AlertTriangle color="#ef4444" />
            <h2 style={{ fontSize: '20px', color: '#ef4444', margin: 0 }}>Emergency Logs</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {['Breakdown', 'Fuel Out', 'Puncture', 'Traffic'].map(issue => (
              <button 
                key={issue}
                onClick={() => reportIssue(issue)}
                style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {issue}
              </button>
            ))}
          </div>
        </div>

        {/* Holiday Management */}
        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Calendar color="#3b82f6" />
            <h2 style={{ fontSize: '20px', margin: 0 }}>Availability Status</h2>
          </div>
          <div style={{ padding: '15px', background: data.availability.isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: `1px solid ${data.availability.isAvailable ? '#10b981' : '#ef4444'}` }}>
            <p style={{ fontWeight: 'bold' }}>Current: {data.availability.isAvailable ? 'In Service' : 'Out of Service'}</p>
            {!data.availability.isAvailable && <p style={{ fontSize: '12px', color: '#a7a9be' }}>Reason: {data.availability.message}</p>}
            <button 
              onClick={toggleAvailability}
              style={{ marginTop: '10px', width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: data.availability.isAvailable ? '#ef4444' : '#10b981', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {data.availability.isAvailable ? 'Mark as Holiday' : 'Mark Available'}
            </button>
          </div>
        </div>

        {/* GPS Control */}
        <div className="glass" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '20px' }}>Live Location Overrides</h2>
            <button 
              onClick={isHardwareTracking ? stopHardwareGPS : startHardwareGPS}
              style={{ background: isHardwareTracking ? '#ef4444' : '#4f46e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <MapPin size={18} />
              {isHardwareTracking ? 'Stop Broadcast' : 'Start Broadcast'}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
            {data?.stops?.map((stop, index) => (
              <button
                key={index}
                onClick={() => updateLocation(stop.progress, stop.eta)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', padding: '15px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>{stop.name}</div>
                <div style={{ fontSize: '12px', color: '#a7a9be' }}>ETA: {stop.eta}m</div>
              </button>
            ))}
          </div>
        </div>

        {/* Passenger Attendance */}
        <div className="glass" style={{ padding: '24px', gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Daily Passenger Manifest</h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {Object.keys(data.attendance).map((student, i) => {
              const status = data.attendance[student];
              return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>{student}</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => markAttendance(student, true)}
                    style={{ background: status === true ? '#10b981' : 'transparent', color: status === true ? '#fff' : '#10b981', border: '1px solid #10b981', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Present
                  </button>
                  <button 
                    onClick={() => markAttendance(student, false)}
                    style={{ background: status === false ? '#ef4444' : 'transparent', color: status === false ? '#fff' : '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Absent
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default DriverDashboard;
