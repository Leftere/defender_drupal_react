// In src/routes/Clients.tsx
import { Button, Col, Form, Input, List, Row, Select, Space, Spin, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from "dayjs";
import { useForm } from 'antd/lib/form/Form';
import { states, State } from '../../components/states/states';
import { useCreateClient } from '../../utils/fetchClients';
interface ClientFormValues {
    firstName: string;
    lastName: string;
    address: string;
    primaryPhone: string;
    clientSince: any;
    status: string;
    email: string;
    city: string;
    state: string;
    zip: string
}

interface Client {

    firstName: string;
    lastName: string;
    primaryPhone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    email: string;
    status: string;
    clientSince: string;

}

const EditClient: React.FC = () => {
    const { createClient, isLoading, error } = useCreateClient();
    const [form] = useForm<ClientFormValues>();
    let { clientId } = useParams();
    const [client, setClient] = useState<Client | null>(null);
    const [addressId, setAddressId] = useState(null);
    const fetchClient = async () => {
        try {
            const response = await fetch(`/jsonapi/node/clients/${clientId}?include=field_address`);

            const json = await response.json();
            const attributes = json.data.attributes;
            const addressData = json.included?.[0]?.attributes;
            console.log(json.included[0]?.id)
            const clientData = json.data.attributes;
            const mappedClient: Client = {
                firstName: clientData.field_clients_first_name,
                lastName: clientData.field_clients_last_name,
                primaryPhone: clientData.field_clients_primary_phone,
                address: addressData?.field_address,
                city: addressData?.field_city,
                state:addressData?.field_state,
                zip: addressData?.field_zip_code,
                email: clientData.field_clients_e_mail,
                status: clientData.field_clients_status,
                clientSince: clientData.created,
            }
            setClient(mappedClient)
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    }
    useEffect(() => {
        fetchClient()
    }, [])
    useEffect(() => {
        if (client) {
            form.setFieldsValue(client);
        }
    }, [client, form]);

    const handleUpdate = async (values: ClientFormValues) => {

        let updateClientData = {
            "data": {
                "type": "node--clients",
                "id": clientId,
                "attributes": {
                    "title": `${values.firstName} ${values.lastName}`,
                    "field_clients_first_name": values.firstName,
                    "field_clients_last_name": values.lastName,
                    "field_clients_primary_phone": values.primaryPhone,
                    "field_clients_e_mail": values.email,
                    "field_clients_status": values.status

                }
            }          
        };
    
        if (clientId) {
            await createClient(updateClientData, form);  // Assuming createOrUpdateClient handles both POST and PATCH
        }


    };
    return (
        <div style={{ padding: "1rem", backgroundColor: "#fff", marginTop: "1rem;" }}>
            <Form
                form={form} // Pass the form instance to the Ant Design Form
                layout="vertical"
                onFinish={handleUpdate} // Set the onFinish handler to the create function
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
                        // rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>

                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Status"
                            name={["status"]}
                        // rules={[{ required: true, message: 'Please select a status!' }]}
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
                        // rules={[{ required: true }]}
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
                        // rules={[{ required: true, message: "Please input your street address!" }]}
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
                                Update Client
                            </Button>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </div>
    );

};

export default EditClient;

// Repeat for Inventory, Appointments, and Technicians components
