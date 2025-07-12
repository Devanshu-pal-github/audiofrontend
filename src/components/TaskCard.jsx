import React from "react";

const TaskCard = ({ title, description, due }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm">
    <div>
      <div className="font-semibold text-sm mb-1">{title}</div>
      <div className="text-gray-500 text-xs">{description}</div>
    </div>
    <div className="text-xs text-gray-400 mt-2 md:mt-0 md:ml-3 whitespace-nowrap">{due}</div>
  </div>
);

export default TaskCard;
