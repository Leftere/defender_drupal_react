import { Create } from "@refinedev/antd";
import { IResourceComponentsProps, useDataProvider, useList, useSelect } from "@refinedev/core";
import { Form, Input, Button, DatePicker, Dropdown, Select, Row, Col, message } from "antd";
import { useEffect, useState } from "react";
import { states, State } from '../../components/states/states';
import React from "react";
import { useForm } from "antd/lib/form/Form";
import { useCreateInventory } from '../../utils/fetchInventory';
interface ClientFormValues {
  partName: string;
  sellingPrice: string;
  owner: string;
  originalPrice: any;
  quantity: string;

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

    let data = {
      "data": {
        "type": "node--inventory",
        "attributes": {
          "field_part_name": values.partName,
          "field_owner": values.quantity,
          "field_original_price": values.originalPrice,
          "field_quantity": values.quantity,
          "field_selling_price": values.sellingPrice,
        }
      }
    };
    createInventory(data, form);

  };

  return (
    <div style={{ padding: "1rem", backgroundColor: "#fff", marginTop: "1rem" }}>
      <Form
        form={form} // Pass the form instance to the Ant Design Form
        layout="vertical"
        onFinish={handleCreate} // Set the onFinish handler to the create function
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              rules={[{ required: true, message: 'Please input the first name!' }]}
              label="Part Name"
              name={["partName"]}
            // rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
                rules={[{ required: true, message: 'Please select part owner' }]}
              label="Original Price"
              name="originalPrice"
            
            >
              <Input />
            </Form.Item>
          </Col>

        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
                rules={[{ required: true, message: 'Please select part owner' }]}
              label="Selling Price"
              name={["sellingPrice"]}
            // rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
                rules={[{ required: true, message: 'Please select part owner' }]}
              label="Quantity"
              name={["quantity"]}
            // rules={[{ required: true, message: 'Please select a status!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>


        {/* If Address is expected to be a single field, consider placing it separately or adjust layout as needed */}
        <Row gutter={16}>

          <Col span={24}>
            <Form.Item label="Company Part/Technician Part" name="owner"
              rules={[{ required: true, message: 'Please select part owner' }]}>
              <Select>
                <Select.Option value="Company Part">Company Part</Select.Option>
                <Select.Option value="Custom Part">Custom Part</Select.Option>
              </Select>
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