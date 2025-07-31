const express = require('express');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getUserProjects,
  addComment,
  deleteComment,
  toggleLike
} = require('../controllers/projectController');
const { protect, optionalAuth } = require('../middleware/auth');
const { validateProject, validateComment } = require('../middleware/validation');

const router = express.Router();

// Public routes (no authentication required)
router.get('/', optionalAuth, getAllProjects);
router.get('/user/:userId', optionalAuth, getUserProjects);

// Semi-protected route (optional auth for view counting)
router.get('/:id', optionalAuth, getProjectById);

// Protected routes (require authentication)
router.use(protect); // All routes below require authentication

router.post('/', validateProject, createProject);
router.put('/:id', validateProject, updateProject);
router.delete('/:id', deleteProject);

// Comment routes
router.post('/:id/comments', validateComment, addComment);
router.delete('/:id/comments/:commentId', deleteComment);

// Like routes
router.post('/:id/like', toggleLike);

module.exports = router;