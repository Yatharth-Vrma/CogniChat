import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// Note: mammoth is for browser environments, we'll handle it differently

class FileProcessingService {
  constructor() {
    // Set up PDF.js worker
    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  }

  async extractTextFromFile(file) {
    try {
      switch (file.type) {
        case 'text/plain':
        case 'text/markdown':
        case 'application/json':
        case 'text/html':
        case 'text/css':
        case 'text/javascript':
          return await this.extractTextFromTextFile(file);
        
        case 'application/pdf':
          return await this.extractTextFromPDF(file);
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractTextFromDocx(file);
        
        default:
          // Try to read as text if it's a text-based file
          if (file.type.startsWith('text/')) {
            return await this.extractTextFromTextFile(file);
          }
          throw new Error(`Unsupported file type: ${file.type}`);
      }
    } catch (error) {
      console.error('Error extracting text from file:', error);
      throw error;
    }
  }

  extractTextFromTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  async extractTextFromPDF(file) {
    try {
      const arrayBuffer = await this.fileToArrayBuffer(file);
      const pdf = await getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        fullText += `Page ${i}:\n${pageText}\n\n`;
      }
      
      return fullText;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async extractTextFromDocx(file) {
    try {
      // For DOCX files, we'll implement a basic extraction
      // In a production app, you might want to use a server-side solution
      // const arrayBuffer = await this.fileToArrayBuffer(file);
      
      // Basic DOCX text extraction (simplified)
      // This is a placeholder - full DOCX parsing is complex
      throw new Error('DOCX text extraction requires server-side processing or specialized library');
    } catch (error) {
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
  }

  fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file as ArrayBuffer'));
      reader.readAsArrayBuffer(file);
    });
  }

  // Get file summary/metadata
  getFileInfo(file) {
    return {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeFormatted: this.formatFileSize(file.size),
      lastModified: file.lastModified ? new Date(file.lastModified) : null,
      extension: file.name.split('.').pop()?.toLowerCase() || ''
    };
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Check if file type is supported for text extraction
  isTextExtractionSupported(file) {
    const supportedTypes = [
      'text/plain',
      'text/markdown',
      'application/json',
      'text/html',
      'text/css',
      'text/javascript',
      'application/pdf'
    ];
    
    return supportedTypes.includes(file.type) || file.type.startsWith('text/');
  }

  // Get a preview of the file content (first few lines)
  async getFilePreview(file, maxLength = 500) {
    try {
      if (!this.isTextExtractionSupported(file)) {
        return 'Preview not available for this file type';
      }

      const fullText = await this.extractTextFromFile(file);
      if (fullText.length <= maxLength) {
        return fullText;
      }

      return fullText.substring(0, maxLength) + '...';
    } catch (error) {
      return `Preview unavailable: ${error.message}`;
    }
  }
}

// Create singleton instance
const fileProcessingService = new FileProcessingService();
export default fileProcessingService;
