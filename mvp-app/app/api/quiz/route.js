import { GoogleGenerativeAI } from "@google/generative-ai";

const MOCK_QUIZ_DATA = [
  [
    { "question": "What is the primary function of mitochondria? 🔋", "options": ["Digestion", "Energy production", "Photosynthesis"], "correctAnswer": 1 },
    { "question": "Which organelle is known as the control center? 🧠", "options": ["Nucleus", "Ribosome", "Cell Wall"], "correctAnswer": 0 },
    { "question": "What surrounds and protects a plant cell? 🧱", "options": ["Cell Membrane", "Cytoplasm", "Cell Wall"], "correctAnswer": 2 }
  ],
  [
    { "question": "Who painted the Mona Lisa? 🎨", "options": ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso"], "correctAnswer": 1 },
    { "question": "In which city is the Eiffel Tower located? 🗼", "options": ["London", "Rome", "Paris"], "correctAnswer": 2 },
    { "question": "What is the longest river in the world? 🌊", "options": ["Amazon", "Nile", "Yangtze"], "correctAnswer": 1 }
  ]
];

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
        }
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
        break; 
      } catch (err) {
        console.error("Quiz API Key failed:", err.message);
        lastError = err;
      }
    }

    if (!data) {
      throw new Error("All API keys failed. Last error: " + (lastError?.message || "Unknown error"));
    }

    const finalData = Array.isArray(data) ? data : (data.questions || Object.values(data)[0] || []);
    return Response.json(finalData);
  } catch (error) {
    console.error("Gemini API Error, running MOCK FALLBACK:", error.message);
    await new Promise(res => setTimeout(res, 3500));
    return Response.json(MOCK_QUIZ_DATA[Math.floor(Math.random() * MOCK_QUIZ_DATA.length)], {
      headers: { 'X-Is-Mock': 'true' }
    });
  }
}
