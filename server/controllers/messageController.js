import Message from '../models/Message.js';

export const getRoomMessages = async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    const query = { 
      room: req.params.room,
      type: 'room'
    };

    // If 'before' timestamp provided, get messages before that time
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Reverse to get chronological order
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPrivateMessages = async (req, res) => {
  try {
    const { limit = 50, before } = req.query;
    const query = {
      type: 'private',
      $or: [
        { sender: req.user._id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user._id }
      ]
    };

    // If 'before' timestamp provided, get messages before that time
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username avatar')
      .populate('receiver', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Reverse to get chronological order
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
