'use strict'

const mongoose = require('mongoose');
const Schema   = mongoose.Schema,
      ObjectId = Schema.ObjectId;

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const postComment = mongoose.model('postComment', Schema({
    userId: {
      type: ObjectId,
      ref: 'User'
    },
    message: String,
    postId: ObjectId,
    postLocation: [Number],
    date: {
        type: Date,
        default: Date.now
    }
}));



module.exports = postComment