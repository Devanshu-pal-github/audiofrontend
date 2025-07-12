import React from "react";

const QuarterSelector = ({ value, onChange, options = [
    "Q3 2024",
    "Q2 2024",
    "Q1 2024"
], className }) => {
    return (
        <select
            value={value}
            onChange={onChange}
            className={className || "border border-gray-300 rounded-md px-3 py-1 text-xs font-medium bg-white text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"}
        >
            {options.map((option) => (
                <option key={option} value={option} className="text-gray-700">
                    {option}
                </option>
            ))}
        </select>
    );
};

export default QuarterSelector;
