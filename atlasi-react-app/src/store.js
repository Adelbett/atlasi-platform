import { create } from 'zustand';

export const useStore = create((set) => ({
  // Navigation State
  currentStep: 0, // 0 is Landing, 1-7 are Wizard, 8 is Confirmation
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 8) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),

  // Order Data State
  customerName: '',
  customerPhone: '',
  design: '',
  size: '',
  mounting: '',
  fabricColor: '',
  frameColor: '',
  address: '',
  notes: '',
  
  // Setters
  updateField: (field, value) => set({ [field]: value }),
  
  resetOrder: () => set({
    currentStep: 0,
    customerName: '',
    customerPhone: '',
    design: '',
    size: '',
    mounting: '',
    fabricColor: '',
    frameColor: '',
    address: '',
    notes: ''
  })
}));
