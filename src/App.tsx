import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'sonner';

// Import Pages (to be created)
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import StudentDashboard from './pages/StudentDashboard.tsx';
import ParentDashboard from './pages/ParentDashboard.tsx';
import DriverDashboard from './pages/DriverDashboard.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import { Particles } from './components/Particles.tsx';
import { NavBar } from './components/NavBar.tsx';

const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole: string }) => {
  const currentRole = localStorage.getItem('role');
  if (!currentRole || currentRole !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const IndexRoute = () => {
  const role = localStorage.getItem('role');
  if (role) return <Navigate to={`/${role}`} replace />;
  return <Navigate to="/login" replace />;
};

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <>
      <NavBar />
      <div style={{ paddingTop: '80px' }}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/student" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/parent" element={<ProtectedRoute requiredRole="parent"><ParentDashboard /></ProtectedRoute>} />
            <Route path="/driver" element={<ProtectedRoute requiredRole="driver"><DriverDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </AnimatePresence>
      </div>
    </>
  );
}

const LoadingScreen = () => (
  <motion.div 
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8 }}
    style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', background: '#0d0f1a' }}
  >
    <motion.div
      animate={{ rotate: 360, scale: [1, 1.2, 1] }}
      transition={{ rotate: { repeat: Infinity, duration: 2, ease: "linear" }, scale: { repeat: Infinity, duration: 1, ease: "easeInOut" } }}
      style={{ width: '64px', height: '64px', border: '4px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%' }}
    />
    <motion.h2 
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ repeat: Infinity, duration: 1 }}
      style={{ marginTop: '20px', color: '#fff', fontSize: '24px' }}
    >
      Loading System...
    </motion.h2>
  </motion.div>
);

const MouseFollower = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updatePos = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', updatePos);
    return () => window.removeEventListener('mousemove', updatePos);
  }, []);

  return (
    <motion.div
      animate={{ x: pos.x - 15, y: pos.y - 15 }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        background: 'rgba(79, 70, 229, 0.2)',
        border: '1px solid rgba(79, 70, 229, 0.5)',
        pointerEvents: 'none',
        zIndex: 9999,
        boxShadow: '0 0 20px 5px rgba(79, 70, 229, 0.4)'
      }}
    />
  );
}

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <Router>
      <div className="bg-gradient-anim" />
      <Particles />
      <MouseFollower />
      <Toaster theme="dark" position="top-right" />
      <AnimatePresence>
        {loading ? <LoadingScreen key="loading" /> : <AnimatedRoutes key="routes" />}
      </AnimatePresence>
    </Router>
  );
}

export default App;
