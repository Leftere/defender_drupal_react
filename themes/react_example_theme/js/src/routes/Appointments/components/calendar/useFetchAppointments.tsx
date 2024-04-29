// useFetchAppointment.js
import { useState, useEffect } from 'react';

export const useFetchAppointment = () => {
  const [appointment, setAppointment] = useState([]);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/appointments`);
        const data = await response.json();
        setAppointment(data); // Adjust based on your actual data structure
      } catch (error) {
        console.error("Failed to fetch Appointment:", error);
      }
    };

    fetchAppointment();
  }, []);


  return appointment;
};
