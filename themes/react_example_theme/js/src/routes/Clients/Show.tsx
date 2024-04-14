// In src/routes/Clients.tsx
import { Button, List, Space, Spin, Table, Card, Typography, Breadcrumb } from 'antd';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from "dayjs";
import { useParams } from 'react-router-dom';
import { NumberField, TextField } from '@refinedev/antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';

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

  function formatPhoneNumber(phoneNumber = '') {
    const cleaned = phoneNumber.replace(/\D/g, ''); // Remove all non-digit characters
    const match = cleaned.match(/^1?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
        return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }
    return ""; // Or return an unformatted phoneNumber, or handle as needed
}


  return (

    <div style={{ margin: '0 auto' }}>
      <div>
        <div>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>
              <Link to="/clients"><UserOutlined /> Clients</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Show</Breadcrumb.Item>
          </Breadcrumb>
          </div>

        <div style={{paddingBottom: "1rem"}}>
          <Link to="/clients"> <ArrowLeftOutlined /> <Title level={5} style={{ display: "inline", marginLeft: "1rem" }}>Show Client</Title></Link>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Card bordered={true} >
          <Title level={3}>Client Information</Title>
          <Title level={5}>Name</Title>
          <TextField value={`${client?.firstName}` + " " + `${client?.lastName}`} />
          <Title level={5}>Primary Phone</Title >
          <Text>{formatPhoneNumber(client?.primaryPhone || "")}</Text>
          <Title level={5}>{client?.address}</Title >
          <Title level={5}>{client?.email}</Title >
        </Card>
      )}
    </div>
  );

};

export default ShowClient;

// Repeat for Inventory, Appointments, and Technicians components
