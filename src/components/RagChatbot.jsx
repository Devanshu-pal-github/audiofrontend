import React, { useState, useRef } from "react";
import { Upload, Send, FileText, MessageCircle } from "lucide-react";

const RagChatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [uploadName, setUploadName] = useState("");
  const fileInputRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((msgs) => [
      ...msgs,
      { sender: "user", text: input },
      { sender: "bot", text: "(RAG response placeholder)" },
    ]);
    setInput("");
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/json") {
      setUploadName(file.name);
      setMessages((msgs) => [
        ...msgs,
        { sender: "user", text: `Uploaded JSON: ${file.name}` },
        { sender: "bot", text: "(RAG response for uploaded JSON placeholder)" },
      ]);
    } else {
      setUploadName("");
      alert("Please upload a valid JSON file.");
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg flex flex-col h-[600px] w-full max-w-[420px] min-w-[320px] p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
        <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
          <MessageCircle size={22} className="text-blue-500" />
          RAG Chatbot
        </div>
        <FileText size={20} className="text-gray-400" />
      </div>
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3 bg-white">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-lg text-sm shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-50 text-blue-900 border border-blue-100"
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      {/* Input Area */}
      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 flex items-center gap-2 rounded-b-xl">
        <button
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 border border-gray-200 transition"
          onClick={() => fileInputRef.current.click()}
          title="Upload JSON"
        >
          <Upload size={18} className="text-blue-500" />
        </button>
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          className="hidden"
          onChange={handleUpload}
        />
        {uploadName && (
          <span className="text-xs text-gray-500 mr-2 truncate max-w-[100px]">{uploadName}</span>
        )}
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="p-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition"
          onClick={handleSend}
          title="Send"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default RagChatbot;
