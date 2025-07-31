// Email validation
const isValidEmail = (email) => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Password validation
const isValidPassword = (password) => {
  // At least 6 characters
  if (password.length < 6) return false;
  
  // Contains at least one letter and one number (optional for MVP)
  // const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;
  // return passwordRegex.test(password);
  
  return true; // Simple validation for MVP
};

// Validate registration input
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];
  
  // Check required fields
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  }
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email');
  }
  
  if (!password) {
    errors.push('Password is required');
  } else if (!isValidPassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Check name length
  if (name && name.trim().length > 50) {
    errors.push('Name cannot exceed 50 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Sanitize input
  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  
  next();
};

// Validate login input
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];
  
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email');
  }
  
  if (!password) {
    errors.push('Password is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Sanitize input
  req.body.email = email.trim().toLowerCase();
  
  next();
};

// Validate profile update
const validateProfileUpdate = (req, res, next) => {
  const { name, bio, skills, githubUrl, linkedinUrl, portfolioUrl, location } = req.body;
  const errors = [];
  
  // Validate name if provided
  if (name !== undefined) {
    if (name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (name.trim().length > 50) {
      errors.push('Name cannot exceed 50 characters');
    }
  }
  
  // Validate bio if provided
  if (bio !== undefined && bio.length > 500) {
    errors.push('Bio cannot exceed 500 characters');
  }
  
  // Validate location if provided
  if (location !== undefined && location.length > 100) {
    errors.push('Location cannot exceed 100 characters');
  }
  
  // Validate URLs if provided
  const urlRegex = /^https?:\/\/.+$/;
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/;
  const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/;
  
  if (githubUrl !== undefined && githubUrl.trim() !== '' && !githubRegex.test(githubUrl)) {
    errors.push('Please provide a valid GitHub URL');
  }
  
  if (linkedinUrl !== undefined && linkedinUrl.trim() !== '' && !linkedinRegex.test(linkedinUrl)) {
    errors.push('Please provide a valid LinkedIn URL');
  }
  
  if (portfolioUrl !== undefined && portfolioUrl.trim() !== '' && !urlRegex.test(portfolioUrl)) {
    errors.push('Please provide a valid portfolio URL');
  }
  
  // Validate skills array
  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      errors.push('Skills must be an array');
    } else if (skills.length > 20) {
      errors.push('Cannot have more than 20 skills');
    }
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

// Validate project creation/update
const validateProject = (req, res, next) => {
  const { title, description, technologies } = req.body;
  const errors = [];
  
  // Check required fields
  if (!title || title.trim().length === 0) {
    errors.push('Project title is required');
  } else if (title.trim().length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }
  
  if (!description || description.trim().length === 0) {
    errors.push('Project description is required');
  } else if (description.trim().length > 2000) {
    errors.push('Description cannot exceed 2000 characters');
  }
  
  if (!technologies || !Array.isArray(technologies) || technologies.length === 0) {
    errors.push('At least one technology is required');
  } else if (technologies.length > 20) {
    errors.push('Cannot have more than 20 technologies');
  }
  
  // Validate optional fields
  if (req.body.shortDescription && req.body.shortDescription.length > 200) {
    errors.push('Short description cannot exceed 200 characters');
  }
  
  // Validate URLs
  const urlRegex = /^https?:\/\/.+$/;
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/.+/;
  
  if (req.body.githubUrl && !githubRegex.test(req.body.githubUrl)) {
    errors.push('Please provide a valid GitHub repository URL');
  }
  
  if (req.body.liveUrl && !urlRegex.test(req.body.liveUrl)) {
    errors.push('Please provide a valid live demo URL');
  }
  
  if (req.body.imageUrl && !urlRegex.test(req.body.imageUrl)) {
    errors.push('Please provide a valid image URL');
  }
  
  // Validate enums
  const validStatuses = ['planning', 'in-progress', 'completed', 'on-hold'];
  if (req.body.status && !validStatuses.includes(req.body.status)) {
    errors.push('Invalid project status');
  }
  
  const validDifficulties = ['beginner', 'intermediate', 'advanced'];
  if (req.body.difficulty && !validDifficulties.includes(req.body.difficulty)) {
    errors.push('Invalid difficulty level');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Sanitize input
  req.body.title = title.trim();
  req.body.description = description.trim();
  if (req.body.shortDescription) {
    req.body.shortDescription = req.body.shortDescription.trim();
  }
  
  next();
};

// Validate comment content
const validateComment = (req, res, next) => {
  const { content } = req.body;
  const errors = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('Comment content is required');
  } else if (content.trim().length > 1000) {
    errors.push('Comment cannot exceed 1000 characters');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateProject,
  validateComment,
  isValidEmail,
  isValidPassword
};