const mongoose = require('mongoose');

const allpostSchema = mongoose.Schema({
    url: {type: String},
    caption: {type: String},
    userID: String,
    user_id: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
        
     },
     likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'like',
        },
      ],
})

const AllpostModel = mongoose.model("allpost", allpostSchema);

module.exports = {AllpostModel}