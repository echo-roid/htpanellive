import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function AttendanceCalendar({ data }) {
  const events = data.map(record => ({
    title: `${record.employee_name} - ${record.status}`,
    start: new Date(record.date),
    end: new Date(record.date),
    allDay: true,
    status: record.status,
  }));

  const eventStyleGetter = (event) => {
    const backgroundColor = {
      present: '#3F8CFF',
      late: '#F59E0B',
      absent: '#EF4444',
      'on-leave': '#8B5CF6',
      'half-day': '#06B6D4',
    }[event.status] || '#3F8CFF';

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="h-[600px]">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView="month"
        popup
      />
    </div>
  );
}