import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, LogIn, UserPlus, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles, TrendingUp, Target, RotateCcw } from 'lucide-react';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    if (mode === 'reset') {
      setStatus('loading');
      const result = await resetPassword(formData.email.trim());
      
      if (result.error) {
        setStatus('error');
        setMessage(result.error.message);
      } else {
        setStatus('success');
        setMessage('Password reset email sent! Check your inbox.');
      }
      return;
    }

    if (!formData.password.trim()) {
      setStatus('error');
      setMessage('Please enter your password');
      return;
    }

    if (mode === 'register') {
      if (!formData.name.trim()) {
        setStatus('error');
        setMessage('Please enter your name');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setStatus('error');
        setMessage('Passwords do not match');
        return;
      }

      if (formData.password.length < 6) {
        setStatus('error');
        setMessage('Password must be at least 6 characters long');
        return;
      }
    }

    setStatus('loading');

    try {
      let result;
      if (mode === 'register') {
        result = await signUp(formData.email.trim(), formData.password, formData.name.trim());
      } else {
        result = await signIn(formData.email.trim(), formData.password);
      }

      if (result.error) {
        setStatus('error');
        setMessage(result.error.message);
      } else {
        setStatus('success');
        if (mode === 'register' && result.message) {
          setMessage(result.message);
        } else {
          setMessage(mode === 'register' ? 'Account created successfully!' : 'Welcome back!');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setStatus('idle');
    setMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (newMode: 'login' | 'register' | 'reset') => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      {/* Left side - Hero content */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12">
        <div className="max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
              Fincyq
            </h1>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-6">
            Your Financial Time Travel Adventure Awaits
          </h2>
          
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            Discover how your financial decisions today shape your tomorrow. Simulate different scenarios, 
            explore multiple timelines, and make informed choices about your financial future.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <span className="text-white/90">Visualize multiple financial scenarios</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Target size={16} className="text-blue-400" />
              </div>
              <span className="text-white/90">Track progress toward your goals</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-purple-400" />
              </div>
              <span className="text-white/90">Learn through interactive simulations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                Fincyq
              </h1>
            </div>
            <p className="text-white/80">Your Financial Time Travel Adventure</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white flex items-center justify-center gap-2 mb-2">
              {mode === 'login' ? (
                <>
                  <LogIn className="text-blue-400" />
                  Welcome Back
                </>
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="text-green-400" />
                  Get Started
                </>
              ) : (
                <>
                  <RotateCcw className="text-orange-400" />
                  Reset Password
                </>
              )}
            </h2>
            <p className="text-white/60">
              {mode === 'login' 
                ? 'Sign in to continue your financial journey' 
                : mode === 'register'
                  ? 'Create your account to begin time traveling'
                  : 'Enter your email to reset your password'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-white/80 mb-2 text-sm">Full Name</label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="John Doe"
                    disabled={status === 'loading'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-white/80 mb-2 text-sm">Email Address</label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="your@email.com"
                  disabled={status === 'loading'}
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-white/80 mb-2 text-sm">Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="••••••••"
                    disabled={status === 'loading'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-white/80 mb-2 text-sm">Confirm Password</label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="••••••••"
                    disabled={status === 'loading'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                status === 'success' 
                  ? 'bg-green-500/20 border border-green-400/30' 
                  : status === 'error'
                    ? 'bg-red-500/20 border border-red-400/30'
                    : 'bg-blue-500/20 border border-blue-400/30'
              }`}>
                {status === 'success' && <CheckCircle size={16} className="text-green-400" />}
                {status === 'error' && <AlertCircle size={16} className="text-red-400" />}
                <span className={`text-sm ${
                  status === 'success' ? 'text-green-400' : 
                  status === 'error' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  {message}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'register' ? 'Creating Account...' : mode === 'reset' ? 'Sending Email...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {mode === 'register' ? <UserPlus size={16} /> : mode === 'reset' ? <RotateCcw size={16} /> : <LogIn size={16} />}
                  {mode === 'register' ? 'Create Account & Start Planning' : mode === 'reset' ? 'Send Reset Email' : 'Sign In & Continue'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <>
                <p className="text-white/60 text-sm">
                  Don't have an account?
                  <button
                    onClick={() => switchMode('register')}
                    className="ml-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Sign up
                  </button>
                </p>
                <p className="text-white/60 text-sm">
                  Forgot your password?
                  <button
                    onClick={() => switchMode('reset')}
                    className="ml-2 text-orange-400 hover:text-orange-300 font-medium transition-colors"
                  >
                    Reset it
                  </button>
                </p>
              </>
            )}
            
            {mode === 'register' && (
              <p className="text-white/60 text-sm">
                Already have an account?
                <button
                  onClick={() => switchMode('login')}
                  className="ml-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
            
            {mode === 'reset' && (
              <p className="text-white/60 text-sm">
                Remember your password?
                <button
                  onClick={() => switchMode('login')}
                  className="ml-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/60 text-xs">
              🔒 Your data is securely stored in the cloud and synced across all your devices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}