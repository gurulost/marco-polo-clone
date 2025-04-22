import React, { useState, useRef } from 'react';
import api from '../api';

export default function VideoRecorder({ to, onUpload }) {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoURL, setVideoURL] = useState(null);
  const [videoBlob, setVideoBlob] = useState(null);
  const videoRef = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoRef.current.srcObject = stream;
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      setVideoBlob(blob);
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
    };
    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  const handleUpload = async () => {
    const form = new FormData();
    form.append('video', videoBlob, 'video.webm');
    form.append('to', to);
    const res = await api.post('/videos', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    setVideoBlob(null);
    setVideoURL(null);
    videoRef.current.src = '';
    onUpload(res.data);
  };

  return (
    <div className="video-recorder">
      <video ref={videoRef} width="250" height="200" controls autoPlay muted={!videoURL} />
      <div>
        {!recording && !videoURL && <button onClick={startRecording}>Start</button>}
        {recording && <button onClick={stopRecording}>Stop</button>}
        {videoURL && <button onClick={handleUpload}>Send</button>}
        {videoURL && <button onClick={() => { setVideoURL(null); setVideoBlob(null); videoRef.current.src = ''; }}>Discard</button>}
      </div>
    </div>
  );
}
