import React, { useEffect, useState } from 'react'
import "./Styles.css"
import { Card, message } from 'antd';
import { useCreateSchedule } from '../useCreateSchedule';
import { Checkbox, Button, Typography } from 'antd';
const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const times = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

interface Schedule {
  [key: string]: string[];
}

interface SchedulerProps {
  technicianId: any;
}
const Scheduler: React.FC<SchedulerProps> = (technicianId) => {
  const [schedule, setSchedule] = useState<Schedule>({});
  const [fetchedSchedule, setFetchedSchedule] = useState([])
  const { createSchedule, isLoading, error } = useCreateSchedule()

  const { Text } = Typography;

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/jsonapi/user/user/${technicianId.technicianId}`);

      const json = await response.json();

      const fetchedSched = json.data;
      const schedule = JSON.parse(fetchedSched.attributes.field_schedule)

    
      if (schedule === null) {
        return
      } else {
        setSchedule(schedule)
      }

    } catch (error: any) {
      console.log(error, "Failed to fetch ")
    }

  }

  useEffect(() => {
    fetchSchedule()
  }, [])

  const handleDayChange = (day: string, checked: boolean) => {
    setSchedule(prevSchedule => {
      // If the day is checked, select all times, otherwise empty the array
      const updatedDaySchedule = checked ? [...times] : [];
      return { ...prevSchedule, [day]: updatedDaySchedule };
    });
  };

  const convertToRange = (time: string): string => {
    const hour = parseInt(time);
    const period = time.includes('AM') ? 'AM' : 'PM';
    const endHour = hour + 2 > 12 ? hour - 10 : hour + 2; // Adjust for AM/PM switch
    const endPeriod = (hour + 2 >= 12 && period === 'AM') || (hour + 2 >= 12 && hour + 2 < 14 && period === 'PM') ? 'PM' : period;
    return `${time} - ${endHour} ${endPeriod}`;
  };
  const handleTimeChange = (day: string, time: string, checked: boolean) => {
    setSchedule(prevSchedule => {
      const updatedDaySchedule = prevSchedule[day] ? [...prevSchedule[day]] : [];
      
      if (checked) {
        // Add the time if it's not already in the array
        const timeRange = convertToRange(time);

        if (!updatedDaySchedule.includes(timeRange)) {
          updatedDaySchedule.push(timeRange);

        }
      } else {
        // Remove the time if it's in the array
        const rangeToRemove = convertToRange(time);
        const index = updatedDaySchedule.indexOf(rangeToRemove);
        if (index !== -1) {
          updatedDaySchedule.splice(index, 1);
        }
      }

      return { ...prevSchedule, [day]: updatedDaySchedule };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let data = {
      "data": {
        "type": "user--technicians",
        "id": technicianId.technicianId,
        "attributes": {
          "field_schedule": JSON.stringify(schedule)
        }
      }
    }
    createSchedule(data)
  };
 
  return (
    <div style={{overflow: "auto hidden"}}>
      <form onSubmit={handleSubmit}>
        <Card style={{ padding: "0" }}>
          <div className="scheduler-container">
            <div className="day-column">
              <div className="day-empty"></div>
              {days.map(day => (
                <div className="day" key={day}>
                  {/* <Checkbox
                    onChange={(e) => handleDayChange(day, e.target.checked)}
                    checked={schedule[day]?.length === times.length}
                    style={{ marginRight: "10px" }}
                  /> */}
                  <Text>{day}</Text></div>
              ))}
            </div>
            {times.map(time => (
              <div key={time} className="hours-columns">
                <div className="hour-container">
                  <div className="hour-head">{time}</div>
                </div>
                {days.map(day => (
                  <div key={day} className="hours-container">
                    <Checkbox
                      // type="checkbox"
                      onChange={(e) => 
                        {handleTimeChange(day, time, e.target.checked)}}
                        checked={schedule[day]?.some(range => range.startsWith(time))}

                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          
        </Card>
        <Button 
          style={{margin: "15px 0", float: "right"}}
          type="primary" htmlType="submit">
            Submit
          </Button>
      </form>
    </div>

  )
}

export default Scheduler