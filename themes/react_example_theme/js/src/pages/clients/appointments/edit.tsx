import React, { useEffect, useState } from "react";

import { useForm } from "@refinedev/antd";
import { useNavigation, useResource } from "@refinedev/core";

import { Button, Drawer, Modal } from "antd";
import dayjs from "dayjs";

// import { Event } from "@/graphql/schema.types";
import { useNavigate } from "react-router-dom";
import { EditForm } from "./components/form/indexEditForm";
// import { CALENDAR_UPDATE_EVENT_MUTATION } from "./queries";

interface Event {
  // Existing properties...
  id: string;
  startDate: string;
  endDate: string;
  // Consider including other properties that might be missing but are used
}


export const AppointmentEditPage: React.FC = () => {
  const [isAllDayEvent, setIsAllDayEvent] = useState(false);
  const { id } = useResource();
  const { list } = useNavigation();
  const navigate = useNavigate()
  const { formProps, saveButtonProps, form, onFinish, queryResult } =
    useForm<Event>({
      action: "edit",
      id,
      queryOptions: {
        enabled: true,
      },
      // meta: {
      //   gqlMutation: CALENDAR_UPDATE_EVENT_MUTATION,
      // },
    });


  useEffect(() => {
    const startDate = queryResult?.data?.data.startDate;
    const endDate = queryResult?.data?.data.endDate;
    const utcStartDate = dayjs(startDate).utc();
    const utcEndDate = dayjs(endDate).utc();

    form.setFieldsValue({
      // categoryId: queryResult?.data?.data.category.id,
      // participantIds: queryResult?.data?.data.participants.map(
      //   (participant) => participant.id,
      // ),
    });

    // if more than 24 hours, set as all day event
    if (utcEndDate.diff(utcStartDate, "hours") >= 23) {
      setIsAllDayEvent(true);
      form.setFieldsValue({
        rangeDate: [utcStartDate, utcEndDate],
      });
    } else {
      form.setFieldsValue({
        date: utcStartDate,
        time: [utcStartDate, utcEndDate],
      });
    }
  }, [queryResult?.data]);

  

  const handleOnFinish = async (values: any) => {
    const { rangeDate, date, time, color, ...otherValues } = values;

    let startDate = dayjs();
    let endDate = dayjs();

    if (rangeDate) {
      startDate = rangeDate[0].utc().startOf("day");
      endDate = rangeDate[1].utc().endOf("day");
    } else {
      startDate = date
        .utc()
        .set("hour", time[0].hour())
        .set("minute", time[0].minute())
        .set("second", 0);

      endDate = date
        .utc()
        .set("hour", time[1].hour())
        .set("minute", time[1].minute())
        .set("second", 0);
    }

    await onFinish({
      ...otherValues,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      color: typeof color === "object" ? `#${color.toHex()}` : color,
    });
  };

  return (
    <Drawer
    title="Edit Event"
    open={true}
    onClose={() => {
      list("events");
      navigate('/appointments')
    }}
    width={560}
  >
    <EditForm
      isAllDayEvent={isAllDayEvent}
      setIsAllDayEvent={setIsAllDayEvent}
      form={form}
      formProps={{
        ...formProps,
        onFinish: handleOnFinish,
      }}
    />
         {/* Save Button */}
         <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <Button 
          {...saveButtonProps}
          onClick={() => form.submit()} // Assuming your form setup handles the save operation on submit
          type="primary"
        >
          Save
        </Button>
      </div>
  </Drawer>
    // <Modal
    //   title="Edit Event"
    //   open
    //   onCancel={() => {
    //     navigate('/appointments')
    //   }}
    //   okButtonProps={{
    //     ...saveButtonProps,
    //   }}
    //   okText="Save"
    //   width={560}
    // >
    //   <CalendarForm
    //     isAllDayEvent={isAllDayEvent}
    //     setIsAllDayEvent={setIsAllDayEvent}
    //     form={form}
    //     formProps={{
    //       ...formProps,
    //       onFinish: handleOnFinish,
    //     }}
    //   />
    // </Modal>
  );
};
