export const getApiErrorMessage = (error, fallback = 'Request failed') => {
  const statusCode = error?.response?.status;
  const apiMessage = error?.response?.data?.message;

  if (statusCode && apiMessage) {
    return `${statusCode}: ${apiMessage}`;
  }

  if (error?.code === 'ERR_NETWORK') {
    return 'Cannot connect to API server. Start backend and verify API base URL.';
  }

  if (apiMessage) return apiMessage;
  return fallback;
};
