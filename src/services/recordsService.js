import api from './api';

export const listRecordsRequest = async (q = '') => (await api.get(`/records${q ? `?${q}` : ''}`)).data;

export const getRecordRequest = async (recordId) => (await api.get(`/records/${recordId}`)).data.data;

export const createRecordRequest = async (payload) => (await api.post('/records', payload)).data.data;

export const updateRecordRequest = async (recordId, payload) => (await api.patch(`/records/${recordId}`, payload)).data.data;

export const deleteRecordRequest = async (recordId) => (await api.delete(`/records/${recordId}`)).data.data;
