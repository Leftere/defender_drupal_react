import { useState, useEffect } from 'react';

interface AppointmentAttributes {
  title: string;
  field_status: string;
  field_appointment_start: string;
  field_appointment_end: string;
  field_invoices?: string; // Optional field
}

interface Appointment {
  id: string;
  attributes: AppointmentAttributes;
}

const useFetchAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointmentsData = async () => {
      try {
        const response = await fetch('/jsonapi/node/appointment1');
        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }
        const json = await response.json();
        setAppointments(json.data); // Ensure the API response matches the expected structure
      } catch (error) {
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointmentsData();
  }, []);

  return { appointments, isLoading, error };
};

export default useFetchAppointments;