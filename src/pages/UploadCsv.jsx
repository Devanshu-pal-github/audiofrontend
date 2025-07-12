import React, { useState, useEffect } from "react";
import { UploadCloud, UserCog2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

const UploadCsv = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [meetingTopic, setMeetingTopic] = useState("");
  const [description, setDescription] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
      setCurrentTime(`${hours}:${minutesStr} ${ampm}`);
      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setCsvFile(e.dataTransfer.files[0]);
    }
  };

  // Parse CSV and navigate
  const handleContinue = () => {
    if (!csvFile || !meetingTopic.trim() || !description.trim()) {
      alert("Please upload a CSV file, enter a meeting title, and provide a description.");
      return;
    }
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          alert("The uploaded CSV file is empty or invalid.");
          return;
        }
        navigate("/info", {
          state: {
            csvData: results.data,
            meetingTitle: meetingTopic,
            meetingDescription: description,
          },
        });
      },
      error: () => {
        alert("Failed to parse the CSV file.");
      },
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left Section */}
      <motion.div
        className="md:w-1/3 w-full p-10 flex flex-col justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-600 text-white rounded-none md:rounded-r-3xl animated-gradient"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
            <UserCog2 className="w-8 h-8 text-white" />
            Commetrix
          </h1>
          <h2 className="text-xl font-semibold mb-3">
            Streamline Your Meeting Planning
          </h2>
          <p className="text-sm leading-relaxed mb-6">
            Upload your team's CSV file to automatically organize meetings
            based on roles and responsibilities.
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              Save time with automated meeting organization
            </li>
            <li className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              Ensure all relevant team members are included
            </li>
            <li className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              Track meeting topics and outcomes efficiently
            </li>
          </ul>
        </div>
      </motion.div>

      {/* Right Section */}
      <motion.div
        className="md:w-2/3 w-full p-10 bg-white rounded-none flex flex-col justify-center relative"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
          Upload Your Team Data
        </h2>

        <motion.label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-lg cursor-pointer hover:border-purple-500 transition mb-6"
        >
          <UploadCloud className="w-8 h-8 text-purple-500 mb-2" />
          <p className="text-sm text-gray-500">
            Click to browse CSV files
          </p>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
            className="hidden"
          />
        </motion.label>
        {csvFile && (
          <motion.p
            className="text-sm text-gray-600 mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Selected File: <strong>{csvFile.name}</strong>
          </motion.p>
        )}

        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Meeting Topic
          </label>
          <input
            type="text"
            value={meetingTopic}
            onChange={(e) => setMeetingTopic(e.target.value)}
            placeholder="Enter the topic of your meeting"
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brief Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Provide a brief description of the meeting agenda"
            className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </motion.div>

        <motion.button
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md transition focus:outline-none hover:bg-[#7c3aed] cursor-pointer"
          onClick={handleContinue}
        >
          Continue
        </motion.button>
        <div className="bottom-3 left-0 w-full flex justify-between items-center px-10 text-xs text-gray-400 absolute">
          <span>©2025 Commetrix. All rights reserved.</span>
          <span>{currentDate} | {currentTime}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default UploadCsv;