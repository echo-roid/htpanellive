import React, { useState, useEffect } from 'react';
import { Video, X } from 'lucide-react';
import addimg from "../../../assets/addimg.png";
import { useSelector } from 'react-redux';

const AddEventModal = ({ onClose, onEventAdded, currentDate }) => {
    const user = useSelector(state => state.auth.user);
    console.log(user?.employee?.id, "k");

    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        start_date: currentDate ? formatDate(currentDate) : '',
        start_time: '00:00',
        end_date: currentDate ? formatDate(currentDate) : '',
        end_time: '00:00',
        event_type: "meeting",
        is_recurring: false,
        recurrence_pattern: '',
        attendees: [],
        new_attendee: '',
        organizer_id: user?.employee?.id,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isMeeting, setIsMeeting] = useState(() => eventData.event_type === "meeting");
    
    // State for leads
    const [leads, setLeads] = useState([]);
    const [selectedLeadId, setSelectedLeadId] = useState('');

    // Fetch won leads on component mount
    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const response = await fetch('https://tableware-dweeb-estate.ngrok-free.dev/api/leads/won');
                if (!response.ok) throw new Error('Failed to fetch leads');
                const data = await response.json();
                setLeads(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching leads:', err);
                setLeads([]);
            }
        };
        fetchLeads();
    }, []);

    useEffect(() => {
        setIsMeeting(eventData.event_type === "meeting");
        // If event type changes away from corporate, clear the lead selection
        if (eventData.event_type !== 'corporate_event') {
            setSelectedLeadId('');
        }
    }, [eventData.event_type]);

    const getCurrentTime = () => {
        const now = new Date();
        return now.toTimeString().slice(0, 5);
    };

    const isTodaySelected = () => {
        const today = formatDate(new Date());
        return eventData.start_date === today;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEventData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleLeadSelect = (e) => {
        const leadId = e.target.value;
        setSelectedLeadId(leadId);
        if (leadId) {
            const selectedLead = leads.find(lead => lead.id === parseInt(leadId));
            if (selectedLead) {
                setEventData(prev => ({
                    ...prev,
                    title: selectedLead.clientName || '',
                    description: `Lead: ${selectedLead.clientName} | Destination: ${selectedLead.destination || ''} | Travel: ${selectedLead.travelingDate || ''}`
                }));
            }
        } else {
            // Optionally clear title/description if needed
        }
    };

    const handleAddAttendee = () => {
        if (eventData.new_attendee && !eventData.attendees.includes(eventData.new_attendee)) {
            setEventData(prev => ({
                ...prev,
                attendees: [...prev.attendees, prev.new_attendee],
                new_attendee: ''
            }));
        }
    };

    const handleRemoveAttendee = (email) => {
        setEventData(prev => ({
            ...prev,
            attendees: prev.attendees.filter(e => e !== email)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        // Determine if this is a corporate event
        const isCorporate = eventData.event_type === 'corporate_event';

        // Base payload (common fields)
        const payload = {
            title: eventData.title,
            description: eventData.description,
            event_type: eventData.event_type,
            is_recurring: eventData.is_recurring,
            recurrence_pattern: eventData.recurrence_pattern,
            organizer_id: user?.employee?.id,
        };

        let url = "https://tableware-dweeb-estate.ngrok-free.dev/api/calendar"; // default for meetings

        if (isCorporate) {
            // --- Corporate event payload ---
            url = `https://tableware-dweeb-estate.ngrok-free.dev/api/leave/request/corporate-events/${user?.employee?.id}`;
            payload.start_date = eventData.start_date;          // YYYY-MM-DD
            payload.end_date = eventData.end_date;              // YYYY-MM-DD
            payload.lead_id = selectedLeadId || null;
            payload.managerId = user?.employee?.reporting_manager_id || null;

            // Do NOT include time fields, attendees, or is_meeting
            // (they are not in the payload)
        } else {
            // --- Meeting / other events payload ---
            payload.start_date = eventData.start_date ? `${eventData.start_date}T${eventData.start_time}:00` : null;
            payload.end_date = eventData.end_date ? `${eventData.end_date}T${eventData.end_time}:00` : null;
            payload.start_time = eventData.start_time;
            payload.end_time = eventData.end_time;
            payload.is_meeting = eventData.event_type === "meeting" ? 1 : 0;
            payload.attendees = isMeeting ? eventData.attendees : undefined;
        }

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || response.statusText || 'Failed to create event');
            }

            const data = await response.json();
            onEventAdded(data.data || data);
            onClose();
        } catch (err) {
            console.error("Event creation error:", err);
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const allEventTypes = [
        { value: 'corporate_event', label: 'Corporate Event' },
        { value: 'holiday', label: 'Holiday' },
        { value: 'birthday', label: 'Birthday' },
        { value: 'meeting', label: 'Meeting' },
    ];

    const recurrenceOptions = [
        { value: '', label: 'None' },
        { value: 'daily', label: 'Daily' },
        { value: 'weekly', label: 'Weekly' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' }
    ];

    const designation = user?.employee?.designation;
    const defaultEventType = [
        { value: 'meeting', label: 'Meeting' },
        { value: 'corporate_event', label: 'Corporate Event' }
    ];
    const eventTypes = designation === 'HR' ? allEventTypes : defaultEventType;

    const showTimeFields = eventData.event_type === 'meeting';
    const showLeadSelector = eventData.event_type === 'corporate_event';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-black"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    <X size={24} />
                </button>

                <div className="w-full flex justify-center mb-4">
                    <img src={addimg} alt="Add Event" className="rounded-xl w-full" />
                </div>

                <h2 className="text-lg font-semibold mb-4">Add Event</h2>

                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Lead selection dropdown - only for corporate events */}
                    {showLeadSelector && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Select Won Lead (optional)</label>
                            <select
                                value={selectedLeadId}
                                onChange={handleLeadSelect}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            >
                                <option value="">-- None --</option>
                                {leads.map(lead => (
                                    <option key={lead.id} value={lead.id}>
                                        {lead.clientName} - {lead.destination} ({lead.travelingDate})
                                    </option>
                                ))}
                            </select>
                            {selectedLeadId && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Title set to client name. You can edit it below.
                                </p>
                            )}
                        </div>
                    )}

                    <InputField 
                        label="Event Name" 
                        name="title" 
                        value={eventData.title} 
                        onChange={handleChange} 
                        required 
                    />
                    
                    <SelectField
                        label="Event Type"
                        name="event_type"
                        value={eventData.event_type}
                        onChange={handleChange}
                        options={eventTypes}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputField 
                                label="Start Date" 
                                name="start_date" 
                                type="date" 
                                value={eventData.start_date} 
                                onChange={handleChange} 
                                required 
                                min={formatDate(new Date())} 
                            />
                            {showTimeFields && (
                                <InputField 
                                    label="Start Time" 
                                    name="start_time" 
                                    type="time" 
                                    value={eventData.start_time} 
                                    onChange={handleChange} 
                                    required 
                                    min={isTodaySelected() ? getCurrentTime() : "00:00"} 
                                />
                            )}
                        </div>
                        <div>
                            <InputField 
                                label="End Date" 
                                name="end_date" 
                                type="date" 
                                value={eventData.end_date} 
                                onChange={handleChange} 
                                required={showTimeFields} 
                                min={eventData.start_date} 
                            />
                            {showTimeFields && (
                                <InputField 
                                    label="End Time" 
                                    name="end_time" 
                                    type="time" 
                                    value={eventData.end_time} 
                                    onChange={handleChange} 
                                    required 
                                    min={eventData.start_time || (isTodaySelected() ? getCurrentTime() : "00:00")} 
                                />
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            name="description"
                            value={eventData.description}
                            onChange={handleChange}
                            placeholder="Event description"
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                            rows={3}
                        />
                    </div>

                    {designation === 'HR' && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <label className="text-sm font-medium">Repeat Event</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name="is_recurring" 
                                    checked={eventData.is_recurring} 
                                    onChange={handleChange} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all" />
                            </label>
                        </div>
                    )}

                    {eventData.is_recurring && (
                        <SelectField
                            label="Recurrence Pattern"
                            name="recurrence_pattern"
                            value={eventData.recurrence_pattern}
                            onChange={handleChange}
                            options={recurrenceOptions}
                            required
                        />
                    )}

                    {isMeeting && (
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Attendees</label>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={eventData.new_attendee}
                                    onChange={(e) => setEventData(prev => ({ ...prev, new_attendee: e.target.value }))}
                                    placeholder="Enter email"
                                    className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <button type="button" onClick={handleAddAttendee} className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm">Add</button>
                            </div>
                            {eventData.attendees.length > 0 && (
                                <div className="space-y-1 mt-2">
                                    {eventData.attendees.map((email) => (
                                        <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div className="flex items-center gap-2">
                                                <Video size={14} className="text-gray-500" />
                                                <span className="text-sm">{email}</span>
                                            </div>
                                            <button type="button" onClick={() => handleRemoveAttendee(email)} className="text-red-500 hover:text-red-700"><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center gap-2"
                        >
                            {isSubmitting ? 'Creating...' : 'Create Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField = ({ label, name, value, onChange, type = "text", required = false, min }) => (
    <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            min={min}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, options, required = false }) => (
    <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

export default AddEventModal;