'use client'; // if you're using it in a client component

import { Timecard } from '@/types/types.type';
import { useEffect, useState } from 'react';



interface UseTimecardsReturn {
  timecards: Timecard[];
  fetchTimecards: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useTimecards = (userId: string, companyId: string): UseTimecardsReturn => {
  const [timecards, setTimecards] = useState<Timecard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchTimecards = async () => {
    if (!userId || !companyId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/timecards', {
        method: 'GET',
        headers: {
          userId,
          companyId,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTimecards(data.timecards);
      } else {
        setError(data.error || 'Failed to fetch timecards');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {

    fetchTimecards();
  }, [userId, companyId]);

  return { timecards, fetchTimecards, loading, error };
};
