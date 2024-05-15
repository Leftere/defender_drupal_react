import { EditButton } from '@refinedev/antd'
import { useNavigation, useResource, useShow, useTable } from '@refinedev/core'

import {
  CalendarOutlined, ClockCircleOutlined, CloseOutlined, EditOutlined, FlagOutlined, InfoCircleOutlined, TeamOutlined, EnvironmentOutlined, PhoneOutlined,
} from '@ant-design/icons'
import { Button, Col, Tabs, Descriptions, Divider, Drawer, Form, Row, Select, Skeleton, Space, Tag, InputNumber, Tooltip, Table } from 'antd'
import { Text } from './components/calendar/text'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import styles from './show.module.css'

import { useFetchInventory } from './components/hooks/useFetchInventory'
import { useFetchServices } from './components/hooks/useFetchServices'
import { ListInventory } from './components/listInventory/listInventory'
import { useFetchAppointment } from './components/calendar/useFetchAppointments'
import { useUpdateAppointmentStatus } from './hooks/updateAppointmentStatus';
import { useUpdateAppointmentServices } from './hooks/updateAppointmentServices'
import { useUpdateAppointmentSerivceStatus } from './hooks/updateAppointmentSerivceStatus'
import { Invoice } from './components/invoices/Invoice'
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
interface AppointmentData {
  description?: string;
  status?: string;
  appliance?: Array<string>;
  job?: number;
  clientURL?: string;
  appStatus?: string;
  // Add any other relevant fields that might be part of the appointment details
}

interface ClientData {
  name?: string;
  address?: string;
  phone?: string;

  // Add any other relevant fields that might be part of the appointment details
}


export const AppointmentShowPage: React.FC = () => {

  const { id } = useResource()
  const { list } = useNavigation()
  const { queryResult } = useShow({})
  let { appointmentId } = useParams<{ appointmentId: string }>();
  const { data } = queryResult;
  const [isLoading, setIsLoading] = useState(true)
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({});
  const [clientData, setClientData] = useState<ClientData>({})
  const [appointmentStatus, setAppointmentStatus] = useState<string>('')
  const [serviceStatus, setServiceStatus] = useState(null)
  const [laborAmount, setLaborAmount] = useState<string | null>(null);
  const { updateAppointmentStatus, error } = useUpdateAppointmentStatus();
  const { updateAppointmentServices, isLoading: isLoadingServices, error: errorServices } = useUpdateAppointmentServices();
  const { updateAppointmentServiceStatus, isLoading: isLoadingServiceStatus, error: errorServiceStatus } = useUpdateAppointmentSerivceStatus();
  const [appointmentInventory, setappointmentInventory] = useState<FormValues[]>([])
  const [inventoryState, setInventoryState] = useState<InventoryItem[]>([])
  const { inventory, refetch, error: errorInventory } = useFetchInventory();
  const services = useFetchServices()
  const appointment = useFetchAppointment();
  const { TabPane } = Tabs
  const [form] = Form.useForm()

  const { start, end, category, title, participants, kind, name, phone, address, client, serviceState, service } = data?.data ?? {}



  const { description, status, appliance, clientURL, job, appStatus } = appointmentData;

  // const { name } = clientData;
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`/jsonapi/node/appointment1/${appointmentId}`);
        if (!response.ok) throw new Error("Failed to fetch current appointment");
        const json = await response.json()
        const appointmentObj = json.data;
        const mappedAppointment: AppointmentData = {
          description: appointmentObj.attributes.field_description,
          status: appointmentObj.attributes.field_status,
          appliance: appointmentObj.attributes.field_appliances,
          job: appointmentObj.attributes.drupal_internal__nid,
          clientURL: appointmentObj.relationships.field_client.links.related.href,
          appStatus: appointmentObj.attributes.field_appointment_status
        }

        setAppointmentData(mappedAppointment)

        setIsLoading(false)
      } catch (errro) {
        console.log(error, "Failed to load apointment")
      }
    }


    if (appointmentId) {
      fetchAppointment();
    }
  }, [appointmentId])

  useEffect(() => {
    if (clientURL) {

      const fetchClientData = async () => {
        try {
          const response = await fetch(clientURL);
          if (!response.ok) throw new Error("Failed to fetch current client data");
          const json = await response.json()
          const mappedClientObj = json.data

          const mappedClientData: ClientData = {
            name: `${mappedClientObj.attributes.field_clients_first_name} ${mappedClientObj.attributes.field_clients_last_name}`,
            address: `${mappedClientObj.attributes.field_address.address_line1}, ${mappedClientObj.attributes.field_address.locality}, ${mappedClientObj.attributes.field_address.administrative_area}, ${mappedClientObj.attributes.field_address.postal_code}`,
            phone: mappedClientObj.attributes.field_clients_primary_phone
          }
          // console.log(json)
          setClientData(mappedClientData)
        } catch (errro) {
          console.log(error, "Failed to load apointment")
        }
      }
      fetchClientData()
    }

  }, [clientURL])


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
      // setServiceStatus(serviceState)
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
  const fullAddress = clientData?.address ? clientData?.address : "N/A"
  // ? `${client.address.street}, ${client.address.city}, ${client.address.state} ${client.address.zip}`
  // : 'N/A';

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
    // window.location.reload();
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
                      if (!appointmentId) {
                        console.error("ID is undefined or null");
                        return;
                      }
                      const idAsString = String(appointmentId);
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
              <Descriptions bordered column={1} className="showfs">
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
                  {clientData?.name || 'N/A'}
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
                  <a href={`tel:${clientData?.phone || ''}`}>
                    <PhoneOutlined /> {clientData?.phone || 'N/A'}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {description || 'No description provided.'}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </TabPane>
        <TabPane tab="Payment" key="2">
        {appointmentId ? 
        <Invoice appointmentId={appointmentId} appliance={appliance}/> : <p>Appointment ID is missing.</p>}
        </TabPane>
        <TabPane tab="Follow Up Appointment" key="3"></TabPane>
      </Tabs>
    </Drawer>
  )
}
