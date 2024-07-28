import React, { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useList } from "@refinedev/core";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import FullCalendar from "@fullcalendar/react";
import { Button, Card, Grid, message, Radio, Spin } from "antd";
import dayjs from "dayjs";
import { Text } from "./text";
import "./index.css";

const FullCalendarWrapper = lazy(() => import("./full-calendar"));

type View = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listMonth" | "listDay" | "listWeek";

type EventData = {
  id: string;
  start: string;
  appliance?: string;
  end: string;
  title: string;
  allDay: boolean;
  color: string;
  status: string;
  techId: string;
};

interface CurrentRole {
  role: string;
  uuid: string;
}

type CalendarProps = {
  categoryId?: string[];
  onClickEvent?: (event: EventData) => void;
};

export const Calendar: React.FC<CalendarProps> = ({ categoryId, onClickEvent }) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [appointments, setAppointments] = useState<EventData[]>([]);
  const [title, setTitle] = useState<string | undefined>(calendarRef.current?.getApi().view.title);
  const { md } = Grid.useBreakpoint();
  const initialView = md ? "dayGridMonth" : "listMonth";
  const [calendarView, setCalendarView] = useState<View>(initialView);
  const [currentRole, setCurrentRole] = useState<CurrentRole | undefined>(undefined);
  const [calendarFilter, setCalendarFilter] = useState<EventData[]>([]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

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

  useEffect(() => {
    filterAppointments();
  }, [appointments, categoryId, currentRole]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/current-user');
      if (response.ok) {
        const json = await response.json();
        const user = json.map((user: any) => ({
          name: `${user.field_first_name[0].value} ${user.field_last_name[0].value}`,
          image: user.user_picture[0]?.url,
          uuid: user.uuid[0].value,
          role: user.roles[0].target_id
        }));
        setCurrentRole(user[0]);
        fetchAppointments();
      } else {
        console.error('HTTP error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/jsonapi/node/appointment1');
      const json = await response.json();

      const appointmentObj = json.data.map((item: any) => ({
        id: item.id,
        start: item.attributes.field_appointment_start,
        title: item.attributes.title,
        end: item.attributes.field_appointment_end,
        status: item.attributes.field_status,
        appliance: item.attributes.field_appliances,
        color: item.attributes.field_color,
        techId: item.relationships.field_technician.data.id
      }));

      setAppointments(appointmentObj);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const filterAppointments = () => {
    if (appointments.length > 0) {
      let filteredEvents = appointments;
      if (categoryId?.length) {
        filteredEvents = appointments.filter(event => categoryId.includes(event.status));
      }
      if (currentRole?.role === "technician") {
        filteredEvents = filteredEvents.filter(event => event.techId === currentRole.uuid);
      }
      setCalendarFilter(filteredEvents);
    }
  };

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
    (data?.data ?? []).map(({ id, start, end, title, allDay, color, status, appliance, techId }) => ({
      id,
      start,
      title,
      end,
      color,
      status,
      appliance,
      techId: techId || '',  // ensure techId is always defined
      allDay: dayjs(end).diff(dayjs(start), "hours") >= 23,
    })),
    [data]
  );

  useEffect(() => {
    if (events && events.length > 0) {
      let filteredEvents = events;
      if (categoryId?.length) {
        filteredEvents = events.filter(event => categoryId.includes(event.status));
      }
      setCalendarFilter(filteredEvents);
    }
  }, [events, categoryId]);

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
      <Suspense fallback={<Spin size="large" />}>
        <FullCalendarWrapper
          {...{ calendarRef, calendarFilter, onClickEvent, setTitle, initialView }}
        />
      </Suspense>
    </Card>
  );
};
