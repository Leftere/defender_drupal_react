// useFetchClients.js
import { useState, useEffect } from 'react';

export const useFetchServices = () => {
  const [clients, setClients] = useState([]);
  const fetchServices = async () => {
    try {
      const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/services`);
      const data = await response.json();
      setClients(data); // Adjust based on your actual data structure
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };
  useEffect(() => {


    fetchServices();
  }, []);

  return clients;
};
