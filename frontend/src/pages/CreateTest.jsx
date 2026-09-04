import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';

function emptyQuestion() {
  return { questionText: '', options: ['', ''], correctOptionIndex: 0 };
}

export default function CreateTest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', subject: '', description: '', scheduledAt: '', durationMinutes: 30 });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function updateQuestion(qIdx, field, value) {
    setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, [field]: value } : q));
  }
  function updateOption(qIdx, oIdx, value) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const options = [...q.options];
      options[oIdx] = value;
      return { ...q, options };
    }));
  }
  function addOption(qIdx) {
    setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, options: [...q.options, ''] } : q));
  }
  function removeOption(qIdx, oIdx) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const options = q.options.filter((_, idx) => idx !== oIdx);
      const correctOptionIndex = q.correctOptionIndex >= options.length ? 0 : q.correctOptionIndex;
      return { ...q, options, correctOptionIndex };
    }));
  }
  function addQuestion() {
    setQuestions(prev => [...prev, emptyQuestion()]);
  }
  function removeQuestion(qIdx) {
    setQuestions(prev => prev.filter((_, i) => i !== qIdx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.subject.trim() || !form.scheduledAt) {
      return setError('Title, subject, and scheduled time are required');
    }
    if (new Date(form.scheduledAt) <= new Date()) {
      return setError('Scheduled time must be in the future');
    }
    for (const q of questions) {
      if (!q.questionText.trim()) return setError('Every question needs text');
      if (q.options.some(o => !o.trim())) return setError('Every option needs text (no blanks)');
      if (q.options.length < 2) return setError('Every question needs at least 2 options');
    }

    setSubmitting(true);
    try {
      const res = await api.post('/tests', {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        questions
      });
      navigate(`/tests/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create test');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-wrap narrow">
      <h2>Create a test</h2>
      <p className="page-sub">Set the exact date and time it should unlock. Questions stay hidden from students until then.</p>

      <form className="inline-form" onSubmit={handleSubmit}>
        {error && <div className="form-error-banner">{error}</div>}

        <label htmlFor="t-title">Title</label>
        <input id="t-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />

        <label htmlFor="t-subject">Subject</label>
        <input id="t-subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />

        <label htmlFor="t-desc">Description (optional)</label>
        <textarea id="t-desc" rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

        <div className="form-row-two">
          <div>
            <label htmlFor="t-schedule">Scheduled date &amp; time</label>
            <input id="t-schedule" type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="t-duration">Duration (minutes)</label>
            <input id="t-duration" type="number" min="1" value={form.durationMinutes} onChange={e => setForm({ ...form, durationMinutes: e.target.value })} required />
          </div>
        </div>

        <h3 className="answers-heading">Questions</h3>
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="question-builder-card">
            <div className="question-builder-header">
              <span>Question {qIdx + 1}</span>
              {questions.length > 1 && (
                <button type="button" className="icon-btn" onClick={() => removeQuestion(qIdx)}><Icon name="trash" size={16} /></button>
              )}
            </div>
            <textarea
              rows="2" placeholder="Question text"
              value={q.questionText}
              onChange={e => updateQuestion(qIdx, 'questionText', e.target.value)}
            />
            {q.options.map((opt, oIdx) => (
              <div key={oIdx} className="option-builder-row">
                <input
                  type="radio"
                  name={`correct-${qIdx}`}
                  checked={q.correctOptionIndex === oIdx}
                  onChange={() => updateQuestion(qIdx, 'correctOptionIndex', oIdx)}
                  title="Mark as correct answer"
                />
                <input
                  type="text" placeholder={`Option ${oIdx + 1}`}
                  value={opt}
                  onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                />
                {q.options.length > 2 && (
                  <button type="button" className="icon-btn" onClick={() => removeOption(qIdx, oIdx)}><Icon name="x" size={15} /></button>
                )}
              </div>
            ))}
            <button type="button" className="btn-outline-dark small" onClick={() => addOption(qIdx)}>+ Add option</button>
          </div>
        ))}

        <button type="button" className="btn-outline-dark full-width" onClick={addQuestion}>
          <Icon name="plusCircle" size={16} /> Add another question
        </button>

        <button className="btn-primary full-width" type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Schedule test'}
        </button>
      </form>
    </div>
  );
}
