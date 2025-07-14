import { useState, useRef, useEffect } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import "./LanguageSelector.css";

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = availableLanguages.find(
    (lang) => lang.code === currentLanguage
  );

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-button"
        onClick={toggleDropdown}
        aria-label="Select language"
      >
        <Globe size={18} className="language-icon" />
        <span className="language-flag">{currentLang?.flag}</span>
        <span className="language-code">{currentLang?.code.toUpperCase()}</span>
        <ChevronDown size={16} className={`chevron ${isOpen ? "open" : ""}`} />
      </button>

      <div className={`language-dropdown ${isOpen ? "open" : ""}`}>
        {availableLanguages.map((language) => (
          <button
            key={language.code}
            className={`language-option ${
              currentLanguage === language.code ? "active" : ""
            }`}
            onClick={() => handleLanguageChange(language.code)}
          >
            <span className="option-flag">{language.flag}</span>
            <span className="option-name">{language.name}</span>
            {currentLanguage === language.code && (
              <span className="option-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
