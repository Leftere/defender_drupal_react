import React, { useCallback, useEffect, useState } from "react";
import { useSelect } from "@refinedev/antd";
import { GetFieldsFromList } from "@refinedev/nestjs-query";
import { appliances } from "./appliances";
import { useFetchTechnicians } from "../hooks/useFetchTechnicians";
import { useFetchClients } from "../hooks/useFetchClients";
import { AddTechnician } from './AddTechnician'
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone"; // Import the timezone plugin
import dayjs from "dayjs";
import './index.css'
import {
  Checkbox,
  Col,
  ColorPicker,
  DatePicker,
  Form,
  FormInstance,
  FormProps,
  Input,
  AutoComplete,
  Row,
  Select,
  Typography,
  TimePicker,
  Button,
} from "antd";
import { useNavigate } from "react-router-dom";
import { CreateClient } from "./createClient";

dayjs.extend(utc);
dayjs.extend(timezone);

type CalendarFormProps = {
  isAllDayEvent: boolean;
  setIsAllDayEvent: (value: boolean) => void;
  formProps: FormProps;
  form: FormInstance;
};

interface Technician {
  id: string;
  uuid: string;
  firstName: string;
  lastName: string;
  schedule: { [key: string]: string[] };
}

interface Client {
  id: string,
  uuid: string,
  firstName: string,
  lastName: string,
  address: string,
  primaryPhone: string,
  zipCode: string
}

