import { Dispatch, FC, RefObject, SetStateAction, useEffect, useState } from "react";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from "react-router-dom";

type FullCalendarWrapperProps = {
  calendarRef: RefObject<FullCalendar>;
  calendarFilter: (Partial<Event> & { allDay: boolean } & { id: string })[];
  onClickEvent?: (event: Event) => void;
  setTitle: Dispatch<SetStateAction<string | undefined>>;
};


const FullCalendarWrapper: FC<FullCalendarWrapperProps> = ({
  calendarRef,
  calendarFilter,
  onClickEvent,
  setTitle,
}) => {
  const navigate = useNavigate();
  return <div style={{ width: '100%' }}>
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
      initialView={"dayGridMonth"}
      events={calendarFilter}
      eventTimeFormat={{
        hour: "2-digit",
        minute: "2-digit",
        meridiem: false,
      }}
      eventClick={({ event }) => {
        onClickEvent?.(calendarFilter.find(({ id }) => id === event.id) as Event);
        navigate(`/appointments/show/${event.id}`);

      }}
      datesSet={({ view }) => {
        setTitle(view.title);
      }}
      headerToolbar={false}
      timeZone="UTC"
      height={600}
    />
  </div>
}

export default FullCalendarWrapper;