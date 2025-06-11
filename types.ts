
export interface InitialAction {
  action: string;
  searchSuggestion: string;
}

export interface KeyConcept {
  conceptName: string;
  searchSuggestion: string;
}

export interface LearningPathTopic {
  topicName: string;
  details: string;
  keyConcepts?: KeyConcept[];
  searchSuggestion: string;
}

export interface LearningPathStage {
  stageTitle: string;
  topics: LearningPathTopic[];
}

export interface LearningPath {
  criticalPath: LearningPathStage[];
  extendedPath: LearningPathStage[];
}

export interface Tool {
  toolName: string;
  description: string;
  searchSuggestion: string;
}

export interface CategorizedTools {
  categoryName: string;
  tools: Tool[];
}

export interface CommonMistake {
  mistake: string;
  avoidanceTip: string;
  searchSuggestion: string;
}

export interface ChecklistPoint {
  point: string;
  searchSuggestion: string;
}

export interface AutomatedTaskAI {
  aiName: string;
  taskDescription: string;
  searchSuggestion: string;
}

export interface PlatformRecommendation {
  platformName: string;
  specialization: string;
  searchSuggestions: string[]; // Array for multiple suggestions
  freemiumTips?: string[];    // Optional array for freemium advice
}

export interface CoursePlatforms {
  highDemand: PlatformRecommendation[];
  lowDemand: PlatformRecommendation[];
}

export interface ExploratoryPathSuggestion {
  area: string;       // e.g., "UX Writing"
  reason: string;     // e.g., "Complementa tus habilidades de diseño gráfico..."
  searchSuggestion: string; // e.g., "🔎 'aprender UX Writing para diseñadores'"
}

// Exam Feature Types
export interface ExamQuestion {
  id: string;
  questionText: string;
  questionType: 'multiple-choice' | 'true-false'; // Add more types if needed
  options?: string[]; // For multiple-choice
  correctAnswer: string; // Value of the correct option or "Verdadero"/"Falso"
  relatedStageTitle: string; // To map answers back to the learning path
  relatedTopicName: string;  // To map answers back to the learning path
}

export interface UserExamAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  relatedStageTitle: string;
  relatedTopicName: string;
}

export interface ExamResults {
  scorePercentage: number;
  feedbackMessage: string; // The "consejo motivador y práctico"
  validatedTopics: Array<{ stageTitle: string; topicName: string }>;
  topicsToReinforce: Array<{ stageTitle: string; topicName: string }>;
}

// Progress Report Types
export interface PersonalizedReportActionPlan {
  recommendations: string[]; // General next steps
  examErrorTips: string[];   // Specific advice for topicsToReinforce
  studySuggestions: Array<{ resourceType: string; suggestions: string[] }>; // e.g., resourceType: "Videos", suggestions: ["Search for X", "Watch Y"]
}

export interface ReportWebsiteSuggestion {
  platformName: string;
  reasonForSuggestion: string; // e.g., "Excellent for interactive coding exercises on [topic]"
  searchSuggestion: string; // e.g., "🔎 '[platformName] [topic to reinforce] course'"
}

export interface ProgressReportData {
  actionPlan: PersonalizedReportActionPlan;
  websiteSuggestions: ReportWebsiteSuggestion[];
  finalAdvice: string; // Motivational message
}


export interface GeneratedContent {
  summary: string;
  initialActions: InitialAction[];
  learningPath: LearningPath;
  recommendedTools: CategorizedTools[];
  commonMistakes: CommonMistake[];
  selfDiagnosisChecklist: ChecklistPoint[];
  recommendedAIsForAutomation: AutomatedTaskAI[];
  coursePlatforms?: CoursePlatforms;
  exploratoryPaths?: ExploratoryPathSuggestion[];
  examResults?: ExamResults; 
}

// Raw version for parsing, all fields optional and arrays might be missing
export interface RawGeneratedContent {
  summary?: string;
  initialActions?: InitialAction[];
  learningPath?: {
    criticalPath?: LearningPathStage[];
    extendedPath?: LearningPathStage[];
  };
  recommendedTools?: CategorizedTools[];
  commonMistakes?: CommonMistake[];
  selfDiagnosisChecklist?: ChecklistPoint[];
  recommendedAIsForAutomation?: AutomatedTaskAI[];
  coursePlatforms?: CoursePlatforms;
  exploratoryPaths?: ExploratoryPathSuggestion[];
  examResults?: ExamResults;
}

export enum ExperienceLevel {
  BASIC = "básico",
  INTERMEDIATE = "intermedio",
  ADVANCED = "avanzado",
  UNSPECIFIED = "sin especificar"
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

// Map for checklist item completion status
export type ChecklistCompletionMap = Record<number, boolean>;
