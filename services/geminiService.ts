
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import type { 
    GeneratedContent, RawGeneratedContent, LearningPathStage, InitialAction, CategorizedTools, 
    Tool, CommonMistake, ChecklistPoint, AutomatedTaskAI, KeyConcept, LearningPathTopic, 
    CoursePlatforms, PlatformRecommendation, ExploratoryPathSuggestion, LearningPath,
    ExamQuestion, UserExamAnswer, ExamResults, PersonalizedReportActionPlan,
    ReportWebsiteSuggestion, ProgressReportData, ChecklistCompletionMap
} from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This alert is problematic in a non-browser environment or automated tests.
  // Consider a more robust logging or error handling strategy for production.
  // For now, it remains as per previous versions.
  alert("API_KEY is not set. Please ensure the API_KEY environment variable is configured for the application to work.");
  console.error("API_KEY is not set. Please ensure the API_KEY environment variable is configured.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY_RUNTIME" }); 

const getMainPrompt = (userInput: string): string => {
  return `
System Instruction:
Eres OpenIN Pathfinder, un asesor educativo y profesional inteligente. Tu objetivo es ayudar a los usuarios a encontrar rutas de aprendizaje personalizadas, herramientas gratuitas y orientación práctica.
El usuario proporcionará su profesión/rol y, opcionalmente, su nivel de experiencia.
Analiza esta entrada y genera:
1.  Un resumen conciso o mensaje de bienvenida para el usuario basado en su entrada.
2.  Acciones iniciales concretas que el usuario pueda realizar para empezar, cada una con una sugerencia de búsqueda.
3.  Una ruta de aprendizaje dividida en "criticalPath" (imprescindible) y "extendedPath" (exploratoria). Cada tema y concepto clave debe tener una sugerencia de búsqueda.
4.  Una lista de herramientas gratuitas y accesibles, clasificadas por función (categoryName), cada una con descripción y sugerencia de búsqueda.
5.  Errores comunes relacionados con su perfil profesional, cómo evitarlos y sugerencias de búsqueda relevantes.
6.  Un mini checklist de autodiagnóstico para verificar comprensión, con sugerencias de búsqueda para cada punto.
7.  Una lista de IA recomendadas para automatizar tareas, que sean actuales, gratuitas o freemium, y alineadas con la profesión, intereses o tareas del usuario. Para cada IA, incluye su nombre ("aiName"), la tarea que puede reemplazar o facilitar ("taskDescription"), y una sugerencia de búsqueda ("searchSuggestion").
8.  Una sección "Plataformas de cursos gratuitos" dividida en dos bloques: "highDemand" (tecnología, diseño, marketing, IA, programación, etc.) y "lowDemand" (artes, filosofía, historia, educación, oficios, etc.). Para cada plataforma, incluye: "platformName", "specialization", "searchSuggestions" (array), y opcionalmente "freemiumTips" (array).
9.  Una sección "Explorar otros caminos" ("exploratoryPaths") que sugiera 2-3 áreas de conocimiento o habilidades complementarias relevantes para el perfil del usuario. Cada sugerencia debe incluir: "area" (el nombre del área, ej: "UX Writing"), "reason" (una breve explicación de por qué es relevante, ej: "Complementa tus habilidades de diseño...") y "searchSuggestion" (una sugerencia de búsqueda para aprender sobre ello).

Formato de Salida:
Responde ESTRICTAMENTE con un objeto JSON. El objeto JSON debe seguir esta estructura y TODAS LAS CLAVES DEBEN ESTAR PRESENTES, incluso si las listas están vacías (ej. "extendedPath": []).
Asegúrate de que el JSON generado sea sintácticamente correcto. Presta especial atención a: usar comillas dobles para todas las claves y valores de cadena; usar comas correctamente entre elementos (sin comas flotantes al final de arrays u objetos); y escapar correctamente cualquier carácter especial dentro de las cadenas (como comillas dobles o saltos de línea).
{
  "summary": "string",
  "initialActions": [
    { "action": "string", "searchSuggestion": "string" }
  ],
  "learningPath": {
    "criticalPath": [
      {
        "stageTitle": "string",
        "topics": [
          {
            "topicName": "string", "details": "string",
            "keyConcepts": [{ "conceptName": "string", "searchSuggestion": "string" }],
            "searchSuggestion": "string"
          }
        ]
      }
    ],
    "extendedPath": [
      {
        "stageTitle": "string",
        "topics": [
          {
            "topicName": "string", "details": "string",
            "keyConcepts": [{ "conceptName": "string", "searchSuggestion": "string" }],
            "searchSuggestion": "string"
          }
        ]
      }
    ]
  },
  "recommendedTools": [
    {
      "categoryName": "string",
      "tools": [{ "toolName": "string", "description": "string", "searchSuggestion": "string" }]
    }
  ],
  "commonMistakes": [
    { "mistake": "string", "avoidanceTip": "string", "searchSuggestion": "string" }
  ],
  "selfDiagnosisChecklist": [
    { "point": "string", "searchSuggestion": "string" }
  ],
  "recommendedAIsForAutomation": [
    { "aiName": "string", "taskDescription": "string", "searchSuggestion": "string" }
  ],
  "coursePlatforms": {
    "highDemand": [
      { "platformName": "string", "specialization": "string", "searchSuggestions": ["string"], "freemiumTips": ["string"] }
    ],
    "lowDemand": [
      { "platformName": "string", "specialization": "string", "searchSuggestions": ["string"], "freemiumTips": ["string"] }
    ]
  },
  "exploratoryPaths": [
    { "area": "string", "reason": "string", "searchSuggestion": "string" }
  ]
}

IMPORTANTE:
- Para CADA herramienta, concepto, tema, acción inicial, error común, punto de checklist, IA de automatización, plataforma de cursos, o camino exploratorio, incluye una propiedad "searchSuggestion" o "searchSuggestions".
- El valor de "searchSuggestion(s)" DEBE empezar con el emoji "🔎 " seguido de una comilla simple, la consulta de búsqueda y otra comilla simple. Ejemplo: "🔎 'aprender sobre XYZ'".
- Todo el contenido debe ser real, gratuito, y sin enlaces directos (solo nombres y sugerencias de búsqueda).
- La ruta de aprendizaje debe ser progresiva y adaptarse al nivel de experiencia si se indica (asumir básico si no).
- Las herramientas deben ser genuinamente gratuitas o tener niveles gratuitos muy robustos. Las IA de automatización y plataformas de cursos deben ser también gratuitas o freemium.
- Mantén las descripciones concisas y directas, en español, con un tono alentador y profesional.
- Asegura que todas las claves del JSON estén presentes, usando listas vacías [] u objetos vacíos {} (como para coursePlatforms o exploratoryPaths si no hay nada que listar) donde corresponda si no hay contenido para esa clave.

Entrada del Usuario:
"${userInput}"
`;
};

