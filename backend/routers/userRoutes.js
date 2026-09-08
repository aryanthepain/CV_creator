const express = require('express');
const { getMyData, updateMyData, getMyProjects, getUserById } = require('../controllers/userController');
const { ensureAuth } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/my', ensureAuth, getMyData);

router.put('/my', ensureAuth, updateMyData);

router.get('/my/project', ensureAuth, getMyProjects);

router.get('/:userid', ensureAuth, getUserById);

module.exports = router;