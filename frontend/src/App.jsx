import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Notes from './pages/Notes';
import Doubts from './pages/Doubts';
import DoubtDetail from './pages/DoubtDetail';
import Tests from './pages/Tests';
import TestDetail from './pages/TestDetail';
import TakeTest from './pages/TakeTest';
import TestResult from './pages/TestResult';
import CreateTest from './pages/CreateTest';
import Dashboard from './pages/Dashboard';
import Community from './pages/Community';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/doubts" element={<Doubts />} />
            <Route path="/doubts/:id" element={<DoubtDetail />} />
            <Route path="/tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
            <Route path="/tests/create" element={<ProtectedRoute roles={['admin', 'teacher']}><CreateTest /></ProtectedRoute>} />
            <Route path="/tests/:id" element={<ProtectedRoute><TestDetail /></ProtectedRoute>} />
            <Route path="/tests/:id/take" element={<ProtectedRoute><TakeTest /></ProtectedRoute>} />
            <Route path="/tests/:id/result" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/community" element={<Community />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}
