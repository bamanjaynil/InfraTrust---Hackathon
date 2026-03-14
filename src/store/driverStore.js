import { create } from 'zustand';
import driverService from '../services/driverService';

const useDriverStore = create((set, get) => ({
  driverDeliveries: [],
  activeDelivery: null,
  trackingStatus: 'IDLE', // IDLE, TRACKING, STOPPED
  loading: false,
  error: null,

  fetchDriverDeliveries: async (driverId) => {
    set({ loading: true, error: null });
    try {
      const response = await driverService.getDriverDeliveries(driverId);
      set({ driverDeliveries: response.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchDeliveryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await driverService.getDeliveryById(id);
      set({ activeDelivery: response.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  startDelivery: async (id) => {
    set({ loading: true, error: null });
    try {
      await driverService.startDelivery(id);
      set({ trackingStatus: 'TRACKING', loading: false });
      // Refresh active delivery
      get().fetchDeliveryById(id);
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  markArrived: async (id) => {
    set({ loading: true, error: null });
    try {
      await driverService.markArrived(id);
      set({ loading: false });
      get().fetchDeliveryById(id);
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  completeDelivery: async (id) => {
    set({ loading: true, error: null });
    try {
      await driverService.completeDelivery(id);
      set({ trackingStatus: 'STOPPED', loading: false });
      get().fetchDeliveryById(id);
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateTracking: async (trackingData) => {
    try {
      await driverService.sendTrackingData(trackingData);
    } catch (err) {
      console.error('Tracking update failed:', err);
    }
  }
}));

export default useDriverStore;
