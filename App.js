import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [files, setFiles] = useState([]);
  const [chatMessages, setChatMessages] = useState([{ sender: 'bot', text: 'Hello!' }]);
  const [chatInput, setChatInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const fileList = document.getElementById('file-list');
    const chatButton = document.getElementById('chat-button');
    const chatContainer = document.getElementById('chat-container');
    const chatClose = document.getElementById('chat-close');
    const chatSendBtn = document.querySelector('.chat-send-btn');

    chatButton.addEventListener('click', () => {
      setChatOpen(true);
    });

    chatClose.addEventListener('click', () => {
      setChatOpen(false);
    });

    chatSendBtn.addEventListener('click', sendMessage);

    const handleFiles = (newFiles) => {
      const validFiles = Array.from(newFiles).filter(file => file.type === 'application/pdf');
      if (validFiles.length === 0) {
        alert('Please upload PDF files only.');
        return;
      }
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    };

    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const highlight = () => {
      dropArea.style.borderColor = 'var(--primary)';
      dropArea.style.backgroundColor = 'rgba(0, 194, 203, 0.1)';
    };

    const unhighlight = () => {
      dropArea.style.borderColor = '#444';
      dropArea.style.backgroundColor = 'transparent';
    };

    dropArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });
    dropArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      handleFiles(dt.files);
    });

    return () => {
      chatButton.removeEventListener('click', () => setChatOpen(true));
      chatClose.removeEventListener('click', () => setChatOpen(false));
      chatSendBtn.removeEventListener('click', sendMessage);
    };
  }, []);

  const sendMessage = () => {
    const message = chatInput.trim();
    if (message) {
      setChatMessages(prevMessages => [
        ...prevMessages,
        { sender: 'user', text: message },
        { sender: 'bot', text: 'blah blah.' } //get from backend's trained chatbot
      ]);
      setChatInput('');
    }
  };

  const handleChatInputChange = (e) => {
    setChatInput(e.target.value);
  };

  const handleUpload = () => {
    const fileItems = document.querySelectorAll('.file-item .status');
    fileItems.forEach((statusElement, index) => {
      statusElement.textContent = 'Uploading...';
      setTimeout(() => {
        statusElement.textContent = 'Success';
        statusElement.className = 'status success';
      }, 1500 + (index * 500));
    });

    setTimeout(() => {
      if (!chatOpen) {
        setChatOpen(true);
      }
      setChatMessages(prevMessages => [
        ...prevMessages,
        { sender: 'bot', text: 'I see you\'ve uploaded some files. The analysis will be completed shortly.' }
      ]);
    }, 2000);
  };

  return (
    <div>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>XR-AI - X-ray Fracture Detection</title>
      </head>
      <body>
        <header>
          <div className="container">
            <h1 className="logo">XR-AI</h1>
            <p className="tagline">Advanced X-ray Fracture Detection</p>
          </div>
        </header>

        <main className="container">
          <section className="upload-section">
            <div className="upload-container">
              <h2>Upload X-ray Images</h2>
              <p className="upload-description">
                Upload your X-ray images in PDF format for AI-powered fracture detection and analysis.
              </p>

              <div className="upload-area" id="drop-area">
                <div className="upload-text">Drag and drop your X-ray PDFs here</div>
                <div className="file-info">or click to browse (Max size: 10MB)</div>
                <input type="file" id="file-input" accept=".pdf" multiple />
              </div>

              <div className="text-center">
                <button className="btn" id="upload-btn" disabled={files.length === 0} onClick={handleUpload}>
                  Upload Files
                </button>
              </div>

              <div className="file-list" id="file-list">
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <div>
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">{(file.size / 1024).toFixed(2)} KB</div>
                    </div>
                    <div className="status pending">Pending</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Chat Widget */}
        <div className={`chat-widget ${chatOpen ? 'active' : ''}`}>
          <div className="chat-button" id="chat-button">Chat</div>

          <div className="chat-container" id="chat-container">
            <div className="chat-header">
              <div className="chat-title-container">
                <div className="chat-online-indicator"></div>
                <h3 className="chat-title">XR-AI Assistant</h3>
              </div>
              <div className="chat-close" id="chat-close">×</div>
            </div>

            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div key={index} className={`message message-${message.sender}`}>{message.text}</div>
              ))}
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="Type your message here..."
                value={chatInput}
                onChange={handleChatInputChange}
              />
              <button className="chat-send-btn" onClick={sendMessage}>→</button>
            </div>
          </div>
        </div>

        <footer>
          <div className="container">
            <div className="footer-content">
              <div className="footer-logo">XR-AI</div>
              <div>© 2025 XR-AI Medical Imaging. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </body>
    </div>
  );
}

export default App;
