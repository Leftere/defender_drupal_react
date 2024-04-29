// useFetchTechnicians.js
import { useState, useEffect } from 'react';

export const useFetchTechnicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const fetchTechnicians = async () => {
    try {
      const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/technicians`);
      const data = await response.json();
      setTechnicians(data); // Adjust based on your actual data structure
    } catch (error) {
      console.error("Failed to fetch technicians:", error);
    }
  };
  useEffect(() => {
    fetchTechnicians();
  }, []);


  return technicians;
};
