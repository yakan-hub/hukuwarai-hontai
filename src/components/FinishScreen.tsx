import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { Download, Share, RotateCcw, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';

export const FinishScreen: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { currentRoom, placements, reset } = useGameStore();

  const handleDownload = async () => {
    if (canvasRef.current) {
      try {
        const canvas = await html2canvas(canvasRef.current);
        const link = document.createElement('a');
        link.download = 'fukuwarai-creation.png';
        link.href = canvas.toDataURL();
        link.click();
      } catch (error) {
        console.error('Failed to download image:', error);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share && canvasRef.current) {
      try {
        const canvas = await html2canvas(canvasRef.current);
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'fukuwarai-creation.png', { type: 'image/png' });
            await navigator.share({
              title: 'Check out our FUKUWARAI creation!',
              text: 'We built this funny face together online!',
              files: [file]
            });
          }
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // Fallback to copying link
      const text = 'Check out our FUKUWARAI creation! We built this funny face together online.';
      await navigator.clipboard.writeText(text);
    }
  };

  const handlePlayAgain = () => {
    reset();
    navigate('/');
  };

  if (!currentRoom) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-yellow-500 mr-2" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Masterpiece Complete!
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Look at the hilarious face you created together!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Final Canvas */}
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div
              ref={canvasRef}
              className="relative w-full h-96 bg-gray-50 rounded-xl border-2 border-gray-200"
            >
              {/* Face Template Placeholder */}
              <div className="absolute inset-4 border-2 border-gray-400 rounded-xl bg-white flex items-center justify-center">
                <div className="text-gray-300 text-lg font-semibold">Your Creation</div>
              </div>
              
              {/* Render all placed parts */}
              {placements.map((placement) => (
                <div
                  key={placement.id}
                  className="absolute w-8 h-8 bg-blue-400 rounded border-2 border-blue-600"
                  style={{
                    left: placement.x,
                    top: placement.y,
                    transform: `scale(${placement.scale}) rotate(${placement.rotation}deg)`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Actions Panel */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Game Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Parts Placed:</span>
                  <span className="font-semibold text-2xl text-green-600">{placements.length}/6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Room ID:</span>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {currentRoom.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Share Your Creation</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownload}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold
                           hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download PNG</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-semibold
                           hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Share className="w-5 h-5" />
                  <span>Share</span>
                </button>
                
                <button
                  onClick={handlePlayAgain}
                  className="w-full bg-gradient-to-r from-orange-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold
                           hover:from-orange-600 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Play Again</span>
                </button>
              </div>
            </div>

            {/* Fun Messages */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-2">🎉 Fantastic!</h3>
              <p className="text-yellow-100">
                You've successfully collaborated to create a unique FUKUWARAI face! 
                The creativity and teamwork were amazing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};