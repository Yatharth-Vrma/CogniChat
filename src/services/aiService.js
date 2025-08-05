import { GoogleGenerativeAI } from "@google/generative-ai";
import fileProcessingService from './fileProcessingService';
import { supabase } from '../lib/supabase'; // Import the Supabase client

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

class AIService {
  constructor() {
    if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
      console.warn("Gemini API key not configured. RAG and advanced features will be disabled.");
      this.genAI = null;
      this.embeddingModel = null;
      this.models = {};
      this.isInitialized = false;
    } else {
      try {
        this.genAI = new GoogleGenerativeAI(API_KEY);
        this.embeddingModel = this.genAI.getGenerativeModel({ model: "embedding-001" });
        
        // Initialize all available models
        this.models = {
          'gemini-2.0-flash': this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" }),
          'gemini-2.0-flash-lite': this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" }),
          'gemini-2.5-flash': this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" }),
          'gemini-2.5-flash-lite': this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" }),
          'gemini-1.5-flash': this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" }),
          'gemini-1.5-flash-lite': this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-lite" })
        };
        
        // Cascade order - try these models in sequence when rate limited
        this.cascadeOrder = [
          'gemini-2.0-flash',
          'gemini-2.0-flash-lite', 
          'gemini-2.5-flash',
          'gemini-2.5-flash-lite',
          'gemini-1.5-flash',
          'gemini-1.5-flash-lite'
        ];
        
        // Default and currently selected model
        this.selectedModel = 'gemini-2.0-flash';
        this.currentModel = this.models[this.selectedModel];
        
        this.isInitialized = true;
        console.log("✅ Gemini AI RAG Service Initialized with Multi-Model Cascade");
        console.log("🔄 Available models:", Object.keys(this.models));
      } catch (error) {
        console.error("Failed to initialize Gemini AI:", error);
        this.isInitialized = false;
      }
    }
  }

  isConfigured() {
    return this.isInitialized;
  }

  // Method to manually set the preferred model
  setModel(modelName) {
    if (this.models[modelName]) {
      this.selectedModel = modelName;
      this.currentModel = this.models[modelName];
      console.log(`🔄 Model switched to: ${modelName}`);
      return true;
    }
    console.error(`❌ Model not found: ${modelName}`);
    return false;
  }

  // Get list of available models for the UI
  getAvailableModels() {
    return Object.keys(this.models).map(modelName => ({
      id: modelName,
      name: this.formatModelName(modelName),
      description: this.getModelDescription(modelName)
    }));
  }

  formatModelName(modelName) {
    return modelName
      .replace('gemini-', 'Gemini ')
      .replace('-', '.')
      .replace('flash', 'Flash')
      .replace('lite', 'Lite')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getModelDescription(modelName) {
    const descriptions = {
      'gemini-2.0-flash': 'Latest, fastest, most intelligent',
      'gemini-2.0-flash-lite': 'Latest, ultra-fast, lightweight',
      'gemini-2.5-flash': 'Advanced, balanced performance',
      'gemini-2.5-flash-lite': 'Advanced, fast, efficient',
      'gemini-1.5-flash': 'Reliable, proven performance',
      'gemini-1.5-flash-lite': 'Reliable, fast, economical'
    };
    return descriptions[modelName] || 'High-performance AI model';
  }

  getCurrentModel() {
    return {
      id: this.selectedModel,
      name: this.formatModelName(this.selectedModel)
    };
  }

  // Cascade fallback method - tries models in sequence when rate limited
  async generateWithCascade(prompt) {
    // Create cascade order starting with selected model
    let cascadeOrder = [...this.cascadeOrder];
    
    // If a specific model is selected, prioritize it
    if (this.selectedModel && cascadeOrder.includes(this.selectedModel)) {
      // Remove selected model from its current position and put it first
      cascadeOrder = cascadeOrder.filter(model => model !== this.selectedModel);
      cascadeOrder.unshift(this.selectedModel);
      console.log(`🎯 Prioritizing selected model: ${this.formatModelName(this.selectedModel)}`);
    }
    
    for (let i = 0; i < cascadeOrder.length; i++) {
      const modelName = cascadeOrder[i];
      const model = this.models[modelName];
      
      try {
        console.log(`🚀 Trying ${this.formatModelName(modelName)}...`);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        console.log(`✅ Success with ${this.formatModelName(modelName)}`);
        return response.text();
      } catch (error) {
        console.log(`⚠️ ${this.formatModelName(modelName)} failed:`, error.message);
        
        if (error.message.includes('429') || error.message.includes('quota')) {
          console.log(`💤 Rate limited on ${this.formatModelName(modelName)}, trying next model...`);
          continue;
        } else {
          // Non-rate-limit error, don't continue cascade
          throw error;
        }
      }
    }
    
    // All models failed
    throw new Error("All models are currently rate limited. Please try again in a few minutes.");
  }

  // NEW: Concurrency limiter
  async limitConcurrency(promises, limit) {
    const results = [];
    const executing = [];
    
    for (const promise of promises) {
      const p = Promise.resolve(promise).then(result => {
        executing.splice(executing.indexOf(p), 1);
        return result;
      });
      
      results.push(p);
      
      if (promises.length >= limit) {
        executing.push(p);
        
        if (executing.length >= limit) {
          await Promise.race(executing);
        }
      }
    }
    
    return Promise.all(results);
  }

  // NEW: Batch embedding method with progress tracking
  async batchEmbedChunks(chunks, progressCallback, batchSize = 8, maxConcurrent = 3) {
    const embeddings = [];
    const totalBatches = Math.ceil(chunks.length / batchSize);
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const currentBatch = Math.floor(i / batchSize) + 1;
      
      console.log(`📦 Processing batch ${currentBatch}/${totalBatches} (${batch.length} chunks)`);
      
      // Update progress
      if (progressCallback) {
        const progress = ((currentBatch - 1) / totalBatches) * 100;
        progressCallback(progress);
      }
      
      // Create promises for concurrent embedding
      const batchPromises = batch.map(async (chunk, index) => {
        try {
          const result = await this.embeddingModel.embedContent(chunk);
          return { index: i + index, embedding: result.embedding.values };
        } catch (error) {
          console.error(`Error embedding chunk ${i + index}:`, error);
          // Retry once with delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retryResult = await this.embeddingModel.embedContent(chunk);
          return { index: i + index, embedding: retryResult.embedding.values };
        }
      });
      
      // Process batch with controlled concurrency
      const batchResults = await this.limitConcurrency(batchPromises, maxConcurrent);
      
      // Add to results in order
      for (const result of batchResults.sort((a, b) => a.index - b.index)) {
        embeddings[result.index] = result.embedding;
      }
      
      // Small delay between batches to avoid rate limiting
      if (currentBatch < totalBatches) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Final progress update
    if (progressCallback) {
      progressCallback(100);
    }
    
    return embeddings;
  }

  // OPTIMIZED: Step 1: Process, embed, and store the document in Supabase with batching
  async processAndEmbedDocument(file, progressCallback) {
    if (!this.isInitialized) throw new Error("AI Service not initialized. Check API key.");
    
    console.log("🚀 Starting optimized document processing...");
    const documentText = await fileProcessingService.extractTextFromFile(file);
    const chunks = fileProcessingService.chunkText(documentText);
    
    // Filter out empty or whitespace-only chunks to prevent API errors.
    const validChunks = chunks.filter(chunk => chunk && chunk.trim() !== '');
    console.log(`📄 Extracted ${validChunks.length} valid chunks. Now sanitizing and embedding...`);

    // Aggressively sanitize each chunk to remove any non-printable or non-standard characters.
    // eslint-disable-next-line no-control-regex
    const sanitizedChunks = validChunks.map(chunk => chunk.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ''));

    // NEW: Use batch embedding instead of individual requests
    console.log("⚡ Embedding chunks in optimized batches...");
    const embeddings = await this.batchEmbedChunks(sanitizedChunks, progressCallback);

    // Prepare data for Supabase using the existing documents table
    const documentsToInsert = sanitizedChunks.map((chunk, i) => ({
      content: chunk,
      embedding: embeddings[i]
    }));

    console.log(`💾 Embedding complete. Storing ${documentsToInsert.length} vectors in Supabase...`);
    
    // Clear old documents before adding new ones
    const { error: deleteError } = await supabase.from('documents').delete().neq('id', -1);
    if (deleteError) {
        console.error("Error clearing old documents:", deleteError);
        throw new Error("Could not clear old documents from the database.");
    }

    // Insert new documents into Supabase
    const { error: insertError } = await supabase.from('documents').insert(documentsToInsert);
    if (insertError) {
      console.error("Error inserting documents into Supabase:", insertError);
      throw new Error("Could not save document vectors to the database.");
    }

    console.log(`✅ Document processed and stored successfully in optimized batches!`);
    return {
      chunks: documentsToInsert.length,
      fileSize: file.size,
    };
  }

  // Step 2 & 3: Get a tailored answer using RAG from Supabase
  async getRAGAnswer(query, chatHistory = []) {
    if (!this.isInitialized) {
      return "AI is not configured. Please add your Gemini API key in the settings.";
    }

    // Embed the user's query
    const queryEmbedding = (await this.embeddingModel.embedContent(query)).embedding.values;

    // Find the most relevant document chunks from Supabase using existing function
    const { data: relevantChunks, error: matchError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.30, // Lowered from 0.70 to 0.30 for more inclusive results
      match_count: 5
    });

    if (matchError) {
      console.error("Error matching documents in Supabase:", matchError);
      console.error("Match error details:", matchError);
      return "I'm sorry, I had trouble searching the document. Please try again.";
    }
    
    console.log("✅ RAG Context Sent to AI:", relevantChunks ? relevantChunks.map(c => c.content) : 'No chunks found');
    console.log("Number of chunks retrieved:", relevantChunks ? relevantChunks.length : 0);

    if (!relevantChunks || relevantChunks.length === 0) {
        // If no relevant chunks are found, use the cascade system
        console.log("No relevant document chunks found. Using general knowledge with cascade.");
        const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
        const prompt = `Conversation History:\n${historyString}\n\nUser's Question:\n${query}\n\nAnswer:`;
        return await this.generateWithCascade(prompt);
    }

    // Construct the prompt with context
    const context = relevantChunks.map(item => item.content).join('\n\n---\n\n');
    const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');

    const prompt = `
      You are an expert AI assistant specialized in document analysis. Your primary goal is to provide accurate, relevant, and helpful answers based on the provided document context.

      **INSTRUCTIONS:**
      1.  **Use the Document**: Base your answers primarily on the "DOCUMENT CONTEXT" provided below.
      2.  **Be Helpful**: When the user asks for opinions or judgments (like "best project" or "most impressive skill"), you can analyze and interpret the information in the context to provide useful insights.
      3.  **Stay Grounded**: While you can interpret and analyze, don't add information that isn't in the document.
      4.  **Be Clear**: If information is genuinely missing from the document, say so, but try to be helpful with what is available.
      5.  **Plain Text**: Use plain text formatting only.

      ---

      **DOCUMENT CONTEXT:**
      ${context}

      ---

      **CONVERSATION HISTORY:**
      ${historyString}

      ---

      **USER'S QUESTION:**
      ${query}

      ---

      **ANSWER:**
    `;

    // Use cascade system for RAG responses too
    const rawText = await this.generateWithCascade(prompt);

    // Clean up markdown formatting
    const cleanedText = rawText
      .replace(/^#+\s/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^[ \t]*(\*|-|\d+\.)\s/gm, '')
      .trim();

    return cleanedText;
  }

  getModelInfo() {
    if (!this.isInitialized) {
      return 'Simulated Mode';
    }
    return `${this.formatModelName(this.selectedModel)} (RAG/Supabase)`;
  }
}

const aiService = new AIService();
export default aiService;