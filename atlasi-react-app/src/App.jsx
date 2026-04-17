import React from 'react';
import './App.css';
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

      {currentStep === 0 && <Footer />}

      {/* Floating WhatsApp - Hidden on mobile if bottom nav exists, or moved up */}
      <a 
        href="https://wa.me/966548105757" 
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-4 bg-[#25D366] w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-xl z-[40] text-white text-3xl transition-transform hover:scale-110"
      >
        <FiMessageCircle />
      </a>
    </div>
  );
}

export default App;
