import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar, chatHistory, setActiveChat, activeChat, updateChatTitle, deleteChat }) => {
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, chatId: null });

  const handleEditSave = (chatId) => {
    if (editingTitle.trim()) {
      updateChatTitle(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleEditCancel = () => {
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleKeyPress = (e, chatId) => {
    if (e.key === 'Enter') {
      handleEditSave(chatId);
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const handleDeleteChat = async (chat, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${chat.title}"?`)) {
      if (deleteChat) {
        await deleteChat(chat.id);
      }
    }
  };

  const handleRightClick = (e, chat) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      chatId: chat.id,
      chatTitle: chat.title
    });
  };

  const handleContextMenuAction = (action, chatId, chatTitle) => {
    setContextMenu({ show: false, x: 0, y: 0, chatId: null });
    
    if (action === 'rename') {
      setEditingChatId(chatId);
      setEditingTitle(chatTitle);
    } else if (action === 'delete') {
      const chat = chatHistory.find(c => c.id === chatId);
      if (chat) {
        handleDeleteChat(chat, { stopPropagation: () => {} });
      }
    }
  };

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.show) {
        setContextMenu({ show: false, x: 0, y: 0, chatId: null });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu.show]);

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
              onContextMenu={(e) => handleRightClick(e, chat)}
            >
              {editingChatId === chat.id ? (
                <div className="edit-chat-container">
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleEditSave(chat.id)}
                    onKeyDown={(e) => handleKeyPress(e, chat.id)}
                    className="edit-chat-input"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <span className="chat-title">
                  {chat.file ? '📎 ' : ''}
                  {chat.title}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Context Menu */}
      {contextMenu.show && (
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000
          }}
        >
          <div 
            className="context-menu-item"
            onClick={() => handleContextMenuAction('rename', contextMenu.chatId, contextMenu.chatTitle)}
          >
            Rename
          </div>
          <div 
            className="context-menu-item delete"
            onClick={() => handleContextMenuAction('delete', contextMenu.chatId, contextMenu.chatTitle)}
          >
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;