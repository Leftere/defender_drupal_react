// In src/routes/Inventory.tsx
import { Button, Col, List, Row, Space, Spin, Table, Modal, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import './styles.css';

interface InventoryItem {
  id: string;
  itemName: string;
  itemOwner: string;
  itemOriginalPrice: string;
  itemSellingPrice: string;
  quantity: string;
  uuid: string;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const navigate = useNavigate();

  const deleteItem = async (id: string) => {
    try {
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
          'X-CSRF-Token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      message.success("Item deleted successfully");
      fetchInventory(); // Refresh the inventory list
    } catch (error: any) {
      console.error("Error deleting item:", error);
      message.error("Failed to delete item");
    } finally {
      setIsModalVisible(false);
    }
  };

  const showDeleteConfirm = (id: string) => {
    setItemToDelete(id);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setItemToDelete(null);
  };

  const fetchInventory = async () => {
    try {
      const response = await fetch(`/jsonapi/node/inventory?page[limit]=100`);
      const json = await response.json();
      const mappedInventory = json.data.map((item: any, index: number) => ({
        id: (index + 1).toString(),
        uuid: item.id,
        itemName: item.attributes.field_part_name,
        itemOwner: item.attributes.field_owner,
        itemOriginalPrice: item.attributes.field_original_price,
        itemSellingPrice: item.attributes.field_selling_price,
        quantity: item.attributes.field_quantity,
      }));
      setInventory(mappedInventory);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

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
          <Table.Column dataIndex="id" title="ID" />
          <Table.Column dataIndex="itemName" title="Item Name" />
          <Table.Column dataIndex="itemOwner" title="Item Owner" />
          <Table.Column dataIndex="itemOriginalPrice" title="Original Price" />
          <Table.Column dataIndex="itemSellingPrice" title="Selling Price" />
          <Table.Column dataIndex="quantity" title="Quantity" />
          <Table.Column title="Actions" dataIndex="actions" key="actions"
            render={(_, record: InventoryItem) => (
              <Space>
                <Link to={`edit/${record.uuid}`} className="ant-btn" type="default"><EditOutlined /></Link>
                <Button danger type="default" icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.uuid)} />
              </Space>
            )}
          />
        </Table>
      )}

      <Modal
        title="Delete Item"
        visible={isModalVisible}
        onOk={() => deleteItem(itemToDelete!)}
        onCancel={handleCancel}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this item? This action cannot be undone.</p>
      </Modal>
    </List>
  );
};

export default Inventory;
