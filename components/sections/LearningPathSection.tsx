
import React, { useState, useEffect } from 'react';
import type { LearningPath, LearningPathStage, LearningPathTopic, KeyConcept, ExamResults } from '../../types';
import SearchSuggestionDisplay from './SearchSuggestionDisplay';

interface LearningPathSectionProps {
  learningPath: LearningPath;
  onSetChatPrefill: (text: string) => void;
  onStartExam: () => void; // New prop to trigger exam
  examResults?: ExamResults; // Optional prop for exam results
}

interface TopicCompletionState {
  [topicKey: string]: boolean;
}

const TopicItem: React.FC<{
  topic: LearningPathTopic;
  pathType: string;
  stageTitle: string; // Added for unique key and highlighting
  stageIndex: number;
  topicIndex: number;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onSetChatPrefill: (text: string) => void;
  highlightStatus?: 'validated' | 'reinforce' | null; // For visual cues from exam
}> = ({ topic, pathType, stageTitle, stageIndex, topicIndex, isCompleted, onToggleComplete, onSetChatPrefill, highlightStatus }) => {
  const [keyConceptsVisible, setKeyConceptsVisible] = useState(false);
  const topicId = `${pathType}-stage${stageIndex}-topic${topicIndex}`;

  let borderColor = 'border-gray-200';
  let bgColor = 'bg-white';
  let iconIndicator = null;

  if (highlightStatus === 'validated') {
    borderColor = 'border-green-400';
    bgColor = 'bg-green-50';
    iconIndicator = <i className="bi bi-check-circle-fill text-green-500 text-lg mr-2" title="Tema validado"></i>;
  } else if (highlightStatus === 'reinforce') {
    borderColor = 'border-yellow-400';
    bgColor = 'bg-yellow-50';
    iconIndicator = <i className="bi bi-exclamation-triangle-fill text-yellow-500 text-lg mr-2" title="Tema a reforzar"></i>;
  }


  return (
    <div className={`p-4 rounded-lg transition-all duration-300 ${isCompleted && !highlightStatus ? 'bg-green-50 border-green-300' : bgColor} ${borderColor} border shadow-sm hover:shadow-md topic-item-print`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
            {iconIndicator}
            <div>
                <h4 className="text-base font-semibold text-gray-800">{topic.topicName}</h4>
                <p className="text-sm text-gray-600 mt-1">{topic.details}</p>
                {topic.searchSuggestion && <SearchSuggestionDisplay suggestion={topic.searchSuggestion} className="mt-2" />}
            </div>
        </div>
        <button
            onClick={onToggleComplete}
            title={isCompleted ? "Marcar como pendiente" : "Marcar como completado"}
            className={`p-1.5 rounded-full transition-colors ${isCompleted ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'} topic-completion-button-print`}
        >
            <i className={`bi ${isCompleted ? 'bi-check-lg' : 'bi-circle'}`}></i>
        </button>
      </div>

      {topic.keyConcepts && topic.keyConcepts.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setKeyConceptsVisible(!keyConceptsVisible)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center key-concepts-toggle-print"
            aria-expanded={keyConceptsVisible}
            aria-controls={`${topicId}-keyconcepts`}
          >
            {keyConceptsVisible ? 'Ocultar' : 'Mostrar'} Conceptos Clave
            <i className={`bi ${keyConceptsVisible ? 'bi-chevron-up' : 'bi-chevron-down'} ml-1`}></i>
          </button>
          <ul 
            id={`${topicId}-keyconcepts`} 
            className={`mt-2 space-y-1.5 pl-5 list-disc text-sm text-gray-600 animate-fadeIn ${!keyConceptsVisible ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-screen opacity-100'} transition-max-height print-force-visible`}
            style={{transitionProperty: 'max-height, opacity', transitionDuration: '300ms', transitionTimingFunction: 'ease-in-out'}}
          >
            {topic.keyConcepts.map((kc, kci) => (
              <li key={`kc-${kci}`}>
                {kc.conceptName}
                {kc.searchSuggestion && <SearchSuggestionDisplay suggestion={kc.searchSuggestion} className="ml-1" />}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end interactive-button-in-section">
        <button
            onClick={() => onSetChatPrefill(`¿Puedes darme más detalles sobre "${topic.topicName}" de la etapa "${stageTitle}"?`)}
            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-1 px-3 rounded-md transition-colors flex items-center"
        >
            <i className="bi bi-chat-dots-fill mr-1.5"></i> Preguntar sobre este tema
        </button>
      </div>
    </div>
  );
};

const StageItem: React.FC<{
  stage: LearningPathStage;
  pathType: string;
  stageIndex: number;
  completedTopicsCount: number;
  totalTopicsCount: number;
  topicCompletion: TopicCompletionState;
  onToggleTopicComplete: (topicKey: string) => void;
  onSetChatPrefill: (text: string) => void;
  examResults?: ExamResults;
}> = ({ stage, pathType, stageIndex, completedTopicsCount, totalTopicsCount, topicCompletion, onToggleTopicComplete, onSetChatPrefill, examResults }) => (
  <div className="mb-8 p-3 bg-slate-100 rounded-xl shadow learning-path-stage">
    <div className="flex justify-between items-center mb-3 px-2">
        <h3 className="text-lg font-bold text-slate-700">{stage.stageTitle}</h3>
        {totalTopicsCount > 0 && (
            <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full hide-on-print">
                {completedTopicsCount} / {totalTopicsCount} completados
            </span>
        )}
    </div>
    <div className="space-y-4">
      {stage.topics.map((topic, topicIndex) => {
        const topicKey = `${pathType}-stage${stageIndex}-topic${topicIndex}`;
        let highlightStatus: 'validated' | 'reinforce' | null = null;
        if (examResults) {
            if (examResults.validatedTopics.some(vt => vt.stageTitle === stage.stageTitle && vt.topicName === topic.topicName)) {
                highlightStatus = 'validated';
            } else if (examResults.topicsToReinforce.some(rt => rt.stageTitle === stage.stageTitle && rt.topicName === topic.topicName)) {
                highlightStatus = 'reinforce';
            }
        }
        return (
          <TopicItem
            key={topicKey}
            topic={topic}
            pathType={pathType}
            stageTitle={stage.stageTitle}
            stageIndex={stageIndex}
            topicIndex={topicIndex}
            isCompleted={!!topicCompletion[topicKey]}
            onToggleComplete={() => onToggleTopicComplete(topicKey)}
            onSetChatPrefill={onSetChatPrefill}
            highlightStatus={highlightStatus}
          />
        );
      })}
    </div>
  </div>
);

const LearningPathSection: React.FC<LearningPathSectionProps> = ({ learningPath, onSetChatPrefill, onStartExam, examResults }) => {
  const [topicCompletion, setTopicCompletion] = useState<TopicCompletionState>({});

  useEffect(() => {
    // If exam results are present, automatically mark validated topics as complete
    if (examResults?.validatedTopics) {
      const newCompletions: TopicCompletionState = { ...topicCompletion };
      learningPath.criticalPath.forEach((stage, stageIdx) => {
        stage.topics.forEach((topic, topicIdx) => {
          if (examResults.validatedTopics.some(vt => vt.stageTitle === stage.stageTitle && vt.topicName === topic.topicName)) {
            newCompletions[`critical-stage${stageIdx}-topic${topicIdx}`] = true;
          }
        });
      });
      learningPath.extendedPath.forEach((stage, stageIdx) => {
        stage.topics.forEach((topic, topicIdx) => {
          if (examResults.validatedTopics.some(vt => vt.stageTitle === stage.stageTitle && vt.topicName === topic.topicName)) {
            newCompletions[`extended-stage${stageIdx}-topic${topicIdx}`] = true;
          }
        });
      });
      setTopicCompletion(newCompletions);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examResults]); // Only run when examResults change

  const handleToggleTopicComplete = (topicKey: string) => {
    setTopicCompletion(prev => ({ ...prev, [topicKey]: !prev[topicKey] }));
  };

  const calculateProgress = (stages: LearningPathStage[], pathType: string) => {
    let totalTopics = 0;
    let completedTopics = 0;
    stages.forEach((stage, stageIdx) => {
      stage.topics.forEach((_topic, topicIdx) => {
        totalTopics++;
        const topicKey = `${pathType}-stage${stageIdx}-topic${topicIdx}`;
        if (topicCompletion[topicKey]) {
          completedTopics++;
        }
      });
    });
    return { completedTopics, totalTopics, percentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0 };
  };
  
  const criticalPathProgress = calculateProgress(learningPath.criticalPath, 'critical');
  const extendedPathProgress = calculateProgress(learningPath.extendedPath, 'extended');

  const renderPath = (stages: LearningPathStage[], pathType: 'critical' | 'extended', title: string, icon: string, colorClass: string, progress: {completedTopics: number, totalTopics: number, percentage: number}) => {
    if (!stages || stages.length === 0) return null;
    return (
      <div className="mb-10">
        <div className={`flex items-center justify-between p-4 rounded-t-xl ${colorClass} text-white shadow`}>
            <div className="flex items-center">
                <i className={`${icon} text-2xl mr-3`}></i>
                <h2 className="text-xl font-semibold">{title}</h2>
            </div>
            {progress.totalTopics > 0 && (
                <div className="text-right hide-on-print">
                    <span className="font-bold">{progress.percentage}%</span>
                    <p className="text-xs opacity-80">{progress.completedTopics} de {progress.totalTopics} temas</p>
                </div>
            )}
        </div>
        {progress.totalTopics > 0 && (
             <div className="w-full bg-gray-200 rounded-b-xl h-2.5 overflow-hidden -mt-px shadow path-progress-bar-container-print">
                <div className={`${colorClass} h-2.5 rounded-b-xl transition-all duration-500 ease-out`} style={{ width: `${progress.percentage}%` }}></div>
            </div>
        )}
        <div className="pt-6">
          {stages.map((stage, stageIndex) => (
            <StageItem
              key={`${pathType}-stage-${stageIndex}`}
              stage={stage}
              pathType={pathType}
              stageIndex={stageIndex}
              completedTopicsCount={stage.topics.filter((_,ti) => !!topicCompletion[`${pathType}-stage${stageIndex}-topic${ti}`]).length}
              totalTopicsCount={stage.topics.length}
              topicCompletion={topicCompletion}
              onToggleTopicComplete={handleToggleTopicComplete}
              onSetChatPrefill={onSetChatPrefill}
              examResults={examResults}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id="learning-path" aria-labelledby="learning-path-title" className="scroll-mt-20 learning-path-section-print">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <i className="bi bi-map-fill text-3xl text-blue-600 mr-4"></i>
            <h1 id="learning-path-title" className="text-2xl sm:text-3xl font-bold text-gray-800">Tu Ruta de Aprendizaje</h1>
          </div>
          <button
            onClick={onStartExam}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out text-sm flex items-center hide-on-print"
          >
            <i className="bi bi-clipboard2-pulse-fill mr-2"></i> Haz un Examen Diagnóstico
          </button>
      </div>
      <p className="text-gray-600 mb-8 text-sm sm:text-base">
        Hemos diseñado una ruta progresiva para ti. Marca los temas a medida que los completas para seguir tu avance.
        La "Ruta Crítica" contiene lo esencial, mientras que la "Ruta Extendida" te ofrece conocimientos adicionales para explorar.
        Realiza un examen diagnóstico para validar tus conocimientos y ver qué temas necesitas reforzar.
      </p>

      {renderPath(learningPath.criticalPath, 'critical', 'Ruta Crítica (Imprescindible)', 'bi bi-flag-fill', 'bg-green-600', criticalPathProgress)}
      {renderPath(learningPath.extendedPath, 'extended', 'Ruta Extendida (Exploratoria)', 'bi bi-arrows-fullscreen', 'bg-purple-600', extendedPathProgress)}

      {!learningPath.criticalPath?.length && !learningPath.extendedPath?.length && (
        <p className="text-gray-500 text-center py-8">No se ha definido una ruta de aprendizaje para esta consulta.</p>
      )}
    </section>
  );
};

export default LearningPathSection;
