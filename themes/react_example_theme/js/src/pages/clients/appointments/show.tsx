import { EditButton } from '@refinedev/antd'
import { useNavigation, useResource, useShow, useTable } from '@refinedev/core'

import {
  CalendarOutlined, ClockCircleOutlined, CloseOutlined, EditOutlined, FlagOutlined, InfoCircleOutlined, TeamOutlined, EnvironmentOutlined, PhoneOutlined,
} from '@ant-design/icons'
import { Button, Col, Tabs, Descriptions, Divider, Drawer, Form, Row, Select, Skeleton, Space, Tag, InputNumber, Tooltip, Table } from 'antd'
import { Text } from './components/calendar/text'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import styles from './show.module.css'

import { useFetchInventory } from './components/hooks/useFetchInventory'
import { useFetchServices } from './components/hooks/useFetchServices'
import { ListInventory } from './components/listInventory/listInventory'
import { useFetchAppointment } from './components/calendar/useFetchAppointments'
import { useUpdateAppointmentStatus } from './hooks/updateAppointmentStatus';
import { useUpdateAppointmentServices } from './hooks/updateAppointmentServices'
interface FormValues {
  clientName: string
  appointmentDate: string,
  laborHours: string
  // Add other form fields here
}

interface InventoryItem {
  id: string | number // Adjust based on your actual data
  name: string
  itemCode: string
  itemName: string
  category: string
  modelNumber: string
  originalPrice: number // Or string if it includes currency symbols or units
}

interface LaborAmount {
  labourAmount: string | number; // Adjust based on actual data type
}