export const generateGuidance = async (userInput: string): Promise<GeneratedContent> => {
  if (!API_KEY) {
    throw new Error("La API Key de Gemini no está configurada. Por favor, revisa la consola para más detalles o contacta al administrador.");
  }
  const prompt = getMainPrompt(userInput);
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as RawGeneratedContent;
    
     if (!parsedData || typeof parsedData !== 'object') {
        console.error("Respuesta de la IA inválida o no es un objeto:", parsedData);
        throw new Error("La respuesta de la IA no tiene el formato esperado. Intenta ser más específico en tu consulta.");
    }

    const validatedLearningPath = (stages?: LearningPathStage[]): LearningPathStage[] => {
        return (stages || []).map(stage => ({
            stageTitle: stage.stageTitle || "Etapa sin título",
            topics: (stage.topics || []).map((topic: LearningPathTopic) => ({
                topicName: topic.topicName || "Tema sin nombre",
                details: topic.details || "Sin detalles.",
                searchSuggestion: topic.searchSuggestion || "🔎 'buscar información adicional'",
                keyConcepts: (topic.keyConcepts || []).map((kc: KeyConcept) => ({
                    conceptName: kc.conceptName || "Concepto sin nombre",
                    searchSuggestion: kc.searchSuggestion || "🔎 'investigar concepto'"
                }))
            }))
        }));
    };

    const validatedPlatformRecommendations = (platforms?: PlatformRecommendation[]): PlatformRecommendation[] => {
        return (platforms || []).map(platform => ({
            platformName: platform.platformName || "Plataforma sin nombre",
            specialization: platform.specialization || "Especialización no especificada.",
            searchSuggestions: platform.searchSuggestions && platform.searchSuggestions.length > 0 
                ? platform.searchSuggestions.map(s => s || "🔎 'buscar cursos en plataforma'") 
                : ["🔎 'buscar cursos en plataforma'"],
            freemiumTips: (platform.freemiumTips || []).map(tip => tip || "Consultar opciones gratuitas.")
        }));
    };

    return {
        summary: parsedData.summary || "No se pudo generar un resumen.",
        initialActions: (parsedData.initialActions || []).map((action: InitialAction) => ({ 
            action: action.action || "Acción no especificada",
            searchSuggestion: action.searchSuggestion || "🔎 'buscar cómo empezar'"
        })),
        learningPath: {
            criticalPath: validatedLearningPath(parsedData.learningPath?.criticalPath),
            extendedPath: validatedLearningPath(parsedData.learningPath?.extendedPath),
        },
        recommendedTools: (parsedData.recommendedTools || []).map((category: CategorizedTools) => ({
            categoryName: category.categoryName || "Categoría General",
            tools: (category.tools || []).map((tool: Tool) => ({
                toolName: tool.toolName || "Herramienta sin nombre",
                description: tool.description || "Sin descripción.",
                searchSuggestion: tool.searchSuggestion || "🔎 'tutorial herramienta'"
            }))
        })),
        commonMistakes: (parsedData.commonMistakes || []).map((mistake: CommonMistake) => ({
            mistake: mistake.mistake || "Error no especificado",
            avoidanceTip: mistake.avoidanceTip || "Sin consejo.",
            searchSuggestion: mistake.searchSuggestion || "🔎 'cómo evitar errores comunes'"
        })),
        selfDiagnosisChecklist: (parsedData.selfDiagnosisChecklist || []).map((point: ChecklistPoint) => ({
            point: point.point || "Punto no especificado",
            searchSuggestion: point.searchSuggestion || "🔎 'verificar comprensión'"
        })),
        recommendedAIsForAutomation: (parsedData.recommendedAIsForAutomation || []).map((aiTool: AutomatedTaskAI) => ({
            aiName: aiTool.aiName || "IA sin nombre",
            taskDescription: aiTool.taskDescription || "Tarea no especificada.",
            searchSuggestion: aiTool.searchSuggestion || "🔎 'cómo usar esta IA'"
        })),
        coursePlatforms: {
            highDemand: validatedPlatformRecommendations(parsedData.coursePlatforms?.highDemand),
            lowDemand: validatedPlatformRecommendations(parsedData.coursePlatforms?.lowDemand),
        },
        exploratoryPaths: (parsedData.exploratoryPaths || []).map((path: ExploratoryPathSuggestion) => ({
            area: path.area || "Área no especificada",
            reason: path.reason || "Sin motivo especificado.",
            searchSuggestion: path.searchSuggestion || "🔎 'explorar nueva área'"
        })),
        examResults: parsedData.examResults // No specific validation here, assume it matches or is undefined
    };

  } catch (error) {
    console.error("Error al generar la guía con Gemini:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             throw new Error("La API Key de Gemini no es válida. Por favor, verifica la configuración.");
        }
         throw new Error(`Error al comunicarse con el servicio de IA: ${error.message}. Intenta de nuevo o reformula tu consulta.`);
    }
    throw new Error("Error desconocido al generar la guía. Por favor, intenta de nuevo.");
  }
};

