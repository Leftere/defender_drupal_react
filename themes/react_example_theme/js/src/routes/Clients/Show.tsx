// In src/routes/Clients.tsx
import { Button, List, Space, Spin, Table, Card, Typography, Breadcrumb } from 'antd';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from "dayjs";
import { useParams } from 'react-router-dom';
import { NumberField, TextField } from '@refinedev/antd';

interface Client {

  firstName: string;
  lastName: string;
  primaryPhone: string;
  address: string;
  email: string;

}
const { Title, Text } = Typography;
const ShowClient: React.FC = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  let { clientId } = useParams();

  // console.log(clientId)
  const fetchClient = async () => {
    try {
      const response = await fetch(`https://defender.ddev.site/jsonapi/node/clients/${clientId}`);

      const json = await response.json();
      // Map the fetched data to fit the Client interface
      // This step depends on your actual data structure; adjust accordingly

      const clientObj = json.data;

      const mappedClient: Client = {
        firstName: clientObj.attributes.field_clients_first_name,
        lastName: clientObj.attributes.field_clients_last_name,
        primaryPhone: clientObj.attributes.field_clients_primary_phone,
        address: clientObj.attributes.field_clients_address,
        email: clientObj.attributes.field_clients_e_mail,
      }
      setClient(mappedClient);

    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setIsLoading(false); // Set loading to false when the fetch is complete
    }
  };
  useEffect(() => {
    fetchClient();
  }, []);

  return (
    
    <div style={{ padding: '20px', margin: '0 auto' }}>
       <Breadcrumb style={{ margin: '16px 0' }}>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>Clients</Breadcrumb.Item>
      </Breadcrumb>
      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Card bordered={true} >
          <Title level={3}>Client Information</Title>
          <Title level={5}>Name</Title>
          <TextField value={`${client?.firstName}` + " " +  `${client?.lastName}` }/>
          <Title level={5}>Primary Phone number</Title >
          <NumberField value={client?.primaryPhone || ""} />
          <Title level={5}>{client?.address}</Title >
          <Title level={5}>{client?.email}</Title >
        </Card>
      )}
    </div>
  );

};

export default ShowClient;

// Repeat for Inventory, Appointments, and Technicians components
