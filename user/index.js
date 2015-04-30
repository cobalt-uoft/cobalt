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

import * as signup from './routes/signup'
router.get('/signup', signup.get)
router.post('/signup', signup.post)

import * as login from './routes/login'
router.get('/login', login.get)
router.post('/login', login.post)

import * as logout from './routes/logout'
import verify from './routes/verify'
import * as dashboard from './routes/dashboard'
router.get('/logout', logout.get)
router.get('/verify', verify)
router.get('/dashboard', dashboard.get)

export default router
export let model = User