export const generateDashboardChatAnswer = async (
  originalUserProfileQuery: string,
  fullDashboardData: GeneratedContent, 
  userQuestion: string
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("La API Key de Gemini no está configurada.");
  }

  let dashboardContextString: string;
  try {
    dashboardContextString = JSON.stringify(fullDashboardData, null, 2);
  } catch (e) {
    console.error("Could not stringify fullDashboardData for contextual prompt:", e);
    dashboardContextString = "Error: No se pudo procesar el contexto completo del dashboard.";
  }
  
  const prompt = `
System Instruction:
Eres un asistente virtual inteligente dentro de la plataforma OpenIN Pathfinder. El usuario está viendo un dashboard completo con información personalizada sobre su desarrollo profesional y educativo, y te hace una pregunta.
Tu objetivo es responder la pregunta del usuario de forma clara, concisa y útil, basándote ÚNICA Y EXCLUSIVAMENTE en la información proporcionada en "Contexto del Dashboard Completo" y, si es relevante, el "Perfil Original del Usuario".
NO inventes información, herramientas, o conceptos que no estén en el contexto del dashboard. Si la respuesta no se encuentra en el contexto proporcionado, indica amablemente que no puedes responder con la información disponible en el dashboard actual.
Si la pregunta es sobre plataformas de cursos y el usuario no especifica demanda (alta/baja), puedes mencionar plataformas de ambas categorías si son relevantes, o preguntar si tiene preferencia.
Mantén la respuesta enfocada en la pregunta y el contexto. Sé breve y directo. Evita ofrecer alternativas no solicitadas o información fuera del alcance de la pregunta y el contexto.

Perfil Original del Usuario (para referencia general de su rol o interés):
"${originalUserProfileQuery}"

Contexto del Dashboard Completo (esta es toda la información que se le ha presentado al usuario):
\`\`\`json
${dashboardContextString}
\`\`\`

Pregunta del Usuario sobre el Dashboard:
"${userQuestion}"

Tu Respuesta (concisa y basada en el contexto del dashboard):`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        temperature: 0.4, 
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error al generar respuesta de chat del dashboard con Gemini:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
      return "Error: La API Key de Gemini no es válida.";
    }
    return "Lo siento, no pude procesar tu pregunta en este momento. Por favor, intenta de nuevo.";
  }
};

