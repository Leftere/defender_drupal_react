// In src/routes/Items.tsx
import { Button, Col, Form, Input, List, Row, Select, Space, Spin, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from "dayjs";
import { useForm } from 'antd/lib/form/Form';
import { states, State } from '../../components/states/states';
import { useCreateInventory } from '../../utils/fetchInventory';
interface ItemFormValues {
  title: string;
  itemCode: number;
  modelNumber: number;
  category: string;
  linkToPurchase: string;
  originalPrice: string;
  quantity: string;
}

interface Item {
  title: string;
  itemCode: number;
  modelNumber: number;
  category: string;
  linkToPurchase: string;
  originalPrice: string;
  quantity: string;

}

const EditInventory: React.FC = () => {
  const { createInventory, isLoading, error } = useCreateInventory();
  const [form] = useForm<ItemFormValues>();
  let { inventoryId } = useParams();
  const [client, setItem] = useState<Item | null>(null);
  console.log(inventoryId)
  const fetchInventory = async () => {
    try {
      const response = await fetch(`/jsonapi/node/inventory/${inventoryId}`);

      const json = await response.json();

      const itemData = json.data.attributes;
      console.log(itemData)
      const mappedItem: Item = {
        title: itemData.title,
        itemCode: itemData.field_inventory_item_code,
        modelNumber: itemData.field_model_number,
        category: itemData.field_inventory_category,
        linkToPurchase: itemData.field_link_to_purchase.uri,
        originalPrice: itemData.field_inventory_unit_price,
        quantity: itemData.field_inventory_quantity

      }
      setItem(mappedItem)
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  }
  useEffect(() => {
    fetchInventory()
  }, [])
  useEffect(() => {
    if (client) {
      form.setFieldsValue(client);
    }
  }, [client, form]);

  const handleUpdate = async (values: ItemFormValues) => {

    let data = {
      "data": {
        "type": "node--inventory",
        "id": inventoryId,
        "attributes": {
          "title": values.title,
          "field_inventory_item_code": values.itemCode,
          "field_model_number": values.modelNumber,
          "field_inventory_category": values.category,
          "field_link_to_purchase": {
            "uri":  values.linkToPurchase,
          },
          "field_inventory_unit_price": values.originalPrice,
          "field_inventory_quantity": values.quantity

        }
      }
    };

    if (inventoryId) {
      await createInventory(data, form);  // Assuming createOrUpdateItem handles both POST and PATCH
    }


  };
  return (
    <div style={{ padding: "1rem", backgroundColor: "#fff", marginTop: "1rem" }}>
      <Form
        form={form} // Pass the form instance to the Ant Design Form
        layout="vertical"
        onFinish={handleUpdate} // Set the onFinish handler to the create function
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: 'Please input the first name!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Item Code"
              name={["itemCode"]}
            // rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Model Number"
              name={["modelNumber"]}
            // rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Quantity"
              name={["quantity"]}
              rules={[{ required: true, message: "Please input your city!" }]}
            >
              <Input placeholder="Anytown" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Category"
              name={["category"]}
            // rules={[{ required: true, message: 'Please select a status!' }]}
            >
              <Select placeholder="Select a status">
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="inactive">Inactive</Select.Option>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="suspended">Suspended</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Link to purchase"
              name={["linkToPurchase"]}
            // rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* If Address is expected to be a single field, consider placing it separately or adjust layout as needed */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Original Price"
              name={["originalPrice"]}
            // rules={[{ required: true, message: "Please input your street address!" }]}
            >
              <Input placeholder="1234 Main St" />
            </Form.Item>
          </Col>
     
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Update Item
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );

};

export default EditInventory;

// Repeat for Inventory, Appointments, and Technicians components
