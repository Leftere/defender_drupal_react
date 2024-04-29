import { useState, useCallback } from 'react';

type UpdateAppointmentStatusHook = {
  updateAppointmentStatus: (id: string, status: string, color: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export const useUpdateAppointmentStatus = (): UpdateAppointmentStatusHook => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateAppointmentStatus = useCallback(async (id: string, status: string, color: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, color }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Response handling logic here
    } catch (error) {
      console.error('Failed to update the appointment status:', error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateAppointmentStatus, isLoading, error };
};
