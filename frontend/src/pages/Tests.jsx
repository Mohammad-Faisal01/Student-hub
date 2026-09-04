import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import CountdownTimer from '../components/CountdownTimer';

const STATUS_META = {
  upcoming: { label: 'Upcoming', cls: 'open' },
  live: { label: 'Live now', cls: 'progress' },
  closed: { label: 'Closed', cls: 'resolved' }
};

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await api.get('/tests');
      setTests(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function actionFor(t) {
    if (t.status === 'upcoming') return null;
    if (t.status === 'closed' && t.submissionStatus === 'not_started') return <span className="closed-note">Window closed</span>;
    if (t.submissionStatus === 'submitted') return <Link to={`/tests/${t._id}/result`} className="btn-outline-dark small">View result: {t.score}/{t.questionCount}</Link>;
    if (t.submissionStatus === 'in_progress') return <Link to={`/tests/${t._id}/take`} className="btn-primary small">Resume test</Link>;
    return <Link to={`/tests/${t._id}`} className="btn-primary small"><Icon name="play" size={14} /> Start test</Link>;
  }

  return (
    <div className="page-wrap">
      <h2>Tests</h2>
      <p className="page-sub">Tests unlock automatically at their scheduled time — questions stay hidden until then.</p>

      <div className="submissions">
        {loading && <div className="loading-text">Loading…</div>}
        {!loading && tests.length === 0 && <div className="loading-text">No tests scheduled yet.</div>}
        {!loading && tests.map(t => {
          const st = STATUS_META[t.status];
          return (
            <div key={t._id} className="sub-card test-card">
              <div className="sub-top">
                <div className="sub-title">{t.title}</div>
                <span className={`badge ${st.cls}`}>{st.label}</span>
              </div>
              <div className="sub-meta">{t.subject} · {t.questionCount} questions · {t.durationMinutes} min</div>
              {t.status === 'upcoming' && (
                <div className="test-countdown">
                  <Icon name="clockAlert" size={16} />
                  Unlocks in <CountdownTimer target={t.scheduledAt} onComplete={load} className="countdown-text" />
                </div>
              )}
              <div className="test-scheduled-line">
                Scheduled for {new Date(t.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              <div className="test-action">{actionFor(t)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
