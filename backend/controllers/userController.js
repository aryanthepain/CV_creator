const User = require('../models/userModel'); 
const Project = require('../models/projectModel');

exports.getMyData = async (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      try {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId).select('-password').populate('projects', 'name visibility');
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.status(200).json(user);
      } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
      }
    } else {
      return res.status(401).json({ message: 'Not authenticated' });
    }
  };

exports.updateMyData = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const userId = req.user._id || req.user.id;
        const body = req.body || {};

        // Whitelist allowed profile update fields to prevent mass assignment
        const allowedFields = ['name', 'imageURL'];
        const updates = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getMyProjects = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const userId = req.user._id || req.user.id;
       
        const projects = await Project.find({
            $or: [
                { owner: userId },
                { users: userId }
            ]
        }).populate('owner', 'name email').populate('users', 'name email'); 

        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { userid } = req.params;
        const user = await User.findById(userid).select('-password').populate('projects', 'name visibility'); 

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};