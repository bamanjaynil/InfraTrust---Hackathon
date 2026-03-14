import { create } from 'zustand';
import apiClient from '../services/apiClient';

const useContractorStore = create((set, get) => ({
  contractorProjects: [],
  materialRequests: [],
  deliveries: [],
  drivers: [],
  projectReports: [],
  loading: false,
  error: null,

  fetchContractorProjects: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      
      const queryString = queryParams.toString();
      const url = `/projects/contractor${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(url);
      set({ contractorProjects: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchMaterialRequests: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/material-requests/contractor');
      set({ materialRequests: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createMaterialRequest: async (requestData) => {
    set({ loading: true, error: null });
    try {
      await apiClient.post('/material-requests', requestData);
      await get().fetchMaterialRequests();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateMaterialRequestStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      await apiClient.patch(`/material-requests/${id}/status`, { status });
      await get().fetchMaterialRequests();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchDeliveries: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/deliveries/contractor');
      set({ deliveries: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchDrivers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/drivers');
      set({ drivers: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  createDriver: async (driverData) => {
    set({ loading: true, error: null });
    try {
      await apiClient.post('/drivers', driverData);
      await get().fetchDrivers();
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProjectReports: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/reports/project/${projectId}`);
      set({ projectReports: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchAllReports: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get(`/reports/contractor`);
      set({ projectReports: response.data.data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  }
}));

export default useContractorStore;
