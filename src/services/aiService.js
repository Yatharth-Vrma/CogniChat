import { GoogleGenerativeAI } from '@google/generative-ai';
import fileProcessingService from './fileProcessingService';

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.isInitialized = false;
    this.initializeAI();
  }

  initializeAI() {
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
      if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        console.warn('Gemini API key not configured. Using simulated responses.');
        return;
      }
      
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
      this.isInitialized = true;
      console.log('✅ Gemini AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error);
      this.isInitialized = false;
    }
  }

  async generateResponse(message, fileContext = null, chatHistory = []) {
    try {
      if (!this.isInitialized) {
        return this.getSimulatedResponse(message, fileContext);
      }

      // Build context-aware prompt
      let prompt = this.buildPrompt(message, fileContext, chatHistory);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true,
        text: text,
        timestamp: new Date().toLocaleTimeString(),
        model: 'Gemini 1.5 Flash'
      };
    } catch (error) {
      console.error('AI Response Error:', error);
      return {
        success: false,
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
        error: error.message
      };
    }
  }

  buildPrompt(message, fileContext, chatHistory) {
    let systemPrompt = `You are CogniChat, an intelligent AI assistant that helps users understand and analyze documents and have conversations. You are helpful, accurate, and provide detailed explanations when needed.

Rules:
1. Always be helpful and provide accurate information
2. If analyzing a document, focus on the content provided
3. Use markdown formatting for better readability
4. Keep responses concise but informative
5. If you're unsure about something, say so rather than guessing`;

    let contextPrompt = '';
    
    // Add file content if available
    if (fileContext) {
      contextPrompt += `\n\nDocument Context:\n`;
      contextPrompt += `File: ${fileContext.name}\n`;
      contextPrompt += `Type: ${fileContext.type}\n`;
      if (fileContext.content) {
        contextPrompt += `Content Preview:\n${fileContext.content.substring(0, 3000)}${fileContext.content.length > 3000 ? '...' : ''}\n`;
      }
    }

    // Add recent chat history for context
    if (chatHistory.length > 0) {
      contextPrompt += `\n\nPrevious conversation:\n`;
      const recentHistory = chatHistory.slice(-6); // Last 6 messages
      recentHistory.forEach(msg => {
        if (msg.sender === 'user') {
          contextPrompt += `User: ${msg.text}\n`;
        } else {
          contextPrompt += `Assistant: ${msg.text}\n`;
        }
      });
    }

    return `${systemPrompt}${contextPrompt}\n\nUser's current question: ${message}`;
  }

  getSimulatedResponse(message, fileContext) {
    const responses = [
      "I can help you with that! However, I notice that the Gemini AI integration needs to be configured with your API key.",
      "That's an interesting question! To provide more accurate responses, please configure your Gemini API key in the environment settings.",
      "I'd love to help analyze that for you. Once you set up the Gemini API key, I'll be able to provide detailed insights about your documents.",
      "Great question! This is a simulated response. For real AI-powered answers, please add your Gemini API key to the .env file."
    ];

    let response = responses[Math.floor(Math.random() * responses.length)];
    
    if (fileContext) {
      response += `\n\nI can see you've uploaded "${fileContext.name}". Once configured, I'll be able to analyze its content and answer specific questions about it.`;
    }

    return {
      success: true,
      text: response,
      timestamp: new Date().toLocaleTimeString(),
      model: 'Simulated Response'
    };
  }

  // File content processing
  async processFileForAI(file) {
    try {
      const fileInfo = fileProcessingService.getFileInfo(file);
      
      let content = null;
      if (fileProcessingService.isTextExtractionSupported(file)) {
        try {
          content = await fileProcessingService.extractTextFromFile(file);
          // Limit content size for AI processing (max ~8000 chars to stay within context limits)
          if (content && content.length > 8000) {
            content = content.substring(0, 8000) + '\n\n[Content truncated due to length]';
          }
        } catch (error) {
          console.warn('Text extraction failed:', error);
          content = await fileProcessingService.getFilePreview(file, 1000);
        }
      }
      
      return {
        ...fileInfo,
        content,
        hasContent: !!content,
        isSupported: fileProcessingService.isTextExtractionSupported(file)
      };
    } catch (error) {
      console.error('File processing error:', error);
      return {
        name: file.name,
        type: file.type,
        content: null,
        size: file.size,
        error: 'Could not process file content',
        hasContent: false,
        isSupported: false
      };
    }
  }

  readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  // Utility methods
  isConfigured() {
    return this.isInitialized;
  }

  getModelInfo() {
    return this.isInitialized ? 'Gemini 1.5 Flash' : 'Simulated Mode';
  }
}

// Create singleton instance
const aiService = new AIService();
export default aiService;
