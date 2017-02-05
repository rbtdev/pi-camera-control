var express = require('express');
var auth = require('./auth');
var pwReset = require('./password-reset');
var login = require('./login');
var mjpeg = require('./mjpeg');

var router = express.Router();

// Static html files
router.get('/login', function (req, res, next) {
	res.render('login');
});

router.get('/', auth.isLoggedIn, function (req, res, next) {
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
router.get('/mjpeg/:timestamp', auth.isLoggedIn, mjpeg);

module.exports = router;