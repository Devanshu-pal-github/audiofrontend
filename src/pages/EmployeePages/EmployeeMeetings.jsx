
import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import MeetingCard from "../../components/MeetingCard";
import { useNavigate } from "react-router-dom";
import { useGetAllQuartersQuery, useGetCurrentUserQuery } from "../../services/api";

const EmployeeMeetings = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // Get current user info to filter meetings for employee role
  const { data: currentUser } = useGetCurrentUserQuery({ token });
  
  // Fetch all quarters from the API
  const { data: quarters, isLoading, error } = useGetAllQuartersQuery({ token });
  
  // Filter quarters based on user role and convert to meeting format
  const getMeetingsForEmployee = (quarters, user) => {
    if (!quarters || !user) return [];
    
    // For employees, show only quarters they participated in or completed quarters
    return quarters
      .filter(quarter => {
        // Show completed quarters or quarters where user is a participant
        return quarter.status === 'completed' || 
               (quarter.participants && quarter.participants.some(p => p.employee_id === user.employee_id));
      })
      .map(quarter => ({
        id: quarter.quarter_id,
        title: quarter.quarter_name,
        date: new Date(quarter.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        attendees: quarter.participant_count || 0,
        quarter: quarter.quarter_name,
        status: quarter.status,
        description: quarter.description
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first
  };

  const meetings = getMeetingsForEmployee(quarters, currentUser);

  const handleMeetingClick = (meeting) => {
    navigate('/previous-meeting', { 
      state: { 
        meetingId: meeting.id,
        quarter_id: meeting.id // Pass quarter_id for API calls
      } 
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-8">Previous Meetings</h2>
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading meetings...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-8">Previous Meetings</h2>
          <div className="flex justify-center items-center h-64">
            <div className="text-red-500">
              Error loading meetings: {error.message || 'Unknown error'}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full">
        <h2 className="text-2xl font-bold mb-8">Previous Meetings</h2>
        
        {meetings.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">No previous meetings found.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-start">
            {meetings.map((meeting, idx) => (
              <div
                key={meeting.id || meeting.title + idx}
                onClick={() => handleMeetingClick(meeting)}
                className="cursor-pointer"
              >
                <MeetingCard {...meeting} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmployeeMeetings;
