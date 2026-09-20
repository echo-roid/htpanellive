import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, Award, MapPin, Mail, Phone, 
  BarChart3, Activity, FileText, ClipboardList,
  Eye, Download, ChevronDown, ChevronRight,
  CheckCircle, Clock, AlertCircle, User, Building,
  Plus, Search, Filter, X, Settings, CheckSquare
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import bookImage from "../../assets/book.png";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const WonLeadInsidePage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestData, setGuestData] = useState([]);
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [selectedForms, setSelectedForms] = useState([]);
  const [showAllGuests, setShowAllGuests] = useState(false);
  const [expandedForm, setExpandedForm] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const [leadDetails, setLeadDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isFormSelectorOpen, setIsFormSelectorOpen] = useState(false);
  const [formsLoading, setFormsLoading] = useState(false);

  // Fetch Guest List
  useEffect(() => {
    const fetchGuestList = async () => {
      try {
        const response = await axios.get(
          `https://tableware-dweeb-estate.ngrok-free.dev/api/guestlist/leads/${id}/guestlist`
        );
        setGuestData(response.data.guestData || []);
        setLeadDetails(response.data);
      } catch (err) {
        console.error('Error fetching guest list:', err);
        setError('Failed to fetch guest list');
      }
    };
    fetchGuestList();
  }, [id]);

  // Fetch Forms
  useEffect(() => {
    const fetchForms = async () => {
      try {
        setFormsLoading(true);
        const response = await fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/lead/${id}`);
        const data = await response.json();
        if (response.ok) {
          setForms(data.forms || []);
          // Auto-select all forms
          setSelectedForms(data.forms?.map(f => f.id) || []);
        }
      } catch (err) {
        console.error('Error fetching forms:', err);
        setError('Failed to fetch forms');
      } finally {
        setFormsLoading(false);
        setLoading(false);
      }
    };
    fetchForms();
  }, [id]);

  // Fetch Submissions when selected forms change
  useEffect(() => {
    const fetchSubmissions = async () => {
      if (selectedForms.length === 0) return;
      
      const submissionPromises = selectedForms.map(formId => 
        fetch(`https://tableware-dweeb-estate.ngrok-free.dev/api/forms/${formId}/submissions`)
          .then(res => res.json())
          .then(data => ({ formId, data }))
          .catch(err => ({ formId, error: err.message }))
      );

      try {
        const results = await Promise.all(submissionPromises);
        const submissionMap = {};
        results.forEach(({ formId, data, error }) => {
          if (data && data.submissions) {
            submissionMap[formId] = data.submissions;
          } else {
            submissionMap[formId] = [];
          }
        });
        setSubmissions(submissionMap);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      }
    };

    fetchSubmissions();
  }, [selectedForms]);

  // Dashboard Statistics
  const getStats = () => {
    const totalGuests = guestData.length;
    const activeGuests = guestData.filter(g => g.Status === 'Active').length;
    const fcCount = guestData.filter(g => g.Desig_1 === 'FC').length;
    const dsaCount = guestData.filter(g => g.Desig_1 === 'DSA').length;
    
    const locationCount = {};
    guestData.forEach(g => {
      if (g.Location) {
        const key = g.Location.split('-')[0].trim();
        locationCount[key] = (locationCount[key] || 0) + 1;
      }
    });

    const routeCount = {};
    guestData.forEach(g => {
      if (g.Domestic) {
        const route = g.Domestic.split('-')[0].trim();
        routeCount[route] = (routeCount[route] || 0) + 1;
      }
    });

    const totalSubmissions = Object.values(submissions).reduce(
      (sum, subs) => sum + (subs?.length || 0), 0
    );

    return {
      totalGuests,
      activeGuests,
      fcCount,
      dsaCount,
      locationCount,
      routeCount,
      totalSubmissions,
      totalForms: forms.length
    };
  };

  const stats = getStats();

  // Filter forms based on search and status
  const filteredForms = forms.filter(form => {
    const matchesSearch = form.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          form.share_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || 
                          (filterStatus === 'Has Submissions' && submissions[form.id]?.length > 0) ||
                          (filterStatus === 'No Submissions' && (!submissions[form.id] || submissions[form.id].length === 0));
    return matchesSearch && matchesStatus;
  });

  // Toggle form selection
  const toggleFormSelection = (formId) => {
    setSelectedForms(prev => 
      prev.includes(formId) 
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    );
  };

  const handleSelectAllForms = () => {
    if (selectedForms.length === forms.length) {
      setSelectedForms([]);
    } else {
      setSelectedForms(forms.map(form => form.id));
    }
  };

  // Toggle form expansion for submissions
  const toggleFormExpansion = (formId) => {
    setExpandedForm(expandedForm === formId ? null : formId);
  };

  // Get submission count for a form
  const getSubmissionCount = (formId) => {
    return submissions[formId]?.length || 0;
  };

  // Get form status badge
  const getFormStatusBadge = (formId) => {
    const count = getSubmissionCount(formId);
    if (count === 0) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">No Submissions</span>;
    } else if (count < 5) {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-100 text-yellow-700">Low ({count})</span>;
    } else {
      return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700">Active ({count})</span>;
    }
  };

  // Render Charts
  const renderLocationChart = () => {
    const data = {
      labels: Object.keys(stats.locationCount),
      datasets: [
        {
          label: 'Guests by Location',
          data: Object.values(stats.locationCount),
          backgroundColor: 'rgba(59, 130, 246, 0.6)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 10 }, padding: 5 }
        },
        title: {
          display: true,
          text: 'Guest Distribution by Location',
          font: { size: 12, weight: 'bold' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { size: 9 } }
        },
        x: {
          ticks: { font: { size: 8 }, maxRotation: 45 }
        }
      }
    };

    return (
      <div className="border rounded-lg p-3 bg-white h-[220px]">
        <Bar data={data} options={options} />
      </div>
    );
  };

  const renderDesignationChart = () => {
    const data = {
      labels: ['FC', 'DSA'],
      datasets: [
        {
          data: [stats.fcCount, stats.dsaCount],
          backgroundColor: ['rgba(147, 51, 234, 0.8)', 'rgba(59, 130, 246, 0.8)'],
          borderColor: ['rgb(147, 51, 234)', 'rgb(59, 130, 246)'],
          borderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 10 }, padding: 10 }
        },
        title: {
          display: true,
          text: 'Designation Distribution',
          font: { size: 12, weight: 'bold' }
        }
      }
    };

    return (
      <div className="border rounded-lg p-3 bg-white h-[220px]">
        <Doughnut data={data} options={options} />
      </div>
    );
  };

  const renderFormSubmissionChart = () => {
    const formNames = forms.map(f => f.name || `Form ${f.id}`);
    const submissionCounts = forms.map(f => submissions[f.id]?.length || 0);

    const data = {
      labels: formNames,
      datasets: [
        {
          label: 'Submissions',
          data: submissionCounts,
          backgroundColor: 'rgba(34, 197, 94, 0.6)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 10 }, padding: 5 }
        },
        title: {
          display: true,
          text: 'Form Submissions',
          font: { size: 12, weight: 'bold' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, font: { size: 9 } }
        },
        x: {
          ticks: { font: { size: 8 }, maxRotation: 30 }
        }
      }
    };

    return (
      <div className="border rounded-lg p-3 bg-white h-[220px]">
        <Bar data={data} options={options} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p className="mb-4">{error}</p>
          <Link to="/won-leads" className="text-blue-500 hover:underline">
            Back to Won Leads
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="font-bold text-[22px] text-gray-800">🏆 Won Lead Details</h3>
          <p className="text-[10px] text-gray-500 mt-1">Lead ID: {id} • {guestData.length} Guests</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/won-leads" 
            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Back to Won Leads
          </Link>
          <img src={bookImage} className='w-[15px] h-[15px]' alt="book"/>
        </div>
      </div>

      {/* Toggle Dashboard */}
      <div className="flex justify-end mb-3">
        <button
          onClick={() => setShowDashboard(!showDashboard)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm"
        >
          {showDashboard ? (
            <>
              <BarChart3 size={14} />
              Hide Dashboard
            </>
          ) : (
            <>
              <Activity size={14} />
              Show Dashboard
            </>
          )}
        </button>
      </div>

      {/* Dashboard Section */}
      {showDashboard && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <div className="border rounded-lg p-3 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-medium text-gray-600">Total Guests</p>
                  <p className="text-xl font-bold mt-0.5">{stats.totalGuests}</p>
                </div>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-medium text-gray-600">Active</p>
                  <p className="text-xl font-bold mt-0.5">{stats.activeGuests}</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-purple-50 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-medium text-gray-600">FC</p>
                  <p className="text-xl font-bold mt-0.5">{stats.fcCount}</p>
                </div>
                <User className="w-5 h-5 text-purple-500" />
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-indigo-50 border-indigo-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-medium text-gray-600">DSA</p>
                  <p className="text-xl font-bold mt-0.5">{stats.dsaCount}</p>
                </div>
                <Building className="w-5 h-5 text-indigo-500" />
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-yellow-50 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-medium text-gray-600">Forms</p>
                  <p className="text-xl font-bold mt-0.5">{stats.totalForms}</p>
                </div>
                <FileText className="w-5 h-5 text-yellow-500" />
              </div>
            </div>

            <div className="border rounded-lg p-3 bg-orange-50 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-medium text-gray-600">Submissions</p>
                  <p className="text-xl font-bold mt-0.5">{stats.totalSubmissions}</p>
                </div>
                <ClipboardList className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
            {renderLocationChart()}
            {renderDesignationChart()}
            {renderFormSubmissionChart()}
          </div>
        </>
      )}

      {/* Guest List Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-sm">Guest List ({guestData.length})</h4>
          <button
            onClick={() => setShowAllGuests(!showAllGuests)}
            className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
          >
            {showAllGuests ? 'Show Less' : 'Show All'}
          </button>
        </div>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-[10px] border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1 text-left font-semibold">#</th>
                <th className="px-2 py-1 text-left font-semibold">Name</th>
                <th className="px-2 py-1 text-left font-semibold">Designation</th>
                <th className="px-2 py-1 text-left font-semibold">Status</th>
                <th className="px-2 py-1 text-left font-semibold">FC Code</th>
                <th className="px-2 py-1 text-left font-semibold">Location</th>
                <th className="px-2 py-1 text-left font-semibold">Domestic</th>
                <th className="px-2 py-1 text-left font-semibold">Form Fill</th>
              </tr>
            </thead>
            <tbody>
              {(showAllGuests ? guestData : guestData.slice(0, 5)).map((guest, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-1">{index + 1}</td>
                  <td className="px-2 py-1 font-medium">{guest.Name}</td>
                  <td className="px-2 py-1">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${
                      guest.Desig_1 === 'FC' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {guest.Desig_1 || guest.Designation || 'N/A'}
                    </span>
                  </td>
                  <td className="px-2 py-1">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${
                      guest.Status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {guest.Status}
                    </span>
                  </td>
                  <td className="px-2 py-1">{guest['Fc Code'] || guest.FcCode || 'N/A'}</td>
                  <td className="px-2 py-1">{guest.Location || 'N/A'}</td>
                  <td className="px-2 py-1">{guest.Domestic || 'N/A'}</td>
                  <td className="px-2 py-1 text-center">{guest.formfill || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Forms Section - List View */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-sm">Forms ({forms.length})</h4>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center border rounded-lg px-2 py-1 bg-white">
              <Search size={14} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-[10px] border-none focus:outline-none px-1 w-32"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-[10px] border rounded-lg px-2 py-1 bg-white focus:outline-none"
            >
              <option value="All">All Forms</option>
              <option value="Has Submissions">Has Submissions</option>
              <option value="No Submissions">No Submissions</option>
            </select>

            {/* Select Forms Button */}
            <button
              onClick={() => setIsFormSelectorOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center text-xs"
            >
              <CheckSquare size={14} className="mr-1.5" />
              Select Forms
            </button>
          </div>
        </div>
        
        {/* Forms List */}
        <div className="space-y-3">
          {filteredForms.map((form, index) => (
            <div key={form.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Form Header */}
              <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                   onClick={() => toggleFormExpansion(form.id)}>
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs font-medium text-gray-400 w-6">{index + 1}</span>
                  <FileText size={16} className="text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-sm truncate">{form.name || 'Untitled Form'}</span>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-gray-500">
                        ID: {form.share_id}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        • {form.field_count || 0} fields
                      </span>
                      {getFormStatusBadge(form.id)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-700">
                      {getSubmissionCount(form.id)}
                    </div>
                    <div className="text-[9px] text-gray-500">Submissions</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-[10px]" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedForms.includes(form.id)}
                        onChange={() => toggleFormSelection(form.id)}
                        className="rounded border-gray-300"
                      />
                    </label>
                    {expandedForm === form.id ? 
                      <ChevronDown size={18} className="text-gray-400" /> : 
                      <ChevronRight size={18} className="text-gray-400" />
                    }
                  </div>
                </div>
              </div>

              {/* Submissions */}
              {expandedForm === form.id && (
                <div className="p-3 border-t bg-white">
                  {submissions[form.id]?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <div className="mb-2 flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-600">
                          {submissions[form.id].length} Submission(s)
                        </span>
                        <span className="text-[9px] text-gray-400">
                          {new Date(submissions[form.id][0]?.submitted_at).toLocaleDateString()} - 
                          {new Date(submissions[form.id][submissions[form.id].length - 1]?.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                      <table className="w-full text-[10px] border-collapse">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1 text-left font-semibold">#</th>
                            <th className="px-2 py-1 text-left font-semibold">Submitted At</th>
                            <th className="px-2 py-1 text-left font-semibold">Fields</th>
                            <th className="px-2 py-1 text-left font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {submissions[form.id].map((sub, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="px-2 py-1">{idx + 1}</td>
                              <td className="px-2 py-1 whitespace-nowrap">
                                {new Date(sub.submitted_at).toLocaleString()}
                              </td>
                              <td className="px-2 py-1">
                                <div className="flex flex-wrap gap-1">
                                  {sub.data && sub.data.map((field, fIdx) => (
                                    field.type !== 'banner' && field.type !== 'paragraph' && field.type !== 'heading' && (
                                      <span key={fIdx} className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[8px]">
                                        {field.label || field.field_id}: {typeof field.value === 'object' ? 'Object' : (field.value || 'N/A')}
                                      </span>
                                    )
                                  ))}
                                </div>
                              </td>
                              <td className="px-2 py-1">
                                <button 
                                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                                  title="View Submission"
                                >
                                  <Eye size={12} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-[10px] text-gray-500">
                        No submissions yet for this form
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredForms.length === 0 && (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm font-medium">No forms found</p>
            <p className="text-[10px] mt-1">
              {searchTerm || filterStatus !== 'All' 
                ? 'Try adjusting your search criteria or clear filters.'
                : 'No forms have been created for this lead'}
            </p>
          </div>
        )}
      </div>

      {/* Form Selector Modal */}
      {isFormSelectorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-96 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Select Forms</h2>
              <button onClick={() => setIsFormSelectorOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            {formsLoading ? (
              <div className="text-center text-gray-500 py-4">Loading forms...</div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto">
                  <div className="mb-2">
                    <label className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                      <input
                        type="checkbox"
                        checked={forms.length > 0 && selectedForms.length === forms.length}
                        onChange={handleSelectAllForms}
                        className="rounded text-blue-600"
                      />
                      <span className="font-medium">Select All</span>
                    </label>
                  </div>

                  {forms.map(form => (
                    <label key={form.id} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
                      <input
                        type="checkbox"
                        checked={selectedForms.includes(form.id)}
                        onChange={() => toggleFormSelection(form.id)}
                        className="rounded text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium block truncate text-sm">{form.name || 'Untitled Form'}</span>
                        <p className="text-xs text-gray-500">ID: {form.share_id}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {getSubmissionCount(form.id)} submissions
                      </span>
                    </label>
                  ))}

                  {forms.length === 0 && !formsLoading && (
                    <div className="text-center text-gray-500 py-4">
                      No forms found for this lead
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                  <button
                    onClick={() => setIsFormSelectorOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setIsFormSelectorOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Apply ({selectedForms.length})
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WonLeadInsidePage;