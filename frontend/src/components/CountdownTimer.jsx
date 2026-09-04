import React, { useState, useEffect } from 'react';

function formatRemaining(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = n => String(n).padStart(2, '0');
  if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Counts down to `target` (a Date or ISO string). Calls onComplete once when it hits zero.
export default function CountdownTimer({ target, onComplete, className = '' }) {
  const [remaining, setRemaining] = useState(() => new Date(target).getTime() - Date.now());
  const [fired, setFired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(target).getTime() - Date.now();
      setRemaining(diff);
      if (diff <= 0 && !fired) {
        setFired(true);
        if (onComplete) onComplete();
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return <span className={className}>{formatRemaining(remaining)}</span>;
}
