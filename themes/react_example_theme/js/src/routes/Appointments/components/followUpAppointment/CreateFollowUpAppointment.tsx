import React, { useEffect, useState, useCallback } from "react";
import { DatePicker, TimePicker, Form, Input, Button, Row, Col, Select } from "antd";
import { useCreateAppointment } from "../hooks/useCreateAppointment";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

interface AppointmentProps {
  appointmentData: any;
}

interface Technician {
  id: string;
  uuid: string;
  firstName: string;
  lastName: string;
  schedule: { [key: string]: string[] };
}

export const CreateFollowUpAppointment: React.FC<AppointmentProps> = ({ appointmentData }) => {
  const { createAppointment, isLoading } = useCreateAppointment();
  const [techZipCode, setTechZipCode] = useState<string>("");
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const navigate = useNavigate()
  const [form] = Form.useForm();
  const { appliance, clientID, technicianID, clientURL, invoices } = appointmentData;

  console.log(invoices, "invoices")

  const fetchClientZipCode = useCallback(async () => {
    try {
      const response = await fetch(clientURL);
      if (!response.ok) throw new Error("Failed to fetch client data");
      const json = await response.json();
      const clientInfo = json.data;
      setTechZipCode(clientInfo.attributes.field_address.postal_code);
    } catch (error) {
      console.error("Failed to load client URL", error);
    }
  }, [clientURL]);

  useEffect(() => {
    fetchClientZipCode();
  }, [fetchClientZipCode]);

  const fetchTechnicians = useCallback(async () => {
    if (!techZipCode) return;

    try {
      const response = await fetch(`/jsonapi/user/user`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const json = await response.json();

      const mappedTechnicians = json.data
        .filter((item: any) => item.attributes.display_name !== 'Anonymous')
        .map((item: any, index: number) => {
          let zipCodes: string[] = [];
          let schedule = {};
          try {
            zipCodes = item.attributes.field_zip_code.slice(1, -1).split(",").map((zip: string) => zip.trim());
            schedule = JSON.parse(item.attributes.field_schedule);
          } catch (parseError) {
            console.error('Failed to parse zip codes:', parseError);
          }

          if (!zipCodes.includes(techZipCode)) return null;

          return {
            id: (index + 1).toString(),
            uuid: item.id,
            firstName: item.attributes.field_first_name,
            lastName: item.attributes.field_last_name,
            schedule: schedule,
          };
        })
        .filter((technician: Technician | null): technician is Technician => technician !== null);

      setTechnicians(mappedTechnicians);
    } catch (error) {
      console.error('Failed to fetch technicians:', error);
    }
  }, [techZipCode]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const handleSubmit = async () => {
    if (selectedDate && selectedTechnician) {
      const selectedTime = form.getFieldValue("time");
      const startDateTime = selectedDate.set('hour', dayjs(selectedTime, 'h A').hour()).set('minute', dayjs(selectedTime, 'h A').minute());
      const endDateTime = startDateTime.add(3, 'hour');
      const description = form.getFieldValue('description');
      const data = {
        data: {
          type: "node--appointment1",
          attributes: {
            title: appliance.join(", "),
            field_appliances: appliance,
            field_appointment_start: startDateTime.format('YYYY-MM-DDTHH:mm:ss'),
            field_appointment_end: endDateTime.format('YYYY-MM-DDTHH:mm:ss'),
            field_description: description,
            field_follow_up_appointment: true,
            field_invoices: invoices
          },
          relationships: {
            field_client: {
              data: {
                type: "node--clients",
                id: clientID,
              }
            },
            field_technician: {
              data: {
                type: "user--technicians",
                id: selectedTechnician.uuid,
              }
            }
          }
        }
      };

      try {
        await createAppointment(data, form);
        navigate('/appointments/');
        // window.location.reload(); // Ensure the page is refreshed
      } catch (error) {
        console.error("Failed to create appointment:", error);
      }
    } 
  };

  const handleTechnicianChange = (value: string) => {
    const tech = JSON.parse(value);
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
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <Row gutter={16}>
          <Col span={24} md={24}>
            <Form.Item label="Add Technician" name="technician" rules={[{ required: true, message: "Please select a technician!" }]}>
              <Select onChange={(value: string) => handleTechnicianChange(value)} placeholder="Select a technician">
                {technicians.map((tech) => (
                  <Select.Option key={tech.id} value={JSON.stringify(tech)}>
                    {`${tech.firstName} ${tech.lastName}`}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24} md={8}>
            <Form.Item label="Pick a Date" name="date" rules={[{ required: true, message: "Please select a date!" }]}>
              <DatePicker
                format="YYYY/MM/DD"
                onChange={(date) => setSelectedDate(date)}
              />
            </Form.Item>
          </Col>
          <Col span={24} md={24}>
            <Form.Item label="Available Time Slots" name="time" rules={[{ required: true, message: "Please select a time slot!" }]}>
              <Select placeholder="Select a time slot">
                {availableTimeSlots.map((time: any, index: any) => (
                  <Select.Option key={index} value={time}>
                    {time}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label="Description" name="description" rules={[{ required: true, message: "Please enter a description!" }]}>
          <Input.TextArea />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} style={{ width: "100%" }}>
            Create Follow-Up Appointment
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};