import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return <div className="loading-text">Page not found. <Link to="/">Go home</Link></div>;
}
