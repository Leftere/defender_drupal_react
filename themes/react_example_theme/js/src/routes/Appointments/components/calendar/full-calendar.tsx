import { Dispatch, FC, RefObject, SetStateAction, useEffect, useState } from "react";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from "react-router-dom";
import './calendar.css';

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

type FullCalendarWrapperProps = {
  calendarRef: RefObject<FullCalendar>;
  calendarFilter: EventData[];
  onClickEvent?: (event: EventData) => void;
  setTitle: Dispatch<SetStateAction<string | undefined>>;
  initialView: string;
};

const FullCalendarWrapper: FC<FullCalendarWrapperProps> = ({
  calendarRef,
  calendarFilter,
  onClickEvent,
  setTitle,
  initialView
}) => {
  const navigate = useNavigate();

  return (
    <div style={{ width: '100%' }}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView={initialView}
        events={calendarFilter}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: false,
        }}
        eventClick={({ event }) => {
          const clickedEvent = calendarFilter.find(({ id }) => id === event.id);
          if (clickedEvent) {
            onClickEvent?.(clickedEvent);
            navigate(`/appointments/show/${event.id}`);
          }
        }}
        datesSet={({ view }) => {
          setTitle(view.title);
        }}
        headerToolbar={false}
        timeZone="UTC"
        height={600}
      />
    </div>
  );
};

export default FullCalendarWrapper;