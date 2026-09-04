import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';

export default function Doubts() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', body: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/questions');
      setQuestions(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAsk(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.subject.trim()) return setError('Title and subject are required');
    setSubmitting(true);
    try {
      await api.post('/questions', form);
      setForm({ title: '', subject: '', body: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not post question');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-header-row">
        <h2>Doubts</h2>
        {user && <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Icon name="plusCircle" size={17} /> {showForm ? 'Cancel' : 'Ask a doubt'}
        </button>}
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleAsk}>
          {error && <div className="form-error-banner">{error}</div>}
          <label htmlFor="q-title">Title</label>
          <input id="q-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Keep it short and specific" required />
          <label htmlFor="q-subject">Subject</label>
          <input id="q-subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures" required />
          <label htmlFor="q-body">Details</label>
          <textarea id="q-body" rows="4" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Explain what you're stuck on" />
          <button className="btn-primary full-width" type="submit" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post doubt'}
          </button>
        </form>
      )}

      <div className="submissions">
        {loading && <div className="loading-text">Loading…</div>}
        {!loading && questions.length === 0 && <div className="loading-text">No doubts posted yet.</div>}
        {!loading && questions.map(q => (
          <Link key={q._id} to={`/doubts/${q._id}`} className="sub-card visible">
            <div className="sub-top">
              <div className="sub-title">{q.title}</div>
              {q.resolved && <span className="badge resolved">Resolved</span>}
            </div>
            <div className="sub-meta">{q.subject} · Asked by {q.askedBy?.name || 'Unknown'}</div>
            <div className="sub-ai-row">
              <span className="ai-priority"><Icon name="messageCircle" size={14} /> {q.answers.length} answer{q.answers.length === 1 ? '' : 's'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
