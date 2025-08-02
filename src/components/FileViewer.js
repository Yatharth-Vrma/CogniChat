import React, { useState, useEffect } from 'react';
import './FileViewer.css';
import DragDropUploader from './DragDropUploader';

const FileViewer = ({ onFileUpload, file }) => {
  const [fileContent, setFileContent] = useState('');
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  // Add file to tabs when a new file is uploaded
  useEffect(() => {
    if (file && !tabs.find(tab => tab.file.name === file.name)) {
      const newTab = {
        id: Date.now(),
        file: file,
        name: file.name
      };
      setTabs(prevTabs => [...prevTabs, newTab]);
      setActiveTabId(newTab.id);
    }
  }, [file, tabs]);

  // Update file content when active tab changes
  useEffect(() => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (activeTab) {
      const currentFile = activeTab.file;
      if (currentFile.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => setFileContent(e.target.result);
        reader.readAsText(currentFile);
      } else {
        setFileContent('');
      }
    }
  }, [activeTabId, tabs]);

  // Add new tab function - this was missing!
  const addNewTab = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.txt,.js,.json,.csv,.md,.html,.css';
    fileInput.multiple = false; // Set to true if you want multiple file selection
    fileInput.onchange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        // Check if file already exists
        const existingTab = tabs.find(tab => tab.file.name === selectedFile.name);
        if (existingTab) {
          // Switch to existing tab
          setActiveTabId(existingTab.id);
        } else {
          // Add new tab
          const newTab = {
            id: Date.now(),
            file: selectedFile,
            name: selectedFile.name
          };
          setTabs(prevTabs => [...prevTabs, newTab]);
          setActiveTabId(newTab.id);
          // Also call the parent's onFileUpload
          onFileUpload(selectedFile);
        }
      }
    };
    fileInput.click();
  };

  // Close tab function
  const closeTab = (tabId, e) => {
    e.stopPropagation();
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        // Switch to the previous tab or first available
        const currentIndex = tabs.findIndex(tab => tab.id === tabId);
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        setActiveTabId(newTabs[nextIndex]?.id || null);
      } else {
        setActiveTabId(null);
      }
    }
  };

  // Switch tab function
  const switchTab = (tabId) => {
    setActiveTabId(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      onFileUpload(tab.file); // Update parent component
    }
  };

  // Get file icon based on extension
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'txt': return '📝';
      case 'js': return '📜';
      case 'json': return '🔧';
      case 'csv': return '📊';
      case 'md': return '📓';
      case 'html': return '🌐';
      case 'css': return '🎨';
      default: return '📄';
    }
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const currentFile = activeTab?.file;

  const isPdf = currentFile &&
    (currentFile.type === "application/pdf" ||
      (currentFile.name && currentFile.name.toLowerCase().endsWith(".pdf")));

  // Create object URL for PDF
  const pdfUrl = isPdf ? URL.createObjectURL(currentFile) : null;

  return (
    <div className="file-viewer">
      {/* Tab Header */}
      <div className="file-header-tabs">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`file-tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => switchTab(tab.id)}
          >
            <span className="file-icon">{getFileIcon(tab.name)}</span>
            <span className="file-name" title={tab.name}>
              {tab.name.length > 15 ? `${tab.name.substring(0, 15)}...` : tab.name}
            </span>
            <button 
              className="close-tab-btn" 
              onClick={(e) => closeTab(tab.id, e)}
              title="Close tab"
            >
              ×
            </button>
          </div>
        ))}
        <button 
          className="add-tab-btn" 
          onClick={addNewTab} 
          title="Add new file"
        >
          +
        </button>
      </div>
      
      {/* File Content Area */}


{/* File Content Area */}
<div className={`file-content ${tabs.length === 0 ? 'file-content-empty' : ''}`}>
  {tabs.length === 0 ? (
    <DragDropUploader onFileUpload={onFileUpload} />
  ) : (
    currentFile && (
      <div className="file-preview-area">
        {/* File Info Bar */}
        <div className="file-bar">
          <div className="file-info">
            <span className="file-type">{currentFile.name}</span>
            <span className="file-size">
              ({(currentFile.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          {isPdf && (
            <div className="pdf-controls">
              <button 
                onClick={() => window.open(pdfUrl, '_blank')}
                className="pdf-control-btn"
                title="Open in new tab"
              >
                🔗 Open
              </button>
              <a 
                href={pdfUrl} 
                download={currentFile.name}
                className="pdf-control-btn"
                title="Download PDF"
              >
                📥 Download
              </a>
            </div>
          )}
        </div>
        
        {/* File Body */}
        <div className="file-body">
          {currentFile.type === "text/plain" ? (
            <pre className="text-content">{fileContent}</pre>
          ) : isPdf ? (
            <div className="pdf-container">
              <div className="pdf-viewer-notice">
                
                {/* Quick Actions */}
                <div className="pdf-quick-actions">
                  <button 
                    onClick={() => window.open(pdfUrl, '_blank')}
                    className="pdf-action-btn primary"
                  >
                    🔍 View Full Screen
                  </button>
                </div>
                
                {/* Embedded PDF Viewer */}
                <div className="pdf-embed-container">
                  <iframe
                    src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    width="100%"
                    height="600px"
                    title={`PDF Viewer - ${currentFile.name}`}
                    className="pdf-iframe"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="unsupported-file">
              <div className="file-icon-large">{getFileIcon(currentFile.name)}</div>
              <h3>{currentFile.name}</h3>
              <p>Preview not available for this file type</p>
              <p><strong>Type:</strong> {currentFile.type || 'Unknown'}</p>
              <p><strong>Size:</strong> {(currentFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <button 
                onClick={() => {
                  const url = URL.createObjectURL(currentFile);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = currentFile.name;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="download-btn"
              >
                📥 Download File
              </button>
            </div>
          )}
        </div>
      </div>
    )
  )}
</div>
    </div>
  );
};

export default FileViewer;