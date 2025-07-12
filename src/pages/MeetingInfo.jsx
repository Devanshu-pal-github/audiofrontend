import React from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

// Helper to render CSV data as a table
const CsvTable = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-gray-300">No data</div>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg bg-white text-gray-700">
        <thead>
          <tr>
            {Object.keys(data[0]).map((header) => (
              <th key={header} className="px-4 py-2 border-b bg-gray-50 font-semibold text-sm text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b last:border-b-0">
              {Object.values(row).map((cell, j) => (
                <td key={j} className="px-4 py-2 text-sm">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const MeetingInfo = ({ csvData, meetingTitle, meetingDescription }) => {
  // For now, these props would be passed via navigation or context
  // Example csvData: [{Name: 'Alice', Role: 'Manager'}, ...]
  return (
    <div className="h-screen w-screen flex flex-col md:flex-row font-sans overflow-hidden">
      {/* Left Section: CSV Preview */}
      <motion.div
        className="md:w-1/2 w-full h-screen overflow-auto p-10 flex flex-col justify-center items-center bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-600 text-white rounded-none md:rounded-r-3xl animated-gradient"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="w-full max-w-2xl flex flex-col items-center">
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
            <Users className="w-8 h-8 text-white" />
            Commetrix
          </h1>
          <h2 className="text-xl font-semibold mb-4">CSV Data Preview</h2>
          <motion.div
            className="w-full bg-white rounded-lg shadow p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CsvTable data={csvData} />
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section: Meeting Info & Backend Status */}
      <motion.div
        className="md:w-1/2 w-full p-10 bg-white rounded-none flex flex-col justify-center relative"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      >
        <div className="max-w-md mx-auto w-full">
          <motion.h2
            className="text-3xl font-bold mb-4 text-gray-800 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {meetingTitle || <span className="text-gray-400">No title provided</span>}
          </motion.h2>
          <motion.p
            className="text-lg text-gray-700 mb-8 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {meetingDescription || <span className="text-gray-400">No description provided</span>}
          </motion.p>
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">Backend Status</label>
            <div className="w-full border border-dashed border-gray-300 rounded-md px-4 py-2 text-sm bg-gray-50 min-h-[40px] text-gray-400">
              (Backend status will be displayed here)
            </div>
          </motion.div>
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label>
            <div className="w-full border border-dashed border-purple-300 rounded-md px-4 py-2 text-xs bg-purple-50 text-purple-700">
              {/* Placeholder for future API endpoint */}
              POST /api/meetings/upload
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MeetingInfo;