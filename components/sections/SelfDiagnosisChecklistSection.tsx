
import React from 'react';
import type { ChecklistPoint, ChecklistCompletionMap } from '../../types';
import SearchSuggestionDisplay from './SearchSuggestionDisplay';

interface SelfDiagnosisChecklistSectionProps {
  checklist: ChecklistPoint[];
  completion: ChecklistCompletionMap;
  onToggleComplete: (index: number) => void;
  onSetChatPrefill: (text: string) => void;
}

const SelfDiagnosisChecklistSection: React.FC<SelfDiagnosisChecklistSectionProps> = ({ checklist, completion, onToggleComplete, onSetChatPrefill }) => {
  
  const completedCount = Object.values(completion).filter(Boolean).length;
  const progressPercentage = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

  if (!checklist || checklist.length === 0) {
    return null; 
  }

  return (
    <section id="self-diagnosis-checklist" aria-labelledby="checklist-title" className="bg-white rounded-xl shadow-lg p-5 sm:p-6 scroll-mt-20 checklist-section-print">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
            <i className="bi bi-check2-square text-3xl text-teal-600 mr-4"></i>
            <h1 id="checklist-title" className="text-xl sm:text-2xl font-semibold text-gray-800">Checklist de Autodiagnóstico</h1>
        </div>
        {checklist.length > 0 && (
            <span className="text-sm font-medium text-teal-700 bg-teal-100 px-3 py-1 rounded-full hide-on-print">
                {completedCount} / {checklist.length} completado
            </span>
        )}
      </div>
       <p className="text-gray-600 mb-3 text-sm">Verifica tu comprensión y progreso con estos puntos clave.</p>

      {checklist.length > 0 && (
        <div className="mb-6 progress-bar-container-print">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-teal-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <ul className="space-y-3">
        {checklist.map((item, index) => (
          <li
            key={`checklist-${index}`}
            className={`p-3 border rounded-lg transition-all duration-300 flex items-start space-x-3 checklist-item-print
                        ${completion[index] ? 'bg-teal-50 border-teal-300' : 'bg-slate-50 border-gray-200 hover:shadow-sm'}`}
          >
            <input
              type="checkbox"
              id={`checklist-item-${index}`}
              checked={!!completion[index]}
              onChange={() => onToggleComplete(index)}
              className="mt-1 h-5 w-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
              aria-labelledby={`checklist-label-${index}`}
            />
            <label htmlFor={`checklist-item-${index}`} id={`checklist-label-${index}`} className="flex-grow cursor-pointer">
              <span className={`text-sm ${completion[index] ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                {item.point}
              </span>
              {item.searchSuggestion && (
                <div className="mt-1">
                    <SearchSuggestionDisplay suggestion={item.searchSuggestion} />
                </div>
              )}
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end interactive-button-in-section">
        <button
            onClick={() => onSetChatPrefill("¿Puedes explicarme alguno de estos puntos del checklist con más detalle?")}
            className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium py-1.5 px-3 rounded-md transition-colors flex items-center"
        >
            <i className="bi bi-chat-dots-fill mr-1.5"></i> Preguntar sobre el checklist
        </button>
      </div>
    </section>
  );
};

export default SelfDiagnosisChecklistSection;
