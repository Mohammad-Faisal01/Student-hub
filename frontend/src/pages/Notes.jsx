import React, { useEffect, useState } from 'react';
import api, { API_BASE } from '../api';
import Icon from '../components/Icon';
import { useAuth } from '../context/AuthContext';

const UPLOADS_BASE = API_BASE.replace('/api', '/uploads');

export default function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', subject: '', description: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/notes');
      setNotes(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(e) {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.subject.trim()) return setError('Title and subject are required');

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('subject', form.subject);
      data.append('description', form.description);
      if (file) data.append('file', file);
      await api.post('/notes', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm({ title: '', subject: '', description: '' });
      setFile(null);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Are you logged in?');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownload(note) {
    if (note.file) {
      window.open(`${UPLOADS_BASE}/${note.file}`, '_blank');
      api.patch(`/notes/${note._id}/download`).catch(() => {});
    }
  }

  return (
    <div className="page-wrap">
      <div className="page-header-row">
        <h2>Notes</h2>
        {user && <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Icon name="upload" size={17} /> {showForm ? 'Cancel' : 'Upload notes'}
        </button>}
      </div>

      {showForm && (
        <form className="inline-form" onSubmit={handleUpload}>
          {error && <div className="form-error-banner">{error}</div>}
          <label htmlFor="n-title">Title</label>
          <input id="n-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <label htmlFor="n-subject">Subject</label>
          <input id="n-subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures" required />
          <label htmlFor="n-desc">Description</label>
          <textarea id="n-desc" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <label htmlFor="n-file">File (PDF, Word, or image)</label>
          <input id="n-file" type="file" accept=".pdf,.doc,.docx,image/*" onChange={e => setFile(e.target.files[0])} />
          <button className="btn-primary full-width" type="submit" disabled={submitting}>
            {submitting ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      )}

      <div className="card-grid">
        {loading && <div className="loading-text">Loading notes…</div>}
        {!loading && notes.length === 0 && <div className="loading-text">No notes yet.</div>}
        {!loading && notes.map(n => (
          <div key={n._id} className="note-card">
            <div className="note-subject-tag">{n.subject}</div>
            <div className="note-title">{n.title}</div>
            {n.description && <p className="note-desc">{n.description}</p>}
            <div className="note-meta">
              <span>By {n.uploadedBy?.name || 'Unknown'}</span>
              <span>{n.downloads} download{n.downloads === 1 ? '' : 's'}</span>
            </div>
            {n.file && (
              <button className="btn-outline-dark full-width" onClick={() => handleDownload(n)}>
                <Icon name="download" size={16} /> Download
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
