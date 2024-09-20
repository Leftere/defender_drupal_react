import { EditButton } from '@refinedev/antd'
import { useNavigation, useResource, useShow, useTable } from '@refinedev/core'
import dayjs from 'dayjs';
import {
  CalendarOutlined, ClockCircleOutlined, CloseOutlined, EditOutlined, FlagOutlined, InfoCircleOutlined, TeamOutlined, EnvironmentOutlined, PhoneOutlined,
} from '@ant-design/icons'
import { Button, Col, Tabs, Descriptions, Divider, Drawer, Form, Row, Select, Skeleton, Space, Tag, InputNumber, Tooltip, Table } from 'antd'
import { Text } from './components/calendar/text'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './show.css'

import { useFetchInventory } from './components/hooks/useFetchInventory'
import { useFetchServices } from './components/hooks/useFetchServices'
import { ListInventory } from './components/listInventory/listInventory'
import { useFetchAppointment } from './components/calendar/useFetchAppointments'
import { useUpdateAppointmentStatus } from './hooks/updateAppointmentStatus';
import { useUpdateAppointmentServices } from './hooks/updateAppointmentServices'
import { useUpdateAppointmentSerivceStatus } from './hooks/updateAppointmentSerivceStatus'
import { Invoice } from './components/invoices/Invoice'
import { CreateFollowUpAppointment } from './components/followUpAppointment/CreateFollowUpAppointment';

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
  start?: string;
  end?: string;
  quote?: any;
  clientID?: string;
  technicianID?: string;
  followUpAppointment?: boolean;
  invoices?: any;
  invoicesHistory?: any;
  // Add any other relevant fields that might be part of the appointment details
}

interface ClientData {
  name?: string;
  address?: string;
  phone?: string;
  secondaryPhone?: string
  clientEmail?: string

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
  const [techName, setTechName] = useState<string>('')
  const { updateAppointmentStatus, error } = useUpdateAppointmentStatus();

  const { TabPane } = Tabs
  const [form] = Form.useForm()

