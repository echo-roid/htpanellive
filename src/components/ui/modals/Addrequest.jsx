import React, { useEffect, useState } from 'react';
import addimg from "../../../assets/addimg.png";
import { useSelector } from 'react-redux';
import Select from 'react-select';

const CustomOption = (props) => {
  const { data, innerRef, innerProps } = props;
  return (
    <div ref={innerRef} {...innerProps} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
      <img src={data.photo} alt={data.label} className="w-8 h-8 rounded-full mr-2" />
      <span>{data.label}</span>
    </div>
  );
};

const CustomSingleValue = ({ data }) => (
  <div className="flex items-center">
    <img src={data.photo} alt={data.label} className="w-6 h-6 rounded-full mr-2" />
    <span>{data.label}</span>
  </div>
);

const Addrequest = ({ onClose, employeeId }) => {
  const [formData, setFormData] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    medical_certificate: '',
    contact: '',
    managerId: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [managers, setManagers] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [activeLeaves, setActiveLeaves] = useState([]);

  const user = useSelector(state => state.auth.user);

  const userReportingManager = managers.find(
    manager => manager.id === user?.employee?.reporting_manager_id
  );

  const managerOptions = userReportingManager
    ? [{
      value: userReportingManager.id,
      label: userReportingManager.name,
      photo: userReportingManager.photo || addimg
    }]
    : [];

  useEffect(() => {
    if (userReportingManager) {
      setFormData(prev => ({
        ...prev,
        managerId: userReportingManager.id
      }));
    }
  }, [userReportingManager]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch leave settings
        const settingsResponse = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/leave-settings/leave-settings');
        if (!settingsResponse.ok) throw new Error('Failed to fetch leave settings');
        const settingsData = await settingsResponse.json();

        // Safely parse or use object
        const leaveStatusObj = typeof settingsData.leaveStatus === 'string'
          ? JSON.parse(settingsData.leaveStatus || '{}')
          : settingsData.leaveStatus || {};

        const activeLeavesArray = Object.entries(leaveStatusObj)
          .filter(([_, status]) => status === true)
          .map(([type]) => type);

        setActiveLeaves(activeLeavesArray);

        // Fetch managers
        const managersResponse = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/employees/allmanagers');
        if (!managersResponse.ok) throw new Error('Failed to fetch managers');
        const managersData = await managersResponse.json();
        setManagers(managersData);

      } catch (error) {
        console.error('Error fetching data:', error);
        setErrorMessage('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      let updatedForm = { ...prev, [name]: value };

      if (name === 'leave_type' && value !== 'Sick Leave') {
        updatedForm.medical_certificate = '';
      }

      return updatedForm;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setLoading(true);

    try {
      const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/leave/request/${user?.employee.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to submit request');

      const result = await response.json();
      setSuccessMessage('Request submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Failed to submit request.');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl relative max-h-[90vh] overflow-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
        >
          &times;
        </button>

        <div className="w-full flex justify-center mb-4">
          <img src={addimg} alt="Add Event" className="rounded-xl w-full" />
        </div>

        <h2 className="text-lg font-semibold mb-4">Add Leave Request</h2>

        {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}
        {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

        {loading && !activeLeaves.length && (
          <div className="text-center py-4">Loading leave information...</div>
        )}

        {true  && (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-medium">Leave Type</label>
              <select
                name="leave_type"
                value={formData.leave_type}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Leave Type</option>
                {activeLeaves.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-2">
              <div className="flex-1">
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Reporting Manager</label>
              {userReportingManager ? (
                <Select
                  options={managerOptions}
                  value={managerOptions.find(opt => opt.value === formData.managerId)}
                  placeholder="Select a Manager"
                  components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                  onChange={selectedOption => {
                    setFormData(prev => ({
                      ...prev,
                      managerId: selectedOption.value
                    }));
                  }}
                  className="mt-1"
                  isDisabled={true}
                />
              ) : (
                <div className="mt-1 p-2 bg-gray-100 rounded-md text-sm">
                  No reporting manager assigned. Please contact HR.
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Reason</label>
              <textarea
                name="reason"
                rows="3"
                placeholder="Enter reason for leave"
                value={formData.reason}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md resize-none"
                required
              ></textarea>
            </div>

            {formData.leave_type === 'Sick Leave' && (
              <div>
                <label className="text-sm font-medium">Medical Certificate (optional)</label>
                <input
                  type="text"
                  name="medical_certificate"
                  placeholder="Certificate URL or ID"
                  value={formData.medical_certificate}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Contact During Leave</label>
              <input
                type="text"
                name="contact"
                placeholder="Your contact number"
                value={formData.contact}
                onChange={handleChange}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow disabled:bg-blue-300"
              >
                {loading ? 'Saving...' : 'Save Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Addrequest;
