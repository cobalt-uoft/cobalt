import express from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

import User from './model'

let router = express.Router()

/* Passport plugins */
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()))

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

import login from './routes/login'
router.get('/login', login.get)
router.post('/login', login.post)

import signup from './routes/signup'
router.get('/signup', signup.get)
router.post('/signup', signup.post)

import logout from './routes/logout'
import verify from './routes/verify'
import dashboard from './routes/dashboard'
router.get('/logout', logout)
router.get('/verify', verify)
router.get('/dashboard', dashboard)

export default router
