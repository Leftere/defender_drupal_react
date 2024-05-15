import { Button, Card } from "antd"
import { CalendarForm } from "./components/form";
import { useState } from "react";
import { useCreateAppointment } from './components/hooks/useCreateAppointment'
import { useForm } from "@refinedev/antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone"; // Import the timezone plugin
import { CheckZipCode } from "./components/form/CheckZipCode";

dayjs.extend(utc);
dayjs.extend(timezone);


type FormValues = {
  rangeDate: [dayjs.Dayjs, dayjs.Dayjs];
  date: dayjs.Dayjs;
  time: string;
  color: any;
  description: string;
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

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOnFinish = async (values: FormValues) => {
   
    const {
      // rangeDate, date, time, color, ...otherValues 
      client,
      appliance,
      rangeDate,
      date,
      time,
      description
    } = values;

    let start = dayjs();
    let end = dayjs()

    if (rangeDate) {
      start = rangeDate[0].startOf("day").tz('America/New_York');
      end = rangeDate[1].endOf("day").tz('America/New_York');
    } else if (date && typeof time === 'string') {
      // Split the time string into start and end parts
      const [startTime, endTime] = time.split(' - ');
      const startTimeObject = dayjs(date.format("YYYY-MM-DD") + ' ' + startTime, "YYYY-MM-DD h A");
      const endTimeObject = dayjs(date.format("YYYY-MM-DD") + ' ' + endTime, "YYYY-MM-DD h A");
  
      start = startTimeObject;
      end = endTimeObject;
    }
  
   console.log(appliance, "i am appliance")
    // else {
    //   start = dayjs(date)
    //     .set("hour", time[0].hour() - 4)
    //     .set("minute", time[0].minute())
    //     .set("second", 0)
    //     .tz('America/New_York');

    //   end = dayjs(date)
    //     .set("hour", time[1].hour() - 4)
    //     .set("minute", time[1].minute())
    //     .set("second", 0)
    //     .tz('America/New_York');
    // }
    let data = {
      "data": {
        "type": "node--appointment1",
        "attributes": {
          "title": appliance.join(", "),
          "field_appliances": appliance,
          // field_rangedate: JSON.stringify(rangeDate),
          "field_appointment_start": start,
          "field_appointment_end": end,
          "field_description": description
        },
        "relationships": {
          "field_client": {
            "data": {
              "type": "node--clients",
              "id": client.uuid  // New client's ID
            }
          }
        }
      }
    }

    createAppointment(data, form);

    // await onFinish({
    //   // ...otherValues,
    //   // start: start,
    //   // end: end,
    //   appliance: appliance,
    //   title: appliance.join(", "),
    //   color: typeof color === "object" ? `#${color.toHex()}` : color,
    // });
    // window.location.reload();
  };

  return (
    <>
    <Button 
    type="default" 
    style={{marginBottom: "1rem"}} 
    onClick={showModal}

    >Check Zip Code</Button>
    
    <CheckZipCode isModalOpen={isModalOpen}     handleCancel={handleCancel}/>
    <Card>
        
      <CalendarForm
        isAllDayEvent={isAllDayEvent}

        setIsAllDayEvent={setIsAllDayEvent}
        form={form}
        formProps={{
          onFinish: handleOnFinish,
        }}
      />
      <Button type="primary" onClick={() => form.submit()}>Submit</Button>
    </Card>
    </>
    
  )
}

export default CreateAppoint;