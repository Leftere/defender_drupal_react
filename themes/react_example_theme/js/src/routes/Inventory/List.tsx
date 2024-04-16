// In src/routes/Clients.tsx
import { Button, Col, List, Row, Space, Spin, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from "dayjs";
import { message, FormInstance } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';

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


const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const deleteClient = async (id: string) => {
    try {
      // Fetch CSRF token from the server
      const tokenResponse = await fetch('/session/token?_format=json');
      if (!tokenResponse.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      const token = await tokenResponse.text();


      const url = `/jsonapi/node/inventory/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          'Accept': 'application/vnd.api+json',
          'X-CSRF-Token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      message.success("Client deleted successfully");
    } catch (error: any) {
      console.error("Error deleting client:", error);
      message.error("Failed to delete client");
    }
    fetchInventory();
  }
  const fetchInventory = async () => {
    try {
      const response = await fetch(`/jsonapi/node/inventory?page[limit]=10`);
     
      const json = await response.json();
   
      // Map the fetched data to fit the Client interface
      // This step depends on your actual data structure; adjust accordingly
      const mappedInventory = json.data.map((item: any, index: number) => ({
        id: (index + 1).toString(),
        uuid: item.id,
        itemCode: item.attributes.field_inventory_item_code,
        itemName: item.attributes.title,
        modelNumber: item.attributes.field_model_number,
        category: item.attributes.field_inventory_category,
        originalPrice: item.attributes.field_inventory_unit_price,
        quantity: item.attributes.field_inventory_quantity,
        linkToPurchase: item.attributes.field_link_to_purchase.uri
 
        // firstName: item.attributes.field_inventory_first_name,
        // lastName: item.attributes.field_inventory_last_name,
        // primaryPhone: item.attributes.field_inventory_primary_phone,
        // employedSince: item.attributes.employedSince, 
        // status: item.attributes.field_inventory_status,
        // address: item.attributes.field_inventory_address,
        // email: item.attributes.field_inventory_e_mail,
        // clientSince: item.attributes.created, 
      }));
      console.log(json)
      // console.log(mappedInventory)
      setInventory(mappedInventory);
   
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false); // Set loading to false when the fetch is complete
    }
  };
  useEffect(() => {
    fetchInventory();
  
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
          <h2>Inventory</h2>
        </Col>
        <Col>
          <Link to="create" style={{ float: 'right' }}><Button type="primary"><PlusOutlined />Create</Button></Link>
        </Col>
      </Row>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table dataSource={inventory} rowKey="id" style={{ marginTop: "1rem" }}>
        <Table.Column dataIndex="id" title={"ID"} />
        <Table.Column dataIndex="itemCode" title={"Item Code"} />
        <Table.Column dataIndex="itemName" title={"Item Name"} />
        <Table.Column dataIndex="modelNumber" title={"Model Number"} />
        <Table.Column dataIndex="category" title={"Category"} />
        <Table.Column dataIndex="linkToPurchase" title={"Link to Purchase"} 
          render={linkToPurchase => (
            
            <a href={linkToPurchase} target="_blank" rel="noopener noreferrer">
               {linkToPurchase.length > 25 ? `${linkToPurchase.slice(0, 25)}...` : linkToPurchase}
            </a>
          )}
        />
        <Table.Column dataIndex="originalPrice" title={"Original Price"}
        render={originalPrice => "$" + originalPrice}
        />
        <Table.Column dataIndex="quantity" title={"Quantity"} />
          <Table.Column title="Actions" dataIndex="actions" key="actions"
            render={(_, record: Client) => (
              <Space>
                {/* <Button icon={<EditOutlined />} type="default" onClick={() => handleEdit(record.id)}
                  
                /> */}
                <Link to={`edit/${record.uuid}`} className="ant-btn" type="default">  <EditOutlined /> </Link>
                <Link to={`show/${record.uuid}`} className="ant-btn" type="default">    <EyeOutlined /> </Link>

                <Button danger type="default" icon={<DeleteOutlined />} onClick={(e) => deleteClient(record.uuid)} />


              </Space>
            )} />
        </Table>
      )}

    </List>
  );

};

export default Inventory;

// Repeat for Inventory, Appointments, and Technicians components
