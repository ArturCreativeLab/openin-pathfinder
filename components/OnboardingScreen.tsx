
import React from 'react';
// APP_TITLE is no longer used for the main title, as it's replaced by a logo
// import { APP_TITLE } from '../constants';

interface OnboardingScreenProps {
  onStart: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onStart }) => {
  const features = [
    { icon: "bi-person-check-fill", title: "Identifica tu Perfil", description: "Selecciona tu profesión, área de interés o rol actual." },
    { icon: "bi-bar-chart-line-fill", title: "Define tu Nivel", description: "Indica tu experiencia: básico, intermedio o avanzado." },
    { icon: "bi-compass-fill", title: "Descubre tu Ruta", description: "Obtén un plan de aprendizaje y herramientas personalizadas." },
    { icon: "bi-lightbulb-fill", title: "Explora y Aprende", description: "Encuentra recursos, IA y plataformas para potenciar tu carrera." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn relative">
      <header className="text-center mb-8 sm:mb-12">
        {/* Replace H1 text with logo */}
        <img 
          src="https://i.imgur.com/0v7XUWX.png" 
          alt="OpenIN Pathfinder Logo" 
          className="h-16 sm:h-20 mx-auto mb-4" // Adjusted height and margin
        />
        <p className="text-lg sm:text-xl text-blue-200 max-w-3xl mx-auto">
          Tu asistente inteligente para trazar rutas de aprendizaje y descubrir herramientas que impulsarán tu desarrollo profesional y personal.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl w-full mb-10 sm:mb-12">
        {features.map((feature, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-md p-5 sm:p-6 rounded-xl shadow-lg flex items-start space-x-4">
            <div className="flex-shrink-0">
              <i className={`${feature.icon} text-3xl sm:text-4xl text-blue-300`}></i>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm sm:text-base text-blue-200">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="bg-white hover:bg-blue-50 text-blue-700 font-bold py-3 sm:py-4 px-10 sm:px-12 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 ease-in-out text-lg sm:text-xl focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
        aria-label="Empezar ahora y configurar mi ruta de aprendizaje"
      >
        <i className="bi bi-play-circle-fill mr-2 sm:mr-3"></i> Empezar Ahora
      </button>

      <footer className="text-center mt-10 sm:mt-16 py-4">
        <p className="text-xs sm:text-sm text-blue-300">
          Potenciado por Modelos de IA de Google Gemini.
        </p>
      </footer>
    </div>
  );
};

export default OnboardingScreen;
