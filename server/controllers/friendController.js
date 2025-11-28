import FriendRequest from '../models/FriendRequest.js';
import User from '../models/User.js';

export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'accepted') {
        return res.status(400).json({ error: 'Already friends' });
      }
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ error: 'Friend request already sent' });
      }
    }

    const friendRequest = new FriendRequest({
      sender: senderId,
      receiver: receiverId
    });

    await friendRequest.save();

    const populatedRequest = await FriendRequest.findById(friendRequest._id)
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    friendRequest.status = 'accepted';
    await friendRequest.save();

    const populatedRequest = await FriendRequest.findById(friendRequest._id)
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar');

    res.json(populatedRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    if (friendRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    friendRequest.status = 'rejected';
    await friendRequest.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await FriendRequest.find({
      receiver: userId,
      status: 'pending'
    })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const friendRequests = await FriendRequest.find({
      $or: [
        { sender: userId, status: 'accepted' },
        { receiver: userId, status: 'accepted' }
      ]
    })
      .populate('sender', 'username avatar online')
      .populate('receiver', 'username avatar online');

    const friends = friendRequests.map(request => {
      const friend = request.sender._id.toString() === userId.toString()
        ? request.receiver
        : request.sender;
      return friend;
    });

    res.json(friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFriendshipStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const friendRequest = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    });

    if (!friendRequest) {
      return res.json({ status: 'none', canSendRequest: true });
    }

    const isSender = friendRequest.sender.toString() === currentUserId.toString();

    res.json({
      status: friendRequest.status,
      requestId: friendRequest._id,
      isSender,
      canSendRequest: false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const friendRequest = await FriendRequest.findOneAndDelete({
      $or: [
        { sender: currentUserId, receiver: userId, status: 'accepted' },
        { sender: userId, receiver: currentUserId, status: 'accepted' }
      ]
    });

    if (!friendRequest) {
      return res.status(404).json({ error: 'Friendship not found' });
    }

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
