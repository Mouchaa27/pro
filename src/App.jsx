import React from 'react';
import './App.css';
import './components/css/Common.css';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Accueil from './pages/Accueil.jsx';
import PoserUnePlainte from './pages/PoserUnePlainte.jsx';
import PolitiqueAntiCorruption from './pages/PolitiqueAntiCorruption.jsx';
import About from './pages/About.jsx';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/plainte" element={<PoserUnePlainte />} />
          <Route path="/politique-anti-corruption" element={<PolitiqueAntiCorruption />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;