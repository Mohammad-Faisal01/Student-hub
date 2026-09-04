import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function Home() {
  const { user } = useAuth();

  return (
    <section className="hero">
      <div className="hero-text">
        <div className="eyebrow">FOR STUDENTS, BY STUDENTS</div>
        <h1>Notes, doubts, and tests —<br />all in one place.</h1>
        <p>Share notes with your batch, get your doubts answered, and take scheduled tests the moment they go live.</p>
        <div className="hero-actions">
          {user ? (
            <>
              <Link to="/tests" className="btn-primary">See upcoming tests <Icon name="clock" size={17} /></Link>
              <Link to="/notes" className="btn-outline">Browse notes</Link>
            </>
          ) : (
            <>
              <Link to="/register" className="btn-primary">Get started</Link>
              <Link to="/login" className="btn-outline">Sign in</Link>
            </>
          )}
        </div>
      </div>
      <div className="hero-cards">
        <Link to="/notes" className="hero-card">
          <Icon name="book" size={26} />
          <div className="hero-card-title">Notes</div>
          <div className="hero-card-sub">Upload &amp; browse by subject</div>
        </Link>
        <Link to="/doubts" className="hero-card">
          <Icon name="help" size={26} />
          <div className="hero-card-title">Doubts</div>
          <div className="hero-card-sub">Ask, answer, resolve</div>
        </Link>
        <Link to="/tests" className="hero-card">
          <Icon name="clockAlert" size={26} />
          <div className="hero-card-title">Tests</div>
          <div className="hero-card-sub">Scheduled, locked until go-time</div>
        </Link>
        <Link to="/community" className="hero-card">
          <Icon name="users" size={26} />
          <div className="hero-card-title">Community</div>
          <div className="hero-card-sub">Live chat, ask anything</div>
        </Link>
      </div>
    </section>
  );
}
