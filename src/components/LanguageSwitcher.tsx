import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage, Language } from '../i18n';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'segmented';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'dropdown', className = '' }) => {
  const { language, setLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'segmented') {
    return (
      <div className={`lang-segmented ${className}`}>
        {availableLanguages.map((item) => (
          <button
            key={item.code}
            type="button"
            className={`lang-segmented-btn ${language === item.code ? 'active' : ''}`}
            onClick={() => setLanguage(item.code as Language)}
            aria-label={item.label}
          >
            <span>{item.code.toUpperCase()}</span>
            <small>{item.label}</small>
          </button>
        ))}
      </div>
    );
  }

  const currentLang = availableLanguages.find((l) => l.code === language) || availableLanguages[0];

  return (
    <div className={`lang-dropdown-wrapper ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className="lang-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Tilni tanlash / Выберите язык / Select language"
      >
        <Globe size={16} className="lang-globe-icon" />
        <span className="lang-current-code">{currentLang.code.toUpperCase()}</span>
        <ChevronDown size={14} className={`lang-arrow ${isOpen ? 'rotate' : ''}`} />
      </button>

      {isOpen && (
        <div className="lang-menu" role="menu">
          {availableLanguages.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`lang-menu-item ${language === item.code ? 'selected' : ''}`}
              onClick={() => {
                setLanguage(item.code as Language);
                setIsOpen(false);
              }}
              role="menuitem"
            >
              <span className="lang-menu-code">{item.code.toUpperCase()}</span>
              <span className="lang-menu-label">{item.label}</span>
              {language === item.code && <Check size={14} className="lang-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