export const AppointmentShowPage: React.FC = () => {

  const { id } = useResource()
  const { list } = useNavigation()
  const { queryResult } = useShow({})
  const { data, isLoading } = queryResult
  const [appointmentStatus, setAppointmentStatus] = useState<string>('')
  const [serviceStatus, setServiceStatus] = useState(null)
  const [laborAmount, setLaborAmount] = useState<string | null>(null);
  const { updateAppointmentStatus, error } = useUpdateAppointmentStatus();
  const { updateAppointmentServices, isLoading: isLoadingServices, error: errorServices } = useUpdateAppointmentServices();
  const [appointmentInventory, setappointmentInventory] = useState<FormValues[]>([])
  const [inventoryState, setInventoryState] = useState<InventoryItem[]>([])
  const { inventory, refetch, error: errorInventory } = useFetchInventory();
  const services = useFetchServices()
  const appointment = useFetchAppointment();
  const { TabPane } = Tabs
  const [form] = Form.useForm()

  const { description, start, end, category, title, participants, job, kind, name, phone, status, address, client, serviceState, service, appliance} = data?.data ?? {}


  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/appointments/${id}`);
        if (!response.ok) throw new Error('Failed to fetch current inventory');
        const data = await response.json()
        // Process the response data as needed
        setInventoryState(data.inventory)
      } catch (error) {
        console.error("Failed to load inventory");
      }
    };
    fetchInventory();
  }, [id]);

  useEffect(() => {
    if (serviceState) {
      setServiceStatus(serviceState)
    }

  }, [serviceState],)

  const { sorters } = useTable({
    syncWithLocation: true,
  });

  useEffect(() => {
    const fetchLaborAmount = async () => {
      try {
        const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/appointments/${id}`, {
          method: 'GET', // Using GET to fetch data
          headers: {
            'Content-Type': 'application/json',
          },
          // No body is needed for a GET request
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Assuming the response JSON structure includes a laborAmount field
        setLaborAmount(data.laborAmount ? data.laborAmount : null);

      } catch (error) {
        console.error('Failed to fetch labor amount:', error);
      }
    };

    fetchLaborAmount();
  }, []); // Dependency on id, not laborAmount




  const onFinish = async (values: FormValues) => {

    const laborAmountAsString = values.laborHours.toString(); // Convert number to string
    setLaborAmount(laborAmountAsString)
    try {
      // Update the appointment using the form values
      const response = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Assuming you want to save the labor amount as a string
          laborAmount: laborAmountAsString,
          // Include other form values that need to be updated
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Assuming you want to do something with the updatedItemsList or clear the form
      form.resetFields();
      // If you need to navigate away or do something else after the update
      // navigate('/path-to-navigate');
    } catch (error) {
      console.error('Failed to update the appointment status:', error);
      // Handle errors appropriately
    }
  };
  const fullAddress = client?.address
    ? `${client.address.street}, ${client.address.city}, ${client.address.state} ${client.address.zip}`
    : 'N/A';

  // Encoding the full address for the Google Maps search query
  const mapsQuery = encodeURIComponent(fullAddress);
  useEffect(() => {
    if (status) {
      setAppointmentStatus(status)
    }
  }, [status]) // Dependency array with `status`


  enum AppointmentStatus {
    Scheduled = 'Scheduled',
    InProgress = 'In Progress',
    Completed = 'Completed',
    Cancelled = 'Cancelled',
  }

  const getColorByStatus = (appointmentStatus: AppointmentStatus) => {
    switch (appointmentStatus) {
      case 'Scheduled':
        return '#fa8c16'
      case 'In Progress':
        return '#F5222D'
      case 'Completed':
        return '#52c41a'
      case 'Cancelled':
        return '#722ED1'
      default:
        return 'grey' // Default color if no status matches
    }
  }

  const navigate = useNavigate()
  const handleOnClose = () => {
    list('events')
    navigate('/appointments')
    window.location.reload();
  }
  return (
    <Drawer
      size="large"
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              style={{
                backgroundColor:
                  getColorByStatus(appointmentStatus as AppointmentStatus) ||
                  '',
                flexShrink: 0,
                borderRadius: '50%',
                width: '10px',
                height: '10px',

                marginTop: '8px',
              }}
            />

            <Text strong size="md">
              {appliance?.join(", ")}
            </Text>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <EditButton icon={<EditOutlined />} hideText type="text" />
            <Button
              icon={<CloseOutlined />}
              type="text"
              onClick={handleOnClose}
            />
          </div>
        </div>
      }
      closeIcon={false}
      open
      onClose={handleOnClose}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Details" key="1">
          <div>
            <Space
              direction="horizontal"
              size="large"
              style={{ width: '100%' }}
            >
              {
                appointmentStatus === "Scheduled" ?
                  <Button
                    type="primary"
                    size="large"
                    onClick={async (): Promise<void> => {
                      if (!id) {
                        console.error("ID is undefined or null");
                        return;
                      }
                      const idAsString = String(id);
                      await updateAppointmentStatus(idAsString, 'In Progress', '#f5222d');
                      setAppointmentStatus('In Progress');
                    }}
                  >
                    Start
                  </Button>
                  : appointmentStatus === "In Progress" ?
                    <Button
                      type="primary"
                      size="large"
                      danger
                      onClick={async (): Promise<void> => {
                        const idAsString = String(id);
                        await updateAppointmentStatus(idAsString, 'Completed', '#52c41a');
                        setAppointmentStatus('Completed');
                      }}
                    >
                      Finish
                    </Button>
                    : null
              }
            </Space>
            <Divider />
          </div>
          {isLoading ? (
            <Skeleton loading={isLoading} active paragraph={{ rows: 4 }} />
          ) : (
            <div>
              <Descriptions bordered column={1} className={styles.descriptions}>
                <Descriptions.Item label="Job">#{job}</Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={getColorByStatus(
                      appointmentStatus as AppointmentStatus,
                    )}
                  >
                    {appointmentStatus}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Appliances">
                  {appliance?.map((item: string, index: number) => (
                    <Tag key={index} color="blue">
                      {item}
                    </Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="Name">
                  {client?.label || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <EnvironmentOutlined /> {fullAddress}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <a href={`tel:${client?.primaryPhone || ''}`}>
                    <PhoneOutlined /> {client?.primaryPhone || 'N/A'}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Services">
                  {serviceStatus ? serviceStatus : (
                    <Form>
                      <Form.Item
                        name="services"
                        style={{ margin: "0" }}
                        rules={[
                          { required: true, message: 'Please select a service' },
                        ]}
                      >
                        <Select
                          showSearch
                          placeholder="Select an item"
                          optionFilterProp="children"
                          labelInValue // Enable labelInValue
                          onChange={async (selectedOption) => {
                            const idAsString = String(id);
                            await updateAppointmentServices(idAsString, selectedOption.value);
                            form.setFieldsValue({
                              services: selectedOption.value
                            })
                            setServiceStatus(selectedOption.value);
                            // setServiceInput(true)
                          }}
                        >
                          {services.map((item: InventoryItem) => (
                            <Select.Option
                              key={item.id}
                              value={item.name}
                              label={`${item.name} `}
                              labelInValue

                            >
                              {`${item.name} `}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Form>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {description || 'No description provided.'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </TabPane>
        {serviceStatus ? (
          <TabPane
            tab={
              serviceStatus === "Service Call" || serviceStatus === "Repairs with no Parts" || serviceStatus === "Call Back"
                ? "Labor"
                : serviceStatus === "Repairs with Parts from Inventory" || serviceStatus === "Repairs with Custom Parts"
                  ? "Labor and Inventory"
                  : "Refund"
            }
            key="2">
            <h3><strong>{serviceStatus}</strong></h3>
            {/* {laborAmount ? laborAmount : null} */}
            {serviceStatus === "Call Back" || serviceStatus === "Service Call" || serviceStatus === "Repairs with Custom Parts" || serviceStatus === "Repairs with Parts from Inventory" || serviceStatus === "Refund" || serviceStatus === "Repairs with no Parts" ? (

              <Form form={form} onFinish={onFinish}>
                <Descriptions bordered column={1} className={styles.descriptions}>
                  <Descriptions.Item label="Labor">

                    {laborAmount ? (
                      <div>${laborAmount}</div>  // Displaying the labor amount if it exists
                    ) : (
                      <Form.Item
                        style={{ margin: "0" }}
                        name="laborHours"
                        rules={[{ required: true, message: 'Please input labor cost!' }]}
                      >
                        <InputNumber
                          min={0}
                          formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => parseFloat(value?.replace(/\$\s?|(,*)/g, '') || '0') as unknown as 0}
                          style={{ width: '50%' }}
                          placeholder="Enter labor cost"
                          onChange={(value) => {
                            console.log(value);  // This will log the current value of the input
                          }}
                        />
                      </Form.Item>
                    )}
                  </Descriptions.Item>


                  {serviceStatus === "Repairs with part from Inventory" || serviceStatus === "Repairs with Custom Parts" ?
                    (
                      <Descriptions.Item
                        label="Inventory"
                      >

                        <Form.Item
                          name="item"
                          rules={[
                            { required: true, message: 'Please select an item' },
                          ]}
                        >
                          <Select
                            showSearch
                            // style={{ minWidth: '200px' }}
                            // mode="multiple"
                            placeholder="Select an item"
                            optionFilterProp="children"
                            labelInValue // Enable labelInValue
                            onChange={async (selectedValue) => {
                              const itemDetails = JSON.parse(selectedValue.value); // Parse the selected option's value which is a stringified JSON
                              console.log(itemDetails);
                              try {
                                // Fetch the current inventory first
                                const currentResponse = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/appointments/${id}`);
                                if (!currentResponse.ok) throw new Error('Failed to fetch current inventory');

                                const data = await currentResponse.json();
                                const currentInventory = data.inventory || []; // Default to an empty array if inventory is not set

                                const updatedInventory = [...currentInventory, itemDetails]; // Add the new item to the current inventory

                                // Now update the inventory with the new list
                                const updateResponse = await fetch(`https://defender-crm-dfcc459abdc0.herokuapp.com/appointments/${id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    inventory: updatedInventory // Send the updated inventory list
                                  }),
                                });

                                if (!updateResponse.ok) {
                                  throw new Error('Failed to update service status');
                                }

                                form.resetFields(['item']);
                                setInventoryState(updatedInventory)
                                // Update form state or local state as necessary
                                // For example, if maintaining inventory state locally:
                                // Assuming `setInventory` updates local state

                              } catch (error) {
                                console.error('Failed to update the service status:', error);
                              }
                            }}


                            dropdownRender={(menu) => (
                              <>
                                {menu}
                                <Button
                                  type="link"
                                  style={{ display: 'block', margin: '10px' }}
                                  onClick={() => {
                                    // Your logic to add a new client, like opening a modal

                                    navigate('/inventory/create')
                                  }}
                                >
                                  Add Inventory
                                </Button>
                              </>
                            )}
                          >
                            {inventory.map((item: InventoryItem) => (
                              <Select.Option
                                key={item.id}
                                value={JSON.stringify({
                                  id: item.id,
                                  itemCode: item.itemCode,
                                  itemName: item.itemName,
                                  category: item.category,
                                  modelNumber: item.modelNumber,
                                  originalPrice: item.originalPrice,
                                })}
                                label={`${item.itemName} ${item.itemCode}`}
                              >
                                {`${item.itemName} ${item.itemCode}`}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                      </Descriptions.Item>
                    )
                    : null}
                </Descriptions>

                {serviceStatus === "Service Call" || serviceStatus === "Repairs with no Parts" ? null : (
                  <ListInventory inventoryState={inventoryState} />
                )}


                <Row style={{ padding: "20px 0", display: "flex", justifyContent: "flex-end" }}>
                  <Col>
                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Submit
                      </Button>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>

            ) : null}
          </TabPane>) : null}
        <TabPane tab="Payment" key="3"></TabPane>
        <TabPane tab="Follow Up Appointment" key="4"></TabPane>
      </Tabs>
    </Drawer>
  )
}
