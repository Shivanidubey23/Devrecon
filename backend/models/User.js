const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxLength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
      'Please enter a valid GitHub URL'
    ]
  },
  linkedinUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
      'Please enter a valid LinkedIn URL'
    ]
  },
  portfolioUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/.+$/,
      'Please enter a valid URL'
    ]
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    maxLength: [100, 'Location cannot exceed 100 characters'],
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's projects
userSchema.virtual('projects', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'owner'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with salt of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ name: 'text', skills: 'text' });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);