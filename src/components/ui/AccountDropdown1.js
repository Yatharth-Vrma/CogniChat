import React, { useEffect, useRef, useState } from "react";
import "./AccountDropdown1.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AccountDropdown1() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="profile-dropdown-container">
      <button
        ref={trigger}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="profile-trigger"
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
      >
        <img
          src="https://cdn.tailgrids.com/assets/images/core-components/account-dropdowns/image-1.jpg"
          alt="Profile"
          className="profile-avatar"
        />
      </button>
      
      <div
        ref={dropdown}
        className={`profile-dropdown-menu ${dropdownOpen ? "show" : ""}`}
        tabIndex={-1}
      >
        <div className="profile-info">
          <img
            src="https://cdn.tailgrids.com/assets/images/core-components/account-dropdowns/image-1.jpg"
            alt="Profile"
            className="profile-avatar-large"
          />
          <div className="profile-details">
            <p className="profile-name">{user?.user_metadata?.full_name || 'User'}</p>
            <p className="profile-email">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        
        <div className="profile-actions">
          <button className="profile-action-btn">
            View Profile
          </button>
          <button className="profile-action-btn">
            Settings
          </button>
          <button className="profile-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}