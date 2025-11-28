import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user._id;

    let query = { _id: { $ne: currentUserId } };

    if (search && search.trim()) {
      // If search query provided, find matching users (limit to 3)
      query.username = { $regex: search.trim(), $options: 'i' };
      const users = await User.find(query)
        .select('username avatar online')
        .limit(3)
        .sort({ online: -1, username: 1 });
      return res.json(users);
    }

    // If no search, return only 10 users
    const users = await User.find(query)
      .select('username avatar online')
      .limit(10)
      .sort({ online: -1, username: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('username email avatar bio location website online createdAt');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, avatar, bio, location, website } = req.body;
    
    const updateData = {};
    if (username) updateData.username = username;
    if (avatar) updateData.avatar = avatar;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('username email avatar bio location website');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
