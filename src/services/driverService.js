import apiClient from './apiClient';

export const getDriverDeliveries = async (driverId) => {
  const response = await apiClient.get('/deliveries/driver', { params: { driver_id: driverId } });
  return response.data;
};

export const getDeliveryById = async (id) => {
  const response = await apiClient.get(`/deliveries/${id}`);
  return response.data;
};

export const startDelivery = async (id) => {
  const response = await apiClient.post(`/deliveries/${id}/start`);
  return response.data;
};

export const markArrived = async (id) => {
  const response = await apiClient.post(`/deliveries/${id}/arrive`);
  return response.data;
};

export const completeDelivery = async (id) => {
  const response = await apiClient.post(`/deliveries/${id}/complete`);
  return response.data;
};

export const verifyDelivery = async (passport_id, arrival_lat, arrival_lng) => {
  const response = await apiClient.post('/deliveries/verify', { passport_id, arrival_lat, arrival_lng });
  return response.data;
};

export const sendTrackingData = async (trackingData) => {
  const response = await apiClient.post('/tracking', trackingData);
  return response.data;
};

const driverService = {
  getDriverDeliveries,
  getDeliveryById,
  startDelivery,
  markArrived,
  completeDelivery,
  verifyDelivery,
  sendTrackingData
};

export default driverService;
