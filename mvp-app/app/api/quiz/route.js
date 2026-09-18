import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEYS = [
  process.env.GEMINI_API_KEY_1,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3
];

export async function POST(req) {
  try {
    const { contextText, existingQuestions } = await req.json();


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
        },
        ... exactly 3 objects
      ]
    `;

    let data = null;
    let lastError = null;

    for (const key of API_KEYS) {
      if (!key || key.startsWith("YOUR_")) continue;
      
      try {
        const ai = new GoogleGenerativeAI(key);
        const model = ai.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });
        
        const result = await model.generateContent(prompt);
        data = JSON.parse(result.response.text());
        break; // Success! Break out of the fallback loop
      } catch (err) {
        console.error("Quiz API Key failed:", err.message);
        lastError = err;
      }
    }

    if (!data) {
      throw new Error("All API keys failed. Last error: " + (lastError?.message || "Unknown error"));
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
