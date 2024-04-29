// useFetchClients.js
import { useState, useEffect } from 'react';

export const useFetchInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null); // Added error state
  const fetchInventory = async () => {
    try {
      const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/inventory`);
      const data = await response.json();
      setInventory(data); // Adjust based on your actual data structure
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    }
  };
  useEffect(() => {


    fetchInventory();
  }, []);

  return { inventory, refetch: fetchInventory, error }; 
};
