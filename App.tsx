
import React, { useState, useCallback, useEffect } from 'react';
import SearchModal from './components/SearchModal';
import MainDashboardLayout from './components/MainDashboardLayout';
import LoadingSpinner from './components/LoadingSpinner';
import OnboardingScreen from './components/OnboardingScreen';
import ExamModal from './components/ExamModal';
import ProgressReportPage from './components/ProgressReportPage'; 
import AboutModal from './components/AboutModal'; // New Import for About Modal
import { generateGuidance, generateExamForLearningPath, generateExamFeedback, generateProgressReportDetails } from './services/geminiService';
import type { GeneratedContent, ExamQuestion, UserExamAnswer, ExamResults, ChecklistCompletionMap, ProgressReportData } from './types';
// APP_TITLE from constants is not directly used for main header in welcome, logo is used
import './index.css';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExamLoading, setIsExamLoading] = useState<boolean>(false);
  const [isReportLoading, setIsReportLoading] = useState<boolean>(false); 
  const [results, setResults] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(true);
  const [chatPrefill, setChatPrefill] = useState<string>('');

  // Exam States
  const [isExamModalOpen, setIsExamModalOpen] = useState<boolean>(false);
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[] | null>(null);

  // Checklist State
  const [checklistCompletion, setChecklistCompletion] = useState<ChecklistCompletionMap>({});

  // Report State
  const [progressReportData, setProgressReportData] = useState<ProgressReportData | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);

  // About Modal State
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);


  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setCurrentQuery(query);
    setIsSearchModalOpen(false);
    setShowOnboarding(false);
    setChatPrefill('');
    setChecklistCompletion({}); 
    setProgressReportData(null); 
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
    setIsSearchModalOpen(true); // Or directly show the welcome screen if preferred
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

  const handleStartExam = useCallback(async () => {
    if (!results?.learningPath) {
        setError("No hay una ruta de aprendizaje definida para generar un examen.");
        return;
    }
    setIsExamLoading(true);
    setError(null);
    try {
        const questions = await generateExamForLearningPath(results.learningPath);
        setExamQuestions(questions);
        setIsExamModalOpen(true);
    } catch (e) {
        if (e instanceof Error) {
            setError(`Error al generar el examen: ${e.message}`);
        } else {
            setError("Ocurrió un error inesperado al preparar el examen.");
        }
        console.error("Exam generation error:", e);
    } finally {
        setIsExamLoading(false);
    }
  }, [results]);

  const handleExamSubmit = useCallback(async (answers: Omit<UserExamAnswer, 'isCorrect'>[]) => {
    if (!examQuestions || !results?.learningPath) return;

    setIsExamLoading(true);
    setError(null);
    setIsExamModalOpen(false);

    const processedAnswers: UserExamAnswer[] = answers.map(userAnswer => {
        const question = examQuestions.find(q => q.id === userAnswer.questionId);
        return {
            ...userAnswer,
            isCorrect: question ? userAnswer.selectedAnswer === question.correctAnswer : false,
        };
    });

    try {
        const feedbackData = await generateExamFeedback(results.learningPath, processedAnswers);
        setResults(prev => prev ? { ...prev, examResults: feedbackData } : null);
    } catch (e) {
         if (e instanceof Error) {
            setError(`Error al obtener el feedback del examen: ${e.message}`);
        } else {
            setError("Ocurrió un error inesperado al procesar los resultados del examen.");
        }
        console.error("Exam feedback error:", e);
    } finally {
        setIsExamLoading(false);
        setExamQuestions(null); 
    }
  }, [examQuestions, results]);

  const handleToggleChecklistCompletion = useCallback((index: number) => {
    setChecklistCompletion(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  }, []);

  const handleReturnToDashboardFromReport = useCallback(() => {
    setIsGeneratingReport(false);
    setProgressReportData(null); 
  }, []);

  const handleGenerateReport = useCallback(async () => {
    if (!results || !results.examResults || !results.selfDiagnosisChecklist || !results.recommendedTools) {
      setError("Se requieren resultados del examen y datos del dashboard para generar el reporte.");
      return;
    }
    setIsReportLoading(true);
    setError(null);
    try {
      const reportDetails = await generateProgressReportDetails(
        currentQuery,
        results.examResults,
        results.selfDiagnosisChecklist,
        checklistCompletion,
        results.recommendedTools
      );
      setProgressReportData(reportDetails);
      setIsGeneratingReport(true); 

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.print(); 
        });
      });

    } catch (e) {
      if (e instanceof Error) {
        setError(`Error al generar el reporte: ${e.message}`);
      } else {
        setError("Ocurrió un error inesperado al generar el reporte.");
      }
      console.error("Report generation error:", e);
    } finally {
      setIsReportLoading(false);
    }
  }, [results, currentQuery, checklistCompletion]);

  useEffect(() => {
    const handleAfterPrint = () => {
        setIsGeneratingReport(false);
        setProgressReportData(null); 
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
        window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);


  if (isGeneratingReport && progressReportData && results) {
    return (
      <ProgressReportPage
        query={currentQuery}
        reportDate={new Date()}
        generatedContent={results}
        checklistCompletion={checklistCompletion}
        progressReportAIData={progressReportData}
        onReturnToDashboard={handleReturnToDashboardFromReport}
      />
    );
  }

  if (showOnboarding && !results && !isLoading && !error) {
    return (
        <div className="onboarding-screen-container">
            <OnboardingScreen onStart={handleStartOnboarding} />
        </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 text-gray-800 antialiased">
      {!results && !isLoading && !isReportLoading && !error && !showOnboarding && (
        <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
            <header className="mb-10">
                 <img src="https://i.imgur.com/1FMSNSQ.png" alt="OpenIN Pathfinder Logo" className="h-12 sm:h-16 mx-auto mb-2" />
                {/* Tagline removed from here, will be in AboutModal */}
                <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Tu guía inteligente para rutas de aprendizaje y herramientas profesionales.
                </p>
            </header>
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                <i className="bi bi-compass text-7xl text-blue-400 mb-6"></i>
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Bienvenido de Nuevo</h2>
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
             <footer className="simplified-footer no-print text-center py-6 mt-auto bg-slate-100">
                <button 
                  onClick={() => setIsAboutModalOpen(true)}
                  className="text-xs text-slate-500 hover:text-blue-600 hover:underline mb-2"
                >
                  Acerca de OpenIN Pathfinder
                </button>
                <p className="text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} OpenIN Pathfinder. Potenciado por IA con modelos de Google Gemini.
                </p>
            </footer>
        </div>
      )}

      {(isLoading || isExamLoading || isReportLoading) && !isGeneratingReport && (
        <div className="fixed inset-0 bg-slate-100 bg-opacity-95 flex items-center justify-center z-[100]">
          <LoadingSpinner />
        </div>
      )}

      {results && !isLoading && !isExamLoading && !isReportLoading && (
        <>
          <MainDashboardLayout
            data={results}
            error={error} 
            originalUserQuery={currentQuery}
            onNewSearchClick={() => setIsSearchModalOpen(true)}
            onSetChatPrefill={handleSetChatPrefill} 
            chatPrefill={chatPrefill} 
            clearChatPrefill={clearChatPrefill}
            onStartExam={handleStartExam} 
            examResults={results.examResults}
            onGenerateReport={handleGenerateReport}
            isReportGenerationPossible={!!results.examResults} 
            checklistCompletion={checklistCompletion}
            onToggleChecklistCompletion={handleToggleChecklistCompletion}
            onOpenAboutModal={() => setIsAboutModalOpen(true)} // Pass handler
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

      {error && !isLoading && !isExamLoading && !isReportLoading && !results && !showOnboarding && (
         <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
             <div className="mt-8 p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md max-w-2xl mx-auto" role="alert">
                <div className="flex items-center">
                    <i className="bi bi-exclamation-triangle-fill text-2xl mr-3"></i>
                    <h2 className="text-xl font-semibold">Error</h2>
                </div>
                <p className="mt-2">{error}</p>
                <p className="mt-2 text-sm">Por favor, intenta reformular tu consulta o inténtalo de nuevo más tarde.</p>
                 <button
                    onClick={() => { setIsSearchModalOpen(true); setError(null);}}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <i className="bi bi-search mr-2"></i> Nueva Búsqueda
                </button>
            </div>
             <footer className="simplified-footer no-print text-center py-6 mt-auto bg-slate-100">
                 <button 
                  onClick={() => setIsAboutModalOpen(true)}
                  className="text-xs text-slate-500 hover:text-blue-600 hover:underline mb-2"
                >
                  Acerca de OpenIN Pathfinder
                </button>
                <p className="text-xs text-slate-500">
                    &copy; {new Date().getFullYear()} OpenIN Pathfinder. Potenciado por IA con modelos de Google Gemini.
                </p>
            </footer>
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

      {isExamModalOpen && examQuestions && (
        <ExamModal
            isOpen={isExamModalOpen}
            questions={examQuestions}
            onClose={() => { setIsExamModalOpen(false); setExamQuestions(null);}}
            onSubmit={handleExamSubmit}
            isLoading={isExamLoading}
        />
      )}

      {isAboutModalOpen && (
        <AboutModal 
            isOpen={isAboutModalOpen}
            onClose={() => setIsAboutModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
