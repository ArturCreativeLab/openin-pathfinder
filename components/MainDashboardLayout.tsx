
import React, { useRef, useState, useMemo } from 'react';
import type { GeneratedContent, ExamResults, ChecklistCompletionMap } from '../types';
import LeftNavigation from './LeftNavigation';
import ContentDisplayArea from './ContentDisplayArea';
import GlobalChat from './GlobalChat';

interface MainDashboardLayoutProps {
  data: GeneratedContent;
  error: string | null;
  originalUserQuery: string;
  onNewSearchClick: () => void;
  onSetChatPrefill: (text: string) => void; 
  chatPrefill: string; 
  clearChatPrefill: () => void;
  onStartExam: () => void; 
  examResults?: ExamResults; 
  onGenerateReport: () => void; 
  isReportGenerationPossible: boolean; 
  checklistCompletion: ChecklistCompletionMap;
  onToggleChecklistCompletion: (index: number) => void;
  onOpenAboutModal: () => void; // New prop to open AboutModal
}

interface SectionInfo {
  id: string;
  title: string;
  icon: string;
}

const MainDashboardLayout: React.FC<MainDashboardLayoutProps> = ({ 
  data, 
  error,
  originalUserQuery, 
  onNewSearchClick, 
  onSetChatPrefill,
  chatPrefill,
  clearChatPrefill,
  onStartExam, 
  examResults,
  onGenerateReport,
  isReportGenerationPossible,
  checklistCompletion,
  onToggleChecklistCompletion,
  onOpenAboutModal // Destructure new prop
}) => {
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isChatForceExpanded, setIsChatForceExpanded] = useState(false); 

  const sections = useMemo<SectionInfo[]>(() => {
    const availableSections: SectionInfo[] = [];
    if (data.summary) availableSections.push({ id: 'summary', title: 'Resumen', icon: 'bi-file-earmark-text' });
    if (data.initialActions?.length) availableSections.push({ id: 'initial-actions', title: 'Acciones Iniciales', icon: 'bi-play-btn-fill' });
    if (data.learningPath?.criticalPath?.length || data.learningPath?.extendedPath?.length) availableSections.push({ id: 'learning-path', title: 'Ruta de Aprendizaje', icon: 'bi-map-fill' });
    
    if (data.examResults) availableSections.push({ id: 'exam-results', title: 'Resultados del Examen', icon: 'bi-patch-check-fill' });

    if (data.recommendedTools?.length) availableSections.push({ id: 'recommended-tools', title: 'Herramientas', icon: 'bi-tools' });
    if (data.coursePlatforms && (data.coursePlatforms.highDemand.length > 0 || data.coursePlatforms.lowDemand.length > 0)) {
        availableSections.push({ id: 'course-platforms', title: 'Plataformas de Cursos', icon: 'bi-collection-play-fill' });
    }
    if (data.exploratoryPaths?.length) availableSections.push({ id: 'exploratory-paths', title: 'Explorar Caminos', icon: 'bi-arrows-angle-expand' });
    if (data.commonMistakes?.length) availableSections.push({ id: 'common-mistakes', title: 'Errores Comunes', icon: 'bi-shield-exclamation' });
    if (data.selfDiagnosisChecklist?.length) availableSections.push({ id: 'self-diagnosis-checklist', title: 'Checklist', icon: 'bi-check2-square' });
    if (data.recommendedAIsForAutomation?.length) availableSections.push({ id: 'recommended-ais', title: 'IA para Automatizar', icon: 'bi-cpu-fill' });
    return availableSections;
  }, [data]);

  const handleNavigate = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsNavOpen(false);
  };

  const handleSetChatPrefillAndExpand = (text: string) => {
    onSetChatPrefill(text);
    setIsChatForceExpanded(true); 
  };
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="print-only-header hidden">
        <h1>OpenIN Pathfinder</h1> 
        <p>Guía para: {originalUserQuery}</p>
        <p>Fecha: {new Date().toLocaleDateString('es-ES')}</p>
      </div>

      <header className="bg-white shadow-md p-3 sm:p-4 sticky top-0 z-30 no-print">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <button
                    onClick={() => setIsNavOpen(!isNavOpen)}
                    className="lg:hidden text-blue-600 p-2 mr-2 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label="Abrir menú de navegación"
                    aria-expanded={isNavOpen}
                    aria-controls="left-navigation-panel"
                >
                    <i className="bi bi-list text-2xl"></i>
                </button>
                <img src="https://i.imgur.com/1FMSNSQ.png" alt="OpenIN Pathfinder Logo" className="h-8 sm:h-9" />
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
                <p className="text-xs text-gray-500 hidden md:block">
                    Guía para: <span className="font-semibold text-blue-600">{originalUserQuery}</span>
                </p>
                <button
                    onClick={onGenerateReport}
                    disabled={!isReportGenerationPossible}
                    className="report-button text-xs bg-green-600 hover:bg-green-700 text-white font-medium py-1.5 px-3 rounded-md transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                    title={isReportGenerationPossible ? "Generar reporte de progreso en PDF" : "Completa el examen diagnóstico para generar el reporte"}
                >
                    <i className="bi bi-award-fill mr-1.5"></i>
                    <span className="hidden sm:inline">Generar Reporte</span>
                </button>
            </div>
        </div>
        {/* Tagline removed from header as requested */}
      </header>

      <div className="flex flex-1 overflow-hidden no-print">
        <div
            id="left-navigation-panel"
            className={`fixed inset-y-0 left-0 z-20 transform ${isNavOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-auto w-64 bg-slate-800 text-white transition-transform duration-300 ease-in-out lg:shadow-none pt-16 lg:pt-0`}
        >
             <LeftNavigation sections={sections} onNavigate={handleNavigate} />
        </div>
         {isNavOpen && <div className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden" onClick={() => setIsNavOpen(false)}></div>}

        <main ref={contentAreaRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-slate-50 scroll-smooth content-display-area">
          <ContentDisplayArea 
            data={data} 
            originalUserQuery={originalUserQuery} 
            onSetChatPrefill={handleSetChatPrefillAndExpand}
            onStartExam={onStartExam}
            examResults={examResults}
            checklistCompletion={checklistCompletion}
            onToggleChecklistCompletion={onToggleChecklistCompletion}
          />
        </main>

        <aside className="global-chat-container w-80 xl:w-96 bg-white border-l border-gray-200 hidden md:flex flex-col h-full overflow-hidden">
             <GlobalChat 
                originalUserQuery={originalUserQuery} 
                dashboardData={data}
                chatPrefill={chatPrefill}
                clearChatPrefill={clearChatPrefill}
                forceExpand={isChatForceExpanded} 
                onResetForceExpand={() => setIsChatForceExpanded(false)} 
            />
        </aside>
      </div>
      <footer className="simplified-footer no-print text-center py-3 bg-slate-100 border-t border-slate-200">
        <div className="flex items-center justify-center space-x-3">
            <button 
                onClick={onOpenAboutModal}
                className="text-xs text-slate-500 hover:text-blue-600 hover:underline"
            >
                Acerca de OpenIN Pathfinder
            </button>
            <span className="text-xs text-slate-400">|</span>
            <p className="text-xs text-slate-500">
                &copy; {new Date().getFullYear()} OpenIN Pathfinder. Potenciado por Google Gemini.
            </p>
        </div>
      </footer>
    </div>
  );
};

export default MainDashboardLayout;