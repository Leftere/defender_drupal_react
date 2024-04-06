import {
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { BaseRecord } from "@refinedev/core";
import { Space, Table } from "antd";
import dayjs from "dayjs";
import React from 'react';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  primaryPhone: string;
  employedSince: string;
  status: string,
  address: string;
  email: string;
  clientSince: string;
}

interface RecordType {
  id: string; // Assuming there's an ID field
  // Define other fields here
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  // Add any other properties that are accessed in your table
}


export const ClientsList = () => {
  const { tableProps, sorters } = useTable({
    syncWithLocation: true,
  });

  console.log(tableProps)


  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column
          dataIndex="status"
          title="Status"
      
        />
        <Table.Column dataIndex="firstName" title={"First Name"} />
        <Table.Column dataIndex="lastName" title={"Last Name"} />
        <Table.Column dataIndex="primaryPhone" title={"Primary Phone"} 
         render={primaryPhone => (
          <a href={`tell:${primaryPhone}`} target="_blank" rel="noopener noreferrer">
            {primaryPhone}
          </a>
        )}
        />     
       
       <Table.Column 
        title="Address"
        key="address"
        render={(text, record: RecordType) => {
          // Constructing the full address string from the address object
          const fullAddress = record?.address
            ? `${record.address.street}, ${record.address.city}, ${record.address.state}, ${record.address.zip}`
            : 'N/A';

          // Encoding the full address for the Google Maps search query
          const mapsQuery = encodeURIComponent(fullAddress);

          return (
            <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noopener noreferrer">
              {fullAddress}
            </a>
          );
        }} 
      />
        <Table.Column dataIndex="email" title={"Email"} 
         render={email => (
          <a href={`mailto:${email}`} target="_blank" rel="noopener noreferrer">
            {email}
          </a>
        )}
        />
           <Table.Column
          dataIndex="employedSince"
          title={"Client Since"}
          render={(text) => <span>{dayjs(text).format("MM/DD/YYYY")}</span>}
        />
        <Table.Column
          title={"Actions"}
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
