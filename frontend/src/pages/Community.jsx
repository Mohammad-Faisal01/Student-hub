import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import api, { API_BASE } from '../api';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = API_BASE.replace('/api', '');

const ROOMS = [
  { key: 'general', label: 'General' },
  { key: 'school', label: 'School Zone' },
  { key: 'college', label: 'College Zone' }
];

export default function Community() {
  const { user } = useAuth();
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('sh_token');
    if (!token) return;

    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('new_message', (msg) => {
      setMessages(prev => (msg.room === room ? [...prev, msg] : prev));
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.get(`/messages/${room}`).then(res => setMessages(res.data));
    if (socketRef.current) socketRef.current.emit('join_room', room);
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(e) {
    e.preventDefault();
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit('send_message', { room, body: text.trim() });
    setText('');
  }

  if (!user) {
    return (
      <div className="page-wrap narrow">
        <h2>Community</h2>
        <p className="loading-text">Sign in to join the live chat and talk with other students.</p>
      </div>
    );
  }

  return (
    <div className="page-wrap chat-page">
      <div className="chat-header-row">
        <h2>Community</h2>
        <span className={`chat-status ${connected ? 'online' : 'offline'}`}>
          <span className="chat-status-dot"></span> {connected ? 'Live' : 'Connecting…'}
        </span>
      </div>

      <div className="chat-room-tabs">
        {ROOMS.map(r => (
          <button key={r.key} className={`chat-tab ${room === r.key ? 'active' : ''}`} onClick={() => setRoom(r.key)}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="chat-window">
        {messages.length === 0 && <div className="loading-text">No messages yet — say hello!</div>}
        {messages.map(m => (
          <div key={m._id} className={`chat-bubble-row ${String(m.sender._id) === String(user.id) ? 'own' : ''}`}>
            <div className="chat-bubble">
              <div className="chat-bubble-sender">{m.sender.name}{m.sender.role !== 'student' && <span className="chat-role-tag">{m.sender.role}</span>}</div>
              <div className="chat-bubble-body">{m.body}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Share a thought or ask something…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={!connected}>
          <Icon name="send" size={18} />
        </button>
      </form>
    </div>
  );
}
