import React, { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialQuery?: string; // Optional: To prefill the search bar
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center border-2 border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: Soy diseñador gráfico nivel básico..."
          className="w-full px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none text-base"
          disabled={isLoading}
          aria-label="Ingresa tu profesión o área de interés y tu nivel de experiencia"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-5 py-3 bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out h-full flex items-center justify-center min-w-[100px] sm:min-w-[120px]"
          aria-label="Buscar orientación"
        >
          {isLoading ? (
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          ) : (
            <i className="bi bi-search text-xl"></i>
          )}
          <span className="ml-2 hidden sm:inline">Buscar</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
