import React from 'react';
import { Button, Col, Form, Row } from "antd";
import { CheckCircleFilled, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { FormItemRow } from './FormItemRow';

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
        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <FormItemRow key={key} name={name} restField={restField} remove={remove} />
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  style={{ marginTop: "1rem" }}
                  icon={<PlusOutlined />}
                >
                  Add Field
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
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
  );
};
