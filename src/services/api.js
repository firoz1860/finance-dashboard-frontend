import axios from 'axios';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;
const fallbackBaseUrls = configuredBaseUrl
  ? [configuredBaseUrl]
  : ['http://localhost:5050/api', 'http://localhost:5000/api'];

let activeBaseIndex = 0;

const api = axios.create({ baseURL: fallbackBaseUrls[activeBaseIndex] });

api.interceptors.request.use((cfg) => {
  cfg.baseURL = fallbackBaseUrls[activeBaseIndex];
  const token = localStorage.getItem('finance-token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const canFallback =
      !configuredBaseUrl &&
      error?.code === 'ERR_NETWORK' &&
      !error.config?._retryWithFallback &&
      activeBaseIndex < fallbackBaseUrls.length - 1;

    if (!canFallback) return Promise.reject(error);

    activeBaseIndex += 1;
    const retryConfig = {
      ...error.config,
      baseURL: fallbackBaseUrls[activeBaseIndex],
      _retryWithFallback: true
    };

    return api.request(retryConfig);
  }
);

export default api;
