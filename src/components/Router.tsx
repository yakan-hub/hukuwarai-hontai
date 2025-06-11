import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StartScreen } from './StartScreen';
import { TemplateSelectScreen } from './TemplateSelectScreen';
import { PlayScreen } from './PlayScreen';
import { FinishScreen } from './FinishScreen';

export const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/template" element={<TemplateSelectScreen />} />
        <Route path="/play" element={<PlayScreen />} />
        <Route path="/finish" element={<FinishScreen />} />
      </Routes>
    </BrowserRouter>
  );
};