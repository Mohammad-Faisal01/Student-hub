import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import Icon from './Icon';

const NAV_ITEMS = [
  { to: '/notes', label: 'Notes', icon: 'book' },
  { to: '/doubts', label: 'Doubts', icon: 'help' },
  { to: '/tests', label: 'Tests', icon: 'clock' },
  { to: '/community', label: 'Community', icon: 'users' },
  { to: '/about', label: 'About', icon: 'user' }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  function handleLogout() {
    logout();
    setProfileOpen(false);
    setDrawerOpen(false);
    navigate('/');
  }

  const initials = user ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '';

  return (
    <>
      <header className="navbar">
        <Link to="/" className="logo">
          <span className="logo-mark"><Icon name="book" size={17} /></span>
          <span>StudentHub</span>
        </Link>

        <nav className="nav-links-desktop">
          {NAV_ITEMS.map(item => <Link key={item.to} to={item.to}>{item.label}</Link>)}
        </nav>

        <div className="nav-actions">
          {user && <NotificationBell />}
          {user ? (
            <div className="profile-wrap" ref={profileRef}>
              <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
                <span className="avatar-circle">{initials}</span>
                <Icon name="chevronDown" size={16} />
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-name">{user.name}</div>
                    <div className="profile-role">{user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Teacher' : 'Student'}{user.college ? ` · ${user.college}` : ''}</div>
                  </div>
                  {(user.role === 'admin' || user.role === 'teacher') && (
                    <Link to="/tests/create" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                      <Icon name="plusCircle" size={17} /> Create a test
                    </Link>
                  )}
                  <Link to="/dashboard" className="profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                    <Icon name="dashboard" size={17} /> My progress
                  </Link>
                  <button className="profile-dropdown-item logout-item" onClick={handleLogout}>
                    <Icon name="logout" size={17} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links-desktop">
              <Link to="/login" className="btn-outline-nav">Sign in</Link>
              <Link to="/register" className="btn-signin">Register</Link>
            </div>
          )}
          <button className="menu-toggle" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <Icon name="menu" size={24} />
          </button>
        </div>
      </header>

      <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}></div>
      <aside className={`drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <span className="logo"><span className="logo-mark"><Icon name="book" size={15} /></span><span>StudentHub</span></span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <Icon name="x" size={22} />
          </button>
        </div>
        {user && (
          <div className="drawer-profile">
            <span className="avatar-circle">{initials}</span>
            <div>
              <div className="profile-name">{user.name}</div>
              <div className="profile-role">{user.role === 'admin' ? 'Admin' : user.role === 'teacher' ? 'Teacher' : 'Student'}</div>
            </div>
          </div>
        )}
        <nav className="drawer-nav">
          {NAV_ITEMS.map(item => (
            <Link key={item.to} to={item.to} className="drawer-nav-item" onClick={() => setDrawerOpen(false)}>
              <Icon name={item.icon} size={19} /> {item.label}
            </Link>
          ))}
          {user && (
            <Link to="/dashboard" className="drawer-nav-item" onClick={() => setDrawerOpen(false)}>
              <Icon name="dashboard" size={19} /> My progress
            </Link>
          )}
          {user && (user.role === 'admin' || user.role === 'teacher') && (
            <Link to="/tests/create" className="drawer-nav-item" onClick={() => setDrawerOpen(false)}>
              <Icon name="plusCircle" size={19} /> Create a test
            </Link>
          )}
        </nav>
        <div className="drawer-footer">
          {user ? (
            <button className="drawer-nav-item logout-item" onClick={handleLogout}>
              <Icon name="logout" size={19} /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-outline-nav full-width" onClick={() => setDrawerOpen(false)}>Sign in</Link>
              <Link to="/register" className="btn-signin full-width" onClick={() => setDrawerOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