export const generateExamForLearningPath = async (learningPath: LearningPath): Promise<ExamQuestion[]> => {
    if (!API_KEY) {
        throw new Error("La API Key de Gemini no está configurada.");
    }
    const learningPathContext = JSON.stringify(learningPath, null, 2);

    const prompt = `
System Instruction:
Eres un generador de exámenes para la plataforma OpenIN Pathfinder. Dado una ruta de aprendizaje ("learningPath"), tu tarea es crear un examen de diagnóstico de 10-15 preguntas.
El examen debe ayudar a evaluar la comprensión del usuario sobre los temas y conceptos clave presentados en su ruta de aprendizaje.

Reglas para generar las preguntas:
1.  **Variedad de Tipos**: Incluye una mezcla de preguntas de opción múltiple ('multiple-choice') y verdadero/falso ('true-false').
2.  **Cobertura**: Intenta cubrir diferentes "topics" y "keyConcepts" de las "stages" tanto de "criticalPath" como de "extendedPath". No es necesario cubrir todos, pero sí una muestra representativa.
3.  **Claridad**: Las preguntas deben ser claras, concisas y directas.
4.  **Relevancia**: Las preguntas deben estar directamente relacionadas con el contenido del "learningPath" proporcionado.
5.  **Prácticas (cuando sea posible)**: Intenta formular preguntas que evalúen la comprensión aplicada en lugar de la simple memorización, si el tema lo permite.
6.  **Información de Mapeo**: Para CADA pregunta, DEBES incluir "relatedStageTitle" y "relatedTopicName" que correspondan exactamente al "stageTitle" y "topicName" del "learningPath" al que se refiere la pregunta. Esto es crucial para el análisis posterior. Si una pregunta se basa en un "keyConcept", usa el "topicName" y "stageTitle" de ese concepto.
7.  **Formato de Salida Obligatorio**: Responde ESTRICTAMENTE con un array JSON de objetos "ExamQuestion". Cada objeto debe seguir esta estructura:
    {
      "id": "string", // Un ID único para la pregunta (puedes usar "q1", "q2", etc.)
      "questionText": "string", // El texto de la pregunta.
      "questionType": "'multiple-choice' | 'true-false'", // Tipo de pregunta.
      "options": ["string"], // Array de opciones para 'multiple-choice'. Omitir o usar array vacío [] para 'true-false'. Para 'true-false', las opciones implícitas son "Verdadero" y "Falso".
      "correctAnswer": "string", // El texto exacto de la opción correcta para 'multiple-choice', o "Verdadero" / "Falso" para 'true-false'.
      "relatedStageTitle": "string", // El título exacto de la etapa del learningPath.
      "relatedTopicName": "string" // El nombre exacto del tema del learningPath.
    }
    **Reglas Estrictas de Sintaxis JSON para el Array de Salida**:
    *   Todo el resultado DEBE ser un único array JSON, comenzando con \`[\` y terminando con \`]\`.
    *   Cada elemento del array es un objeto JSON (una pregunta), como se definió arriba.
    *   Los objetos dentro del array DEBEN estar separados por comas. Ejemplo: \`{...}, {...}\`.
    *   NO debe haber una coma después del último objeto en el array, justo antes del \`]\` de cierre. (NO trailing commas).
    *   Todas las claves (como "id", "questionText", etc.) y todos los valores de tipo string DEBEN estar encerrados en comillas dobles (\`"\`).
    *   Asegúrate de escapar correctamente cualquier carácter especial dentro de las cadenas (como comillas dobles o saltos de línea usando \\n si es necesario, aunque es preferible evitar saltos de línea literales en los strings del JSON).
    *   Presta especial atención a que los arrays de strings (como \`"options": ["Opción A", "Opción B"]\`) sigan las mismas reglas: strings entre comillas dobles, separados por comas, sin coma flotante al final.
    *   EJEMPLO DE SALIDA JSON VÁLIDA CON DOS PREGUNTAS:
    \`\`\`json
    [
      {
        "id": "q1",
        "questionText": "¿Cuál es el primer paso?",
        "questionType": "multiple-choice",
        "options": ["Paso A", "Paso B"],
        "correctAnswer": "Paso A",
        "relatedStageTitle": "Etapa Inicial",
        "relatedTopicName": "Primeros Pasos"
      },
      {
        "id": "q2",
        "questionText": "¿Esto es verdadero?",
        "questionType": "true-false",
        "options": [],
        "correctAnswer": "Verdadero",
        "relatedStageTitle": "Etapa de Verificación",
        "relatedTopicName": "Conceptos Booleanos"
      }
    ]
    \`\`\`

Contexto de la Ruta de Aprendizaje del Usuario:
\`\`\`json
${learningPathContext}
\`\`\`

Array JSON de Preguntas del Examen (10-15 preguntas):`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.4, 
            },
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsedQuestions = JSON.parse(jsonStr) as ExamQuestion[];
        if (!Array.isArray(parsedQuestions) || parsedQuestions.some(q => !q.id || !q.questionText || !q.questionType || !q.correctAnswer || !q.relatedStageTitle || !q.relatedTopicName)) {
            console.error("Formato de preguntas de examen inválido:", parsedQuestions);
            throw new Error("Las preguntas del examen generadas por la IA no tienen el formato esperado.");
        }
        return parsedQuestions;

    } catch (error) {
        console.error("Error al generar el examen con Gemini:", error);
        if (error instanceof Error) {
            if (error.message.includes("API key not valid")) {
                throw new Error("La API Key de Gemini no es válida. Por favor, verifica la configuración.");
            }
            // Check if the error message suggests a JSON parsing issue
            if (error.name === 'SyntaxError' || 
                (typeof error.message === 'string' && 
                 (error.message.toLowerCase().includes("json") || 
                  error.message.toLowerCase().includes("unexpected token") ||
                  error.message.toLowerCase().includes("unterminated string") ||
                  error.message.includes("Expected") // Catches "Expected ',' or ']'..."
                  )
                )
               ) {
                console.error("Original JSON parsing error details:", error); // Log original error for server-side inspection
                throw new Error(`Error al procesar la respuesta del examen de la IA (formato JSON inválido): ${error.message}. Por favor, intenta de nuevo.`);
            }
            // Fallback for other errors from Gemini or the service
            throw new Error(`Error al generar el examen con Gemini: ${error.message}. Por favor, intenta de nuevo.`);
        }
        // Fallback for non-Error objects thrown
        throw new Error("Error desconocido al generar el examen. Por favor, intenta de nuevo.");
    }
};


