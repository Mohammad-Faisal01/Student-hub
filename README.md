# StudentHub — Prototype

A full-stack MERN app: notes sharing, a doubt (Q&A) board, scheduled tests that
stay locked until their exact start time, a live community chat, and progress
tracking — for students from Class 6 through college. Built with React (Vite) +
Express + MongoDB + Socket.io.

---

## ✅ What's built and working

**Accounts & roles**
- Register/login, bcrypt-hashed passwords, JWT auth, duplicate-email protection
- Session persists across reloads (JWT stored, restored automatically) until you log out
- **Three account roles:** Student, Teacher, Admin (see seeded accounts below)
- **Guest browsing:** notes and doubts are visible without an account — no login wall
  for reading; posting/uploading/testing/chatting requires an account
- School (Class 6–12) or College/University selection at signup, used to tag your
  notes, doubts, and profile

**Notes**
- Upload with title, subject, topic, description, and a file (PDF/Word/image)
- Browse by subject, download counter

**Doubts (Q&A)**
- Post a question, anyone can answer, only the original asker can mark it resolved

**Scheduled tests — the centerpiece feature**
- **Admin or Teacher** creates a test in advance: exact date/time, duration, and a
  full set of MCQ questions with correct answers already set
- Every student gets an in-app notification the moment a test is scheduled
- Live countdown to unlock — questions are withheld from the server entirely
  until the scheduled time, not just hidden by CSS
- Auto-unlocks at the scheduled second; countdown during the test **auto-submits**
  when time runs out; manual submit button also available
- One attempt per student per test
- **Result page:** circular progress ring showing percentage, a compliment message
  based on your score tier, and a full question-by-question review (correct vs. your answer)

**Progress dashboard**
- Circular progress rings (pure CSS, no chart library) for average test score,
  doubts asked, and doubts answered
- Stat cards: notes uploaded, tests completed, doubts asked/answered

**Community — real-time chat**
- Built with Socket.io — genuinely real-time, not polling
- Three rooms: General, School Zone, College Zone
- Messages persist in MongoDB, last 50 loaded on room switch
- Live connection indicator

**Notifications**
- Bell icon, unread badge, click to jump straight to a test

**Navigation**
- Responsive navbar with slide-in mobile drawer, inline SVG icons throughout
  (no external icon font — won't go invisible on a flaky connection)

**About**
- Contact page with your name and social links — update the placeholder URLs in
  `frontend/src/pages/About.jsx` with your real profiles

## ⚠️ Honest scope notes

- **"Guest" is unauthenticated browsing**, not a separate account type — this is
  the correct/simpler way to do it (no guest login needed to just look around)
- **Chat has 3 fixed rooms**, not per-subject or DM/private messaging — a real
  next step if you want it, but a meaningfully bigger feature
- **No real email/SMS** — notifications are in-app only
- **No production hardening** — rate limiting, refresh tokens, etc. are not in scope
  for a prototype
- **Visual redesign is partial, not total** — the hero, dashboard, chat, and About
  pages got a real "futuristic" pass (animated gradient blobs, circular progress
  rings, glassmorphism-style cards). Notes/Doubts/Tests list pages kept the
  original clean card style rather than being fully re-skinned — easy to extend
  the same visual language there later if you want full consistency

---

## Project structure

```
studenthub/
  backend/     Express API + MongoDB (Mongoose) + Socket.io
  frontend/    React app (Vite)
```

## Setup — Backend

```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env`:
- `MONGODB_URI` — local MongoDB or Atlas connection string
- `JWT_SECRET` — any string for local dev
- `PORT` — defaults to **5001**

```bash
npm run seed    # creates demo accounts + a demo test scheduled 3 minutes out
npm start       # starts the API + Socket.io on the same port
```

## Setup — Frontend

New terminal:
```bash
cd frontend
npm install
cp .env.example .env    # only if backend isn't on localhost:5001
npm run dev              # starts on http://localhost:5174
```

---

## Demo accounts (from `npm run seed`)

| Role            | Email                          | Password     |
|-----------------|----------------------------------|---------------|
| Admin           | admin@studenthub.local           | Admin@123     |
| Teacher         | teacher@studenthub.local         | Teacher@123   |
| Student (college)| student@studenthub.local        | Student@123   |
| Student (school, Class 10) | schoolstudent@studenthub.local | Student@123 |

## Demo flow

1. `npm run seed` creates a demo test scheduled **3 minutes out** — log in as a
   student, go to Tests, watch it unlock live, take it, see your scorecard
2. Log in as the teacher → **Create a test** → schedule your own with real questions
3. Open **Community** in two different browser windows (or one normal + one
   incognito, logged in as two different accounts) and chat between them live
4. Check **My progress** in the profile dropdown to see the circular stat rings update
   as you ask doubts, answer them, and complete tests

