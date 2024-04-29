import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";

import { useList } from "@refinedev/core";
import { GetFieldsFromList } from "@refinedev/nestjs-query";

import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import FullCalendar from "@fullcalendar/react";
import { Button, Card, Grid, Radio } from "antd";
import dayjs from "dayjs";

import { Text } from "./text";
// import { Event } from "@/graphql/schema.types";
// import { CalendarEventsQuery } from "@/graphql/types";

import  "./index.css";
// import { CALENDAR_EVENTS_QUERY } from "./queries";

// import {FullCalendarWrapper } from './full-calendar'
const FullCalendarWrapper = lazy(() => import("./full-calendar"));

type View =
  | "dayGridMonth"
  | "timeGridWeek"
  | "timeGridDay"
  | "listMonth"
  | "listDay"
  | "listWeek";

  

type EventData = {
  id: string;
  start: string;
  appliance?: string;
  end: string;
  title: string;
  allDay: boolean;
  color: string;
  status: string;
  
};

type CalendarProps = {
  categoryId?: string[];
  onClickEvent?: (event: Event) => void;
};

export const Calendar: React.FC<CalendarProps> = ({
  categoryId,
  onClickEvent,
}) => {
  const [calendarView, setCalendarView] = useState<View>("dayGridMonth");
  const calendarRef = useRef<FullCalendar>(null);
  const [title, setTitle] = useState(calendarRef.current?.getApi().view.title);
  const { md, sm } = Grid.useBreakpoint();
  const [calendarFilter, setCalendarFilter] = useState<EventData[]>([]);
  useEffect(() => {
    calendarRef.current?.getApi().changeView(calendarView);
  }, [calendarView]);

  useEffect(() => {
    if (md) {
      setCalendarView("dayGridMonth");
    } else {
      setCalendarView("listMonth");
    }
  }, [md]);

  


  const { data } = useList<EventData>({
    pagination: {
      mode: "off",
    },
    filters: [
      {
        field: "category.id",
        operator: "in",
        value: categoryId?.length ? categoryId : undefined,
      },
    ],
  });

  const events = useMemo(() => 
    (data?.data ?? []).map(({ id, start, end, title, allDay, color, status, appliance }) => ({
      id,
      start,
      title,
      end,
      color,
      status,
      appliance,
      allDay: dayjs(end).diff(dayjs(start), "hours") >= 23,
    })),
    [data]
  );
useEffect(() => {
  // Check if 'events' is loaded and is not an empty array
  if (events && events.length > 0) {
    let filteredEvents = events;

    // Apply filter if 'categoryId' has length
    if (categoryId?.length) {
      filteredEvents = events.filter(event => categoryId.includes(event.status));
    }

    // Set the filtered or original events to 'calendarFilter'
    setCalendarFilter(filteredEvents);
  }
}, [events, categoryId, onClickEvent]);

  return (
    <Card>
      <div className="calendar_header">
        <div className="actions">
          <Button
            onClick={() => {
              calendarRef.current?.getApi().prev();
            }}
            shape="circle"
            icon={<LeftOutlined />}
          />
          <Button
            onClick={() => {
              calendarRef.current?.getApi().next();
            }}
            shape="circle"
            icon={<RightOutlined />}
          />

          <Text className="title" size="lg">
            {title}
          </Text>
        </div>
        <Radio.Group value={calendarView}>
          {[
            {
              label: "Month",
              desktopView: "dayGridMonth",
              mobileView: "listMonth",
            },
            {
              label: "Week",
              desktopView: "timeGridWeek",
              mobileView: "listWeek",
            },
            {
              label: "Day",
              desktopView: "timeGridDay",
              mobileView: "listDay",
            },
          ].map(({ label, desktopView, mobileView }) => {
            const view = md ? desktopView : mobileView;
            return (
              <Radio.Button
                key={label}
                value={view}
                onClick={() => {
                  setCalendarView(view as View);
                }}
              >
                {label}
              </Radio.Button>
            );
          })}
          {md && (
            <Radio.Button
              value="listMonth"
              onClick={() => {
                setCalendarView("listMonth");
              }}
            >
              List
            </Radio.Button>
          )}
        </Radio.Group>
      </div>
      <Suspense>
        <FullCalendarWrapper
          {...{ calendarRef, calendarFilter, onClickEvent, setTitle }}
        />
      </Suspense>
    </Card>
  )
}


