import React, { useState, useEffect, useCallback } from 'react';
import '../App.css';
import Header from './Header';
import Sidebar from './Sidebar';
import FileViewer from './FileViewer';
import Chat from './Chat';
import TextRevealLetters from './ui/TextRevealLetters';
import aiService from '../services/aiService';
import chatService from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Create default chat for new users or when loading fails
  const createDefaultChat = useCallback(async () => {
    if (!user) return null;
    
    try {
      const newChat = await chatService.createChat(user.id, 'Welcome Chat');
      if (newChat) {
        return {
          ...newChat,
          messages: []
        };
      }
    } catch (error) {
      console.error('Error creating default chat:', error);
    }
    return null;
  }, [user]);

  // Load user's chats from database when component mounts
  useEffect(() => {
    const loadUserChats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const dbChats = await chatService.getUserChats(user.id);
        const formattedChats = await chatService.formatChatsForUI(dbChats);
        
        setChatHistory(formattedChats);
        
        // Set the most recent chat as active if available
        if (formattedChats.length > 0) {
          setActiveChat(formattedChats[0].id);
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        // Create a default chat if loading fails
        const defaultChat = await createDefaultChat();
        if (defaultChat) {
          setChatHistory([defaultChat]);
          setActiveChat(defaultChat.id);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserChats();
  }, [user, createDefaultChat]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const addToChatHistory = async (title) => {
    if (!user) return null;

    try {
      const newChat = await chatService.createChat(user.id, title || `Chat ${chatHistory.length + 1}`);
      if (newChat) {
        const chatWithMessages = {
          ...newChat,
          messages: []
        };
        setChatHistory(prevHistory => [chatWithMessages, ...prevHistory]);
        setActiveChat(newChat.id);
        return newChat.id;
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
    return null;
  };

  const handleFileUpload = async (file) => {
    setActiveFile(file);

    try {
      // Save file to database
      if (user) {
        await chatService.saveFile(user.id, file);
      }

      // Process and embed the document with the RAG service
      await aiService.processAndEmbedDocument(file);
    } catch (error) {
      console.error("Error processing document:", error);
    }
    
    // Check if there's an existing chat without messages
    const emptyChat = chatHistory.find(chat => chat.messages.length === 0);
    
    if (emptyChat) {
      // Update the existing empty chat with the file name
      const newTitle = `Chat about ${file.name}`;
      if (user) {
        await chatService.updateChatTitle(emptyChat.id, newTitle);
      }
      
      const updatedHistory = chatHistory.map(chat => 
        chat.id === emptyChat.id 
          ? { ...chat, title: newTitle }
          : chat
      );
      setChatHistory(updatedHistory);
      setActiveChat(emptyChat.id);
    } else {
      // Create new chat only if no empty chat exists
      addToChatHistory(`Chat about ${file.name}`);
    }
  };
    
  async function deleteChat(chatId) {
    try {
      if (user) {
        await chatService.deleteChat(chatId);
      }

      setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));

      if (activeChat === chatId) {
        const remainingChats = chatHistory.filter(chat => chat.id !== chatId);
        setActiveChat(remainingChats.length > 0 ? remainingChats[0].id : null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }

  const updateChatTitle = async (chatId, newTitle) => {
    if (user) {
      const success = await chatService.updateChatTitle(chatId, newTitle);
      if (!success) {
        console.error('Failed to update chat title in database');
        return;
      }
    }

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

  if (isLoading) {
    return (
      <div className="app">
        <div className="app-header">
          <Header />
        </div>
        <div className="main-row" style={{ justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <div>Loading your chats...</div>
        </div>
      </div>
    );
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
          deleteChat={deleteChat}

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
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;