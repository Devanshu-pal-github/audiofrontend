import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Calendar, Users, Mic } from "lucide-react";
import { useLoginMutation } from "../services/api";
import { decodeJWT } from "../utils/jwt";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [login, { isLoading }] = useLoginMutation();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const result = await login({ username: identifier, password }).unwrap();
            // Store token/role in localStorage
            localStorage.setItem('token', result.access_token);
            localStorage.setItem('role', result.role);
            // No longer saving current quarter id/name/year in localStorage
            // Decode and log the token for debugging
            decodeJWT(result.access_token);
            // Redirect to meeting summary page (admin landing)
            navigate("/admin/meeting-summary");
        } catch (err) {
            setError(err?.data?.detail || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafbfc] px-2">
            <div
                className="w-full max-w-2xl bg-white rounded-xl shadow-md flex flex-col md:flex-row overflow-hidden login-uplift-card transition-all duration-300"
                tabIndex={-1}
            >
            <style>{`
                .login-uplift-card {
                    transition: box-shadow 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.4,0,0.2,1);
                }
                .login-uplift-card:hover, .login-uplift-card:focus-within {
                    box-shadow: 0 8px 32px 0 rgba(80,80,180,0.15), 0 2px 8px 0 rgba(80,80,180,0.10);
                    transform: translateY(-6px) scale(1.02);
                }
            `}</style>
                {/* Left Side */}
                <div className="hidden md:flex flex-col items-center justify-center bg-[#f6f7fb] w-1/2 py-12 px-6">
                    <div className="mb-6">
                        <div className="flex flex-col items-center justify-center mb-3">
                            <div className="relative">
                                <Calendar size={56} strokeWidth={1.5} className="text-[#b3b8f7]" />
                                <Mic size={24} strokeWidth={1.5} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#e3b6e7]" />
                            </div>
                            <Users size={44} strokeWidth={1.5} className="text-[#b3b8f7] mt-3" />
                        </div>
                        <div className="text-xl font-bold text-gray-800 text-center mb-2">Commetrix</div>
                        <div className="text-gray-400 text-center text-sm font-medium">Streamline your team's meetings and boost productivity</div>
                    </div>
                </div>
                {/* Right Side */}
                <div className="flex-1 flex flex-col justify-center px-5 py-8 md:py-12 md:px-8">
                    <div className="mb-6">
                        <div className="text-xl font-bold text-gray-900 mb-2">Welcome Back</div>
                        <div className="text-gray-500 text-sm">Sign in to manage your meetings</div>
                    </div>
                    <form className="w-full max-w-md" onSubmit={handleSubmit}>
                        {error && (
                            <div className="mb-2 text-red-500 text-xs text-center">{error}</div>
                        )}
                        <div className="mb-3">
                            <label className="block text-gray-700 text-xs font-medium mb-1">Email address or Username</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={16} />
                                </span>
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b3b8f7] text-gray-900 bg-white placeholder-gray-400 text-sm"
                                    placeholder="Enter your email or username"
                                    value={identifier}
                                    onChange={e => setIdentifier(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="block text-gray-700 text-xs font-medium mb-1">Password</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={16} />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b3b8f7] text-gray-900 bg-white placeholder-gray-400 text-sm"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 focus:outline-none"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className={`w-full font-medium rounded-md py-2 mt-2 transition text-sm
                                ${identifier && password && !isLoading
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md cursor-pointer'
                                    : 'bg-[#e5e7eb] text-gray-400 cursor-not-allowed'}`}
                            disabled={!identifier || !password || isLoading}
                        >
                            {isLoading ? "Logging in..." : "Login"}
                        </button>
                        <div className="flex justify-center items-center mt-3">
                            <button type="button" className="text-[#7d7d7d] text-xs hover:underline bg-transparent border-none p-0">Forgot password?</button>
                        </div>
                        <div className="text-center text-gray-500 text-xs mt-3">
                            Don't have an account? <a href="#" className="text-[#7d7dff] hover:underline">Create one</a>
                        </div>
                        <div className="border-t border-gray-100 my-4"></div>
                        <div className="text-xs text-gray-400 text-center">
                            Protected by reCAPTCHA and subject to the <a href="#" className="underline">Privacy Policy</a><br />
                            and <a href="#" className="underline">Terms of Service</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
