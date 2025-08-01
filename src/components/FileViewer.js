import React, { useState, useEffect } from 'react';
import './FileViewer.css';
import DragDropUploader from './DragDropUploader';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const FileViewer = ({ onFileUpload, file }) => {
  const [fileContent, setFileContent] = useState('');
  const [numPages, setNumPages] = useState(null);

  useEffect(() => {
    if (file) {
      console.log("File object:", file);
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => setFileContent(e.target.result);
        reader.readAsText(file);
      } else {
        setFileContent('');
      }
    }
  }, [file]);

  const handlePdfLoad = ({ numPages }) => setNumPages(numPages);

  const isPdf =
    file &&
    (file.type === "application/pdf" ||
      (file.name && file.name.toLowerCase().endsWith(".pdf")));

  return (
    <div className="file-viewer">
      <div className="file-header-tabs">
        <button className="file-tab active">New Tab</button>
        <button className="add-tab-btn" title="Add Tab">+</button>
      </div>
      <div className="file-content">
      {/* File header tabs */}
      {!file && <DragDropUploader onFileUpload={onFileUpload} />}
      {file && (
        <div className="file-preview-area">
          <div className="file-bar">
            <span className="file-type">{file.name}</span>
          </div>
          <div className="file-body">
            {file.type === "text/plain" ? (
              <pre>{fileContent}</pre>
            ) : isPdf ? (
              <Document
                file={file}
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