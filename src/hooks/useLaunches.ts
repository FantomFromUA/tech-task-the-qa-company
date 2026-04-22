import { useEffect, useState } from 'react';

export interface Launch {
  id: string;
  name: string;
  date_utc: string;
  success: boolean | null;
  details: string | null;
  flight_number: number;
  links: {
    patch: { small: string | null; large: string | null };
    webcast: string | null;
    article: string | null;
    wikipedia: string | null;
  };
}

interface ApiResponse {
  docs: Launch[];
  totalDocs: number;
}

const FIELD_TO_API: Record<string, string> = {
  flight_number: 'flight_number',
  name: 'name',
  date_utc: 'date_utc',
  success: 'success',
};

export type StatusFilter = 'all' | 'success' | 'failed' | 'unknown';

interface UseLaunchesOptions {
  page: number;
  pageSize: number;
  search: string;
  sortField: string | null;
  sortDir: 'asc' | 'desc';
  statusFilter: StatusFilter;
}

interface UseLaunchesResult {
  launches: Launch[];
  totalDocs: number;
  loading: boolean;
  error: string | null;
}

function buildStatusQuery(statusFilter: StatusFilter): object {
  if (statusFilter === 'success') return { success: true };
  if (statusFilter === 'failed') return { success: false };
  if (statusFilter === 'unknown') return { success: null };
  return {};
}

export function useLaunches({ page, pageSize, search, sortField, sortDir, statusFilter }: UseLaunchesOptions): UseLaunchesResult {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch('https://api.spacexdata.com/v4/launches/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: {
          ...(search ? { name: { $regex: search, $options: 'i' } } : {}),
          ...buildStatusQuery(statusFilter),
        },
        options: {
          page: page + 1,
          limit: pageSize,
          sort: sortField
            ? { [FIELD_TO_API[sortField]]: sortDir }
            : { date_utc: 'desc' },
        },
      }),
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data: ApiResponse) => {
        setLaunches(data.docs);
        setTotalDocs(data.totalDocs);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [page, pageSize, search, sortField, sortDir, statusFilter]);

  return { launches, totalDocs, loading, error };
}
