
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateDashboardChatAnswer } from '../services/geminiService';
import type { ChatMessage, GeneratedContent } from '../types';

interface GlobalChatProps {
  originalUserQuery: string;
  dashboardData: GeneratedContent | null;
  chatPrefill?: string; // Optional: To pre-fill the chat input
  clearChatPrefill?: () => void; // Optional: Callback to clear prefill in parent
  forceExpand?: boolean; // Optional: To programmatically expand the chat
  onResetForceExpand?: () => void; // Optional: Callback to reset forceExpand state
}

const GlobalChat: React.FC<GlobalChatProps> = ({ 
    originalUserQuery, 
    dashboardData, 
    chatPrefill, 
    clearChatPrefill,
    forceExpand,
    onResetForceExpand
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatMessages]);

  useEffect(() => {
    if (forceExpand && onResetForceExpand) {
      setIsChatExpanded(true);
      onResetForceExpand(); // Reset the forceExpand trigger
    }
  }, [forceExpand, onResetForceExpand]);

  useEffect(() => {
    if (dashboardData && chatMessages.length === 0 && isChatExpanded) {
        setChatMessages([{
            id: 'initial-ai-greeting',
            sender: 'ai',
            text: "¡Hola! Soy tu asistente IA. Puedes hacerme preguntas sobre cualquier sección de tu guía personalizada.",
            timestamp: Date.now()
        }]);
    }
  }, [dashboardData, isChatExpanded]);

  useEffect(() => {
    if (isChatExpanded && inputRef.current) {
        inputRef.current.focus();
    }
  }, [isChatExpanded]);

  useEffect(() => {
    if (chatPrefill && isChatExpanded) { // Only prefill if chat is expanded
      setChatInput(chatPrefill);
      if (clearChatPrefill) {
        clearChatPrefill();
      }
      inputRef.current?.focus();
    }
  }, [chatPrefill, clearChatPrefill, isChatExpanded]);


  const handleSendChatMessage = useCallback(async () => {
    if (!chatInput.trim() || !dashboardData) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + 'user',
      sender: 'user',
      text: chatInput.trim(),
      timestamp: Date.now(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);
    setChatError(null);

    try {
      const aiResponseText = await generateDashboardChatAnswer(
        originalUserQuery,
        dashboardData,
        userMessage.text
      );
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + 'ai',
        sender: 'ai',
        text: aiResponseText,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido al contactar la IA.';
      setChatError(errorMessage);
      const aiErrorMessage: ChatMessage = {
        id: Date.now().toString() + 'ai_error',
        sender: 'ai',
        text: `Error: ${errorMessage}`,
        timestamp: Date.now(),
      };
      setChatMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, originalUserQuery, dashboardData]);

  const fabButton = (
     <button
        onClick={() => setIsChatExpanded(true)}
        className={`chat-fab fixed bottom-6 md:bottom-6 ${ dashboardData ? 'right-[calc(theme(spacing.6)_+_theme(spacing.16)_+_theme(spacing.4))] md:right-20 xl:right-24' : 'right-6 md:right-6' } 
                    bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-4 rounded-full 
                    shadow-lg hover:shadow-xl transform hover:scale-110 transition-all 
                    duration-150 ease-in-out z-40 focus:outline-none focus:ring-4 focus:ring-indigo-300`}
        aria-label="Abrir chat de asistencia"
        title="Chat de Asistencia"
    >
        <i className="bi bi-chat-quote-fill text-2xl"></i>
    </button>
  );

  if (!isChatExpanded) {
    return fabButton;
  }
  
  return (
    <div className={`
        global-chat-container
        fixed bottom-0 right-0 mb-4 mr-4 md:mb-0 md:mr-0 md:static 
        md:flex md:flex-col md:h-full 
        w-[calc(100%-2rem)] max-w-md md:w-80 xl:w-96
        bg-white border border-gray-200 shadow-xl md:shadow-lg rounded-lg md:rounded-none 
        p-3 sm:p-4 z-50 transition-transform duration-300 ease-out 
        ${isChatExpanded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}
    `}>
       <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-2">
            <h2 className="text-lg font-semibold text-blue-700 flex items-center">
                <i className="bi bi-chat-quote-fill mr-2"></i> Chat de Asistencia
            </h2>
            <button
                onClick={() => setIsChatExpanded(false)}
                className="text-gray-500 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100"
                aria-label="Minimizar chat"
            >
                <i className="bi bi-dash-lg text-xl"></i>
            </button>
       </div>

      {!dashboardData ? (
         <div className="flex-grow flex flex-col items-center justify-center text-center p-4 text-gray-500">
            <i className="bi bi-hourglass-split text-4xl mb-3 text-gray-400"></i>
            <p>El chat estará completamente funcional cuando se carguen los resultados de tu guía.</p>
        </div>
      ) : (
        <>
            <div className="flex-grow overflow-y-auto mb-2 p-1.5 bg-slate-50 rounded-md custom-scrollbar min-h-[200px] max-h-[calc(100vh-250px)] md:max-h-full">
                {chatMessages.map(msg => (
                <div
                    key={msg.id}
                    className={`mb-2.5 p-2.5 rounded-lg max-w-[90%] text-sm shadow-sm animate-fadeIn ${
                    msg.sender === 'user'
                        ? 'bg-blue-600 text-white ml-auto rounded-br-none'
                        : 'bg-gray-200 text-gray-800 mr-auto rounded-bl-none'
                    }`}
                >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <p className={`text-xs mt-1.5 ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-gray-500 text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            {chatError && <p className="text-red-500 text-xs mb-1 px-1">{chatError}</p>}
            <div className="mt-auto border-t border-gray-200 pt-2">
                <div className="flex items-center">
                <input
                    id="global-chat-input"
                    ref={inputRef}
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && !isChatLoading && handleSendChatMessage()}
                    placeholder="Pregunta sobre tu guía..."
                    className="flex-grow p-2.5 border border-gray-300 rounded-l-md focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm disabled:bg-gray-100"
                    disabled={isChatLoading || !dashboardData}
                    aria-label="Escribe tu pregunta para el asistente IA"
                />
                <button
                    onClick={handleSendChatMessage}
                    disabled={isChatLoading || !chatInput.trim() || !dashboardData}
                    className="bg-blue-600 text-white px-3 py-2.5 rounded-r-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center text-sm min-w-[80px]"
                >
                    {isChatLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                    <i className="bi bi-send-fill text-base"></i>
                    )}
                </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
};

export default GlobalChat;