export const generateExamFeedback = async (learningPath: LearningPath, userAnswers: UserExamAnswer[]): Promise<ExamResults> => {
    if (!API_KEY) {
        throw new Error("La API Key de Gemini no está configurada.");
    }

    const learningPathContext = JSON.stringify(learningPath, null, 2);
    const userAnswersContext = JSON.stringify(userAnswers, null, 2);

    const prompt = `
System Instruction:
Eres un evaluador experto y consejero educativo para OpenIN Pathfinder. El usuario acaba de completar un examen de diagnóstico basado en su ruta de aprendizaje.
Tu tarea es analizar sus respuestas, identificar áreas de fortaleza y debilidad, y proporcionar un consejo motivador y práctico.

Información Disponible:
1.  **Ruta de Aprendizaje Original del Usuario ("learningPath")**: Contiene las etapas y temas que el usuario está estudiando.
2.  **Respuestas del Usuario al Examen ("userAnswers")**: Un array de objetos. Cada objeto representa una respuesta del usuario y tiene las siguientes propiedades: \`questionId\` (string), \`selectedAnswer\` (string), \`isCorrect\` (boolean), \`relatedStageTitle\` (string), y \`relatedTopicName\` (string). Estas dos últimas propiedades (\`relatedStageTitle\` y \`relatedTopicName\`) indican a qué parte de la "Ruta de Aprendizaje Original del Usuario" se refiere la pregunta.

Tareas:
1.  **Calcular Puntuación ("scorePercentage")**: Calcula el porcentaje de respuestas correctas. Para esto, cuenta cuántos objetos en el array "Respuestas del Usuario al Examen" tienen la propiedad \`isCorrect\` establecida en \`true\`. Divide este conteo por el número total de objetos en el array "Respuestas del Usuario al Examen" y multiplica por 100. Redondea el resultado a un número entero.
2.  **Identificar Temas Dominados ("validatedTopics")**: Itera sobre cada objeto (respuesta) en el array "Respuestas del Usuario al Examen". Si la propiedad \`isCorrect\` de una respuesta es \`true\`, toma los valores de las propiedades \`relatedStageTitle\` y \`relatedTopicName\` de ESA MISMA RESPUESTA. Con estos dos valores, crea un objeto de la forma \`{ "stageTitle": "valor_de_relatedStageTitle", "topicName": "valor_de_relatedTopicName" }\`. Agrega este nuevo objeto a la lista "validatedTopics". Es crucial que en la lista final "validatedTopics" no haya objetos duplicados; es decir, cada par único de \`stageTitle\` y \`topicName\` debe aparecer solo una vez, incluso si múltiples preguntas correctas se relacionan con el mismo tema/etapa.
3.  **Identificar Temas a Reforzar ("topicsToReinforce")**: De manera similar, itera sobre cada objeto (respuesta) en el array "Respuestas del Usuario al Examen". Si la propiedad \`isCorrect\` de una respuesta es \`false\`, toma los valores de las propiedades \`relatedStageTitle\` y \`relatedTopicName\` de ESA MISMA RESPUESTA. Con estos dos valores, crea un objeto de la forma \`{ "stageTitle": "valor_de_relatedStageTitle", "topicName": "valor_de_relatedTopicName" }\`. Agrega este nuevo objeto a la lista "topicsToReinforce". Nuevamente, asegúrate de que en la lista final "topicsToReinforce" no haya objetos duplicados.
4.  **Generar Consejo Personalizado ("feedbackMessage")**: Escribe un mensaje motivador y práctico. Este mensaje debe:
    *   Mencionar brevemente el desempeño general (usando el \`scorePercentage\` calculado).
    *   Destacar alguna fortaleza si es evidente (basado en los temas listados en \`validatedTopics\`).
    *   Enfocarse en las áreas clave que necesitan refuerzo (basado en los temas listados en \`topicsToReinforce\`). Para cada tema a reforzar, menciona explícitamente el \`topicName\` y su correspondiente \`stageTitle\` de la lista \`topicsToReinforce\`.
    *   Sugerir acciones concretas para mejorar en esas áreas débiles. Por ejemplo: "Para el tema '[topicName]' de la etapa '[stageTitle]', te recomiendo repasar los conceptos clave y buscar ejemplos prácticos." o "Considera realizar más ejercicios sobre '[topicName]' de la etapa '[stageTitle]' para afianzar tu comprensión." Utiliza los \`topicName\` y \`stageTitle\` específicos de la lista \`topicsToReinforce\` en tus sugerencias.
    *   Ser alentador y constructivo.

Formato de Salida Obligatorio:
Responde ESTRICTAMENTE con un objeto JSON que siga esta estructura:
{
  "scorePercentage": number, // Ejemplo: 75 (para 75%)
  "feedbackMessage": "string", // El consejo motivador y práctico.
  "validatedTopics": [ // Lista de temas dominados. Cada objeto debe tener "stageTitle" y "topicName".
    { "stageTitle": "string", "topicName": "string" } 
  ],
  "topicsToReinforce": [ // Lista de temas que necesitan refuerzo. Cada objeto debe tener "stageTitle" y "topicName".
    { "stageTitle": "string", "topicName": "string" }
  ]
}
Asegúrate de que el JSON generado sea sintácticamente correcto. Presta especial atención a: usar comillas dobles para todas las claves y valores de cadena; usar comas correctamente entre elementos (sin comas flotantes al final de arrays u objetos); y escapar correctamente cualquier carácter especial dentro de las cadenas (como comillas dobles o saltos de línea).
TODAS LAS CLAVES DEBEN ESTAR PRESENTES. Usa arrays vacíos \`[]\` si no hay temas para una categoría (por ejemplo, si todas las respuestas son correctas, "topicsToReinforce" sería \`[]\`).

Contexto de la Ruta de Aprendizaje Original:
\`\`\`json
${learningPathContext}
\`\`\`

Respuestas del Usuario al Examen:
\`\`\`json
${userAnswersContext}
\`\`\`

Objeto JSON con los Resultados del Examen y el Consejo:`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.6,
            },
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        
        const parsedFeedback = JSON.parse(jsonStr) as ExamResults;

        const isValidTopicArray = (arr: any): arr is Array<{ stageTitle: string; topicName: string }> => {
            if (!Array.isArray(arr)) return false;
            return arr.every(item =>
                typeof item === 'object' &&
                item !== null &&
                typeof item.stageTitle === 'string' &&
                typeof item.topicName === 'string'
            );
        };

        if (typeof parsedFeedback.scorePercentage !== 'number' || 
            typeof parsedFeedback.feedbackMessage !== 'string' ||
            !isValidTopicArray(parsedFeedback.validatedTopics) ||
            !isValidTopicArray(parsedFeedback.topicsToReinforce)) {
            console.error("Formato de feedback de examen inválido:", parsedFeedback);
            throw new Error("El feedback del examen generado por la IA no tiene el formato esperado.");
        }
        return parsedFeedback;

    } catch (error) {
        console.error("Error al generar el feedback del examen con Gemini:", error);
         if (error instanceof Error && error.message.includes("API key not valid")) {
             throw new Error("La API Key de Gemini no es válida. Por favor, verifica la configuración.");
        }
        throw new Error("Error al generar el feedback del examen. Por favor, intenta de nuevo.");
    }
};

