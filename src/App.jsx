// PrivateRoute component to protect routes
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import UploadCsv from "./pages/UploadCsv.jsx";
import MeetingInfo from "./pages/MeetingInfo.jsx";
import Meetings from "./pages/AdminPages/meetings.jsx";

import MeetingDetails from "./pages/AdminPages/MeetingDetails.jsx";
import OrganisationDetails from "./pages/AdminPages/OrganisationDetails.jsx";
// import CurrentMeetingAnalysis from "./pages/AdminPages/CurrentMeetingAnalysis.jsx";
import MeetingSummaryPage from "./pages/AdminPages/MeetingSummary.jsx";

import EmployeeMeetings from "./pages/EmployeePages/EmployeeMeetings.jsx";
import PreviousMeetings from "./pages/EmployeePages/PreviousMeetings.jsx";
import Login from "./pages/Login.jsx";
import EmployeeDataUpload from "./pages/EmployeeDataUpload.jsx";
import RocksPage from "./pages/RocksPage.jsx";

function MeetingInfoRouteWrapper() {
  const location = useLocation();
  const state = location.state;
  if (!state || !state.csvData || !state.meetingTitle || !state.meetingDescription) {
    return <Navigate to="/" replace />;
  }
  return (
    <MeetingInfo
      csvData={state.csvData}
      meetingTitle={state.meetingTitle}
      meetingDescription={state.meetingDescription}
    />
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* <Route path="/" element={<Navigate to="/current-meeting-analysis" replace />} />
          <Route path="/current-meeting-analysis" element={
            <PrivateRoute><CurrentMeetingAnalysis /></PrivateRoute>
          } /> */}
          <Route path="/info" element={
            <PrivateRoute><MeetingInfoRouteWrapper /></PrivateRoute>
          } />
          <Route path="/meetings" element={
            <PrivateRoute><Meetings /></PrivateRoute>
          } />
          <Route path="/organisation-details" element={
            <PrivateRoute><OrganisationDetails /></PrivateRoute>
          } />
          <Route path="/admin/meeting-summary" element={
            <PrivateRoute><MeetingSummaryPage /></PrivateRoute>
          } />
          <Route path="/employee-data-upload" element={
            <PrivateRoute><EmployeeDataUpload /></PrivateRoute>
          } />
          <Route path="/employee-meetings" element={
            <PrivateRoute><EmployeeMeetings /></PrivateRoute>
          } />
          <Route path="/previous-meeting" element={
            <PrivateRoute><PreviousMeetings /></PrivateRoute>
          } />
          <Route path="/rocks" element={
            <PrivateRoute><RocksPage /></PrivateRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
