import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

export const IssueReporter = ({ username }: { username: string }) => {
  const [type, setType] = useState('Maintenance');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc) return toast.error('Please describe the issue.');
    
    setLoading(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, desc, by: username })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setDesc('');
      } else {
        toast.error('Failed to submit');
      }
    } catch (err) {
      toast.error('API Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass" style={{ padding: '24px', gridColumn: 'span 2' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertTriangle color="#f97316"/> Submit Report
      </h2>
      <p style={{ color: '#a7a9be', marginBottom: '20px', fontSize: '14px' }}>Let Admins know if there's a problem with maintenance, comfort, or bus delays.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', outline: 'none', cursor: 'pointer' }}
          >
            <option value="Maintenance" style={{ color: '#000' }}>Maintenance</option>
            <option value="Bus Delay" style={{ color: '#000' }}>Bus Delay</option>
            <option value="Comfort" style={{ color: '#000' }}>Comfort (AC/Seats)</option>
            <option value="Driver Behavior" style={{ color: '#000' }}>Driver Behavior</option>
          </select>
          <input 
            type="text" 
            placeholder="Describe the problem (e.g. AC isn't working on Bus 42)" 
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', outline: 'none' }}
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          style={{ background: '#f97316', color: '#fff', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer' }}
        >
          {loading ? 'Submitting to Admin...' : 'Submit Report'}
        </motion.button>
      </form>
    </div>
  );
};
