
import React from "react";
import Layout from "../../components/Layout";
import MeetingCard from "../../components/MeetingCard";
import { useNavigate } from "react-router-dom";
import { useGetAllQuartersQuery } from "../../services/api";

const Meetings = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    
    // Fetch all quarters from the API
    const { data: quarters, isLoading, error } = useGetAllQuartersQuery({ token });
    
    // Group quarters by year for better organization
    const groupQuartersByYear = (quarters) => {
        if (!quarters) return {};
        
        const grouped = {};
        quarters.forEach(quarter => {
            // Extract year from quarter name (assuming format like "Q1 2024")
            const yearMatch = quarter.quarter_name.match(/(\d{4})/);
            const year = yearMatch ? yearMatch[1] : "Unknown";
            
            if (!grouped[year]) {
                grouped[year] = [];
            }
            
            grouped[year].push({
                title: quarter.quarter_name,
                date: new Date(quarter.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                attendees: quarter.participant_count || 0,
                status: quarter.status,
                quarter_id: quarter.quarter_id,
                description: quarter.description
            });
        });
        
        return grouped;
    };

    const handleMeetingClick = (meeting) => {
        navigate('/meeting-details', { 
            state: { 
                ...meeting,
                quarter: meeting.title
            } 
        });
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="w-full">
                    <h2 className="text-2xl font-bold mb-8">Yearly Meetings</h2>
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
                    <h2 className="text-2xl font-bold mb-8">Yearly Meetings</h2>
                    <div className="flex justify-center items-center h-64">
                        <div className="text-red-500">
                            Error loading meetings: {error.message || 'Unknown error'}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    const quartersByYear = groupQuartersByYear(quarters);

    return (
        <Layout>
            <div className="w-full">
                <h2 className="text-2xl font-bold mb-8">Yearly Meetings</h2>
                
                {Object.keys(quartersByYear).length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-gray-500">No meetings found. Create your first quarter to get started!</div>
                    </div>
                ) : (
                    Object.entries(quartersByYear)
                        .sort(([yearA], [yearB]) => yearB - yearA) // Sort years in descending order
                        .map(([year, yearQuarters]) => (
                            <div key={year} className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 text-gray-700">{year}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 items-start">
                                    {yearQuarters.map((meeting, idx) => (
                                        <div 
                                            key={meeting.quarter_id || idx} 
                                            onClick={() => handleMeetingClick(meeting)}
                                            className="cursor-pointer"
                                        >
                                            <MeetingCard 
                                                {...meeting} 
                                                quarter={meeting.title}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                )}
            </div>
        </Layout>
    );
};

export default Meetings;
