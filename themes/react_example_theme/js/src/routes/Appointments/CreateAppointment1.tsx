import { Col, Form, Input, Modal, Row } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { CalendarForm } from "./components/form";
import { HttpError } from "@refinedev/core";
import { useForm } from "@refinedev/antd";

import {useCreateAppointment} from './components/hooks/useCreateAppointment'
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone"; // Import the timezone plugin
// import { Event, EventCreateInput } from "@/graphql/schema.types";
interface Props {
  open: boolean;
  handleCancel: () => void,
}

type FormValues =  {
  rangeDate: [dayjs.Dayjs, dayjs.Dayjs];
  date: dayjs.Dayjs;
  time: [dayjs.Dayjs, dayjs.Dayjs];
  color: any;
  appliance: string[]
  client: {
    uuid: string
  }
};

const CreateAppointment: React.FC<Props> = ({ open, handleCancel }) => {
  const [isAllDayEvent, setIsAllDayEvent] = useState(false);
  const {createAppointment, isLoading, error } = useCreateAppointment();
  const {  form } = useForm<FormValues>()
 

  const handleOnFinish = async (values: FormValues) => {

    const { 
      // rangeDate, date, time, color, ...otherValues 
      client,
      appliance,
      rangeDate
    } = values;
 

    let data = {
      "data": {
        "type": "node--appointment1",
        "attributes": {
          "title": "hello",
          "field_appliances": appliance,
          field_rangedate: JSON.stringify(rangeDate)
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

    let start = dayjs();
    let end = dayjs()

    // if (rangeDate) {
    //   start = rangeDate[0].startOf("day").tz('America/New_York');
    //   end = rangeDate[1].endOf("day").tz('America/New_York');
    // } else {
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
    <Modal
      open={open}
      onCancel={handleCancel}
      onOk={() => form.submit()}
    >

      {/* <CalendarForm
        isAllDayEvent={isAllDayEvent}
        setIsAllDayEvent={setIsAllDayEvent}
        form={form}
        formProps={{
          onFinish: handleOnFinish,
        }}
      /> */}
    </Modal>
  )
}

export default CreateAppointment;