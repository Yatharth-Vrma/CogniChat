import React, { useState } from 'react';
import { ChevronsUpDown, Bell, Settings as SettingsIcon } from 'lucide-react';
import ThemeToggleButton from './ui/theme-toggle-button';
import AccountDropdown1 from "./ui/AccountDropdown1";
import Settings from './Settings';

// Simple Logo component
const Logo = () => (
  <div className="flex items-center gap-2">
    <span className="font-semibold text-foreground">CogniChat</span>
  </div>
);

// Simple Notification Menu
const NotificationMenu = () => (
  <button className="p-3 hover:bg-accent rounded-md transition-colors">
    <Bell size={20} className="text-muted-foreground hover:text-foreground" />
  </button>
);

// Settings Menu
const SettingsMenu = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="p-3 hover:bg-accent rounded-md transition-colors"
    title="Settings"
  >
    <SettingsIcon size={20} className="text-muted-foreground hover:text-foreground" />
  </button>
);

// Simple User Menu
const UserMenu = () => <AccountDropdown1 />;

// Simple Select component
const SelectTrigger = ({ children, className }) => (
  <button className={`flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent rounded-md transition-colors ${className}`}>
    {children}
  </button>
);

const SelectValue = ({ placeholder }) => (
  <span className="text-foreground">{placeholder}</span>
);

export default function Header() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="border-b border-border bg-background px-4 md:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            <nav className="flex items-center space-x-2 text-sm">
              <button className="text-foreground hover:text-primary transition-colors">
                <Logo />
              </button>
              <span className="text-muted-foreground">/</span>
              <button className="text-muted-foreground hover:text-foreground transition-colors hidden md:inline">
                Personal Account
              </button>
              <span className="text-muted-foreground hidden md:inline">/</span>
              <button className="text-muted-foreground hover:text-foreground transition-colors hidden md:inline">
                Projects
              </button>
              <span className="text-muted-foreground">/</span>
              <SelectTrigger className="focus-visible:bg-accent text-foreground h-8 px-1.5 focus-visible:ring-0">
                <SelectValue placeholder="Main project" />
                <ChevronsUpDown size={14} className="text-muted-foreground" />
              </SelectTrigger>
            </nav>
          </div>

          {/* Right side - Added settings */}
          <div className="flex items-center gap-4">
            <ThemeToggleButton 
              variant="gif"
              url="https://media.giphy.com/media/5PncuvcXbBuIZcSiQo/giphy.gif?cid=ecf05e47j7vdjtytp3fu84rslaivdun4zvfhej6wlvl6qqsz&ep=v1_stickers_search&rid=giphy.gif&ct=s"
            />
            <NotificationMenu />
            <SettingsMenu onClick={() => setShowSettings(true)} />
            <UserMenu />
          </div>
        </div>
      </header>
      
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </>
  );
}