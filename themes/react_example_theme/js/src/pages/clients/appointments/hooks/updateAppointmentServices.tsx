// useUpdateAppointmentServices.ts
import { useCallback, useState } from 'react';

interface UpdateAppointmentServicesHook {
  updateAppointmentServices: (Id: string, serviceStateValue: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useUpdateAppointmentServices = (): UpdateAppointmentServicesHook => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateAppointmentServices = useCallback(async (Id: string, serviceStateValue: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/appointments/${Id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceState: serviceStateValue, // Match this with your backend's expected format
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment services');
      }

      // Handle response if needed
    } catch (err) {
      console.error('Failed to update the appointment services:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { updateAppointmentServices, isLoading, error };
};
