import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';
import aiService from '../services/aiService';
import chatService from '../services/chatService';
import ModelSelector from './ui/ModelSelector';

const Chat = ({ activeChat, chatHistory, setChatHistory, addToChatHistory, file, user }) => {
  const [message, setMessage] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const messagesEndRef = useRef(null);
  
  const currentChat = chatHistory.find(chat => chat.id === activeChat) || 
    (chatHistory.length > 0 ? chatHistory[0] : null);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleModelChange = (modelId) => {
    setSelectedModel(modelId);
    if (aiService) {
      aiService.setModel(modelId);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSend();
  };

  const handleSend = async () => {
    if (!message.trim() || isAITyping) return;

    let targetChatId = activeChat;
    // If there's no active chat, create a new one.
    if (!targetChatId) {
      targetChatId = await addToChatHistory('New Chat');
      if (!targetChatId) {
        console.error('Failed to create new chat');
        return;
      }
    }

    const userMessage = message;
    setMessage('');
    setIsAITyping(true);

    // Create temporary message for immediate UI update
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      text: userMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    // Update UI immediately
    setChatHistory(prevHistory => {
      return prevHistory.map(chat => {
        if (chat.id === targetChatId) {
          return { ...chat, messages: [...chat.messages, tempUserMessage] };
        }
        return chat;
      });
    });

    try {
      // Save user message to database
      let savedUserMessage = null;
      if (user) {
        savedUserMessage = await chatService.saveMessage(
          targetChatId, 
          user.id, 
          userMessage, 
          'user'
        );
      }

      // Replace temp message with saved message
      if (savedUserMessage) {
        setChatHistory(prevHistory => {
          return prevHistory.map(chat => {
            if (chat.id === targetChatId) {
              const updatedMessages = chat.messages.map(msg => 
                msg.id === tempUserMessage.id ? savedUserMessage : msg
              );
              return { ...chat, messages: updatedMessages };
            }
            return chat;
          });
        });
      }

      // Get AI response
      const currentMessages = chatHistory.find(chat => chat.id === targetChatId)?.messages || [];
      const aiResponseText = await aiService.getRAGAnswer(userMessage, currentMessages);
      
      const aiMetadata = {
        model: aiService.isConfigured() ? 'Gemini (RAG)' : 'Simulated'
      };

      // Save AI message to database
      let savedAiMessage = null;
      if (user) {
        savedAiMessage = await chatService.saveMessage(
          targetChatId,
          user.id,
          aiResponseText,
          'assistant',
          aiMetadata
        );
      }

      // Create fallback AI message if database save fails
      const aiMessage = savedAiMessage || {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
        model: aiMetadata.model
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
      
      const errorMetadata = {
        error: true,
        model: 'Error'
      };

      // Save error message to database
      let savedErrorMessage = null;
      if (user) {
        try {
          savedErrorMessage = await chatService.saveMessage(
            targetChatId,
            user.id,
            "Sorry, I encountered an error. It might be related to the AI service or API key. Please check the console for details.",
            'assistant',
            errorMetadata
          );
        } catch (dbError) {
          console.error('Error saving error message to database:', dbError);
        }
      }

      const errorMessage = savedErrorMessage || {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. It might be related to the AI service or API key. Please check the console for details.",
        sender: 'assistant',
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
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
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