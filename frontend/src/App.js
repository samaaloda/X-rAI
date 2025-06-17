import React, { useState, useRef, useEffect } from 'react';
import './App.css';


const getOllamaResponse = async (transcribedText) => {
  try {
    // Simulate a short delay to mimic real API behavior
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const responses = [
      `You asked: "${transcribedText}". From your description, it seems you're referring to a fracture along the diaphyseal region. This could indicate a longitudinal fracture involving cortical disruption.`,
      `Interpreting your question: "${transcribedText}", it appears you're analyzing a possible impacted fracture. The X-ray may show trabecular compression and minimal displacement.`,
      `Regarding your input: "${transcribedText}", this sounds like a classic greenstick fracture, commonly seen in pediatric cases due to incomplete ossification.`,
      `Your question: "${transcribedText}" indicates interest in displacement direction. This case suggests a proximal spiral fracture with rotational force involvement.`,
      `You mentioned: "${transcribedText}". Based on the context, I suspect a comminuted fracture, which often results from high-energy trauma and involves multiple bone fragments.`,
      `From: "${transcribedText}" — This may align with a pathological fracture, particularly if underlying bone weakness is suspected (e.g., osteoporosis, tumors).`,
      `"${transcribedText}" — If you're referring to hairline visibility, the fine linear lucency along the cortex may confirm a hairline fracture with no obvious displacement.`,
    ];

    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  } catch (error) {
    return "An internal error occurred. Please try again.";
  }
};






function App() {
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [response, setResponse] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const mainContentRef = useRef(null);


  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };


  const scrollToContent = () => {
    mainContentRef.current.scrollIntoView({ behavior: 'smooth' });
  };


  async function handleUpload(event) {
    event.preventDefault();


    if (files.length === 0) {
      return;
    }


    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });


    try {
      const response = await fetch("https://x-rai-pz46.onrender.com/upload/", {
      method: "POST",
      body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }


      const result = await response.json();
      setResponse(result);
    } catch (error) {
      alert('Error uploading files');
    }
  }


  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "user", text: inputMessage },
      ]);
      const userMessage = inputMessage;
      setInputMessage("");
      setIsLoading(true);


      try {
        const botResponse = await getOllamaResponse(userMessage);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: botResponse },
        ]);
      } catch (error) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Sorry, I couldn't process your request. Please try again later." },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div className="App">
      <section className="hero-section">
        <h1 className="hero-title">
          <span className="header-x-r">X-R</span>
          <span className="header-ai">AI</span>
        </h1>
        <h2 className="hero-tagline">EMPOWERING RADIOLOGISTS</h2>
        <div className="scroll-indicator" onClick={scrollToContent}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#8adbf0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>


      <section className="main-content" ref={mainContentRef}>
        <h2 className="section-title">X-ray Analysis Tools</h2>
        <div className="row-container">
          <div className="upload-section">
            <h3>Upload X-ray Images for Analysis</h3>
            <label htmlFor="file-upload" className="file-input-label">
              Choose Files
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".png, .jpg, .jpeg"
              multiple
              onChange={handleFileChange}
              className="file-input styled-file-input"
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
          </div>
          <div className="sketchfab-container">
            <h3>Interactive 3D Skeleton Model</h3>
            <iframe
              className="sketchfab-model"
              src="https://sketchfab.com/models/337822a2d4bb43358c653dcf425e28ec/embed?autostart=0&transparent=1&ui_infos=0&ui_start=0&scrollwheel=1"
              allowFullScreen
              mozallowfullscreen="true"
              webkitallowfullscreen="true"
              onWheel={() => {}}
              tabIndex="-1"
              title="Human Skeleton 3D Model"
            ></iframe>
          </div>
        </div>
        {response && (
          <div className="response-container">
            <h3>Analysis Results:</h3>
            <div className="analysis-card">
              <p><strong>Predicted Class:</strong> {response.predicted_class}</p>
              <p><strong>Confidence:</strong> {(response.confidence * 100).toFixed(2)}%</p>
            </div>
          </div>
        )}
      </section>


      <div className="chat-widget">
        <div className="chat-button" onClick={() => setChatOpen(!chatOpen)}>
          💬
        </div>
        {chatOpen && (
          <div className="chat-container">
            <div className="chat-header">
              <div className="chat-title-container">
                <div className="chat-online-indicator"></div>
                <h3 className="chat-title">X-RAI Assistant</h3>
              </div>
              <div className="chat-close" onClick={() => setChatOpen(false)}>
                ✖
              </div>
            </div>
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="welcome-message">
                  Welcome to X-RAI! Ask me anything about bone fractures and X-ray analysis.
                </div>
              )}
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
                onKeyPress={(e) => e.key === 'Enter' ? handleSendMessage() : null}
              />
              <button
                className="chat-send-btn"
                onClick={handleSendMessage}
                disabled={isLoading}
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

