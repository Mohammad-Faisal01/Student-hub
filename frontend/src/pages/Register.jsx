import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GRADES = ['6', '7', '8', '9', '10', '11', '12'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', level: 'school', classGrade: '10', college: '', branch: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');

    setSubmitting(true);
    try {
      await register({
        name: form.name, email: form.email, password: form.password, role: form.role,
        level: form.level,
        classGrade: form.level === 'school' ? form.classGrade : '',
        college: form.level === 'college' ? form.college : '',
        branch: form.level === 'college' ? form.branch : ''
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create an account</h2>
        {error && <div className="form-error-banner">{error}</div>}

        <label htmlFor="name">Full name</label>
        <input id="name" value={form.name} onChange={e => update('name', e.target.value)} required />

        <label htmlFor="reg-email">Email</label>
        <input id="reg-email" type="email" value={form.email} onChange={e => update('email', e.target.value)} required />

        <label htmlFor="role">I am a</label>
        <select id="role" value={form.role} onChange={e => update('role', e.target.value)}>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>

        <label htmlFor="level">I'm studying / teaching at</label>
        <select id="level" value={form.level} onChange={e => update('level', e.target.value)}>
          <option value="school">School (Class 6–12)</option>
          <option value="college">College / University</option>
        </select>

        {form.level === 'school' ? (
          <>
            <label htmlFor="grade">Class</label>
            <select id="grade" value={form.classGrade} onChange={e => update('classGrade', e.target.value)}>
              {GRADES.map(g => <option key={g} value={g}>Class {g}</option>)}
            </select>
          </>
        ) : (
          <>
            <label htmlFor="college">College name</label>
            <input id="college" value={form.college} onChange={e => update('college', e.target.value)} placeholder="e.g. NIU" />
            <label htmlFor="branch">Branch</label>
            <input id="branch" value={form.branch} onChange={e => update('branch', e.target.value)} placeholder="e.g. CSE" />
          </>
        )}

        <label htmlFor="reg-password">Password</label>
        <input id="reg-password" type="password" value={form.password} onChange={e => update('password', e.target.value)} required />

        <label htmlFor="confirm-password">Confirm password</label>
        <input id="confirm-password" type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} required />

        <button className="btn-primary full-width" type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Register'}
        </button>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <p className="auth-switch">Just browsing? <Link to="/">Continue as guest</Link> — you can read notes and doubts without an account.</p>
      </form>
    </div>
  );
}
