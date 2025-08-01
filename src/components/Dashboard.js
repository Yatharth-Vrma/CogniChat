import React, { useState, useEffect } from 'react';
import '../App.css';
import Header from './Header';
import Sidebar from './Sidebar';
import FileViewer from './FileViewer';
import Chat from './Chat';
import TextRevealLetters from './ui/TextRevealLetters';

function Dashboard() {
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  // Initialize default chat when component mounts
  useEffect(() => {
    if (chatHistory.length === 0) {
      const defaultChat = {
        id: Date.now(),
        title: 'Welcome Chat',
        messages: []
      };
      setChatHistory([defaultChat]);
      setActiveChat(defaultChat.id);
    }
  }, [chatHistory.length]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const addToChatHistory = (title) => {
    const newChat = {
      id: Date.now(),
      title: title || `Chat ${chatHistory.length + 1}`,
      messages: []
    };
    setChatHistory([newChat, ...chatHistory]);
    setActiveChat(newChat.id);
  };

  const handleFileUpload = (file) => {
    setActiveFile(file);
    
    // Check if there's an existing chat without messages
    const emptyChat = chatHistory.find(chat => chat.messages.length === 0);
    
    if (emptyChat) {
      // Update the existing empty chat with the file name
      const updatedHistory = chatHistory.map(chat => 
        chat.id === emptyChat.id 
          ? { ...chat, title: `Chat about ${file.name}` }
          : chat
      );
      setChatHistory(updatedHistory);
      setActiveChat(emptyChat.id);
    } else {
      // Create new chat only if no empty chat exists
      addToChatHistory(`Chat about ${file.name}`);
    }
  };

  const updateChatTitle = (chatId, newTitle) => {
    setChatHistory(prevHistory => 
      prevHistory.map(chat => 
        chat.id === chatId 
          ? { ...chat, title: newTitle }
          : chat
      )
    );
  };

  if (showSplash) {
    return <TextRevealLetters onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="app">
      <div className="app-header">
        <Header />
      </div>
      <div className="main-row">
        <Sidebar 
          isOpen={sidebarOpen} 
          toggleSidebar={toggleSidebar} 
          chatHistory={chatHistory}
          setActiveChat={setActiveChat}
          activeChat={activeChat}
          updateChatTitle={updateChatTitle}
        />
        <div className="main-content">
          <div className="file-section">
            <FileViewer onFileUpload={handleFileUpload} file={activeFile} />
          </div>
          <div className="chat-section">
            <Chat 
              activeChat={activeChat} 
              chatHistory={chatHistory} 
              setChatHistory={setChatHistory}
              addToChatHistory={addToChatHistory}
              file={activeFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;