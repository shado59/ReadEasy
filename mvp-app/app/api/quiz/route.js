import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
];

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
      
      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        
        const result = await model.generateContent(prompt);
        data = JSON.parse(result.response.text());
        break; 
      } catch (err) {
        console.error("Quiz API Key failed:", err.message);
        lastError = err;
      }
    }

    if (!data) {
      throw lastError || new Error("All API keys failed.");
    }

    const finalData = Array.isArray(data) ? data : (data.questions || Object.values(data)[0] || []);
    return Response.json(finalData);
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return Response.json(
      { error: "Our AI servers are currently busy. Please try again later or provide your own Gemini API key below to continue." },
      { status: 500 }
    );
  }
}
