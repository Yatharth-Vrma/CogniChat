import { supabase } from '../lib/supabase';

class ChatService {
  constructor() {
    this.localStorageKey = 'cognichats_history';
  }

  // Get all chats for the current user (from localStorage for now)
  async getUserChats(userId) {
    try {
      const stored = localStorage.getItem(`${this.localStorageKey}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      return [];
    } catch (error) {
      console.error('Error fetching chats from localStorage:', error);
      return [];
    }
  }

  // Get all messages for a specific chat (already stored with chat)
  async getChatMessages(chatId) {
    // Messages are stored with the chat object in this simplified version
    return [];
  }

  // Create a new chat and store locally
  async createChat(userId, title, fileId = null) {
    try {
      const newChat = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        title: title,
        file_id: fileId,
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Get existing chats
      const existingChats = await this.getUserChats(userId);
      const updatedChats = [newChat, ...existingChats];
      
      // Save to localStorage
      localStorage.setItem(`${this.localStorageKey}_${userId}`, JSON.stringify(updatedChats));

      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    }
  }

  // Save a message to the chat (store locally)
  async saveMessage(chatId, userId, content, role, metadata = {}) {
    try {
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chat_id: chatId,
        user_id: userId,
        content: content,
        role: role, // 'user' or 'assistant'
        metadata: metadata,
        created_at: new Date().toISOString()
      };

      // Get existing chats
      const existingChats = await this.getUserChats(userId);
      
      // Find and update the specific chat
      const updatedChats = existingChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [...(chat.messages || []), {
              id: message.id,
              text: message.content,
              sender: message.role,
              timestamp: new Date(message.created_at).toLocaleTimeString(),
              model: metadata.model || null,
              error: metadata.error || false
            }],
            updated_at: new Date().toISOString()
          };
        }
        return chat;
      });

      // Save updated chats
      localStorage.setItem(`${this.localStorageKey}_${userId}`, JSON.stringify(updatedChats));

      return {
        id: message.id,
        text: message.content,
        sender: message.role,
        timestamp: new Date(message.created_at).toLocaleTimeString(),
        model: metadata.model || null,
        error: metadata.error || false
      };
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }

  // Update chat timestamp
  async updateChatTimestamp(chatId) {
    // This is handled automatically in saveMessage
    return true;
  }

  // Update chat title
  async updateChatTitle(chatId, newTitle) {
    try {
      // We need to get the user ID from somewhere - let's try from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const existingChats = await this.getUserChats(user.id);
      const updatedChats = existingChats.map(chat => 
        chat.id === chatId 
          ? { ...chat, title: newTitle, updated_at: new Date().toISOString() }
          : chat
      );

      localStorage.setItem(`${this.localStorageKey}_${user.id}`, JSON.stringify(updatedChats));
      return true;
    } catch (error) {
      console.error('Error updating chat title:', error);
      return false;
    }
  }

  // Delete a chat
  async deleteChat(chatId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const existingChats = await this.getUserChats(user.id);
      const updatedChats = existingChats.filter(chat => chat.id !== chatId);
      
      localStorage.setItem(`${this.localStorageKey}_${user.id}`, JSON.stringify(updatedChats));
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }

  // Save uploaded file (simplified - just return file info)
  async saveFile(userId, file, content = null) {
    try {
      // For now, just return file metadata without saving to database
      return {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        content: content,
        created_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error saving file:', error);
      return null;
    }
  }

  // Get file details (simplified)
  async getFile(fileId) {
    // For now, return null since we're not storing files in database
    return null;
  }

  // Transform chats for UI (they're already in the right format)
  async formatChatsForUI(chats) {
    return chats.map(chat => ({
      ...chat,
      messages: chat.messages || []
    }));
  }

  // Clear all local data (useful for testing)
  clearLocalData(userId) {
    localStorage.removeItem(`${this.localStorageKey}_${userId}`);
  }
}

export default new ChatService();
