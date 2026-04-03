import { useEffect, useState } from 'react';
import { listRecordsRequest } from '../services/recordsService';
import { subscribeToRecordsUpdated } from '../utils/recordEvents';

export const useRecords = (filters) => {
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const serializedFilters = JSON.stringify(filters);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const backgroundRefresh = !loading;

      if (backgroundRefresh) setRefreshing(true);

      try {
        const q = new URLSearchParams(filters).toString();
        const res = await listRecordsRequest(q);

        if (active) {
          setRecords(res.data);
          setMeta(res.meta ?? { page: Number(filters.page) || 1, total: res.data?.length ?? 0 });
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [serializedFilters, reloadKey]);

  useEffect(() => subscribeToRecordsUpdated(() => setReloadKey((key) => key + 1)), []);

  return {
    records,
    meta,
    loading,
    refreshing,
    refresh: () => setReloadKey((key) => key + 1)
  };
};
