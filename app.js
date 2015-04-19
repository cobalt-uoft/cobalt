var express = require('express')
var session = require('express-session')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var passport = require('passport')
var flash = require('connect-flash')
var LocalStrategy = require('passport-local').Strategy

/* Front end imports */
var index = require('./routes/index')
var docs = require('./routes/docs')

/* API imports */
var courses = require('./api/uoft-course-api/main')
var buildings = require('./api/uoft-building-api/main')
var food = require('./api/uoft-food-api/main')

/* User imports */
var User = require('./user/model')
var user = {
	login: require('./user/routes/login'),
	logout: require('./user/routes/logout'),
	signup: require('./user/routes/signup'),
	verify: require('./user/routes/verify'),
	dashboard: require('./user/routes/dashboard')
}

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('api version', '1.0')

app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser())
app.use(session({
	secret: 'pusheeeen',
	resave: false,
	saveUninitialized: false
}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

//Initialize mongoose singleton
mongoose.connect(process.env.MONGO_URL)

/* Passport plugins */
passport.use(new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password'
	},
	function(email, password, done) {
		User.login(email, password, function(err, user) {
			if (err) {
				return done(null, false, {
					message: err.message
				})
			}
			return done(null, user)
		})
	}
))

passport.serializeUser(function(user, done) {
	done(null, user.id)
})

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user)
	})
})

/* Front end routes */
app.use('/', index)
app.use('/docs', docs)

/* User routes */
app.use('/login', user.login)
app.use('/logout', user.logout)
app.use('/signup', user.signup)
app.use('/verify', user.verify)
app.use('/dashboard', user.dashboard)

/* API routes */
app.use('/api/courses', courses)
app.use('/api/buildings', buildings)
app.use('/api/food', food)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found')
	err.status = 404
	next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500)
		res.json({
			"error": {
				code: err.status,
				message: err.message
			}
		})
	})
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500)
	res.render('error', {
		message: err.message,
		error: {}
	})
})


module.exports = app
