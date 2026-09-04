import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Icon from './Icon';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  async function loadNotifications() {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) { /* fail silently */ }
  }

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleOpenNotification(n) {
    if (!n.read) {
      await api.patch(`/notifications/${n._id}/read`);
      loadNotifications();
    }
    setOpen(false);
    if (n.test) navigate(`/tests/${n.test}`);
  }

  async function markAllRead() {
    await api.patch('/notifications/read-all');
    loadNotifications();
  }

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="icon-btn notif-btn" onClick={() => setOpen(!open)} aria-label="Notifications">
        <Icon name="bell" size={21} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span>Notifications</span>
            {unreadCount > 0 && <button className="notif-markread" onClick={markAllRead}>Mark all read</button>}
          </div>
          {notifications.length === 0 && <div className="notif-empty">No notifications yet.</div>}
          {notifications.map(n => (
            <div key={n._id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => handleOpenNotification(n)}>
              {n.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
