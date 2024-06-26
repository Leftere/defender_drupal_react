import { Button, Col, List, Row, Space, Spin, Table, Modal, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from "dayjs";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import './styles.css';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  primaryPhone: string;
  title: string;
  employedSince: string;
  status: string;
  address: string;
  email: string;
  clientSince: string;
  uuid: string;
  nid: string;
}

interface RecordType {
  id: string; // Assuming there's an ID field
  address: string;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const deleteClient = async (id: string) => {
    try {
      const tokenResponse = await fetch('/session/token?_format=json');
      if (!tokenResponse.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      const token = await tokenResponse.text();
      const url = `/jsonapi/node/clients/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
          'X-CSRF-Token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      message.success("Client deleted successfully");
      fetchClients(); // Refresh the client list
    } catch (error: any) {
      console.error("Error deleting client:", error);
      message.error("Failed to delete client");
    } finally {
      setIsModalVisible(false);
    }
  };

  const showDeleteConfirm = (id: string) => {
    setClientToDelete(id);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setClientToDelete(null);
  };

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
          email: item.attributes.field_clients_e_mail,
          clientSince: item.attributes.created, // Assuming 'created' field indicates client since
        };
      });
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
          <h2>Clients</h2>
        </Col>
        <Col>
          <Link to="create" style={{ float: 'right' }}>
            <Button type="primary"><PlusOutlined /> Create</Button>
          </Link>
        </Col>
      </Row>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table dataSource={clients} rowKey="id" style={{ marginTop: "1rem" }}>
          <Table.Column dataIndex="id" title="ID" />
          <Table.Column dataIndex="status" title="Status"
            render={(text, record: Client) => {
              return record.status.charAt(0).toUpperCase() + record.status.slice(1);
            }}
          />
          <Table.Column dataIndex="firstName" title="First Name" className="cell-width" />
          <Table.Column dataIndex="lastName" title="Last Name" className="cell-width" />
          <Table.Column dataIndex="primaryPhone" title="Primary Phone"
            className="primary-phone-column"
            render={(text, record: Client) => {
              const formattedPhone = formatPhoneNumber(record.primaryPhone);
              return formattedPhone ? (
                <a href={`tel:${formattedPhone}`} target="_blank" rel="noopener noreferrer">
                  {formattedPhone}
                </a>
              ) : (
                <span>Invalid number</span>
              );
            }} />
          <Table.Column dataIndex="address" title="Address"
            className="primary-address"
            render={(text, record: RecordType) => {
              const fullAddress = record?.address;
              const mapsQuery = encodeURIComponent(fullAddress);
              return (
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noopener noreferrer">
                  {fullAddress}
                </a>
              );
            }}
          />
          <Table.Column dataIndex="email" title="Email"
            render={(text, record: Client) => (
              <a href={`mailto:${record.email}`} target="_blank" rel="noopener noreferrer">
                {record.email}
              </a>
            )} />
          <Table.Column dataIndex="clientSince" title="Client Since" className="cell-width-email"
            render={(text, record: Client) => <span>{dayjs(record.clientSince).format("MM/DD/YYYY")}</span>} />
          <Table.Column title="Actions" dataIndex="actions" key="actions"
            render={(_, record: Client) => (
              <Space>
                <Link to={`edit/${record.uuid}`} className="ant-btn" type="default"><EditOutlined /></Link>
                <Link to={`show/${record.uuid}`} className="ant-btn" type="default"><EyeOutlined /></Link>
                <Button danger type="default" icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.uuid)} />
              </Space>
            )} />
        </Table>
      )}

      <Modal
        title="Delete Client"
        visible={isModalVisible}
        onOk={() => deleteClient(clientToDelete!)}
        onCancel={handleCancel}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this client? This action cannot be undone.</p>
      </Modal>
    </List>
  );
};

export default Clients;
