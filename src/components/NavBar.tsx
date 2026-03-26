import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bus } from 'lucide-react';
import { motion } from 'framer-motion';

export const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeRole = localStorage.getItem('role');

  const handleSignOut = () => {
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <nav style={{ 
      position: 'fixed', top: 0, left: 0, width: '100%', 
      background: 'rgba(20, 22, 37, 0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '15px 40px', boxSizing: 'border-box'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <motion.button 
            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.2)' }} 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background 0.2s' }}
            title="Go Back"
          >
            <ChevronLeft size={24} />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.2)' }} 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(1)}
            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'background 0.2s' }}
            title="Go Forward"
          >
            <ChevronRight size={24} />
          </motion.button>
        </div>
        
        <motion.h1 
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate('/')} 
          style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#f0f0f5' }}
        >
          <Bus color="#10b981" size={28} /> GGU BUS PORTAL
        </motion.h1>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '15px', marginRight: '30px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '30px' }}>
          {[
            { id: 'student', label: 'Student' },
            { id: 'parent', label: 'Parent' },
            { id: 'driver', label: 'Driver' },
            { id: 'admin', label: 'Admin' }
          ].map(dash => (
            <motion.button
              key={dash.id}
              whileHover={{ scale: 1.1, color: '#fff' }}
              onClick={() => {
                // Only Student and Parent allow quick-switching without re-login for dev ease
                // Admin and Driver REQUIRE explicit login via the login portal
                if (dash.id === 'admin' || dash.id === 'driver') {
                   localStorage.removeItem('role'); // Clear role to force login check
                   navigate('/login');
                } else {
                   localStorage.setItem('role', dash.id);
                   window.location.href = `/${dash.id}`;
                }
              }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: activeRole === dash.id ? '#10b981' : '#a7a9be', 
                cursor: 'pointer', 
                fontWeight: activeRole === dash.id ? 'bold' : 'normal',
                fontSize: '14px' 
              }}
            >
              {dash.label}
            </motion.button>
          ))}
        </div>

        {activeRole ? (
          <button onClick={handleSignOut} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Sign Out</button>
        ) : (
          <button onClick={() => navigate('/login')} style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>Login Portal</button>
        )}
      </div>
    </nav>
  );
};
