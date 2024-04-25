// In src/routes/Clients.tsx
import { Button, List, Space, Spin, Table, Card, Typography, Breadcrumb, Tabs } from 'antd';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from "dayjs";
import { useParams } from 'react-router-dom';
import { NumberField, TextField } from '@refinedev/antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import Scheduler from './Scheduler/Scheduler'
import TabPane from 'antd/es/tabs/TabPane';
interface Client {

  name: string;
  lastName: string;
  primaryPhone: string;
  secondaryPhone: string;
  address: string;
  email: string;
  status: string;
  technicianSince: string;
}
const { Title, Text } = Typography;
const ShowTechnician: React.FC = () => {
  const [technician, setClient] = useState<Client>();
  const [isLoading, setIsLoading] = useState(true);
  let { technicianId } = useParams();

  const fetchClient = async () => {
    try {
      const response = await fetch(`/jsonapi/user/user/${technicianId}`);

      const json = await response.json();
      // Map the fetched data to fit the Client interface
      // This step depends on your actual data structure; adjust accordingly

      const technicianObj = json.data;

      const mappedClient: Client = {
        name: `${technicianObj.attributes.field_first_name} ${technicianObj.attributes.field_last_name}`,
        lastName: technicianObj.attributes.field_technicians_last_name,
        primaryPhone: technicianObj.attributes.field_primary_phone,
        secondaryPhone: technicianObj.attributes.field_secondary_phone,
        address: `${technicianObj.attributes.field_address.address_line1}, ${technicianObj.attributes.field_address.locality}, ${technicianObj.attributes.field_address.administrative_area}, ${technicianObj.attributes.field_address.postal_code}`,
        email: technicianObj.attributes.mail,
        status: technicianObj.attributes.field_technicians_status,
        technicianSince: technicianObj.attributes.created
      }
      setClient(mappedClient);

    } catch (error) {
      console.error('Failed to fetch technicians:', error);
    } finally {
      setIsLoading(false); // Set loading to false when the fetch is complete
    }
  };

  const getTechnicianDetails = (technician: any) => [
    { key: 'name', label: 'Name', value: <strong>{technician?.name}</strong> },
    { key: 'primaryPhone', label: 'Primary Phone', value: <strong>{formatPhoneNumber(technician?.primaryPhone)}</strong> },
    { key: 'secondaryPhone', label: 'Secondary Phone', value: <strong>{formatPhoneNumber(technician?.secondaryPhone)}</strong> },
    { key: 'technicianSince', label: 'Technician Since', value: <strong>{dayjs(technician?.technicianSince).format('MM/DD/YYYY')}</strong> },
    { key: 'address', label: 'Address', value: <strong>{technician?.address}</strong> },
    { key: 'email', label: 'Email', value: <strong>{technician?.email}</strong> },
    // Uncomment or add more fields as needed
    // { key: 'status', label: 'Status', value: technician?.status },
  ];
  useEffect(() => {
    fetchClient();
  }, []);
  const formattedDate = dayjs(technician?.technicianSince).format('MM/DD/YYYY');

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
          <Breadcrumb style={{ margin: '0' }}>
            <Breadcrumb.Item>
              <Link to="/technicians"><UserOutlined /> Technicians</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Show</Breadcrumb.Item>
          </Breadcrumb>
        </div>

        <div style={{ margin: "1rem 0" }}>
          <Link to="/technicians"> <ArrowLeftOutlined /> <Title level={5} style={{ display: "inline", marginLeft: "1rem" }}>Show Technicians</Title></Link>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Tabs defaultActiveKey="1" style={{backgroundColor: "#fff", borderTopLeftRadius: "10px", borderTopRightRadius: "10px"}}>
            <TabPane tab="Details" key="1">
              <Table dataSource={getTechnicianDetails(technician)} pagination={false} >
                <Table.Column title="Title" dataIndex="label" key="label" />
                <Table.Column title="Values" dataIndex="value" key="value" />
              </Table>
            </TabPane>

            <TabPane tab="Time Off" key="2">
              <Scheduler technicianId={technicianId} />
            </TabPane>
          </Tabs>


        </>

      )}
    </div>
  );

};

export default ShowTechnician;

// Repeat for Inventory, Appointments, and Technicians components
