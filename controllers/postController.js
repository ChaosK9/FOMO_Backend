'use strict'

const postModel = require('../models/post.js');

var Filter = require('bad-words'),
    filter = new Filter();

function getPosts(locationData) {
    if (locationData.long && locationData.lat) {
        return postModel.find(
            {
                location: {
                    $near : {
                        $geometry: { type: "Point",  coordinates: [ locationData.long, locationData.lat ] },
                        $minDistance: 0,
                        $maxDistance: locationData.radius //in meters
                    }
                },
                date: {
                    $gte: new Date(new Date() - 1000*60*60*(locationData.expiry || 7*24))
                }
            }
        ).populate('user').then(res => {
            return res.map((post) => {
                let ret = post.toJSON();
                ret.location = {
                    long: post.location.coordinates[0],
                    lat: post.location.coordinates[1]
                }
                return ret;
            });
        })
    }
    return [];
}

function getAllPosts(body) {
    return postModel.find({
        date: {
            $gte: new Date(new Date() - 1000*60*60*(body.expiry || 7*24))
        }
    }).populate('user').then(res => {
        return res.map((post) => {
            let ret = post.toJSON();
            ret.location = {
                long: post.location.coordinates[0],
                lat: post.location.coordinates[1]
            }
            return ret;
        });
    })
}

function createPost(postData) {
    let error = "";
    // Error check postData
    if (!postData) 
    {
        error = "/createPost POST requires a body";
    }
    if (!postData.message)
    {
        error = "/createPost POST body requires 'message'";
    }
    if (!postData.long || !postData.lat)
    {
        error = "/createPost POST body requires 'long' and 'lat'";
    }
    if(error){
        return new Promise((resolve, reject) => {
            resolve(error);
        });
    }

    let newPost = new postModel(
        {
            message: filter.clean(postData.message),
            messageType: postData.messageType,
            user: postData.userId,
            imageFile: "",
            location: {
                type: 'Point',
                coordinates: [ postData.long, postData.lat ]
              }
        }
    );
    return newPost.save().then((savedPost) => {
        return savedPost.populate('user').execPopulate().then(post => {
            let ret = post.toJSON();
            ret.location = {
                long: post.location.coordinates[0],
                lat: post.location.coordinates[1]
            }
            return ret;
        })
    });
}

function createPostWithImage(postData) {
    let newPost = new postModel(
        {
            message: filter.clean(postData.message),
            messageType: postData.messageType,
            user: postData.userId,
            imageFile: postData.imageUrl,
            location: {
                type: 'Point',
                coordinates: [ postData.long, postData.lat ]
            }
        }
    );
    return newPost.save().then((savedPost) => {
        return savedPost.populate('user').execPopulate().then(post => {
            let ret = post.toJSON();
            ret.location = {
                long: post.location.coordinates[0],
                lat: post.location.coordinates[1]
            }
            return ret;
        })
    });
}

module.exports = {
    getPosts,
    getAllPosts,
    createPost,
    createPostWithImage,
};
