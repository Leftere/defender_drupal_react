import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Input, InputNumber, Row, Select } from "antd";
import { CheckCircleFilled, CloseCircleOutlined } from '@ant-design/icons';

interface PartProps {
  form: any;
  selectedService: string;
  setNewItemOpen: (open: boolean) => void;
  setSelectedService: (service: string) => void;
  handleBackToInvoices: () => void;
  handleServiceTypeForm: (values: any) => void;
}

interface InventoryItem {
  id: string;
  uuid: string;
  itemCode: string;
  itemName: string;
  modelNumber: string;
  category: string;
  originalPrice: number;
  quantity: number;
  linkToPurchase: string;
}

export const Part: React.FC<PartProps> = (
  { form,
    selectedService,
    setNewItemOpen,
    setSelectedService,
    handleBackToInvoices,
    handleServiceTypeForm }
) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`/jsonapi/node/inventory`);
      const json = await response.json();

      const mappedInventory = json.data.map((item: any, index: number) => ({
        id: (index + 1).toString(),
        uuid: item.id,
        itemCode: item.attributes.field_inventory_item_code,
        itemName: item.attributes.title,
        modelNumber: item.attributes.field_model_number,
        category: item.attributes.field_inventory_category,
        originalPrice: item.attributes.field_inventory_unit_price,
        quantity: item.attributes.field_inventory_quantity,
        linkToPurchase: item.attributes.field_link_to_purchase.uri
      }));

      setInventory(mappedInventory);
      console.log("Mapped Inventory:", mappedInventory); // For debugging
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleInventoryChange = (value: string) => {
    const inventoryItem = inventory.find(item => item.itemName === value);
    setSelectedInventory(inventoryItem || null);
    form.setFieldsValue({ unitPrice: inventoryItem?.originalPrice });
  };

  const validatePrice = (_:any, value:any) => {
    if (selectedInventory && value < selectedInventory.originalPrice) {
      return Promise.reject(new Error(`Price cannot be less than ${selectedInventory.originalPrice}`));
    }
    return Promise.resolve();
  };

  return (
    <>
      <Form form={form} layout="vertical" style={{ width: "100%" }} onFinish={handleServiceTypeForm}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Inventory" name="inventory" rules={[{ required: true, message: 'Please select an inventory item!' }]}>
              <Select loading={isLoading} placeholder="Select an inventory item" onChange={handleInventoryChange}>
                {inventory.map((item) => (
                  <Select.Option key={item.uuid} value={item.itemName}>
                    {item.itemName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Qty" name="quantity" rules={[{ required: true, message: 'Please input the quantity!' }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Unit Price"
              name="unitPrice"
              rules={[
                { required: true, message: 'Please input the unit price!' },
                { validator: validatePrice }
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
