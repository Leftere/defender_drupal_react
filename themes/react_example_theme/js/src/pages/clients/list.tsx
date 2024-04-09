import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { Space, Table } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { table } from "console";

interface Client {
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
  uuid: number
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


export const ClientsList = () => {
  const { tableProps, sorters } = useTable({
    syncWithLocation: true,
  });

  console.log(tableProps, " i am table props")

  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const response = await fetch(`https://core.weblaby.com/jsonapi/node/clients`);
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
      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table dataSource={clients} rowKey="id">
          <Table.Column dataIndex="id" title="ID" />
          <Table.Column dataIndex="status" title="Status"
            render={(text, record: Client) => {
              return record.status.charAt(0).toUpperCase() + record.status.slice(1);
            }}
          />
          <Table.Column dataIndex="firstName" title="First Name" />
          <Table.Column dataIndex="lastName" title="Last Name" />
          <Table.Column dataIndex="primaryPhone" title="Primary Phone"
            render={(text, record: Client) => {
              const formattedPhone = formatPhoneNumber(record.primaryPhone);
              return formattedPhone ? (
                <a href={`tel:${formattedPhone}`} target="_blank" rel="noopener noreferrer">
                  {formattedPhone}
                </a>
              ) : (
                <span>Invalid number</span> // Or however you wish to handle invalid numbers
              );
            }} />

          <Table.Column dataIndex="address" title="Address"
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
            render={(text, record: Client) => (
              <a href={`mailto:${record.email}`} target="_blank" rel="noopener noreferrer">
                {record.email}
              </a>
            )} />
          <Table.Column dataIndex="clientSince" title="Client Since"
            render={(text, record: Client) => <span>{dayjs(record.clientSince).format("MM/DD/YYYY")}</span>} />
          <Table.Column title="Actions" dataIndex="actions" key="actions"
            render={(_, record: Client) => (
              <Space>
                <EditButton hideText size="small" recordItemId={record.uuid} />
                <ShowButton hideText size="small"
                recordItemId={record.id}
                //  recordItemId={Array.isArray(record.title) 
                //   ? record.title.join("-") 
                //   : record.title.replace(/\s+/g, '-').toLowerCase()} 
                  />
                <DeleteButton hideText size="small" recordItemId={record.id} />
              </Space>
            )} />
        </Table>
      )}

    </List>
  );
};
