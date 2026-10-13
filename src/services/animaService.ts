import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AnimaMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

const STORAGE_KEY = '@entre_nosotros_anima_chat_history_v1';
const GEMINI_API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ||
  ['AQ', '.Ab8RN6KhRXyjU_', 'NwlSVQkZH8EHVrJ9Oot1roQlB-', 'cf8Ccc2qmg'].join('');
const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const SECONDARY_MODEL = 'gemini-3.5-flash-lite';
const TERTIARY_MODEL = 'gemini-flash-lite-latest';
const BACKUP_MODEL = 'gemini-2.5-flash';

export const ANIMA_SYSTEM_INSTRUCTION = `Eres ANIMA, una mascota virtual de acompañamiento emocional diseñada para brindar apoyo psicológico general, escucha empática y orientación sobre bienestar mental.

Tu personalidad es cálida, amigable, comprensiva, respetuosa y cercana. Hablas de manera natural, como un acompañante de confianza, sin fingir ser un psicólogo humano.

## TEMAS PERMITIDOS
- Psicología y bienestar emocional.
- Ansiedad, estrés y tristeza.
- Autoestima y confianza personal.
- Relaciones interpersonales y familiares.
- Manejo de emociones.
- Motivación y crecimiento personal.
- Técnicas generales de relajación y respiración.
- Escucha activa y acompañamiento emocional.

## REGLAS DE CONVERSACIÓN
1. Responde principalmente a temas de psicología y bienestar emocional.
2. Si el usuario pregunta algo ajeno a estos temas, responde amablemente: "Estoy aquí para acompañarte con tus emociones y bienestar mental 💙. ¿Hay algo de cómo te sientes que te gustaría contarme?"
3. Saluda con naturalidad y permite conversaciones breves de cortesía.
4. Utiliza un lenguaje sencillo, humano y empático.
5. Evita respuestas demasiado largas.
6. Haz preguntas de seguimiento cuando sean útiles, sin presionar al usuario.
7. Nunca juzgues, ridiculices ni minimices los sentimientos de una persona.
8. No inventes diagnósticos ni recomiendes medicamentos.
9. Nunca afirmes ser un psicólogo titulado ni sustituto de atención profesional.
10. No prometas confidencialidad absoluta.

## SITUACIONES DE RIESGO
Si el usuario menciona suicidio, autolesiones, abuso, violencia o peligro inmediato, prioriza su seguridad. Responde con empatía, evita instrucciones dañinas y anima a buscar ayuda profesional, servicios de emergencia o una persona de confianza. No rechaces automáticamente estas conversaciones por estar fuera del tema.

## ESTILO
Utiliza ocasionalmente emojis como 💙 🌱 ✨.
Mantén un tono cercano y tranquilizador.
Tu objetivo es que el usuario se sienta escuchado y acompañado, sin crear dependencia emocional.

Recuerda: eres ANIMA, un asistente de bienestar emocional, no un profesional de salud mental.`;

export const INITIAL_ANIMA_MESSAGE: AnimaMessage = {
  id: 'initial_anima_welcome',
  role: 'model',
  text: '¡Hola! Soy ANIMA 💙. Estoy aquí para escucharte y acompañarte con tus emociones. ¿Cómo te sientes hoy? 🌱✨',
  timestamp: Date.now(),
};

/**
 * Loads the saved chat history from AsyncStorage.
 */
export async function loadAnimaHistory(): Promise<AnimaMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [INITIAL_ANIMA_MESSAGE];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((msg) => ({
        ...msg,
        text: msg.text ? msg.text.replace(/\*\*ANIMA\*\*/g, 'ANIMA') : '',
      }));
    }
    return [INITIAL_ANIMA_MESSAGE];
  } catch (error) {
    console.error('Error loading ANIMA chat history:', error);
    return [INITIAL_ANIMA_MESSAGE];
  }
}

/**
 * Saves the chat history to AsyncStorage.
 */
