import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, chatHistory, setActiveChat, activeChat }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button onClick={toggleSidebar} className="toggle-btn">
          {isOpen ? '◄' : '►'}
        </button>
        {isOpen && <h3>Chat History</h3>}
      </div>
      {isOpen && (
        <div className="chat-history">
          {chatHistory.map(chat => (
            <div 
              key={chat.id} 
              className={`chat-item ${activeChat === chat.id ? 'active' : ''}`}
              onClick={() => setActiveChat(chat.id)}
            >
              {chat.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;