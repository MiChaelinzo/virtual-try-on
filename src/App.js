import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const [selectedMakeup, setSelectedMakeup] = useState('none');

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  }

  useEffect(() => {
    async function loadModels() {
      await faceapi.loadFaceLandmarkModel('/models');
    }
    loadModels();
  }, []);

  useEffect(() => {
    async function detectFace() {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const landmarks = await faceapi.detectAllFaces(canvas).withFaceLandmarks();

      // Apply makeup to facial landmarks
      const makeupFilter = getMakeupFilter(selectedMakeup);
      landmarks.forEach((landmark) => {
        const eyeLeft = landmark.landmarks.getLeftEye();
        const eyeRight = landmark.landmarks.getRightEye();
        context.filter = makeupFilter;
        context.beginPath();
        context.moveTo(eyeLeft[0].x, eyeLeft[0].y);
        eyeLeft.forEach((point) => {
          context.lineTo(point.x, point.y);
        });
        eyeRight.forEach((point) => {
          context.lineTo(point.x, point.y);
        });
        context.closePath();
        context.fill();
      });

      // Draw canvas onto video element
      const videoContext = video.getContext('2d');
      videoContext.drawImage(canvas, 0, 0, canvas.width, canvas.height);
    }

    const interval = setInterval(detectFace, 100);

    return () => {
      clearInterval(interval);
    };
  }, [selectedMakeup, videoRef]);

  function getMakeupFilter(makeup) {
    switch (makeup) {
      case 'none':
        return 'none';
      case 'lipstick':
        return 'saturate(2) hue-rotate(-10deg)';
      case 'eyeshadow':
        return 'brightness(1.2) contrast(1.2) sepia(0.2)';
      default:
        return 'none';
    }
  }

  return (
    <div>
      <video ref={videoRef} autoPlay></video>
      <button onClick={startCamera}>Start Camera</button>
      <div>
        <label>
          <input
            type="radio"
            value="none"
            checked={selectedMakeup === 'none'}
            onChange={() => setSelectedMakeup('none')}
          />
          None
        </label>
        <label>
          <input
            type="radio"
            value="lipstick"
            checked={selectedMakeup === 'lipstick'}
            onChange={() => setSelectedMakeup('lipstick')}
          />
          Lipstick
        </label>
        <label>
          <input
            type="radio"
            value="eyeshadow"
            checked={selectedMakeup === 'eyeshadow'}
            onChange={() => setSelectedMakeup('eyeshadow')}
          />
          Eyeshadow
        </label>
      </div>
    </div>
  );
}

export default App;

