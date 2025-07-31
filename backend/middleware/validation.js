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

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  isValidEmail,
  isValidPassword
};