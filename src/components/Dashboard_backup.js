import React, { useState, useEffect } from 'react';
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
  const { user } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  

  // Load user's chats when component mounts
  useEffect(() => {
    const loadChats = async () => {
      if (user) {
        setIsLoadingChats(true);
        try {
          const userChats = await chatService.loadUserChats(user.id);
          if (userChats.length > 0) {
            setChatHistory(userChats);
            setActiveChat(userChats[0].id);
            // If the first chat has a file, set it as active
            if (userChats[0].file) {
              setActiveFile(userChats[0].file);
            }
          } else {
            // Create a default welcome chat if no chats exist
            const defaultChat = {
              id: `temp-${Date.now()}`,
              title: 'Welcome Chat',
              messages: [],
              isTemporary: true
            };
            setChatHistory([defaultChat]);
            setActiveChat(defaultChat.id);
          }
        } catch (error) {
          console.error('Error loading chats:', error);
          // Fallback to default chat
          const defaultChat = {
            id: `temp-${Date.now()}`,
            title: 'Welcome Chat',
            messages: [],
            isTemporary: true
          };
          setChatHistory([defaultChat]);
          setActiveChat(defaultChat.id);
        } finally {
          setIsLoadingChats(false);
        }
      }
    };

    loadChats();
  }, [user]);

  // Update active file when switching chats
  useEffect(() => {
    if (activeChat && chatHistory.length > 0) {
      const currentChat = chatHistory.find(chat => chat.id === activeChat);
      if (currentChat?.file) {
        setActiveFile(currentChat.file);
      } else if (!currentChat?.file && activeFile) {
        // Only clear active file if the new chat doesn't have a file 
        // and we're not in the middle of uploading a new file
        setActiveFile(null);
      }
    }
  }, [activeChat, chatHistory, activeFile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const addToChatHistory = async (title, shouldClearFile = true) => {
    if (!user) return null;

    const newChat = {
      id: `temp-${Date.now()}`, // Temporary ID until saved to DB
      title: title || `Chat ${chatHistory.length + 1}`,
      messages: [],
      isTemporary: true
    };
    
    setChatHistory(prevHistory => [newChat, ...prevHistory]);
    setActiveChat(newChat.id);
    
    // Clear the active file when starting a truly new chat (not file-based)
    if (shouldClearFile && !title?.includes('Chat about')) {
      setActiveFile(null);
    }
    
    // Save to database in the background
    try {
      const chatData = {
        title: newChat.title,
        file: shouldClearFile ? null : activeFile
      };
      
      const savedChatId = await chatService.saveChat(user.id, chatData);
      
      // Update the chat with the real ID from database
      setChatHistory(prevHistory => 
        prevHistory.map(chat => 
          chat.id === newChat.id 
            ? { ...chat, id: savedChatId, isTemporary: false }
            : chat
        )
      );
      setActiveChat(savedChatId);
      
      return savedChatId;
    } catch (error) {
      console.error('Error saving chat:', error);
      return newChat.id; // Return temp ID if save fails
    }
  };

  const handleFileUpload = async (file) => {
    setActiveFile(file);

    try {
      // New: Process and embed the document with the RAG service
      await aiService.processAndEmbedDocument(file);
    } catch (error) {
      console.error("Error processing document:", error);
      // Optionally, display an error message to the user
    }
    
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

  const updateChatTitle = async (chatId, newTitle) => {
    // Update local state immediately
    setChatHistory(prevHistory => 
      prevHistory.map(chat => 
        chat.id === chatId 
          ? { ...chat, title: newTitle }
          : chat
      )
    );

    // Save to database if it's not a temporary chat
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat && !chat.isTemporary && user) {
      try {
        await chatService.updateChatTitle(chatId, newTitle);
      } catch (error) {
        console.error('Error updating chat title in database:', error);
      }
    }
  };

  const deleteChat = async (chatId) => {
    try {
      // If it's not a temporary chat, delete from database
      const chat = chatHistory.find(c => c.id === chatId);
      if (chat && !chat.isTemporary && user) {
        await chatService.deleteChat(chatId);
      }

      // Remove from local state
      const newChatHistory = chatHistory.filter(chat => chat.id !== chatId);
      setChatHistory(newChatHistory);

      // If we're deleting the active chat, switch to another one
      if (activeChat === chatId) {
        if (newChatHistory.length > 0) {
          setActiveChat(newChatHistory[0].id);
          // Set file if the new active chat has one
          if (newChatHistory[0].file) {
            setActiveFile(newChatHistory[0].file);
          } else {
            setActiveFile(null);
          }
        } else {
          // No chats left, create a new default one
          setActiveChat(null);
          setActiveFile(null);
          await addToChatHistory('Welcome Chat');
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
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
          deleteChat={deleteChat}
        />
        <div className="main-content">
          <div className="file-section">
            <FileViewer 
              onFileUpload={handleFileUpload} 
              file={activeFile} 
              onFileRemove={() => setActiveFile(null)}
            />
          </div>
          <div className="chat-section">
            <Chat 
              activeChat={activeChat} 
              chatHistory={chatHistory} 
              setChatHistory={setChatHistory}
              addToChatHistory={addToChatHistory}
              file={activeFile}
              onClearFile={() => setActiveFile(null)}
              user={user}
              isLoadingChats={isLoadingChats}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
