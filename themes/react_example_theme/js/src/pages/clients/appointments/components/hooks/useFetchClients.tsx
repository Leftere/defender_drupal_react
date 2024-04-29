// useFetchClients.js
import { useState, useEffect } from 'react';

export const useFetchClients = () => {
  const [clients, setClients] = useState([]);
  const fetchClients = async () => {
    try {
      const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/clients`);
      const data = await response.json();
      setClients(data); // Adjust based on your actual data structure
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);



  return { clients, refetch: fetchClients };
};
