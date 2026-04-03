import api from './api';

export const listUsersRequest = async (query = 'page=1&limit=50') => (await api.get(`/users?${query}`)).data;

export const createUserRequest = async (payload) => (await api.post('/users', payload)).data.data;

export const deactivateUserRequest = async (userId) => (await api.delete(`/users/${userId}`)).data.data;

export const updateUserRequest = async (userId, payload) => (await api.patch(`/users/${userId}`, payload)).data.data;
