import { create } from 'zustand';
import * as adminService from '../services/adminService';

const useAdminStore = create((set, get) => ({
  projects: [],
  reports: [],
  deliveries: [],
  contractors: [],
  loading: false,
  error: null,

  fetchProjects: async (search = '') => {
    set({ loading: true, error: null });
    try {
      const data = await adminService.getAllProjects(search);
      set({ projects: data.projects || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchReports: async (search = '') => {
    set({ loading: true, error: null });
    try {
      const data = await adminService.getReports(search);
      set({ reports: data.reports || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchDeliveries: async () => {
    set({ loading: true, error: null });
    try {
      const data = await adminService.getDeliveries();
      set({ deliveries: data.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchContractors: async () => {
    set({ loading: true, error: null });
    try {
      const data = await adminService.getContractors();
      set({ contractors: data.contractors || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updateReportStatus: async (id, status) => {
    try {
      await adminService.updateReportStatus(id, status);
      set((state) => ({
        reports: state.reports.map((r) => r.id === id ? { ...r, status } : r)
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  updateProjectStatus: async (id, status) => {
    try {
      await adminService.updateProjectStatus(id, status);
      set((state) => ({
        projects: state.projects.map((p) => p.id === id ? { ...p, status } : p)
      }));
    } catch (err) {
      set({ error: err.message });
    }
  }
}));

export default useAdminStore;
