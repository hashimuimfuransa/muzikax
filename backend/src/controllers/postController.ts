import { Request, Response } from 'express';
import Post from '../models/Post';
import User from '../models/User';

// Create a new post
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const userId = (req as any).user._id;

    // Validate input
    if (!content || content.trim().length === 0) {
      res.status(400).json({ message: 'Post content is required' });
      return;
    }

    if (content.length > 1000) {
      res.status(400).json({ message: 'Post content must be less than 1000 characters' });
      return;
    }

    // Get user details
    const user = await User.findById(userId).select('name avatar role');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Create new post
    const post = new Post({
      userId,
      userName: user.name,
      userAvatar: user.avatar || '',
      userRole: user.role === 'creator' ? (user.creatorType || 'Creator') : 'User',
      content: content.trim()
    });

    const savedPost = await post.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: savedPost._id,
        userId: savedPost.userId,
        userName: savedPost.userName,
        userAvatar: savedPost.userAvatar,
        userRole: savedPost.userRole,
        content: savedPost.content,
        likes: savedPost.likes,
        comments: savedPost.comments,
        shares: savedPost.shares,
        createdAt: savedPost.createdAt
      }
    });
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all posts
export const getPosts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('userId', 'name avatar role creatorType');

    res.json({
      posts: posts.map(post => ({
        id: post._id,
        userId: post.userId,
        userName: post.userName,
        userAvatar: post.userAvatar,
        userRole: post.userRole,
        content: post.content,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        liked: false, // We'll implement this properly when we add authentication to this endpoint
        createdAt: post.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: error.message });
  }
};

// Like a post
export const likePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params['id'];
    const userId = (req as any).user._id;

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    // Check if user has already liked the post
    const alreadyLiked = post.likedBy.includes(userId);
    
    if (alreadyLiked) {
      // Unlike the post
      post.likes -= 1;
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      // Like the post
      post.likes += 1;
      post.likedBy.push(userId);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes,
      liked: !alreadyLiked
    });
  } catch (error: any) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get post statistics
export const getPostStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalPosts = await Post.countDocuments();
    
    res.json({
      posts: totalPosts
    });
  } catch (error: any) {
    console.error('Error fetching post stats:', error);
    res.status(500).json({ message: error.message });
  }
};