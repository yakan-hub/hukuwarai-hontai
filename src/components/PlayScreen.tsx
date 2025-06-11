import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { ArrowLeft, Check, Users } from 'lucide-react';

const PART_CATEGORIES = [
  { id: 'hair', name: 'Hair', color: 'bg-amber-500' },
  { id: 'eyebrows', name: 'Eyebrows', color: 'bg-blue-500' },
  { id: 'eyes', name: 'Eyes', color: 'bg-green-500' },
  { id: 'nose', name: 'Nose', color: 'bg-red-500' },
  { id: 'mouth', name: 'Mouth', color: 'bg-purple-500' },
  { id: 'accessory', name: 'Accessory', color: 'bg-pink-500' }
];

const PARTS_PER_CATEGORY = 5;

interface DraggablePartProps {
  category: string;
  partId: string;
  src: string;
}

const DraggablePart: React.FC<DraggablePartProps> = ({ category, partId, src }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${category}-${partId}`,
    data: { category, partId, src }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1
  } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`w-16 h-16 bg-gray-200 rounded-lg cursor-grab active:cursor-grabbing 
                 hover:bg-gray-300 transition-colors border-2 border-gray-300
                 ${isDragging ? 'opacity-50 shadow-2xl' : 'hover:shadow-lg'}`}
    >
      {/* Part placeholder - in production would show actual part image */}
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-semibold">
        {partId}
      </div>
    </div>
  );
};

interface DropZoneProps {
  children: React.ReactNode;
}

const DropZone: React.FC<DropZoneProps> = ({ children }) => {
  const { isOver, setNodeRef } = useDroppable({ id: 'canvas' });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-full h-96 bg-white rounded-2xl border-4 border-dashed 
                 transition-colors ${isOver ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}`}
    >
      {/* Face Template Placeholder */}
      <div className="absolute inset-4 border-2 border-gray-400 rounded-xl bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-lg font-semibold">Face Template</div>
      </div>
      {children}
    </div>
  );
};

export const PlayScreen: React.FC = () => {
  const navigate = useNavigate();
  const { 
    currentRoom, 
    currentPlayer, 
    players, 
    placements, 
    selectedPart,
    addPlacement,
    nextTurn,
    subscribeToPlacements 
  } = useGameStore();
  
  const [activeCategory, setActiveCategory] = useState('hair');
  const [pendingPlacement, setPendingPlacement] = useState<any>(null);

  useEffect(() => {
    if (!currentRoom) {
      navigate('/');
      return;
    }

    const unsubscribe = subscribeToPlacements(currentRoom.id);
    return unsubscribe;
  }, [currentRoom, subscribeToPlacements, navigate]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && over.id === 'canvas' && active.data.current) {
      const { category, partId, src } = active.data.current;
      
      setPendingPlacement({
        room_id: currentRoom!.id,
        player_id: currentPlayer!.id,
        part_type: category,
        part_id: partId,
        x: Math.random() * 200 + 100, // Random position for demo
        y: Math.random() * 200 + 100,
        scale: 1,
        rotation: 0
      });
    }
  };

  const handleConfirm = async () => {
    if (pendingPlacement) {
      await addPlacement(pendingPlacement);
      await nextTurn();
      setPendingPlacement(null);
    }
  };

  const isMyTurn = currentRoom?.current_turn_player_id === currentPlayer?.id;
  const placedCategories = new Set(placements.map(p => p.part_type));
  const gameComplete = placedCategories.size === 6;

  if (gameComplete) {
    navigate('/finish');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/template')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Users className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-800">
                {isMyTurn ? "Your Turn!" : "Waiting..."}
              </h1>
            </div>
            <p className="text-gray-600">
              Room: {currentRoom?.id.slice(0, 8)}
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">Players Online</div>
            <div className="text-lg font-semibold text-purple-600">
              {players.length}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Canvas Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Canvas</h2>
              
              <DndContext onDragEnd={handleDragEnd}>
                <DropZone>
                  {/* Render placed parts */}
                  {placements.map((placement) => (
                    <div
                      key={placement.id}
                      className="absolute w-8 h-8 bg-blue-400 rounded border"
                      style={{
                        left: placement.x,
                        top: placement.y,
                        transform: `scale(${placement.scale}) rotate(${placement.rotation}deg)`
                      }}
                    />
                  ))}
                  {/* Render pending placement */}
                  {pendingPlacement && (
                    <div
                      className="absolute w-8 h-8 bg-yellow-400 rounded border-2 border-yellow-600"
                      style={{
                        left: pendingPlacement.x,
                        top: pendingPlacement.y
                      }}
                    />
                  )}
                </DropZone>
              </DndContext>

              {/* Confirm Button */}
              {pendingPlacement && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleConfirm}
                    className="bg-green-500 text-white py-3 px-6 rounded-xl font-semibold
                             hover:bg-green-600 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Check className="w-5 h-5" />
                    <span>Confirm Placement</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Parts Panel */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Parts</h2>
            
            {/* Category Tabs */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {PART_CATEGORIES.map((category) => {
                const isPlaced = placedCategories.has(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    disabled={!isMyTurn || isPlaced}
                    className={`p-3 rounded-lg text-sm font-semibold transition-all
                               ${activeCategory === category.id 
                                 ? `${category.color} text-white shadow-lg` 
                                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                               ${isPlaced ? 'opacity-50 cursor-not-allowed' : ''}
                               ${!isMyTurn ? 'cursor-not-allowed opacity-60' : ''}`}
                  >
                    {category.name}
                    {isPlaced && <span className="ml-1">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Parts Grid */}
            <DndContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: PARTS_PER_CATEGORY }, (_, i) => (
                  <DraggablePart
                    key={`${activeCategory}-${i + 1}`}
                    category={activeCategory}
                    partId={`${i + 1}`}
                    src={`/parts/${activeCategory}/${activeCategory}${i + 1}.png`}
                  />
                ))}
              </div>
            </DndContext>

            {!isMyTurn && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-yellow-800 text-sm">
                  Waiting for other players...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};