import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VideoRecorder from '../components/VideoRecorder';
import api from '../api';

// Mock getUserMedia and MediaRecorder
const mockStream = { getTracks: () => [{ stop: jest.fn() }] };
Object.defineProperty(navigator, 'mediaDevices', {
  value: { getUserMedia: jest.fn(() => Promise.resolve(mockStream)) },
});

class FakeMediaRecorder {
  constructor(stream) {
    this.stream = stream;
    this.ondataavailable = null;
    this.onstop = null;
  }
  start() {}
  stop() {
    // simulate data and stop events
    const blob = new Blob(['dummy'], { type: 'video/webm' });
    if (this.ondataavailable) this.ondataavailable({ data: blob });
    if (this.onstop) this.onstop();
  }
}

global.MediaRecorder = FakeMediaRecorder;
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
jest.mock('../api', () => ({ post: jest.fn() }));

describe('VideoRecorder', () => {
  const onUpload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records, sends, and discards video correctly', async () => {
    render(<VideoRecorder to="user2" onUpload={onUpload} />);
    // Start recording
    await act(async () => {
      fireEvent.click(screen.getByText('Start'));
    });
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ video: true, audio: true });
    // Stop recording
    const stopBtn = await screen.findByText('Stop');
    await act(async () => {
      fireEvent.click(stopBtn);
    });
    // Wait for Send button
    const sendBtn = await screen.findByText('Send');
    expect(sendBtn).toBeInTheDocument();
    // Upload video
    api.post.mockResolvedValue({ data: { id: 'vid1' } });
    await act(async () => {
      fireEvent.click(sendBtn);
    });
    await waitFor(() => expect(api.post).toHaveBeenCalledWith(
      '/videos', expect.any(FormData), expect.objectContaining({ headers: expect.any(Object) })
    ));
    expect(onUpload).toHaveBeenCalledWith({ id: 'vid1' });
    // UI resets after send
    expect(screen.queryByText('Send')).toBeNull();
    expect(screen.getByText('Start')).toBeInTheDocument();
  });
});