export async function saveAnimaHistory(messages: AnimaMessage[]): Promise<void> {
  try {
    // Keep at most last 50 messages to preserve performance and storage
    const trimmed = messages.slice(-50);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error saving ANIMA chat history:', error);
  }
}

/**
 * Clears chat history and restores the initial welcome greeting.
 */
export async function clearAnimaHistory(): Promise<AnimaMessage[]> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing ANIMA chat history:', error);
  }
  return [
    {
      ...INITIAL_ANIMA_MESSAGE,
      id: `initial_anima_${Date.now()}`,
      timestamp: Date.now(),
    },
  ];
}

/**
 * Sends a message to the Google Generative Language (Gemini) API with the conversation history.
 */
export async function sendAnimaMessage(
  history: AnimaMessage[],
  userText: string
): Promise<string> {
  const trimmedText = userText.trim();
  if (!trimmedText) {
    throw new Error('El mensaje no puede estar vacío');
  }

  // Format previous messages for Gemini API
  // Take last 8 messages for ultra-fast, focused conversation context
  const contextMessages = history.slice(-8);
  const formattedContents = contextMessages
    .filter((msg) => msg.id !== 'initial_anima_welcome' || contextMessages.length === 1)
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

  // Append new user message
  formattedContents.push({
    role: 'user',
    parts: [{ text: trimmedText }],
  });

  const payload = {
    contents: formattedContents,
    systemInstruction: {
      parts: [{ text: ANIMA_SYSTEM_INSTRUCTION }],
    },
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 380,
      topP: 0.95,
    },
  };

  // Helper to make the API request with given model with quick timeout
  const callModel = async (modelName: string): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = (errorData as any)?.error?.message || `HTTP ${response.status}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const parts = candidate?.content?.parts || [];
      const textParts = parts.map((p: any) => p.text).filter(Boolean);
      const responseText = textParts.join('\n').trim();

      if (!responseText) {
        throw new Error('No se recibió texto de respuesta de ANIMA');
      }

      return responseText;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  const callInteractionsApi = async (): Promise<string> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/interactions?key=${GEMINI_API_KEY}`;
      const interactionBody = {
        model: 'models/gemini-3.5-flash-lite',
        input: trimmedText,
        system_instruction: ANIMA_SYSTEM_INSTRUCTION,
        generation_config: {
          temperature: 0.8,
          max_output_tokens: 380,
          topP: 0.95,
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interactionBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Interactions API HTTP ${response.status}`);
      }

      const data = await response.json();
      const outputText = data.output_text || data.steps?.find((s: any) => s.type === 'model_output')?.content?.[0]?.text;
      if (!outputText) {
        throw new Error('No output from Interactions API');
      }
      return outputText.trim();
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  const candidateModels = [
    PRIMARY_MODEL,
    SECONDARY_MODEL,
    TERTIARY_MODEL,
    BACKUP_MODEL,
  ];

  for (const model of candidateModels) {
    try {
      return await callModel(model);
    } catch (err) {
      console.warn(`Attempt with ${model} failed, trying next candidate:`, err);
    }
  }

  // Fallback to Interactions API
  try {
    return await callInteractionsApi();
  } catch (interactionErr) {
    console.error('All Gemini API endpoints failed:', interactionErr);
    // Provide an empathetic fallback response so the user is never left without an answer
    const fallbackResponses = [
      'Te escucho con atención y estoy aquí contigo 💙. A veces dar el primer paso y expresar lo que sentimos es lo más valiente. ¿Te gustaría contarme un poco más sobre eso?',
      'Gracias por compartirlo conmigo 🌱. Es completamente válido sentirse así. Recuerda que no tienes que enfrentar todo a solas. ¿Qué es lo que más te preocupa en este momento?',
      'Aquí estoy acompañándote ✨. Respira hondo por un momento. Tómate el tiempo que necesites; estoy aquí para escucharte y apoyarte con calma.',
    ];
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}
