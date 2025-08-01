import React, { useState, useEffect } from 'react';
import './FileViewer.css';
import DragDropUploader from './DragDropUploader';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const FileViewer = ({ onFileUpload, file }) => {
  const [fileContent, setFileContent] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

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

  const handlePdfLoad = ({ numPages }) => setNumPages(numPages);

  const addNewTab = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        onFileUpload(selectedFile);
      }
    };
    fileInput.click();
  };

  const closeTab = (tabId, e) => {
    e.stopPropagation();
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        setActiveTabId(newTabs[0].id);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return '📄';
      case 'txt': return '📝';
      case 'js': return '📜';
      case 'json': return '🔧';
      case 'csv': return '📊';
      default: return '📄';
    }
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const currentFile = activeTab?.file;

  const isPdf = currentFile &&
    (currentFile.type === "application/pdf" ||
      (currentFile.name && currentFile.name.toLowerCase().endsWith(".pdf")));

  return (
    <div className="file-viewer">
      <div className="file-header-tabs">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`file-tab ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            <span className="file-icon">{getFileIcon(tab.name)}</span>
            <span className="file-name">{tab.name}</span>
            <button 
              className="close-tab-btn" 
              onClick={(e) => closeTab(tab.id, e)}
              title="Close tab"
            >
              ×
            </button>
          </div>
        ))}
        <button className="add-tab-btn" onClick={addNewTab} title="Add Tab">
          +
        </button>
      </div>
      <div className="file-content">
        {tabs.length === 0 && <DragDropUploader onFileUpload={onFileUpload} />}
        {currentFile && (
          <div className="file-preview-area">
            <div className="file-bar">
              <span className="file-type">{currentFile.name}</span>
            </div>
            <div className="file-body">
              {currentFile.type === "text/plain" ? (
                <pre>{fileContent}</pre>
              ) : isPdf ? (
                <Document
                  file={currentFile}
                  onLoadSuccess={handlePdfLoad}
                  loading={<p>Loading PDF...</p>}
                  error={<p>Failed to load PDF.</p>}
                >
                  <Page pageNumber={1} />
                  {numPages > 1 && (
                    <p style={{ color: "#9C9C9C", marginTop: "10px" }}>
                      PDF has {numPages} pages. Only first page is shown.
                    </p>
                  )}
                </Document>
              ) : (
                <p>Preview not available for this file type. Download or open externally.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewer;