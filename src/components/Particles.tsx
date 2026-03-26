import { motion } from 'framer-motion';

export const Particles = () => {
  const stars = Array.from({ length: 20 });
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: -1 }}>
      {stars.map((_, i) => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const duration = 2 + Math.random() * 3;
        const delay = Math.random() * 2;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [y + 'vh', (y - 10) + 'vh'] }}
            transition={{ duration, repeat: Infinity, delay, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              top: y + '%',
              left: x + '%',
              width: '4px',
              height: '4px',
              background: '#fff',
              borderRadius: '50%',
              boxShadow: '0 0 8px 2px rgba(255,255,255,0.8)'
            }}
          />
        );
      })}
    </div>
  );
};
