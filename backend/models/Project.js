const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxLength: [1000, 'Comment cannot exceed 1000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxLength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxLength: [200, 'Short description cannot exceed 200 characters']
  },
  technologies: [{
    type: String,
    required: true,
    trim: true
  }],
  githubUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/,
      'Please enter a valid GitHub repository URL'
    ]
  },
  liveUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/.+$/,
      'Please enter a valid live demo URL'
    ]
  },
  imageUrl: {
    type: String,
    trim: true,
    match: [
      /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
      'Please enter a valid image URL'
    ]
  },
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'on-hold'],
    default: 'completed'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comments: [commentSchema],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comment count
projectSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for like count
projectSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Method to add a comment
projectSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    content: content,
    author: userId
  });
  return this.save();
};

// Method to remove a comment
projectSchema.methods.removeComment = function(commentId, userId) {
  const comment = this.comments.id(commentId);
  
  if (!comment) {
    throw new Error('Comment not found');
  }
  
  // Check if user owns the comment or the project
  if (comment.author.toString() !== userId.toString() && 
      this.owner.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this comment');
  }
  
  comment.remove();
  return this.save();
};

// Method to toggle like
projectSchema.methods.toggleLike = function(userId) {
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (existingLike) {
    // Remove like
    this.likes.pull({ _id: existingLike._id });
  } else {
    // Add like
    this.likes.push({ user: userId });
  }
  
  return this.save();
};

// Method to increment views
projectSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get featured projects
projectSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ featured: true, isPublic: true })
    .populate('owner', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to search projects
projectSchema.statics.searchProjects = function(searchTerm, filters = {}) {
  const query = { isPublic: true };
  
  // Text search
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  // Apply filters
  if (filters.technologies && filters.technologies.length > 0) {
    query.technologies = { $in: filters.technologies };
  }
  
  if (filters.difficulty) {
    query.difficulty = filters.difficulty;
  }
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  return this.find(query)
    .populate('owner', 'name avatar')
    .sort({ createdAt: -1 });
};

// Create indexes for better search and query performance
projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });
projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ technologies: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ difficulty: 1 });
projectSchema.index({ featured: 1, isPublic: 1 });
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);