import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Check, X, MessageCircle, UserMinus, Search } from 'lucide-react';
import apiService from '../services/api';

export default function Friends() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'friends') {
        const data = await apiService.getFriends();
        setFriends(data);
      } else if (activeTab === 'requests') {
        const data = await apiService.getFriendRequests();
        setRequests(data);
      } else if (activeTab === 'find') {
        const data = await apiService.getUsers(searchQuery);
        setAllUsers(data);
      }
    } catch (error) {
      // Error loading data
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (activeTab === 'find') {
      const timer = setTimeout(() => {
        loadData();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, activeTab]);

  const handleAcceptRequest = async (requestId) => {
    try {
      await apiService.acceptFriendRequest(requestId);
      loadData();
    } catch (error) {
      // Error accepting request
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await apiService.rejectFriendRequest(requestId);
      loadData();
    } catch (error) {
      // Error rejecting request
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await apiService.sendFriendRequest(userId);
      loadData();
    } catch (error) {
      // Error sending request
    }
  };

  const handleRemoveFriend = async (userId) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;
    
    try {
      await apiService.removeFriend(userId);
      loadData();
    } catch (error) {
      // Error removing friend
    }
  };

  const filteredUsers = allUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Friends</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('friends')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'friends'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Friends ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'requests'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('find')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'find'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Find Friends
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Friends List */}
            {activeTab === 'friends' && (
              <div className="space-y-3">
                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No friends yet. Start by sending friend requests!
                    </p>
                    <button
                      onClick={() => setActiveTab('find')}
                      className="btn-primary"
                    >
                      <UserPlus size={18} />
                      <span>Find Friends</span>
                    </button>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div key={friend._id} className="card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                            {friend.username[0].toUpperCase()}
                          </div>
                          {friend.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{friend.username}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {friend.online ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/messages/${friend._id}`)}
                          className="p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                          title="Message"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleRemoveFriend(friend._id)}
                          className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                          title="Remove Friend"
                        >
                          <UserMinus size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Friend Requests */}
            {activeTab === 'requests' && (
              <div className="space-y-3">
                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                      No pending friend requests
                    </p>
                  </div>
                ) : (
                  requests.map((request) => (
                    <div key={request._id} className="card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                          {request.sender.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold">{request.sender.username}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Wants to be friends
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request._id)}
                          className="p-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg transition-colors"
                          title="Accept"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request._id)}
                          className="p-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Find Friends */}
            {activeTab === 'find' && (
              <>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users..."
                      className="input-field pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400">No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <UserCard
                        key={user._id}
                        user={user}
                        onSendRequest={handleSendRequest}
                        onViewProfile={() => navigate(`/profile/${user._id}`)}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function UserCard({ user, onSendRequest, onViewProfile }) {
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriendshipStatus();
  }, [user._id]);

  const loadFriendshipStatus = async () => {
    try {
      const status = await apiService.getFriendshipStatus(user._id);
      setFriendshipStatus(status);
    } catch (error) {
      // Error loading status
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    await onSendRequest(user._id);
    await loadFriendshipStatus();
  };

  return (
    <div className="card p-4 flex items-center justify-between">
      <button
        onClick={onViewProfile}
        className="flex items-center gap-3 flex-1 text-left hover:opacity-80 transition-opacity"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
            {user.username[0].toUpperCase()}
          </div>
          {user.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
          )}
        </div>
        <div>
          <div className="font-semibold">{user.username}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {user.online ? 'Online' : 'Offline'}
          </div>
        </div>
      </button>
      <div>
        {loading ? (
          <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
        ) : friendshipStatus?.status === 'accepted' ? (
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">
            Friends
          </span>
        ) : friendshipStatus?.status === 'pending' ? (
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            {friendshipStatus.isSender ? 'Request Sent' : 'Pending'}
          </span>
        ) : (
          <button
            onClick={handleSendRequest}
            className="btn-primary"
          >
            <UserPlus size={18} />
            <span>Add Friend</span>
          </button>
        )}
      </div>
    </div>
  );
}
