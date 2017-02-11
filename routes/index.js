var express = require('express');
var auth = require('./auth');
var pwReset = require('./password-reset');
var login = require('./login');
var mjpeg = require('./mjpeg');
var settings = require('./settings');
var profile = require('./profile');

var router = express.Router();

// Static html files
router.get('/login', function (req, res, next) {
	res.render('login');
});

router.get('/', auth.isLoggedIn.web, function (req, res, next) {
	res.render('index');
});

//Logout
router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/login');
});

// API
router.post('/login', login)
router.post('/pw-reset', pwReset);
router.get('/mjpeg/:timestamp', auth.isLoggedIn.web, mjpeg);

// Settings
router.get('/settings', auth.isLoggedIn.api, settings.read);
router.post('/settings', auth.isLoggedIn.api, settings.update)

// Profile
router.get('/profile', auth.isLoggedIn.api, profile.read);
router.post('/profile', auth.isLoggedIn.api, profile.update);

module.exports = router;