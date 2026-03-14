import { create } from 'zustand';

const useCitizenStore = create((set) => ({
  userProfile: null,
  userLocation: null,
  citizenProjects: [],
  citizenReports: [],
  filters: {
    state: '',
    district: '',
    status: ''
  },
  
  setUserProfile: (profile) => set({ userProfile: profile }),
  setUserLocation: (location) => set({ userLocation: location }),
  setCitizenProjects: (projects) => set({ citizenProjects: projects }),
  setCitizenReports: (reports) => set({ citizenReports: reports }),
  setFilters: (newFilters) => set((state) => ({ 
    filters: { ...state.filters, ...newFilters } 
  })),
  clearFilters: () => set({ 
    filters: { state: '', district: '', status: '' } 
  })
}));

export default useCitizenStore;
