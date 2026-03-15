import apiClient from './apiClient';
import { approveProjectApplication } from './projectService';

export const getAllProjects = async (search = '') => {
  const response = await apiClient.get('/projects', { params: { search } });
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await apiClient.post('/projects', projectData);
  return response.data;
};

export const getProjectById = async (id) => {
  const response = await apiClient.get(`/projects/${id}`);
  return response.data;
};

export const getReports = async (search = '') => {
  const response = await apiClient.get('/reports', { params: { search } });
  return response.data;
};

export const updateReportStatus = async (id, status) => {
  const response = await apiClient.patch(`/reports/${id}/status`, { status });
  return response.data;
};

export const getDeliveries = async () => {
  const response = await apiClient.get('/deliveries');
  return response.data;
};

export const assignDriverToDelivery = async (delivery_id, driver_id) => {
  const response = await apiClient.post('/deliveries/assign-driver', { delivery_id, driver_id });
  return response.data;
};

export const getContractors = async () => {
  const response = await apiClient.get('/contractors');
  return response.data;
};

export const updateProjectStatus = async (id, status) => {
  const response = await apiClient.patch(`/projects/${id}/status`, { status });
  return response.data;
};

export const createMaterialPassport = async (payload) => {
  const response = await apiClient.post('/passports/create', payload);
  return response.data;
};

const adminService = {
  getAllProjects,
  createProject,
  getProjectById,
  getReports,
  updateReportStatus,
  getDeliveries,
  getContractors,
  updateProjectStatus,
  approveProjectApplication,
  createMaterialPassport
};

export default adminService;
