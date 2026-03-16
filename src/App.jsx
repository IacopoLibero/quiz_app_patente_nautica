import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import NauticaMenu from './pages/NauticaMenu/NauticaMenu';
import VelaMenu from './pages/VelaMenu/VelaMenu';
import Quiz from './pages/Quiz/Quiz';
import Risultato from './pages/Risultato/Risultato';
import Statistiche from './pages/Statistiche/Statistiche';
import CarteggioMenu from './pages/CarteggioMenu/CarteggioMenu';
import CarteggioQuiz from './pages/CarteggioQuiz/CarteggioQuiz';

function App() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nautica" element={<NauticaMenu />} />
        <Route path="/vela" element={<VelaMenu />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/risultato" element={<Risultato />} />
        <Route path="/statistiche" element={<Statistiche />} />
        <Route path="/carteggio" element={<CarteggioMenu />} />
        <Route path="/carteggio/quiz" element={<CarteggioQuiz />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
