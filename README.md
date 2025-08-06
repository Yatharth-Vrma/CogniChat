# 🧠 CogniChat - Intelligent Q&A System

<div align="center">
  <img src="public/logo192.png" alt="CogniChat Logo" width="120" height="120">
  
  **An AI-powered document analysis and chat platform with RAG (Retrieval Augmented Generation)**
  
  [![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.53.0-green.svg)](https://supabase.com/)
  [![Google AI](https://img.shields.io/badge/Google%20AI-Gemini-orange.svg)](https://ai.google.dev/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

## 🚀 **Features**

### 🤖 **AI-Powered Chat**
- **Smart Conversations**: Context-aware responses using Google's Gemini AI
- **Document Analysis**: Upload and ask questions about PDFs, text files, and more
- **RAG Technology**: Retrieval Augmented Generation for accurate, document-based answers
- **Multi-Model Support**: Fallback system for reliable responses

### 📄 **Document Processing**
- **Multiple Formats**: PDF, TXT, JSON, MD, HTML, CSS, JS files
- **Intelligent Extraction**: Advanced text extraction and chunking
- **Vector Search**: Semantic similarity search for relevant content
- **File Preview**: Built-in viewers for supported file types

### 💬 **Chat Management**
- **Persistent History**: Conversations survive page refreshes
- **Multiple Chats**: Create and manage multiple chat sessions
- **Editable Titles**: Rename chats for better organization
- **File Integration**: Link documents to specific conversations

### 🎨 **User Experience**
- **Beautiful UI**: Modern, responsive design with dark/light themes
- **Animated Splash**: Eye-catching startup animation
- **Real-time Typing**: Live AI response indicators
- **Mobile Friendly**: Works seamlessly on all devices

---

## 🛠 **Tech Stack**

### **Frontend**
- **React 19** - Latest React with modern features
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives
- **React Router** - Client-side routing

### **Backend & AI**
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Google Gemini AI** - Advanced language model
- **pgvector** - Vector similarity search
- **RAG Pipeline** - Document embedding and retrieval

### **File Processing**
- **PDF.js** - PDF text extraction
- **Mammoth** - DOCX processing
- **React Dropzone** - Drag & drop file uploads

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16+ and npm
- Supabase account
- Google AI Studio account

### **1. Clone Repository**
```bash
git clone https://github.com/Yatharth-Vrma/CogniChat.git
cd CogniChat
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### **4. Configure Environment Variables**
```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI Configuration
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

### **5. Database Setup**
Run the SQL commands in your Supabase SQL editor:
```sql
-- Required for vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table for RAG
CREATE TABLE IF NOT EXISTS documents (
  id bigserial PRIMARY KEY,
  content text NOT NULL,
  embedding vector(768),
  created_at timestamptz DEFAULT NOW()
);

-- Create similarity search function
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id bigint,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Create vector index for performance
CREATE INDEX IF NOT EXISTS documents_embedding_idx 
ON documents USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

### **6. Start Development Server**
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app! 🎉

---

## 📖 **Usage Guide**

### **Getting Started**
1. **Create Account**: Sign up or log in through the authentication system
2. **Upload Document**: Drag & drop or click to upload a file
3. **Start Chatting**: Ask questions about your document or general topics
4. **Manage Chats**: Create multiple chats, rename them, and switch between them

### **Supported File Types**
- **PDF** - Portable Document Format
- **TXT** - Plain text files
- **JSON** - JavaScript Object Notation
- **MD** - Markdown files
- **HTML** - Web pages
- **CSS** - Stylesheets
- **JS** - JavaScript files

### **AI Features**
- **Document Q&A**: "What is this document about?"
- **Content Analysis**: "Summarize the key points"
- **Specific Queries**: "Find information about X"
- **General Chat**: Works without documents too

### **Tips for Best Results**
- **Clear Questions**: Be specific about what you want to know
- **Document Context**: Reference specific sections or topics
- **Follow-up**: Ask follow-up questions for deeper analysis
- **File Quality**: Use clear, well-structured documents

---

## ScreenShots
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/826eb728-b1c3-4ce1-8dcc-38745ffca0f3" />
<img width="2940" height="1912" alt="image" src="https://github.com/user-attachments/assets/ae645423-e4f0-4c05-a52f-c03198d45cad" />
<img width="1470" height="956" alt="image" src="https://github.com/user-attachments/assets/849f7f81-a729-46af-80ce-51f84e4f3bcb" />


## 🏗 **Project Structure**

```
CogniChat/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── ui/            # Reusable UI components
│   │   ├── Chat.js        # Main chat interface
│   │   ├── Dashboard.js   # App dashboard
│   │   ├── FileViewer.js  # Document viewer
│   │   └── Sidebar.js     # Navigation sidebar
│   ├── contexts/          # React contexts
│   │   └── AuthContext.js # Authentication state
│   ├── lib/               # Utility libraries
│   │   ├── supabase.js    # Supabase client
│   │   └── utils.js       # Helper functions
│   ├── services/          # Business logic
│   │   ├── aiService.js   # AI integration
│   │   ├── chatService.js # Chat management
│   │   └── fileProcessingService.js # File handling
│   └── styles/            # CSS files
├── docs/                  # Documentation
├── database_schema.sql    # Full database schema
├── essential_tables.sql   # Minimal required tables
└── supabase_setup.sql     # Vector search setup
```

---

## 🔧 **Configuration**

### **Environment Variables**
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `REACT_APP_GEMINI_API_KEY` | Google Gemini API key | ✅ |

### **Getting API Keys**

#### **Supabase Setup**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy your URL and anon key

#### **Google AI Setup**
1. Visit [Google AI Studio](https://ai.google.dev)
2. Create new project
3. Generate API key
4. Copy the key (starts with "AIza...")

---

## 🚢 **Deployment**

### **Build for Production**
```bash
npm run build
```

### **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### **Deploy to Netlify**
```bash
# Build and deploy
npm run build
# Upload 'build' folder to Netlify
```

### **Environment Variables in Production**
Make sure to set all environment variables in your deployment platform.

---

## 🧪 **Testing**

### **Run Tests**
```bash
npm test
```

### **Build Test**
```bash
npm run build
```

### **Manual Testing Checklist**
- [ ] User registration and login
- [ ] File upload and processing
- [ ] Chat creation and messaging
- [ ] AI responses and RAG functionality
- [ ] Chat persistence across sessions
- [ ] Theme switching
- [ ] Mobile responsiveness

---

## 🤝 **Contributing**

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Development Guidelines**
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits focused and descriptive

---

## 📊 **Performance**

### **Metrics**
- **Build Size**: ~165KB (gzipped)
- **Load Time**: <3 seconds on 3G
- **AI Response**: 2-5 seconds average
- **File Processing**: <1 second for text files

### **Optimizations**
- Code splitting and lazy loading
- Vector search indexing
- Efficient state management
- Responsive image loading

---

## 🔒 **Security**

### **Data Protection**
- **Row Level Security**: Database access control
- **Environment Variables**: Secure API key storage
- **Input Validation**: All user inputs validated
- **Content Filtering**: Safe content processing

### **Privacy**
- **Local Storage**: Chat data stored locally by default
- **Optional Database**: Full database persistence available
- **User Control**: Users own their data

---

## 🐛 **Troubleshooting**

### **Common Issues**

#### **AI Not Responding**
- Check Gemini API key in .env
- Verify API key is active
- Check browser console for errors
- Restart development server

#### **File Upload Issues**
- Supported formats: PDF, TXT, JSON, MD, HTML, CSS, JS
- Max file size: 50MB
- Check file permissions

#### **Database Errors**
- Verify Supabase credentials
- Run database setup SQL
- Check network connection

#### **Build Errors**
```bash
# Clear cache and reinstall
npm run clean
npm install
npm start
```


---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Google AI** for Gemini language model
- **Supabase** for backend infrastructure
- **React Team** for the amazing framework
- **Open Source Community** for incredible tools and libraries

---

## 📞 **Support**

### **Get Help**
- 🐛 **Issues**: [GitHub Issues](https://github.com/Yatharth-Vrma/CogniChat/issues)
- 📖 **Docs**: Check the documentation files in this repository
- 💬 **Discussions**: Use GitHub Discussions for questions


---

<div align="center">
  <h3>🚀 Ready to build the future of AI-powered conversations? 🚀</h3>
  <p>
    <a href="#quick-start">Get Started</a> • 
    <a href="#usage-guide">Learn More</a> • 
    <a href="#contributing">Contribute</a> • 
    <a href="#support">Get Help</a>
  </p>
  
  **Made with ❤️ by Yatharth Verma**
</div>
