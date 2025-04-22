import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import VideoRecorder from '../components/VideoRecorder';

export default function Chat() {
  const { id } = useParams();
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    api.get(`/videos/${id}`).then(res => setVideos(res.data));
  }, [id]);

  const handleNewVideo = (video) => {
    setVideos([...videos, video]);
  };

  return (
    <div className="chat-container">
      <h2>Chat</h2>
      <div className="video-list">
        {videos.map(v => (
          <video key={v._id} src={v.videoUrl} controls width="250" height="200" />
        ))}
      </div>
      <VideoRecorder to={id} onUpload={handleNewVideo} />
    </div>
  );
}
