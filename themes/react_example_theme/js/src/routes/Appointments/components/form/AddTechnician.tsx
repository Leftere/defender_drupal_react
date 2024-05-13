import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Spin, Table, Radio, Typography, Select } from "antd"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone"; // Import the timezone plugin

dayjs.extend(utc);
dayjs.extend(timezone);

type TechnicianProps = {
  isTechnicianModalOpen: boolean;
  closeTechModal: () => void;
  techZipCode: number;
  isAllDayEvent: boolean;
  selectedTimeRange: any;
  selectedDate: any;
  dateRange: any;
}

interface Technician {
  id: string;
  firstName: string;
  lastName: string;
  primaryPhone: string;
  title: string;
  employedSince: string;
  status: string,
  address: string;
  email: string;
  clientSince: string;
  uuid: string
  nid: string
}

interface RecordType {
  id: string; // Assuming there's an ID field
  // Define other fields here
  address: string
  // address: {
  //   street: string;
  //   city: string;
  //   state: string;
  //   zip: string;
  // };
  // Add any other properties that are accessed in your table
}

const { Title, Paragraph, Text } = Typography;


const rowSelection = {
  onChange: (selectedRowKeys: React.Key[], selectedRows: any) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: (record: any) => ({
    disabled: record.name === 'Disabled User', // Column configuration not to be checked
    name: record.name,
  }),
};

export const AddTechnician: React.FC<TechnicianProps> = ({
  isTechnicianModalOpen,
  closeTechModal,
  techZipCode,
  isAllDayEvent,
  selectedTimeRange,
  selectedDate,
  dateRange
}) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);




  let start = dayjs();
  let end = dayjs()

  if (selectedTimeRange) {
    start = dayjs(selectedDate)
      .set("hour", selectedTimeRange[0].hour())
      .set("minute", selectedTimeRange[0].minute())
      .set("second", 0)
      .tz('America/New_York');

    end = dayjs(selectedDate)
      .set("hour", selectedTimeRange[1].hour())
      .set("minute", selectedTimeRange[1].minute())
      .set("second", 0)
      .tz('America/New_York');
  }
  useEffect(() => {
    fetchTechnicians();
  }, [techZipCode]);

  const selectedDay = dayjs(selectedDate).format("dddd").toUpperCase();

  console.log(selectedDay)


  const handleTechnicianChange = (technicianId: string) => {
    const tech = technicians.find(t => t.id === technicianId);
    setSelectedTechnician(tech ?? null);
  };

  const fetchTechnicians = async () => {

    setIsLoading(true); // Start loading state
    try {
      const response = await fetch(`/jsonapi/user/user`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();

      // "MONDAY", "TUESDAY", etc.
      const selectedTime = dayjs(selectedDate).format("h:mm A");

      // Prepare technicians data by filtering and mapping
      const mappedTechnicians = json.data
        .filter((item: any) => item.attributes.display_name !== 'Anonymous')  // Exclude anonymous users
        .map((item: any, index: any) => {
          // Safely parse the zip codes or set an empty array if parsing fails
          let zipCodes = [];
          let schedule = {};
          try {
            zipCodes = JSON.parse(item.attributes.field_zip_codes).map(String);
            schedule = JSON.parse(item.attributes.field_schedule);

          } catch (parseError) {
            console.error('Failed to parse zip codes:', parseError);
          }

          if (!zipCodes.includes(techZipCode.toString())) {
            return null;
          }

          return {
            id: (index + 1).toString(),
            uuid: item.id,
            firstName: item.attributes.field_first_name,
            lastName: item.attributes.field_last_name,
            primaryPhone: item.attributes.field_primary_phone,
            salaryRate: item.attributes.field_salary_rate,
            address: `${item.attributes.field_address.address_line1}, ${item.attributes.field_address.locality}, ${item.attributes.field_address.administrative_area}, ${item.attributes.field_address.postal_code}`,
            email: item.attributes.mail,
            schedule: schedule,
            skills: item.attributes.field_skills,
            zipCodes: zipCodes
          };
        })
        .filter((technician: any) => technician !== null); // Remove any null entries resulting from zip code mismatches


      setTechnicians(mappedTechnicians); // Update state with filtered and mapped technicians
    } catch (error) {
      console.error('Failed to fetch technicians:', error);
    } finally {
      setIsLoading(false); // End loading state
    }
  };




  function formatPhoneNumber(phoneNumber: string) {
    const cleaned = ('' + phoneNumber).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `+1 (${match[1]}) ${match[2]}-${match[3]}`;
    }
    return null;
  }
  return (
    <div
    //  open={isTechnicianModalOpen} width={1500} onCancel={closeTechModal}
    >
      <Text style={{ display: "block", marginBottom: "1rem" }}>
        <Title level={4}>Find Technician </Title>
        <span >Zip Code:  <strong style={{ color: 'red' }}>{techZipCode}</strong></span>
        <br />
        {/* <strong style={{ color: 'blue', marginRight: '10px' }}>Start: {
          selectedTimeRange ?
            start.format("YYYY-MM-DD HH:mm A") : "No time has been selected"}</strong>
        <strong style={{ color: 'green' }}>
          {selectedTimeRange ? ("End:" + `${end.format("YYYY-MM-DD HH:mm A")}`) : null}
        </strong> */}
      </Text>

      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Spin size="large" />
        </div>
      ) : technicians.length > 0 ? (
        <Select onChange={(value: string) => handleTechnicianChange(value)} placeholder="Select a technician">
        {technicians.map((tech) => (
          <Select.Option key={tech.id} value={tech.id}>
            {tech.firstName}
          </Select.Option>
        ))}
      </Select>
      
        // <Table dataSource={technicians} rowKey="id" style={{ marginTop: "1rem" }}
        //   rowSelection={{
        //     type: selectionType,
        //     ...rowSelection,
        //   }}
        // >
        //   <Table.Column title="Technician" dataIndex="firstName"

        //   />

        //   <Table.Column dataIndex="primaryPhone" title="Primary Phone"
        //     render={(text, record: Technician) => {
        //       const formattedPhone = formatPhoneNumber(record.primaryPhone);
        //       return formattedPhone ? (
        //         <a href={`tel:${formattedPhone}`} target="_blank" rel="noopener noreferrer">
        //           {formattedPhone}
        //         </a>
        //       ) : (
        //         <span>Invalid number</span> // Or however you wish to handle invalid numbers
        //       );
        //     }}
        //   />

        // </Table>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 50 }}>
          <Typography.Text type="secondary">Sorry, no available technicians in this area.</Typography.Text>
        </div>
      )}
    </div>
  )
}