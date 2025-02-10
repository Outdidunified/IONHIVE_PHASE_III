const express = require('express');
const router = express.Router();
const Controller = require("../controllers/profileController");
const authUser = require("../middlewares/authenticated");

router.post('/deleteAccount', authUser.isAuthenticated,Controller.deleteAccount);

// Export the router
module.exports = router;