
import React from 'react';
import type { ExamResults } from '../../types';
import SearchSuggestionDisplay from './SearchSuggestionDisplay'; // Assuming you might add search suggestions later

interface ExamResultsDisplayProps {
  results: ExamResults;
  onSetChatPrefill: (text: string) => void;
}

const ExamResultsDisplay: React.FC<ExamResultsDisplayProps> = ({ results, onSetChatPrefill }) => {
  const scoreColor = results.scorePercentage >= 70 ? 'text-green-600' : results.scorePercentage >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <section id="exam-results" aria-labelledby="exam-results-title" className="bg-white rounded-xl shadow-lg p-5 sm:p-6 mb-6 sm:mb-8 scroll-mt-20">
      <div className="flex items-center mb-4">
        <i className="bi bi-patch-check-fill text-3xl text-blue-600 mr-4"></i>
        <h1 id="exam-results-title" className="text-xl sm:text-2xl font-semibold text-gray-800">Resultados del Examen Diagnóstico</h1>
      </div>

      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">Tu Puntuación: 
          <span className={`ml-2 font-bold ${scoreColor}`}>{results.scorePercentage}%</span>
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">{results.feedbackMessage}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Validated Topics */}
        <div>
          <h3 className="text-md font-semibold text-green-700 mb-3 flex items-center">
            <i className="bi bi-check-circle-fill mr-2"></i> Temas Dominados
          </h3>
          {results.validatedTopics.length > 0 ? (
            <ul className="space-y-2">
              {results.validatedTopics.map((topic, index) => (
                <li key={`val-${index}`} className="p-2.5 bg-green-50 border border-green-200 rounded-md text-sm text-green-800 shadow-sm">
                  <strong>{topic.stageTitle}:</strong> {topic.topicName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">No se identificaron temas completamente dominados en esta evaluación. ¡Sigue aprendiendo!</p>
          )}
        </div>

        {/* Topics to Reinforce */}
        <div>
          <h3 className="text-md font-semibold text-yellow-700 mb-3 flex items-center">
            <i className="bi bi-exclamation-triangle-fill mr-2"></i> Temas a Reforzar
          </h3>
          {results.topicsToReinforce.length > 0 ? (
            <ul className="space-y-2">
              {results.topicsToReinforce.map((topic, index) => (
                <li key={`reinf-${index}`} className="p-2.5 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 shadow-sm">
                  <strong>{topic.stageTitle}:</strong> {topic.topicName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">¡Buen trabajo! Parece que no hay temas específicos que requieran refuerzo urgente según esta evaluación.</p>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
        <button
          onClick={() => onSetChatPrefill("¿Puedes darme más consejos basados en los resultados de mi examen?")}
          className="interactive-button-in-section text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium py-1.5 px-3 rounded-md transition-colors flex items-center"
        >
          <i className="bi bi-chat-dots-fill mr-1.5"></i> Comentar Resultados
        </button>
      </div>
    </section>
  );
};

export default ExamResultsDisplay;
