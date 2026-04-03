import { useEffect, useState } from 'react';
import {
  getCategoryBreakdownRequest,
  getRecentRequest,
  getSummaryRequest,
  getTrendRequest
} from '../services/dashboardService';
import { subscribeToRecordsUpdated } from '../utils/recordEvents';

export const useDashboard = () => {
  const [state, setState] = useState({ summary: null, category: [], trend: [], recent: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const backgroundRefresh = !loading;

      if (backgroundRefresh) setRefreshing(true);

      try {
        const [summary, category, trend, recent] = await Promise.all([
          getSummaryRequest(),
          getCategoryBreakdownRequest(),
          getTrendRequest(),
          getRecentRequest()
        ]);

        if (active) {
          setState({ summary, category, trend, recent });
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
  }, [reloadKey]);

  useEffect(() => subscribeToRecordsUpdated(() => setReloadKey((key) => key + 1)), []);

  return {
    ...state,
    loading,
    refreshing,
    refresh: () => setReloadKey((key) => key + 1)
  };
};
