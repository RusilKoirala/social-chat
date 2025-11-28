import { useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Hash } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const rooms = [
    {
      id: 'general',
      name: 'General',
      description: 'Chat about anything',
      icon: Hash,
      color: 'from-blue-500 to-blue-600',
      featured: true
    },
  ];

  return (
    <div className="h-full overflow-y-auto pb-20 lg:pb-0">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Welcome Section */}
        <div className="card p-8">
          <h1 className="text-3xl font-bold mb-4">Welcome to Social Chat</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect with people, join rooms, and start conversations
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/app/messages')}
              className="btn-primary"
            >
              <MessageCircle size={20} />
              <span>Start Messaging</span>
            </button>
            <button
              onClick={() => navigate('/app/profile')}
              className="btn-secondary"
            >
              <Users size={20} />
              <span>View Profile</span>
            </button>
          </div>
        </div>

        {/* General Room - Featured */}
        <div>
          <h2 className="text-2xl font-bold mb-4">General Chat Room</h2>
          <div
            className="card p-8 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800"
            onClick={() => navigate('/messages?room=general')}
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                <Hash size={40} />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold mb-2">General</h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                  Join the community chat room and connect with everyone
                </p>
                <button className="btn-primary">
                  <MessageCircle size={20} />
                  <span>Join General Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">Real-time Messaging</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Send and receive messages instantly with Socket.IO powered real-time communication
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">Private Conversations</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Have one-on-one conversations with other users in private chats
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
