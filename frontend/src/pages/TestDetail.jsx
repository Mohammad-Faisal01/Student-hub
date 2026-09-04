import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import CountdownTimer from '../components/CountdownTimer';

export default function TestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get(`/tests/${id}`);
    setTest(res.data);
  }

  useEffect(() => { load(); }, [id]);

  async function handleStart() {
    setStarting(true);
    setError('');
    try {
      await api.post(`/tests/${id}/start`);
      navigate(`/tests/${id}/take`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start test');
    } finally {
      setStarting(false);
    }
  }

  if (!test) return <div className="loading-text">Loading…</div>;

  if (test.submissionStatus === 'submitted') {
    return (
      <div className="page-wrap narrow">
        <h2>{test.title}</h2>
        <p className="page-sub">You've already submitted this test.</p>
        <Link to={`/tests/${id}/result`} className="btn-primary">View your result</Link>
      </div>
    );
  }

  if (test.submissionStatus === 'in_progress') {
    return (
      <div className="page-wrap narrow">
        <h2>{test.title}</h2>
        <p className="page-sub">You have an attempt in progress.</p>
        <Link to={`/tests/${id}/take`} className="btn-primary">Resume test</Link>
      </div>
    );
  }

  return (
    <div className="page-wrap narrow">
      <div className="test-lock-card">
        <div className="test-lock-icon"><Icon name={test.status === 'upcoming' ? 'lock' : 'play'} size={28} /></div>
        <h2>{test.title}</h2>
        <p className="page-sub">{test.subject} · {test.questionCount} questions · {test.durationMinutes} minutes</p>
        {test.description && <p className="test-description">{test.description}</p>}

        {test.status === 'upcoming' && (
          <>
            <div className="lock-message">This test is locked until its scheduled time.</div>
            <div className="big-countdown">
              <CountdownTimer target={test.scheduledAt} onComplete={load} />
            </div>
            <p className="test-scheduled-line">
              Unlocks {new Date(test.scheduledAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
            </p>
          </>
        )}

        {test.status === 'live' && (
          <>
            {error && <div className="form-error-banner">{error}</div>}
            <p className="lock-message">This test is live now. Once you start, your time limit begins immediately.</p>
            <button className="btn-primary full-width" onClick={handleStart} disabled={starting}>
              {starting ? 'Starting…' : 'Start test'}
            </button>
          </>
        )}

        {test.status === 'closed' && (
          <div className="lock-message">This test's window has closed. It's no longer available.</div>
        )}
      </div>
    </div>
  );
}