export const CalendarForm: React.FC<CalendarFormProps> = ({
  form,
  formProps,
  isAllDayEvent = false,
  setIsAllDayEvent,
}) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isTechnicianModalOpen, setTechnicianModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [techZipCode, setTechZipCode] = useState("");

  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const { clients, refetch } = useFetchClients();

  const rangeDate = form.getFieldsValue().rangeDate;
  const date = form.getFieldsValue().date;
  const time = form.getFieldsValue().time;

  const fetchTechnicians = async () => {
    if (techZipCode === null) {
      console.log("Tech Zip Code is null, skipping fetch.");
      return;  // Early exit if techZipCode is null
    }
    setIsLoading(true); // Start loading state
    try {
      const response = await fetch(`/jsonapi/user/user`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const selectedTime = dayjs(selectedDate).format("h:mm A");

      const mappedTechnicians = json.data
        .filter((item: any) => item.attributes.display_name !== 'Anonymous')  // Exclude anonymous users
        .map((item: any, index: any) => {
          let zipCodes = [];
          let schedule = {};
          try {
            zipCodes = item.attributes.field_zip_code.slice(1, -1).split(",").map((zip: string) => zip.trim());
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

  useEffect(() => {
    fetchTechnicians();
  }, [techZipCode]);

  const showModal = () => setIsModalOpen(true);
  const closeModal = async () => {
    setIsModalOpen(false);
    refetch();
  };

  const handleTechnicianChange = (value: string) => {
    const tech = JSON.parse(value); // Parse the technician object from the value
    console.log('Selected Technician UUID:', tech.uuid); // Log the uuid
    setSelectedTechnician(tech);
  };

  const parseTime = (timeSlots: any) => {
    const startTime = timeSlots.split(' - ')[0];
    return dayjs(startTime, 'h A').tz('America/New_York');
  };

  const sortTimeSlots = (timeSlots: any) => {
    return timeSlots.sort((a: any, b: any) => {
      return parseTime(a).isAfter(parseTime(b)) ? 1 : -1;
    });
  };

  const availableTimeSlots = selectedTechnician && selectedDate
    ? sortTimeSlots(selectedTechnician.schedule[selectedDate.format('dddd').toUpperCase()])
    : [];

  return (
    <Form layout="vertical" form={form} {...formProps} style={{ display: "block" }} >
      <Row gutter={[23, 0]}>
        <Col span={12} xs={24} lg={8}>
          <Form.Item
            label="Appliance"
            name="appliance"
            rules={[{ required: true, message: "Please select an appliance!" }]}
          >
            <Select placeholder="Select an appliance" mode="multiple">
              {appliances.map((title, index) => (
                <Select.Option key={index} value={title} >
                  <span className="title">{title.replace(/_/g, ' ')}</span>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} lg={6}>
          <Form.Item
            label="Add client"
            name="client"
            rules={[{ required: true, message: "Please select a client" }]}

          >
            <Select
              showSearch
              placeholder="Select a client"
              optionFilterProp="children"
              labelInValue
              onChange={(value, option) => {
                const clientDetails = JSON.parse(value.value);
                setTechZipCode(clientDetails.zipCode);
                const clientObj = {
                  id: clientDetails.id,
                  uuid: clientDetails.uuid,
                  firstName: clientDetails.firstName,
                  lastName: clientDetails.lastName,
                  address: clientDetails.address,
                  primaryPhone: clientDetails.primaryPhone,
                };
                form.setFieldsValue({ client: clientObj });
              }}
            >
              {clients.map((client: Client) => (
                <Select.Option
                  key={client.id}
                  value={JSON.stringify({
                    id: client.id,
                    uuid: client.uuid,
                    firstName: client.firstName,
                    lastName: client.lastName,
                    address: client.address,
                    primaryPhone: client.primaryPhone,
                    zipCode: client.zipCode
                  })}
                  label={`${client.firstName} ${client.lastName}`}
                >
                  {`${client.firstName} ${client.lastName? client.lastName : "" }`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <CreateClient key={isModalOpen ? "isTechnicianModalOpen" : "closed"} isOpen={isModalOpen} onClose={closeModal} />
        </Col>
        <Col lg={6} xs={24} style={{ display: "flex", alignItems: "center", marginTop: ".25rem"}}>
          <Button type="default" onClick={showModal} style={{ marginRight: "1rem" }}>
            Add Client
          </Button>
        </Col>
      </Row>
      {techZipCode === "" ? null : (
        <>
          <strong style={{ marginBottom: "1rem", marginTop: "1rem", display: "block" }}>Zip Code: {techZipCode}</strong>
          {technicians.length > 0 ? (
            <>
              <Row style={{ marginBottom: "1rem" }} align="middle">
                <Col span={6} xs={24} lg={4} style={{ marginRight: "1rem" }}>
                  <Form.Item label="Add Technician" name="technician" rules={[{ required: true }]}>
                    <Select onChange={(value: string) => handleTechnicianChange(value)} placeholder="Select a technician">
                      {technicians.map((tech: any) => (
                        <Select.Option key={tech.id} value={JSON.stringify(tech)}>
                          {`${tech.firstName} ${tech.lastName}`}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} lg={2} style={{ marginTop: ".5rem", marginRight: "1rem", marginBottom: "1rem" }}>
                  <Form.Item
                    label="Pick a date"
                    name="date"
                    rules={[{ required: true }]}
                    style={{marginTop: "0.5rem"}}
                    // noStyle
                  >
                    <DatePicker
                      format={"YYYY/MM/DD"}
                      value={dayjs(rangeDate ? rangeDate[0] : undefined)}
                      style={{ height: "32px" }}
                      onChange={(date, dateString) => {
                        setSelectedDate(date);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col lg={4} xs={24}>
                  <Form.Item label="Available Time Slots" name="time" rules={[{ required: true }]}>
                    <Select placeholder="Select a time slot">
                      {availableTimeSlots?.map((time: any, index: any) => (
                        <Select.Option key={index} value={time}>
                          {time}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col lg={4} xs={24}>
                  <Form.Item label="Description" name="description">
                    <Input.TextArea />
                  </Form.Item>
                </Col>
              </Row>
            </>
          ) : (
            <Col style={{ textAlign: 'center' }}>
              <div style={{ textAlign: 'center', marginTop: 50 }}>
                <Typography.Text type="secondary" style={{ textAlign: 'center', display: "block" }}>
                  Sorry, no available technicians in this <strong>{techZipCode}</strong> Zip Code.
                </Typography.Text>
              </div>
            </Col>
          )}
        </>
      )}
    </Form>
  );
};
