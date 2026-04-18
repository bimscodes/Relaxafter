'use client';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (d) => startOfWeek(d, { weekStartsOn: 1 }),
  getDay,
  locales
});

export default function CalendarView({ events, onSelectSlot, onSelectEvent, view, onView, date, onNavigate }) {
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      selectable
      views={['month', 'week', 'day']}
      view={view}
      onView={onView}
      date={date}
      onNavigate={onNavigate}
      onSelectSlot={onSelectSlot}
      onSelectEvent={onSelectEvent}
      popup
      style={{ height: '100%' }}
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: event.color || '#2563eb',
          color: 'white'
        }
      })}
    />
  );
}
