import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaHome,
  FaLeaf,
  FaCalendarAlt,
  FaSignOutAlt,
  FaTimes,
  FaUserCircle,
  FaUserAlt,
  FaCloud,
} from "react-icons/fa";
import { GiFarmTractor } from "react-icons/gi";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { pathname } = useLocation();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: FaHome },
    { name: "My Farms", path: "/farms", icon: FaLeaf },
    { name: "Schedules", path: "/schedules", icon: FaCalendarAlt },
    { name: "My Profile", path: "/profile", icon: FaUserAlt },
    { name: "Weather", path: "/weather", icon: FaCloud },
    // Add more protected links here later (e.g., Weather, Settings)
  ];

  return (
    <>
      {/* Mobile Overlay (Darkens background when sidebar is open) */}
      <div
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Container */}
      <div
        className={`
        fixed top-0 left-0 z-30 h-screen w-64 bg-white border-r border-gray-100 shadow-xl lg:shadow-none
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:block
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* 1. Logo Area */}
        <div className="flex items-center justify-between h-20 px-8 border-b border-gray-100">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-2xl tracking-tight">
            <GiFarmTractor className="text-3xl" />
            <span>CropSense</span>
          </div>
          {/* Close Button (Mobile Only) */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-500 hover:text-emerald-600"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* 2. Navigation Links */}
        <nav className="p-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => toggleSidebar(false)} // Close sidebar on mobile when clicked
                className={`
                  flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 shadow-sm font-bold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-emerald-600 font-medium"
                  }
                `}
              >
                <item.icon
                  className={`text-xl ${isActive ? "text-emerald-600" : "text-gray-400 group-hover:text-emerald-500"}`}
                />
                <span>{item.name}</span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* 3. User Profile & Logout (Sticks to bottom) */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
              {user?.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <FaUserCircle />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-700 truncate">
                {user?.name || "Farmer"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-500 bg-white border border-red-100 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
