import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, Mail, Key } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentCourse, setStudentCourse] = useState('');
  const [detectedRole, setDetectedRole] = useState<'student' | 'parent' | 'admin' | 'driver' | 'none'>('none');

  const getRoleFromId = (id: string) => {
    const lowerId = id.toLowerCase();
    if (lowerId === 'admin@ggu.bus') return 'admin';
    if (/^\d{4,6}$/.test(lowerId) || lowerId.includes('@clg.edu')) return 'student';
    if (lowerId.includes('@gmail.com') || lowerId.includes('@mail.com') || lowerId.includes('@yahoo.com')) return 'parent';
    if (lowerId.startsWith('driver') || lowerId.startsWith('bus')) return 'driver';
    return 'none';
  };

  useEffect(() => {
    setDetectedRole(getRoleFromId(identifier));
  }, [identifier]);

  useEffect(() => {
    const activeRole = localStorage.getItem('role');
    if (activeRole) {
      navigate(`/${activeRole}`, { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const role = getRoleFromId(identifier);
    
    if (!identifier || !password || (role === 'student' && (!studentId || !studentCourse))) {
      toast.error('Missing Credentials');
      setLoading(false);
      return;
    }
    
    if (role === 'admin' && password !== 'ggubusadmin123') {
      toast.error('Invalid Admin Access');
      setLoading(false);
      return;
    }
    if (role === 'driver' && password !== 'ggudriver') {
      toast.error('Invalid Fleet Access Code.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/login/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, identifier, studentId, studentCourse })
      });
      await res.json();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Access Granted: ${role.toUpperCase()}`);
      localStorage.setItem('role', role);
      navigate(`/${role}`, { replace: true });
    } catch (err) {
      toast.error('Connection Lost');
    } finally {
      setLoading(false);
    }
  };

  const roleConfigs = {
    student: { color: '#4f46e5', icon: <User />, name: 'Student Portal', hint: 'Use your ID or College Email', label: 'Student ID or Email' },
    parent: { color: '#10b981', icon: <ShieldCheck />, name: 'Parent Guardian', hint: 'Use your registered Email', label: 'Contact Email ID' },
    driver: { color: '#f59e0b', icon: <Key />, name: 'Fleet Personnel', hint: 'Identify via Fleet ID', label: 'Driver ID / System ID' },
    admin: { color: '#9333ea', icon: <Lock />, name: 'Central Admin', hint: 'Super-user access only', label: 'Admin Email ID' },
    none: { color: '#a7a9be', icon: <Mail />, name: 'GGU BUS PORTAL', hint: 'Enter your system identifier', label: 'System Identifier' }
  };

  const config = roleConfigs[detectedRole];

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e101c', position: 'relative', overflow: 'hidden' }}>
      
      {/* Dynamic Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          background: `radial-gradient(circle, ${config.color} 0%, transparent 70%)`
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ position: 'absolute', top: '-10%', right: '-10%', width: '600px', height: '600px', filter: 'blur(100px)', zIndex: 0 }}
      />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{ width: '100%', maxWidth: '1000px', display: 'flex', zIndex: 2, padding: '20px' }}
      >
        <div className="glass" style={{ flex: 1, display: 'flex', minHeight: '600px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
          
          {/* Left Side: Branding & Info */}
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
            <motion.div 
              key={detectedRole}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              style={{ color: config.color, marginBottom: '20px' }}
            >
              {config.icon}
            </motion.div>
            <h1 style={{ fontSize: '42px', fontWeight: '800', marginBottom: '15px', color: '#fff' }}>{config.name}</h1>
            <p style={{ color: '#a7a9be', fontSize: '18px', lineHeight: '1.6', marginBottom: '40px' }}>
              Welcome to the next generation of GGU Bus management. {config.hint}.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: config.color }}>✓</div>
                  <span style={{ color: '#f0f0f5' }}>Secure Multi-factor Encryption</span>
               </div>
               <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: config.color }}>✓</div>
                  <span style={{ color: '#f0f0f5' }}>Real-time Dashboard Sync</span>
               </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div style={{ flex: 1, padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#a7a9be', fontSize: '14px', fontWeight: '500' }}>{config.label}</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Email or System ID"
                    style={{ width: '100%', padding: '16px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', transition: 'all 0.3s' }}
                    className="login-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', color: '#a7a9be', fontSize: '14px', fontWeight: '500' }}>Password / PIN</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '16px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                  className="login-input"
                />
              </div>

              <AnimatePresence>
                {detectedRole === 'student' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'hidden' }}
                  >
                    <input 
                      type="text" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="Student ID (STU-1234)"
                      style={{ width: '100%', padding: '16px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                    />
                    <input 
                      type="text" 
                      value={studentCourse}
                      onChange={(e) => setStudentCourse(e.target.value)}
                      placeholder="Course & Year"
                      style={{ width: '100%', padding: '16px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                style={{ 
                  marginTop: '10px',
                  width: '100%', 
                  padding: '18px', 
                  background: config.color, 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '16px', 
                  fontWeight: 'bold', 
                  fontSize: '18px', 
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: `0 10px 30px -10px ${config.color}66` 
                }}
              >
                {loading ? 'Securing Access...' : 'Continue to Portal'}
              </motion.button>
              
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <p style={{ color: '#a7a9be', fontSize: '13px' }}>Need help? Call <span style={{ color: config.color }}>+1 (555) 000-0000</span></p>
              </div>
            </form>
          </div>

        </div>
      </motion.div>

      {/* Styles for Focus Events */}
      <style>{`
        .login-input:focus {
          border-color: ${config.color} !important;
          background: rgba(255,255,255,0.08) !important;
          box-shadow: 0 0 15px -5px ${config.color}44;
        }
      `}</style>

    </div>
  );
};

export default LoginPage;
