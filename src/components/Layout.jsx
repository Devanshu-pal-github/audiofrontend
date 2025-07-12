import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen min-w-screen h-screen w-screen bg-gray-50 overflow-hidden">
            <Navbar />
            <Sidebar />
            <main
                className="pt-14 px-6 pb-4 bg-gray-50 min-h-[calc(100vh-48px)] h-[calc(100vh-48px)] ml-48 flex flex-col"
                style={{ height: 'calc(100vh)', minHeight: 'calc(100vh - 48px)', overflow: 'hidden' }}
            >
                {children}
            </main>
        </div>
    );
};

export default Layout;
