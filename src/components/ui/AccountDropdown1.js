import React, { useEffect, useRef, useState } from "react";
import "./AccountDropdown1.css"; // Create this for custom styles

export default function AccountDropdown1() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const trigger = useRef(null);
  const dropdown = useRef(null);

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
          alt="account"
          className="profile-avatar"
        />
        <span className="profile-trigger-label">Account</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`profile-chevron ${dropdownOpen ? "open" : ""}`}
        >
          <path
            d="M10 14.25C9.8125 14.25 9.65625 14.1875 9.5 14.0625L2.3125 7C2.03125 6.71875 2.03125 6.28125 2.3125 6C2.59375 5.71875 3.03125 5.71875 3.3125 6L10 12.5312L16.6875 5.9375C16.9688 5.65625 17.4062 5.65625 17.6875 5.9375C17.9688 6.21875 17.9688 6.65625 17.6875 6.9375L10.5 14C10.3437 14.1562 10.1875 14.25 10 14.25Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <div
        ref={dropdown}
        className={`profile-dropdown-menu ${dropdownOpen ? "show" : ""}`}
        tabIndex={-1}
      >
        <div className="profile-info">
          <img
            src="https://cdn.tailgrids.com/assets/images/core-components/account-dropdowns/image-1.jpg"
            alt="account"
            className="profile-avatar-large"
          />
          <div>
            <p className="profile-name">Andrio Miller</p>
            <p className="profile-email">miller@company.com</p>
          </div>
        </div>
        <div className="profile-dropdown-links">
          <a href="#profile">View profile</a>
          <a href="#settings">Settings</a>

        </div>
        <div>
          <button className="profile-logout">Log out</button>
        </div>
      </div>
    </div>
  );
}