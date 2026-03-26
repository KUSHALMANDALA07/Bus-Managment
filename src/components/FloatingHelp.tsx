import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';

export const FloatingHelp = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="glass"
            style={{
              position: 'fixed',
              bottom: '80px',
              right: '30px',
              width: '300px',
              padding: '20px',
              zIndex: 1000,
              background: 'rgba(20, 22, 37, 0.95)',
              border: '1px solid rgba(79, 70, 229, 0.4)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h3 style={{ color: '#f0f0f5' }}>Need Help?</h3>
              <X cursor="pointer" onClick={() => setOpen(false)} color="#a7a9be" />
            </div>
            <p style={{ color: '#a7a9be', fontSize: '14px', marginBottom: '10px' }}>
              Welcome to the Smart Bus Management System! Select a role below to explore the distinct dashboards.
            </p>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
                fontWeight: '600'
              }}
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
          border: 'none',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
        }}
      >
        <HelpCircle size={24} />
      </motion.button>
    </>
  );
};
