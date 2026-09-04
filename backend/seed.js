const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Test = require('./models/Test');
const Note = require('./models/Note');
const Question = require('./models/Question');

async function seed() {
  const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studenthub';
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding');

  const accounts = [
    { name: 'Admin', email: 'admin@studenthub.local', password: 'Admin@123', role: 'admin' },
    { name: 'Demo Teacher', email: 'teacher@studenthub.local', password: 'Teacher@123', role: 'teacher', level: 'college', college: 'NIU', branch: 'CSE' },
    { name: 'Demo Student', email: 'student@studenthub.local', password: 'Student@123', role: 'student', level: 'college', college: 'NIU', branch: 'CSE' },
    { name: 'Demo School Student', email: 'schoolstudent@studenthub.local', password: 'Student@123', role: 'student', level: 'school', classGrade: '10' }
  ];
  const created = {};
  for (const acc of accounts) {
    let user = await User.findOne({ email: acc.email });
    if (!user) {
      user = await User.create(acc);
      console.log(`Created: ${acc.email} / ${acc.password} (role: ${acc.role})`);
    } else {
      console.log(`Already exists: ${acc.email}`);
    }
    created[acc.role] = user;
  }

  // A demo test scheduled 3 minutes from now, so you can watch it unlock live
  const demoScheduledAt = new Date(Date.now() + 3 * 60 * 1000);
  const existingTest = await Test.findOne({ title: 'Demo DSA Quiz' });
  if (!existingTest) {
    await Test.create({
      title: 'Demo DSA Quiz',
      subject: 'Data Structures',
      description: 'A short 3-question demo quiz to show the locked-until-start-time flow.',
      scheduledAt: demoScheduledAt,
      durationMinutes: 10,
      createdBy: created.admin._id,
      questions: [
        { questionText: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'], correctOptionIndex: 1 },
        { questionText: 'Which data structure uses LIFO order?', options: ['Queue', 'Stack', 'Array', 'Linked List'], correctOptionIndex: 1 },
        { questionText: 'What does DFS stand for?', options: ['Depth First Search', 'Data Flow System', 'Direct File Search', 'Double Free Space'], correctOptionIndex: 0 }
      ]
    });
    console.log(`Created demo test scheduled for ${demoScheduledAt.toLocaleString()}`);
  } else {
    console.log('Demo test already exists');
  }

  const existingNote = await Note.findOne({ title: 'Arrays and Strings Cheat Sheet' });
  if (!existingNote) {
    await Note.create({
      title: 'Arrays and Strings Cheat Sheet',
      subject: 'Data Structures',
      description: 'Quick reference for common array and string patterns.',
      uploadedBy: created.admin._id
    });
    console.log('Created a demo note');
  }

  const existingQ = await Question.findOne({ title: 'How does recursion actually work under the hood?' });
  if (!existingQ) {
    await Question.create({
      title: 'How does recursion actually work under the hood?',
      body: "I understand the syntax but I don't get how the call stack keeps track of everything.",
      subject: 'Data Structures',
      askedBy: created.student._id
    });
    console.log('Created a demo question');
  }

  console.log('\nSeeding complete.');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
