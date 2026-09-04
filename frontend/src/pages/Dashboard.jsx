import React, { useEffect, useState } from 'react';
import api from '../api';
import Icon from '../components/Icon';
import ProgressRing from '../components/ProgressRing';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/users/me/stats').then(res => setStats(res.data));
  }, []);

  if (!stats) return <div className="loading-text">Loading your progress…</div>;

  return (
    <div className="page-wrap">
      <div className="dash-welcome">
        <span className="avatar-circle large">{user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</span>
        <div>
          <h2>Welcome back, {user.name.split(' ')[0]}</h2>
          <p className="page-sub">
            {user.role === 'teacher' ? 'Teacher' : user.role === 'admin' ? 'Admin' : 'Student'}
            {user.level === 'school' && ` · Class ${user.classGrade}`}
            {user.level === 'college' && ` · ${user.college}${user.branch ? ' · ' + user.branch : ''}`}
          </p>
        </div>
      </div>

      <div className="dash-rings">
        <ProgressRing percent={stats.avgScorePercent} label="Average test score" sublabel={`${stats.testsCompleted} test${stats.testsCompleted === 1 ? '' : 's'} completed`} color="var(--accent)" />
        <ProgressRing percent={stats.doubtsAsked === 0 ? 0 : Math.min(100, stats.doubtsAsked * 20)} label="Doubts asked" sublabel={`${stats.doubtsAsked} total`} />
        <ProgressRing percent={stats.doubtsAnswered === 0 ? 0 : Math.min(100, stats.doubtsAnswered * 20)} label="Doubts answered" sublabel={`${stats.doubtsAnswered} total`} color="var(--green-text)" />
      </div>

      <div className="dash-stat-cards">
        <div className="dash-stat-card">
          <Icon name="book" size={22} />
          <div className="dash-stat-num">{stats.notesUploaded}</div>
          <div className="dash-stat-label">Notes uploaded</div>
        </div>
        <div className="dash-stat-card">
          <Icon name="checkCircle" size={22} />
          <div className="dash-stat-num">{stats.testsCompleted}</div>
          <div className="dash-stat-label">Tests completed</div>
        </div>
        <div className="dash-stat-card">
          <Icon name="help" size={22} />
          <div className="dash-stat-num">{stats.doubtsAsked}</div>
          <div className="dash-stat-label">Doubts asked</div>
        </div>
        <div className="dash-stat-card">
          <Icon name="messageCircle" size={22} />
          <div className="dash-stat-num">{stats.doubtsAnswered}</div>
          <div className="dash-stat-label">Doubts answered</div>
        </div>
      </div>
    </div>
  );
}
