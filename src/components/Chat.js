import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import aiService from '../services/aiService';

const Chat = ({ activeChat, chatHistory, setChatHistory, addToChatHistory, file }) => {
  const [message, setMessage] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const currentChat = chatHistory.find(chat => chat.id === activeChat) || 
    (chatHistory.length > 0 ? chatHistory[0] : null);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!message.trim() || isAITyping) return;

    let targetChatId = activeChat;
    // If there's no active chat, create a new one.
    if (!targetChatId) {
      targetChatId = addToChatHistory('New Chat');
    }

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory(prevHistory => {
      return prevHistory.map(chat => {
        if (chat.id === targetChatId) {
          return { ...chat, messages: [...chat.messages, newMessage] };
        }
        return chat;
      });
    });

    const userMessage = message;
    setMessage('');
    setIsAITyping(true);

    try {
      const currentMessages = chatHistory.find(chat => chat.id === targetChatId)?.messages || [];
      const aiResponseText = await aiService.getRAGAnswer(userMessage, currentMessages);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        model: aiService.isConfigured() ? 'Gemini (RAG)' : 'Simulated'
      };

      setChatHistory(prevHistory => 
        prevHistory.map(chat => {
          if (chat.id === targetChatId) {
            return { ...chat, messages: [...chat.messages, aiMessage] };
          }
          return chat;
        })
      );
    } catch (error) {
      console.error('Error getting RAG AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. It might be related to the AI service or API key. Please check the console for details.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        error: true
      };
      setChatHistory(prevHistory => 
        prevHistory.map(chat => {
          if (chat.id === targetChatId) {
            return { ...chat, messages: [...chat.messages, errorMessage] };
          }
          return chat;
        })
      );
    } finally {
      setIsAITyping(false);
    }
  };

  const startNewChat = () => {
    addToChatHistory(file ? `Chat about ${file.name}` : 'New Chat');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{currentChat?.title || 'Start a new chat'}</h3>
        <button 
          type="button"  // Explicitly set button type
          onClick={startNewChat} 
          className="new-chat-btn"
        >
          New Chat
        </button>
      </div>
      
      <div className="chat-window">
        {currentChat?.messages.length > 0 ? (
          <>
            {currentChat.messages.map(msg => (
              <div key={msg.id} className="message-row">
                <div className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'} ${msg.error ? 'error-message' : ''}`}>
                  <div className="message-text">
                    {msg.text}
                  </div>
                  {msg.model && (
                    <div className="message-meta">
                      <span className="model-badge">{msg.model}</span>
                      <span className="timestamp">{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isAITyping && (
              <div className="message-row">
                <div className="bot-message typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <div className="typing-text">AI is thinking...</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="empty-chat">
            <h3>Welcome to CogniChat! 🤖</h3>
            <p>Start a conversation with our AI assistant</p>
            {file && (
              <div className="file-context">
                <p>📄 <strong>File loaded:</strong> {file.name}</p>
                <p>Ask me anything about this file!</p>
              </div>
            )}
            <div className="suggestions">
              <h4>Try asking:</h4>
              <div className="suggestion-chips">
                <button 
                  className="suggestion-chip" 
                  onClick={() => setMessage("What can you help me with?")}
                >
                  What can you help me with?
                </button>
                {file && (
                  <button 
                    className="suggestion-chip" 
                    onClick={() => setMessage(`Summarize this ${file.type.includes('pdf') ? 'PDF' : 'document'}`)}
                  >
                    Summarize this {file.type.includes('pdf') ? 'PDF' : 'document'}
                  </button>
                )}
                <button 
                  className="suggestion-chip" 
                  onClick={() => setMessage("How does AI work?")}
                >
                  How does AI work?
                </button>
              </div>
            </div>
            <div className="ai-status">
              <span className={`status-indicator ${aiService.isConfigured() ? 'online' : 'offline'}`}></span>
              AI Status: {aiService.getModelInfo()}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="message-form">
        <div className="input-container">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={isAITyping ? "AI is thinking..." : "Type your message here..."}
            autoComplete="off"
            disabled={isAITyping}
          />
          <button 
            type="submit"
            disabled={!message.trim() || isAITyping}
            className={isAITyping ? 'loading' : ''}
          >
            {isAITyping ? '⏳' : '📤'}
          </button>
        </div>
        {file && (
          <div className="file-context-indicator">
            📎 {file.name} is available for analysis
          </div>
        )}
      </form>
    </div>
  );
};

export default Chat;