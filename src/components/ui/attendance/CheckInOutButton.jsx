import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaCamera, FaSpinner, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';

export default function CheckInOutButton({ onUpdate }) {
  const [isChecking, setIsChecking] = useState(false);
  const [action, setAction] = useState(null);
  const [error, setError] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [leaveSettings, setLeaveSettings] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [calculatedMetrics, setCalculatedMetrics] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const user = useSelector((state) => state.auth.user);
  const employeeId = user?.employee?.id;

  // Fetch leave settings
  useEffect(() => {
    async function fetchLeaveSettings() {
      try {
        const res = await axios.get('https://tableware-dweeb-estate.ngrok-free.dev/api/leave-settings/leave-settings');
        setLeaveSettings(res.data);
        console.log("✅ Leave settings loaded:", res.data);
      } catch (err) {
        console.error("❌ Error fetching leave settings:", err);
      }
    }
    fetchLeaveSettings();
  }, []);

  // Get today's date in local timezone
  const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // Fetch today's record
  const fetchTodayRecord = useCallback(async () => {
    try {
      const today = getTodayDate();
      const response = await axios.get(`https://tableware-dweeb-estate.ngrok-free.dev/api/attendance?date=${today}`);
      const record = response.data.find(r => r.employee_id === employeeId);
      setTodayRecord(record || null);
      
      // Update attendance status
      if (record) {
        if (record.check_in && !record.check_out) {
          setAttendanceStatus('checked_in');
        } else if (record.check_in && record.check_out) {
          setAttendanceStatus('completed');
        } else {
          setAttendanceStatus('not_started');
        }
      } else {
        setAttendanceStatus('not_started');
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
      setError('Failed to load attendance data');
    }
  }, [employeeId]);

  // Initial fetch of today's record
  useEffect(() => {
    if (employeeId) {
      fetchTodayRecord();
    }
  }, [fetchTodayRecord, employeeId]);

  // Start webcam only when showWebcam is true
  useEffect(() => {
    let stream = null;
    
    if (showWebcam) {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: 640,
              height: 480,
              facingMode: 'user'
            } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
        } catch (err) {
          console.error('Camera error:', err);
          setError('Camera access denied. Please allow camera permissions.');
          setShowWebcam(false);
        }
      };
      
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showWebcam]);

  const captureImage = () => {
    return new Promise((resolve, reject) => {
      try {
        const video = videoRef.current;
        if (!video) {
          reject(new Error('Video element not found'));
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to capture image'));
            return;
          }
          const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg', 0.9);
      } catch (err) {
        reject(err);
      }
    });
  };

  // Calculate working hours with all rules applied
  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(`1970-01-01T${checkIn}`);
    const end = new Date(`1970-01-01T${checkOut}`);
    const diffHours = (end - start) / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100;
  };

  // Calculate overtime with all rules applied
  const calculateOvertime = (totalHours, workingHours, isLate = false, lateMinutes = 0) => {
    if (!workingHours) return 0;
    
    const overtimeRules = leaveSettings?.overtimeRules || {};
    const lateThresholdRules = leaveSettings?.lateThresholdRules || {};
    
    let regularHours = workingHours;
    
    // Apply late arrival adjustment rule
    if (isLate && !lateThresholdRules.allowOvertimeAdjustmentForLateArrival) {
      regularHours = workingHours - (lateMinutes / 60);
      regularHours = Math.max(0, regularHours);
    }
    
    // Calculate overtime
    let overtime = totalHours - regularHours;
    overtime = overtime > 0 ? Math.round(overtime * 100) / 100 : 0;
    
    // Apply minimum overtime hours rule
    const minimumOvertimeHours = overtimeRules.minimumOvertimeHours || 1;
    if (overtime > 0 && overtime < minimumOvertimeHours) {
      overtime = 0; // Don't count overtime if less than minimum
    }
    
    // Apply compensatory leave rules
    if (overtimeRules.allowCompensatoryLeave && overtime > 0) {
      console.log(`✅ Overtime ${overtime}hrs will be added to compensatory leave balance`);
    }
    
    // Apply time off adjustment
    if (overtimeRules.allowTimeOffAdjustment && overtime > 0) {
      console.log(`✅ Overtime ${overtime}hrs can be used for time off adjustment`);
    }
    
    return overtime;
  };

  // Check late arrival status with threshold rules
  const getLateArrivalStatus = (checkInTime) => {
    if (!leaveSettings?.lateThresholdRules?.officeStartTime) return null;
    
    const lateThresholdRules = leaveSettings.lateThresholdRules;
    const officeStart = new Date(`1970-01-01T${lateThresholdRules.officeStartTime}`);
    const checkIn = new Date(`1970-01-01T${checkInTime}`);
    const diffMinutes = (checkIn - officeStart) / (1000 * 60);
    
    const threshold = lateThresholdRules.halfDayLateThresholdMinutes || 15;
    
    if (diffMinutes > 0) {
      return {
        isLate: true,
        minutesLate: Math.round(diffMinutes),
        isHalfDay: diffMinutes >= threshold,
        threshold: threshold,
        halfSalaryDeductionEnabled: lateThresholdRules.halfSalaryDeductionEnabled || false,
        allowOvertimeAdjustment: lateThresholdRules.allowOvertimeAdjustmentForLateArrival || false
      };
    }
    return {
      isLate: false,
      minutesLate: 0,
      isHalfDay: false,
      threshold: threshold,
      halfSalaryDeductionEnabled: lateThresholdRules.halfSalaryDeductionEnabled || false,
      allowOvertimeAdjustment: lateThresholdRules.allowOvertimeAdjustmentForLateArrival || false
    };
  };

  // Check if overtime payment is allowed
  const isOvertimePaymentAllowed = () => {
    return leaveSettings?.overtimeRules?.allowOvertimePayment || false;
  };

  // Check if compensatory leave is allowed
  const isCompensatoryLeaveAllowed = () => {
    return leaveSettings?.overtimeRules?.allowCompensatoryLeave || false;
  };

  const handleAction = async (type) => {
    if (!employeeId) {
      setError('Employee ID not found');
      return;
    }

    try {
      setIsChecking(true);
      setAction(type);
      setError(null);
      
      // Show webcam before capturing
      setShowWebcam(true);
      
      // Wait for webcam to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture photo
      const photoFile = await captureImage();

      // Get location
      let position = null;
      try {
        position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        });
      } catch (geoError) {
        console.warn('Location access denied:', geoError);
        // Continue without location
      }

      // Prepare form data
      const formData = new FormData();
      formData.append('employeeId', employeeId);
      if (position) {
        formData.append('latitude', position.coords.latitude);
        formData.append('longitude', position.coords.longitude);
      }
      formData.append('photo', photoFile);

      // Determine endpoint
      const endpoint = type === 'checkin'
        ? 'https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/check-in'
        : 'https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/check-out';

      // Make API call
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Process check-in
      if (type === 'checkin') {
        const checkInTime = response.data.check_in;
        const lateStatus = getLateArrivalStatus(checkInTime);
        
        // Determine status based on late arrival and half day rules
        let status = 'present';
        let isHalfDay = false;
        let halfSalaryDeduction = false;
        
        if (lateStatus && lateStatus.isLate) {
          if (lateStatus.isHalfDay && lateStatus.halfSalaryDeductionEnabled) {
            status = 'half_day';
            isHalfDay = true;
            halfSalaryDeduction = true;
          } else {
            status = 'late';
          }
        }

        // Update attendance with status
        if (response.data.id) {
          await axios.patch(`https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/${response.data.id}`, {
            status: status,
            is_half_day: isHalfDay ? 1 : 0,
            half_salary_deduction: halfSalaryDeduction ? 1 : 0,
            late_minutes: lateStatus?.minutesLate || 0
          });
        }

        setTodayRecord({
          ...todayRecord,
          check_in: checkInTime,
          photo_in: response.data.photo_in,
          status: status,
          is_half_day: isHalfDay,
          half_salary_deduction: halfSalaryDeduction,
          late_minutes: lateStatus?.minutesLate || 0
        });
        setAttendanceStatus('checked_in');

        let successMessage = `✅ Successfully checked in at ${checkInTime}`;
        if (lateStatus?.isLate) {
          successMessage += ` (⚠️ ${lateStatus.minutesLate} mins late`;
          if (isHalfDay && halfSalaryDeduction) {
            successMessage += ' - Half Day applied with salary deduction';
          }
          successMessage += ')';
        }
        alert(successMessage);

      } else {
        // Process check-out
        const checkOutTime = response.data.check_out;
        const checkInTime = todayRecord?.check_in;
        
        if (checkInTime) {
          // Calculate total hours
          const totalHours = calculateWorkingHours(checkInTime, checkOutTime);
          
          // Get late status
          const lateStatus = getLateArrivalStatus(checkInTime);
          const isLate = lateStatus?.isLate || false;
          const lateMinutes = lateStatus?.minutesLate || 0;
          
          // Calculate overtime with all rules applied
          const overtime = calculateOvertime(
            totalHours, 
            leaveSettings?.workingHours || 8,
            isLate,
            lateMinutes
          );

          // Check if overtime payment is allowed
          const allowPayment = isOvertimePaymentAllowed();
          const allowCompensatory = isCompensatoryLeaveAllowed();

          // Update attendance with calculated values
          if (response.data.id) {
            await axios.patch(`https://tableware-dweeb-estate.ngrok-free.dev/api/attendance/${response.data.id}`, {
              check_out: checkOutTime,
              total_hours: totalHours,
              overtime_hours: overtime,
              overtime_payment_allowed: allowPayment ? 1 : 0,
              compensatory_leave_allowed: allowCompensatory ? 1 : 0,
              overtime_status: overtime > 0 ? 'earned' : 'none'
            });
          }

          setTodayRecord({
            ...todayRecord,
            check_out: checkOutTime,
            photo_out: response.data.photo_out,
            total_hours: totalHours,
            overtime_hours: overtime,
            overtime_payment_allowed: allowPayment,
            compensatory_leave_allowed: allowCompensatory
          });
          setAttendanceStatus('completed');

          // Build success message with all details
          let successMessage = `✅ Successfully checked out at ${checkOutTime}\n`;
          successMessage += `📊 Total Hours: ${totalHours.toFixed(2)} hrs\n`;
          
          if (overtime > 0) {
            successMessage += `⏰ Overtime: ${overtime.toFixed(2)} hrs\n`;
            if (allowPayment) {
              successMessage += `💰 Overtime payment allowed\n`;
            }
            if (allowCompensatory) {
              successMessage += `📅 Compensatory leave earned\n`;
            }
          } else {
            successMessage += `⏰ No overtime earned\n`;
          }

          // Check if half day deduction applied
          if (todayRecord?.is_half_day && todayRecord?.half_salary_deduction) {
            successMessage += `⚠️ Half day salary deduction applied\n`;
          }

          setCalculatedMetrics({
            totalHours,
            overtime,
            allowPayment,
            allowCompensatory,
            isHalfDay: todayRecord?.is_half_day || false,
            halfSalaryDeduction: todayRecord?.half_salary_deduction || false
          });

          alert(successMessage);
        } else {
          alert('✅ Successfully checked out');
        }
      }

      // Close webcam
      setShowWebcam(false);
      
      // Refresh data
      await fetchTodayRecord();
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        onUpdate();
      }

    } catch (err) {
      console.error(`${type} error:`, err);
      const apiError = err.response?.data?.error || err.message;
      setError(
        typeof apiError === 'object'
          ? apiError.message || JSON.stringify(apiError)
          : apiError || `Failed to ${type}`
      );
      setShowWebcam(false);
    } finally {
      setIsChecking(false);
      setAction(null);
    }
  };

  const getStatusDisplay = () => {
    if (!todayRecord) return { text: 'Not Started', color: 'text-gray-500', icon: null };
    
    if (todayRecord.check_in && todayRecord.check_out) {
      return { 
        text: 'Completed ✅', 
        color: 'text-green-600', 
        icon: <FaCheckCircle className="text-green-500" />
      };
    }
    
    if (todayRecord.check_in) {
      const status = todayRecord.status || 'present';
      const statusMap = {
        'present': { text: 'Checked In', color: 'text-green-600' },
        'late': { text: 'Checked In (Late)', color: 'text-yellow-600' },
        'half_day': { text: 'Checked In (Half Day)', color: 'text-orange-600' }
      };
      const statusInfo = statusMap[status] || statusMap.present;
      
      let extraInfo = '';
      if (todayRecord.late_minutes > 0) {
        extraInfo = ` (${todayRecord.late_minutes} mins late)`;
        if (todayRecord.is_half_day) {
          extraInfo += ' - Half Day';
        }
      }
      
      return { 
        text: `${statusInfo.text}${extraInfo}`, 
        color: statusInfo.color, 
        icon: <FaClock className="text-blue-500" />
      };
    }
    
    return { text: 'Not Started', color: 'text-gray-500', icon: null };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="relative">
      {/* Webcam Modal */}
      {showWebcam && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">
              {action === 'checkin' ? 'Check In Photo' : 'Check Out Photo'}
            </h3>
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full rounded-lg border-2 border-gray-200"
              />
              <canvas 
                ref={canvasRef} 
                style={{ display: 'none' }} 
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="animate-pulse bg-red-500 w-3 h-3 rounded-full inline-block mr-2"></div>
                <span className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
                  Capturing...
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowWebcam(false);
                  setIsChecking(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={isChecking}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isChecking ? <FaSpinner className="animate-spin" /> : 'Processing...'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${statusDisplay.color}`}>
            {statusDisplay.icon && <span className="mr-1">{statusDisplay.icon}</span>}
            {statusDisplay.text}
          </span>
          {todayRecord?.check_in && (
            <span className="text-xs text-gray-500">
              at {todayRecord.check_in}
            </span>
          )}
          {todayRecord?.total_hours && todayRecord?.check_out && (
            <span className="text-xs text-blue-600">
              ({todayRecord.total_hours} hrs)
            </span>
          )}
          {todayRecord?.overtime_hours > 0 && (
            <span className="text-xs text-orange-600 font-medium">
              +{todayRecord.overtime_hours} hrs OT
            </span>
          )}
        </div>

        {/* Check-In Button */}
        {!todayRecord?.check_in && (
          <button
            onClick={() => handleAction('checkin')}
            disabled={isChecking}
            className="px-6 py-2 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaCamera className="text-sm" />
            {isChecking && action === 'checkin' ? (
              <>
                <FaSpinner className="animate-spin" />
                Checking In...
              </>
            ) : (
              'Check In'
            )}
          </button>
        )}

        {/* Check-Out Button */}
        {todayRecord?.check_in && !todayRecord?.check_out && (
          <button
            onClick={() => handleAction('checkout')}
            disabled={isChecking}
            className="px-6 py-2 rounded-lg font-medium border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaCamera className="text-sm" />
            {isChecking && action === 'checkout' ? (
              <>
                <FaSpinner className="animate-spin" />
                Checking Out...
              </>
            ) : (
              'Check Out'
            )}
          </button>
        )}

        {/* Completed Status */}
        {todayRecord?.check_in && todayRecord?.check_out && (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <FaCheckCircle />
            Done for today
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-semibold">Error: </span>
            {typeof error === 'object' ? JSON.stringify(error) : error}
          </div>
        </div>
      )}

      {/* Metrics Display */}
      {calculatedMetrics && todayRecord?.check_out && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-gray-600">Total Hours:</span>
              <span className="ml-2 font-semibold">{calculatedMetrics.totalHours} hrs</span>
            </div>
            <div>
              <span className="text-gray-600">Overtime:</span>
              <span className={`ml-2 font-semibold ${calculatedMetrics.overtime > 0 ? 'text-orange-600' : 'text-gray-500'}`}>
                {calculatedMetrics.overtime > 0 ? `${calculatedMetrics.overtime} hrs` : 'None'}
              </span>
            </div>
            {calculatedMetrics.allowPayment && calculatedMetrics.overtime > 0 && (
              <div className="col-span-2 text-green-600">
                ✅ Overtime payment eligible
              </div>
            )}
            {calculatedMetrics.allowCompensatory && calculatedMetrics.overtime > 0 && (
              <div className="col-span-2 text-blue-600">
                ✅ Compensatory leave earned
              </div>
            )}
            {calculatedMetrics.isHalfDay && calculatedMetrics.halfSalaryDeduction && (
              <div className="col-span-2 text-orange-600">
                ⚠️ Half day salary deduction applied
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}