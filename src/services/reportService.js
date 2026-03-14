import apiClient from './apiClient';

export const submitReport = async (reportData) => {
  const response = await apiClient.post('/reports', reportData);
  return response.data;
};

export const getMyReports = async () => {
  const response = await apiClient.get('/reports/my');
  return response.data;
};

export const getAllReports = async () => {
  const response = await apiClient.get('/reports');
  return response.data;
};
