
import React, { useState, useCallback, useEffect } from 'react';
import SearchModal from './components/SearchModal';
import MainDashboardLayout from './components/MainDashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';
import OnboardingScreen from './components/OnboardingScreen';
import { generateGuidance } from './services/geminiService';
import type { GeneratedContent } from './types';
import { APP_TITLE } from './constants';
import './index.css';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [chatPrefill, setChatPrefill] = useState<string>(''); // New state for chat pre-fill

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setCurrentQuery(query);
    setIsSearchModalOpen(false);
    setShowOnboarding(false);
    setChatPrefill(''); // Clear prefill on new search
    try {
      const generatedData = await generateGuidance(query);
      setResults(generatedData);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Ocurrió un error inesperado al generar la guía.');
      }
      console.error("Search error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartOnboarding = () => {
    setShowOnboarding(false);
    setIsSearchModalOpen(true);
  };

  useEffect(() => {
    if (results) {
      setShowOnboarding(false);
    }
  }, [results]);

  const handleSetChatPrefill = (text: string) => {
    setChatPrefill(text);
  };

  const clearChatPrefill = useCallback(() => {
    setChatPrefill('');
  }, []);


  if (showOnboarding && !results && !isLoading && !error) {
    return (
        <div className="onboarding-screen-container">
            <OnboardingScreen onStart={handleStartOnboarding} />
        </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-gray-800 antialiased">
      {!results && !isLoading && !error && !showOnboarding && (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
            <header className="mb-10">
                <h1 className="text-4xl sm:text-5xl font-bold text-blue-700 tracking-tight">
                {APP_TITLE} <span role="img" aria-label="Compass" style={{fontFamily: "Noto Color Emoji, Segoe UI Emoji, sans-serif"}}>🧭</span>
                </h1>
                <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                Tu guía inteligente para rutas de aprendizaje y herramientas profesionales.
                </p>
            </header>
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                <i className="bi bi-compass text-7xl text-blue-400 mb-6"></i>
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Bienvenido de Nuevo a OpenIN Pathfinder</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Haz clic en el botón de abajo para ingresar tu profesión, rol o área de interés y comenzar tu viaje de aprendizaje personalizado.
                </p>
                <button
                    onClick={() => setIsSearchModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-150 ease-in-out text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
                    aria-label="Iniciar nueva búsqueda"
                >
                    <i className="bi bi-search mr-2"></i> Iniciar Búsqueda
                </button>
            </div>
             <footer className="text-center mt-12 py-4">
                <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} {APP_TITLE}. Potenciado por IA con modelos de Google Gemini.
                </p>
            </footer>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-slate-100 bg-opacity-95 flex items-center justify-center z-[100]">
          <LoadingSpinner />
        </div>
      )}

      {results && !isLoading && (
        <>
          <MainDashboardLayout
            data={results}
            error={error}
            originalUserQuery={currentQuery}
            onNewSearchClick={() => setIsSearchModalOpen(true)}
            onSetChatPrefill={handleSetChatPrefill} 
            chatPrefill={chatPrefill} 
            clearChatPrefill={clearChatPrefill} 
          />
           <button
            onClick={() => setIsSearchModalOpen(true)}
            className="app-fab-search-button fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-150 ease-in-out z-40 focus:outline-none focus:ring-4 focus:ring-blue-300"
            aria-label="Iniciar nueva búsqueda"
          >
            <i className="bi bi-search text-2xl"></i>
          </button>
        </>
      )}

      {error && !isLoading && !results && !showOnboarding && (
         <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
             <div className="mt-8 p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md max-w-2xl mx-auto" role="alert">
                <div className="flex items-center">
                    <i className="bi bi-exclamation-triangle-fill text-2xl mr-3"></i>
                    <h2 className="text-xl font-semibold">Error al Generar Guía</h2>
                </div>
                <p className="mt-2">{error}</p>
                <p className="mt-2 text-sm">Por favor, intenta reformular tu consulta o inténtalo de nuevo más tarde.</p>
                 <button
                    onClick={() => setIsSearchModalOpen(true)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <i className="bi bi-search mr-2"></i> Nueva Búsqueda
                </button>
            </div>
        </div>
      )}


      {isSearchModalOpen && (
        <div className="search-modal-container">
            <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            onSearch={handleSearch}
            isLoading={isLoading}
            currentQuery={currentQuery}
            />
        </div>
      )}
    </div>
  );
};

export default App;