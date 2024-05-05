const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    postData: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },

    createDate: {
        type: Date,
        default: Date.now
    },

    likes: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }]
    }
})

const postModel = mongoose.model('post', postSchema)

module.exports = postModel;