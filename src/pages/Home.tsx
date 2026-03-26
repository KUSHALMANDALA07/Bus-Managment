import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Bus, MapPin, Users, Activity, PhoneCall, Star, Zap } from 'lucide-react';
import { FloatingHelp } from '../components/FloatingHelp.tsx';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  in: { opacity: 1, scale: 1 },
  out: { opacity: 0, scale: 1.05 }
};

const testimonials = [
  { text: "GGU BUS PORTAL completely changed how I get to my morning classes. I never miss the bus anymore!", author: "Sarah J., Student" },
  { text: "The emergency alert feature gives me peace of mind while my child travels across campus.", author: "Michael T., Parent" },
  { text: "Taking attendance used to take 10 minutes. Now it takes 10 seconds. Best system ever.", author: "David W., Driver" }
];

const Home = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const textTitle = "Smart Bus Management".split(" ");

  // Testimonial Carousel auto-slide (5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.5 }}>
      {/* Navbar */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#f0f0f5', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bus color="#4f46e5" /> GGU BUS PORTAL
        </h1>
        <button 
          onClick={() => navigate('/login')}
          style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {textTitle.map((word, i) => (
            <motion.h1 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, type: 'spring', stiffness: 100 }}
              style={{ fontSize: '56px', fontWeight: '800', background: 'linear-gradient(to right, #4f46e5, #9333ea)', WebkitBackgroundClip: 'text', color: 'transparent' }}
            >
              {word}
            </motion.h1>
          ))}
        </div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ fontSize: '18px', color: '#a7a9be', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}
        >
          A revolutionary and fully animated transportation management system designed for students, parents, drivers, and administrators.
        </motion.p>
      </section>

      {/* Stats Counter Animation */}
      <section style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '20px' }}>
        {[
          { label: "Active Buses", val: 45, icon: <Bus size={24} color="#4f46e5" /> },
          { label: "Daily Riders", val: 1200, icon: <Users size={24} color="#10b981" /> },
          { label: "Routes", val: 12, icon: <MapPin size={24} color="#f97316" /> }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
          >
            <motion.div 
              animate={{ rotateY: 360, y: [0, -10, 0] }} 
              transition={{ rotateY: { duration: 3, repeat: Infinity, ease: "linear" }, y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }}
              style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '50%' }}
            >
              {stat.icon}
            </motion.div>
            <div>
              <h2 style={{ fontSize: '28px', margin: 0 }}>
                {/* Simulated Number Counter build up */}
                {stat.val}
              </h2>
              <p style={{ color: '#a7a9be', margin: 0 }}>{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Role Selection & Features (3D Flip Animation) */}
      <section style={{ perspective: '1000px', padding: '60px 40px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {[
          { title: "Student Dashboard", icon: <Users size={40} color="#4f46e5" />, path: "/student", desc: "Track buses and reserve seats" },
          { title: "Parent Dashboard", icon: <ShieldCheck size={40} color="#10b981" />, path: "/parent", desc: "Monitor child's daily transit" },
          { title: "Driver Dashboard", icon: <Bus size={40} color="#f97316" />, path: "/driver", desc: "Manage routes & attendance" },
          { title: "Admin Portal", icon: <Activity size={40} color="#9333ea" />, path: "/admin", desc: "Fleet & data analysis management" }
        ].map((role, idx) => (
          <motion.div 
            key={idx}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ delay: idx * 0.2, duration: 0.8, type: "spring" }}
            whileHover={{ scale: 1.05, rotateY: 10, boxShadow: '0 0 30px rgba(79,70,229,0.4)', borderColor: 'rgba(79,70,229,0.8)' }}
            onClick={() => navigate(role.path)}
            className="glass"
            style={{ padding: '40px 20px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', transformStyle: 'preserve-3d' }}
          >
            <motion.div whileHover={{ rotate: 360, scale: 1.2 }} transition={{ duration: 0.5 }}>
              {role.icon}
            </motion.div>
            <h2 style={{ fontSize: '22px', fontWeight: '600', transform: 'translateZ(20px)' }}>{role.title}</h2>
            <p style={{ color: '#a7a9be', fontSize: '14px', transform: 'translateZ(10px)' }}>{role.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Testimonial Carousel (5s Auto Sliding) */}
      <section style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '30px' }}>What Users Say</h2>
        <div style={{ position: 'relative', height: '150px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="glass"
              style={{ padding: '30px', position: 'absolute', width: '100%', boxSizing: 'border-box' }}
            >
              <Star color="#f97316" fill="#f97316" size={24} style={{ marginBottom: '15px' }} />
              <p style={{ fontSize: '18px', fontStyle: 'italic', marginBottom: '10px' }}>"{testimonials[currentTestimonial].text}"</p>
              <h4 style={{ color: '#4f46e5' }}>- {testimonials[currentTestimonial].author}</h4>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Features Showcase */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { title: "Live Tracking", icon: <MapPin /> },
            { title: "Emergency Support", icon: <PhoneCall /> },
            { title: "Smart Scheduling", icon: <Zap /> }
          ].map((f, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10, scale: 1.05 }}
              style={{ padding: '20px 40px', background: 'rgba(20,22,37,0.4)', borderRadius: '12px', minWidth: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div style={{ color: '#4f46e5' }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px' }}>{f.title}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      <FloatingHelp />
    </motion.div>
  );
};

export default Home;
