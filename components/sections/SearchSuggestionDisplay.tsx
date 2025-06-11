
import React from 'react';

interface SearchSuggestionDisplayProps {
  suggestion: string;
  className?: string;
  onClick?: () => void; // Optional: for custom click handling if needed beyond opening link
}

const SearchSuggestionDisplay: React.FC<SearchSuggestionDisplayProps> = ({ suggestion, className, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    const query = suggestion.substring(suggestion.indexOf("'") + 1, suggestion.lastIndexOf("'"));
    if (query) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
    }
  };

  if (!suggestion || suggestion.indexOf("'") === -1 || suggestion.lastIndexOf("'") === -1 ) {
    return null; // Don't render if suggestion is malformed
  }
  
  const displayQuery = suggestion.substring(suggestion.indexOf("'")+1, suggestion.lastIndexOf("'"));


  return (
    <button
      type="button"
      className={`text-xs text-blue-600 hover:text-blue-700 mt-1 inline-flex items-center hover:underline focus:outline-none focus:ring-1 focus:ring-blue-400 rounded search-suggestion-print ${className}`}
      onClick={handleClick}
      title={`Buscar: ${displayQuery}`}
    >
      <i className="bi bi-search mr-1.5"></i>
      {displayQuery}
    </button>
  );
};

export default SearchSuggestionDisplay;