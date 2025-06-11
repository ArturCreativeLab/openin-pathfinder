import React, { useEffect, useRef } from 'react';
import SearchBar from './SearchBar';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  isLoading: boolean;
  currentQuery: string;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch, isLoading, currentQuery }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      modalRef.current?.focus(); // Focus the modal for screen readers
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose} // Close on backdrop click
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      tabIndex={-1}
    >
      <div
        className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl relative transform transition-all animate-slideInUp"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
          aria-label="Cerrar ventana de búsqueda"
        >
          <i className="bi bi-x-lg text-2xl"></i>
        </button>
        <h2 id="search-modal-title" className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 text-center">
          Nueva Búsqueda
        </h2>
        <p className="text-gray-600 mb-6 text-center text-sm sm:text-base">
          Ingresa tu profesión, rol o área de interés y, opcionalmente, tu nivel de experiencia.
        </p>
        <SearchBar onSearch={onSearch} isLoading={isLoading} initialQuery={currentQuery} />
        <p className="mt-4 text-xs text-gray-500 text-center">
            Ej: "Soy diseñador UX nivel intermedio", "Quiero ser data scientist", "Profesor de música sin experiencia".
        </p>
      </div>
    </div>
  );
};

export default SearchModal;
