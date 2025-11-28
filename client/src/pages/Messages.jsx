import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Send, Paperclip, Info, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import socketService from '../services/socket';

export default function Messages() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastMessageTimeRef = useRef(0);
  const messageTimesRef = useRef([]);

  const room = searchParams.get('room');

  useEffect(() => {
    // Connect socket
    const token = localStorage.getItem('token');
    socketService.connect(token);

    // Load conversations
    loadConversations();

    return () => {
      // Cleanup will be handled by individual effect
    };
  }, []);

  // Separate effect for socket listeners that depend on currentChat and user
  useEffect(() => {
    const handleNewRoomMessage = (message) => {
      if (currentChat?.type === 'room' && message.room === currentChat.id) {
        setMessages(prev => [...prev, message]);
      }
    };

    const handleNewPrivateMessage = (message) => {
      if (currentChat?.type === 'private') {
        const otherUserId = message.sender._id === user.id ? message.receiver._id : message.sender._id;
        if (otherUserId === currentChat.id) {
          setMessages(prev => [...prev, message]);
        }
      }
    };

    const handleUserOnline = ({ userId }) => {
      if (currentChat?.id === userId) {
        setCurrentChat(prev => ({ ...prev, online: true }));
      }
    };

    const handleUserOffline = ({ userId }) => {
      if (currentChat?.id === userId) {
        setCurrentChat(prev => ({ ...prev, online: false }));
      }
    };

    const handleTypingStart = ({ username }) => {
      setTypingUser(username);
    };

    const handleTypingStop = () => {
      setTypingUser(null);
    };

    // Socket listeners
    socketService.on('message:room', handleNewRoomMessage);
    socketService.on('message:private', handleNewPrivateMessage);
    socketService.on('user:online', handleUserOnline);
    socketService.on('user:offline', handleUserOffline);
    socketService.on('typing:start', handleTypingStart);
    socketService.on('typing:stop', handleTypingStop);

    return () => {
      socketService.off('message:room', handleNewRoomMessage);
      socketService.off('message:private', handleNewPrivateMessage);
      socketService.off('user:online', handleUserOnline);
      socketService.off('user:offline', handleUserOffline);
      socketService.off('typing:start', handleTypingStart);
      socketService.off('typing:stop', handleTypingStop);
    };
  }, [currentChat, user]);

  useEffect(() => {
    if (room) {
      loadRoomChat(room);
    } else if (id) {
      loadPrivateChat(id);
    }
  }, [room, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      // Load only friends
      const friends = await apiService.getFriends();
      setConversations(friends);
    } catch (error) {
      // Error loading conversations
    }
  };

  const loadRoomChat = async (roomName) => {
    setLoading(true);
    try {
      const roomData = {
        id: roomName,
        name: roomName.charAt(0).toUpperCase() + roomName.slice(1),
        type: 'room',
        online: true
      };
      setCurrentChat(roomData);
      setShowConversations(false);

      const msgs = await apiService.getRoomMessages(roomName, 50);
      setMessages(msgs);
      setHasMoreMessages(msgs.length === 50);

      socketService.joinRoom(roomName);
    } catch (error) {
      // Error loading room
    } finally {
      setLoading(false);
    }
  };

  const loadPrivateChat = async (userId) => {
    setLoading(true);
    try {
      const userProfile = await apiService.getUserProfile(userId);
      setCurrentChat({
        id: userId,
        name: userProfile.username,
        type: 'private',
        online: userProfile.online
      });
      setShowConversations(false);

      const msgs = await apiService.getPrivateMessages(userId, 50);
      setMessages(msgs);
      setHasMoreMessages(msgs.length === 50);
    } catch (error) {
      // Error loading private chat
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container || loadingMore || !hasMoreMessages) return;

    // Check if scrolled to top
    if (container.scrollTop < 100) {
      loadMoreMessages();
    }
  };

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMoreMessages || messages.length === 0) return;

    setLoadingMore(true);
    const previousScrollHeight = messagesContainerRef.current?.scrollHeight || 0;

    try {
      const before = messages[0].createdAt;
      let olderMessages;

      if (currentChat.type === 'room') {
        olderMessages = await apiService.getRoomMessages(currentChat.id, 50, before);
      } else {
        olderMessages = await apiService.getPrivateMessages(currentChat.id, 50, before);
      }

      if (olderMessages.length > 0) {
        setMessages(prev => [...olderMessages, ...prev]);
        setHasMoreMessages(olderMessages.length === 50);

        // Maintain scroll position
        setTimeout(() => {
          if (messagesContainerRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight;
            messagesContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight;
          }
        }, 100);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      // Error loading more messages
    } finally {
      setLoadingMore(false);
    }
  };



  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentChat) return;

    // Check cooldown
    if (cooldown > 0) {
      return;
    }

    const now = Date.now();
    
    // Track message times (last 10 seconds)
    messageTimesRef.current = messageTimesRef.current.filter(time => now - time < 10000);
    messageTimesRef.current.push(now);

    // Calculate cooldown based on message frequency
    let newCooldown = 0;
    const messagesInLast10Sec = messageTimesRef.current.length;

    if (messagesInLast10Sec > 5) {
      // More than 5 messages in 10 seconds = spam
      newCooldown = 3000; // 3 second cooldown
    } else if (messagesInLast10Sec > 3) {
      // More than 3 messages in 10 seconds = fast typing
      newCooldown = 1000; // 1 second cooldown
    } else {
      // Normal typing speed
      newCooldown = 500; // 0.5 second cooldown (prevents accidental double-send)
    }

    // Send message
    if (currentChat.type === 'room') {
      socketService.sendRoomMessage(currentChat.id, messageInput);
    } else {
      socketService.sendPrivateMessage(currentChat.id, messageInput);
    }

    setMessageInput('');
    setCooldown(newCooldown);
    setMessageCount(messagesInLast10Sec);

    // Clear cooldown after delay
    setTimeout(() => {
      setCooldown(0);
    }, newCooldown);

    socketService.stopTyping(
      currentChat.type === 'room' ? currentChat.id : null,
      currentChat.type === 'private' ? currentChat.id : null
    );
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);

    // Send typing indicator
    socketService.startTyping(
      currentChat?.type === 'room' ? currentChat.id : null,
      currentChat?.type === 'private' ? currentChat.id : null
    );

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(
        currentChat?.type === 'room' ? currentChat.id : null,
        currentChat?.type === 'private' ? currentChat.id : null
      );
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex bg-white dark:bg-gray-900">
      {/* Conversations List - Hidden when in room chat */}
      <div className={`${showConversations && !room ? 'flex' : 'hidden'} ${!room ? 'lg:flex' : 'lg:hidden'} w-full lg:w-80 flex-col border-r border-gray-200 dark:border-gray-800`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => navigate(`/messages/${conv._id}`)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                currentChat?.id === conv._id ? 'bg-gray-50 dark:bg-gray-800' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                  {conv.username[0].toUpperCase()}
                </div>
                {conv.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-semibold truncate">{conv.username}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {conv.online ? 'Online' : 'Offline'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!showConversations ? 'flex' : 'hidden'} lg:flex flex-1 flex-col`}>
        {!currentChat ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Send className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose a conversation from the list or start a new one
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowConversations(true);
                    setCurrentChat(null);
                    navigate('/messages');
                  }}
                  className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={() => currentChat.type === 'private' && navigate(`/profile/${currentChat.id}`)}
                  className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 -ml-2"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                    {currentChat.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{currentChat.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentChat.type === 'room' ? 'Room' : currentChat.online ? 'Active now' : 'Offline'}
                    </div>
                  </div>
                </button>
              </div>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <Info size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <>
                  {loadingMore && (
                    <div className="flex justify-center py-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  )}
                  {!hasMoreMessages && messages.length > 0 && (
                    <div className="text-center text-sm text-gray-500 py-2">
                      Beginning of conversation
                    </div>
                  )}
                  {messages.map((message, index) => {
                    const isOwn = message.sender._id === user.id;
                    return (
                      <div
                        key={index}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {message.sender.username[0].toUpperCase()}
                        </div>
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">{message.sender.username}</span>
                            <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
                          </div>
                          <div className={`px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Typing Indicator */}
            {typingUser && (
              <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                {typingUser} is typing...
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full outline-none"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || cooldown > 0}
                  className="p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors relative"
                  title={cooldown > 0 ? `Wait ${Math.ceil(cooldown / 1000)}s` : 'Send message'}
                >
                  {cooldown > 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-xs font-bold">{Math.ceil(cooldown / 1000)}</div>
                    </div>
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
