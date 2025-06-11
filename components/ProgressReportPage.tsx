
import React from 'react';
import type { GeneratedContent, ProgressReportData, ChecklistCompletionMap, ChecklistPoint, CategorizedTools } from '../types';
import { APP_TITLE } from '../constants';
import SearchSuggestionDisplay from './sections/SearchSuggestionDisplay';

interface ProgressReportPageProps {
  query: string;
  reportDate: Date;
  generatedContent: GeneratedContent;
  checklistCompletion: ChecklistCompletionMap;
  progressReportAIData: ProgressReportData;
  onReturnToDashboard: () => void; // New prop
}

const ProgressReportPage: React.FC<ProgressReportPageProps> = ({
  query,
  reportDate,
  generatedContent,
  checklistCompletion,
  progressReportAIData,
  onReturnToDashboard, // New prop
}) => {
  const { examResults, selfDiagnosisChecklist, recommendedTools } = generatedContent;
  const { actionPlan, websiteSuggestions, finalAdvice } = progressReportAIData;

  const completedChecklistItems: ChecklistPoint[] = selfDiagnosisChecklist.filter((_, index) => checklistCompletion[index]);
  const pendingChecklistItems: ChecklistPoint[] = selfDiagnosisChecklist.filter((_, index) => !checklistCompletion[index]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="progress-report-container p-8 font-sans bg-white min-h-screen">
      {/* Non-printable Back Button */}
      <div className="no-print mb-6 flex justify-start">
        <button
          onClick={onReturnToDashboard}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-colors duration-150 ease-in-out flex items-center text-sm"
          aria-label="Volver al dashboard principal"
        >
          <i className="bi bi-arrow-left-circle-fill mr-2"></i> Volver al Dashboard
        </button>
      </div>

      {/* Report Header */}
      <header className="report-header text-center mb-10 pb-4 border-b-2 border-gray-300">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">{APP_TITLE} - Reporte de Progreso</h1>
        <p className="text-md text-gray-600">Para: <span className="font-semibold">{query}</span></p>
        <p className="text-sm text-gray-500">Generado el: {formatDate(reportDate)}</p>
      </header>

      {/* 1. Resumen del progreso actual */}
      {examResults && (
        <section className="report-section mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="report-section-title text-xl font-semibold text-blue-600 mb-3 flex items-center">
            <i className="bi bi-graph-up-arrow mr-2"></i>Resumen del Progreso Actual (según Examen)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-green-600 mb-2">Temas que Dominas:</h3>
              {examResults.validatedTopics.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {examResults.validatedTopics.map(topic => (
                    <li key={`val-${topic.stageTitle}-${topic.topicName}`}><strong>{topic.stageTitle}:</strong> {topic.topicName}</li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-500 italic">No se identificaron temas completamente dominados.</p>}
            </div>
            <div>
              <h3 className="text-lg font-medium text-yellow-600 mb-2">Temas a Reforzar:</h3>
              {examResults.topicsToReinforce.length > 0 ? (
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                  {examResults.topicsToReinforce.map(topic => (
                    <li key={`reinf-${topic.stageTitle}-${topic.topicName}`}><strong>{topic.stageTitle}:</strong> {topic.topicName}</li>
                  ))}
                </ul>
              ) : <p className="text-sm text-gray-500 italic">¡Excelente! No hay temas urgentes para reforzar.</p>}
            </div>
          </div>
           <p className="text-sm text-gray-600 mt-3 p-3 bg-slate-50 rounded-md border border-slate-200">
            <strong>Feedback General del Examen:</strong> {examResults.feedbackMessage}
          </p>
        </section>
      )}

      {/* 2. Checklist marcado */}
      <section className="report-section mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="report-section-title text-xl font-semibold text-blue-600 mb-3 flex items-center">
            <i className="bi bi-check2-square mr-2"></i>Checklist de Autodiagnóstico
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h3 className="text-lg font-medium text-green-600 mb-2">Habilidades Confirmadas:</h3>
                {completedChecklistItems.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {completedChecklistItems.map((item, index) => <li key={`comp-check-${index}`}>{item.point}</li>)}
                    </ul>
                ) : <p className="text-sm text-gray-500 italic">Ningún punto marcado como completado.</p>}
            </div>
            <div>
                <h3 className="text-lg font-medium text-yellow-600 mb-2">Habilidades Pendientes:</h3>
                {pendingChecklistItems.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                    {pendingChecklistItems.map((item, index) => <li key={`pend-check-${index}`}>{item.point}</li>)}
                    </ul>
                ) : <p className="text-sm text-gray-500 italic">¡Todo completado en el checklist!</p>}
            </div>
        </div>
      </section>

      {/* 3. Plan de acción personalizado */}
      <section className="report-section mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
        <h2 className="report-section-title text-xl font-semibold text-blue-600 mb-3 flex items-center">
            <i className="bi bi-bullseye mr-2"></i>Plan de Acción Personalizado
        </h2>
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-1">Recomendaciones Concretas:</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-3">
            {actionPlan.recommendations.map((rec, i) => <li key={`rec-${i}`}>{rec}</li>)}
          </ul>
        </div>
        {actionPlan.examErrorTips.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Consejos Basados en el Examen:</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mb-3">
              {actionPlan.examErrorTips.map((tip, i) => <li key={`tip-${i}`}>{tip}</li>)}
            </ul>
          </div>
        )}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Sugerencias de Estudio:</h3>
          {actionPlan.studySuggestions.map((studyType, i) => (
            <div key={`study-${i}`} className="mb-2">
              <p className="text-md font-semibold text-gray-600">{studyType.resourceType}:</p>
              <ul className="list-disc pl-8 text-sm text-gray-700 space-y-0.5">
                {studyType.suggestions.map((sug, j) => <li key={`sug-${i}-${j}`}>{sug}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Herramientas recomendadas */}
      {recommendedTools && recommendedTools.length > 0 && (
        <section className="report-section mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="report-section-title text-xl font-semibold text-blue-600 mb-3 flex items-center">
            <i className="bi bi-tools mr-2"></i>Herramientas Recomendadas
          </h2>
          {recommendedTools.map((category, catIndex) => (
            <div key={`tool-cat-report-${catIndex}`} className="mb-3">
              <h3 className="text-lg font-medium text-gray-700 capitalize">{category.categoryName}</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {category.tools.map((tool, toolIndex) => (
                  <li key={`tool-report-${toolIndex}`}>
                    <strong>{tool.toolName}:</strong> {tool.description}
                    {tool.searchSuggestion && <SearchSuggestionDisplay suggestion={tool.searchSuggestion} className="ml-1 text-xs print-search-suggestion"/>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* 5. Sitios web sugeridos */}
      {websiteSuggestions && websiteSuggestions.length > 0 && (
        <section className="report-section mb-8 p-4 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="report-section-title text-xl font-semibold text-blue-600 mb-3 flex items-center">
            <i className="bi bi-globe2 mr-2"></i>Sitios Web Sugeridos (para temas pendientes)
          </h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            {websiteSuggestions.map((site, i) => (
              <li key={`site-${i}`}>
                <strong>{site.platformName}:</strong> {site.reasonForSuggestion}.
                {site.searchSuggestion && <SearchSuggestionDisplay suggestion={site.searchSuggestion} className="ml-1 text-xs print-search-suggestion"/>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 6. Consejo final personalizado */}
      <section className="report-section mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
        <h2 className="report-section-title text-xl font-semibold text-blue-600 mb-3 flex items-center">
            <i className="bi bi-lightbulb-fill mr-2"></i>Consejo Final
        </h2>
        <p className="text-md text-gray-800 italic">{finalAdvice}</p>
      </section>

      <footer className="report-footer text-center mt-10 pt-4 border-t border-gray-300">
        <div className="mb-4 flex flex-wrap justify-center items-center space-x-3 sm:space-x-4 report-logos-container">
            <img src="https://i.imgur.com/n4RKvPb.png" alt="OpenIN Pathfinder" className="h-7 sm:h-8 report-logo" />
            <img src="https://i.imgur.com/VFn5O5f.png" alt="Artur Creative Group" className="h-7 sm:h-8 report-logo" />
            <img src="https://i.imgur.com/T1cKsfw.png" alt="Artur Creative Lab" className="h-7 sm:h-8 report-logo" />
        </div>
        <p className="text-[10px] sm:text-xs text-gray-600 mb-1">
            Este documento fue generado automáticamente por OpenIN Pathfinder, una herramienta de Artur Creative Lab desarrollada para OpenIN Education.
        </p>
        <p className="text-[10px] sm:text-xs text-gray-500">
          Este reporte es una guía generada por IA y debe ser usada como una herramienta de apoyo.
          <br />&copy; {new Date().getFullYear()} {APP_TITLE}. Potenciado por Google Gemini.
        </p>
      </footer>
    </div>
  );
};

export default ProgressReportPage;
