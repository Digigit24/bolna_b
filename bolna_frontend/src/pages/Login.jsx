import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import hrIllustration from '../assets/hr_login_3d_v2.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white">
      {/* CSS for custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(0.5deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.05); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        .animate-pulse-soft {
          animation: pulse-soft 8s ease-in-out infinite;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}</style>

      {/* Left Section - Branding & Decorative */}
      <div className="hidden md:flex flex-col lg:w-1/2 relative overflow-hidden bg-white items-center justify-center p-8 lg:p-12 border-r border-[#F1F5F9]">
        {/* Subtle Background Glows */}
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-teal-100/30 rounded-full blur-[100px] animate-pulse-soft"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-blue-100/30 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 w-full max-w-xl text-center">
          
          <h1 className="text-[2.75rem] font-bold text-[#0F172A] leading-[1.15] mb-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Smart <span className="text-transparent bg-clip-text bg-linear-to-r from-teal-500 to-blue-600">HR</span> Management
            <br /> System
          </h1>
          
          <p className="text-[1.05rem] text-[#475569] mb-10 max-w-md mx-auto animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            A unified platform for modern recruitment, employee engagement, and data-driven workforce optimization.
          </p>
          
          <div className="relative animate-float">
             <img 
              src={hrIllustration} 
              alt="HR Management Illustration" 
              className="w-full max-w-lg mx-auto select-none pointer-events-none"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
        </div>
      </div>

      {/* Right Section - Login Form Card */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 animate-fadeIn overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo / Brand mark for mobile */}
          <div className="flex md:hidden flex-col items-center mb-10">
            <div className="w-16 h-16 bg-linear-to-tr from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-teal-100 mb-4 animate-float">
               <Lock className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#1E293B]">Bolna HR</h2>
          </div>

          <div className="glass-effect p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100/50">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-[#1E293B] mb-2">Welcome Back</h2>
              <p className="text-[#64748B]">Sign in to continue to your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3 animate-fadeIn">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-5">
                {/* Username Field */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#475569] ml-1">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-teal-500 text-[#94A3B8]">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-11 pr-4 py-4 bg-white/50 border border-[#E2E8F0] rounded-2xl text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-sm font-semibold text-[#475569]">Password</label>
                    <a href="#" className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors">Forgot Password?</a>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-teal-500 text-[#94A3B8]">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="block w-full pl-11 pr-12 py-4 bg-white/50 border border-[#E2E8F0] rounded-2xl text-[#1E293B] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-300"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94A3B8] hover:text-[#475569] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center mb-6">
                <label className="flex items-center cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <div className={`w-5 h-5 border-2 rounded-md transition-all duration-200 ${rememberMe ? 'bg-teal-500 border-teal-500' : 'bg-white border-[#E2E8F0] group-hover:border-teal-200'} flex items-center justify-center`}>
                      {rememberMe && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <span className="ml-3 text-sm text-[#64748B] group-hover:text-[#475569] transition-colors font-medium">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group w-full relative overflow-hidden py-4 px-6 bg-linear-to-r from-teal-500 to-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-teal-100 hover:shadow-teal-200/50 hover:translate-y-[-2px] active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {isLoading ? 'Processing...' : 'Login to Dashboard'}
                  {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </span>
              </button>
              
              <p className="text-center text-sm text-[#94A3B8] mt-8">
                Designated for HR personnel only. <br/>
                <span className="font-semibold text-[#64748B]">Ver. 2.4.0</span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

