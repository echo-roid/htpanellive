import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Users, LogOut, CheckCircle, Clock, Search, Mail, Phone,
    MapPin, RefreshCw, AlertCircle, Image as ImageIcon,
    Download, X, Eye
} from 'lucide-react';

const API_BASE = 'http://localhost:5000';
const TOKEN_KEY = 'travel_guide_token';
const GUIDE_KEY = 'travel_guide_info';

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};

const isBlobUrl = (url) => url && typeof url === 'string' && url.startsWith('blob:');

const objectToString = (obj) => {
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object' && obj !== null) {
        if (obj.url) return obj.url;
        const keys = Object.keys(obj).filter(k => !isNaN(k)).sort((a, b) => a - b);
        if (keys.length > 0) return keys.map(k => obj[k]).join('');
        try { return JSON.stringify(obj); } catch { return 'Invalid data'; }
    }
    return String(obj);
};

const getAgeCategory = (dobString) => {
    if (!dobString || dobString === 'N/A') return 'N/A';
    try {
        const dob = new Date(dobString);
        const today = new Date();
        if (isNaN(dob.getTime())) return 'Invalid Date';
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        if (age < 2) return 'Infant';
        if (age >= 2 && age <= 12) return 'Child';
        return 'Adult';
    } catch { return 'Invalid Date'; }
};

const getPassportFieldValue = (value, columnLabel) => {
    if (!value) return 'N/A';
    const map = {
        'Passport Number': 'passportNumber', 'First Name': 'firstName',
        'Last Name': 'lastName', 'Nationality': 'nationality',
        'Date of Birth': 'dob', 'Place of Birth': 'placeOfBirth',
        'Date of Issue': 'issueDate', 'Date of Expiry': 'expiryDate'
    };
    const f = map[columnLabel];
    if (!f) return 'N/A';
    const v = value[f];
    return v !== undefined && v !== null && v !== '' ? v : 'N/A';
};

