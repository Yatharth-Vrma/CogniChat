import React, { useState, useEffect } from 'react';
import { X, Key, Zap, Info } from 'lucide-react';
import './Settings.css';

const Settings = ({ isOpen, onClose }) => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [currentApiKey, setCurrentApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    // Load current API key from environment (masked)
    const currentKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (currentKey && currentKey !== 'your_gemini_api_key_here') {
      setCurrentApiKey(`${currentKey.substring(0, 8)}...${currentKey.substring(currentKey.length - 8)}`);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!geminiApiKey.trim()) return;
    
    // In a real app, you'd save this to a secure backend
    // For now, we'll show instructions to update the .env file
    setSaveStatus('Please add this key to your .env file: REACT_APP_GEMINI_API_KEY=' + geminiApiKey);
    setTimeout(() => setSaveStatus(''), 5000);
  };

  const getApiKeyInstructions = () => (
    <div className="instructions">
      <h4>How to get a Gemini API Key:</h4>
      <ol>
        <li>Go to <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer">Google AI Studio</a></li>
        <li>Click "Get API Key" and create a new project</li>
        <li>Generate a new API key</li>
        <li>Copy the key and paste it above</li>
        <li>Add it to your .env file as: <code>REACT_APP_GEMINI_API_KEY=your_key_here</code></li>
        <li>Restart the development server</li>
      </ol>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>⚙️ Settings</h2>
          <button onClick={onClose} className="close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="settings-content">
          {/* AI Configuration Section */}
          <section className="settings-section">
            <div className="section-header">
              <Key size={18} />
              <h3>AI Configuration</h3>
            </div>
            
            <div className="setting-item">
              <label>Gemini API Key</label>
              <div className="api-key-input">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="api-key-field"
                />
                <button 
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="toggle-visibility"
                >
                  {showApiKey ? "👁️" : "👁️‍🗨️"}
                </button>
                <button 
                  onClick={handleSaveApiKey}
                  disabled={!geminiApiKey.trim()}
                  className="save-key-btn"
                >
                  Save
                </button>
              </div>
              {currentApiKey && (
                <div className="current-key">
                  Current Key: <code>{currentApiKey}</code> ✅
                </div>
              )}
              {saveStatus && (
                <div className="save-status">
                  {saveStatus}
                </div>
              )}
            </div>
            
            {getApiKeyInstructions()}
          </section>

          {/* App Information Section */}
          <section className="settings-section">
            <div className="section-header">
              <Info size={18} />
              <h3>App Information</h3>
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <strong>Version:</strong>
                <span>1.0.0</span>
              </div>
              <div className="info-item">
                <strong>AI Model:</strong>
                <span>Gemini 1.5 Flash</span>
              </div>
              <div className="info-item">
                <strong>Supported Files:</strong>
                <span>PDF, TXT, MD, JSON, DOC, DOCX</span>
              </div>
              <div className="info-item">
                <strong>Max File Size:</strong>
                <span>50 MB</span>
              </div>
            </div>
          </section>

          {/* Feature Status Section */}
          <section className="settings-section">
            <div className="section-header">
              <Zap size={18} />
              <h3>Feature Status</h3>
            </div>
            
            <div className="feature-status">
              <div className="feature-item">
                <span>🤖 AI Responses</span>
                <span className={`status ${currentApiKey ? 'enabled' : 'disabled'}`}>
                  {currentApiKey ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="feature-item">
                <span>📁 File Upload</span>
                <span className="status enabled">Enabled</span>
              </div>
              <div className="feature-item">
                <span>🔐 Authentication</span>
                <span className="status enabled">Enabled</span>
              </div>
              <div className="feature-item">
                <span>🌙 Dark Mode</span>
                <span className="status enabled">Enabled</span>
              </div>
              <div className="feature-item">
                <span>📱 Responsive</span>
                <span className="status enabled">Enabled</span>
              </div>
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button onClick={onClose} className="close-settings-btn">
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
