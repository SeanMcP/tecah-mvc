const express = require('express')
const User = require('../models/user')
const router = express.Router()
const mongoose = require('mongoose')
const passport = require('passport')

mongoose.connect('mongodb://localhost:27017/tecah')

const requireLogin = function (req, res, next) {
  if (req.user) {
    console.log(req.user)
    next()
  } else {
    res.redirect('/login')
  }
}

const login = function (req, res, next) {
  if (req.user) {
    res.redirect('/')
  } else {
    next()
  }
}

router.get('/', function(req, res) {
  res.render('index')
})

router.get('/login', login, function(req, res) {
  res.render('login', {
    messages: res.locals.getMessages()
  })
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

router.post('/signup', function(req, res) {
  User.create({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  }).then(function(data) {
    console.log(data)
    res.redirect('/login')
  })
  .catch(function(err) {
    console.log(err)
    res.redirect('/login')
  })
})

router.get('/user', requireLogin, function(req, res) {
  res.render('user', {username: req.user.username})
})

router.get('/logout', function(req, res) {
  req.logout()
  res.redirect('/')
})

module.exports = router
