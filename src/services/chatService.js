import { supabase } from '../lib/supabase';

class ChatService {
  constructor() {
    this.initialized = false;
  }

  // Load all chats for the current user
  async loadUserChats(userId) {
    try {
      const { data: chats, error } = await supabase
        .from('chats')
        .select(`
          id,
          title,
          file_id,
          created_at,
          updated_at,
          files (
            id,
            filename,
            file_size,
            mime_type,
            content
          ),
          messages (
            id,
            content,
            role,
            metadata,
            created_at
          )
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading chats:', error);
        return [];
      }

      // Transform the data to match the existing chat structure
      const transformedChats = chats.map(chat => ({
        id: chat.id,
        title: chat.title,
        messages: chat.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.role,
          timestamp: new Date(msg.created_at).toLocaleTimeString(),
          metadata: msg.metadata
        })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        file: chat.files ? {
          id: chat.files.id,
          name: chat.files.filename,
          size: chat.files.file_size,
          type: chat.files.mime_type,
          content: chat.files.content
        } : null,
        created_at: chat.created_at,
        updated_at: chat.updated_at
      }));

      return transformedChats;
    } catch (error) {
      console.error('Error in loadUserChats:', error);
      return [];
    }
  }

  // Save a new chat
  async saveChat(userId, chatData) {
    try {
      let fileId = null;

      // If there's a file, save it first
      if (chatData.file) {
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .insert({
            user_id: userId,
            filename: chatData.file.name,
            file_size: chatData.file.size,
            mime_type: chatData.file.type,
            content: chatData.file.content || null
          })
          .select()
          .single();

        if (fileError) {
          console.error('Error saving file:', fileError);
          throw fileError;
        }

        fileId = fileData.id;
      }

      // Save the chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          user_id: userId,
          title: chatData.title,
          file_id: fileId
        })
        .select()
        .single();

      if (chatError) {
        console.error('Error saving chat:', chatError);
        throw chatError;
      }

      return chat.id;
    } catch (error) {
      console.error('Error in saveChat:', error);
      throw error;
    }
  }

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

      if (error) {
        console.error('Error updating chat title:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateChatTitle:', error);
      throw error;
    }
  }

  // Save a message to a chat
  async saveMessage(chatId, userId, messageData) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          user_id: userId,
          content: messageData.text,
          role: messageData.sender,
          metadata: messageData.metadata || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving message:', error);
        throw error;
      }

      // Update chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      return data.id;
    } catch (error) {
      console.error('Error in saveMessage:', error);
      throw error;
    }
  }

  // Delete a chat and all its messages
  async deleteChat(chatId) {
    try {
      // Delete messages first (due to foreign key constraint)
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('chat_id', chatId);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        throw messagesError;
      }

      // Delete the chat
      const { error: chatError } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (chatError) {
        console.error('Error deleting chat:', chatError);
        throw chatError;
      }
    } catch (error) {
      console.error('Error in deleteChat:', error);
      throw error;
    }
  }

  // Update chat with file association
  async updateChatWithFile(chatId, file) {
    try {
      let fileId = null;

      // Save the file first
      if (file) {
        const { data: fileData, error: fileError } = await supabase
          .from('files')
          .insert({
            user_id: file.userId || null,
            filename: file.name,
            file_size: file.size,
            mime_type: file.type,
            content: file.content || null
          })
          .select()
          .single();

        if (fileError) {
          console.error('Error saving file:', fileError);
          throw fileError;
        }

        fileId = fileData.id;
      }

      // Update the chat with the file ID
      const { error: chatError } = await supabase
        .from('chats')
        .update({ 
          file_id: fileId,
          updated_at: new Date().toISOString()
        })
        .eq('id', chatId);

      if (chatError) {
        console.error('Error updating chat with file:', chatError);
        throw chatError;
      }

      return fileId;
    } catch (error) {
      console.error('Error in updateChatWithFile:', error);
      throw error;
    }
  }

  // Get a specific chat with its messages
  async getChat(chatId) {
    try {
      const { data: chat, error } = await supabase
        .from('chats')
        .select(`
          id,
          title,
          file_id,
          created_at,
          updated_at,
          files (
            id,
            filename,
            file_size,
            mime_type,
            content
          ),
          messages (
            id,
            content,
            role,
            metadata,
            created_at
          )
        `)
        .eq('id', chatId)
        .single();

      if (error) {
        console.error('Error loading chat:', error);
        return null;
      }

      // Transform the data
      return {
        id: chat.id,
        title: chat.title,
        messages: chat.messages.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.role,
          timestamp: new Date(msg.created_at).toLocaleTimeString(),
          metadata: msg.metadata
        })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
        file: chat.files ? {
          id: chat.files.id,
          name: chat.files.filename,
          size: chat.files.file_size,
          type: chat.files.mime_type,
          content: chat.files.content
        } : null,
        created_at: chat.created_at,
        updated_at: chat.updated_at
      };
    } catch (error) {
      console.error('Error in getChat:', error);
      return null;
    }
  }
}

const chatService = new ChatService();
export default chatService;
