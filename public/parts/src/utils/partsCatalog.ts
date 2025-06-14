export interface FacePart {
  id: string;
  name: string;
  category: 'face' | 'eyes' | 'eyebrows' | 'nose' | 'mouth' | 'hair';
  imagePath: string;
}

export const partsCatalog: FacePart[] = [
  // Face outlines
  {
    id: 'face-1',
    name: 'Face Outline 1',
    category: 'face',
    imagePath: '/parts/blank face outline/sample-face1.png'
  },
  {
    id: 'face-2',
    name: 'Face Outline 2',
    category: 'face',
    imagePath: '/parts/blank face outline/sample-face2.png'
  },
  {
    id: 'face-3',
    name: 'Face Outline 3',
    category: 'face',
    imagePath: '/parts/blank face outline/sample-face3.png'
  },
  
  // Eyes
  {
    id: 'eyes-1',
    name: 'Eyes Style 1',
    category: 'eyes',
    imagePath: '/parts/eyes/sample-eyes1.png'
  },
  {
    id: 'eyes-2',
    name: 'Eyes Style 2',
    category: 'eyes',
    imagePath: '/parts/eyes/sample-eyes2.png'
  },
  {
    id: 'eyes-3',
    name: 'Eyes Style 3',
    category: 'eyes',
    imagePath: '/parts/eyes/sample-eyes3.png'
  },
  
  // Eyebrows
  {
    id: 'eyebrows-1',
    name: 'Eyebrows Style 1',
    category: 'eyebrows',
    imagePath: '/parts/eyebrows/sample-eyebrows1.png'
  },
  {
    id: 'eyebrows-2',
    name: 'Eyebrows Style 2',
    category: 'eyebrows',
    imagePath: '/parts/eyebrows/sample-eyebrows2.png'
  },
  {
    id: 'eyebrows-3',
    name: 'Eyebrows Style 3',
    category: 'eyebrows',
    imagePath: '/parts/eyebrows/sample-eyebrows3.png'
  },
  
  // Nose
  {
    id: 'nose-1',
    name: 'Nose Style 1',
    category: 'nose',
    imagePath: '/parts/nose/sample-nose1.png'
  },
  {
    id: 'nose-2',
    name: 'Nose Style 2',
    category: 'nose',
    imagePath: '/parts/nose/sample-nose2.png'
  },
  {
    id: 'nose-3',
    name: 'Nose Style 3',
    category: 'nose',
    imagePath: '/parts/nose/sample-nose3.png'
  },
  
  // Mouth
  {
    id: 'mouth-1',
    name: 'Mouth Style 1',
    category: 'mouth',
    imagePath: '/parts/mouth/sample-mouth1.png'
  },
  {
    id: 'mouth-2',
    name: 'Mouth Style 2',
    category: 'mouth',
    imagePath: '/parts/mouth/sample-mouth2.png'
  },
  {
    id: 'mouth-3',
    name: 'Mouth Style 3',
    category: 'mouth',
    imagePath: '/parts/mouth/sample-mouth3.png'
  },
  
  // Hair
  {
    id: 'hair-1',
    name: 'Hair Style 1',
    category: 'hair',
    imagePath: '/parts/hair/sample-hair1.png'
  }
];

// Helper functions to get parts by category
export const getPartsByCategory = (category: FacePart['category']): FacePart[] => {
  return partsCatalog.filter(part => part.category === category);
};

export const getPartById = (id: string): FacePart | undefined => {
  return partsCatalog.find(part => part.id === id);
};

// Get all available categories
export const getCategories = (): FacePart['category'][] => {
  return ['face', 'eyes', 'eyebrows', 'nose', 'mouth', 'hair'];
};