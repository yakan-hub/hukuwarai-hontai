import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Play, Users, Sparkles, UserPlus } from 'lucide-react';

export const StartScreen: React.FC = () => {
  const navigate = useNavigate();
  const { createRoom, isLoading, error } = useGameStore();

  const handleStart = async () => {
    await createRoom();
    navigate('/template');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-orange-500 mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-purple-600 bg-clip-text text-transparent">
              FUKUWARAI
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Build funny faces together online!
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <Users className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Ready to Play?
            </h2>
            <p className="text-gray-600">
              Create a room and invite friends to build hilarious faces together!
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg
                       hover:from-orange-600 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                       flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  <span>Start Game</span>
                </>
              )}
            </button>

            <button
              onClick={handleRegister}
              className="w-full bg-white text-purple-600 py-4 px-6 rounded-xl font-semibold text-lg border-2 border-purple-200
                       hover:bg-purple-50 hover:border-purple-300 transform hover:scale-[1.02] transition-all duration-200
                       flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
            >
              <UserPlus className="w-6 h-6" />
              <span>Create Account</span>
            </button>
          </div>

          {/* Game Rules */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">How to Play:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="font-semibold text-orange-500 mr-2">1.</span>
                Choose a face template together
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-orange-500 mr-2">2.</span>
                Take turns placing parts (hair, eyes, nose, etc.)
              </li>
              <li className="flex items-start">
                <span className="font-semibold text-orange-500 mr-2">3.</span>
                Laugh at your hilarious creation!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};