
import React from 'react';
import type { GeneratedContent, ExamResults, ChecklistCompletionMap } from '../types'; // Added ExamResults

// Import new section components
import LearningPathSection from './sections/LearningPathSection';
import SelfDiagnosisChecklistSection from './sections/SelfDiagnosisChecklistSection';
import ExamResultsDisplay from './sections/ExamResultsDisplay'; // New Import
// Placeholder for other section components - you would create these similarly
// import SummarySection from './sections/SummarySection';
// import InitialActionsSection from './sections/InitialActionsSection';
// import RecommendedToolsSection from './sections/RecommendedToolsSection';
// import CoursePlatformsSection from './sections/CoursePlatformsSection';
// import ExploratoryPathsSection from './sections/ExploratoryPathsSection';
// import CommonMistakesSection from './sections/CommonMistakesSection';
// import AIAutomationSection from './sections/AIAutomationSection';
import SearchSuggestionDisplay from './sections/SearchSuggestionDisplay'; 

interface ContentDisplayAreaProps {
  data: GeneratedContent;
  originalUserQuery: string;
  onSetChatPrefill: (text: string) => void; 
  onStartExam: () => void; 
  examResults?: ExamResults; 
  checklistCompletion: ChecklistCompletionMap;
  onToggleChecklistCompletion: (index: number) => void;
}

// Fallback Section Component (Generic styling, similar to old ContentCard)
const GenericSectionCard: React.FC<{
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  onSetChatPrefill: (text: string) => void;
  chatPrefillText?: string;
  className?: string; // Optional className for specific styling
}> = ({ id, title, icon, children, onSetChatPrefill, chatPrefillText, className }) => {
    const handleAskAboutThis = () => {
        if (chatPrefillText) {
            onSetChatPrefill(chatPrefillText);
        } else {
            onSetChatPrefill(`¿Puedes darme más información sobre "${title}"?`);
        }
    };
    return (
        <section id={id} aria-labelledby={`${id}-title`} className={`bg-white rounded-xl shadow-lg p-5 sm:p-6 mb-6 sm:mb-8 scroll-mt-20 ${className}`}>
          <div className="flex items-center mb-4">
            <i className={`${icon} text-2xl sm:text-3xl text-blue-600 mr-3 sm:mr-4`}></i>
            <h1 id={`${id}-title`} className="text-xl sm:text-2xl font-semibold text-gray-800 flex-grow">{title}</h1>
          </div>
          <div className="prose prose-sm sm:prose-base max-w-none text-gray-700">
            {children}
          </div>
           <div className="mt-4 pt-3 border-t border-gray-200 flex justify-end">
                <button
                    onClick={handleAskAboutThis}
                    className="interactive-button-in-section text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium py-1.5 px-3 rounded-md transition-colors flex items-center"
                >
                    <i className="bi bi-chat-dots-fill mr-1.5"></i> Preguntar sobre esto
                </button>
            </div>
        </section>
    );
};