const GuidePanel = () => {
    const navigate = useNavigate();
    const [guide, setGuide] = useState(null);
    const [guests, setGuests] = useState([]);
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState('');
    const [popupImage, setPopupImage] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        const info = localStorage.getItem(GUIDE_KEY);
        if (!token || !info) { navigate('/guide-login'); return; }
        try { setGuide(JSON.parse(info)); } catch { navigate('/guide-login'); }
    }, [navigate]);

    const authHeader = () => {
        const token = localStorage.getItem(TOKEN_KEY);
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fetchGuests = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(
                `${API_BASE}/api/travel-guides/me/guests`,
                { headers: authHeader() }
            );
            if (data.success) {
                const parsed = (data.guests || []).map(g => {
                    let parsedData = [];
                    try {
                        parsedData = typeof g.data === 'string' ? JSON.parse(g.data) : (g.data || []);
                    } catch (e) {
                        console.error('Parse error for guest', g.id, e);
                        parsedData = [];
                    }
                    return {
                        ...g,
                        data: parsedData,
                        travel_guide_approved: Number(g.travel_guide_approved) === 1
                    };
                });
                setGuests(parsed);
                setStats(data.stats || { total: 0, approved: 0, pending: 0 });
            } else {
                setError(data.message || 'Failed to load guests');
            }
        } catch (err) {
            console.error('Guests API error:', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(GUIDE_KEY);
                navigate('/guide-login');
                return;
            }
            setError(err.response?.data?.message || err.message || 'Failed to load guests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (guide) fetchGuests(); }, [guide]);

    const handleLogout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(GUIDE_KEY);
        navigate('/guide-login');
    };

    const handleApprove = async (submissionId, approved) => {
        try {
            await axios.patch(
                `${API_BASE}/api/travel-guides/me/guests/${submissionId}/approve`,
                { approved },
                { headers: authHeader() }
            );
            setGuests(prev =>
                prev.map(g => g.id === submissionId ? { ...g, travel_guide_approved: approved } : g)
            );
            setStats(prev => ({
                ...prev,
                approved: approved ? prev.approved + 1 : prev.approved - 1,
                pending: approved ? prev.pending - 1 : prev.pending + 1
            }));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update approval');
        }
    };

    const filtered = guests.filter(g => {
        if (filter === 'approved' && !g.travel_guide_approved) return false;
        if (filter === 'pending' && g.travel_guide_approved) return false;
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            const basics = String(g.client_name || '').toLowerCase().includes(term) ||
                           String(g.lead_id || '').toLowerCase().includes(term);
            const inData = Array.isArray(g.data) && g.data.some(f => {
                const v = f.value;
                const txt = typeof v === 'object' && v !== null
                    ? JSON.stringify(v).toLowerCase()
                    : String(v || '').toLowerCase();
                return txt.includes(term) || String(f.label || '').toLowerCase().includes(term);
            });
            return basics || inData;
        }
        return true;
    });

    /* =========================================================
       VALUE EXTRACTOR — pull a single value for table cells
       ========================================================= */
    const getFieldValue = (field, columnLabel) => {
        if (!field || !field.value) return 'N/A';
        const { type, value } = field;

        if (type === 'aadhar' || type === 'ocr-aadhar') {
            switch (columnLabel) {
                case 'Aadhar Number': return value.aadharNumber || 'N/A';
                case 'First Name': return value.firstName || 'N/A';
                case 'Last Name': return value.lastName || 'N/A';
                case 'Date of Birth': {
                    const dob = value.dob || 'N/A';
                    return dob !== 'N/A' ? `${dob} (${getAgeCategory(dob)})` : dob;
                }
                case 'Gender': return value.gender || 'N/A';
                case 'Address': return value.address || 'N/A';
                case 'Aadhar Front': return value.frontImage;
                case 'Aadhar Back': return value.backImage;
                default: return 'N/A';
            }
        }
        if (type === 'passport' || type === 'ocr-password') {
            if (columnLabel === 'Passport Front') return value.frontImage;
            if (columnLabel === 'Passport Back') return value.backImage;
            const fv = getPassportFieldValue(value, columnLabel);
            if (columnLabel === 'Date of Birth' && fv !== 'N/A') {
                return `${fv} (${getAgeCategory(fv)})`;
            }
            return fv;
        }
        if (type === 'nearest-airport') {
            switch (columnLabel) {
                case 'Airport Name': return value.selectedAirport || value.airportName || 'N/A';
                case 'Airport Code': return value.airportCode || 'N/A';
                case 'Address': return value.address || 'N/A';
                case 'Distance (km)': return value.distanceKm || value.distance || 'N/A';
                default: return 'N/A';
            }
        }
        if (type === 'address') {
            switch (columnLabel) {
                case 'Street 1': return value.street1 || 'N/A';
                case 'Street 2': return value.street2 || 'N/A';
                case 'City': return value.city || 'N/A';
                case 'State': return value.state || 'N/A';
                case 'Postal Code': return value.postalCode || 'N/A';
                default: return 'N/A';
            }
        }
        if (type === 'file-upload' || type === 'image') {
            return value;
        }
        if (typeof value === 'object' && value !== null) {
            return value.value || value.selectedOption ||
                   (value.selectedOptions && value.selectedOptions.join(', ')) || 'N/A';
        }
        return value || 'N/A';
    };

    /* =========================================================
       BUILD COLUMNS from first guest's data
       ========================================================= */
    const buildColumns = () => {
        const firstGuest = guests[0];
        if (!firstGuest || !Array.isArray(firstGuest.data) || firstGuest.data.length === 0) {
            return [];
        }

        const cols = [];
        firstGuest.data.forEach(item => {
            if (!item || !item.type) return;
            if (['banner', 'paragraph', 'heading'].includes(item.type)) return;

            if (item.type === 'aadhar' || item.type === 'ocr-aadhar') {
                ['Aadhar Number', 'First Name', 'Last Name', 'Date of Birth', 'Gender', 'Address', 'Aadhar Front', 'Aadhar Back']
                    .forEach(label => cols.push({ label, field_id: item.field_id, type: 'aadhar', subfield: label }));
            } else if (item.type === 'passport' || item.type === 'ocr-password') {
                ['Passport Number', 'First Name', 'Last Name', 'Nationality', 'Date of Birth', 'Place of Birth', 'Date of Issue', 'Date of Expiry', 'Passport Front', 'Passport Back']
                    .forEach(label => cols.push({ label, field_id: item.field_id, type: 'passport', subfield: label }));
            } else if (item.type === 'nearest-airport') {
                ['Airport Name', 'Airport Code', 'Address', 'Distance (km)']
                    .forEach(label => cols.push({ label, field_id: item.field_id, type: 'nearest-airport', subfield: label }));
            } else if (item.type === 'address') {
                ['Street 1', 'Street 2', 'City', 'State', 'Postal Code']
                    .forEach(label => cols.push({ label, field_id: item.field_id, type: 'address', subfield: label }));
            } else if (item.type === 'file-upload' || item.type === 'image') {
                cols.push({ label: item.label || 'File', field_id: item.field_id, type: item.type });
            } else {
                cols.push({ label: item.label || item.field_id || 'Field', field_id: item.field_id, type: item.type });
            }
        });

        return cols;
    };

    const columns = buildColumns();

    /* =========================================================
       RENDER a single table cell
       ========================================================= */
    const renderCellValue = (guest, col) => {
        const field = guest.data.find(f => f.field_id === col.field_id);
        const value = getFieldValue(field, col.subfield || col.label);

        // Image fields
        if (col.subfield === 'Aadhar Front' || col.subfield === 'Aadhar Back' ||
            col.subfield === 'Passport Front' || col.subfield === 'Passport Back' ||
            col.type === 'file-upload' || col.type === 'image') {
            if (!value) return <span className="text-gray-400">N/A</span>;
            const url = typeof value === 'object' ? objectToString(value) : value;
            if (!url || url === 'N/A') return <span className="text-gray-400">N/A</span>;
            const isImg = /\.(jpeg|jpg|gif|png|webp|bmp)$/i.test(url) ||
                          String(url).startsWith('data:image') ||
                          isBlobUrl(url);
            if (isImg) {
                return (
                    <button onClick={() => setPopupImage(url)}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Eye size={12} /> View
                    </button>
                );
            }
            return (
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-green-600 hover:underline">
                    <Download size={12} /> Download
                </a>
            );
        }

        // Regular value
        if (value === undefined || value === null || value === '') {
            return <span className="text-gray-400">N/A</span>;
        }
        return (
            <span className="truncate max-w-[150px] inline-block align-middle" title={String(value)}>
                {String(value)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-[95%] mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {guide?.profile_image ? (
                            <img src={getImageUrl(guide.profile_image)} alt={guide.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-blue-200" />
                        ) : (
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users size={20} className="text-blue-600" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-lg font-semibold text-gray-800">Guide Panel</h1>
                            <p className="text-xs text-gray-500">Welcome, {guide?.name || 'Guide'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={fetchGuests} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="Refresh">
                            <RefreshCw size={16} />
                        </button>
                        <button onClick={handleLogout}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[95%] mx-auto px-4 py-6">
                {/* Contact info */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} /> {guide?.email || 'N/A'}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} /> {guide?.phone || 'N/A'}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin size={14} /> {guide?.city || 'N/A'}</div>
                    <div className="ml-auto text-xs text-gray-400">Guide ID: <span className="font-semibold">{guide?.id}</span></div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-xs font-medium text-blue-700 uppercase">Total Assigned</p>
                        <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-xs font-medium text-green-700 uppercase">Approved</p>
                        <p className="text-2xl font-bold text-green-900 mt-1">{stats.approved}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-xs font-medium text-yellow-700 uppercase">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.pending}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search guests or any field..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="flex gap-1">
                        {['all', 'pending', 'approved'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 text-sm rounded-lg capitalize ${
                                    filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-16 text-gray-500">Loading guests...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 bg-white rounded-xl shadow-sm">
                        <Users size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="font-medium">No guests found</p>
                        <p className="text-sm">{guests.length === 0 ? 'You have no guests assigned yet.' : 'Try changing the filter or search term.'}</p>
                    </div>
                ) : (
                    /* ========== TABLE VIEW ========== */
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto" style={{ maxHeight: '75vh' }}>
                            <table className="min-w-full text-xs border-separate border-spacing-0">
                                <thead className="bg-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="border px-3 py-2 text-left bg-gray-100 text-[10px] whitespace-nowrap">SR No.</th>
                                        <th className="border px-3 py-2 text-left bg-gray-100 text-[10px] whitespace-nowrap">Project Name</th>
                                        <th className="border px-3 py-2 text-left bg-gray-100 text-[10px] whitespace-nowrap">Lead ID</th>

                                        {columns.map((col, i) => (
                                            <th key={i} className="border px-3 py-2 text-left bg-gray-100 text-[10px] whitespace-nowrap">
                                                {col.label}
                                            </th>
                                        ))}

                                        <th className="border px-3 py-2 text-center bg-gray-100 text-[10px] whitespace-nowrap">Status</th>
                                        <th className="border px-3 py-2 text-center bg-gray-100 text-[10px] whitespace-nowrap">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((g, rowIdx) => (
                                        <tr key={g.id} className="hover:bg-blue-50">
                                            <td className="border px-3 py-2 text-[10px] text-center font-medium">{rowIdx + 1}</td>
                                            <td className="border px-3 py-2 text-[10px] font-medium text-gray-800 whitespace-nowrap">
                                                {g.client_name || `Lead #${g.lead_id}`}
                                            </td>
                                            <td className="border px-3 py-2 text-[10px] text-gray-600">{g.lead_id}</td>

                                            {columns.map((col, i) => (
                                                <td key={i} className="border px-3 py-2 text-[10px] text-gray-700 whitespace-nowrap">
                                                    {renderCellValue(g, col)}
                                                </td>
                                            ))}

                                            <td className="border px-3 py-2 text-center whitespace-nowrap">
                                                {g.travel_guide_approved ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[9px] font-medium">
                                                        <CheckCircle size={9} /> Approved
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[9px] font-medium">
                                                        <Clock size={9} /> Pending
                                                    </span>
                                                )}
                                            </td>

                                            <td className="border px-3 py-2 text-center whitespace-nowrap">
                                                {g.travel_guide_approved ? (
                                                    <button onClick={() => handleApprove(g.id, false)}
                                                        className="px-2 py-0.5 text-[9px] text-red-600 border border-red-200 rounded hover:bg-red-50">
                                                        Revoke
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleApprove(g.id, true)}
                                                        className="px-2 py-0.5 text-[9px] text-white bg-green-600 rounded hover:bg-green-700">
                                                        Approve
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* Image popup */}
            {popupImage && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="relative bg-white p-4 rounded-lg shadow-lg max-w-[90%] max-h-[90%]">
                        <button className="absolute top-2 right-2 text-gray-700 hover:text-red-600"
                            onClick={() => setPopupImage(null)}>
                            <X size={24} />
                        </button>
                        <img src={popupImage} alt="Preview" className="max-w-full max-h-[80vh] rounded" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GuidePanel;