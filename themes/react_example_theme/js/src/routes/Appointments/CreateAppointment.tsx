import { Button, Card } from "antd"
import { CalendarForm } from "./components/form";
import { useState } from "react";
import { useCreateAppointment } from './components/hooks/useCreateAppointment'
import { useForm } from "@refinedev/antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone"; // Import the timezone plugin
import { CheckZipCode } from "./components/form/CheckZipCode";
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

type FormValues = {
  rangeDate: [dayjs.Dayjs, dayjs.Dayjs];
  date: dayjs.Dayjs;
  time: string;
  color: any;
  description: string;
  technician: any;
  appliance: string[]
  client: {
    uuid: string
  }
};

const CreateAppoint: React.FC = () => {
  const [isAllDayEvent, setIsAllDayEvent] = useState(false);
  const { createAppointment, isLoading, error } = useCreateAppointment();
  const { form } = useForm<FormValues>()
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate()
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOnFinish = async (values: FormValues) => {
 
    const { client, appliance, rangeDate, date, time, description, technician } = values;

    let start = dayjs();
    let end = dayjs();

    if (rangeDate) {
      start = rangeDate[0].startOf("day").tz('America/New_York');
      end = rangeDate[1].endOf("day").tz('America/New_York');
    } else if (date && typeof time === 'string') {
      const [startTime, endTime] = time.split(' - ');
      const combinedStartTimeString = `${date.format('YYYY-MM-DD')} ${startTime}`;
      const combinedEndTimeString = `${date.format('YYYY-MM-DD')} ${endTime}`;
      const startTimeObject = dayjs.tz(combinedStartTimeString, 'YYYY-MM-DD h A', 'America/New_York');
      const endTimeObject = dayjs.tz(combinedEndTimeString, 'YYYY-MM-DD h A', 'America/New_York');

      // const startTimeObject = dayjs.tz(`${date.format("YYYY-MM-DD")} ${startTime}`, "YYYY-MM-DD h A", 'America/New_York');
      // const endTimeObject = dayjs.tz(`${date.format("YYYY-MM-DD")} ${endTime}`, "YYYY-MM-DD h A", 'America/New_York');
      start = startTimeObject;
      end = endTimeObject;


 
    }
 
    const technicianObject = JSON.parse(technician);

    let data = {
      "data": {
        "type": "node--appointment1",
        "attributes": {
          "title": appliance.join(", "),
          "field_appliances": appliance,
          // field_rangedate: JSON.stringify(rangeDate),
          "field_appointment_start": start.format('YYYY-MM-DDTHH:mm:ss'),
          "field_appointment_end": end.format('YYYY-MM-DDTHH:mm:ss'),
          "field_description": description
        },
        "relationships": {
          "field_client": {
            "data": {
              "type": "node--clients",
              "id": client.uuid  // New client's ID
            }
          },
          "field_technician": {
            "data": {
              "type": "user--technicians",
              "id": technicianObject.uuid
            }
          }
        }
      }
    }
    try {
      await createAppointment(data, form);
      navigate('/appointments/');
      // window.location.reload(); // Ensure the page is refreshed
    } catch (error) {
      console.error("Failed to create appointment:", error);
    }
  
  };

  return (
    <>
      <Button
        type="default"
        style={{ marginBottom: "1rem" }}
        onClick={showModal}

      >Check Zip Code</Button>

      <CheckZipCode isModalOpen={isModalOpen} handleCancel={handleCancel} />
      <Card>

        <CalendarForm
          isAllDayEvent={isAllDayEvent}

          setIsAllDayEvent={setIsAllDayEvent}
          form={form}
          formProps={{
            onFinish: handleOnFinish,
          }}
        />
        <Button type="primary"  style={{marginTop:"1rem", display:"block"}} onClick={() => form.submit()}>Submit</Button>
      </Card>
    </>

  )
}

export default CreateAppoint;