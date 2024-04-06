import { Create, useForm } from "@refinedev/antd";
import { IResourceComponentsProps, useDataProvider, useList, useSelect } from "@refinedev/core";
import { Form, Input, DatePicker, Dropdown, Select, Row, Col } from "antd";
import { useEffect, useState } from "react";
import { states, State } from '../../components/states/states';
interface Status {
  id: string;
  title: string;
  values: object
}



export const ClientCreate: React.FC<IResourceComponentsProps> = (children) => {
  const {
    formProps,
    saveButtonProps,

  } = useForm({});

  const dataProvider = useDataProvider();
  const [statuses, setStatuses] = useState<Status[]>([]);

  const fetchStatuses = async () => {
    try {
      const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/status`);

      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      console.error("Failed to fetch statuses:", error);
      // Handle the error appropriately
    }
  };


  useEffect(() => {
    fetchStatuses();
  }, []);


  return (
    <Create saveButtonProps={saveButtonProps} >
      <Form {...formProps} layout="vertical">
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
              rules={[{ required: true }]}
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
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Client Since"
              name={["clientSince"]}
              rules={[{ required: true, message: 'Please select the client since date' }]}
            >
              <DatePicker format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Status"
              name="status"
              rules={[{ required: true, message: 'Please select a status!' }]}
            >
              <Select placeholder="Select a status">
                {statuses.map(status => (
                  <Select.Option key={status.id} value={status.title}>
                    {status.title}
                  </Select.Option>
                ))}
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
                  <Select.Option key={index} value={state.abbreviation}>{state.name}</Select.Option>
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
    </Create>
  );
};
