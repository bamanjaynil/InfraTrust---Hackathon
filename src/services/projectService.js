import apiClient from './apiClient';

export const createProject = async (projectData) => {
  const response = await apiClient.post('/projects', projectData);
  return response.data;
};

export const applyToProject = async (projectId, payload) => {
  const response = await apiClient.post(`/projects/${projectId}/apply`, payload);
  return response.data;
};

export const approveProjectApplication = async (applicationId) => {
  const response = await apiClient.post(`/projects/applications/${applicationId}/approve`);
  return response.data;
};

export const getProjects = async () => {
  const response = await apiClient.get('/projects');
  return response.data;
};

export const getContractorProjects = async (contractorId) => {
  const response = await apiClient.get(`/projects?contractor_id=${contractorId}`);
  return response.data;
};

export const getAllProjects = async () => {
  const response = await apiClient.get('/projects');
  return response.data;
};

export const getAreaProjects = async (district, city) => {
  const response = await apiClient.get(`/projects?type=area&district=${encodeURIComponent(district || '')}&city=${encodeURIComponent(city || '')}`);
  return response.data;
};

export const getNearbyProjects = async (lat, lng, radius = 20) => {
  const response = await apiClient.get(`/projects?type=nearby&lat=${lat}&lng=${lng}&radius=${radius}`);
  return response.data;
};

export const getProjectById = async (id) => {
  const response = await apiClient.get(`/projects/${id}`);
  return response.data;
};

export const updateProjectStatus = async (id, status) => {
  const response = await apiClient.patch(`/projects/${id}/status`, { status });
  return response.data;
};
