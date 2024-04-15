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
  status: string;
  clientSince: string;
}
const { Title, Text } = Typography;
const ShowClient: React.FC = () => {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  let { clientId } = useParams();
  // console.log(clientId)
  const fetchClient = async () => {
    try {
      const response = await fetch(`/jsonapi/node/clients/${clientId}`);

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
        status: clientObj.attributes.field_clients_status,
        clientSince: clientObj.attributes.created
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
  const formattedDate = dayjs(client?.clientSince).format('MM/DD/YYYY');

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
          <Title level={5}>Client Since</Title >
          <TextField value={formattedDate} />
          <Title level={5}>Address</Title >
          <TextField value={client?.address} />
          <Title level={5}>Email</Title >
          <TextField value={client?.email} />
          <Title level={5}>Status</Title >
          <TextField value={client?.status} />
        </Card>
      )}
    </div>
  );

};

export default ShowClient;

// Repeat for Inventory, Appointments, and Technicians components
