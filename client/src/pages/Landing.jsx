import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  MessageCircle, 
  Users, 
  Shield, 
  Zap, 
  Globe, 
  Lock,
  ArrowRight,
  Sun,
  Moon,
  Check,
  Github,
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const features = [
    {
      icon: MessageCircle,
      title: 'Real-time Messaging',
      description: 'Instant message delivery with Socket.IO powered communication'
    },
    {
      icon: Users,
      title: 'Friend System',
      description: 'Connect with friends through secure friend requests'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'End-to-end encryption and secure authentication'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with smart message pagination'
    },
    {
      icon: Globe,
      title: 'Chat Rooms',
      description: 'Join public rooms and connect with the community'
    },
    {
      icon: Lock,
      title: 'Secure',
      description: 'HTTP-only cookies, rate limiting, and spam protection'
    }
  ];

  const benefits = [
    'Real-time messaging with Socket.IO',
    'Private conversations with friends',
    'Public chat rooms',
    'Dark/Light mode',
    'Email verification',
    'Google OAuth login',
    'Mobile responsive design',
    'Typing indicators',
    'Online status tracking'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-primary-600" size={32} />
              <span className="text-xl font-bold">Social Chat</span>
            </div>
           <div className="flex items-center gap-4">

  <a
  href="https://github.com/RusilKoirala/social-chat"
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700
             bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800
             text-sm font-medium transition-colors"
>
  <Github size={18} />
  <span className="hidden sm:inline">Star on GitHub</span>
</a>


  <button
    onClick={toggleTheme}
    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
  >
    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
  </button>

  <button
    onClick={() => navigate('/login')}
    className="btn-secondary"
  >
    Sign In
  </button>

  <button
    onClick={() => navigate('/login')}
    className="btn-primary"
  >
    Get Started
  </button>

</div>

          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              Connect with People
              <br />
              Around the World
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              A modern, secure, and lightning-fast chat application built for meaningful conversations
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary text-lg px-8 py-4"
              >
                <span>Start Chatting</span>
                <ArrowRight size={20} />
              </button>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Hero Image/Mockup */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-700/20 blur-3xl"></div>
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg"></div>
                  <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                  <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                      <div className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 ml-auto"></div>
                      <div className="h-16 bg-primary-100 dark:bg-primary-900/20 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need for seamless communication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Why Choose Social Chat?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Built with modern technologies and best practices to provide you with the best chatting experience.
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check size={16} className="text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-700/20 blur-3xl"></div>
              <div className="relative card p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                    SC
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Social Chat</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Active now</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm">Hey! Welcome to Social Chat 👋</p>
                  </div>
                  <div className="bg-primary-100 dark:bg-primary-900/20 rounded-lg p-4 ml-8">
                    <p className="text-sm">Thanks! This looks amazing!</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-sm">Start chatting with friends now!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Chatting?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users already connecting on Social Chat
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-lg"
          >
            <span>Get Started Free</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-primary-600" size={24} />
              <span className="font-bold">Social Chat</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 Social Chat. All rights reserved.
              Made with ❤️ <a href='https://github.com/rusilkoirala'>Rusil</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
