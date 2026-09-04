import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';
import ProgressRing from '../components/ProgressRing';

function complimentFor(pct) {
  if (pct >= 90) return { text: "Outstanding! You've really mastered this.", icon: 'star' };
  if (pct >= 75) return { text: 'Great job — solid understanding here.', icon: 'trophy' };
  if (pct >= 50) return { text: 'Good effort. A bit more practice and you\'ll nail it.', icon: 'checkCircle' };
  return { text: "Keep practicing — review the questions below and try again.", icon: 'help' };
}

export default function TestResult() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/tests/${id}/result`)
      .then(res => setResult(res.data))
      .catch(err => setError(err.response?.data?.error || 'Could not load result'));
  }, [id]);

  if (error) return <div className="loading-text">{error}</div>;
  if (!result) return <div className="loading-text">Loading…</div>;

  const pct = Math.round((result.score / result.totalQuestions) * 100);
  const compliment = complimentFor(pct);

  return (
    <div className="page-wrap narrow">
      <div className="result-score-card">
        <ProgressRing percent={pct} size={150} color="var(--accent)" />
        <div className="result-score-num">{result.score} / {result.totalQuestions} correct</div>
        <div className="result-compliment"><Icon name={compliment.icon} size={18} /> {compliment.text}</div>
      </div>

      <h3 className="answers-heading">Review</h3>
      {result.questions.map((q, idx) => {
        return (
          <div key={q._id} className="question-card">
            <div className="question-text">{idx + 1}. {q.questionText}</div>
            <div className="option-list">
              {q.options.map((opt, i) => {
                let cls = 'option-item review';
                if (i === q.correctOptionIndex) cls += ' correct';
                else if (i === q.yourAnswer) cls += ' incorrect';
                return <div key={i} className={cls}>{opt}{i === q.correctOptionIndex ? ' ✓' : (i === q.yourAnswer ? ' ✗' : '')}</div>;
              })}
            </div>
            {q.yourAnswer === null && <div className="unanswered-note">You did not answer this question.</div>}
          </div>
        );
      })}
    </div>
  );
}
