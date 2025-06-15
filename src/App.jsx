import React, { useState, useRef, useEffect } from "react";
import "./styles.css";

const StartScreen = ({ handleStart }) => {
  return (
    <div className="section">
      <h1 className="section-title">WELCOME_TO_CAMERA_PHOTO_APP</h1>
      <p className="start-description">
        This app allows you to capture photos using your camera.
      </p>
      <button className="interaction-button" onClick={handleStart}>
        [START]
      </button>
    </div>
  );
};

// Camera Component
const Camera = ({ setIsPhoto }) => {
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
    setIsPhoto(true);
  };

  const retakePhoto = () => {
    setPhoto(null);
    setIsPhoto(false);
    startCamera();
  };

  return (
    <div className="section">
      <h2 className="section-title">CAMERA_MODULE</h2>

      {error && <div className="error-message">{error}</div>}

      {isLoading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">LOADING_CAMERA...</div>
        </div>
      )}

      <div>
        {!photo && (
          <div>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="video-preview"
            />

            {stream && (
              <div>
                <button onClick={takePhoto} className="interaction-button">
                  [CAPTURE]
                </button>
              </div>
            )}
          </div>
        )}

        {photo && (
          <div>
            <img src={photo} alt="Captured photo" className="photo-preview" />
            <button onClick={retakePhoto} className="interaction-button">
              [RETAKE]
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden-canvas" />

        {!stream && !isLoading && (
          <div>
            <button onClick={startCamera} className="interaction-button">
              [START_CAMERA]
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Interaction = () => {
  return (
    <div className="section">
      <h2 className="section-title">INTERACTION_MODULE</h2>
      <p>This is a placeholder for interaction features.</p>
      <button className="interaction-button">[INTERACT]</button>
      <button className="interaction-button">[INTERACT]</button>
      <button className="interaction-button">[INTERACT]</button>
      <button className="interaction-button">[INTERACT]</button>
    </div>
  );
};

const TextStream = () => {
  return (
    <div className="section">
      <h2 className="section-title">TEXT_STREAM_MODULE</h2>
      <div>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
          veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
          commodo consequat.
        </p>

        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [isPhoto, setIsPhoto] = useState(false);

  const handleStart = () => {
    setShowStartScreen(false);
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <h1 className="app-title">CAMERA_PHOTO_APP</h1>

        {showStartScreen ? (
          <StartScreen handleStart={handleStart} />
        ) : (
          <div>
            <Camera setIsPhoto={setIsPhoto} />
            {isPhoto && (
              <div>
                <Interaction />
                <TextStream />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
