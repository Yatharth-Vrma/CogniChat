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
      this.generativeModel = null;
      this.isInitialized = false;
    } else {
      try {
        this.genAI = new GoogleGenerativeAI(API_KEY);
        this.embeddingModel = this.genAI.getGenerativeModel({ model: "embedding-001" });
        this.generativeModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        this.isInitialized = true;
        console.log("✅ Gemini AI RAG Service Initialized");
      } catch (error) {
        console.error("Failed to initialize Gemini AI:", error);
        this.isInitialized = false;
      }
    }
    // No longer need to store vectors in memory
  }

  isConfigured() {
    return this.isInitialized;
  }

  // Step 1: Process, embed, and store the document in Supabase
  async processAndEmbedDocument(file) {
    if (!this.isInitialized) throw new Error("AI Service not initialized. Check API key.");
    
    console.log("Starting document processing...");
    const documentText = await fileProcessingService.extractTextFromFile(file);
    const chunks = fileProcessingService.chunkText(documentText);
    
    console.log(`Extracted ${chunks.length} chunks. Now embedding...`);
    const embeddingResult = await this.embeddingModel.batchEmbedContents({
      requests: chunks.map(chunk => ({ content: chunk }))
    });

    const embeddings = embeddingResult.embeddings.map(e => e.values);

    // Prepare data for Supabase
    const documentsToInsert = chunks.map((chunk, i) => ({
      content: chunk,
      embedding: embeddings[i],
    }));

    console.log(`Embedding complete. Storing ${documentsToInsert.length} vectors in Supabase...`);
    
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

    console.log(`Document processed and stored successfully.`);
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

    // Find the most relevant document chunks from Supabase
    const { data: relevantChunks, error: matchError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.70, // Adjust this threshold as needed
      match_count: 5
    });

    if (matchError) {
      console.error("Error matching documents in Supabase:", matchError);
      return "I'm sorry, I had trouble searching the document. Please try again.";
    }

    if (!relevantChunks || relevantChunks.length === 0) {
        // If no relevant chunks are found, use the standard model for a general chat
        console.log("No relevant document chunks found. Using general knowledge.");
        const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');
        const prompt = `Conversation History:\n${historyString}\n\nUser's Question:\n${query}\n\nAnswer:`;
        const result = await this.generativeModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }


   // ...existing code...
    const context = relevantChunks.map(item => item.content).join('\n\n---\n\n');
    const historyString = chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n');

    const prompt = `
      You are an expert AI assistant specialized in document analysis. Your primary goal is to provide accurate, relevant, and concise answers based exclusively on the provided document context.

      **CRITICAL RULES:**
      1.  **Strictly Grounded:** Base your entire answer on the "DOCUMENT CONTEXT" provided below. Do NOT use any external knowledge or information you were trained on.
      2.  **No Assumptions:** If the answer is not explicitly found in the context, you MUST state: "I could not find the answer to that question in the provided document." Do not try to infer or guess.
      3.  **Cite When Possible:** When you provide an answer, quote the most relevant sentence or phrase from the context that supports your answer.
      4.  **Use Conversation History for Intent:** The "CONVERSATION HISTORY" is for understanding the user's line of questioning and intent. The factual basis for your answer must still come from the "DOCUMENT CONTEXT".
      5.  **Plain Text Only:** Your final output must be plain text. Do not use Markdown formatting (e.g., do not use asterisks for bolding or lists, or hashes for headings).


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

      **EXPERT ANSWER:**
    `;

    // Generate the final answer
    const result = await this.generativeModel.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // Clean up any residual markdown formatting, specifically the double asterisks for bolding.
    const cleanedText = rawText.replace(/\*\*/g, '');

    return cleanedText;
  }

  getModelInfo() {
    if (!this.isInitialized) {
      return 'Simulated Mode';
    }
    return 'Gemini (RAG/Supabase)';
  }
}

const aiService = new AIService();
export default aiService;
