import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const QCPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
    const [qcStatus, setQcStatus] = useState({});
    const [notes, setNotes] = useState({});
    const [filter, setFilter] = useState('all');
    const [imageModal, setImageModal] = useState({ isOpen: false, src: '', alt: '' });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Get submissions from navigation state
    useEffect(() => {
        if (location.state?.submissions) {
            const submissionData = location.state.submissions;
            console.log('Received submissions:', submissionData); // Debug log
            setSubmissions(submissionData);
            
            const initialStatus = {};
            const initialNotes = {};
            
            submissionData.forEach((submission) => {
                // Use fill_id as the unique identifier since it's present in every row
                const uniqueId = submission.fill_id || submission.id;
                
                // Use existing QC status if available, otherwise default to pending
                initialStatus[uniqueId] = submission.qc_status || submission.status || 'pending';
                initialNotes[uniqueId] = submission.qc_notes || submission.notes || '';
            });
            
            console.log('Initial QC Status:', initialStatus); // Debug log
            console.log('Initial Notes:', initialNotes); // Debug log
            
            setQcStatus(initialStatus);
            setNotes(initialNotes);
        }
    }, [location.state]);

    const currentSubmission = submissions[currentSubmissionIndex];
    const currentUniqueId = currentSubmission?.fill_id || currentSubmission?.id;

    // Filter submissions based on status
    const filteredSubmissions = submissions.filter(submission => {
        if (filter === 'all') return true;
        const uniqueId = submission.fill_id || submission.id;
        return qcStatus[uniqueId] === filter;
    });

    const getUniqueId = (submission) => {
        return submission.fill_id || submission.id;
    };

    const handleStatusChange = async (submission, status) => {
        const uniqueId = getUniqueId(submission);
        const leadId = submission.lead_id;
        
        try {
            setLoading(true);
            
            // Update local state immediately for better UX
            setQcStatus(prev => ({
                ...prev,
                [uniqueId]: status
            }));

            // Make API call to update status
            const response = await axios.put(`https://tableware-dweeb-estate.ngrok-free.dev/api/qc/leads/${leadId}/status`, {
                status,
                notes: notes[uniqueId] || '',
                reviewedBy: 'QC User'
            });

            if (response.data.success) {
                console.log(`Submission ${uniqueId} ${status} successfully`);
                
                // Update the local submissions array with new QC data
                setSubmissions(prev => prev.map(sub => 
                    getUniqueId(sub) === uniqueId 
                        ? {
                            ...sub,
                            qc_status: status,
                            status: status,
                            qc_notes: notes[uniqueId] || '',
                            notes: notes[uniqueId] || '',
                            reviewed_by: 'QC User',
                            qc_date: new Date().toISOString(),
                            qc_review_date: new Date().toISOString()
                          }
                        : sub
                ));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            // Revert local state on error
            setQcStatus(prev => ({
                ...prev,
                [uniqueId]: prev[uniqueId] // Keep previous status
            }));
            alert('Failed to update status. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleNotesChange = (submission, note) => {
        const uniqueId = getUniqueId(submission);
        setNotes(prev => ({
            ...prev,
            [uniqueId]: note
        }));
    };

    const handleNext = () => {
        if (currentSubmissionIndex < filteredSubmissions.length - 1) {
            setCurrentSubmissionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentSubmissionIndex > 0) {
            setCurrentSubmissionIndex(prev => prev - 1);
        }
    };

    const handleSaveAll = async () => {
        try {
            setSaving(true);
            
            const qcResults = submissions.map(submission => ({
                leadId: submission.lead_id,
                fillId: submission.fill_id, // Include fill_id for backend reference
                status: qcStatus[getUniqueId(submission)] || 'pending',
                notes: notes[getUniqueId(submission)] || '',
                rejectionReasons: qcStatus[getUniqueId(submission)] === 'rejected' ? ['Quality issues'] : []
            }));

            console.log('QC Results to save:', qcResults);

            // Make bulk API call
            const response = await axios.post('https://tableware-dweeb-estate.ngrok-free.dev/api/qc/leads/bulk-update', {
                submissions: qcResults,
                reviewedBy: 'QC User'
            });

            if (response.data.success) {
                alert(`QC results saved for ${submissions.length} submissions!`);
                navigate('/');
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error saving QC results:', error);
            alert('Failed to save QC results. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleApprove = async (submission) => {
        const uniqueId = getUniqueId(submission);
        const leadId = submission.lead_id;
        
        try {
            setLoading(true);
            
            // Filter out any banner type fields from form data
            const filteredFormData = submission.data ? 
                submission.data.filter(field => {
                    // Exclude fields with type "banner"
                    return field.type !== "banner";
                }) : [];

            // Create payload with filtered formData (no banner fields)
            const payload = {
                notes: notes[uniqueId] || '',
                reviewedBy: 'QC User',
                fillId: submission.fill_id,
                formData: filteredFormData // Send filtered form data without banners
            };

            console.log('Sending approve payload (no banners):', payload);

            const response = await axios.post(`https://tableware-dweeb-estate.ngrok-free.dev/api/qc/leads/${leadId}/approve`, payload);

            if (response.data.success) {
                setQcStatus(prev => ({
                    ...prev,
                    [uniqueId]: 'approved'
                }));
                
                // Update the local submissions array
                setSubmissions(prev => prev.map(sub => 
                    getUniqueId(sub) === uniqueId 
                        ? {
                            ...sub,
                            qc_status: 'approved',
                            status: 'approved',
                            qc_notes: notes[uniqueId] || '',
                            notes: notes[uniqueId] || '',
                            reviewed_by: 'QC User',
                            qc_date: new Date().toISOString(),
                            qc_review_date: new Date().toISOString(),
                            rejection_reasons: []
                          }
                        : sub
                ));
                
                console.log(`Submission ${uniqueId} approved successfully`);
            }
        } catch (error) {
            console.error('Error approving submission:', error);
            alert('Failed to approve submission. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (submission) => {
        const uniqueId = getUniqueId(submission);
        const leadId = submission.lead_id;
        
        try {
            setLoading(true);
            const response = await axios.post(`https://tableware-dweeb-estate.ngrok-free.dev/api/qc/leads/${leadId}/reject`, {
                notes: notes[uniqueId] || '',
                reviewedBy: 'QC User',
                rejectionReasons: ['Quality check failed'],
                fillId: submission.fill_id // Include fill_id for specific submission
            });

            if (response.data.success) {
                setQcStatus(prev => ({
                    ...prev,
                    [uniqueId]: 'rejected'
                }));
                
                // Update the local submissions array
                setSubmissions(prev => prev.map(sub => 
                    getUniqueId(sub) === uniqueId 
                        ? {
                            ...sub,
                            qc_status: 'rejected',
                            status: 'rejected',
                            qc_notes: notes[uniqueId] || '',
                            notes: notes[uniqueId] || '',
                            reviewed_by: 'QC User',
                            qc_date: new Date().toISOString(),
                            qc_review_date: new Date().toISOString(),
                            rejection_reasons: ['Quality check failed']
                          }
                        : sub
                ));
                
                console.log(`Submission ${uniqueId} rejected successfully`);
            }
        } catch (error) {
            console.error('Error rejecting submission:', error);
            alert('Failed to reject submission. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const openImageModal = (src, alt = '') => {
        setImageModal({ isOpen: true, src, alt });
    };

    const closeImageModal = () => {
        setImageModal({ isOpen: false, src: '', alt: '' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-300';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved': return 'Approved';
            case 'rejected': return 'Rejected';
            case 'pending': return 'Pending Review';
            default: return 'Unknown';
        }
    };

    // Function to format field value for display
    const formatFieldValue = (value) => {
        if (value == null || value === '') return 'Not provided';
        
        if (Array.isArray(value)) {
            return value.length > 0 ? value.join(', ') : 'Not provided';
        }
        
        if (typeof value === 'object' && value !== null) {
            if (value.rating !== undefined) {
                return `${value.rating} star${value.rating !== 1 ? 's' : ''}`;
            }
            if (value.value !== undefined) {
                return value.value.toString();
            }
            
            const nonEmptyValues = Object.entries(value)
                .filter(([key, val]) => val != null && val !== '')
                .map(([key, val]) => {
                    const formattedKey = key
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .replace(/\./g, ' ');
                    
                    return `${formattedKey}: ${val}`;
                });
            
            return nonEmptyValues.length > 0 ? nonEmptyValues.join('\n') : 'Not provided';
        }
        
        return value.toString();
    };

    // Function to check if value is a file/image
    const isFileValue = (value) => {
        if (typeof value !== 'string') return false;
        
        return value.startsWith('blob:') || 
               value.startsWith('data:image') ||
               value.startsWith('data:application') ||
               value.includes('base64') ||
               (value.startsWith('http') && (value.includes('/uploads/') || /\.(jpg|jpeg|png|gif|pdf|doc|docx)$/i.test(value)));
    };

    // Function to get file type from value
    const getFileType = (value) => {
        if (value.startsWith('data:image')) return 'image';
        if (value.startsWith('data:application/pdf')) return 'pdf';
        if (value.startsWith('data:application/msword') || value.startsWith('data:application/vnd.openxmlformats')) return 'document';
        if (value.startsWith('blob:')) return 'blob';
        if (value.includes('.pdf')) return 'pdf';
        if (value.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'image';
        if (value.match(/\.(doc|docx)$/i)) return 'document';
        return 'file';
    };

    // Function to render file preview
    const renderFilePreview = (value, label = 'File') => {
        const fileType = getFileType(value);
        
        const getFileIcon = () => {
            switch (fileType) {
                case 'image':
                    return (
                        <div className="relative group">
                            <img 
                                src={value} 
                                alt={label}
                                className="w-32 h-32 object-cover border rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => openImageModal(value, label)}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div 
                                className="hidden w-32 h-32 bg-gray-100 border rounded-lg flex-col items-center justify-center cursor-pointer hover:bg-gray-200"
                                onClick={() => openImageModal(value, label)}
                            >
                                <span className="text-2xl mb-1">🖼️</span>
                                <span className="text-xs text-gray-600">View Image</span>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                📷
                            </div>
                        </div>
                    );
                case 'pdf':
                    return (
                        <div 
                            className="w-32 h-32 bg-red-100 border border-red-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-red-200 transition-colors"
                            onClick={() => window.open(value, '_blank')}
                        >
                            <span className="text-2xl mb-1">📄</span>
                            <span className="text-xs text-red-700 font-medium">PDF</span>
                            <span className="text-xs text-red-600 mt-1">Click to view</span>
                        </div>
                    );
                case 'document':
                    return (
                        <div 
                            className="w-32 h-32 bg-blue-100 border border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors"
                            onClick={() => window.open(value, '_blank')}
                        >
                            <span className="text-2xl mb-1">📝</span>
                            <span className="text-xs text-blue-700 font-medium">DOC</span>
                            <span className="text-xs text-blue-600 mt-1">Click to view</span>
                        </div>
                    );
                default:
                    return (
                        <div 
                            className="w-32 h-32 bg-gray-100 border border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={() => window.open(value, '_blank')}
                        >
                            <span className="text-2xl mb-1">📎</span>
                            <span className="text-xs text-gray-700 font-medium">FILE</span>
                            <span className="text-xs text-gray-600 mt-1">Click to view</span>
                        </div>
                    );
            }
        };

        return (
            <div className="mt-2">
                {getFileIcon()}
                <span className="text-sm text-green-600 mt-1 block">✅ File uploaded</span>
                <button
                    onClick={() => window.open(value, '_blank')}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline"
                >
                    Open in new tab
                </button>
            </div>
        );
    };

    // Function to render field value
    const renderFieldValue = (field) => {
        const { type, label, value, field_id } = field;

        // Check if this is a file field
        if (isFileValue(value)) {
            return renderFilePreview(value, label || field_id);
        }

        // Handle nested objects that might contain file references
        if (typeof value === 'object' && value !== null) {
            const fileEntries = Object.entries(value).filter(([key, val]) => isFileValue(val));
            
            if (fileEntries.length > 0) {
                return (
                    <div className="space-y-3">
                        {fileEntries.map(([key, fileValue]) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </label>
                                {renderFilePreview(fileValue, `${label} - ${key}`)}
                            </div>
                        ))}
                        
                        {/* Show non-file values */}
                        {Object.entries(value)
                            .filter(([key, val]) => !isFileValue(val) && val != null && val !== '')
                            .map(([key, nonFileValue]) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                    </label>
                                    <div className="text-gray-700 bg-gray-50 p-2 rounded border text-sm">
                                        {formatFieldValue(nonFileValue)}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                );
            }
        }

        return (
            <div className="mt-1">
                <div className="text-gray-700 whitespace-pre-wrap font-sans bg-gray-50 p-3 rounded border">
                    {formatFieldValue(value)}
                </div>
            </div>
        );
    };

    // Function to get display name for submission
    const getSubmissionDisplayName = (submission) => {
        return submission.client_name || 
               `Submission ${submission.fill_id || submission.id}`;
    };

    // QC Review Info Component
    const QCReviewInfo = ({ submission }) => {
        if (!submission || (submission.qc_status !== 'approved' && submission.qc_status !== 'rejected')) {
            return null;
        }

        const isApproved = submission.qc_status === 'approved';
        const isRejected = submission.qc_status === 'rejected';

        return (
            <div className={`p-4 rounded-lg border ${
                isApproved ? 'bg-green-50 border-green-200' : 
                isRejected ? 'bg-red-50 border-red-200' : 
                'bg-gray-50 border-gray-200'
            }`}>
                <div className="flex items-center mb-2">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                        isApproved ? 'bg-green-500' : 
                        isRejected ? 'bg-red-500' : 
                        'bg-gray-500'
                    }`}></div>
                    <h4 className="font-semibold text-gray-900">
                        {isApproved ? '✅ Approved' : '❌ Rejected'} by QC
                    </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="font-medium text-gray-700">Reviewed by:</span>
                        <p className="text-gray-600">{submission.reviewed_by || 'QC User'}</p>
                    </div>
                    
                    <div>
                        <span className="font-medium text-gray-700">Review date:</span>
                        <p className="text-gray-600">
                            {submission.qc_date || submission.qc_review_date ? 
                                new Date(submission.qc_date || submission.qc_review_date).toLocaleString() : 
                                'Not specified'
                            }
                        </p>
                    </div>
                    
                    {isRejected && submission.rejection_reasons && submission.rejection_reasons.length > 0 && (
                        <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">Rejection reasons:</span>
                            <ul className="list-disc list-inside text-gray-600 mt-1">
                                {submission.rejection_reasons.map((reason, index) => (
                                    <li key={index}>{reason}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    {submission.qc_notes && (
                        <div className="md:col-span-2">
                            <span className="font-medium text-gray-700">QC Notes:</span>
                            <p className="text-gray-600 mt-1 bg-white p-2 rounded border">
                                {submission.qc_notes}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Image Modal Component
    const ImageModal = () => {
        if (!imageModal.isOpen) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl max-h-full w-full h-auto">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-lg font-semibold">{imageModal.alt}</h3>
                        <button
                            onClick={closeImageModal}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                    <div className="p-4 flex justify-center items-center max-h-96 overflow-auto">
                        <img 
                            src={imageModal.src} 
                            alt={imageModal.alt}
                            className="max-w-full max-h-80 object-contain"
                        />
                    </div>
                    <div className="p-4 border-t flex justify-end space-x-2">
                        <button
                            onClick={() => window.open(imageModal.src, '_blank')}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Open in New Tab
                        </button>
                        <button
                            onClick={closeImageModal}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (!submissions || submissions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Submissions Found</h2>
                    <p className="text-gray-600 mb-6">There are no submissions to review.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!currentSubmission) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No Submission Selected</h2>
                    <button
                        onClick={() => setCurrentSubmissionIndex(0)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        View First Submission
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quality Control Review</h1>
                            <p className="text-gray-600 mt-2">
                                Review and verify submission data for accuracy and completeness
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleSaveAll}
                                disabled={saving}
                                className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${
                                    saving ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {saving ? 'Saving...' : 'Save All QC Results'}
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats and Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filter === 'all' 
                                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                All ({submissions.length})
                            </button>
                            <button
                                onClick={() => setFilter('pending')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filter === 'pending' 
                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Pending ({Object.values(qcStatus).filter(s => s === 'pending').length})
                            </button>
                            <button
                                onClick={() => setFilter('approved')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filter === 'approved' 
                                        ? 'bg-green-100 text-green-800 border border-green-300' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Approved ({Object.values(qcStatus).filter(s => s === 'approved').length})
                            </button>
                            <button
                                onClick={() => setFilter('rejected')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                                    filter === 'rejected' 
                                        ? 'bg-red-100 text-red-800 border border-red-300' 
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                Rejected ({Object.values(qcStatus).filter(s => s === 'rejected').length})
                            </button>
                        </div>

                        <div className="text-sm text-gray-500">
                            Showing {filteredSubmissions.length} of {submissions.length} submissions
                            {filteredSubmissions.length > 0 && (
                                <span className="ml-2 font-medium">
                                    (Current: {currentSubmissionIndex + 1} of {filteredSubmissions.length})
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Submission List Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow sticky top-6">
                            <div className="p-4 border-b">
                                <h3 className="font-semibold text-gray-900">Submissions</h3>
                            </div>
                            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                {filteredSubmissions.map((submission, index) => {
                                    const uniqueId = getUniqueId(submission);
                                    return (
                                        <div
                                            key={uniqueId}
                                            className={`p-4 border-b cursor-pointer transition-colors ${
                                                index === currentSubmissionIndex 
                                                    ? 'bg-blue-50 border-blue-200' 
                                                    : 'hover:bg-gray-50'
                                            }`}
                                            onClick={() => setCurrentSubmissionIndex(index)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {getSubmissionDisplayName(submission)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {submission.submitted_at 
                                                            ? new Date(submission.submitted_at).toLocaleDateString()
                                                            : 'No date'
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Fill ID: {submission.fill_id}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${getStatusColor(qcStatus[uniqueId])}`}>
                                                    {getStatusText(qcStatus[uniqueId])}
                                                </span>
                                            </div>
                                            {submission.sales_person && (
                                                <p className="text-xs text-gray-500 mt-1 truncate">
                                                    Sales: {submission.sales_person}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow">
                            {/* Submission Header */}
                            <div className="p-6 border-b">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {getSubmissionDisplayName(currentSubmission)}
                                        </h2>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                                            {currentSubmission.submitted_at && (
                                                <div>
                                                    <span className="font-medium">Submitted:</span>{' '}
                                                    {new Date(currentSubmission.submitted_at).toLocaleString()}
                                                </div>
                                            )}
                                            {currentSubmission.sales_person && (
                                                <div>
                                                    <span className="font-medium">Sales Person:</span>{' '}
                                                    {currentSubmission.sales_person}
                                                </div>
                                            )}
                                            {currentSubmission.lead_id && (
                                                <div>
                                                    <span className="font-medium">Lead ID:</span>{' '}
                                                    {currentSubmission.lead_id}
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Fill ID:</span>{' '}
                                                {currentSubmission.fill_id}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(qcStatus[currentUniqueId])}`}>
                                        {getStatusText(qcStatus[currentUniqueId])}
                                    </div>
                                </div>
                            </div>

                            {/* QC Review Info - Shows when approved/rejected */}
                            {(currentSubmission.qc_status === 'approved' || currentSubmission.qc_status === 'rejected') && (
                                <div className="p-6 border-b bg-gray-50">
                                    <QCReviewInfo submission={currentSubmission} />
                                </div>
                            )}

                            {/* Form Data */}
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Data</h3>
                                
                                {currentSubmission.data && currentSubmission.data.length > 0 ? (
                                    <div className="space-y-6">
                                        {currentSubmission.data.map((field, index) => (
                                            <div key={field.field_id || index} className="border-b pb-6 last:border-b-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            {field.label || field.field_id || `Field ${index + 1}`}
                                                        </label>
                                                    </div>
                                                    {field.type && (
                                                        <div className="ml-4 text-sm text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                                                            {field.type.replace(/-/g, ' ')}
                                                        </div>
                                                    )}
                                                </div>
                                                {renderFieldValue(field)}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No form data available for this submission.
                                    </div>
                                )}
                            </div>

                            {/* QC Actions */}
                            <div className="p-6 border-t bg-gray-50">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            QC Status
                                        </label>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => handleApprove(currentSubmission)}
                                                disabled={loading}
                                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                                    qcStatus[currentUniqueId] === 'approved'
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                ✅ {loading ? 'Processing...' : 'Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(currentSubmission)}
                                                disabled={loading}
                                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                                    qcStatus[currentUniqueId] === 'rejected'
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                ❌ {loading ? 'Processing...' : 'Reject'}
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(currentSubmission, 'pending')}
                                                disabled={loading}
                                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                                    qcStatus[currentUniqueId] === 'pending'
                                                        ? 'bg-yellow-600 text-white'
                                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                ⏳ {loading ? 'Processing...' : 'Mark Pending'}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            QC Notes
                                        </label>
                                        <textarea
                                            value={notes[currentUniqueId] || ''}
                                            onChange={(e) => handleNotesChange(currentSubmission, e.target.value)}
                                            placeholder="Add notes about this submission (issues found, corrections needed, observations, etc.)"
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            rows="3"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="p-6 border-t bg-white">
                                <div className="flex flex-wrap justify-between gap-4">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentSubmissionIndex === 0}
                                        className={`px-6 py-2 rounded-md font-medium transition-colors ${
                                            currentSubmissionIndex === 0
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gray-600 text-white hover:bg-gray-700'
                                        }`}
                                    >
                                        ← Previous
                                    </button>
                                    
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => navigate('/')}
                                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveAll}
                                            disabled={saving}
                                            className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium ${
                                                saving ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                        >
                                            {saving ? 'Saving...' : 'Save All QC Results'}
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={currentSubmissionIndex === filteredSubmissions.length - 1}
                                        className={`px-6 py-2 rounded-md font-medium transition-colors ${
                                            currentSubmissionIndex === filteredSubmissions.length - 1
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Modal */}
            <ImageModal />

            {/* Loading Overlay */}
            {(loading || saving) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="text-gray-700">
                                {saving ? 'Saving all QC results...' : 'Processing...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QCPage;