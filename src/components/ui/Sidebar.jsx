import React, { useState, useEffect } from 'react';
import logo from "../../assets/Company'slogo.png";
import logout from "../../assets/logout.png";
import support from "../../assets/Support.png";
import {
  Bell,
  Users,
  Wallet,
  ChevronDown,
  ChevronUp,
  Home,
  User,
  Clock,
  FileText,
  CreditCard,
  Settings,
  Briefcase,
  Database,
  File,
  HelpCircle,
  Plane,
  Car,
  Hotel,
  Globe,
  PartyPopper,
  Sheet,
  DollarSign,
  List,
  ChevronRight,
  Menu,
  Calendar,
  Receipt,
  ListTodo,
  Building,
  Banknote,
  Calculator,
  Shield,
  BarChart3
} from "lucide-react";

import { Link, useLocation, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ profileselector,SetToggleMenuBar,toggleMenuBar }) {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const { id } = useParams();

  const EmpId = user?.employee?.id;
  const leadId = useSelector((state) => state.lead.leadId);

  const currentPath = location.pathname.toLowerCase();
  const isHr = user?.employee?.designation === 'HR';

  const [expandedSections, setExpandedSections] = useState({
    profile: currentPath.startsWith('/profile'),
    account: currentPath.startsWith('/account'),
    operations: currentPath.startsWith('/operations'),
    sales: currentPath.startsWith('/sales'),
    accounts: currentPath.startsWith('/accounts')
  });

  useEffect(() => {
    setExpandedSections({
      profile: currentPath.startsWith('/profile'),
      account: currentPath.startsWith('/account'),
      operations: currentPath.startsWith('/operations'),
      sales: currentPath.startsWith('/sales'),
      accounts: currentPath.startsWith('/accounts')
    });
  }, [currentPath]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const profileModeItems = [
    { icon: <Bell size={18} />, text: "Note", path: "/Note" },
    { icon: <Calendar size={18} />, text: "Calendar", path: "/calendar" },
    { icon: <Calendar size={18} />, text: "Vacations", path: "/vacations" },
    { icon: <Users size={18} />, text: "Employees", path: "/employees", hrOnly: true },
    { icon: <Bell size={18} />, text: "Messenger", path: "/messenger", hrOnly: true },
    // { icon: <Menu size={18} />, text: "InfoPortal", path: "/infoportal", hrOnly: true },
    { icon: <Users size={18} />, text: "My Profile", path: `/Employees/${EmpId}` },
    { icon: <Wallet size={18} />, text: "ReimbForm", path: `/ReimbursementForm` },
    { icon: <Receipt size={18} />, text: "ReimbList", path: `/ReimbursementList` },
    { icon: <ListTodo size={18} />, text: "EmpFormList", path: `/EmpFormList`, hrOnly: true },
    // { icon: <ListTodo size={18} />, text: "EMPFORM", path: `/EMPForm`, hrOnly: true },
    { icon: <ListTodo size={18} />, text: "attendance", path: `/attendance`, hrOnly: true },
    // { icon: <ListTodo size={18} />, text: "EmployeesAttadance", path: `/EmployeesAttadance` },
    { icon: <ListTodo size={18} />, text: "Setting", path: `/AdminSetting`},
  ];

  const fullModeItems = [
    { 
      icon: <Home size={18} />, 
      text: "Dashboard", 
      path: "/dashboard" 
    },
    {
      icon: <DollarSign size={18} />,
      text: "Sales",
      path: "/sales",
      children: [
        { icon: <Bell size={18} />, text: "Leads", path: "/Leads" },
        { icon: <Settings size={18} />, text: "Contacts", path: "/contact" },
        { icon: <Bell size={18} />, text: "Client", path: "/CompaniesPage" },
        // { icon: <Bell size={18} />, text: "Hotel", path: "/HotelCard" },
      ]
    },
    {
      icon: <Briefcase size={18} />,
      text: "Project",
      path: "/WonLeadsListing"
    },
    { 
      icon: <Users size={16} />, 
      text: "Vendor", 
      path: `/accounts/vendor/${leadId}` 
    },
    {
      icon: <Building size={18} />,
      text: "Accounts",
      path: "/accounts",
      children: [
        { 
          icon: <Banknote size={16} />, 
          text: "Payments", 
          path: "/accounts/payments",
          children: [ 
            { 
              icon: <Users size={16} />, 
              text: "up coming", 
              path: `/accounts//${leadId}` 
            }, 
            { 
              icon: <Users size={16} />, 
              text: "to be pay", 
              path: `/accounts//${leadId}` 
            }, 
            { 
              icon: <Users size={16} />, 
              text: "paid", 
              path: `/accounts//${leadId}` 
            },
          ]
        },
        { 
          icon: <Banknote size={16} />, 
          text: "Receipt", 
          path: "/accounts/payments" 
        },
        { 
          icon: <Settings size={16} />, 
          text: "Settings", 
          path: "/accounts/settings" 
        },
        { 
          icon: <Calculator size={16} />, 
          text: "Reconciliation", 
          path: "/accounts/reconciliation" 
        }
      ]
    },
    ...(currentPath.startsWith('/operations') ? [
      {
        icon: <Briefcase size={18} />,
        text: "Operation",
        children: [
          { icon: <Users size={16} />, text: "SetUp", path: `/operations/SetupPage/${leadId}`},
          { icon: <Database size={16} />, text: "Guest Database", path: `/operations/Gestlist/${leadId}` },
          { icon: <File size={16} />, text: "FormsListing", path: `/operations/FormsByLead/${leadId}` },
          { icon: <HelpCircle size={16} />, text: "Support", path: `/operations/LeadFormsPage/${leadId}` },
          { icon: <Plane size={16} />, text: "Flight Ticketing", path: `/operations/flight/${leadId}` },
          { icon: <Car size={16} />, text: "Transit Cab & Bus", path: `/operations/CabManagementPage/${leadId}` },
          { icon: <Hotel size={16} />, text: "Hotels", path: `/operations/Hotel/${leadId}` },
          { icon: <Hotel size={16} />, text: "Insurance", path: `/operations/InsurancePage/${leadId}` },
          { icon: <Globe size={16} />, text: "Visa", path: "/operations/visa" },
          { icon: <CreditCard size={16} />, text: "Reimbursements", path: "/operations/reimbursements" },
          { icon: <PartyPopper size={16} />, text: "Events", path: "/operations/events" },
          { icon: <Sheet size={16} />, text: "Cost Sheets", path: "/operations/cost-sheets" },
          { icon: <DollarSign size={16} />, text: "Vendor Payments", path: "/operations/vendor-payments" },
          { icon: <List size={16} />, text: "Vendor List", path: `/operations/OprationVendor/${leadId}` },
          { icon: <List size={16} />, text: "flightStatus", path: `/operations/FlightLiveMian/${leadId}`},
           { icon: <List size={16} />, text: "PnrRemovalHistory", path: `/operations/PnrRemovalHistory/${leadId}`}
        ]
      }
    ] : []),
  ];

  const navItems = profileselector ? profileModeItems : fullModeItems;

  const isActive = (path) => {
    if (!path) return false;
    
    // Exact match for root paths
    if (path === '/dashboard' || path === '/WonLeadsListing') {
      return currentPath === path.toLowerCase();
    }
    
    // For nested paths, check if current path starts with the item path
    return currentPath.startsWith(path.toLowerCase());
  };

  const hasActiveChild = (items) => {
    return items.some(item => {
      if (item.path && isActive(item.path)) return true;
      if (item.children) return hasActiveChild(item.children);
      return false;
    });
  };

  const renderNavItem = (item, level = 0) => {
    if (item.hrOnly && !isHr) return null;

    const hasChildren = item.children && item.children.length > 0;
    const sectionKey = item.text.toLowerCase().replace(/\s+/g, '-');
    const isExpanded = expandedSections[sectionKey];
    const isItemActive = isActive(item.path) || (hasChildren && hasActiveChild(item.children));
    const paddingLeft = `${level * 16 + 16}px`;

    if (hasChildren) {
      return (
        <div key={item.text} className="mb-1">
          <motion.div
            className={`flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer text-[10px] font-medium transition-all duration-200 ${
              isItemActive 
                ? "bg-white text-white border-l-4 border-white" 
                : "text-white hover:bg-white/10 hover:text-white"
            }`}
            style={{ paddingLeft }}
            onClick={() => toggleSection(sectionKey)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3">
              <span className={`transition-colors ${isItemActive ? "text-black" : "text-black/80"}`}>
                {React.cloneElement(item.icon, { size: 18 - level * 2 })}
              </span>
              <span className={`font-medium ${isItemActive ? "text-black" : "text-black/80"}`}>{item.text}</span>
            </div>
            <motion.span 
              animate={{ rotate: isExpanded ? 180 : 0 }} 
              transition={{ duration: 0.2 }}
              className={isItemActive ? "text-white" : "text-white/60"}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </motion.span>
          </motion.div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-1">
                  {item.children.map(child => renderNavItem(child, level + 1))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link to={item.path} key={item.text} className="block">
        <motion.div
          className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer text-[10px] font-medium transition-all duration-200 ${
            isActive(item.path) 
              ? "bg-white text-white border-l-4 border-blue-600" 
              : "text-white hover:bg-white/10 hover:text-white"
          }`}
          style={{ paddingLeft }}
          whileHover={{ x: 5, transition: { duration: 0.1 } }}
          whileTap={{ scale: 0.98 }}
        >
          <span className={`transition-colors ${isActive(item.path) ? "text-black" : "text-black/80"}`}>
            {React.cloneElement(item.icon, { size: 18 - level * 2 })}
          </span>
          <span className={`font-medium ${isActive(item.path) ? "text-black" : "text-black/80"}`}>{item.text}</span>
          {isActive(item.path) && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="ml-auto text-white"
            >
              <ChevronRight size={14} />
            </motion.span>
          )}
        </motion.div>
      </Link>
    );
  };

  return (
    <aside className={`w-[17%] bg-gradient-to-r from-[#e9e9e9] to-[#e9e9e9] p-6 py-10 shadow-lg shadow-indigo-500/50 flex-col justify-between  fixed h-[100vh] overflow-auto scrollbar-none  ${toggleMenuBar ? "flex" : "hidden"}`}>
      <div>
        {/* <motion.div
          className="flex items-center gap-3 font-bold text-sm mb-10 pl-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <img src={logo} alt="logo" className="h-10 w-10 object-contain" />
          <span className="text-white" onClick={()=>{SetToggleMenuBar(false)}}>
            Company
          </span>
        </motion.div> */}

        <nav className="space-y-2">
          <AnimatePresence>
            {navItems.map((item, index) => (
              <motion.div 
                key={item.text} 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                {renderNavItem(item)}
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>
      </div>

      <div className="mt-8 space-y-6">
        {/* Support Section */}
        <motion.div 
          className="mb-6 p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-center">
            <h3 className="text-sm font-semibold text-black mb-2">Need Help?</h3>
            <p className="text-xs text-black/70 mb-3">Our support team is here for you</p>
            <img src={support} className="w-full max-w-[140px] mx-auto opacity-90" alt="support" />
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.button
          className="w-full py-3 rounded-xl flex gap-3 items-center justify-center text-white hover:bg-red-500/20 hover:text-white font-medium border border-black/20 hover:border-red-400/30 transition-all duration-200"
          whileHover={{ 
            scale: 1.02,
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            borderColor: "rgba(248, 113, 113, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
        >
          <img src={logout} alt="logout" className="h-4 w-4 brightness-0 invert" />
          <span className="font-medium text-black">Logout</span>
        </motion.button>
      </div>
    </aside>
  );
}