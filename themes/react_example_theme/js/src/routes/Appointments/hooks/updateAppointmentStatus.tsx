import { useState, useCallback } from 'react';

type UpdateAppointmentStatusHook = {
  updateAppointmentStatus: (id: string, status: string, color: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  csrfToken: string | null;
};

export const useUpdateAppointmentStatus = (): UpdateAppointmentStatusHook => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null); // State to store CSRF token

  const updateAppointmentStatus = useCallback(async (id: string, status: string, color: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch CSRF token from the server
      const tokenResponse = await fetch('/session/token?_format=json');
      if (!tokenResponse.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      const token = await tokenResponse.text(); // Get the CSRF token as text
      setCsrfToken(token); // Store the CSRF token
      const method = id ? 'PATCH' : 'POST'; // Determine method based on presence of an ID
      const url = id
        ? `/jsonapi/node/appointment1/${id}`
        : '/jsonapi/node/appointment1';

        let data = {
          "data": {
            "type": "node--appointment1",
            "id" : id,
            "attributes": {
             "field_status": status,
             "field_color": color
            },
    
          }
        };
      const response = await fetch(url, {
        method: method,
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
          'X-CSRF-Token': token // Use the fetched CSRF token
        },
         body: JSON.stringify(data)
      });

      console.log(response, "response")
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

  return { updateAppointmentStatus, isLoading, error, csrfToken };
};
