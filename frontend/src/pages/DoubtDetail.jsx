import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';

export default function DoubtDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answerBody, setAnswerBody] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const res = await api.get(`/questions/${id}`);
    setQuestion(res.data);
  }

  useEffect(() => { load(); }, [id]);

  async function handleAnswer(e) {
    e.preventDefault();
    setError('');
    if (!answerBody.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/questions/${id}/answers`, { body: answerBody });
      setAnswerBody('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not post answer');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResolve() {
    try {
      await api.patch(`/questions/${id}/resolve`);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not update');
    }
  }

  if (!question) return <div className="loading-text">Loading…</div>;

  const canResolve = user && String(question.askedBy?._id) === String(user.id) && !question.resolved;

  return (
    <div className="page-wrap narrow">
      <div className="report-header">
        <div className="report-title">{question.title}</div>
        <div className="report-loc">{question.subject} · Asked by {question.askedBy?.name}</div>
        {question.resolved && <span className="badge resolved">Resolved</span>}
      </div>

      {question.body && <p className="doubt-body">{question.body}</p>}

      {canResolve && (
        <button className="btn-outline-dark" onClick={handleResolve}>
          <Icon name="checkCircle" size={16} /> Mark as resolved
        </button>
      )}

      <h3 className="answers-heading">{question.answers.length} Answer{question.answers.length === 1 ? '' : 's'}</h3>
      {question.answers.map((a, i) => (
        <div key={a._id || i} className="answer-card">
          <p>{a.body}</p>
          <div className="answer-meta">— {a.answeredBy?.name || 'Unknown'}</div>
        </div>
      ))}

      {user ? (
        <form className="inline-form" onSubmit={handleAnswer}>
          {error && <div className="form-error-banner">{error}</div>}
          <label htmlFor="answer">Your answer</label>
          <textarea id="answer" rows="3" value={answerBody} onChange={e => setAnswerBody(e.target.value)} placeholder="Share what you know…" />
          <button className="btn-primary full-width" type="submit" disabled={submitting}>
            {submitting ? 'Posting…' : 'Post answer'}
          </button>
        </form>
      ) : (
        <p className="loading-text">Sign in to answer this doubt.</p>
      )}
    </div>
  );
}