const ContentDisplayArea: React.FC<ContentDisplayAreaProps> = ({ 
    data, 
    originalUserQuery, 
    onSetChatPrefill, 
    onStartExam, 
    examResults,
    checklistCompletion,
    onToggleChecklistCompletion 
}) => {
  return (
    <div className="animate-fadeIn space-y-6 sm:space-y-8 content-display-area">
      {/* Summary Section - Example using GenericCard until SummarySection.tsx is made */}
      {data.summary && (
        <GenericSectionCard
          id="summary"
          title="Resumen Personalizado"
          icon="bi-file-earmark-text"
          onSetChatPrefill={onSetChatPrefill}
          chatPrefillText={`¿Qué significa este resumen: "${data.summary.substring(0, 50)}..."?`}
        >
          <p className="text-gray-700 leading-relaxed text-sm">{data.summary}</p>
        </GenericSectionCard>
      )}

      {/* Initial Actions Section - Example using GenericCard */}
      {data.initialActions && data.initialActions.length > 0 && (
        <GenericSectionCard
          id="initial-actions"
          title="Acciones Iniciales Concretas"
          icon="bi-play-btn-fill"
          onSetChatPrefill={onSetChatPrefill}
        >
          <div className="space-y-3">
            {data.initialActions.map((item, index) => (
              <div key={`init-action-${index}`} className="p-3 border border-gray-200 rounded-lg bg-slate-50 shadow-sm">
                <p className="text-gray-700 text-sm">{item.action}</p>
                {item.searchSuggestion && <SearchSuggestionDisplay suggestion={item.searchSuggestion} />}
              </div>
            ))}
          </div>
        </GenericSectionCard>
      )}

      {/* Exam Results Display Section (New) */}
      {examResults && (
          <ExamResultsDisplay results={examResults} onSetChatPrefill={onSetChatPrefill} />
      )}

      {/* Learning Path Section (Using its new dedicated component) */}
      {data.learningPath && (data.learningPath.criticalPath.length > 0 || data.learningPath.extendedPath.length > 0) && (
        <LearningPathSection 
            learningPath={data.learningPath} 
            onSetChatPrefill={onSetChatPrefill}
            onStartExam={onStartExam} // Pass handler to start exam
            examResults={examResults} // Pass exam results for highlighting
        />
      )}
      
      {/* Recommended Tools Section - Example using GenericCard */}
      {data.recommendedTools && data.recommendedTools.length > 0 && (
        <GenericSectionCard
          id="recommended-tools"
          title="Herramientas Gratuitas Recomendadas"
          icon="bi-tools"
          onSetChatPrefill={onSetChatPrefill}
        >
          <div className="space-y-4">
            {data.recommendedTools.map((category, catIndex) => (
              <div key={`tool-cat-${catIndex}-${category.categoryName}`}>
                <h3 className="text-md font-semibold text-gray-700 mb-2 capitalize">{category.categoryName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {category.tools.map((tool, toolIndex) => (
                    <div key={`tool-${toolIndex}-${tool.toolName}`} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-slate-50 shadow-sm">
                      <h4 className="text-sm font-semibold text-blue-700">{tool.toolName}</h4>
                      <p className="text-gray-600 text-xs my-1">{tool.description}</p>
                      {tool.searchSuggestion && <SearchSuggestionDisplay suggestion={tool.searchSuggestion} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </GenericSectionCard>
      )}

      {/* Course Platforms Section - Example using GenericCard */}
        {data.coursePlatforms && (data.coursePlatforms.highDemand.length > 0 || data.coursePlatforms.lowDemand.length > 0) && (
            <GenericSectionCard
                id="course-platforms"
                title="Plataformas de Cursos Gratuitos"
                icon="bi-collection-play-fill"
                onSetChatPrefill={onSetChatPrefill}
            >
                {data.coursePlatforms.highDemand.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center">
                            <i className="bi bi-graph-up-arrow mr-2"></i> Plataformas de Alta Demanda
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                           {data.coursePlatforms.highDemand.map((platform, index) => (
                                <div key={`hd-platform-${index}`} className="p-3 border border-gray-200 rounded-lg bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="text-sm font-semibold text-blue-700">{platform.platformName}</h4>
                                <p className="text-gray-600 text-xs my-1">{platform.specialization}</p>
                                {platform.searchSuggestions?.map(s => <SearchSuggestionDisplay key={s} suggestion={s} className="block mb-0.5"/>)}
                                {platform.freemiumTips && platform.freemiumTips.length > 0 && (
                                    <div className="mt-2 pt-1.5 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center">
                                        <i className="bi bi-lightbulb-fill text-yellow-500 mr-1.5"></i> Consejos Freemium:
                                    </p>
                                    <ul className="list-disc list-inside pl-3 space-y-0.5">
                                        {platform.freemiumTips.map((tip, tipIndex) => (
                                        <li key={`hd-tip-${index}-${tipIndex}`} className="text-xs text-gray-600">{tip}</li>
                                        ))}
                                    </ul>
                                    </div>
                                )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {data.coursePlatforms.lowDemand.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-teal-700 mb-3 flex items-center">
                            <i className="bi bi-palette-fill mr-2"></i> Plataformas de Baja Demanda
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {data.coursePlatforms.lowDemand.map((platform, index) => (
                                <div key={`ld-platform-${index}`} className="p-3 border border-gray-200 rounded-lg bg-slate-50 shadow-sm hover:shadow-md transition-shadow">
                                <h4 className="text-sm font-semibold text-blue-700">{platform.platformName}</h4>
                                <p className="text-gray-600 text-xs my-1">{platform.specialization}</p>
                                 {platform.searchSuggestions?.map(s => <SearchSuggestionDisplay key={s} suggestion={s} className="block mb-0.5"/>)}
                                {platform.freemiumTips && platform.freemiumTips.length > 0 && (
                                    <div className="mt-2 pt-1.5 border-t border-gray-100">
                                    <p className="text-xs font-semibold text-gray-500 mb-0.5 flex items-center">
                                        <i className="bi bi-lightbulb-fill text-yellow-500 mr-1.5"></i> Consejos Freemium:
                                    </p>
                                    <ul className="list-disc list-inside pl-3 space-y-0.5">
                                        {platform.freemiumTips.map((tip, tipIndex) => (
                                        <li key={`ld-tip-${index}-${tipIndex}`} className="text-xs text-gray-600">{tip}</li>
                                        ))}
                                    </ul>
                                    </div>
                                )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </GenericSectionCard>
        )}

      {/* Exploratory Paths Section - Example using GenericCard */}
      {data.exploratoryPaths && data.exploratoryPaths.length > 0 && (
        <GenericSectionCard
          id="exploratory-paths"
          title="Explorar Otros Caminos"
          icon="bi bi-arrows-angle-expand"
          onSetChatPrefill={onSetChatPrefill}
        >
          <p className="text-sm text-gray-600 mb-4">Basado en tu perfil, estas áreas complementarias podrían interesarte:</p>
          <div className="space-y-3">
            {data.exploratoryPaths.map((path, index) => (
              <div key={`expl-path-${index}-${path.area}`} className="p-3 border border-indigo-200 rounded-lg bg-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-indigo-700 text-sm">{path.area}</h4>
                <p className="text-gray-700 text-xs mt-1">{path.reason}</p>
                {path.searchSuggestion && <SearchSuggestionDisplay suggestion={path.searchSuggestion} />}
              </div>
            ))}
          </div>
        </GenericSectionCard>
      )}
      
      {/* Common Mistakes Section - Example using GenericCard */}
      {data.commonMistakes && data.commonMistakes.length > 0 && (
        <GenericSectionCard
          id="common-mistakes"
          title="Errores Comunes y Cómo Evitarlos"
          icon="bi-shield-exclamation"
          onSetChatPrefill={onSetChatPrefill}
          className="bg-red-50 border border-red-200"
        >
          <div className="space-y-3">
            {data.commonMistakes.map((item, index) => (
              <div key={`mistake-${index}`} className="p-3 border border-red-200 rounded-lg bg-white shadow-sm">
                <h4 className="font-semibold text-red-700 text-sm">{item.mistake}</h4>
                <p className="text-gray-700 text-xs mt-1">{item.avoidanceTip}</p>
                {item.searchSuggestion && <SearchSuggestionDisplay suggestion={item.searchSuggestion} />}
              </div>
            ))}
          </div>
        </GenericSectionCard>
      )}

      {/* Self-Diagnosis Checklist Section (Using its new dedicated component) */}
      {data.selfDiagnosisChecklist && data.selfDiagnosisChecklist.length > 0 && (
        <SelfDiagnosisChecklistSection 
            checklist={data.selfDiagnosisChecklist} 
            onSetChatPrefill={onSetChatPrefill}
            completion={checklistCompletion}
            onToggleComplete={onToggleChecklistCompletion}
        />
      )}

      {/* Recommended AIs Section - Example using GenericCard */}
      {data.recommendedAIsForAutomation && data.recommendedAIsForAutomation.length > 0 && (
        <GenericSectionCard
          id="recommended-ais"
          title="IA Recomendadas para Automatizar Tareas"
          icon="bi-cpu-fill"
          onSetChatPrefill={onSetChatPrefill}
        >
          <div className="space-y-3">
            {data.recommendedAIsForAutomation.map((aiTool, index) => (
              <div key={`ai-tool-${index}-${aiTool.aiName}`} className="p-3 border border-gray-200 rounded-lg bg-slate-50 hover:shadow-md transition-shadow shadow-sm">
                <h4 className="text-sm font-semibold text-blue-700">{aiTool.aiName}</h4>
                <p className="text-gray-600 text-xs my-1">{aiTool.taskDescription}</p>
                {aiTool.searchSuggestion && <SearchSuggestionDisplay suggestion={aiTool.searchSuggestion} />}
              </div>
            ))}
          </div>
        </GenericSectionCard>
      )}
    </div>
  );
};

export default ContentDisplayArea;
