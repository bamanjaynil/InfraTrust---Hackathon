import apiClient from './apiClient';

export const getUsersByRole = async (role) => {
  return apiClient.get(`/users?role=${role}`);
};
