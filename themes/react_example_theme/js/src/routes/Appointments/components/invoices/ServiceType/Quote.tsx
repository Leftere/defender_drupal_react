import React from 'react';
import { Button, Col, Form, Input, InputNumber, Row } from "antd";
import TextArea from 'antd/es/input/TextArea';
import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';

interface QuoteProps {
  form: any;
  selectedService: string;
  setNewItemOpen: (open: boolean) => void;
  setSelectedService: (service: string) => void;
  handleBackToInvoices: () => void;
  handleServiceTypeForm: (values: any) => void;
}

export const Quote: React.FC<QuoteProps> = (
  { form,
    selectedService,
    setNewItemOpen,
    setSelectedService,
    handleBackToInvoices,
    handleServiceTypeForm }
) => {
  return (
    <>
      <strong style={{ display: "block" }}>{selectedService}</strong>
      <Form form={form} layout="vertical" style={{ width: "100%" }} onFinish={handleServiceTypeForm}>
        {/* <Form.Item label="Job Description" name="jobDescription">
              <TextArea rows={4} />
            </Form.Item> */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Amount" style={{ width: "100%" }} name="unitPrice"
              rules={[
                { required: true, message: 'Please input the price!' },

              ]}
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
          <Col span={24}>
            <Form.Item label="Description" style={{ width: "100%" }} name="description"
              rules={[
                { required: true, message: 'Please add quote description!' },

              ]}
            >
              <Input.TextArea />
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