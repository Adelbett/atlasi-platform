import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      // Navigation State
      currentStep: 0, // 0 is Landing, 1-7 are Wizard, 8 is Confirmation, 9 is Cancel
      setStep: (step) => set({ currentStep: step }),
      nextStep: () =>
        set((state) => {
          let next = state.currentStep + 1;
          // Sahara (ATL-1) has no fixation step — skip step 3 (طريقة التثبيت)
          if (next === 3 && state.design === 'sahara') next = 4;
          return { currentStep: Math.min(next, 9) };
        }),
      prevStep: () =>
        set((state) => {
          let prev = state.currentStep - 1;
          if (prev === 3 && state.design === 'sahara') prev = 2;
          return { currentStep: Math.max(prev, 0) };
        }),

      // Order Data State
      customerName: '',
      customerPhone: '',
      design: '',
      size: '',
      fixation: '',
      color: 'beige', // default color
      address: '',
      notes: '',
      finalId: '',
      cancelledOrders: [],

      // Loyalty — calculé après validation du n° de téléphone (Step 1)
      loyaltyDiscount: 0,    // 0 | 0.05 | 0.50
      loyaltyTier: '',       // 'جديد' | 'فضي' | 'بلاتيني'
      loyaltyOrderNum: 1,    // numéro de la commande en cours pour ce client

      // Setters
      updateField: (field, value) => set({ [field]: value }),
      setLoyaltyInfo: (discount, tier, orderNum) =>
        set({ loyaltyDiscount: discount, loyaltyTier: tier, loyaltyOrderNum: orderNum || 1 }),

      saveCancellation: (orderSnapshot) =>
        set((state) => ({
          cancelledOrders: [
            ...state.cancelledOrders,
            { ...orderSnapshot, cancelledAt: new Date().toISOString() }
          ],
          currentStep: 9
        })),

      resetOrder: () =>
        set({
          currentStep: 0,
          customerName: '',
          customerPhone: '',
          design: '',
          size: '',
          fixation: '',
          color: 'beige',
          address: '',
          notes: '',
          finalId: '',
          loyaltyDiscount: 0,
          loyaltyTier: '',
          loyaltyOrderNum: 1,
        })
    }),
    {
      name: 'atlasi-order-store'
    }
  )
);
