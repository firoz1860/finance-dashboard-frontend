import api from './api';

export const loginRequest = async (payload) => (await api.post('/auth/login', payload)).data.data;

export const meRequest = async () => (await api.get('/auth/me')).data.data;

export const logoutRequest = async () => (await api.post('/auth/logout')).data;
