var express = require('express');
var auth = require('../controllers/auth');
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

// API
router.post('/login', login)
router.get('/mjpeg/:timestamp', auth.isLoggedIn, mjpeg)

module.exports = router;