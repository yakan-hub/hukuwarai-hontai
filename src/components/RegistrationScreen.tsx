import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useGameStore } from '../store/gameStore';
import { User, Lock, Sparkles, UserPlus } from 'lucide-react';

export const RegistrationScreen: React.FC = () => {
  const navigate = useNavigate();
  const { setError } = useGameStore();
  const [formData, setFormData] = useState({
    nickname: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const generateRandomEmail = () => {
    const uuid = crypto.randomUUID();
    return `user-${uuid}@fukuwarai.game`;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Nickname is required';
    } else if (formData.nickname.trim().length < 2) {
      newErrors.nickname = 'Nickname must be at least 2 characters';
    } else if (formData.nickname.trim().length > 20) {
      newErrors.nickname = 'Nickname must be less than 20 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const randomEmail = generateRandomEmail();
      
      // Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: randomEmail,
        password: formData.password,
        options: {
          data: {
            nickname: formData.nickname.trim()
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            nickname: formData.nickname.trim()
          });

        if (profileError) {
          console.warn('Profile creation failed, but user was created:', profileError);
        }

        // Navigate to home screen
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-purple-500 mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
              Join FUKUWARAI
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Create your account to start building funny faces!
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-6">
            <UserPlus className="w-12 h-12 text-purple-500 mx-auto mb-3" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Choose a nickname and password to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nickname Field */}
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                Nickname
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all duration-200 ${
                             errors.nickname 
                               ? 'border-red-300 bg-red-50' 
                               : 'border-gray-300 hover:border-gray-400'
                           }`}
                  placeholder="Enter your nickname"
                  maxLength={20}
                />
              </div>
              {errors.nickname && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-4 h-4 mr-1">⚠️</span>
                  {errors.nickname}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all duration-200 ${
                             errors.password 
                               ? 'border-red-300 bg-red-50' 
                               : 'border-gray-300 hover:border-gray-400'
                           }`}
                  placeholder="Create a password"
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="w-4 h-4 mr-1">⚠️</span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg
                       hover:from-purple-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Info Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm text-center">
              <span className="font-semibold">Privacy Note:</span> We'll generate a unique email for your account automatically. 
              You only need to remember your nickname and password!
            </p>
          </div>
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            Already have an account? Go back
          </button>
        </div>
      </div>
    </div>
  );
};