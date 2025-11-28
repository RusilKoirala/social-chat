import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  Edit2, 
  Save, 
  X, 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  MessageCircle,
  UserPlus,
  UserMinus
} from 'lucide-react';
import apiService from '../services/api';

function ProfileActions({ profileId }) {
  const navigate = useNavigate();
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFriendshipStatus();
  }, [profileId]);

  const loadFriendshipStatus = async () => {
    try {
      const status = await apiService.getFriendshipStatus(profileId);
      setFriendshipStatus(status);
    } catch (error) {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    try {
      await apiService.sendFriendRequest(profileId);
      await loadFriendshipStatus();
    } catch (error) {
      // Error
    }
  };

  const handleRemoveFriend = async () => {
    if (!confirm('Remove this friend?')) return;
    try {
      await apiService.removeFriend(profileId);
      await loadFriendshipStatus();
    } catch (error) {
      // Error
    }
  };

  if (loading) {
    return <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>;
  }

  return (
    <div className="flex gap-2">
      {friendshipStatus?.status === 'accepted' ? (
        <>
          <button
            onClick={() => navigate(`/messages/${profileId}`)}
            className="btn-primary"
          >
            <MessageCircle size={18} />
            <span>Send Message</span>
          </button>
          <button
            onClick={handleRemoveFriend}
            className="btn-secondary text-red-600 dark:text-red-400"
          >
            <UserMinus size={18} />
            <span>Remove Friend</span>
          </button>
        </>
      ) : friendshipStatus?.status === 'pending' ? (
        <div className="text-gray-600 dark:text-gray-400 font-medium">
          {friendshipStatus.isSender ? 'Friend Request Sent' : 'Pending Request'}
        </div>
      ) : (
        <button onClick={handleSendRequest} className="btn-primary">
          <UserPlus size={18} />
          <span>Add Friend</span>
        </button>
      )}
    </div>
  );
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    location: '',
    website: ''
  });

  const isOwnProfile = !id || id === currentUser?.id;

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      if (isOwnProfile) {
        const data = await apiService.getCurrentUser();
        setProfile(data);
        setFormData({
          username: data.username || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || ''
        });
      } else {
        const data = await apiService.getUserProfile(id);
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiService.updateProfile(formData);
      await loadProfile();
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: profile.username || '',
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || ''
    });
    setEditing(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-20 lg:pb-0">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold">{profile.username}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Profile</p>
              </div>
            </div>
            {isOwnProfile && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit2 size={18} />
                <span>Edit Profile</span>
              </button>
            )}
            {editing && (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X size={20} />
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-5xl font-bold mb-4">
              {profile.username[0].toUpperCase()}
            </div>
            
            {editing ? (
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input-field text-center text-2xl font-bold mb-2"
                placeholder="Username"
              />
            ) : (
              <h2 className="text-2xl font-bold mb-2">{profile.username}</h2>
            )}
            
            <p className="text-gray-600 dark:text-gray-400 mb-4">{profile.email}</p>

            {!isOwnProfile && <ProfileActions profileId={profile.id} />}
          </div>

          {/* Bio */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3">Bio</h3>
            {editing ? (
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="input-field min-h-[100px] resize-none"
                placeholder="Tell us about yourself..."
                maxLength={200}
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                {profile.bio || 'No bio yet'}
              </p>
            )}
          </div>

          {/* Details */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-3">Details</h3>
            
            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-gray-400 mt-0.5" />
              {editing ? (
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field flex-1"
                  placeholder="Location"
                />
              ) : (
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                  <p className="font-medium">{profile.location || 'Not specified'}</p>
                </div>
              )}
            </div>

            {/* Website */}
            <div className="flex items-start gap-3">
              <LinkIcon size={20} className="text-gray-400 mt-0.5" />
              {editing ? (
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="input-field flex-1"
                  placeholder="https://example.com"
                />
              ) : (
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Website</p>
                  {profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    <p className="font-medium">Not specified</p>
                  )}
                </div>
              )}
            </div>

            {/* Joined Date */}
            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">Joined</p>
                <p className="font-medium">{formatDate(profile.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
