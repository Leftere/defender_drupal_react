import { Create } from "@refinedev/antd";
import { IResourceComponentsProps, useDataProvider, useList, useSelect } from "@refinedev/core";
import { Form, Input, Button, DatePicker, Dropdown, Select, Row, Col, message } from "antd";
import { useEffect, useState } from "react";
import { states, State } from '../../components/states/states';
import React from "react";
import { useForm } from "antd/lib/form/Form";
import { useCreateClient } from '../../utils/fetchClients';
interface ClientFormValues {
  firstName: string;
  lastName: string;
  address: string;
  primaryPhone: string;
  secondaryPhone: string;
  clientSince: any;
  status: string;
  email: string;
  city: string;
  state: string;
  zip: string
}

interface Status {
  id: string;
  title: string;
  values: object
}
const ClientCreate: React.FC<IResourceComponentsProps> = () => {
  const [form] = useForm<ClientFormValues>(); // Specify the type for useForm
  // Function to handle form submission
  const [statuses, setStatuses] = useState<Status[]>([]);
  const { createClient, isLoading, error } = useCreateClient();

  const fetchStatuses = async () => {
    try {
      const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/status`);

      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      console.error("Failed to fetch statuses:", error);
    }
  };
  useEffect(() => {
    fetchStatuses();
  }, []);
  const handleCreate = async (values: ClientFormValues) => {


    let data = {
      "data": {
        "type": "node--clients",
        "attributes": {
          "title": `${values.firstName} ${values.lastName}`,
          "field_clients_first_name": values.firstName,
          "field_clients_last_name": values.lastName,
          "field_clients_primary_phone": values.primaryPhone,
          "field_clients_secondary_phone": values.secondaryPhone,
          "field_address": {
            "country_code": "US",
            "administrative_area": values.state,
            "locality": values.city,
            "postal_code": values.zip,
            "address_line1": values.address
          },
          "field_clients_e_mail": values.email,
          "field_clients_status": values.status
        },

      }
    };

    createClient(data, form);


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
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: 'Please input the first name!' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              rules={[{ required: true, message: 'Please input the last name!' }]}
              name={["lastName"]}
            // rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Primary Phone"
              name={["primaryPhone"]}
              rules={[{ required: true, message: 'Please input the phone number!' },
                { pattern: /^\d{10}$/, message: "Phone Number must be 10 digits" }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Secondary Phone"
              name={["secondaryPhone"]}
              rules={[{  message: 'Please input the phone number!' },
                { pattern: /^\d{10}$/, message: "Phone Number must be 10 digits" }
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item
              label="Client Since"
              name="clientSince"
            
            // rules={[{ required: true, message: 'Please select the client since date' }]}
            >
              <DatePicker 
      
              format="YYYY-MM-DD" 
              onChange={(date, dateString) => {
                console.log(date, "I am date")
         
                form.setFieldsValue({ clientSince: dateString });
              }}
            />
            </Form.Item>
          </Col> */}
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Status"
              name={["status"]}
            rules={[{ required: true, message: 'Please select a status!' }]}
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
              label="Email"
              name={["email"]}
            rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* If Address is expected to be a single field, consider placing it separately or adjust layout as needed */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Address"
              name={["address"]}
            rules={[{ required: true, message: "Please input your street address!" }]}
            >
              <Input placeholder="1234 Main St" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="City"
              name={["city"]}
              rules={[{ required: true, message: "Please input your city!" }]}
            >
              <Input placeholder="Anytown" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="State"
              name={["state"]}
              rules={[{ required: true, message: "Please select your state!" }]}
            >
              <Select
                showSearch
                placeholder="Select a state"
                optionFilterProp="children"

              >
                {states.map((state: State, index: number) => (
                  <Select.Option key={index} value={state.abbreviation}>{state.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Zip Code"
              name={["zip"]}
              rules={[
                { required: true, message: "Please input your zip code!" },
                { pattern: /^\d{5}$/, message: "Zip code must be 5 digits" }
              ]}
            >
              <Input placeholder="12345" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create Client
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>

  );
};

export default ClientCreate;