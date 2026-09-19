import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
];

const MODELS_TO_TRY = ["gemini-3.8-flash"];

export async function POST(req) {
  try {
    const { contextText, existingQuestions } = await req.json();
    const userApiKey = req.headers.get("x-user-api-key");

    const prompt = `
      You are an engaging assistant creating quizzes for students.
      Context text: "${contextText}"
      
      These questions already exist, DO NOT repeat them:
      ${JSON.stringify(existingQuestions)}
      
      Generate EXACTLY 3 NEW multiple-choice questions based on the context text.
      Return a JSON array EXACTLY like this:
      [
        {
          "question": "Question 1? (Include an emoji)",
          "options": ["Option A", "Option B", "Option C"],
          "correctAnswer": 0
        }
      ]
    `;

    let data = null;
    let lastError = null;
    const keysToTry = userApiKey ? [userApiKey] : API_KEYS;

    for (const key of keysToTry) {
      if (!key || key.startsWith("YOUR_")) continue;
      
      const ai = new GoogleGenerativeAI(key);
      
      for (const modelName of MODELS_TO_TRY) {
        try {
          const config = { model: modelName };
          if (modelName.includes("1.5")) {
            config.generationConfig = { responseMimeType: "application/json" };
          }
          
          const model = ai.getGenerativeModel(config);
          const result = await model.generateContent(prompt);
          const rawText = result.response.text();
          
          data = JSON.parse(rawText.replace(/```json\n?|```/g, '').trim());
          break; 
        } catch (err) {
          console.error(`[${modelName}] failed with key ${key.substring(0, 5)}... :`, err.message);
          lastError = err;
        }
      }
      if (data) break;
    }

    if (!data) {
      throw lastError || new Error("All API keys and models failed.");
    }

    const finalData = Array.isArray(data) ? data : (data.questions || Object.values(data)[0] || []);
    return Response.json(finalData);
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return Response.json(
      { error: `API Error: ${error.message} (Please provide your own Gemini API key below to continue)` },
      { status: 500 }
    );
  }
}
