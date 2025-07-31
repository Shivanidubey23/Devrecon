const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getAllProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { isPublic: true };
    
    // Search functionality
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Filter by technologies
    if (req.query.technologies) {
      const techs = req.query.technologies.split(',');
      query.technologies = { $in: techs };
    }
    
    // Filter by difficulty
    if (req.query.difficulty) {
      query.difficulty = req.query.difficulty;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    const projects = await Project.find(query)
      .populate('owner', 'name avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Project.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching projects'
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name avatar email bio skills')
      .populate('comments.author', 'name avatar');
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if project is public or owned by requesting user
    if (!project.isPublic && (!req.user || project.owner._id.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Project is private.'
      });
    }
    
    // Increment views (but not for owner)
    if (!req.user || project.owner._id.toString() !== req.user.id) {
      await project.incrementViews();
    }
    
    res.status(200).json({
      success: true,
      data: {
        project
      }
    });
    
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching project'
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      technologies,
      githubUrl,
      liveUrl,
      imageUrl,
      status,
      difficulty,
      tags,
      isPublic
    } = req.body;
    
    const project = await Project.create({
      title,
      description,
      shortDescription,
      technologies,
      githubUrl,
      liveUrl,
      imageUrl,
      status: status || 'completed',
      difficulty: difficulty || 'intermediate',
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      owner: req.user.id
    });
    
    const populatedProject = await Project.findById(project._id)
      .populate('owner', 'name avatar email');
    
    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project: populatedProject
      }
    });
    
  } catch (error) {
    console.error('Create project error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating project'
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check ownership
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own projects.'
      });
    }
    
    const updateFields = {
      title: req.body.title,
      description: req.body.description,
      shortDescription: req.body.shortDescription,
      technologies: req.body.technologies,
      githubUrl: req.body.githubUrl,
      liveUrl: req.body.liveUrl,
      imageUrl: req.body.imageUrl,
      status: req.body.status,
      difficulty: req.body.difficulty,
      tags: req.body.tags,
      isPublic: req.body.isPublic
    };
    
    // Remove undefined fields
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });
    
    project = await Project.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    ).populate('owner', 'name avatar email');
    
    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: {
        project
      }
    });
    
  } catch (error) {
    console.error('Update project error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating project'
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check ownership
    if (project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own projects.'
      });
    }
    
    await Project.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting project'
    });
  }
};

// @desc    Get user's projects
// @route   GET /api/projects/user/:userId
// @access  Public
const getUserProjects = async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Build query - show public projects, or all if owner is requesting
    let query = { owner: userId };
    if (!req.user || req.user.id !== userId) {
      query.isPublic = true;
    }
    
    const projects = await Project.find(query)
      .populate('owner', 'name avatar email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Project.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        projects,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user projects'
    });
  }
};

// @desc    Add comment to project
// @route   POST /api/projects/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Check if project is public or accessible
    if (!project.isPublic && project.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot comment on private project'
      });
    }
    
    await project.addComment(req.user.id, content.trim());
    
    // Get updated project with populated comments
    const updatedProject = await Project.findById(req.params.id)
      .populate('comments.author', 'name avatar')
      .populate('owner', 'name avatar email');
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        project: updatedProject
      }
    });
    
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

// @desc    Delete comment
// @route   DELETE /api/projects/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    await project.removeComment(req.params.commentId, req.user.id);
    
    // Get updated project with populated comments
    const updatedProject = await Project.findById(req.params.id)
      .populate('comments.author', 'name avatar')
      .populate('owner', 'name avatar email');
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: {
        project: updatedProject
      }
    });
    
  } catch (error) {
    console.error('Delete comment error:', error);
    
    if (error.message === 'Comment not found' || error.message === 'Not authorized to delete this comment') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while deleting comment'
    });
  }
};

// @desc    Toggle project like
// @route   POST /api/projects/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    await project.toggleLike(req.user.id);
    
    const updatedProject = await Project.findById(req.params.id)
      .populate('owner', 'name avatar email');
    
    res.status(200).json({
      success: true,
      message: 'Like toggled successfully',
      data: {
        project: updatedProject,
        likeCount: updatedProject.likeCount
      }
    });
    
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling like'
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getUserProjects,
  addComment,
  deleteComment,
  toggleLike
};