import React, { useState } from "react";

import { useForm } from "@refinedev/antd";
import { HttpError, useNavigation } from "@refinedev/core";

import { Modal } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone"; // Import the timezone plugin
// import { Event, EventCreateInput } from "@/graphql/schema.types";

import { CalendarForm } from "./components/form";
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);

type FormValues =  {
  rangeDate: [dayjs.Dayjs, dayjs.Dayjs];
  date: dayjs.Dayjs;
  time: [dayjs.Dayjs, dayjs.Dayjs];
  color: any;
  appliance: any
};

export const AppointmentCreatePage: React.FC = () => {
  const [isAllDayEvent, setIsAllDayEvent] = useState(false);
  // const { list } = useNavigation();
  const navigate = useNavigate()

  const { formProps, saveButtonProps, form, onFinish } = useForm<
    Event,
    HttpError
  >();

  const handleOnFinish = async (values: FormValues) => {

    const { rangeDate, date, time, color, appliance, ...otherValues } = values;

    

    let start = dayjs();
    let end = dayjs()

    if (rangeDate) {
      start = rangeDate[0].startOf("day").tz('America/New_York');
      end = rangeDate[1].endOf("day").tz('America/New_York');
    } else {
      start = dayjs(date)
        .set("hour", time[0].hour() - 4)
        .set("minute", time[0].minute())
        .set("second", 0)
        .tz('America/New_York');

      end = dayjs(date)
        .set("hour", time[1].hour() - 4)
        .set("minute", time[1].minute())
        .set("second", 0)
        .tz('America/New_York');
    }

    await onFinish({
      ...otherValues,
      start: start,
      end: end,
      appliance: appliance,
      title: appliance.join(", "),
      color: typeof color === "object" ? `#${color.toHex()}` : color,
    });
    // window.location.reload();
  };

  return (
    <Modal
      title="Create Appointment"
      open
      onCancel={() => {
        // list("events");
        navigate('/appointments')
      }}
      okButtonProps={{
        ...saveButtonProps,
      }}
      okText="Save"
      width={560}
    >
      <CalendarForm
        isAllDayEvent={isAllDayEvent}
        setIsAllDayEvent={setIsAllDayEvent}
        form={form}
        formProps={{
          ...formProps,
          onFinish: handleOnFinish,
        }}
      />
    </Modal>
  );
};
