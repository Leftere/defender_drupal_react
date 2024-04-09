// In src/routes/Clients.tsx
import { List } from 'antd';
import React, { useEffect, useState } from 'react';

const Clients: React.FC = () => {
    const [clients, setClients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    
    const fetchClients = async () => {
        try {
            const response = await fetch(`https://defender.ddev.site/jsonapi/node/clients`);
            const json = await response.json();
            // Map the fetched data to fit the Client interface
            // This step depends on your actual data structure; adjust accordingly
            const mappedClients = json.data.map((item: any, index: number) => ({
                id: (index + 1).toString(),
                title: item.attributes.title,
                firstName: item.attributes.field_clients_first_name,
                lastName: item.attributes.field_clients_last_name,
                primaryPhone: item.attributes.field_clients_primary_phone,
                employedSince: item.attributes.employedSince, // Adjust according to your data
                status: item.attributes.field_clients_status,
                address: item.attributes.field_clients_address,
                email: item.attributes.field_clients_e_mail,
                clientSince: item.attributes.created, // Assuming 'created' field indicates client since
            }));
            setClients(mappedClients);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setIsLoading(false); // Set loading to false when the fetch is complete
        }
    };
    useEffect(() => {
        fetchClients();
    }, []);

    console.log(clients)
    return (
        <List>

        </List>
    );

};

export default Clients;

// Repeat for Inventory, Appointments, and Technicians components
