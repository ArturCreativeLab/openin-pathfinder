
import React, { useState, useEffect, useCallback } from 'react';
import type { ExamQuestion, UserExamAnswer } from '../types';

interface ExamModalProps {
  isOpen: boolean;
  questions: ExamQuestion[];
  onClose: () => void;
  onSubmit: (answers: Omit<UserExamAnswer, 'isCorrect'>[]) => void;
  isLoading: boolean;
}

const ExamModal: React.FC<ExamModalProps> = ({ isOpen, questions, onClose, onSubmit, isLoading }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // questionId -> selectedAnswer

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setUserAnswers({});
    }
  }, [isOpen]);

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitExam = () => {
    const formattedAnswers: Omit<UserExamAnswer, 'isCorrect'>[] = questions.map(q => ({
      questionId: q.id,
      selectedAnswer: userAnswers[q.id] || "", // Default to empty if not answered
      relatedStageTitle: q.relatedStageTitle,
      relatedTopicName: q.relatedTopicName,
    }));
    onSubmit(formattedAnswers);
  };

  if (!isOpen) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 animate-fadeIn" role="dialog" aria-modal="true" aria-labelledby="exam-modal-title">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all animate-slideInUp max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 id="exam-modal-title" className="text-xl sm:text-2xl font-semibold text-blue-700">
            <i className="bi bi-clipboard2-pulse-fill mr-2"></i> Examen Diagnóstico
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors p-1"
            aria-label="Cerrar examen"
            disabled={isLoading}
          >
            <i className="bi bi-x-lg text-2xl"></i>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-width duration-300" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        {/* Question Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 py-2">
          {currentQuestion && (
            <div className="mb-6">
              <p className="text-base sm:text-lg font-medium text-gray-800 mb-4">{currentQuestionIndex + 1}. {currentQuestion.questionText}</p>
              
              {currentQuestion.questionType === 'multiple-choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                      className={`w-full text-left p-3 border rounded-lg transition-all duration-150 text-sm
                                  ${userAnswers[currentQuestion.id] === option 
                                    ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400' 
                                    : 'bg-slate-50 hover:bg-slate-100 border-gray-300 hover:border-blue-400'}`}
                      disabled={isLoading}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.questionType === 'true-false' && (
                <div className="space-y-3 sm:space-y-0 sm:flex sm:space-x-4">
                  {["Verdadero", "Falso"].map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                      className={`w-full sm:w-1/2 text-center p-3 border rounded-lg transition-all duration-150 text-sm font-medium
                                  ${userAnswers[currentQuestion.id] === option 
                                    ? 'bg-blue-600 text-white border-blue-700 ring-2 ring-blue-400' 
                                    : 'bg-slate-50 hover:bg-slate-100 border-gray-300 hover:border-blue-400'}`}
                      disabled={isLoading}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Navigation & Submit */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0 || isLoading}
            className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <i className="bi bi-arrow-left mr-2"></i> Anterior
          </button>
          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleSubmitExam}
              disabled={isLoading || Object.keys(userAnswers).length !== questions.length }
              className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-semibold shadow-md hover:shadow-lg"
            >
              <i className="bi bi-check-circle-fill mr-2"></i> Finalizar Examen
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Siguiente <i className="bi bi-arrow-right ml-2"></i>
            </button>
          )}
        </div>
        {Object.keys(userAnswers).length !== questions.length && currentQuestionIndex === questions.length -1 && (
            <p className="text-xs text-red-500 text-center mt-2">Por favor, responde todas las preguntas para finalizar.</p>
        )}
      </div>
    </div>
  );
};

export default ExamModal;
