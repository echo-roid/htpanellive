    import { useEffect, useState } from "react";
    import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
    import { useSelector } from "react-redux";
import Workinghours from "./modals/Workinghours";

    const AttendanceSummary = () => {
    const [isStarted, setIsStarted] = useState(false);
    // const [currentStartTime, setCurrentStartTime] = useState(null);
    // const [currentEndTime, setCurrentEndTime] = useState(null);
    const [todayWorkedHours, setTodayWorkedHours] = useState(0);
    const [yesterdayHours,setYesterdayHours] =useState(0)
    const [weekHours,setWeekHours] =useState(0)
    const [overTimeHours,setOvertimeHours] =useState(0)

    const REQUIRED_DAILY = 9;
    const REQUIRED_WEEKLY = 45;

    const user = useSelector((state) => state.auth.user);
    const organizerId = user?.employee?.id;



    // const [hoursWorked, setHoursWorked] = useState(null);
    const [error, setError] = useState(null);

   
    const getAttendanceReport = async (employeeId, startDate, endDate) => {
        try {
          const response = await fetch(
            `http://localhost:5000/api/attendance/report?employee_id=${employeeId}&start_date=${startDate}&end_date=${endDate}`
          );
      
          const data = await response.json();
      
          if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch attendance report');
          }
      
        
          setWeekHours(data?.weekly_summaries[0]?.total_hours ?data?.weekly_summaries[0]?.total_hours :0);
          setYesterdayHours(data?.yesterdayAtta[0]?.total_hours ?data?.yesterdayAtta[0]?.total_hours :0)
         
      
          // You can set this to state
          // setDailyData(data.daily_attendance);
          // setWeeklyData(data.weekly_summaries);
      
          return data;
        } catch (error) {
          console.error('Error fetching attendance report:', error.message);
        }
      };
   
   
    useEffect(() => {
        if (user?.employee?.id) {
          checkWorkStatus();
          getAttendanceReport(organizerId,"2025-05-01","2025-05-13")
        }
      }, [user]);
  
      const checkWorkStatus = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/attendance/hours-worked?employee_id=${user?.employee?.id}`);
          const data = await response.json();
      
          if (response.ok) {
            // If ended is false => employee is working
            // console.log(data?.error,"pop")
            setIsStarted(data?.error ? false :!data?.ended);
            setTodayWorkedHours(data?.rounded_hours ? data?.rounded_hours :0)
            setOvertimeHours(data?.overtime_hours ? data?.overtime_hours :0)
          } else {
            // If API errors (e.g. no start time), treat as not working
            setIsStarted(false);
          }
        } catch (error) {
          console.error("Error checking work status:", error);
          setIsStarted(false);
        }
      };


    // console.log(hoursWorked,';lllll')

    // Function to record the start time
    const handleToggle = () => {
        setIsStarted((prev) => !prev);
    
        if (!isStarted) {
        // Start work: Record start time
        recordStartTime();
        } else {
        // End work: Record end time
        recordEndTime();
        }
    };
    
    const recordStartTime = async () => {
        try {
        const response = await fetch('http://localhost:5000/api/attendance/start', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ employee_id: organizerId }),
        });
    
        const data = await response.json();
        console.log('Start time recorded:', data.start_time);
        } catch (error) {
        console.error('Error recording start time:', error);
        }
    };
    
    const recordEndTime = async () => {
        try {
        const response = await fetch('http://localhost:5000/api/attendance/end', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ employee_id: organizerId}),
        });
    
        const data = await response.json();
        console.log('End time recorded:', data.end_time);
        } catch (error) {
        console.error('Error recording end time:', error);
        }
    };

    // Render the progress bar
    const renderProgress = (label, hours, total, color) => (
        <div className="flex flex-col items-center">
        <div className="w-[50%] h-[50%]">
            <CircularProgressbar
            value={(hours / total) * 100}
            text={`${hours}h`}
            styles={buildStyles({
                pathColor: color,
                textColor: '#333',
                trailColor: '#eee',
                textSize: '14px',
            })}
            />
        </div>
        <span className="mt-2 text-sm text-gray-600">{label}</span>
        </div>
    );

    return (
        <div className="p-6 w-full bg-white rounded-xl shadow-md space-y-6">
        <div className="flex justify-between w-full">
            {renderProgress('Today', todayWorkedHours, REQUIRED_DAILY, '#4ade80')}
            {renderProgress('Yesterday', yesterdayHours, REQUIRED_DAILY, '#60a5fa')}
            {renderProgress('This Week', weekHours, REQUIRED_WEEKLY, '#facc15')} 
            {renderProgress('Overtime', overTimeHours, 9, '#affc1r5')}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-sm text-gray-600">{isStarted ? 'Working' : 'Not Started'}</span>
            <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" onChange={handleToggle} checked={isStarted} />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
        </div>

            {
                todayWorkedHours > 9 &&  <Workinghours/>
            }
       
        </div>
    );
    };

    export default AttendanceSummary;
