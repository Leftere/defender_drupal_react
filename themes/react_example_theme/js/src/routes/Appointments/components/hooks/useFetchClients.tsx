// useFetchClients.js
import { useState, useEffect } from 'react';

export const useFetchClients = () => {
  const [clients, setClients] = useState([]);
  const fetchClients = async () => {
    try {
      const response = await fetch(`/jsonapi/node/clients`);
      
      const json = await response.json();

      const mappedClients = json.data.map((item: any, index: number) => {
        return {
          id: (index + 1).toString(),
          uuid: item.id,
          nid: item.attributes.drupal_internal__nid,
          title: item.attributes.title,
          firstName: item.attributes.field_clients_first_name,
          lastName: item.attributes.field_clients_last_name,
          primaryPhone: item.attributes.field_clients_primary_phone,
          employedSince: item.attributes.employedSince, // Adjust according to your data
          status: item.attributes.field_clients_status,
          address: `${item.attributes.field_address.address_line1}, ${item.attributes.field_address.locality}, ${item.attributes.field_address.administrative_area}, ${item.attributes.field_address.postal_code}`,
          zipCode: item.attributes.field_address.postal_code,
          email: item.attributes.field_clients_e_mail,
          clientSince: item.attributes.created, // Assuming 'created' field indicates client since
        }

      });
      setClients(mappedClients);
      
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } 
  };

  useEffect(() => {
    fetchClients();
  }, []);



  return { clients, refetch: fetchClients };
};
