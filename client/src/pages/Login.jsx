import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User, ArrowRight, MessageCircle } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { login, register, loginWithGoogle, sendOTP, verifyOTP } = useAuth();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendOTP(formData.email, formData.username);
      setOtpSent(true);
      setShowOTPInput(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOTP(formData.email, otp);
      await register(formData.username, formData.email, formData.password, otp);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        // For registration, first send OTP
        if (!otpSent) {
          await sendOTP(formData.email, formData.username);
          setOtpSent(true);
          setShowOTPInput(true);
          setLoading(false);
          return;
        }
        // Then verify and register
        await verifyOTP(formData.email, otp);
        await register(formData.username, formData.email, formData.password, otp);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-700 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 text-white">
            <MessageCircle size={40} />
            <h1 className="text-3xl font-bold">Social Chat</h1>
          </div>
        </div>
        
        <div className="text-white">
          <h2 className="text-4xl font-bold mb-4">
            Connect with people around the world
          </h2>
          <p className="text-xl text-primary-100">
            Join conversations, share moments, and build meaningful connections.
          </p>
        </div>

        <div className="text-primary-100 text-sm">
          © 2025 Social Chat. All rights reserved.
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <MessageCircle size={32} className="text-primary-600" />
            <h1 className="text-2xl font-bold">Social Chat</h1>
          </div>

          <div className="card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isLogin 
                  ? 'Sign in to continue to Social Chat' 
                  : 'Sign up to get started with Social Chat'}
              </p>
            </div>

            {/* Google Login */}
            <div className="mb-6">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme={document.documentElement.classList.contains('dark') ? 'filled_black' : 'outline'}
                size="large"
                width="100%"
              />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && !showOTPInput && (
                <div>
                  <label className="block text-sm font-medium mb-2">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="input-field pl-10"
                      placeholder="johndoe"
                      required
                      disabled={showOTPInput}
                    />
                  </div>
                </div>
              )}

              {!showOTPInput && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-field pl-10"
                        placeholder="you@example.com"
                        required
                        disabled={showOTPInput}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="input-field pl-10"
                        placeholder="••••••••"
                        required
                        disabled={showOTPInput}
                      />
                    </div>
                  </div>
                </>
              )}

              {!isLogin && showOTPInput && (
                <div>
                  <label className="block text-sm font-medium mb-2">Enter OTP</label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    We sent a 6-digit code to {formData.email}
                  </p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowOTPInput(false);
                      setOtpSent(false);
                      setOtp('');
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 mt-2"
                  >
                    ← Change email
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (!isLogin && showOTPInput && otp.length !== 6)}
                className="btn-primary w-full"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>
                      {isLogin 
                        ? 'Sign In' 
                        : showOTPInput 
                          ? 'Verify & Create Account' 
                          : 'Send OTP'}
                    </span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setFormData({ username: '', email: '', password: '' });
                  setShowOTPInput(false);
                  setOtpSent(false);
                  setOtp('');
                }}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
