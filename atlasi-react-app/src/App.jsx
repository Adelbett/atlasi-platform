import React from 'react';
import { useStore } from './store';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './components/Landing';
import Wizard from './components/Wizard';
import Header from './components/Header';
import Footer from './components/Footer';
import { FiMessageCircle } from 'react-icons/fi';

function App() {
  const currentStep = useStore(state => state.currentStep);

  return (
    <div dir="rtl" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100vw' }}>
      
      <Header />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <AnimatePresence mode="wait">
          {currentStep === 0 ? (
            <motion.div
              key="landing"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
            >
              <Landing />
            </motion.div>
          ) : (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ flexGrow: 1, width: '100%', paddingBottom: '3rem' }}
            >
              <Wizard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      {/* Floating WhatsApp */}
      <a 
        href="#" 
        style={{
          position: 'fixed', bottom: '2rem', left: '1rem',
          backgroundColor: '#25D366', width: '60px', height: '60px',
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 25px rgba(37, 211, 102, 0.4)', zIndex: 1000,
          color: 'white', fontSize: '30px'
        }}
      >
        <FiMessageCircle />
      </a>
    </div>
  );
}

export default App;
