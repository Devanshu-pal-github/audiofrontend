
import React from "react";
import { Calendar, Users } from "lucide-react";


const MeetingCard = ({ title, date, attendees, quarter }) => {
    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 w-full min-w-[50%] max-w-[90%] mb-1 transition-all duration-300 relative hover:shadow-lg hover:-translate-y-1 hover:z-10 cursor-pointer">
            {quarter && (
                <div className="absolute top-3 right-4 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full shadow-sm">{quarter}</div>
            )}
            <div className="font-semibold text-base mb-2">{title}</div>
            <div className="flex items-center text-gray-500 text-sm mb-2">
                <Calendar size={14} className="mr-2" />
                <span>{date}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
                <Users size={14} className="mr-2" />
                <span>{attendees} employees attended</span>
            </div>
        </div>
    );
};

export default MeetingCard;
