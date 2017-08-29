const express = require('express')
const mustacheExpress = require('mustache-express')
const path = require('path')
const routes = require('./routes/index')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const flash = require('express-flash-messages')
const User = require('./models/user')
const Doc = require('./models/doc')

// Busboy Requires
const fs = require('fs-extra')
const Busboy = require('busboy')

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.engine('mustache', mustacheExpress())
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'mustache')
app.set('layout', 'layout')

app.use(bodyParser.urlencoded({extended: false}))

app.use(morgan('dev'))

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.authenticate(username, password, function(err, user) {
      if (err) {
        return done(err)
      }
      if (user) {
        return done(null, user)
      } else {
        return done(null, false, {
          message: 'There is no user with that username and password.'
        })
      }
    })
  }))

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user)
  })
})

app.use(function (req, res, next) {
  res.locals.user = req.user
  next()
})

app.use(session({
  secret: 'Keep it secret',
  resave: false,
  saveUninitialized: false,
  store: new(require('express-sessions'))({
    storage: 'mongodb'
  })
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use(routes)

// Busboy code
app.post('/upload', function (req, res) {
  let busboy = new Busboy({headers: req.headers })
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    let saveTo = path.join('./public/uploads/', path.basename(filename))
    file.pipe(fs.createWriteStream(saveTo))
  })
  busboy.on('finish', function() {
    res.writeHead(200, {'Connection': 'close'})
    res.end("Uploaded file to: /uploads")
  })
  //Parse HTTP-POST upload
  return req.pipe(busboy)
})

app.listen(3000, function() {
  console.log('App is running on localhost:3000')
})
