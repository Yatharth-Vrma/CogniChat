import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileViewer from './components/FileViewer';
import Chat from './components/Chat';
import TextRevealLetters from './components/ui/TextRevealLetters';
import { ThemeProvider } from './components/ui/theme-provider';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

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
    return (
      <ThemeProvider defaultTheme="dark" storageKey="mvpblocks-theme">
        <TextRevealLetters onFinish={() => setShowSplash(false)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="mvpblocks-theme">
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
    </ThemeProvider>
  );
}

export default App;