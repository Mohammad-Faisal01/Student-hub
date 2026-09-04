import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import CountdownTimer from '../components/CountdownTimer';

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: optionIndex }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/tests/${id}`).then(res => {
      if (res.data.submissionStatus === 'submitted') {
        navigate(`/tests/${id}/result`, { replace: true });
        return;
      }
      setTest(res.data);
    });
  }, [id, navigate]);

  function selectAnswer(questionId, optionIndex) {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  }

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({ questionId, selectedOptionIndex }))
      };
      await api.post(`/tests/${id}/submit`, payload);
      navigate(`/tests/${id}/result`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit test');
      setSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, id]);

  if (!test) return <div className="loading-text">Loading…</div>;

  const deadline = new Date(new Date(test.scheduledAt).getTime() + test.durationMinutes * 60000);
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="page-wrap narrow">
      <div className="take-test-header">
        <div>
          <h2>{test.title}</h2>
          <p className="page-sub">{answeredCount} of {test.questions.length} answered</p>
        </div>
        <div className="time-remaining">
          <div className="time-remaining-label">Time remaining</div>
          <CountdownTimer target={deadline} onComplete={handleSubmit} className="time-remaining-value" />
        </div>
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      {test.questions.map((q, idx) => (
        <div key={q._id} className="question-card">
          <div className="question-text">{idx + 1}. {q.questionText}</div>
          <div className="option-list">
            {q.options.map((opt, i) => (
              <label key={i} className={`option-item ${answers[q._id] === i ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={q._id}
                  checked={answers[q._id] === i}
                  onChange={() => selectAnswer(q._id, i)}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button className="btn-primary full-width" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit test'}
      </button>
    </div>
  );
}
