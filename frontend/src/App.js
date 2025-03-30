import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];  // Get the first selected file
    if (selectedFile) {
      setFile(selectedFile);  // Save the selected file to state
    }
  };

  async function handleUpload(event) {
    event.preventDefault();

    // Ensure that file is selected
    if (!file) {
      console.error('No file selected');
      return;  // Early return if no file is selected
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch('http://localhost:5000/upload/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      console.log(result);  // Log the result to see the response

      setResponse(result);  // Save the result to state

      alert(JSON.stringify(result, null, 2));  // Show the response in an alert
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  }

  return (
    <div className="App">
      <h1>Upload X-ray Image for Analysis</h1>

      {/* File input */}
      <input
        type="file"
        accept=".png"
        onChange={handleFileChange}  // Update state with the selected file
      />
      
      {/* Upload button */}
      <button onClick={handleUpload} disabled={!file}>
        Upload File
      </button>

      {/* Display the backend response */}
      {response && (
        <div>
          <h3>Backend Response:</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
