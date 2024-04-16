import { Create } from "@refinedev/antd";
import { IResourceComponentsProps, useDataProvider, useList, useSelect } from "@refinedev/core";
import { Form, Input, Button, DatePicker, Dropdown, Select, Row, Col, message } from "antd";
import { useEffect, useState } from "react";
import { states, State } from '../../components/states/states';
import React from "react";
import { useForm } from "antd/lib/form/Form";
import { useCreateInventory } from '../../utils/fetchInventory';
interface ClientFormValues {
  itemCode: string;
  itemName: string;
  modelNumber: number;
  category: string;
  originalPrice: any;
  quantity: string;
  linkToPurchase: string;
}

interface Status {
  id: string;
  title: string;
  values: object
}
const InventoryCreate: React.FC<IResourceComponentsProps> = () => {
  const [form] = useForm<ClientFormValues>(); // Specify the type for useForm
  // Function to handle form submission
  const [statuses, setStatuses] = useState<Status[]>([]);
  const { createInventory, isLoading, error } = useCreateInventory();

  const handleCreate = async (values: ClientFormValues) => {

console.log("i am here")
    let data = {
      "data": {
        "type": "node--inventory",
        "attributes": {
          "title": values.itemName,
          "field_inventory_item_code": values.itemCode,
          "field_inventory_quantity": values.quantity,
          "field_inventory_unit_price": values.originalPrice,
          "field_link_to_purchase": {
            "uri": values.linkToPurchase,
            "title": values.linkToPurchase,
            "options": []
          }
        }
      }
    };
    createInventory(data, form);

  };

  return (
    <div style={{ padding: "1rem", backgroundColor: "#fff", marginTop: "1rem;" }}>
      <Form
        form={form} // Pass the form instance to the Ant Design Form
        layout="vertical"
        onFinish={handleCreate} // Set the onFinish handler to the create function
      >
        <Row gutter={16}>
        <Col span={12}>
            <Form.Item
              label="Item Code"
              name={["itemCode"]}
            // rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Item Name"
              name="itemName"
              rules={[{ required: true, message: 'Please input the first name!' }]}
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
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Category"
              name={["category"]}
            // rules={[{ required: true, message: 'Please select a status!' }]}
            >
              <Select placeholder="Select a status">
                <Select.Option value="dryer">Dryer</Select.Option>
                <Select.Option value="cooktop">Cook Top</Select.Option>
                <Select.Option value="dishwasher">Dishwasher</Select.Option>
                <Select.Option value="oven">Oven</Select.Option>
                <Select.Option value="microwave">Microwave</Select.Option>
                <Select.Option value="icemaker">Ice Maker</Select.Option>
                <Select.Option value="freezer">Freezer</Select.Option>
                <Select.Option value="garbagedisposal">Garbage Disposal</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Link To Purchase"
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
              label="Original Prie"
              name={["originalPrice"]}
            // rules={[{ required: true, message: "Please input your street address!" }]}
            >
              <Input placeholder="$" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Quantity"
              name={["quantity"]}
              rules={[{ required: true, message: "Please input quantity!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Add Item
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>

  );
};

export default InventoryCreate;