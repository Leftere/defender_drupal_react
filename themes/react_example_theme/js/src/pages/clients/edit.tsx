import { Edit, useForm, useSelect } from "@refinedev/antd";
import { useDataProvider } from "@refinedev/core";
import { DatePicker, Form, Input, Select } from "antd";
import moment from 'moment';
import { useEffect, useState } from "react";

interface Status {
  id: string;
  title: string;
  values: object
}



export const ClientsEdit = () => {
  const { formProps, saveButtonProps } = useForm({});
  
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
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
      <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: 'First name is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name="lastName"
          rules={[{ required: true, message: 'First name is required' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={"Primary Phone"}
          name={["primaryPhone"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={"Email"}
          name={["email"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
        
        label="Status"
        name={"status"}
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
      <Form.Item
          label={"Address"}
          name={["address"]}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};
