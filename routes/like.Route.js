const express = require('express');
const { AllpostModel } = require('../models/Allpost.model');
const likeRoute = express.Router();

likeRoute.post('/like', async (req, res) => {
  try {
    const postId = req.body.postId;
    const userId = req.body.userId;

    const post = await AllpostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      
      await AllpostModel.findByIdAndUpdate(postId, {
        $pull: { likes: userId },
      });

      return res.json({ message: 'Unliked' });
    } else {
     
      await AllpostModel.findByIdAndUpdate(postId, {
        $push: { likes: userId },
      });

      return res.json({ message: 'Liked' });
    }
  } catch (err) {
    console.log('Error liking/unliking the post:', err);
    res.status(500).json({ message: 'Error liking/unliking the post' });
  }
});

module.exports = { likeRoute };
