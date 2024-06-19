import React, { useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Checkbox, Select } from "antd";
import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';

interface PartProps {
  form: any;
  selectedService: string;
  setNewItemOpen: (open: boolean) => void;
  setSelectedService: (service: string) => void;
  handleBackToInvoices: () => void;
  handleServiceTypeForm: (values: any) => void;
}

export const Part: React.FC<PartProps> = (
  { form,
    selectedService,
    setNewItemOpen,
    setSelectedService,
    handleBackToInvoices,
    handleServiceTypeForm }
) => {
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const handleQuantityChange = (value: number | null) => {
    const unitPrice = form.getFieldValue('partUnitPrice');
    setTotalPrice((unitPrice || 0) * (value || 0));
  };

  const handleUnitPriceChange = (value: number | null) => {
    const quantity = form.getFieldValue('quantity');
    setTotalPrice((quantity || 0) * (value || 0));
  };

  return (
    <>
      <strong style={{ display: "block" }}>{selectedService}</strong>
      <Form form={form} layout="vertical" style={{ width: "100%" }} onFinish={handleServiceTypeForm} initialValues={{ quantity: 1 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Part Name" name="partName" rules={[{ required: true, message: 'Please add part name!' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Part Original Price"
              name="partOrgPrice"
              rules={[{ required: true, message: 'Please input original price!' }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Qty" name="quantity" rules={[{ required: true, message: 'Please add quantity!' }]}>
              <InputNumber min={1} style={{ width: "100%" }} onChange={handleQuantityChange} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Part Selling Price"
              name="partUnitPrice"
              rules={[{ required: true, message: 'Please add selling price!' }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                onChange={handleUnitPriceChange}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Company Part/Technician Part" name="owner"
            rules={[{ required: true, message: 'Please select part owner' }]}>
              <Select>
                <Select.Option value="Company Part">Company Part</Select.Option>
                <Select.Option value="Custom Part">Custom Part</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Total Price">
              <Input value={`$ ${totalPrice}`} disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Button
              style={{ width: "100%" }}
              danger
              onClick={() => {
                setNewItemOpen(false);
                setSelectedService("");
                handleBackToInvoices();
              }}
            >
              <CloseCircleOutlined /> Cancel
            </Button>
          </Col>
          <Col span={12}>
            <Button style={{ width: "100%", backgroundColor: "green", color: "#fff" }} htmlType="submit">
              <CheckCircleFilled /> Add
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  )
}
