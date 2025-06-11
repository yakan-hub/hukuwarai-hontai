import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { ArrowLeft, Check } from 'lucide-react';

export const TemplateSelectScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    templates, 
    selectedTemplate, 
    setSelectedTemplate, 
    loadTemplates, 
    currentRoom,
    isLoading 
  } = useGameStore();

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      navigate('/play');
    }
  };

  if (!currentRoom) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Choose Your Canvas
            </h1>
            <p className="text-gray-600">
              Pick a face template to start building on
            </p>
          </div>
          
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className={`relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-200 border-2
                         hover:shadow-xl hover:scale-[1.02] transform
                         ${selectedTemplate?.id === template.id 
                           ? 'border-purple-500 shadow-lg ring-4 ring-purple-200' 
                           : 'border-gray-200 hover:border-purple-300'}`}
            >
              {/* Template Image Placeholder */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
                <div className="w-24 h-32 border-2 border-gray-400 rounded-xl bg-gray-50"></div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
                {template.name}
              </h3>
              
              {selectedTemplate?.id === template.id && (
                <div className="absolute top-4 right-4 bg-purple-500 text-white rounded-full p-2">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedTemplate || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-8 rounded-xl font-semibold text-lg
                     hover:from-purple-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                     shadow-lg hover:shadow-xl"
          >
            Start Playing →
          </button>
        </div>
      </div>
    </div>
  );
};