import React, { useState, useRef, useEffect } from "react";
import "./styles.css";

// --- IMPORTANT ---
// Change this URL to the address of your Python FastAPI server
const API_URL = "https://festival.ai-photocam-diploma-test.online";

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const StartScreen = ({ handleStart }) => {
  const latitude = 48.20974709847567;
  const longitude = 16.380449127547635;

  // Google Maps URL (works on desktop and Android)
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  // Apple Maps URL (works on iOS)
  const appleMapsUrl = `http://maps.apple.com/?daddr=${latitude},${longitude}`;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const mapsUrl = isIOS ? appleMapsUrl : googleMapsUrl;

  const handleNavigate = () => {
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="section">
      <h1 className="section-title">Welcome to Camera Photo App</h1>
      <p className="start-description">
        This app allows you to capture photos using your camera.
      </p>
      <button className="interaction-button" onClick={handleStart}>
        Start
      </button>
       <p className="start-description">
        Learn more about whats going on behinde the scenes: <br/>
        check the server 
      </p>
      <button
        type="button"
        className="interaction-button button"
        onClick={handleNavigate}
      >
        Navigate to Location
      </button>
    </div>
  );
};

const Camera = ({ onPhotoTaken, onRetake }) => {
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError("");

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "environment" },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError(
        "Unable to access camera. Please make sure you have granted camera permissions."
      );
      console.error("Camera access error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photoData = canvas.toDataURL("image/jpeg", 0.8);
    setPhoto(photoData);
    onPhotoTaken(photoData); // Pass the photo data URL to the parent
    stopCamera();
  };

  const retakePhoto = () => {
    setPhoto(null);
    onRetake(); // Notify parent that we are retaking
    startCamera();
  };

  return (
    <div className="section">
      <h2 className="section-title">1. Capture a Photo</h2>
      {error && <div className="error-message">{error}</div>}
      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">Loading camera...</div>
        </div>
      )}
      <div>
        {!photo && (
          <div>
            <video ref={videoRef} autoPlay playsInline muted className="video-preview" />
            {stream && (
              <div>
                <button onClick={takePhoto} className="interaction-button">Capture</button>
              </div>
            )}
          </div>
        )}
        {photo && (
          <div>
            <img src={photo} alt="Captured" className="photo-preview" />
            <button onClick={retakePhoto} className="interaction-button">Retake</button>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden-canvas" />
        {!stream && !isLoading && !photo && (
          <div>
            <button onClick={startCamera} className="interaction-button">Start Camera</button>
          </div>
        )}
      </div>
    </div>
  );
};

const SelectModel = ({ selectedModel, onModelChange }) => {
  // Use the models supported by your backend
  const models = ['gemma3', 'moondream', 'qwen2.5vl', 'llama3.2-vision', 'minicpm-v', 'granite3.2-vision', 'mistral-small3.2'];

  return (
    <div className="section">
      <h2 className="section-title">2. Select Model</h2>
      <div className="model-dropdown">
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="interaction-dropdown"
        >
          <option value="">Select a model...</option>
          {models.map((model, idx) => (
            <option key={idx} value={model}>{model}</option>
          ))}
        </select>
        {selectedModel && <p>Current Model: {selectedModel}</p>}
      </div>
    </div>
  );
};

const SelectPrompt = ({ currentPrompt, onPromptChange }) => {
  const [customPrompt, setCustomPrompt] = useState("");
  const [showInput, setShowInput] = useState(false);
  const prompts = ["What is in this image?", "Describe this scene in detail.", "Is there a person in this photo?"];

  const handlePromptClick = (prompt) => {
    onPromptChange(prompt);
    setShowInput(false);
    setCustomPrompt("");
  };

  const handleCustomPrompt = () => {
    setShowInput(true);
    onPromptChange("");
  };

  const handleInputChange = (e) => {
    setCustomPrompt(e.target.value);
    onPromptChange(e.target.value);
  };

  return (
    <div className="section">
      <h2 className="section-title">3. Select Prompt</h2>
      <p>Current Prompt: {currentPrompt}</p>
      <div className="prompt-buttons">
        {prompts.map((prompt, index) => (
          <button key={index} className="interaction-button" onClick={() => handlePromptClick(prompt)}>{prompt}</button>
        ))}
        {!showInput ? (
          <button className="interaction-button" onClick={handleCustomPrompt}>Custom Prompt...</button>
        ) : (
          <input
            className="interaction-input"
            type="text"
            placeholder="Enter your custom prompt"
            value={customPrompt}
            onChange={handleInputChange}
            autoFocus
          />
        )}
      </div>
    </div>
  );
};

const SubmitButton = ({ onClick, disabled, isReady }) => {
  return (
    <div className="section">
      <h2 className="section-title">4. Ready to Submit?</h2>
      <button
        className="interaction-button"
        onClick={onClick}
        disabled={disabled || !isReady}
        style={{
          backgroundColor: isReady && !disabled ? "#4CAF50" : "#cccccc",
          color: "white",
          cursor: isReady && !disabled ? "pointer" : "not-allowed",
        }}
      >
        {disabled ? "Processing..." : "Submit"}
      </button>
      {!isReady && <p className="error-message">Please capture a photo, select a model, and enter a prompt.</p>}
    </div>
  );
};

const TextStream = ({ responseText, isLoading }) => {
  return (
    <div className="section">
      <h2 className="section-title">Response</h2>
      <div className="text-stream-container">
        {isLoading && !responseText && <p>Waiting for server response...</p>}
        {responseText ? <p>{responseText}</p> : <p>The generated response will appear here.</p>}
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [photoData, setPhotoData] = useState(null);
  const [selectedModel, setSelectedModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [responseText, setResponseText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = () => {
    setShowStartScreen(false);
  };

  const handlePhotoTaken = (data) => {
    setPhotoData(data);
  };

  const handleRetake = () => {
    setPhotoData(null);
    setResponseText("");
    setError("");
  };

  const handleSubmit = async () => {
    if (!photoData || !selectedModel || !prompt) {
      setError("Missing photo, model, or prompt.");
      alert("Please ensure you have captured a photo, selected a model, and provided a prompt.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setResponseText("");

    try {
      const formData = new FormData();
      const photoFile = dataURLtoFile(photoData, "capture.jpg");

      formData.append('model', selectedModel);
      formData.append('question', prompt);
      formData.append('file', photoFile);
      formData.append('stream', 'true');

      const response = await fetch(`${API_URL}/vision`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! Status: ${response.status} - ${errorData.detail || 'Unknown error'}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('Failed to get response reader.');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const responseArray = chunk.split('\n\n'); // SSE format splits messages with double newlines
        
        responseArray.forEach((message) => {
            if (message) {
                 setResponseText(prev => prev + message);
            }
        });
      }

    } catch (err) {
      console.error("API request error:", err);
      setError(`Failed to get response: ${err.message}`);
      setResponseText(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isReadyToSubmit = photoData && selectedModel && prompt;

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <h1 className="app-title">Vision App</h1>
        {showStartScreen ? (
          <StartScreen handleStart={handleStart} />
        ) : (
          <div>
            <Camera onPhotoTaken={handlePhotoTaken} onRetake={handleRetake} />
            {photoData && (
              <div>
                <SelectModel selectedModel={selectedModel} onModelChange={setSelectedModel} />
                <SelectPrompt currentPrompt={prompt} onPromptChange={setPrompt} />
                <SubmitButton onClick={handleSubmit} disabled={isLoading} isReady={isReadyToSubmit} />
                <TextStream responseText={responseText} isLoading={isLoading} />
              </div>
            )}
             {error && <div className="error-message">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}