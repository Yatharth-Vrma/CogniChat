import { supabase } from '../lib/supabase';

const chatService = {
  // Create a new chat session
  async createChat(userId, title = 'New Chat') {
    try {
      const { data, error } = await supabase
        .from('chats')
        .insert([
          {
            user_id: userId,
            title: title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  // Get all chats for a user
  async getUserChats(userId) {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          messages (
            id,
            content,
            role,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user chats:', error);
      throw error;
    }
  },

  // Save a message to a chat
  async saveMessage(chatId, content, role = 'user', metadata = null) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            chat_id: chatId,
            content: content,
            role: role,
            metadata: metadata,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Update chat's updated_at timestamp
      await this.updateChatTimestamp(chatId);

      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  },

  // Update chat timestamp
  async updateChatTimestamp(chatId) {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating chat timestamp:', error);
    }
  },

  // Update chat title
  async updateChatTitle(chatId, newTitle) {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ 
          title: newTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating chat title:', error);
      return false;
    }
  },

  // Delete a chat and its messages
  async deleteChat(chatId) {
    try {
      // First delete all messages in the chat
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);

      if (messagesError) throw messagesError;

      // Then delete the chat
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (chatError) throw chatError;
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  },

  // Save file information
  async saveFile(userId, file) {
    try {
      const { data, error } = await supabase
        .from('files')
        .insert([
          {
            user_id: userId,
            name: file.name,
            type: file.type,
            size: file.size,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving file:', error);
      throw error;
    }
  },

  // Get messages for a specific chat
  async getChatMessages(chatId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      throw error;
    }
  },

  // Format chats for UI display
  async formatChatsForUI(dbChats) {
    return dbChats.map(chat => ({
      id: chat.id,
      title: chat.title,
      messages: (chat.messages || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.created_at
      })),
      created_at: chat.created_at,
      updated_at: chat.updated_at
    }));
  }
};

export default chatService;