  const { description, status, appliance, clientURL, job, appStatus, start, end, followUpAppointment, invoices, invoicesHistory, technicianID } = appointmentData;

 
 useEffect(() => {
  const fetchTechnicianData = async () => {
    try {
      const response = await fetch(`/jsonapi/user/user/${technicianID}`);
      if (!response.ok) throw new Error("Failed to fetch Technician data");
      const json = await response.json()
      const technicianObj = json.data;
      setTechName(`${technicianObj.attributes.field_first_name} ${technicianObj.attributes.field_last_name}` )
    } catch {
      console.log(error, "failed to load technician data")
    }
  }
  if (technicianID) {
    fetchTechnicianData();
  }
}, [technicianID])
 
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
          appStatus: appointmentObj.attributes.field_appointment_status,
          start: dayjs(appointmentObj.attributes.field_appointment_start).format('MMMM D, h:mm A'),
          end: dayjs(appointmentObj.attributes.field_appointment_end).format('h:mm A'),
          clientID: appointmentObj.relationships.field_client.data.id,
          technicianID: appointmentObj.relationships.field_technician.data.id,
          followUpAppointment: appointmentObj.attributes.field_follow_up_appointment,
          invoices: appointmentObj.attributes.field_invoices,
          invoicesHistory: appointmentObj.attributes.field_invoices_history
        }
       
        setAppointmentData(mappedAppointment)

        setIsLoading(false)
   
      } catch (error) {
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
            name: `${mappedClientObj.attributes.field_clients_first_name} ${mappedClientObj.attributes.field_clients_last_name? mappedClientObj.attributes.field_clients_last_name : ''}`,
            address: `${mappedClientObj.attributes.field_address.address_line1}, ${mappedClientObj.attributes.field_address.locality}, ${mappedClientObj.attributes.field_address.administrative_area}, ${mappedClientObj.attributes.field_address.postal_code}`,
            phone: mappedClientObj.attributes.field_clients_primary_phone,
            secondaryPhone: mappedClientObj.attributes.field_clients_secondary_phone,
            clientEmail: mappedClientObj.attributes.field_clients_e_mail
          }
          setClientData(mappedClientData)
        } catch (error) {
          console.log(error, "Failed to load apointment")
        }
      }
      fetchClientData()
    }

  }, [clientURL])


  const { sorters } = useTable({
    syncWithLocation: true,
  });


  const fullAddress = clientData?.address ? clientData?.address : "N/A"

  function formatPhoneNumber(phone: string) {
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }
    return null;
  }


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
    PartsInstallation = 'Parts Installation'
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
      case 'Parts Installation':
        return '#00afb9'
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

            <Text strong size="md" style={{ textTransform: "capitalize" }}>
              {appliance?.join(", ").replace(/_/g, " ")}
            </Text>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {/* <EditButton icon={<EditOutlined />} hideText type="text" /> */}
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
                  : appointmentStatus === "In Progress" || appointmentStatus === "Parts Installation" ?
                    <Button
                      type="primary"
                      size="large"
                      danger
                      onClick={async (): Promise<void> => {
                        if (!appointmentId) {
                          console.error("ID is undefined or null");
                          return;
                        }
                        const idAsString = String(appointmentId);
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
                <Descriptions.Item label="Technician"><strong>{techName || 'N/A'}</strong></Descriptions.Item>
                {followUpAppointment === null ? <Descriptions.Item label="New Appointment"><strong>Yes</strong></Descriptions.Item> : <Descriptions.Item label="Follow Up Appointment"><strong>Yes</strong></Descriptions.Item>}
                <Descriptions.Item label="Date/Time"><strong>{start} - {end}</strong></Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={getColorByStatus(
                      appointmentStatus as AppointmentStatus,
                    )}
                  >
                    {appointmentStatus}

                  </Tag>
                  {appointmentStatus === "Parts Installation" || appointmentStatus === "Completed" ?  null : (
                    <Button
                      type="primary"
                      className="customPartsBtn"
                      style={{
                        backgroundColor: '#00afb9',
                        borderColor: '#4CAF50',
                        color: '#fff',
                      }}
                      icon={<ClockCircleOutlined />}
                      onClick={async (): Promise<void> => {
                        if (!appointmentId) {
                          console.error("ID is undefined or null");
                          return;
                        }
                        const idAsString = String(appointmentId);
                        await updateAppointmentStatus(idAsString, 'Parts Installation', '#00afb9');
                        setAppointmentStatus('Parts Installation');
                      }}
                    >
                      Parts Installation
                    </Button>
                  )}

                </Descriptions.Item>
                <Descriptions.Item label="Appliances">
                  {appliance?.map((item: string, index: number) => (
                    <Tag key={index} color="blue" style={{ textTransform: "capitalize" }}>
                    {item.replace(/_/g, " ")}
                    </Tag>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="Customer">
                  <strong>{clientData?.name || 'N/A'}</strong>
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
                  <a href={`tel:${clientData.phone ? formatPhoneNumber(clientData.phone) : ''}`}>
                    <PhoneOutlined /> {clientData.phone ? formatPhoneNumber(clientData.phone) : 'N/A'}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Secondary Phone Number">
                  <a href={`tel:${clientData.secondaryPhone ? formatPhoneNumber(clientData.secondaryPhone) : ''}`}>
                    <PhoneOutlined /> {clientData.secondaryPhone ? formatPhoneNumber(clientData.secondaryPhone) : 'N/A'}
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
            <Invoice appointmentId={appointmentId} appointmentData={appointmentData} appliance={appliance} clientData={clientData} /> : <p>Appointment ID is missing.</p>}
        </TabPane>
        <TabPane tab="Follow Up Appointment" key="3">
          <CreateFollowUpAppointment appointmentData={appointmentData} />
        </TabPane>
      </Tabs>
    </Drawer>
  )
}
