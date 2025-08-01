import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const Chat = ({ activeChat, chatHistory, setChatHistory, addToChatHistory, file }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const currentChat = chatHistory.find(chat => chat.id === activeChat) || 
    (chatHistory.length > 0 ? chatHistory[0] : null);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    const updatedHistory = chatHistory.map(chat => {
      if (chat.id === activeChat) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    });

    setChatHistory(updatedHistory);
    setMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: `I received your message about "${message}". This is a simulated response.`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };

      setChatHistory(prevHistory => 
        prevHistory.map(chat => {
          if (chat.id === activeChat) {
            return {
              ...chat,
              messages: [...chat.messages, aiResponse]
            };
          }
          return chat;
        })
      );
    }, 1000);
  };

  const startNewChat = () => {
    addToChatHistory(file ? `Chat about ${file.name}` : 'New Chat');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{currentChat?.title || 'Start a new chat'}</h3>
        <button onClick={startNewChat} className="new-chat-btn">
          New Chat
        </button>
      </div>
      
      <div className="chat-window">
        {currentChat?.messages.length > 0 ? (
          currentChat.messages.map(msg => (
            <div key={msg.id} className="message-row">
              <div className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                <div className="message-text">{msg.text}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-chat">
            <p>No messages yet. Start a conversation!</p>
            {file && <p>You can ask questions about the uploaded file: {file.name}</p>}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;