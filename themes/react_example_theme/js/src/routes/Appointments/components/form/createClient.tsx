import React, { useEffect, useState } from 'react';
import { Button, Col, DatePicker, Form, Input, Modal, Row, Select, message } from 'antd';
import { useForm } from '@refinedev/core';
import { states, State } from '../../../../components/states/states';
import { useCreateClient } from '../../../../utils/fetchClients';
const { Option } = Select;

interface Status {
  id: string;
  title: string;
  values: object;

}

interface CreateClientProps {
  isOpen: boolean;
  onClose: () => void;
  // Define the type based on what handleClientAdded does
}


// Adjust the component to accept props for controlling its open state
export const CreateClient: React.FC<CreateClientProps> = ({
  isOpen,
  onClose,

}) => {
  // const { createClient, isLoading, error } = useCreateClient();
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const addClient = async (values: any) => {

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
            "administrative_area": values.address.state,
            "locality": values.address.city,
            "postal_code": values.address.zip,
            "address_line1": values.address.street
          },
          "field_clients_e_mail": values.email,
          "field_clients_status": "active"
        },

      }
    };

    try {
      // Fetch CSRF token from the server
      const tokenResponse = await fetch('/session/token?_format=json');
      if (!tokenResponse.ok) {
          throw new Error('Failed to fetch CSRF token');
      }
      const token = await tokenResponse.text(); // Get the CSRF token as text
      setCsrfToken(token); // Store the CSRF token
      const method = 'POST'; // Determine method based on presence of an ID
      const url = 'https://defender.ddev.site/jsonapi/node/clients';
          console.log(method)
      const response = await fetch(url, {
          method: method,
          credentials: 'same-origin',
          headers: {
              'Content-Type': 'application/vnd.api+json',
              'Accept': 'application/vnd.api+json',
              'X-CSRF-Token': token // Use the fetched CSRF token
          },
          body: JSON.stringify(data)
      });

      if (!response.ok) {
          throw new Error(data.data.type ? 'Failed to update client' : 'Failed to create client');
      }

      const responseData = await response.json();
      message.success(data.data.type ? "Client updated successfully" : "Client created successfully");
      form.resetFields();
  } catch (error: any) {
      console.error(data.data.type ? "Error updating client:" : "Error creating client:", error);
      message.error(data.data.type ? "Failed to update client" : "Failed to create client");
      setError(error);
  } finally {
      setIsLoading(false);
  }

    onClose();
  };

  return (
    <Modal
      open={isOpen}
      style={{ padding: "0 2rem", zIndex: "999999" }}
      onCancel={() => {
        onClose();
        // console.log(isOpen)
        form.resetFields();
      }
      }

      footer={[
        <Button key="back" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={() => {
          form.submit();
        }}>
          Submit
        </Button>,
      ]}
    // Add any additional props you need for the Modal
    >
      <h2 style={{ marginBottom: "2rem" }}><strong>Add new client</strong></h2>
      <Form layout="vertical" form={form} onFinish={addClient}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name={["firstName"]}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Last Name"
              name={["lastName"]}
              rules={[{ required: true },]}
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
        </Row>
        <Row gutter={16}>
        <Col span={24}>
            <Form.Item
              label="Email"
              name={["email"]}
              rules={[{ required: true, message: "Please input email!" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Address"
              name={["address", "street"]}
              rules={[{ required: true, message: "Please input your street address!" }]}
            >
              <Input placeholder="1234 Main St" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="City"
              name={["address", "city"]}
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
              name={["address", "state"]}
              rules={[{ required: true, message: "Please select your state!" }]}
            >
              <Select
                showSearch
                placeholder="Select a state"
                optionFilterProp="children"

              >
                {states.map((state: State, index: number) => (
                  <Option key={index} value={state.abbreviation}>{state.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Zip Code"
              name={["address", "zip"]}
              rules={[
                { required: true, message: "Please input your zip code!" },
                { pattern: /^\d{5}$/, message: "Zip code must be 5 digits" }
              ]}
            >
              <Input placeholder="12345" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
