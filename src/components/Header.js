import React from 'react';
import { ChevronsUpDown, Bell, User } from 'lucide-react';
import ThemeToggleButton from './ui/theme-toggle-button';
import AccountDropdown1 from "./ui/AccountDropdown1"; // Adjust path if needed



// Simple Logo component
const Logo = () => (
  <div className="flex items-center gap-2">
    <span className="font-semibold text-white">CogniChat</span>
  </div>
);

// Simple Notification Menu
const NotificationMenu = () => (
  <button className="p-3 hover:bg-gray-800 rounded-md transition-colors">
    <Bell size={20} className="text-gray-400 hover:text-white" />
  </button>
);

// Simple User Menu
const UserMenu = () => <AccountDropdown1 />;


// Simple Select component
const SelectTrigger = ({ children, className }) => (
  <button className={`flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-800 rounded-md transition-colors ${className}`}>
    {children}
  </button>
);

const SelectValue = ({ placeholder }) => (
  <span className="text-white">{placeholder}</span>
);

export default function Header() {
  return (
    <header className="border-b border-gray-700 bg-black px-4 md:px-6">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2">
          <nav className="flex items-center space-x-2 text-sm">
            <button className="text-white hover:text-pink-500 transition-colors">
              <Logo />
            </button>
            <span className="text-gray-400">/</span>
            <button className="text-gray-400 hover:text-white transition-colors hidden md:inline">
              Personal Account
            </button>
            <span className="text-gray-400 hidden md:inline">/</span>
            <button className="text-gray-400 hover:text-white transition-colors hidden md:inline">
              Projects
            </button>
            <span className="text-gray-400">/</span>
            <SelectTrigger className="focus-visible:bg-gray-800 text-white h-8 px-1.5 focus-visible:ring-0">
              <SelectValue placeholder="Main project" />
              <ChevronsUpDown size={14} className="text-gray-400" />
            </SelectTrigger>
          </nav>
        </div>

        {/* Right side - Added theme toggle and more spacing */}
        <div className="flex items-center gap-4">
          <ThemeToggleButton 
            variant="gif"
            url="https://media.giphy.com/media/5PncuvcXbBuIZcSiQo/giphy.gif?cid=ecf05e47j7vdjtytp3fu84rslaivdun4zvfhej6wlvl6qqsz&ep=v1_stickers_search&rid=giphy.gif&ct=s"
          />
          <NotificationMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
