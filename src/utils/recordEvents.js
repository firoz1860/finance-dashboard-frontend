const RECORDS_UPDATED_EVENT = 'finance:records-updated';

export const emitRecordsUpdated = () => {
  window.dispatchEvent(new Event(RECORDS_UPDATED_EVENT));
};

export const subscribeToRecordsUpdated = (listener) => {
  window.addEventListener(RECORDS_UPDATED_EVENT, listener);

  return () => {
    window.removeEventListener(RECORDS_UPDATED_EVENT, listener);
  };
};
