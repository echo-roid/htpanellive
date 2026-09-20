import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLeadId } from '../../redux/slices/leadsSlice';
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
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Bar, Doughnut, Line, Pie, PolarArea } from 'react-chartjs-2';
import { TrendingUp, Users, Globe, Award, Calendar, Briefcase, BarChart3, Activity } from 'lucide-react';
import bookImage from "../../assets/book.png";

// Register ChartJS components
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
  Filler,
  RadialLinearScale
);

// Dashboard Statistics Component
const WonLeadsStats = ({ leads }) => {
  const totalWon = leads.length;
  
  // Domestic vs International
  const domestic = leads.filter(lead => lead.domesticInternational?.toLowerCase() === 'domestic').length;
  const international = leads.filter(lead => lead.domesticInternational?.toLowerCase() === 'international').length;
  
  // Count by lead type
  const leadTypeCount = {};
  leads.forEach(lead => {
    if (lead.leadType) {
      leadTypeCount[lead.leadType] = (leadTypeCount[lead.leadType] || 0) + 1;
    }
  });
  
  // Count by bidding method
  const biddingMethodCount = {};
  leads.forEach(lead => {
    if (lead.modeOfBidding) {
      biddingMethodCount[lead.modeOfBidding] = (biddingMethodCount[lead.modeOfBidding] || 0) + 1;
    }
  });
  
  // Total PAX
  const totalPax = leads.reduce((sum, lead) => sum + (parseInt(lead.paxCount) || 0), 0);
  
  // Unique clients
  const uniqueClients = new Set(leads.map(lead => lead.clientName)).size;
  
  // Unique sales persons
  const uniqueSalesPersons = new Set(leads.map(lead => lead.salesPerson)).size;

  const stats = [
    {
      label: "Total Won Leads",
      value: totalWon,
      icon: <Award className="w-5 h-5 text-yellow-500" />,
      color: "bg-yellow-50 border-yellow-200",
      subtitle: `${domestic} Domestic, ${international} International`
    },
    {
      label: "Unique Clients",
      value: uniqueClients,
      icon: <Users className="w-5 h-5 text-blue-500" />,
      color: "bg-blue-50 border-blue-200",
      subtitle: `${totalPax} Total PAX`
    },
    {
      label: "Sales Team",
      value: uniqueSalesPersons,
      icon: <Briefcase className="w-5 h-5 text-purple-500" />,
      color: "bg-purple-50 border-purple-200",
      subtitle: `${Object.keys(leadTypeCount).length} Lead Types`
    },
    {
      label: "International Share",
      value: `${totalWon > 0 ? Math.round((international / totalWon) * 100) : 0}%`,
      icon: <Globe className="w-5 h-5 text-green-500" />,
      color: "bg-green-50 border-green-200",
      subtitle: `${international} International Leads`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {stats.map((stat, index) => (
        <div key={index} className={`border rounded-lg p-3 ${stat.color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-600">{stat.label}</p>
              <p className="text-xl font-bold mt-0.5">{stat.value}</p>
              <p className="text-[9px] text-gray-500 mt-0.5">{stat.subtitle}</p>
            </div>
            <div className="p-1.5 bg-white rounded-full shadow-sm">
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Monthly Won Leads Chart
const MonthlyWonLeadsChart = ({ leads }) => {
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: month.getMonth(),
      year: month.getFullYear(),
      label: `${monthNames[month.getMonth()]} ${month.getFullYear()}`
    });
  }

  const monthlyData = months.map(({ month, year }) => {
    const count = leads.filter(lead => {
      if (!lead.createdAt) return false;
      const leadDate = new Date(lead.createdAt);
      return leadDate.getMonth() === month && leadDate.getFullYear() === year;
    }).length;
    return count;
  });

  const data = {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'Won Leads',
        data: monthlyData,
        backgroundColor: 'rgba(234, 179, 8, 0.5)',
        borderColor: 'rgb(234, 179, 8)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(234, 179, 8)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 10 },
          padding: 5
        }
      },
      title: {
        display: true,
        text: 'Monthly Won Leads Trend',
        font: { size: 12, weight: 'bold' },
        padding: { bottom: 5 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 9 }
        }
      },
      x: {
        ticks: { font: { size: 9 } }
      }
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[220px]">
      <Line data={data} options={options} />
    </div>
  );
};

// Domestic vs International Chart
const DomesticInternationalChart = ({ leads }) => {
  const domestic = leads.filter(lead => lead.domesticInternational?.toLowerCase() === 'domestic').length;
  const international = leads.filter(lead => lead.domesticInternational?.toLowerCase() === 'international').length;

  const data = {
    labels: ['Domestic', 'International'],
    datasets: [
      {
        label: 'Trip Types',
        data: [domestic, international],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(147, 51, 234, 0.8)'
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(147, 51, 234)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 10 },
          padding: 5
        }
      },
      title: {
        display: true,
        text: 'Domestic vs International',
        font: { size: 12, weight: 'bold' },
        padding: { bottom: 5 }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 9 }
        }
      },
      y: {
        ticks: { font: { size: 10 } }
      }
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[220px]">
      <Bar data={data} options={options} />
    </div>
  );
};

// Lead Type Distribution Chart
const LeadTypeDistributionChart = ({ leads }) => {
  const leadTypeCount = {};
  leads.forEach(lead => {
    if (lead.leadType) {
      leadTypeCount[lead.leadType] = (leadTypeCount[lead.leadType] || 0) + 1;
    }
  });

  const colors = [
    'rgba(147, 51, 234, 0.8)',
    'rgba(59, 130, 246, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(234, 179, 8, 0.8)'
  ];

  const data = {
    labels: Object.keys(leadTypeCount),
    datasets: [
      {
        label: 'Lead Types',
        data: Object.values(leadTypeCount),
        backgroundColor: colors.slice(0, Object.keys(leadTypeCount).length),
        borderColor: colors.slice(0, Object.keys(leadTypeCount).length).map(c => c.replace('0.8', '1')),
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
        labels: {
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 10 }
        }
      },
      title: {
        display: true,
        text: 'Lead Type Distribution',
        font: { size: 12, weight: 'bold' },
        padding: { bottom: 5 }
      }
    },
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[200px]">
      <Pie data={data} options={options} />
    </div>
  );
};

// Bidding Method Distribution Chart
const BiddingMethodDistributionChart = ({ leads }) => {
  const methodCount = {};
  leads.forEach(lead => {
    if (lead.modeOfBidding) {
      methodCount[lead.modeOfBidding] = (methodCount[lead.modeOfBidding] || 0) + 1;
    }
  });

  const colors = [
    'rgba(236, 72, 153, 0.8)',
    'rgba(99, 102, 241, 0.8)',
    'rgba(251, 146, 60, 0.8)',
    'rgba(52, 211, 153, 0.8)'
  ];

  const data = {
    labels: Object.keys(methodCount),
    datasets: [
      {
        label: 'Bidding Methods',
        data: Object.values(methodCount),
        backgroundColor: colors.slice(0, Object.keys(methodCount).length),
        borderColor: colors.slice(0, Object.keys(methodCount).length).map(c => c.replace('0.8', '1')),
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
        labels: {
          padding: 10,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 10 }
        }
      },
      title: {
        display: true,
        text: 'Bidding Methods',
        font: { size: 12, weight: 'bold' },
        padding: { bottom: 5 }
      }
    },
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[200px]">
      <Doughnut data={data} options={options} />
    </div>
  );
};

// Sales Person Performance Chart
const SalesPersonPerformanceChart = ({ leads }) => {
  const salesPersonCount = {};
  leads.forEach(lead => {
    if (lead.salesPerson) {
      salesPersonCount[lead.salesPerson] = (salesPersonCount[lead.salesPerson] || 0) + 1;
    }
  });

  const sortedData = Object.entries(salesPersonCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 sales persons

  const colors = [
    'rgba(59, 130, 246, 0.8)',
    'rgba(147, 51, 234, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(234, 179, 8, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(99, 102, 241, 0.8)',
    'rgba(251, 146, 60, 0.8)',
    'rgba(52, 211, 153, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(168, 85, 247, 0.8)'
  ];

  const data = {
    labels: sortedData.map(item => item[0]),
    datasets: [
      {
        label: 'Won Leads',
        data: sortedData.map(item => item[1]),
        backgroundColor: colors.slice(0, sortedData.length),
        borderColor: colors.slice(0, sortedData.length).map(c => c.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 10 },
          padding: 5
        }
      },
      title: {
        display: true,
        text: 'Top Sales Performers',
        font: { size: 12, weight: 'bold' },
        padding: { bottom: 5 }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: { size: 9 }
        }
      },
      y: {
        ticks: { font: { size: 9 } }
      }
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-white h-[220px]">
      <Bar data={data} options={options} />
    </div>
  );
};

const WonLeadsListing = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tripTypeFilter, setTripTypeFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);
  const dispatch = useDispatch();

  const fetchWonLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('https://tableware-dweeb-estate.ngrok-free.dev/api/leads/won');
      setLeads(response.data);
    } catch (error) {
      console.error('Error fetching won leads:', error);
      setError('Failed to fetch won leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWonLeads();
  }, []);

  // Filter leads based on search term and trip type
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.salesPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTripType = 
      tripTypeFilter === 'All' || 
      lead.domesticInternational?.toLowerCase() === tripTypeFilter.toLowerCase();
    
    return matchesSearch && matchesTripType;
  });

  // Function to handle lead click and store in Redux
  const handleLeadClick = (leadId) => {
    dispatch(setLeadId(leadId));
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Function to get trip type badge styling
  const getTripTypeBadge = (tripType) => {
    switch (tripType?.toLowerCase()) {
      case 'international':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'domestic':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading won leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="text-center text-red-600">
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchWonLeads}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-md">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-[22px] text-gray-800">🏆 Won Leads Dashboard</h3>
        <p className='mb-0 text-[10px] flex gap-1'>
          <img src={bookImage} className='mt-0 w-[15px] h-[15px]' alt="book"/>
          Learn More About The Won Leads
        </p>
      </div>

      {/* Toggle Dashboard/Table View */}
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
          <WonLeadsStats leads={leads} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
            <MonthlyWonLeadsChart leads={leads} />
            <DomesticInternationalChart leads={leads} />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <LeadTypeDistributionChart leads={leads} />
            <BiddingMethodDistributionChart leads={leads} />
            <SalesPersonPerformanceChart leads={leads} />
          </div>
        </>
      )}

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by client, sales person, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-7 px-3 text-[10px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>

        {/* Trip Type Filter */}
        <select
          value={tripTypeFilter}
          onChange={(e) => setTripTypeFilter(e.target.value)}
          className="h-7 px-3 text-[10px] border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
        >
          <option value="All">All Trip Types</option>
          <option value="Domestic">Domestic</option>
          <option value="International">International</option>
        </select>

        {/* Results Count */}
        <span className="text-[10px] text-gray-600 ml-auto">
          Showing {filteredLeads.length} of {leads.length} won leads
        </span>

        {/* Clear Filters */}
        {(searchTerm || tripTypeFilter !== 'All') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setTripTypeFilter('All');
            }}
            className="text-[10px] text-yellow-600 hover:text-yellow-700 focus:outline-none"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      {filteredLeads.length > 0 ? (
        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="min-w-full border text-[10px] text-left leading-none border-collapse">
            {/* HEADER */}
            <thead className="bg-gray-50">
              <tr className="h-6">
                <th className="px-2 py-0.5 font-semibold text-gray-700 border-b h-6">
                  #
                </th>
                <th className="px-2 py-0.5 font-semibold text-gray-700 border-b h-6">
                  Client
                </th>
                <th className="px-2 py-0.5 font-semibold text-gray-700 border-b h-6">
                  Sales Person
                </th>
                <th className="px-2 py-0.5 font-semibold text-gray-700 border-b h-6">
                  Destination
                </th>
                <th className="px-2 py-0.5 font-semibold text-gray-700 border-b h-6">
                  Traveling Date
                </th>
                <th className="px-2 py-0.5 font-semibold text-gray-700 border-b h-6">
                  Trip Type
                </th>
                <th className="px-2 py-0.5 font-semibold text-gray-700 border-b h-6">
                  RFQ Status
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {filteredLeads.map((lead, idx) => (
                <tr
                  key={lead.id || idx}
                  className="border-b hover:bg-yellow-50 h-6 transition"
                >
                  <td className="px-2 py-0.5 whitespace-nowrap align-middle text-gray-500">
                    {idx + 1}
                  </td>
                  {/* Client */}
                  <td className="px-2 py-0.5 whitespace-nowrap align-middle">
                    <Link
                      to={`/operations/${lead.id}`}
                      onClick={() => handleLeadClick(lead.id)}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      {lead.clientName || "N/A"}
                    </Link>
                  </td>

                  {/* Sales Person */}
                  <td className="px-2 py-0.5 whitespace-nowrap align-middle text-gray-700">
                    {lead.salesPerson || "N/A"}
                  </td>

                  {/* Destination */}
                  <td className="px-2 py-0.5 whitespace-nowrap align-middle text-gray-700">
                    {lead.destination || "N/A"}
                  </td>

                  {/* Traveling Date */}
                  <td className="px-2 py-0.5 whitespace-nowrap align-middle text-gray-700">
                    {formatDate(lead.travelingDate)}
                  </td>

                  {/* Trip Type */}
                  <td className="px-2 py-0.5 whitespace-nowrap align-middle">
                    <span
                      className={`px-1.5 py-[1px] rounded text-[8px] leading-none font-semibold ${getTripTypeBadge(
                        lead.domesticInternational
                      )}`}
                    >
                      {lead.domesticInternational || "N/A"}
                    </span>
                  </td>

                  {/* RFQ Status */}
                  <td className="px-2 py-0.5 whitespace-nowrap align-middle">
                    <span className="px-1.5 py-[1px] rounded text-[8px] leading-none font-semibold bg-green-100 text-green-800 border border-green-200">
                      {lead.rfqStatus || "Won"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
          <div className="text-gray-400 text-6xl mb-4">🏆</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No won leads found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || tripTypeFilter !== 'All' 
              ? 'Try adjusting your search criteria or clear filters.'
              : 'No won leads available at the moment.'
            }
          </p>
          {(searchTerm || tripTypeFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTripTypeFilter('All');
              }}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default WonLeadsListing;


