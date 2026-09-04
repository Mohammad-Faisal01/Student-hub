const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  level: { type: String, enum: ['school', 'college', ''], default: '' },
  classGrade: { type: String, default: '' }, // e.g. "6".."12", only used when level === 'school'
  college: { type: String, default: '' },
  branch: { type: String, default: '' }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toSafeObject = function () {
  return {
    id: this._id, name: this.name, email: this.email, role: this.role,
    level: this.level, classGrade: this.classGrade, college: this.college, branch: this.branch
  };
};

module.exports = mongoose.model('User', UserSchema);
