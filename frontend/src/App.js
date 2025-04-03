import React, { useState } from 'react';
import './App.css';

const getGeminiResponse = async (transcribedText) => {
  try {
    // Call the backend's /gemini/ endpoint
    const response = await fetch('http://localhost:5000/gemini/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcribed_text: transcribedText }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error Response from Backend:', errorData);
      throw new Error(`Backend request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return data.response; // Return the AI-generated response
  } catch (error) {
    console.error('Error fetching response from backend:', error);
    throw error;
  }
};

function App() {
  const [files, setFiles] = useState([]); // State for multiple files
  const [filePreviews, setFilePreviews] = useState([]); // State for image previews
  const [response, setResponse] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state for chatbot

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Generate preview URLs for all selected files
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  async function handleUpload(event) {
    event.preventDefault();

    if (files.length === 0) {
      console.error('No files selected');
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file); // Append each file to the FormData object
    });

    try {
      const response = await fetch('http://localhost:5000/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const result = await response.json();
      setResponse(result);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    }
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      // Add the user's message to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: inputMessage },
      ]);
      const userMessage = inputMessage;
      setInputMessage("");
      setIsLoading(true); // Show loading indicator

      try {
        // Get the response from the backend
        const botResponse = await getGeminiResponse(userMessage);

        // Add the AI's response to the chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: botResponse },
        ]);
      } catch (error) {
        console.error('Error communicating with backend:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Sorry, I couldn't process your request. Please try again later." },
        ]);
      } finally {
        setIsLoading(false); // Hide loading indicator
      }
    }
  };

  return (
    <div className="App">
      <h1>Upload X-ray Images for Analysis</h1>

      <input
        type="file"
        accept=".png, .jpg, .jpeg"
        multiple // Allow multiple file selection
        onChange={handleFileChange}
        className="file-input"
      />

      {filePreviews.length > 0 && (
        <div className="image-preview-container">
          <h3>Selected Images:</h3>
          <div className="image-preview-grid">
            {filePreviews.map((preview, index) => (
              <img key={index} src={preview} alt={`Preview ${index + 1}`} className="image-preview" />
            ))}
          </div>
        </div>
      )}

      <button onClick={handleUpload} disabled={files.length === 0} className="upload-button">
        Upload Files
      </button>

      {response && (
        <div className="response-container">
          <h3>Backend Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      {/* Embed Sketchfab 3D Model */}
      <div className="sketchfab-container">
        <iframe
          className="sketchfab-model"
          src="https://sketchfab.com/models/337822a2d4bb43358c653dcf425e28ec/embed?autostart=0&transparent=1&ui_infos=0&ui_start=0&scrollwheel=1"
          allowFullScreen
          mozallowfullscreen="true"
          webkitallowfullscreen="true"
          onMouseWheel=""
          tabIndex="-1"
          title="Human Skeleton 3D Model"
        ></iframe>
      </div>

      {/* Chat Widget */}
      <div className="chat-widget">
        <div className="chat-button" onClick={() => setChatOpen(!chatOpen)}>
          💬
        </div>
        {chatOpen && (
          <div className="chat-container">
            <div className="chat-header">
              <div className="chat-title-container">
                <div className="chat-online-indicator"></div>
                <h3 className="chat-title">Chatbot</h3>
              </div>
              <div className="chat-close" onClick={() => setChatOpen(false)}>
                ✖
              </div>
            </div>
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.sender === "user" ? "message-user" : "message-bot"
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>
            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <button
                className="chat-send-btn"
                onClick={handleSendMessage}
                disabled={isLoading} // Disable button while loading
              >
                {isLoading ? '...' : '➤'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
