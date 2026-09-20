// Routers.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Event from "./components/ui/Event";
import Home from "./components/ui/Home";
import TasksPage from "./components/ui/TasksPage";
import CalendarPage from "./components/ui/Calendar";
import EmployeeList from "./components/ui/EmpList";
import Vacations from "./components/ui/Vacations.jsx";
import InfoPortal from "./components/ui/InfoPortal.jsx";
import Messenger from "./components/ui/Messenger.jsx";
import Proile from "./components/ui/ProfileDashboard.jsx";
import App from './App.js';
import Login from './auth/Login.js';
import ProtectedRoute from './ProtectedRounte/ProtectedRoute.jsx';
import LeaveNotification from './components/ui/LeaveNotification.jsx';
import ReimbursementForm from "./components/ui/ReimbursementForm.jsx"
import ReimbursementApproval from "./components/ui/ReimbursementApproval.jsx"
import ReimbursementList from "./components/ui/ReimbursementList.jsx"
import EmployeeFormStepper from "./components/ui/EmployeeFormStepper.jsx"
import AdminSetting from "./components/ui/setting.jsx"
import EmployeeListForm from "./components/ui/EmployeeListForm.jsx"
import ApproveLeaveTable from "./components/ui/ApproveLeaveTable.jsx"
import AttendancePage from './components/ui/AttendancePage.jsx';
import SpecificAttadance from './components/ui/SpecificAttadance.jsx';
import EmployeesAttadance from './components/ui/EmployeesAttadance.jsx';
import TaskNotificationsPage from './components/ui/TaskNotificationsPage.jsx';
import ResetPasswordPage from './components/ui/ResetPasswordPage.jsx';
import TaskCalendarTabs from './components/ui/TaskCalendarTabs.jsx';
import Leads from "./components/ui/LeadsPage.jsx";
import Contactus from "./components/ui/ContactsPage.jsx";
import CompaniesPage from "./components/ui/CompaniesPage.jsx";
import InsideClientPage from "./components/ui/InsideClientPage.jsx"
import InsideContactPage from "./components/ui/InsideContactPage.jsx"
import InsideLeadPage from "./components/ui/InsideLeadPage.jsx"
import Gestlist from "./components/ui/Gestlist.jsx"
import FormBuilder from "./components/ui/FormBuilder.jsx"
import WonLeadsListing from "./components/ui/WonLeadsListing.jsx"
import WonLeadinsidepage from "./components/ui/WonLeadinsidepage.jsx"
import FormsByLead from "./components/ui/FormsByLead.jsx"
import SharedFormView from "./components/ui/SharedFormView.jsx"
import EditFormPage from "./components/ui/EditFormPage.jsx"
import LeadFormsPage from "./components/ui/LeadFormsPage.jsx"
import FormSubmissionsPage from "./components/ui/FormSubmissionsPage.jsx"
import SubmissionViewer from "./components/ui/SubmissionViewer.jsx"
import FlightConecctions from './components/ui/FlightConecctions.jsx';
import QCPage from './components/ui/QCPage.jsx';
import Hotel from './components/ui/Hotel.jsx'
import InsurancePage from './components/ui/InsurancePage.jsx'
import Support from './components/ui/Support.jsx'
import TravelHubList from './components/ui/TravelHubList.jsx'
import InternationalHubList from './components/ui/InternationalHubList.jsx'
import Transit from './components/ui/Transit.jsx'
import Vendor from './components/ui/Vendor.jsx'
import InsideVendor from './components/ui/InsideVendor.jsx'
import HotelCard from './components/ui/HotelCard.jsx'
import FlightLiveMian from './components/ui/FlightLiveMian.jsx'
import FlightBuilder from './components/ui/FlightBuilder.jsx'
import CabManagementPage from './components/ui/CabManagementPage.jsx'
import SetupPage from './components/ui/SetupPage.jsx'
import PassengerRoomGrouping from './components/ui/PassengerRoomGrouping.jsx'
import OprationVendor from './components/ui/OprationVendor.jsx'
import BillinVendor from './components/ui/BillinVendor.jsx'
import Uploadticket from "./components/ui/Uploadticket"
import CorporateNotifications from "./components/ui/CorporateNotifications"
import SalarySlip from "./components/ui/SalarySlip"
import PnrRemovalHistory from "./components/ui/PnrRemovalHistory"
export default function Routers() {


  return (
    <BrowserRouter>
      <Routes>
        {/* Protected App layout and nested routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        >
          <Route path="Dashboard" element={<Home />} />
          <Route path="Note" element={<TasksPage />} />
          <Route path="Calendar" element={<CalendarPage />} />
          <Route path="Employees" element={<EmployeeList />} />
          <Route path="Vacations" element={<Vacations />} />
          <Route path="InfoPortal" element={<InfoPortal />} />
          <Route path="Messenger" element={<Messenger />} />
          <Route path="Employees/:id" element={<Proile />} />
          <Route path="LeaveNotification/" element={<LeaveNotification />} />
          <Route path="ReimbursementForm/" element={<ReimbursementForm />} />
          <Route path="ReimbursementApproval/" element={<ReimbursementApproval />} />
          <Route path="ReimbursementList/" element={<ReimbursementList />} />
          <Route path="EmpFormList/" element={<EmployeeListForm />} />
          <Route path="/Approveleave" element={<ApproveLeaveTable />} />
          <Route path="/AdminSetting" element={<AdminSetting />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/SpecificAttadance" element={<SpecificAttadance />} />
          <Route path="/EmployeesAttadance" element={<EmployeesAttadance />} />
          <Route path="/TaskNotificationsPage" element={<TaskNotificationsPage />} />
          <Route path="/TaskCalendarTabs" element={<TaskCalendarTabs />} />

          <Route path="/Leads" element={<Leads />} />
          <Route path="/contact" element={<Contactus />} />
          <Route path="/CompaniesPage" element={<CompaniesPage />} />

          <Route path="/InsideClientPage/:id" element={<InsideClientPage />} />
          <Route path="/InsideContactPage" element={<InsideContactPage />} />
          <Route path="/InsideLeadPage/:id" element={<InsideLeadPage />} />
          <Route path="/operations/Gestlist/:id" element={<Gestlist />} />
          <Route path="/WonLeadsListing" element={<WonLeadsListing />} />
          <Route path="operations/:id" element={<WonLeadinsidepage />} />
          <Route path="/operations/FormsByLead/:id" element={<FormsByLead />} />
          <Route path="/operations/LeadFormsPage/:id" element={<LeadFormsPage />} />
          <Route path="/operations/FormSubmissionsPage/:id" element={<FormSubmissionsPage />} />
          <Route path="/operations/flight/:id" element={<FlightConecctions />} />
          <Route path="/operations/Hotel/:id" element={<Hotel />} />
          <Route path="/operations/InsurancePage/:id" element={<InsurancePage />} />
          <Route path="/operations/Support/:id" element={<Support />} />
          <Route path="/operations/Support/:id" element={<Support />} />
          <Route path="/operations/Transit/:id" element={<Transit />} />
          <Route path="/operations/InternationalHubList/:id" element={<InternationalHubList />} />
          <Route path="/operations/TravelHubList/:id" element={<TravelHubList />} />
          <Route path="/accounts/vendor/:id" element={<Vendor />} />
          <Route path="/accounts/vendorDashboard" element={<InsideVendor />} />
          <Route path="/HotelCard" element={<HotelCard />} />
          <Route path="/operations/FlightLiveMian/:id" element={<FlightLiveMian />} />
          <Route path="/operations/FlightBuilder/:id" element={<FlightBuilder />} />
          <Route path="/operations/SetupPage/:id" element={<SetupPage />} />
          <Route path="/operations/CabManagementPage/:id" element={<CabManagementPage />} />
          <Route path="/operations/Hotel/PassengerRoomGrouping/:id" element={<PassengerRoomGrouping />} />
          <Route path="/operations/OprationVendor/:id" element={<OprationVendor />} />
          <Route path="/operations/BillinVendor/:id" element={<BillinVendor />} />
   <Route path="/operations/PnrRemovalHistory/:id" element={<PnrRemovalHistory />} />
          <Route path="/operations/Uploadticket/:id" element={<Uploadticket />} />
          <Route path="/CorporateNotifications" element={<CorporateNotifications />} />
          <Route path="/SalarySlip" element={<SalarySlip />} />



        </Route>

        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        <Route path="/EMPForm" element={<EmployeeFormStepper />} />
        <Route path="/forms/:id" element={<FormBuilder />} />
        <Route path="/UserFormSubmissions" element={<SubmissionViewer />} />
        <Route path="/operations/EditFormPage/:shareId" element={<EditFormPage />} />
        <Route path="/SharedFormView/:shareId" element={<SharedFormView />} />
        <Route path="/QCPage" element={<QCPage />} />
      </Routes>
    </BrowserRouter>
  );
}
