import React, { useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Select } from "antd";
import { MinusCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const fieldOptions = [ 'Service call', 'Part', 'Labor'];

interface FormItemRowProps {
  key: number;
  name: number;
  restField: any;
  remove: (name: number) => void;
}

export const FormItemRow: React.FC<FormItemRowProps> = ({ key, name, restField, remove }) => {
  const [selectedField, setSelectedField] = useState<string>('');

  const handleFieldChange = (value: string) => {
    setSelectedField(value);
    
  };

  return (
    <Row gutter={16} align="middle">
      <Col span={8}>
        <Form.Item
          {...restField}
          name={[name, 'field']}
          label="Select Service"
          rules={[{ required: true, message: 'Please select a field!' }]}
        >
          <Select placeholder="Select a field" onChange={handleFieldChange}>
            {fieldOptions.map(option => (
              <Option key={option} value={option}>
                {option}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Col>
      {selectedField === 'Part' && (
        <Col span={8}>
          <Form.Item
            {...restField}
            name={[name, 'partName']}
            label="Part Name"
            rules={[{ required: true, message: 'Please input the part name!' }]}
          >
            <Input placeholder="Enter part name" />
          </Form.Item>
        </Col>
      )}
      <Col span={8}>
        <Form.Item
          {...restField}
          name={[name, 'unitPrice']}
          label="Amount"
          rules={[{ required: true, message: 'Please input the price!' }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
          />
        </Form.Item>
      </Col>
      <Col span={2}>
        <Button
          type="dashed"
          onClick={() => remove(name)}
          icon={<MinusCircleOutlined />}
        >
          Remove
        </Button>
      </Col>
    </Row>
  );
};
