// In src/routes/Items.tsx
import { Button, Col, Form, Input, Row, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'antd/lib/form/Form';
import { useCreateInventory } from '../../utils/fetchInventory';

interface ItemFormValues {
  itemName: string;
  itemOwner: string;
  itemOriginalPrice: number;
  itemSellingPrice: number;
  quantity: number;
}

interface Item {
  itemName: string;
  itemOwner: string;
  itemOriginalPrice: number;
  itemSellingPrice: number;
  quantity: number;
}

const EditInventory: React.FC = () => {
  const { createInventory, isLoading, error } = useCreateInventory();
  const [form] = useForm<ItemFormValues>();
  let { inventoryId } = useParams();
  const [item, setItem] = useState<Item | null>(null);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`/jsonapi/node/inventory/${inventoryId}`);
      const json = await response.json();
      const itemData = json.data.attributes;

      const mappedItem: Item = {
        itemName: itemData.field_part_name,
        itemOwner: itemData.field_owner,
        itemOriginalPrice: itemData.field_original_price,
        itemSellingPrice: itemData.field_selling_price,
        quantity: itemData.field_quantity,
      };

      setItem(mappedItem);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [inventoryId]);

  useEffect(() => {
    if (item) {
      form.setFieldsValue(item);
    }
  }, [item, form]);

  const handleUpdate = async (values: ItemFormValues) => {
    let data = {
      data: {
        type: 'node--inventory',
        id: inventoryId,
        attributes: {
          field_part_name: values.itemName,
          field_owner: values.itemOwner,
          field_original_price: values.itemOriginalPrice,
          field_quantity: values.quantity,
          field_selling_price: values.itemSellingPrice,
        },
      },
    };

    if (inventoryId) {
      await createInventory(data, form); // Assuming createOrUpdateItem handles both POST and PATCH
    }
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#fff', marginTop: '1rem' }}>
      <Form
        form={form} // Pass the form instance to the Ant Design Form
        layout="vertical"
        onFinish={handleUpdate} // Set the onFinish handler to the create function
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              rules={[{ required: true, message: 'Please input the part name!' }]}
              label="Part Name"
              name="itemName"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              rules={[{ required: true, message: 'Please input the original price!' }]}
              label="Original Price"
              name="itemOriginalPrice"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              rules={[{ required: true, message: 'Please input the selling price!' }]}
              label="Selling Price"
              name="itemSellingPrice"
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              rules={[{ required: true, message: 'Please input the quantity!' }]}
              label="Quantity"
              name="quantity"
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Owner"
              name="itemOwner"
              rules={[{ required: true, message: 'Please select the part owner' }]}
            >
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
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Update Item
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default EditInventory;
