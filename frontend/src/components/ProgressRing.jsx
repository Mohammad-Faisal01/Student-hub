import React from 'react';

// percent: 0-100. Renders a circular progress ring using conic-gradient (no chart lib, no network dependency).
export default function ProgressRing({ percent, label, sublabel, size = 120, color = 'var(--primary)' }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const ringStyle = {
    width: size, height: size,
    background: `conic-gradient(${color} ${clamped * 3.6}deg, var(--gray-border) ${clamped * 3.6}deg)`
  };
  const innerSize = size - 18;

  return (
    <div className="progress-ring-wrap">
      <div className="progress-ring" style={ringStyle}>
        <div className="progress-ring-inner" style={{ width: innerSize, height: innerSize }}>
          <div className="progress-ring-value">{clamped}%</div>
        </div>
      </div>
      {label && <div className="progress-ring-label">{label}</div>}
      {sublabel && <div className="progress-ring-sublabel">{sublabel}</div>}
    </div>
  );
}
