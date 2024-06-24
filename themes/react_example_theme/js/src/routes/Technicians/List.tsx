// In src/routes/Technicians.tsx
import { Button, Col, List, Row, Space, Spin, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from "dayjs";
import { message, FormInstance } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import './styles.css';
interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  primaryPhone: string;
  title: string;
  employedSince: string;
  status: string,
  address: string;
  email: string;
  clientSince: string;
  uuid: string
  nid: string
}

interface RecordType {
  id: string; // Assuming there's an ID field
  // Define other fields here
  address: string
  // address: {
  //   street: string;
  //   city: string;
  //   state: string;
  //   zip: string;
  // };
  // Add any other properties that are accessed in your table
}


const Technicians: React.FC = () => {
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();


  const fetchTechnicians = async () => {

    try {
      const response = await fetch(`/jsonapi/user/user`);

      const json = await response.json();

      // Map the fetched data to fit the Technician interface
      // This step depends on your actual data structure; adjust accordingly
      const mappedTechnicians = json.data.filter((item: any) => item.attributes.display_name !== 'Anonymous').map((item: any, index: number) => {
        return {
          id: (index + 1).toString(),
          uuid: item.id,
          firstName: item.attributes.field_first_name,
          lastName: item.attributes.field_last_name,
          primaryPhone: item.attributes.field_primary_phone,
          salaryRate: item.attributes.field_salary_rate,
          address: `${item.attributes.field_address.address_line1}, ${item.attributes.field_address.locality}, ${item.attributes.field_address.administrative_area}, ${item.attributes.field_address.postal_code}`,
          email: item.attributes.mail,
          skills: item.attributes.field_skills,
        }

      });
      setTechnicians(mappedTechnicians);

    } catch (error) {
      console.error('Failed to fetch technicians:', error);
    } finally {
      setIsLoading(false); // Set loading to false when the fetch is complete
    }
  };
  useEffect(() => {
    fetchTechnicians();
  }, []);


  function formatPhoneNumber(phoneNumber: string) {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }
    return null;
  }

  return (
    <List>
      <Row align="middle">
        <Col flex="auto">
          <h2>Technicians</h2>
        </Col>
        {/* <Col>
          <Link to="create" style={{ float: 'right' }}><Button type="primary"><PlusOutlined />Create</Button></Link>
        </Col> */}
      </Row>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table dataSource={technicians} rowKey="id" style={{ marginTop: "1rem" }}>
          <Table.Column dataIndex="id" title="ID" />
          <Table.Column dataIndex="firstName" title="First Name" className='cell-width' />
          <Table.Column dataIndex="lastName" title="Last Name" className='cell-width' />
          <Table.Column dataIndex="primaryPhone" title="Primary Phone"
            className="primary-phone-column"
            render={(text, record: Technician) => {
              const formattedPhone = formatPhoneNumber(record.primaryPhone);
              return formattedPhone ? (
                <a href={`tel:${formattedPhone}`} target="_blank" rel="noopener noreferrer">
                  {formattedPhone}
                </a>
              ) : (
                <span>Invalid number</span> // Or however you wish to handle invalid numbers
              );
            }}
          />

          <Table.Column dataIndex="address" title="Address"
            className="primary-address"
            render={(text, record: RecordType) => {
              // Constructing the full address string from the address object
              const fullAddress = record?.address;

              // To be addedd 
              // ? `${record.address.street}, ${record.address.city}, ${record.address.state}, ${record.address.zip}`
              // : 'N/A';

              // Encoding the full address for the Google Maps search query
              const mapsQuery = encodeURIComponent(fullAddress);

              return (
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noopener noreferrer">
                  {fullAddress}
                </a>
              );
            }}
          />
          <Table.Column dataIndex="email" title="Email"
            render={(text, record: Technician) => (
              <a href={`mailto:${record.email}`} target="_blank" rel="noopener noreferrer">
                {record.email}
              </a>
            )} />
          <Table.Column dataIndex="skills" title="Skills" />
          {/* <Table.Column dataIndex="clientSince" title="Technician Since"
            render={(text, record: Technician) => <span>{dayjs(record.clientSince).format("MM/DD/YYYY")}</span>} /> */}
          <Table.Column title="Actions" dataIndex="actions" key="actions"
            render={(_, record: Technician) => (
              <Space>
                {/* <Button icon={<EditOutlined />} type="default" onClick={() => handleEdit(record.id)}
                  
                /> */}
                {/* <Link to={`edit/${record.uuid}`} className="ant-btn" type="default">  <EditOutlined /> </Link> */}
                <Link to={`show/${record.uuid}`} className="ant-btn" type="default">    <EyeOutlined /> </Link>

              </Space>
            )} />
        </Table>
      )}

    </List>
  );

};

export default Technicians;

// Repeat for Inventory, Appointments, and Technicians components
