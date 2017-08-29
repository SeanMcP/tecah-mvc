const mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
const bcrypt = require('bcryptjs')
const Schema = mongoose.Schema

const docSchema = new mongoose.Schema({
  username: String,
  category: String,
  date: {type: Date, default: Date.now},
  downloads: Number,
  likes: [String],
  source: String,
  tags: [String],
  title: String,
  views: Number
})

const Doc = mongoose.model('Doc', docSchema)

module.exports = Doc
