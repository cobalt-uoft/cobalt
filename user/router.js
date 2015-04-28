import express from 'express'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

import User from './model'

let router = express.Router()

/* Passport plugins */
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, (email, password, done) => {
    User.login(email, password, (err, user) => {
      if (err) {
        return done(null, false, {
          message: err.message
        })
      }
      return done(null, user)
    })
  }
))

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

import login from './routes/login'
router.get('/login', login.get)
router.post('/login', login.post)

import * as signup from './routes/signup'
router.get('/signup', signup.get)
router.post('/signup', signup.post)

import logout from './routes/logout'
import verify from './routes/verify'
import dashboard from './routes/dashboard'
router.get('/logout', logout)
router.get('/verify', verify)
router.get('/dashboard', dashboard)

export default router
