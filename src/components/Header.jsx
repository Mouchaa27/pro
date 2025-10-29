import React from 'react';
import { Link } from 'react-router-dom';
import './css/Header.css';
import { useLanguage } from '../context/LanguageContext.jsx';

const Header = () => {
  const { lang, toggle, t } = useLanguage();
  return (
    <header className="header">
      <div className="header-content">
        <a href="https://www.schb.dz/" target="_blank" rel="noopener noreferrer">
          <img 
            src="/Logo-Gica.png"  
            alt="SCHB Logo" 
            className="logo"
          />
        </a>
        <div className="header-text">
          <h1>{t('header.title')}</h1>
          <p>{t('header.subtitle')}</p>
        </div>
      </div>
      <div className="header-lang">
        <button type="button" className="lang-toggle" onClick={toggle}>
          {lang === 'fr' ? 'العربية' : 'Français'}
        </button>
      </div>
      <div className="header-actions">
        <Link className="header-link" to="/">{t('nav.home')}</Link>
        <Link className="header-link" to="/plainte">{t('nav.report')}</Link>
        <Link className="header-link" to="/politique-anti-corruption">{t('nav.policy')}</Link>
        <Link className="header-link" to="/about">{t('nav.about')}</Link>
      </div>
    </header>
  );
};

export default Header;