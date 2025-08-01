import React from 'react';
import './ai-message.css';

// AI Message Container
export const AIMessage = ({ children, className = '', ...props }) => {
  return (
    <div className={`group ${className}`} {...props}>
      {children}
    </div>
  );
};

// AI Message Content
export const AIMessageContent = ({ children, className = '', ...props }) => {
  return (
    <div className={`ai-message-content ${className}`} {...props}>
      {children}
    </div>
  );
};

// AI Message Avatar
export const AIMessageAvatar = ({ children, className = '', src, alt = "Avatar", ...props }) => {
  return (
    <div className={`ai-avatar ${className}`} {...props}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        children || "AI"
      )}
    </div>
  );
};

// Default export for backward compatibility
export default AIMessage;
