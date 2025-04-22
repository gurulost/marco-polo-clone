import React from 'react';
import { render } from '@testing-library/react';
import { SocketProvider } from '../contexts/SocketContext';
import { AuthContext } from '../contexts/AuthContext';
import { io } from 'socket.io-client';

jest.mock('socket.io-client');

describe('SocketContext', () => {
  let fakeSocket;
  let MockNotification;
  beforeEach(() => {
    // Mock socket.io-client
    fakeSocket = { callbacks: {}, on: jest.fn((ev, cb) => { fakeSocket.callbacks[ev] = cb; }), emit: jest.fn(), disconnect: jest.fn() };
    io.mockReturnValue(fakeSocket);

    // Mock Notification API
    MockNotification = class {
      constructor(title, options) {
        MockNotification.instances.push(this);
        this.title = title;
        this.options = options;
        this.onclick = null;
      }
    };
    MockNotification.permission = 'default';
    MockNotification.requestPermission = jest.fn().mockResolvedValue('granted');
    MockNotification.instances = [];
    global.Notification = MockNotification;

    // Mock window focus and location
    window.focus = jest.fn();
    delete window.location;
    window.location = { href: '' };
  });

  it('requests permission and registers user on connect', () => {
    const user = { id: 'user1' };
    render(
      <AuthContext.Provider value={{ user }}>
        <SocketProvider><div /></SocketProvider>
      </AuthContext.Provider>
    );
    // permission requested
    expect(MockNotification.requestPermission).toHaveBeenCalled();
    // simulate connect
    fakeSocket.callbacks.connect();
    expect(fakeSocket.emit).toHaveBeenCalledWith('register', 'user1');
  });

  it('shows notification and navigates on newVideo when granted', () => {
    const user = { id: 'user1' };
    // grant permission
    MockNotification.permission = 'granted';
    // render
    render(
      <AuthContext.Provider value={{ user }}>
        <SocketProvider><div /></SocketProvider>
      </AuthContext.Provider>
    );
    // simulate newVideo
    const video = { from: { name: 'Alice', _id: 'user2' } };
    fakeSocket.callbacks.newVideo(video);
    // one Notification instance
    expect(MockNotification.instances.length).toBe(1);
    const inst = MockNotification.instances[0];
    expect(inst.title).toBe('New message from Alice');
    expect(inst.options.body).toBe('Click to view');
    // simulate click
    inst.onclick();
    expect(window.focus).toHaveBeenCalled();
    expect(window.location.href).toBe('/chat/user2');
  });
});