export const generateProgressReportDetails = async (
    originalUserProfileQuery: string,
    examResults: ExamResults,
    fullChecklist: ChecklistPoint[],
    checklistCompletion: ChecklistCompletionMap,
    recommendedTools: CategorizedTools[]
): Promise<ProgressReportData> => {
    if (!API_KEY) {
        throw new Error("La API Key de Gemini no está configurada.");
    }

    const completedChecklistItems = fullChecklist.filter((_, index) => checklistCompletion[index]);
    const pendingChecklistItems = fullChecklist.filter((_, index) => !checklistCompletion[index]);

    const context = {
        userProfile: originalUserProfileQuery,
        examResults,
        completedChecklistItems,
        pendingChecklistItems,
        recommendedTools
    };

    const prompt = `
System Instruction:
Eres un generador de reportes de progreso para OpenIN Pathfinder. El usuario ha completado un examen diagnóstico y marcado un checklist de autoevaluación.
Tu tarea es generar un plan de acción personalizado, sugerencias de sitios web y un consejo final motivador basado en esta información.

Contexto del Usuario y su Progreso:
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

Formato de Salida Obligatorio:
Responde ESTRICTAMENTE con un objeto JSON que siga esta estructura:
{
  "actionPlan": {
    "recommendations": ["string"], // Lista de 2-3 recomendaciones generales y concretas para que el usuario avance, basadas en su perfil general y áreas de mejora.
    "examErrorTips": ["string"], // Lista de 2-3 consejos específicos basados en los "topicsToReinforce" del examen. Deben ser prácticos y ayudar a entender mejor esos temas. Si no hay temas a reforzar, puede ser una lista vacía o un mensaje genérico positivo.
    "studySuggestions": [ // Lista de 2-3 sugerencias de estudio por tipo de recurso.
      { "resourceType": "Videos y Tutoriales", "suggestions": ["string"] }, // Ejemplo: "Buscar tutoriales prácticos sobre [tema a reforzar]"
      { "resourceType": "Lecturas y Artículos", "suggestions": ["string"] }, // Ejemplo: "Leer blogs de expertos en [área de interés]"
      { "resourceType": "Proyectos Prácticos", "suggestions": ["string"] } // Ejemplo: "Iniciar un pequeño proyecto aplicando [concepto clave]"
    ]
  },
  "websiteSuggestions": [ // Lista de 2-3 plataformas/sitios web (solo nombres) relevantes para los "topicsToReinforce". Incluye una breve razón y una sugerencia de búsqueda.
    { "platformName": "string", "reasonForSuggestion": "string", "searchSuggestion": "🔎 'string'" }
  ],
  "finalAdvice": "string" // Un consejo final (1-2 frases) motivador y práctico para mantener el ritmo de aprendizaje.
}
Asegúrate de que el JSON generado sea sintácticamente correcto. Presta especial atención a: usar comillas dobles para todas las claves y valores de cadena; usar comas correctamente entre elementos (sin comas flotantes al final de arrays u objetos); y escapar correctamente cualquier carácter especial dentro de las cadenas (como comillas dobles o saltos de línea).

Consideraciones Importantes:
-   **Plan de Acción**: Las recomendaciones deben ser accionables. Los "examErrorTips" deben ser específicos a los temas que el usuario necesita reforzar (ver \`examResults.topicsToReinforce\`). Las "studySuggestions" deben proponer tipos de recursos y ejemplos de cómo usarlos.
-   **Sitios Web Sugeridos**: Deben ser nombres de plataformas conocidas y relevantes para los temas en \`examResults.topicsToReinforce\`. NO incluyas URLs, solo el nombre y una breve justificación/sugerencia de búsqueda. Asegúrate que \`searchSuggestion\` comience con "🔎 " y la consulta entre comillas simples.
-   **Consejo Final**: Debe ser alentador y ofrecer una perspectiva positiva para continuar el aprendizaje.
-   **Herramientas**: No necesitas listar las herramientas en tu respuesta, ya están en el contexto. El reporte las incluirá desde allí.
-   **Tono**: Mantén un tono profesional, alentador y práctico en español.
-   **Consistencia**: Asegúrate que todas las claves del JSON estén presentes. Usa listas vacías [] si no hay contenido específico aplicable.

Objeto JSON con los Detalles del Reporte de Progreso:`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.7,
            },
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }
        
        const parsedReportData = JSON.parse(jsonStr) as ProgressReportData;

        // Basic validation for the structure of ProgressReportData
        if (!parsedReportData.actionPlan || 
            !Array.isArray(parsedReportData.actionPlan.recommendations) ||
            !Array.isArray(parsedReportData.actionPlan.examErrorTips) ||
            !Array.isArray(parsedReportData.actionPlan.studySuggestions) ||
            !parsedReportData.actionPlan.studySuggestions.every(s => typeof s.resourceType === 'string' && Array.isArray(s.suggestions)) ||
            !Array.isArray(parsedReportData.websiteSuggestions) ||
            !parsedReportData.websiteSuggestions.every(w => typeof w.platformName === 'string' && typeof w.reasonForSuggestion === 'string' && typeof w.searchSuggestion === 'string') ||
            typeof parsedReportData.finalAdvice !== 'string') {
            console.error("Formato de detalles de reporte de progreso inválido:", parsedReportData);
            throw new Error("Los detalles del reporte de progreso generados por la IA no tienen el formato esperado.");
        }
        return parsedReportData;

    } catch (error) {
        console.error("Error al generar los detalles del reporte de progreso con Gemini:", error);
        if (error instanceof Error && error.message.includes("API key not valid")) {
             throw new Error("La API Key de Gemini no es válida. Por favor, verifica la configuración.");
        }
        throw new Error("Error al generar los detalles del reporte de progreso. Por favor, intenta de nuevo.");
    }
};
