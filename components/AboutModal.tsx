
import React, { useEffect, useRef } from 'react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      modalRef.current?.focus(); 
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
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70] p-4 animate-fadeIn"
      onClick={onClose} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      tabIndex={-1}
    >
      <div
        className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl relative transform transition-all animate-slideInUp max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
            <h2 id="about-modal-title" className="text-xl sm:text-2xl font-semibold text-blue-700 flex items-center">
                <i className="bi bi-info-circle-fill mr-3"></i>Acerca de OpenIN Pathfinder
            </h2>
            <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors p-1 rounded-md hover:bg-gray-100"
            aria-label="Cerrar ventana de 'Acerca de'"
            >
            <i className="bi bi-x-lg text-2xl"></i>
            </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-6">
            <p className="text-sm text-gray-700 leading-relaxed">
                <strong>OpenIN Pathfinder</strong> es un orientador educativo y profesional inteligente. Su misión es ayudar a los usuarios a descubrir rutas de aprendizaje personalizadas y herramientas gratuitas, basándose en su profesión, área de interés y nivel de experiencia.
            </p>

            <div className="space-y-3">
                <p className="text-xs text-center text-gray-600 bg-slate-50 p-2 rounded-md border border-slate-200">
                    <em>Una iniciativa de OpenIN Education en colaboración con Artur Creative Lab y Artur Creative Group.</em>
                </p>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center my-6 py-4 border-t border-b border-gray-100">
                <div className="flex flex-col items-center space-y-2">
                    <img src="https://i.imgur.com/n4RKvPb.png" alt="OpenIN Pathfinder Logo" className="h-10 sm:h-12 about-modal-logo" />
                    <p className="text-xs font-medium text-slate-700">OpenIN Education / Pathfinder</p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <img src="https://i.imgur.com/VFn5O5f.png" alt="Artur Creative Group Logo" className="h-10 sm:h-12 about-modal-logo" />
                    <p className="text-xs font-medium text-slate-700">Artur Creative Group</p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                    <img src="https://i.imgur.com/6DQRiiA.jpeg" alt="Artur Creative Lab Isotipo" className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg about-modal-logo" />
                    <p className="text-xs font-medium text-slate-700">Artur Creative Lab</p>
                </div>
            </div>
            
            <div className="space-y-4 text-sm text-gray-600">
                <p className="p-3 bg-blue-50 border border-blue-100 rounded-md">
                   <i className="bi bi-rocket-takeoff-fill text-blue-600 mr-1.5"></i> <strong>OpenIN Pathfinder</strong> forma parte del ecosistema educativo impulsado por <strong>Artur Creative Group</strong> para democratizar el conocimiento.
                </p>
                 <p className="p-3 bg-indigo-50 border border-indigo-100 rounded-md">
                   <i className="bi bi-lightbulb-fill text-indigo-600 mr-1.5"></i> Impulsado por <strong>Artur Creative Lab</strong> — explorando los límites entre IA, diseño y educación.
                </p>
            </div>

            <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100 text-center">
                Potenciado por modelos de Inteligencia Artificial de Google Gemini.
            </p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-colors duration-150 ease-in-out text-sm"
            >
                Cerrar
            </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
