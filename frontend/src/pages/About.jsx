import React from 'react';
import Icon from '../components/Icon';

const SOCIALS = [
  { name: 'twitter', label: 'Twitter / X', href: 'https://twitter.com/', icon: 'twitter' },
  { name: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/', icon: 'linkedin' },
  { name: 'instagram', label: 'Instagram', href: 'https://instagram.com/', icon: 'instagram' },
  { name: 'facebook', label: 'Facebook', href: 'https://facebook.com/', icon: 'facebook' },
  { name: 'github', label: 'GitHub', href: 'https://github.com/', icon: 'github' }
];

export default function About() {
  return (
    <div className="page-wrap narrow about-page">
      <div className="about-hero">
        <div className="about-avatar">MF</div>
        <h2>Mohammad Faisal</h2>
        <p className="page-sub">Builder of StudentHub — notes, doubts, and tests, all in one place.</p>
      </div>

      <div className="about-body">
        <p>
          StudentHub started as a simple idea: students from Class 6 all the way through
          college shouldn't need five different apps to share notes, ask a doubt, and take
          a scheduled test. This is a working prototype of that idea — built end to end,
          from the database up.
        </p>
      </div>

      <h3 className="answers-heading">Get in touch</h3>
      <div className="social-grid">
        {SOCIALS.map(s => (
          <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="social-card">
            <Icon name={s.icon} size={22} />
            <span>{s.label}</span>
          </a>
        ))}
      </div>

      <p className="about-note">
        <Icon name="mail" size={15} /> Update the links above in <code>src/pages/About.jsx</code> with your real profile URLs.
      </p>
    </div>
  );
}
